import React, { useState, useEffect } from 'react';
import {
  Wallet,
  Users,
  Home,
  PiggyBank,
  Calculator,
  Edit2,
  Check,
  X,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  TrendingDown,
  Info,
} from 'lucide-react';
import { useBudget } from '../context/BudgetContext';
import { api } from '../api/client';

export const FinancialProfilePage: React.FC = () => {
  const { profileMetrics, hasProfile, selectedMonth, refreshData } = useBudget();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestedPlan, setSuggestedPlan] = useState<any | null>(null);
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [applyingPlan, setApplyingPlan] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    monthlyIncome: 60000,
    incomeFrequency: 'monthly',
    earningMembers: 2,
    householdMembers: 4,
    dependents: 2,
    children: 2,
    adults: 2,
    seniors: 0,
    monthlyRent: 12000,
    monthlyEmi: 5000,
    monthlyUtilities: 3000,
    monthlyInsurance: 2000,
    otherFixedExpenses: 2000,
    monthlySavingsGoal: 10000,
    emergencyFundGoal: 150000,
  });

  useEffect(() => {
    if (profileMetrics) {
      setFormData({
        monthlyIncome: profileMetrics.monthlyIncome,
        incomeFrequency: profileMetrics.incomeFrequency || 'monthly',
        earningMembers: profileMetrics.earningMembers || 1,
        householdMembers: profileMetrics.householdMembers || 1,
        dependents: profileMetrics.dependents || 0,
        children: profileMetrics.children || 0,
        adults: profileMetrics.adults || 1,
        seniors: profileMetrics.seniors || 0,
        monthlyRent: profileMetrics.monthlyRent || 0,
        monthlyEmi: profileMetrics.monthlyEmi || 0,
        monthlyUtilities: profileMetrics.monthlyUtilities || 0,
        monthlyInsurance: profileMetrics.monthlyInsurance || 0,
        otherFixedExpenses: profileMetrics.otherFixedExpenses || 0,
        monthlySavingsGoal: profileMetrics.monthlySavingsGoal || 0,
        emergencyFundGoal: profileMetrics.emergencyFundGoal || 0,
      });
    }
  }, [profileMetrics]);

  // Live calculation preview during edit
  const previewFixed =
    Number(formData.monthlyRent || 0) +
    Number(formData.monthlyEmi || 0) +
    Number(formData.monthlyUtilities || 0) +
    Number(formData.monthlyInsurance || 0) +
    Number(formData.otherFixedExpenses || 0);

  const previewAvailable = Math.max(
    0,
    Number(formData.monthlyIncome || 0) - previewFixed - Number(formData.monthlySavingsGoal || 0)
  );

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.householdMembers < formData.earningMembers) {
      setError('Total household members must be greater than or equal to earning members.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await api.saveFinancialProfile(formData, selectedMonth);
      await refreshData();
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || 'Failed to save financial profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleFetchSuggestedBudget = async () => {
    setLoadingPlan(true);
    try {
      const res = await api.getSuggestedBudgetFromProfile(selectedMonth);
      setSuggestedPlan(res.suggestion);
    } catch (err: any) {
      console.error('Failed to load suggested budget:', err);
    } finally {
      setLoadingPlan(false);
    }
  };

  const handleApplySuggestedPlan = async () => {
    if (!suggestedPlan) return;
    if (
      !window.confirm(
        `Are you sure you want to apply this suggested budget allocation (Total: ₹${suggestedPlan.suggestedTotal.toLocaleString(
          'en-IN'
        )})? This will update your category limits for ${selectedMonth}.`
      )
    ) {
      return;
    }

    setApplyingPlan(true);
    try {
      for (const item of suggestedPlan.allocations) {
        await api.upsertBudget({
          categoryId: item.categoryId,
          month: selectedMonth,
          amount: item.suggestedBudget,
        });
      }
      await refreshData();
      alert('Suggested budget allocations applied successfully!');
    } catch (err) {
      console.error('Failed to apply suggested budget:', err);
    } finally {
      setApplyingPlan(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Page Header */}
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
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#c084fc', fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.25rem' }}>
            <ShieldCheck size={16} />
            <span>Financial Context Layer</span>
          </div>
          <h2 style={{ fontSize: '1.65rem', fontWeight: 800 }}>Income & Household Profile</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-subtle)' }}>
            Provide financial reality context to calculate your true available variable spending limit.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="btn btn-primary"
            >
              <Edit2 size={16} />
              Edit Profile
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(false)}
              className="btn btn-secondary"
            >
              <X size={16} />
              Cancel Editing
            </button>
          )}
        </div>
      </div>

      {error && (
        <div
          style={{
            background: 'var(--status-over-bg)',
            border: '1px solid var(--status-over-border)',
            color: '#fca5a5',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.88rem',
          }}
        >
          {error}
        </div>
      )}

      {/* VIEW MODE */}
      {!isEditing ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Main Calculation Engine Card (Section 6) */}
          {profileMetrics && (
            <div
              className="glass-card"
              style={{
                background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.8))',
                border: '1px solid rgba(99, 102, 241, 0.35)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      background: 'rgba(99, 102, 241, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Calculator size={20} color="var(--primary)" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Financial Calculation Engine</h3>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-subtle)' }}>
                      Source-of-truth mathematical calculation of available variable spending
                    </p>
                  </div>
                </div>

                <span
                  className={`badge ${
                    profileMetrics.categoryBudgetsFit ? 'badge-under' : 'badge-over'
                  }`}
                >
                  {profileMetrics.categoryBudgetsFit ? 'Budgets Balanced' : 'Budgets Deficit'}
                </span>
              </div>

              {/* Visual Formula Chain */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '1rem',
                  background: 'rgba(15, 23, 42, 0.7)',
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', fontWeight: 600 }}>1. MONTHLY INCOME</div>
                  <div className="mono-num" style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.2rem' }}>
                    ₹{profileMetrics.monthlyIncome.toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>Gross Household Inflow</div>
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', color: '#f87171', fontWeight: 600 }}>2. FIXED EXPENSES (-)</div>
                  <div className="mono-num" style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f87171', marginTop: '0.2rem' }}>
                    -₹{profileMetrics.totalFixedExpenses.toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>
                    {profileMetrics.fixedExpenseRatio}% (Rent, EMI, Utilities)
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: 600 }}>3. SAVINGS GOAL (-)</div>
                  <div className="mono-num" style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f59e0b', marginTop: '0.2rem' }}>
                    -₹{profileMetrics.monthlySavingsGoal.toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>
                    {profileMetrics.savingsRatio}% of income
                  </div>
                </div>

                <div style={{ borderLeft: '1px solid var(--border-subtle)', paddingLeft: '1rem' }}>
                  <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700 }}>AVAILABLE SPENDING (=)</div>
                  <div className="mono-num" style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--status-under)', marginTop: '0.2rem' }}>
                    ₹{profileMetrics.availableSpending.toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>
                    Safe variable pool ({profileMetrics.variableSpendingRatio}%)
                  </div>
                </div>
              </div>

              {/* Assessment Banner (Section 8) */}
              <div
                style={{
                  padding: '0.85rem 1.25rem',
                  borderRadius: 'var(--radius-md)',
                  background: profileMetrics.categoryBudgetsFit ? 'var(--status-under-bg)' : 'var(--status-over-bg)',
                  border: `1px solid ${profileMetrics.categoryBudgetsFit ? 'var(--status-under-border)' : 'var(--status-over-border)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                }}
              >
                {profileMetrics.categoryBudgetsFit ? (
                  <CheckCircle2 size={18} color="var(--status-under)" />
                ) : (
                  <AlertTriangle size={18} color="var(--status-over)" />
                )}
                <div style={{ fontSize: '0.88rem', color: 'var(--text-main)', fontWeight: 600 }}>
                  {profileMetrics.budgetFitMessage}
                </div>
              </div>
            </div>
          )}

          {/* 4 Cards Grid (Section 3) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {/* Card 1: Household Income */}
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Wallet size={18} color="var(--primary)" />
                <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>Household Income</h4>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>Monthly Household Income</div>
                <div className="mono-num" style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  ₹{(profileMetrics?.monthlyIncome || 0).toLocaleString('en-IN')}
                </div>
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Frequency: <strong style={{ color: 'var(--text-main)', textTransform: 'capitalize' }}>{profileMetrics?.incomeFrequency || 'monthly'}</strong>
              </div>
            </div>

            {/* Card 2: Household Composition */}
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Users size={18} color="var(--secondary)" />
                <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>Household Members</h4>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', textAlign: 'center' }}>
                <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}>
                  <div className="mono-num" style={{ fontSize: '1.25rem', fontWeight: 800 }}>{profileMetrics?.earningMembers || 1}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>Earning</div>
                </div>
                <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}>
                  <div className="mono-num" style={{ fontSize: '1.25rem', fontWeight: 800 }}>{profileMetrics?.householdMembers || 1}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>Total</div>
                </div>
                <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}>
                  <div className="mono-num" style={{ fontSize: '1.25rem', fontWeight: 800 }}>{profileMetrics?.dependents || 0}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>Dependents</div>
                </div>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-subtle)' }}>
                Age Groups: {profileMetrics?.children || 0} Children, {profileMetrics?.adults || 1} Adults, {profileMetrics?.seniors || 0} Seniors
              </div>
            </div>

            {/* Card 3: Fixed Financial Commitments */}
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Home size={18} color="#f87171" />
                  <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>Fixed Commitments</h4>
                </div>
                <span className="mono-num" style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f87171' }}>
                  ₹{(profileMetrics?.totalFixedExpenses || 0).toLocaleString('en-IN')}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.82rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-subtle)' }}>Rent:</span>
                  <span className="mono-num">₹{(profileMetrics?.monthlyRent || 0).toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-subtle)' }}>EMI / Loan:</span>
                  <span className="mono-num">₹{(profileMetrics?.monthlyEmi || 0).toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-subtle)' }}>Utilities:</span>
                  <span className="mono-num">₹{(profileMetrics?.monthlyUtilities || 0).toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-subtle)' }}>Insurance:</span>
                  <span className="mono-num">₹{(profileMetrics?.monthlyInsurance || 0).toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-subtle)' }}>Other Fixed:</span>
                  <span className="mono-num">₹{(profileMetrics?.otherFixedExpenses || 0).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Card 4: Savings Goals */}
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <PiggyBank size={18} color="#f59e0b" />
                <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>Savings Targets</h4>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>Monthly Savings Goal</div>
                <div className="mono-num" style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f59e0b' }}>
                  ₹{(profileMetrics?.monthlySavingsGoal || 0).toLocaleString('en-IN')}
                </div>
              </div>
              {profileMetrics?.emergencyFundGoal && (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-subtle)' }}>
                  Emergency Fund Target: <strong className="mono-num" style={{ color: 'var(--text-main)' }}>₹{profileMetrics.emergencyFundGoal.toLocaleString('en-IN')}</strong>
                </div>
              )}
            </div>
          </div>

          {/* AI Suggested Category Budget Allocations (Section 9) */}
          <div
            className="glass-card"
            style={{
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(139, 92, 246, 0.12))',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Sparkles size={20} color="var(--primary)" />
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>AI Suggested Category Budget</h3>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-subtle)' }}>
                    Calibrated from your income, household size, fixed commitments, and savings goals
                  </p>
                </div>
              </div>

              {!suggestedPlan ? (
                <button
                  onClick={handleFetchSuggestedBudget}
                  disabled={loadingPlan}
                  className="btn btn-primary btn-sm"
                >
                  <Sparkles size={15} />
                  {loadingPlan ? 'Generating...' : 'Generate Suggested Allocations'}
                </button>
              ) : (
                <button
                  onClick={handleApplySuggestedPlan}
                  disabled={applyingPlan}
                  className="btn btn-primary btn-sm"
                >
                  <Check size={15} />
                  {applyingPlan ? 'Applying...' : 'Apply Suggestion to Budgets'}
                </button>
              )}
            </div>

            {suggestedPlan && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
                  {suggestedPlan.rationale}
                </p>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '0.75rem',
                  }}
                >
                  {suggestedPlan.allocations.map((item: any) => (
                    <div
                      key={item.categoryId}
                      style={{
                        background: 'rgba(15, 23, 42, 0.7)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-md)',
                        padding: '0.75rem 1rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.25rem',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{item.categoryName}</span>
                        <span className="mono-num" style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '1.05rem' }}>
                          ₹{item.suggestedBudget.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>
                        Current: ₹{item.currentBudget.toLocaleString('en-IN')} • {item.reason}
                      </div>
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid var(--status-under-border)',
                  }}
                >
                  <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                    Suggested Planned Total: <strong className="mono-num">₹{suggestedPlan.suggestedTotal.toLocaleString('en-IN')}</strong>
                  </span>
                  <span style={{ fontSize: '0.82rem', color: 'var(--status-under)', fontWeight: 700 }}>
                    Safety Buffer: ₹{suggestedPlan.safetyBuffer.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* EDIT FORM MODE */
        <form onSubmit={handleSave} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Update Financial Profile</h3>

          {/* Section: Income */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.75rem' }}>
              1. Household Income
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Monthly Household Income (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  className="form-control mono-num"
                  value={formData.monthlyIncome}
                  onChange={(e) => setFormData({ ...formData, monthlyIncome: parseFloat(e.target.value) || 0 })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Income Frequency</label>
                <select
                  className="form-control"
                  value={formData.incomeFrequency}
                  onChange={(e) => setFormData({ ...formData, incomeFrequency: e.target.value })}
                >
                  <option value="monthly">Monthly</option>
                  <option value="weekly">Weekly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Earning Members</label>
                <input
                  type="number"
                  min="1"
                  className="form-control mono-num"
                  value={formData.earningMembers}
                  onChange={(e) => setFormData({ ...formData, earningMembers: parseInt(e.target.value, 10) || 1 })}
                  required
                />
              </div>
            </div>
          </div>

          {/* Section: Household */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.75rem' }}>
              2. Household Composition
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Total Household Members</label>
                <input
                  type="number"
                  min="1"
                  className="form-control mono-num"
                  value={formData.householdMembers}
                  onChange={(e) => setFormData({ ...formData, householdMembers: parseInt(e.target.value, 10) || 1 })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Total Dependents</label>
                <input
                  type="number"
                  min="0"
                  className="form-control mono-num"
                  value={formData.dependents}
                  onChange={(e) => setFormData({ ...formData, dependents: parseInt(e.target.value, 10) || 0 })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Children</label>
                <input
                  type="number"
                  min="0"
                  className="form-control mono-num"
                  value={formData.children}
                  onChange={(e) => setFormData({ ...formData, children: parseInt(e.target.value, 10) || 0 })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Adults</label>
                <input
                  type="number"
                  min="1"
                  className="form-control mono-num"
                  value={formData.adults}
                  onChange={(e) => setFormData({ ...formData, adults: parseInt(e.target.value, 10) || 1 })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Seniors</label>
                <input
                  type="number"
                  min="0"
                  className="form-control mono-num"
                  value={formData.seniors}
                  onChange={(e) => setFormData({ ...formData, seniors: parseInt(e.target.value, 10) || 0 })}
                />
              </div>
            </div>
          </div>

          {/* Section: Fixed Commitments */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.75rem' }}>
              3. Monthly Fixed Financial Commitments
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Monthly Rent (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  className="form-control mono-num"
                  value={formData.monthlyRent}
                  onChange={(e) => setFormData({ ...formData, monthlyRent: parseFloat(e.target.value) || 0 })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">EMI / Loan Payments (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  className="form-control mono-num"
                  value={formData.monthlyEmi}
                  onChange={(e) => setFormData({ ...formData, monthlyEmi: parseFloat(e.target.value) || 0 })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Utilities (Power, Water, Gas) (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  className="form-control mono-num"
                  value={formData.monthlyUtilities}
                  onChange={(e) => setFormData({ ...formData, monthlyUtilities: parseFloat(e.target.value) || 0 })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Insurance (Health, Life, Vehicle) (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  className="form-control mono-num"
                  value={formData.monthlyInsurance}
                  onChange={(e) => setFormData({ ...formData, monthlyInsurance: parseFloat(e.target.value) || 0 })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Other Fixed Expenses (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  className="form-control mono-num"
                  value={formData.otherFixedExpenses}
                  onChange={(e) => setFormData({ ...formData, otherFixedExpenses: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
          </div>

          {/* Section: Savings Goals */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.75rem' }}>
              4. Savings Targets
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Monthly Savings Goal (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  className="form-control mono-num"
                  value={formData.monthlySavingsGoal}
                  onChange={(e) => setFormData({ ...formData, monthlySavingsGoal: parseFloat(e.target.value) || 0 })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Emergency Fund Target (₹) (Optional)</label>
                <input
                  type="number"
                  min="0"
                  step="5000"
                  className="form-control mono-num"
                  value={formData.emergencyFundGoal}
                  onChange={(e) => setFormData({ ...formData, emergencyFundGoal: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
          </div>

          {/* Live Preview Bar */}
          <div
            style={{
              padding: '1rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>Calculated Total Fixed Expenses</div>
              <div className="mono-num" style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f87171' }}>
                ₹{previewFixed.toLocaleString('en-IN')}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>Calculated Available Variable Spending</div>
              <div className="mono-num" style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--status-under)' }}>
                ₹{previewAvailable.toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              <Check size={16} />
              {loading ? 'Saving Profile...' : 'Save Financial Profile'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
export default FinancialProfilePage;
