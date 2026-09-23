import React from 'react';
import {
  Sparkles,
  Bot,
  HelpCircle,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  ArrowRight,
} from 'lucide-react';

export const InnovationPage: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', maxWidth: '1100px', margin: '0 auto' }}>
      {/* Title */}
      <div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#c084fc', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.5rem' }}>
          <Sparkles size={16} />
          <span>Hackathon Evaluation & Architecture Showcase</span>
        </div>
        <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>Why SmartBudget AI?</h2>
        <p style={{ fontSize: '1rem', color: 'var(--text-muted)', marginTop: '0.4rem', lineHeight: 1.6 }}>
          "An AI-powered budgeting system that combines traditional budget tracking with context-aware
          natural-language assistance, personalized insights, and what-if spending simulation."
        </p>
      </div>

      {/* Comparison: Traditional vs SmartBudget AI */}
      <div className="glass-card" style={{ padding: '2rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.25rem' }}>
          Architectural Paradigm Shift
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {/* Traditional Tracker */}
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.05)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: 'var(--radius-md)',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f87171', fontWeight: 700 }}>
              <XCircle size={20} />
              <span>Traditional Budget Tracker</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              User manually enters limits, logs receipts, and stares at static graphs. The system only tells you what
              already happened.
            </p>
            <div
              style={{
                background: 'rgba(15, 23, 42, 0.6)',
                padding: '0.75rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8rem',
                color: 'var(--text-subtle)',
              }}
            >
              <code>User → Enter Budget → Enter Expenses → View Static Charts</code>
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', color: '#fca5a5' }}>
              <li>✕ No guidance on upcoming purchasing decisions</li>
              <li>✕ User must calculate remaining amounts manually in head</li>
              <li>✕ Generic chatbots have zero idea of your real numbers</li>
            </ul>
          </div>

          {/* SmartBudget AI */}
          <div
            style={{
              background: 'rgba(99, 102, 241, 0.08)',
              border: '1px solid rgba(99, 102, 241, 0.35)',
              borderRadius: 'var(--radius-md)',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontWeight: 800 }}>
              <CheckCircle2 size={20} />
              <span>SmartBudget AI Intelligence Layer</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Combines robust budget accounting with an integrated, data-aware intelligence layer that actively answers
              your questions and simulates financial outcomes.
            </p>
            <div
              style={{
                background: 'rgba(15, 23, 42, 0.6)',
                padding: '0.75rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8rem',
                color: '#c084fc',
              }}
            >
              <code>Track → Analyze → Ask BudgetAI → Simulate Decisions → Smart Insights</code>
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', color: '#86efac' }}>
              <li>✓ Context-aware: Assistant queries your real database values</li>
              <li>✓ What-If Simulator tests expenses before spending</li>
              <li>✓ Explainable Budget Health Score with transparent factors</li>
            </ul>
          </div>
        </div>
      </div>

      {/* The 5 Key Differentiator Pillars */}
      <div>
        <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '1rem' }}>
          The 5 Pillars of Our Solution
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
          <div className="glass-card">
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
              1. Context-Aware AI
            </h4>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              BudgetAI operates on strictly scoped, user-specific data. It retrieves exact budgets, actual spent sums,
              and overspending balances for the active month before answering.
            </p>
          </div>

          <div className="glass-card">
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
              2. Natural Language Budget Queries
            </h4>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Users don't have to mental-math their balance. Asking "Can I spend ₹1,000 on dinner?" calculates
              remaining Food budget minus ₹1,000 instantly.
            </p>
          </div>

          <div className="glass-card">
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
              3. What-If Financial Simulation
            </h4>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Test hypothetical expenses and budget revisions in a secure sandbox. The system computes projected limits
              and runway changes without corrupting real data.
            </p>
          </div>

          <div className="glass-card">
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
              4. Smart Spending Insights
            </h4>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Real-time heuristic evaluation identifies category overspending, warning zones (&gt;=80%), concentration
              ratios, and positive savings buffers automatically.
            </p>
          </div>

          <div className="glass-card">
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
              5. Personalized Monthly Analysis
            </h4>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Executive monthly narratives that explain where your money went, which categories exceeded expectations,
              and specific adjustments recommended for the next month.
            </p>
          </div>

          <div className="glass-card">
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
              6. Financial Safety & Privacy
            </h4>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Clear boundaries: AI serves as an educational budgeting layer, never issuing investment claims or
              unregulated advice. Multi-tenant data isolation strictly enforced.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default InnovationPage;
