import React from 'react';
import {
  LayoutDashboard,
  Wallet,
  PieChart,
  Receipt,
  Sparkles,
  FileBarChart,
  Lightbulb,
  LogOut,
  RotateCcw,
  Bot,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
  onOpenAiChat: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  isOpen,
  onClose,
  onOpenAiChat,
}) => {
  const { user, logout, resetDemoData } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'profile', label: 'Financial Profile', icon: Wallet, badge: 'New' },
    { id: 'budgets', label: 'Monthly Budgets', icon: PieChart },
    { id: 'expenses', label: 'Expenses', icon: Receipt },
    { id: 'simulator', label: 'What-If Simulator', icon: Sparkles, badge: 'AI Tool' },
    { id: 'reports', label: 'Reports & Export', icon: FileBarChart },
    { id: 'innovation', label: 'Why SmartBudget AI?', icon: Lightbulb, highlight: true },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            zIndex: 35,
          }}
        />
      )}

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Brand Header */}
        <div
          style={{
            padding: '1.5rem',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)',
              }}
            >
              <Bot size={22} color="#ffffff" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff' }}>
                SMARTBUDGET <span style={{ color: 'var(--primary)' }}>AI</span>
              </h2>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-subtle)', fontWeight: 600 }}>PS49 PERSONAL PLANNER</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn btn-secondary btn-sm"
            style={{ display: 'none' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Links */}
        <nav style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentTab(item.id);
                  onClose();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  background: isActive ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                  color: isActive ? '#ffffff' : 'var(--text-muted)',
                  border: isActive ? '1px solid rgba(99, 102, 241, 0.35)' : '1px solid transparent',
                  cursor: 'pointer',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.9rem',
                  textAlign: 'left',
                  width: '100%',
                  transition: 'all var(--transition-fast)',
                }}
              >
                <Icon size={18} color={isActive ? 'var(--primary)' : 'currentColor'} />
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.badge && (
                  <span
                    style={{
                      fontSize: '0.65rem',
                      padding: '0.15rem 0.45rem',
                      borderRadius: '9999px',
                      background: 'rgba(139, 92, 246, 0.2)',
                      color: '#c084fc',
                      border: '1px solid rgba(139, 92, 246, 0.4)',
                      fontWeight: 700,
                    }}
                  >
                    {item.badge}
                  </span>
                )}
                {item.highlight && (
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: '#10b981',
                      boxShadow: '0 0 8px #10b981',
                    }}
                  />
                )}
              </button>
            );
          })}

          {/* Quick AI Assistant Launcher in Sidebar */}
          <div style={{ marginTop: '1rem', padding: '0.5rem 0' }}>
            <button
              onClick={() => {
                onOpenAiChat();
                onClose();
              }}
              style={{
                width: '100%',
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.2))',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.88rem',
              }}
            >
              <Bot size={18} color="var(--primary)" />
              <div style={{ textAlign: 'left', flex: 1 }}>
                <div>Ask BudgetAI</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>Context-Aware Assistant</div>
              </div>
            </button>
          </div>
        </nav>

        {/* User Profile & Demo Controls */}
        <div
          style={{
            padding: '1rem',
            borderTop: '1px solid var(--border-subtle)',
            background: 'rgba(15, 23, 42, 0.5)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  color: 'var(--primary)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                {user.name.charAt(0)}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  {user.name}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  {user.email}
                </div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={resetDemoData}
              title="Reset to Step 31 Hackathon Demo Data"
              className="btn btn-secondary btn-sm"
              style={{ flex: 1, fontSize: '0.75rem', padding: '0.4rem 0.5rem' }}
            >
              <RotateCcw size={13} />
              Reset Demo
            </button>
            <button
              onClick={logout}
              title="Log Out"
              className="btn btn-secondary btn-sm"
              style={{ padding: '0.4rem 0.65rem' }}
            >
              <LogOut size={13} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
export default Sidebar;
