import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, X } from "lucide-react";

export default function AIChatBot({ onClose }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: "Hello! I'm your AI Music Guide. Ask me anything about songs, singers, or galaxy facts!" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setLoading(true);

    // --- MOCK RESPONSE (Connect to OpenAI/Gemini API here later) ---
    setTimeout(() => {
      let reply = "That's an interesting question about the cosmos of music!";
      if (userMsg.toLowerCase().includes('lyrics')) reply = "I can help you analyze lyrics! Which song are you thinking of?";
      if (userMsg.toLowerCase().includes('taylor')) reply = "Taylor Swift is a cosmic giant in the music industry!";
      
      setMessages(prev => [...prev, { role: 'assistant', text: reply }]);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="glass-modal" style={{ 
      position: 'fixed', bottom: 90, right: 20, width: 320, height: 450, 
      zIndex: 3000, display: 'flex', flexDirection: 'column', padding: 0 
    }}>
      {/* Header */}
      <div className="modal-header" style={{ padding: '15px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <Bot size={24} color="#00ffff"/>
          <h3 style={{ margin:0, fontSize:16 }}>AI Assistant</h3>
        </div>
        <button onClick={onClose} className="icon-btn"><X size={20}/></button>
      </div>

      {/* Chat Area */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: 15, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {messages.map((m, i) => (
          <div key={i} style={{
            alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
            background: m.role === 'user' ? 'rgba(94, 179, 253, 0.3)' : 'rgba(255,255,255,0.1)',
            padding: '8px 12px', borderRadius: 12, maxWidth: '85%', fontSize: 14,
            borderBottomRightRadius: m.role === 'user' ? 2 : 12,
            borderBottomLeftRadius: m.role === 'assistant' ? 2 : 12
          }}>
            {m.text}
          </div>
        ))}
        {loading && <div style={{ alignSelf:'flex-start', color:'#aaa', fontSize:12 }}>Thinking...</div>}
      </div>

      {/* Input */}
      <div style={{ padding: 10, display: 'flex', gap: 8, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <input 
          className="glass-input" 
          value={input} 
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Ask about music..." 
          style={{ flex: 1, padding: 8, fontSize: 14 }}
        />
        <button className="icon-btn" onClick={handleSend} disabled={loading}>
          <Send size={18} color="#00ffff" />
        </button>
      </div>
    </div>
  );
}
