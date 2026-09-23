import React from 'react';
import { MessageSquarePlus } from 'lucide-react';

interface QuickPromptsProps {
  onSelectPrompt: (promptText: string) => void;
}

export const QuickPrompts: React.FC<QuickPromptsProps> = ({ onSelectPrompt }) => {
  const prompts = [
    'Where am I overspending?',
    'How much can I still spend on food?',
    'What happens if I spend ₹2,000 on travel?',
    'Give me a summary of my spending this month.',
    'How much budget is left?',
    'Which category should I watch?',
    'Can I afford a ₹1,000 dinner?',
  ];

  return (
    <div
      style={{
        background: 'rgba(99, 102, 241, 0.05)',
        border: '1px solid rgba(99, 102, 241, 0.2)',
        borderRadius: 'var(--radius-lg)',
        padding: '1rem 1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.65rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <MessageSquarePlus size={16} color="var(--primary)" />
        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)' }}>
          Suggested Questions for BudgetAI:
        </span>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>(Click any prompt to ask live)</span>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        {prompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => onSelectPrompt(p)}
            style={{
              background: 'rgba(15, 23, 42, 0.7)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '9999px',
              padding: '0.35rem 0.85rem',
              color: 'var(--text-main)',
              fontSize: '0.8rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = 'var(--primary)';
              e.currentTarget.style.background = 'rgba(99, 102, 241, 0.15)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
              e.currentTarget.style.background = 'rgba(15, 23, 42, 0.7)';
            }}
          >
            <span>💬</span>
            <span>"{p}"</span>
          </button>
        ))}
      </div>
    </div>
  );
};
export default QuickPrompts;
