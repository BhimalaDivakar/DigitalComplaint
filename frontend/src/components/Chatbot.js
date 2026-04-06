import React, { useState, useRef, useEffect } from 'react';
import { chatbotMessage } from '../services/api';

const Chatbot = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([
    { type: 'bot', text: 'Hello! 👋 Welcome to Digital Complaint System. I\'m your AI assistant. How can I help you today? Ask me about submitting complaints, tracking status, categories, or anything else!' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const userMessage = input;
    setMessages(prev => [...prev, { type: 'user', text: userMessage }]);
    setInput('');
    setLoading(true);

    try {
      const res = await chatbotMessage(userMessage);

      setMessages(prev => [...prev, { type: 'bot', text: res.data.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { 
        type: 'bot', 
        text: 'Sorry! 😞 I\'m having trouble connecting. Please refresh and try again.' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 20,
      right: 20,
      width: 380,
      maxWidth: '90vw',
      height: 600,
      background: 'rgba(3, 10, 6, 0.98)',
      border: '1px solid #00ff88',
      borderRadius: '8px',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '0 0 30px rgba(0, 255, 136, 0.3)',
      zIndex: 10000,
      fontFamily: 'Rajdhani, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        padding: '14px 18px',
        borderBottom: '1px solid rgba(0, 255, 136, 0.2)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(0, 255, 136, 0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ fontSize: '20px' }}>🤖</div>
          <div>
            <div style={{ color: '#00ff88', fontSize: '13px', fontWeight: 'bold', letterSpacing: '1px' }}>
              AI ASSISTANT
            </div>
            <div style={{ color: 'var(--text3)', fontSize: '11px' }}>Always here to help</div>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: '#00ff88',
            fontSize: '18px',
            cursor: 'pointer',
            padding: '4px 8px'
          }}
        >
          ✕
        </button>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '14px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              justifyContent: msg.type === 'user' ? 'flex-end' : 'flex-start'
            }}
          >
            <div
              style={{
                maxWidth: '85%',
                padding: '10px 12px',
                borderRadius: '4px',
                background: msg.type === 'user' 
                  ? 'rgba(0, 255, 136, 0.15)' 
                  : 'rgba(0, 255, 136, 0.05)',
                border: `1px solid ${msg.type === 'user' ? 'rgba(0, 255, 136, 0.4)' : 'rgba(0, 255, 136, 0.2)'}`,
                color: msg.type === 'user' ? '#00ff88' : 'var(--text2)',
                fontSize: '12px',
                lineHeight: '1.5',
                wordBreak: 'break-word',
                whiteSpace: 'pre-wrap'
              }}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', gap: '4px', padding: '10px' }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#00ff88',
              animation: 'pulse 1.5s infinite'
            }} />
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#00ff88',
              animation: 'pulse 1.5s infinite 0.3s'
            }} />
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#00ff88',
              animation: 'pulse 1.5s infinite 0.6s'
            }} />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSend}
        style={{
          padding: '12px 14px',
          borderTop: '1px solid rgba(0, 255, 136, 0.2)',
          display: 'flex',
          gap: '8px'
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me anything..."
          disabled={loading}
          style={{
            flex: 1,
            padding: '8px 10px',
            background: 'rgba(0, 255, 136, 0.05)',
            border: '1px solid rgba(0, 255, 136, 0.2)',
            color: '#00ff88',
            borderRadius: '3px',
            fontFamily: 'Rajdhani, sans-serif',
            fontSize: '12px',
            outline: 'none'
          }}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          style={{
            padding: '8px 14px',
            background: '#00ff88',
            border: 'none',
            color: '#030a06',
            borderRadius: '3px',
            cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
            fontSize: '12px',
            letterSpacing: '1px',
            opacity: loading || !input.trim() ? 0.5 : 1
          }}
        >
          {loading ? '...' : 'SEND'}
        </button>
      </form>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default Chatbot;
