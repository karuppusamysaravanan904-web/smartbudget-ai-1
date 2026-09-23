import React, { useState } from 'react';
import { ShieldCheck, AlertTriangle, AlertCircle, CheckCircle2, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { useBudget } from '../context/BudgetContext';

export const HealthScoreCard: React.FC = () => {
  const { healthScore, summary } = useBudget();
  const [showExplanation, setShowExplanation] = useState(true);

  if (!healthScore) return null;

  const { score, tier, factors, summary: healthSummary } = healthScore;

  // Determine stroke color for circular ring
  let ringColor = '#10b981';
  let badgeClass = 'badge-under';
  if (score < 50) {
    ringColor = '#ef4444';
    badgeClass = 'badge-over';
  } else if (score < 75) {
    ringColor = '#f59e0b';
    badgeClass = 'badge-near';
  }

  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="glass-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldCheck size={20} color="var(--primary)" />
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Budget Health</h3>
        </div>
        <span className={`badge ${badgeClass}`}>{tier} Health</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.25rem' }}>
        {/* Circular Progress Gauge */}
        <div style={{ position: 'relative', width: '92px', height: '92px', flexShrink: 0 }}>
          <svg width="92" height="92" viewBox="0 0 92 92" style={{ transform: 'rotate(-90deg)' }}>
            <circle
              cx="46"
              cy="46"
              r={radius}
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="8"
              fill="transparent"
            />
            <circle
              cx="46"
              cy="46"
              r={radius}
              stroke={ringColor}
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }}
            />
          </svg>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span className="mono-num" style={{ fontSize: '1.5rem', fontWeight: 800, color: ringColor, lineHeight: 1 }}>
              {score}%
            </span>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-subtle)', fontWeight: 600, marginTop: '2px' }}>
              SCORE
            </span>
          </div>
        </div>

        {/* Executive summary description */}
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: 1.4, marginBottom: '0.5rem' }}>
            {healthSummary}
          </p>
          <button
            onClick={() => setShowExplanation(!showExplanation)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--primary)',
              fontSize: '0.8rem',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            <HelpCircle size={14} />
            <span>Why this score?</span>
            {showExplanation ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {/* Transparent Factors Breakdown */}
      {showExplanation && (
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.6)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            padding: '0.85rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.45rem',
            marginTop: 'auto',
          }}
        >
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Transparent Factor Checklist:
          </div>
          {factors.map((f: any, idx: number) => {
            const isDanger = f.type === 'danger';
            const isWarning = f.type === 'warning';
            return (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.82rem',
                  color: isDanger ? '#fca5a5' : isWarning ? '#fde68a' : '#86efac',
                }}
              >
                {isDanger ? (
                  <AlertCircle size={14} color="var(--status-over)" style={{ flexShrink: 0 }} />
                ) : isWarning ? (
                  <AlertTriangle size={14} color="var(--status-near)" style={{ flexShrink: 0 }} />
                ) : (
                  <CheckCircle2 size={14} color="var(--status-under)" style={{ flexShrink: 0 }} />
                )}
                <span style={{ flex: 1 }}>{f.text}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
export default HealthScoreCard;
