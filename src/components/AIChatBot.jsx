import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, StopCircle, Volume2, VolumeX, Square, Sparkles } from "lucide-react";

export default function AIChatBot() {
    const [messages, setMessages] = useState([
        { role: 'assistant', text: "I'm listening. What vibe are you looking for?" }
    ]);
    const [input, setInput] = useState('');
    const [status, setStatus] = useState('idle'); // idle, listening, processing, speaking
    const [voiceEnabled, setVoiceEnabled] = useState(true);
    
    const scrollRef = useRef(null);
    const recognitionRef = useRef(null);

    const API_BASE = (process.env.REACT_APP_API_BASE_URL || "https://musicapp-o3ow.onrender.com").replace(/\/$/, "");

    // --- 1. VOICE SETUP ---
    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onstart = () => setStatus('listening');
            recognitionRef.current.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setInput(transcript);
                handleSend(transcript);
            };
            recognitionRef.current.onerror = () => setStatus('idle');
            recognitionRef.current.onend = () => {
                if (status === 'listening') setStatus('idle');
            };
        }
    }, []);

    // Auto-scroll to bottom of chat
    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [messages]);

    // --- 2. HELPER: CLEAN TEXT (Removes ** and *) ---
    const cleanText = (text) => {
        if (!text) return "";
        return text.replace(/\*/g, '').trim(); 
    };

    // --- 3. HELPER: FIND NATURAL VOICE ---
    const getNaturalVoice = () => {
        const voices = window.speechSynthesis.getVoices();
        // Priority 1: Google US English (Very human-like on Chrome/Android)
        // Priority 2: Microsoft Zira (Good on Windows)
        // Priority 3: Any English US voice
        return voices.find(v => v.name.includes("Google US English")) || 
               voices.find(v => v.name.includes("Microsoft Zira")) || 
               voices.find(v => v.lang === "en-US") || 
               voices[0];
    };

    // --- 4. TEXT TO SPEECH ---
    const speak = (text) => {
        if (!window.speechSynthesis) return;
        
        window.speechSynthesis.cancel(); // Stop previous
        
        // Speak the CLEAN version (no stars)
        const clean = cleanText(text);
        const utterance = new SpeechSynthesisUtterance(clean);
        
        const voice = getNaturalVoice();
        if (voice) utterance.voice = voice;

        utterance.rate = 1.0; // Normal speed
        utterance.pitch = 1.0; // Normal pitch

        utterance.onstart = () => setStatus('speaking');
        utterance.onend = () => setStatus('idle');

        window.speechSynthesis.speak(utterance);
    };

    const stopSpeaking = () => {
        window.speechSynthesis.cancel();
        setStatus('idle');
    };

    // --- 5. SEND LOGIC ---
    const handleSend = async (manualText = null) => {
        const textToSend = manualText || input;
        if (!textToSend.trim()) return;

        // Show User Message immediately
        setMessages(prev => [...prev, { role: 'user', text: textToSend }]);
        setInput('');
        setStatus('processing');

        try {
            const res = await fetch(`${API_BASE}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: textToSend })
            });

            const data = await res.json();
            const rawReply = data.reply || "I couldn't hear the cosmos clearly.";
            
            // Clean the reply for display
            const displayReply = cleanText(rawReply);

            setMessages(prev => [...prev, { role: 'assistant', text: displayReply }]);
            
            if (voiceEnabled) speak(displayReply);
            else setStatus('idle');

        } catch (e) {
            setMessages(prev => [...prev, { role: 'assistant', text: "Connection error." }]);
            setStatus('idle');
        }
    };

    const toggleListening = () => {
        if (!recognitionRef.current) {
            alert("Voice not supported.");
            return;
        }
        if (status === 'listening') {
            recognitionRef.current.stop();
        } else {
            recognitionRef.current.start();
        }
    };

    return (
        <div className="tab-pane ai-container">
            
            {/* --- BACKGROUND ORB (Visual Only) --- */}
            <div className="siri-orb-container">
                <div className={`siri-orb ${status}`}></div>
            </div>

            {/* --- MAIN CHAT FEED --- */}
            <div className="ai-chat-feed" ref={scrollRef}>
                {messages.map((m, i) => (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column' }}>
                        <div className={`ai-msg ${m.role}`}>
                            {m.text}
                        </div>
                    </div>
                ))}
                {status === 'processing' && (
                    <div className="ai-msg assistant" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <Sparkles size={16} className="spin-slow"/> Thinking...
                    </div>
                )}
            </div>

            {/* --- STOP BUTTON (Floating) --- */}
            {status === 'speaking' && (
                <button className="stop-btn-overlay" onClick={stopSpeaking}>
                    <Square size={16} fill="white" /> Stop Speaking
                </button>
            )}

            {/* --- BOTTOM CONTROLS --- */}
            <div className="ai-controls">
                <button className="icon-btn" onClick={() => {
                    setVoiceEnabled(!voiceEnabled);
                    if (voiceEnabled) stopSpeaking();
                }}>
                    {voiceEnabled ? <Volume2 size={20} color="#00ffff" /> : <VolumeX size={20} color="#666" />}
                </button>

                <input 
                    className="glass-input" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder={status === 'listening' ? "Listening..." : "Ask the AI..."}
                    style={{ borderRadius: 30, background: 'rgba(255,255,255,0.1)' }}
                />

                {input.trim() ? (
                    <button className="icon-btn" onClick={() => handleSend()}>
                        <div style={{ background: '#00ffff', borderRadius: '50%', padding: 10 }}>
                            <Send size={20} color="#000" />
                        </div>
                    </button>
                ) : (
                    <button className="icon-btn" onClick={toggleListening}>
                        <div style={{ 
                            background: status === 'listening' ? '#ff0055' : 'rgba(255,255,255,0.1)', 
                            borderRadius: '50%', padding: 12,
                            boxShadow: status === 'listening' ? '0 0 15px #ff0055' : 'none',
                            transition: 'all 0.3s'
                        }}>
                            {status === 'listening' ? <StopCircle size={24} color="#fff"/> : <Mic size={24} color="#fff"/>}
                        </div>
                    </button>
                )}
            </div>
        </div>
    );
}
