import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, X, Sparkles } from "lucide-react";

export default function AIChatBot({ onClose }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: "Hello! I'm your AI Music Guide. 🎵 Ask me anything about music, artists, or songs!" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  // ✅ Points to your Online Backend
  const API_BASE = (process.env.REACT_APP_API_BASE_URL || "https://musicapp-o3ow.onrender.com").replace(/\/$/, "");

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg })
      });

      if (!res.ok) throw new Error("Server error");
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', text: data.reply }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', text: "I'm having trouble reaching the server. Please try again later." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    // 🔴 CHANGE: Removed 'glass-modal' class to prevent CSS conflicts
    // 🟢 ADDED: opacity: 1 and visibility: visible just in case
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      width: '100vw', 
      height: '100vh', 
      zIndex: 3000, 
      
      display: 'flex', 
      flexDirection: 'column', 
      padding: 0,
      
      background: 'rgba(15, 12, 41, 0.98)', 
      backdropFilter: 'blur(10px)',
      opacity: 1,           // Ensure it's visible
      visibility: 'visible' // Ensure it's visible
    }}>
      
      {/* Header */}
      <div className="modal-header" style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ background: 'linear-gradient(135deg, #00ffff, #d86dfc)', borderRadius:'50%', padding: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <Bot size={24} color="white"/>
          </div>
          <h3 style={{ margin:0, fontSize:18, color:'white' }}>AI Music Assistant</h3>
        </div>
        
        {/* Close Button */}
        <button onClick={onClose} className="icon-btn" style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', cursor: 'pointer', padding: 10, borderRadius: '50%' }}>
            <X size={24}/>
        </button>
      </div>

      {/* Chat Area */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '20px 5%', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {messages.map((m, i) => (
          <div key={i} style={{
            alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
            maxWidth: '80%', 
            display: 'flex', flexDirection: 'column', gap: 4
          }}>
            <div style={{
                background: m.role === 'user' ? 'linear-gradient(90deg, #5eb3fd, #0077ff)' : 'rgba(255,255,255,0.1)',
                color: 'white',
                padding: '14px 20px', borderRadius: 20, fontSize: 16, lineHeight: '1.5',
                borderBottomRightRadius: m.role === 'user' ? 4 : 20,
                borderBottomLeftRadius: m.role === 'assistant' ? 4 : 20,
                boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
            }}>
              {m.text}
            </div>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', marginLeft: 5, marginRight: 5 }}>
                {m.role === 'assistant' ? 'AI Guide' : 'You'}
            </span>
          </div>
        ))}
        
        {loading && (
            <div style={{ alignSelf:'flex-start', background:'rgba(255,255,255,0.05)', padding:'10px 16px', borderRadius:20, display: 'flex', alignItems: 'center', gap: 10 }}>
                <Sparkles size={20} className="spin-slow" color="#d86dfc"/>
                <span style={{ fontSize: 14, color: '#ccc' }}>Thinking...</span>
            </div>
        )}
      </div>

      {/* Input Area */}
      <div style={{ padding: '20px', display: 'flex', gap: 10, borderTop: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', flexShrink: 0 }}>
        <input 
          className="glass-input" 
          value={input} 
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Ask about music..." 
          style={{ 
              flex: 1, padding: '15px 20px', fontSize: 16, borderRadius: 30, 
              border: '1px solid rgba(255,255,255,0.2)', 
              background: 'rgba(255,255,255,0.05)', color: 'white', outline: 'none' 
          }}
        />
        <button 
            onClick={handleSend} 
            disabled={loading}
            style={{ 
                background: input.trim() ? '#5eb3fd' : 'rgba(255,255,255,0.1)', 
                borderRadius: '50%', width: 54, height: 54, 
                display:'flex', alignItems:'center', justifyContent:'center',
                border: 'none', cursor: input.trim() ? 'pointer' : 'default',
                transition: 'all 0.2s',
                flexShrink: 0 
            }}
        >
          <Send size={24} color="white" />
        </button>
      </div>
    </div>
  );
}
