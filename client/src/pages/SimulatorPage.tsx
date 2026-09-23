import React, { useState } from 'react';
import { Sparkles, AlertTriangle, CheckCircle2, ArrowRight, ShieldAlert, RotateCcw } from 'lucide-react';
import { useBudget } from '../context/BudgetContext';
import { api } from '../api/client';

export const SimulatorPage: React.FC = () => {
  const { summary, categories, selectedMonth } = useBudget();
  const [selectedCategoryId, setSelectedCategoryId] = useState(categories[0]?.id || '');
  const [hypotheticalAmount, setHypotheticalAmount] = useState('2000');
  const [simType, setSimType] = useState<'expense' | 'budget_change'>('expense');
  const [simulationResult, setSimulationResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSimulate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!hypotheticalAmount) return;

    setLoading(true);
    try {
      const selectedCat = categories.find((c) => c.id === selectedCategoryId);
      const res = await api.simulate({
        categoryId: selectedCategoryId,
        categoryName: selectedCat?.name,
        amount: parseFloat(hypotheticalAmount),
        month: selectedMonth,
        type: simType,
      });
      setSimulationResult(res);
    } catch (err) {
      console.error('Simulation error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Run initial default simulation on load for Travel ₹2,000 (Step 32 demo scenario!)
  React.useEffect(() => {
    const travelCat = categories.find((c) => c.name.toLowerCase() === 'travel');
    if (travelCat) {
      setSelectedCategoryId(travelCat.id);
      api.simulate({
        categoryId: travelCat.id,
        categoryName: 'Travel',
        amount: 2000,
        month: selectedMonth,
        type: 'expense',
      }).then((res) => setSimulationResult(res));
    }
  }, [categories, selectedMonth]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.2))',
          border: '1px solid rgba(99, 102, 241, 0.35)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.5rem 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ maxWidth: '650px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
            <Sparkles size={20} color="var(--primary)" />
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 800,
                color: '#c084fc',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              PS49 Innovation Feature
            </span>
          </div>
          <h2 style={{ fontSize: '1.65rem', fontWeight: 800 }}>What-If Budget Decision Simulator</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', marginTop: '0.25rem', lineHeight: 1.5 }}>
            Test potential financial decisions safely before spending. Explore the impact of hypothetical
            expenses or budget adjustments without altering your real database records.
          </p>
        </div>

        <div
          style={{
            padding: '0.65rem 1rem',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid var(--status-over-border)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
          }}
        >
          <ShieldAlert size={20} color="var(--status-over)" />
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--status-over)' }}>SANDBOX ISOLATION</div>
            <div style={{ fontSize: '0.75rem', color: '#fca5a5' }}>ZERO changes saved to database</div>
          </div>
        </div>
      </div>

      {/* Simulator Inputs & Result Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {/* Left: Input Sandbox Form */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.25rem' }}>Scenario Builder</h3>

          <form onSubmit={handleSimulate}>
            <div className="form-group">
              <label className="form-label">Simulation Type</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setSimType('expense')}
                  className={`btn ${simType === 'expense' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: '0.82rem' }}
                >
                  Hypothetical Expense
                </button>
                <button
                  type="button"
                  onClick={() => setSimType('budget_change')}
                  className={`btn ${simType === 'budget_change' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: '0.82rem' }}
                >
                  Adjust Budget Limit
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Target Category</label>
              <select
                className="form-control"
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                {simType === 'expense' ? 'Hypothetical Expense Amount (₹)' : 'Proposed New Budget Amount (₹)'}
              </label>
              <input
                type="number"
                step="100"
                min="1"
                className="form-control mono-num"
                value={hypotheticalAmount}
                onChange={(e) => setHypotheticalAmount(e.target.value)}
                required
              />
            </div>

            {/* Quick Demo Pre-set Buttons */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginBottom: '0.4rem', fontWeight: 600 }}>
                Demo Shortcuts:
              </div>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => {
                    const trav = categories.find((c) => c.name.toLowerCase() === 'travel');
                    if (trav) setSelectedCategoryId(trav.id);
                    setHypotheticalAmount('2000');
                    setSimType('expense');
                  }}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.75rem', padding: '0.25rem 0.55rem' }}
                >
                  Step 32: ₹2,000 Travel Expense
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const food = categories.find((c) => c.name.toLowerCase() === 'food');
                    if (food) setSelectedCategoryId(food.id);
                    setHypotheticalAmount('1000');
                    setSimType('expense');
                  }}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.75rem', padding: '0.25rem 0.55rem' }}
                >
                  Dinner: ₹1,000 Food
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !hypotheticalAmount}
              style={{ width: '100%', padding: '0.75rem' }}
            >
              <Sparkles size={16} />
              {loading ? 'Simulating...' : 'Run Simulation'}
            </button>
          </form>
        </div>

        {/* Right: Simulation Analysis Output */}
        {simulationResult ? (
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    letterSpacing: '0.04em',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                    background: 'rgba(139, 92, 246, 0.25)',
                    color: '#c084fc',
                    border: '1px solid rgba(139, 92, 246, 0.4)',
                  }}
                >
                  SIMULATION — NOT SAVED
                </span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '0.4rem' }}>
                  {simulationResult.categoryName} Impact Analysis
                </h3>
              </div>

              <span
                className={`badge ${
                  simulationResult.isOverBudget
                    ? 'badge-over'
                    : simulationResult.projectedStatus === 'NEAR LIMIT'
                    ? 'badge-near'
                    : 'badge-under'
                }`}
              >
                Projected: {simulationResult.projectedStatus}
              </span>
            </div>

            {/* Calculated Outcome Alert */}
            <div
              style={{
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                background: simulationResult.isOverBudget ? 'var(--status-over-bg)' : 'var(--status-under-bg)',
                border: `1px solid ${simulationResult.isOverBudget ? 'var(--status-over-border)' : 'var(--status-under-border)'}`,
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
              }}
            >
              {simulationResult.isOverBudget ? (
                <AlertTriangle size={20} color="var(--status-over)" style={{ flexShrink: 0, marginTop: '2px' }} />
              ) : (
                <CheckCircle2 size={20} color="var(--status-under)" style={{ flexShrink: 0, marginTop: '2px' }} />
              )}
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#ffffff' }}>
                  {simulationResult.isOverBudget ? 'Overspending Risk Detected' : 'Safe Spending Margin'}
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', marginTop: '0.25rem' }}>
                  {simulationResult.outcomeMessage}
                </p>
              </div>
            </div>

            {/* Side-by-Side Comparison Table */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
                background: 'rgba(15, 23, 42, 0.6)',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', fontWeight: 600 }}>CURRENT STATE</div>
                <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <div style={{ fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Budget: </span>
                    <span className="mono-num" style={{ fontWeight: 700 }}>₹{simulationResult.currentBudget.toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Spent: </span>
                    <span className="mono-num" style={{ fontWeight: 700 }}>₹{simulationResult.currentSpending.toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Remaining: </span>
                    <span className="mono-num" style={{ fontWeight: 700 }}>₹{simulationResult.currentRemaining.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: '#c084fc', fontWeight: 600 }}>PROJECTED SCENARIO</div>
                <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <div style={{ fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Budget: </span>
                    <span className="mono-num" style={{ fontWeight: 700 }}>₹{simulationResult.projectedBudget.toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Spent: </span>
                    <span className="mono-num" style={{ fontWeight: 700, color: '#f87171' }}>
                      ₹{simulationResult.projectedSpending.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Remaining: </span>
                    <span
                      className="mono-num"
                      style={{
                        fontWeight: 700,
                        color: simulationResult.projectedRemaining < 0 ? 'var(--status-over)' : 'var(--status-under)',
                      }}
                    >
                      {simulationResult.projectedRemaining < 0
                        ? `-₹${Math.abs(simulationResult.projectedRemaining).toLocaleString('en-IN')}`
                        : `₹${simulationResult.projectedRemaining.toLocaleString('en-IN')}`}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Total Monthly Impact */}
            <div style={{ fontSize: '0.8rem', color: 'var(--text-subtle)', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
              Total monthly remaining runway would shift from{' '}
              <strong className="mono-num" style={{ color: 'var(--text-main)' }}>
                ₹{simulationResult.totalMonthlyImpact.currentTotalRemaining.toLocaleString('en-IN')}
              </strong>{' '}
              to{' '}
              <strong
                className="mono-num"
                style={{
                  color:
                    simulationResult.totalMonthlyImpact.projectedTotalRemaining < 0
                      ? 'var(--status-over)'
                      : 'var(--status-under)',
                }}
              >
                ₹{simulationResult.totalMonthlyImpact.projectedTotalRemaining.toLocaleString('en-IN')}
              </strong>
              .
            </div>
          </div>
        ) : (
          <div
            className="glass-card"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-subtle)',
            }}
          >
            Select a category and amount to run a simulation.
          </div>
        )}
      </div>
    </div>
  );
};
export default SimulatorPage;
