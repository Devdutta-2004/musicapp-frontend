import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, X, Sparkles } from "lucide-react";

export default function AIChatBot({ onClose }) {
  // Initial message from the AI
  const [messages, setMessages] = useState([
    { role: 'assistant', text: "Hello! I'm your AI Music Guide. 🎵 Ask me anything about music, artists, or songs!" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  // GET API BASE URL (Points to your Java Backend)
  const API_BASE = (process.env.REACT_APP_API_BASE_URL || "https://musicapp-o3ow.onrender.com").replace(/\/$/, "");

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    
    // 1. Add User Message to Chat
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setLoading(true);

    try {
      // 2. Send to your Java Backend
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg })
      });

      if (!res.ok) throw new Error("Server error");

      const data = await res.json();
      
      // 3. Add AI Response to Chat
      setMessages(prev => [...prev, { role: 'assistant', text: data.reply }]);

    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { role: 'assistant', text: "I'm having trouble reaching the server. Please try again later." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-modal" style={{ 
      position: 'fixed', bottom: 90, right: 20, width: 320, height: 450, 
      zIndex: 3000, display: 'flex', flexDirection: 'column', padding: 0,
      background: 'rgba(15, 12, 41, 0.95)', 
      border: '1px solid rgba(255,255,255,0.15)',
      borderRadius: '12px',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div className="modal-header" style={{ padding: '15px', borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ background: 'linear-gradient(135deg, #00ffff, #d86dfc)', borderRadius:'50%', padding: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <Bot size={20} color="white"/>
          </div>
          <h3 style={{ margin:0, fontSize:16, color:'white' }}>AI Assistant</h3>
        </div>
        <button onClick={onClose} className="icon-btn" style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}><X size={20}/></button>
      </div>

      {/* Chat Area */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: 15, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {messages.map((m, i) => (
          <div key={i} style={{
            alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
            maxWidth: '85%',
            display: 'flex', flexDirection: 'column', gap: 4
          }}>
            <div style={{
                background: m.role === 'user' ? 'linear-gradient(90deg, #5eb3fd, #0077ff)' : 'rgba(255,255,255,0.1)',
                color: 'white',
                padding: '10px 14px', borderRadius: 16, fontSize: 14, lineHeight: '1.4',
                borderBottomRightRadius: m.role === 'user' ? 4 : 16,
                borderBottomLeftRadius: m.role === 'assistant' ? 4 : 16,
                wordWrap: 'break-word'
            }}>
              {m.text}
            </div>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                {m.role === 'assistant' ? 'AI Guide' : 'You'}
            </span>
          </div>
        ))}
        
        {loading && (
            <div style={{ alignSelf:'flex-start', background:'rgba(255,255,255,0.05)', padding:'8px 12px', borderRadius:12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Sparkles size={16} className="spin-slow" color="#d86dfc"/>
                <span style={{ fontSize: 12, color: '#ccc' }}>Thinking...</span>
            </div>
        )}
      </div>

      {/* Input Area */}
      <div style={{ padding: 12, display: 'flex', gap: 8, borderTop: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)' }}>
        <input 
          className="glass-input" 
          value={input} 
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Ask about music..." 
          style={{ 
              flex: 1, padding: '10px', fontSize: 14, borderRadius: 20, 
              border: '1px solid rgba(255,255,255,0.2)', 
              background: 'rgba(0,0,0,0.3)', color: 'white', outline: 'none' 
          }}
        />
        <button 
            onClick={handleSend} 
            disabled={loading}
            style={{ 
                background: input.trim() ? '#5eb3fd' : 'rgba(255,255,255,0.1)', 
                borderRadius: '50%', width: 42, height: 42, 
                display:'flex', alignItems:'center', justifyContent:'center',
                border: 'none', cursor: input.trim() ? 'pointer' : 'default',
                transition: 'background 0.2s'
            }}
        >
          <Send size={18} color="white" />
        </button>
      </div>
    </div>
  );
}
