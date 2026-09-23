import React from 'react';
import { Bot, ArrowRight, ShieldCheck, Sparkles, TrendingUp, CheckCircle, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LandingPageProps {
  onGoToApp: () => void;
  onGoToAuth: (mode: 'login' | 'register') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGoToApp, onGoToAuth }) => {
  const { user, demoLogin } = useAuth();

  const handleTryDemo = async () => {
    if (user) {
      onGoToApp();
    } else {
      await demoLogin();
      onGoToApp();
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Navigation */}
      <header
        style={{
          height: '75px',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '0 2.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(15, 23, 42, 0.7)',
          backdropFilter: 'blur(12px)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
            }}
          >
            <Bot size={24} color="#ffffff" />
          </div>
          <div>
            <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>
              SMARTBUDGET <span style={{ color: 'var(--primary)' }}>AI</span>
            </span>
            <span style={{ marginLeft: '0.5rem', fontSize: '0.7rem', padding: '0.15rem 0.45rem', borderRadius: '4px', background: 'rgba(99, 102, 241, 0.2)', color: '#c084fc', fontWeight: 700 }}>
              PS49
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {user ? (
            <button onClick={onGoToApp} className="btn btn-primary">
              Launch Dashboard
              <ArrowRight size={16} />
            </button>
          ) : (
            <>
              <button onClick={() => onGoToAuth('login')} className="btn btn-secondary btn-sm">
                Sign In
              </button>
              <button onClick={handleTryDemo} className="btn btn-primary btn-sm">
                Try Live Demo (Sep 2026)
              </button>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section
        style={{
          padding: '5rem 2rem',
          maxWidth: '1200px',
          margin: '0 auto',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.5rem',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.4rem 1rem',
            borderRadius: '9999px',
            background: 'rgba(99, 102, 241, 0.12)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            color: '#c084fc',
            fontSize: '0.85rem',
            fontWeight: 700,
          }}
        >
          <Sparkles size={16} />
          <span>The Next Evolution in Personal Budgeting</span>
        </div>

        <h1
          style={{
            fontSize: 'clamp(2.5rem, 5vw, 4.2rem)',
            fontWeight: 900,
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
            maxWidth: '900px',
          }}
        >
          Plan Better. Spend Smarter.{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, #6366f1, #a855f7, #ec4899)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Ask Your Budget.
          </span>
        </h1>

        <p
          style={{
            fontSize: '1.25rem',
            color: 'var(--text-muted)',
            maxWidth: '740px',
            lineHeight: 1.6,
          }}
        >
          Don't just track where your money went. Connect your live budgets and expenses to a
          context-aware AI financial intelligence layer that answers your spending questions,
          detects overspending, and simulates financial decisions safely.
        </p>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '1rem' }}>
          <button
            onClick={handleTryDemo}
            className="btn btn-primary"
            style={{
              padding: '0.85rem 2rem',
              fontSize: '1rem',
              borderRadius: 'var(--radius-md)',
              boxShadow: '0 8px 25px rgba(99, 102, 241, 0.4)',
            }}
          >
            <Zap size={18} />
            Explore Pre-Seeded Hackathon Demo
          </button>
          <button
            onClick={() => onGoToAuth('register')}
            className="btn btn-secondary"
            style={{ padding: '0.85rem 1.75rem', fontSize: '1rem' }}
          >
            Create Free Account
          </button>
        </div>
      </section>

      {/* Value Pillars */}
      <section
        style={{
          padding: '4rem 2rem',
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem',
        }}
      >
        <div className="glass-card">
          <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
            <TrendingUp size={22} color="var(--status-under)" />
          </div>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>1. PS49 Budget Foundation</h3>
          <p style={{ fontSize: '0.9rem', lineHeight: 1.5 }}>
            Full monthly budget allocation, category spending limits, expense logging, and live calculation of spent, remaining, and overspending statuses.
          </p>
        </div>

        <div className="glass-card">
          <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
            <Bot size={22} color="var(--primary)" />
          </div>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>2. Context-Aware BudgetAI</h3>
          <p style={{ fontSize: '0.9rem', lineHeight: 1.5 }}>
            Ask natural language questions about your actual numbers: "Can I afford dinner?", "Where am I overspending?", "How much is left for food?".
          </p>
        </div>

        <div className="glass-card">
          <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(139, 92, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
            <Sparkles size={22} color="var(--secondary)" />
          </div>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>3. What-If Decision Simulator</h3>
          <p style={{ fontSize: '0.9rem', lineHeight: 1.5 }}>
            Test hypothetical expenses before spending a single rupee. View projected overspending risks without modifying real financial records.
          </p>
        </div>

        <div className="glass-card">
          <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
            <ShieldCheck size={22} color="var(--status-near)" />
          </div>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>4. Transparent Health Score</h3>
          <p style={{ fontSize: '0.9rem', lineHeight: 1.5 }}>
            No black-box mysterious numbers. Understand precisely why your budget health is rated Good or Fair through an explainable factor checklist.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          marginTop: 'auto',
          borderTop: '1px solid var(--border-subtle)',
          padding: '2rem',
          textAlign: 'center',
          color: 'var(--text-subtle)',
          fontSize: '0.85rem',
        }}
      >
        <p>SmartBudget AI — Built for PS49 Personal Budget Planner Challenge.</p>
        <p style={{ marginTop: '0.25rem', fontSize: '0.78rem' }}>
          Educational financial planning tool. Not certified financial or investment advice.
        </p>
      </footer>
    </div>
  );
};
export default LandingPage;
