'use client';

import { Send, User, Bot, AlertCircle, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const STORAGE_KEY = 'sehatra-chat-history';

function loadMessages(): ChatMessage[] {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveMessages(messages: ChatMessage[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  } catch { /* ignore */ }
}

export default function AiChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Load chat history from localStorage on mount
  useEffect(() => {
    setMessages(loadMessages());
  }, []);

  // Save to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      saveMessages(messages);
    }
  }, [messages]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const clearChat = useCallback(() => {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input.trim()
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);
    setError(null);

    // Create placeholder for assistant response
    const assistantId = `assistant-${Date.now()}`;
    const assistantMessage: ChatMessage = {
      id: assistantId,
      role: 'assistant',
      content: ''
    };
    setMessages(prev => [...prev, assistantMessage]);

    try {
      abortRef.current = new AbortController();

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({
            role: m.role,
            content: m.content
          }))
        }),
        signal: abortRef.current.signal
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');

      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;

        // Update the assistant message with accumulated text
        setMessages(prev =>
          prev.map(m =>
            m.id === assistantId
              ? { ...m, content: fullText }
              : m
          )
        );
      }

      // If no content received at all
      if (!fullText.trim()) {
        setMessages(prev =>
          prev.map(m =>
            m.id === assistantId
              ? { ...m, content: 'Maaf, AI tidak memberikan jawaban. Silakan coba lagi.' }
              : m
          )
        );
      }

    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'Terjadi kesalahan');
        // Remove empty assistant message on error
        setMessages(prev => prev.filter(m => m.id !== assistantId || m.content));
      }
    } finally {
      setIsLoading(false);
      abortRef.current = null;
    }
  }, [input, isLoading, messages]);

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 80px)', paddingBottom: 0 }}>
      <div className="page-header" style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 className="page-title">Asisten AI Qwen</h2>
          <p className="page-subtitle">Konsultasi kesehatan cerdas dengan AI generatif</p>
        </div>
        {messages.length > 0 && (
          <button 
            className="btn" 
            onClick={clearChat}
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem' }}
          >
            <Trash2 size={16} /> Hapus Riwayat
          </button>
        )}
      </div>

      <div className="card-glass" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}>
        
        {/* Messages Area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {messages.length === 0 && (
            <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Bot size={48} style={{ margin: '0 auto 16px', color: 'var(--primary)' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: 8, color: 'var(--text-primary)' }}>Halo, Saya Sehatra AI</h3>
              <p style={{ maxWidth: 400, margin: '0 auto', fontSize: '0.9rem' }}>
                Saya didukung oleh Qwen AI. Silakan tanyakan seputar tips kesehatan, pola makan, atau keluhan ringan.
              </p>
            </div>
          )}

          {messages.map(m => (
            <div key={m.id} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', flexDirection: m.role === 'user' ? 'row-reverse' : 'row' }}>
              <div style={{ 
                width: 36, height: 36, borderRadius: 'var(--radius-brutal)', flexShrink: 0,
                background: m.role === 'user' ? 'var(--warning)' : 'var(--primary)',
                border: '2px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {m.role === 'user' ? <User size={18} color="#000" /> : <Bot size={18} color="#000" />}
              </div>
              <div 
                className={m.role === 'assistant' ? 'markdown-content' : ''}
                style={{ 
                background: m.role === 'user' ? 'var(--bg-input)' : 'var(--bg-card)',
                padding: '12px 16px', borderRadius: 'var(--radius-brutal)', border: '2px solid #000',
                maxWidth: '80%', fontSize: '0.95rem', lineHeight: 1.5,
                boxShadow: '3px 3px 0px #000', color: 'var(--text-primary)',
                whiteSpace: m.role === 'user' ? 'pre-wrap' : 'normal'
              }}>
                {m.content ? (
                  m.role === 'assistant' ? (
                    <ReactMarkdown>{m.content}</ReactMarkdown>
                  ) : (
                    m.content
                  )
                ) : (
                  isLoading && m.role === 'assistant' ? '⏳ Menganalisis...' : ''
                )}
              </div>
            </div>
          ))}

          {error && (
            <div className="error-message" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertCircle size={18} />
              {error}
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div style={{ padding: '20px', borderTop: 'var(--border-brutal)', background: 'var(--bg-dark)' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '12px' }}>
            <input
              className="input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tanya seputar kesehatan Anda..."
              style={{ flex: 1 }}
              disabled={isLoading}
            />
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={isLoading || !input.trim()}
              style={{ width: '48px', padding: 0 }}
            >
              <Send size={18} />
            </button>
          </form>
          <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 12, fontWeight: 600 }}>
            Sehatra AI dapat membuat kesalahan. Harap konsultasikan ke dokter untuk saran medis.
          </div>
        </div>

      </div>
    </div>
  );
}
