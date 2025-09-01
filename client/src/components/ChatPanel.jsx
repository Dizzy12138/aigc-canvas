import React, { useState, useEffect, useRef } from 'react';
import api from '../api';

/**
 * ChatPanel provides a simple conversational interface with an AI assistant.
 * It fetches an initial greeting from the backend and allows the user to send
 * messages. The backend currently returns placeholder responses, but can be
 * replaced with a real LLM service.
 */
export default function ChatPanel() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    async function init() {
      try {
        const res = await api.get('/ai/chat');
        setMessages(res.data.messages || []);
        setError('');
      } catch (err) {
        console.error(err);
        setError('初始化聊天失败');
      }
    }
    init();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);
    try {
      const res = await api.post('/ai/chat', { message: input });
      const reply = res.data.reply || '';
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
      setInput('');
      setError('');
    } catch (err) {
      console.error(err);
      setError('发送失败');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={{ width: '300px', display: 'flex', flexDirection: 'column' }}>
      <h3>聊天助手</h3>
      {error && <div style={{ color: 'red', marginBottom: '4px' }}>{error}</div>}
      <div
        style={{
          flexGrow: 1,
          border: '1px solid #ccc',
          padding: '8px',
          marginBottom: '8px',
          overflowY: 'auto',
          maxHeight: '600px',
        }}
      >
        {messages.map((msg, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <div key={index} style={{ marginBottom: '8px' }}>
            <strong>{msg.role === 'user' ? '你' : 'AI'}:</strong> {msg.content}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <textarea
        rows={2}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="输入消息..."
        style={{ resize: 'none', marginBottom: '8px' }}
      />
      <button type="button" onClick={handleSend} disabled={loading}>
        {loading ? '发送中…' : '发送'}
      </button>
    </div>
  );
}
