import React from 'react';
import { Menu, Bot, Sparkles, RefreshCw } from 'lucide-react';
import MonthSelector from './MonthSelector';
import { useBudget } from '../context/BudgetContext';

interface NavbarProps {
  onToggleSidebar: () => void;
  onOpenAiChat: () => void;
  pageTitle: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleSidebar,
  onOpenAiChat,
  pageTitle,
}) => {
  const { loading, refreshData } = useBudget();

  return (
    <header className="top-navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          onClick={onToggleSidebar}
          className="btn btn-secondary btn-sm"
          style={{ padding: '0.4rem 0.6rem' }}
          aria-label="Toggle Navigation"
        >
          <Menu size={18} />
        </button>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{pageTitle}</h1>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <MonthSelector />

        <button
          onClick={refreshData}
          title="Refresh Financial Data"
          className="btn btn-secondary btn-sm"
          style={{ padding: '0.45rem 0.65rem' }}
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
        </button>

        <button
          onClick={onOpenAiChat}
          className="btn btn-primary btn-sm"
          style={{
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)',
            gap: '0.45rem',
            padding: '0.45rem 0.85rem',
          }}
        >
          <Bot size={16} />
          <span>Ask BudgetAI</span>
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#10b981',
              boxShadow: '0 0 8px #10b981',
            }}
          />
        </button>
      </div>
    </header>
  );
};
export default Navbar;
