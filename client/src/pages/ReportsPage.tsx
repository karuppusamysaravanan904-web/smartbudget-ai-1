import React, { useState, useEffect } from 'react';
import { Download, Sparkles, FileText, CheckCircle2, AlertOctagon, RefreshCw } from 'lucide-react';
import { useBudget } from '../context/BudgetContext';
import { api, getAuthToken } from '../api/client';

export const ReportsPage: React.FC = () => {
  const { summary, selectedMonth } = useBudget();
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  const fetchAiExplanation = async () => {
    setLoadingAi(true);
    try {
      const res = await api.getAiExplanation(selectedMonth);
      setAiExplanation(res.explanation);
    } catch (err) {
      console.error('Failed to load AI explanation:', err);
    } finally {
      setLoadingAi(false);
    }
  };

  useEffect(() => {
    fetchAiExplanation();
  }, [selectedMonth]);

  const handleExportCsv = () => {
    const token = getAuthToken();
    const url = `/api/reports/export-csv?month=${selectedMonth}`;
    // Trigger download via fetch with auth token
    fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.blob())
      .then((blob) => {
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `smartbudget-report-${selectedMonth}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      })
      .catch((err) => console.error('CSV export failed:', err));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Top Header & Export */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Financial Statements & Reports</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-subtle)' }}>
            Official monthly statement, category utilization breakdown, and AI executive analysis for {selectedMonth}.
          </p>
        </div>

        <button onClick={handleExportCsv} className="btn btn-primary">
          <Download size={16} />
          Export to CSV
        </button>
      </div>

      {/* AI Spending Narrative (Executive Summary) */}
      <div
        className="glass-card"
        style={{
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.7))',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                background: 'rgba(99, 102, 241, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sparkles size={18} color="var(--primary)" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>AI Executive Spending Summary</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
                Synthesized directly from your live database numbers
              </p>
            </div>
          </div>

          <button
            onClick={fetchAiExplanation}
            disabled={loadingAi}
            className="btn btn-secondary btn-sm"
          >
            <RefreshCw size={14} className={loadingAi ? 'animate-spin' : ''} />
            Regenerate
          </button>
        </div>

        <div
          style={{
            background: 'rgba(15, 23, 42, 0.6)',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.9rem',
            lineHeight: 1.6,
            color: 'var(--text-main)',
            whiteSpace: 'pre-wrap',
          }}
        >
          {loadingAi ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-subtle)' }}>
              <RefreshCw size={16} className="animate-spin" />
              Generating comprehensive monthly report...
            </div>
          ) : (
            aiExplanation || 'No summary available.'
          )}
        </div>
      </div>

      {/* Monthly Category Utilization Table */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Category Utilization Breakdown</h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-subtle)' }}>
            Official metrics for {selectedMonth}
          </p>
        </div>

        <div className="data-table-container" style={{ border: 'none' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Allocated Budget</th>
                <th>Actual Spending</th>
                <th>Remaining / Deficit</th>
                <th>Utilization</th>
                <th>Status</th>
                <th>Transactions</th>
              </tr>
            </thead>
            <tbody>
              {(summary?.categories || []).map((cat) => {
                let badgeClass = 'badge-under';
                if (cat.status === 'OVER BUDGET') badgeClass = 'badge-over';
                else if (cat.status === 'NEAR LIMIT') badgeClass = 'badge-near';

                return (
                  <tr key={cat.categoryId}>
                    <td style={{ fontWeight: 600 }}>{cat.categoryName}</td>
                    <td className="mono-num">₹{cat.budgetAmount.toLocaleString('en-IN')}</td>
                    <td className="mono-num" style={{ fontWeight: 700, color: '#f87171' }}>
                      ₹{cat.spentAmount.toLocaleString('en-IN')}
                    </td>
                    <td
                      className="mono-num"
                      style={{
                        fontWeight: 700,
                        color: cat.remainingAmount < 0 ? 'var(--status-over)' : 'var(--status-under)',
                      }}
                    >
                      {cat.remainingAmount < 0
                        ? `-₹${cat.overspentAmount.toLocaleString('en-IN')}`
                        : `₹${cat.remainingAmount.toLocaleString('en-IN')}`}
                    </td>
                    <td className="mono-num">{cat.usagePercentage}%</td>
                    <td>
                      <span className={`badge ${badgeClass}`}>{cat.status}</span>
                    </td>
                    <td className="mono-num">{cat.expenseCount} entries</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default ReportsPage;
