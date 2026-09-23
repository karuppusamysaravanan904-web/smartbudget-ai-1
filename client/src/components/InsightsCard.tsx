import React from 'react';
import { Sparkles, AlertOctagon, AlertTriangle, TrendingUp, CheckCircle } from 'lucide-react';
import { useBudget } from '../context/BudgetContext';

export const InsightsCard: React.FC = () => {
  const { insights } = useBudget();

  if (!insights || insights.length === 0) return null;

  return (
    <div className="glass-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles size={20} color="var(--secondary)" />
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>AI Smart Insights</h3>
        </div>
        <span
          style={{
            fontSize: '0.7rem',
            padding: '0.2rem 0.5rem',
            borderRadius: '9999px',
            background: 'rgba(139, 92, 246, 0.15)',
            color: '#c084fc',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            fontWeight: 700,
          }}
        >
          LIVE DATA-AWARE
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
        {insights.map((ins) => {
          let icon = <TrendingUp size={16} color="var(--primary)" />;
          let cardBg = 'rgba(99, 102, 241, 0.08)';
          let borderCol = 'rgba(99, 102, 241, 0.25)';

          if (ins.type === 'danger') {
            icon = <AlertOctagon size={16} color="var(--status-over)" />;
            cardBg = 'var(--status-over-bg)';
            borderCol = 'var(--status-over-border)';
          } else if (ins.type === 'warning') {
            icon = <AlertTriangle size={16} color="var(--status-near)" />;
            cardBg = 'var(--status-near-bg)';
            borderCol = 'var(--status-near-border)';
          } else if (ins.type === 'success') {
            icon = <CheckCircle size={16} color="var(--status-under)" />;
            cardBg = 'var(--status-under-bg)';
            borderCol = 'var(--status-under-border)';
          }

          return (
            <div
              key={ins.id}
              style={{
                background: cardBg,
                border: `1px solid ${borderCol}`,
                borderRadius: 'var(--radius-md)',
                padding: '0.75rem 1rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
              }}
            >
              <div style={{ marginTop: '2px', flexShrink: 0 }}>{icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    {ins.title}
                  </span>
                  {ins.metric && (
                    <span
                      className="mono-num"
                      style={{ fontSize: '0.7rem', color: 'var(--text-subtle)', fontWeight: 600 }}
                    >
                      {ins.metric}
                    </span>
                  )}
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-main)', marginTop: '0.2rem', lineHeight: 1.35 }}>
                  {ins.message}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default InsightsCard;
