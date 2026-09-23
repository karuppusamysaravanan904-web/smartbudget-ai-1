import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, Trash2, X, User } from 'lucide-react';
import { api } from '../api/client';
import { useBudget } from '../context/BudgetContext';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isSimulation?: boolean;
  timestamp: Date;
}

interface AiChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuestion?: string | null;
  onClearInitialQuestion?: () => void;
}

export const AiChatDrawer: React.FC<AiChatDrawerProps> = ({
  isOpen,
  onClose,
  initialQuestion,
  onClearInitialQuestion,
}) => {
  const { selectedMonth } = useBudget();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hi! I'm **BudgetAI**, your personal context-aware budgeting assistant.\n\nI have access to your live **${selectedMonth}** budgets and expenses. Ask me anything about your remaining money, overspending, category limits, or test hypothetical expenses!`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [isOpen, messages]);

  const handleSend = async (questionText?: string) => {
    const q = (questionText || input).trim();
    if (!q || loading) return;

    setInput('');
    setError(null);

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: q,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await api.askBudgetAI({
        question: q,
        month: selectedMonth,
      });

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: res.answer,
        isSimulation: res.isSimulation,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      console.error('Chat error:', err);
      setError('BudgetAI is temporarily unavailable. You can still view your budget and expenses.');
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          role: 'assistant',
          content: 'BudgetAI is temporarily unavailable. You can still view your budget and expenses.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Handle triggered questions from quick prompts
  useEffect(() => {
    if (initialQuestion && isOpen) {
      handleSend(initialQuestion);
      onClearInitialQuestion?.();
    }
  }, [initialQuestion, isOpen]);

  const handleClear = () => {
    setMessages([
      {
        id: 'welcome-reset',
        role: 'assistant',
        content: `Conversation reset. I am ready with your live **${selectedMonth}** data. How can I help?`,
        timestamp: new Date(),
      },
    ]);
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 90,
        display: 'flex',
        justifyContent: 'flex-end',
        background: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          height: '100%',
          background: '#0f172a',
          borderLeft: '1px solid var(--border-highlight)',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideIn 0.25s ease-out',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border-subtle)',
            background: 'rgba(15, 23, 42, 0.95)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 10px rgba(99, 102, 241, 0.4)',
              }}
            >
              <Bot size={20} color="#ffffff" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>BudgetAI Assistant</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.72rem', color: 'var(--text-subtle)' }}>
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: '#10b981',
                  }}
                />
                <span>Context: {selectedMonth}</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={handleClear}
              className="btn btn-secondary btn-sm"
              title="Clear Conversation"
              style={{ padding: '0.4rem 0.5rem' }}
            >
              <Trash2 size={15} />
            </button>
            <button
              onClick={onClose}
              className="btn btn-secondary btn-sm"
              style={{ padding: '0.4rem 0.5rem' }}
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Message Log */}
        <div
          style={{
            flex: 1,
            padding: '1.25rem',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          {messages.map((m) => {
            const isUser = m.role === 'user';
            return (
              <div
                key={m.id}
                style={{
                  display: 'flex',
                  gap: '0.65rem',
                  alignSelf: isUser ? 'flex-end' : 'flex-start',
                  maxWidth: '88%',
                }}
              >
                {!isUser && (
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '8px',
                      background: 'rgba(99, 102, 241, 0.2)',
                      border: '1px solid rgba(99, 102, 241, 0.4)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '2px',
                    }}
                  >
                    <Bot size={16} color="var(--primary)" />
                  </div>
                )}

                <div
                  style={{
                    background: isUser ? 'var(--primary)' : 'rgba(30, 41, 59, 0.85)',
                    color: '#ffffff',
                    padding: '0.85rem 1rem',
                    borderRadius: isUser ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                    border: isUser ? 'none' : '1px solid var(--border-subtle)',
                    fontSize: '0.88rem',
                    lineHeight: 1.45,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                >
                  {m.isSimulation && (
                    <div
                      style={{
                        marginBottom: '0.5rem',
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        letterSpacing: '0.04em',
                        color: '#c084fc',
                        background: 'rgba(139, 92, 246, 0.25)',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        width: 'fit-content',
                      }}
                    >
                      SIMULATION — NOT SAVED
                    </div>
                  )}
                  {m.content}
                </div>

                {isUser && (
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '2px',
                    }}
                  >
                    <User size={16} color="#ffffff" />
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div style={{ display: 'flex', gap: '0.65rem', alignSelf: 'flex-start' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  background: 'rgba(99, 102, 241, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Bot size={16} color="var(--primary)" />
              </div>
              <div
                style={{
                  background: 'rgba(30, 41, 59, 0.85)',
                  padding: '0.75rem 1rem',
                  borderRadius: '16px 16px 16px 2px',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                <span className="dot animate-bounce" style={{ animationDelay: '0ms' }}>●</span>
                <span className="dot animate-bounce" style={{ animationDelay: '150ms' }}>●</span>
                <span className="dot animate-bounce" style={{ animationDelay: '300ms' }}>●</span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', marginLeft: '0.3rem' }}>
                  Analyzing live budget...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Question Pills */}
        <div
          style={{
            padding: '0.5rem 1rem',
            borderTop: '1px solid var(--border-subtle)',
            background: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            gap: '0.4rem',
            overflowX: 'auto',
          }}
        >
          <button
            onClick={() => handleSend('Where am I overspending?')}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem', flexShrink: 0 }}
          >
            Where am I overspending?
          </button>
          <button
            onClick={() => handleSend('How much can I still spend on food?')}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem', flexShrink: 0 }}
          >
            How much left for food?
          </button>
          <button
            onClick={() => handleSend('What happens if I spend ₹2,000 on travel?')}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem', flexShrink: 0 }}
          >
            Simulate ₹2,000 Travel
          </button>
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          style={{
            padding: '1rem',
            borderTop: '1px solid var(--border-subtle)',
            background: 'rgba(15, 23, 42, 0.95)',
            display: 'flex',
            gap: '0.65rem',
          }}
        >
          <input
            type="text"
            className="form-control"
            placeholder="Ask about spending, limits, or simulate..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            style={{ flex: 1 }}
          />
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || !input.trim()}
            style={{ padding: '0.65rem 1rem' }}
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};
export default AiChatDrawer;
