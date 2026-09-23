import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Lightbulb, CheckCircle2, ArrowRight } from 'lucide-react';
import { useBudget, CategoryDetail } from '../context/BudgetContext';
import BudgetModal from '../components/BudgetModal';
import CategoryModal from '../components/CategoryModal';
import { api } from '../api/client';

export const BudgetsPage: React.FC = () => {
  const { summary, selectedMonth, refreshData } = useBudget();
  const [selectedCategoryForEdit, setSelectedCategoryForEdit] = useState<CategoryDetail | null>(null);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [applyingRecId, setApplyingRecId] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecs = async () => {
      try {
        const res = await api.getRecommendations(selectedMonth);
        setRecommendations(res.suggestions || []);
      } catch (err) {
        console.error('Failed to load recommendations:', err);
      }
    };
    fetchRecs();
  }, [selectedMonth, summary]);

  const handleApplySuggestion = async (sug: any) => {
    setApplyingRecId(sug.id);
    try {
      await api.upsertBudget({
        categoryId: sug.categoryId,
        month: selectedMonth,
        amount: sug.suggestedBudget,
      });
      await refreshData();
    } catch (err) {
      console.error('Failed to apply recommendation:', err);
    } finally {
      setApplyingRecId(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Top Header & Actions */}
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
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Monthly Budget Allocations</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-subtle)' }}>
            Configure spending ceilings for each category for {selectedMonth}.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="btn btn-secondary"
          >
            <Plus size={16} />
            Add Custom Category
          </button>
          <button
            onClick={() => {
              setSelectedCategoryForEdit(null);
              setIsBudgetModalOpen(true);
            }}
            className="btn btn-primary"
          >
            <Plus size={16} />
            Set Category Budget
          </button>
        </div>
      </div>

      {/* Smart Budget Suggestions (Requirement 13) */}
      {recommendations.length > 0 && (
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(139, 92, 246, 0.1))',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(99, 102, 241, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Lightbulb size={18} color="var(--primary)" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>AI Smart Budget Suggestions</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
                Suggestions based on spending trends. No changes are applied without your explicit approval.
              </p>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '1rem',
            }}
          >
            {recommendations.map((rec) => (
              <div
                key={rec.id}
                style={{
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{rec.categoryName}</span>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        padding: '0.15rem 0.45rem',
                        borderRadius: '4px',
                        background: 'rgba(99, 102, 241, 0.2)',
                        color: '#c084fc',
                        fontWeight: 700,
                      }}
                    >
                      {rec.confidence} Confidence
                    </span>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                    {rec.reason}
                  </p>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '0.5rem',
                    borderTop: '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{ fontSize: '0.8rem' }}>
                    <span style={{ color: 'var(--text-subtle)' }}>Current: </span>
                    <span className="mono-num" style={{ fontWeight: 600 }}>₹{rec.currentBudget}</span>
                    <span style={{ margin: '0 0.4rem', color: 'var(--text-subtle)' }}>→</span>
                    <span style={{ color: 'var(--primary)', fontWeight: 700 }}>₹{rec.suggestedBudget}</span>
                  </div>

                  <button
                    onClick={() => handleApplySuggestion(rec)}
                    disabled={applyingRecId === rec.id}
                    className="btn btn-primary btn-sm"
                    style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
                  >
                    <CheckCircle2 size={13} />
                    {applyingRecId === rec.id ? 'Applying...' : 'Apply Suggestion'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Category Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.25rem',
        }}
      >
        {(summary?.categories || []).map((cat) => {
          let badgeClass = 'badge-under';
          let progressClass = 'under';
          if (cat.status === 'OVER BUDGET') {
            badgeClass = 'badge-over';
            progressClass = 'over';
          } else if (cat.status === 'NEAR LIMIT') {
            badgeClass = 'badge-near';
            progressClass = 'near';
          }

          return (
            <div
              key={cat.categoryId}
              className="glass-card"
              style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      background: `${cat.categoryColor || '#6366f1'}25`,
                      border: `1px solid ${cat.categoryColor || '#6366f1'}50`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <span
                      style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        background: cat.categoryColor || '#6366f1',
                      }}
                    />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>{cat.categoryName}</h4>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>
                      {cat.expenseCount} expenses logged
                    </span>
                  </div>
                </div>

                <span className={`badge ${badgeClass}`}>{cat.status}</span>
              </div>

              {/* Numbers */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.5rem',
                  background: 'rgba(15, 23, 42, 0.5)',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>Budget Limit</div>
                  <div className="mono-num" style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                    ₹{cat.budgetAmount.toLocaleString('en-IN')}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>Actual Spent</div>
                  <div className="mono-num" style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f87171' }}>
                    ₹{cat.spentAmount.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              {/* Progress & Remaining */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.35rem' }}>
                  <span style={{ color: 'var(--text-subtle)' }}>Utilization ({cat.usagePercentage}%)</span>
                  <span
                    className="mono-num"
                    style={{
                      fontWeight: 700,
                      color: cat.remainingAmount < 0 ? 'var(--status-over)' : 'var(--status-under)',
                    }}
                  >
                    {cat.remainingAmount < 0
                      ? `-₹${cat.overspentAmount.toLocaleString('en-IN')} over`
                      : `₹${cat.remainingAmount.toLocaleString('en-IN')} remaining`}
                  </span>
                </div>
                <div className="progress-track">
                  <div
                    className={`progress-fill ${progressClass}`}
                    style={{ width: `${Math.min(100, cat.usagePercentage)}%` }}
                  />
                </div>
              </div>

              {/* Edit Trigger */}
              <button
                onClick={() => {
                  setSelectedCategoryForEdit(cat);
                  setIsBudgetModalOpen(true);
                }}
                className="btn btn-secondary btn-sm"
                style={{ width: '100%', marginTop: 'auto' }}
              >
                <Edit2 size={13} />
                Edit Category Limit
              </button>
            </div>
          );
        })}
      </div>

      <BudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        categoryToEdit={selectedCategoryForEdit}
      />
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
      />
    </div>
  );
};
export default BudgetsPage;
