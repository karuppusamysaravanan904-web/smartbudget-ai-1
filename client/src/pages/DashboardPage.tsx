import React, { useState, useEffect } from 'react';
import {
  Wallet,
  TrendingDown,
  CheckCircle2,
  PieChart as PieIcon,
  Plus,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
  Sparkles,
  Edit2,
  Receipt,
  Users,
  Home,
  PiggyBank,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useBudget, CategoryDetail } from '../context/BudgetContext';
import HealthScoreCard from '../components/HealthScoreCard';
import InsightsCard from '../components/InsightsCard';
import QuickPrompts from '../components/QuickPrompts';
import BudgetModal from '../components/BudgetModal';
import ExpenseModal from '../components/ExpenseModal';
import { api } from '../api/client';

interface DashboardPageProps {
  onOpenAiChat: (initialPrompt?: string) => void;
  onNavigateTab: (tab: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onOpenAiChat,
  onNavigateTab,
}) => {
  const { summary, selectedMonth, profileMetrics, hasProfile } = useBudget();
  const [recentExpenses, setRecentExpenses] = useState<any[]>([]);
  const [selectedCategoryForEdit, setSelectedCategoryForEdit] = useState<CategoryDetail | null>(null);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const data = await api.getExpenses({ month: selectedMonth, sortBy: 'date', sortOrder: 'desc' });
        setRecentExpenses(data.slice(0, 5));
      } catch (err) {
        console.error('Failed to load recent expenses:', err);
      }
    };
    fetchRecent();
  }, [selectedMonth, summary]);

  const totalBudget = summary?.totalBudget || 0;
  const totalSpent = summary?.totalSpent || 0;
  const remaining = summary?.remaining || 0;
  const usagePercentage = summary?.usagePercentage || 0;

  // Prepare chart data
  const barChartData = (summary?.categories || []).map((cat) => ({
    name: cat.categoryName,
    Budget: cat.budgetAmount,
    Spent: cat.spentAmount,
    remaining: cat.remainingAmount,
    status: cat.status,
  }));

  const pieChartData = (summary?.categories || [])
    .filter((cat) => cat.spentAmount > 0)
    .map((cat) => ({
      name: cat.categoryName,
      value: cat.spentAmount,
      color: cat.categoryColor || '#6366f1',
    }));

  const PIE_COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#f97316', '#8b5cf6', '#ec4899', '#06b6d4'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Quick Prompts Banner for BudgetAI */}
      <QuickPrompts onSelectPrompt={(prompt) => onOpenAiChat(prompt)} />

      {/* Onboarding Banner if Profile Not Configured (Requirement 15) */}
      {!hasProfile ? (
        <div
          className="glass-card"
          style={{
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(139, 92, 246, 0.18))',
            border: '1px solid rgba(99, 102, 241, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            padding: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', maxWidth: '650px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: 'rgba(99, 102, 241, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <ShieldCheck size={24} color="var(--primary)" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Complete Your Financial Profile</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', marginTop: '0.2rem', lineHeight: 1.4 }}>
                Tell us about your household income, fixed expenses, and savings goals so SMARTBUDGET AI can calculate
                your true available variable spending and create personalized recommendations.
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('profile')}
            className="btn btn-primary"
            style={{ padding: '0.65rem 1.25rem' }}
          >
            Set Up Financial Profile
            <ArrowRight size={16} />
          </button>
        </div>
      ) : (
        /* Financial Overview Section (Requirement 7 & 8) */
        <div
          className="glass-card"
          style={{
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.8))',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
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
                <ShieldCheck size={18} color="var(--primary)" />
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Financial Overview</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
                  Household baseline • Fixed commitments • Available variable spending
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span
                style={{
                  fontSize: '0.75rem',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '9999px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-main)',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <Users size={13} color="var(--primary)" />
                {profileMetrics?.earningMembers} Earning • {profileMetrics?.householdMembers} Members • {profileMetrics?.dependents} Dependents
              </span>

              <button
                onClick={() => onNavigateTab('profile')}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
              >
                Manage Profile
              </button>
            </div>
          </div>

          {/* 4 Financial Profile Key Metric Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
            }}
          >
            <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>Monthly Household Income</div>
              <div className="mono-num" style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.15rem' }}>
                ₹{(profileMetrics?.monthlyIncome || 0).toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>Gross monthly inflow</div>
            </div>

            <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.75rem', color: '#f87171' }}>Fixed Commitments (-)</div>
              <div className="mono-num" style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f87171', marginTop: '0.15rem' }}>
                -₹{(profileMetrics?.totalFixedExpenses || 0).toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>
                Rent, EMI, Utilities ({profileMetrics?.fixedExpenseRatio}%)
              </div>
            </div>

            <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.75rem', color: '#f59e0b' }}>Savings Goal (-)</div>
              <div className="mono-num" style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f59e0b', marginTop: '0.15rem' }}>
                -₹{(profileMetrics?.monthlySavingsGoal || 0).toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>
                Monthly target ({profileMetrics?.savingsRatio}%)
              </div>
            </div>

            <div style={{ background: 'rgba(16, 185, 129, 0.08)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--status-under-border)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--status-under)', fontWeight: 700 }}>Available Variable Spending (=)</div>
              <div className="mono-num" style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--status-under)', marginTop: '0.15rem' }}>
                ₹{(profileMetrics?.availableSpending || 0).toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>
                Safe spending limit ({profileMetrics?.variableSpendingRatio}%)
              </div>
            </div>
          </div>

          {/* Assessment Indicator (Section 8) */}
          {profileMetrics && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                fontSize: '0.82rem',
                color: profileMetrics.categoryBudgetsFit ? '#86efac' : '#fca5a5',
                paddingTop: '0.5rem',
                borderTop: '1px solid var(--border-subtle)',
              }}
            >
              {profileMetrics.categoryBudgetsFit ? (
                <CheckCircle2 size={16} color="var(--status-under)" />
              ) : (
                <AlertTriangle size={16} color="var(--status-over)" />
              )}
              <span>{profileMetrics.budgetFitMessage}</span>
            </div>
          )}
        </div>
      )}

      {/* 4 Summary Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
          gap: '1.25rem',
        }}
      >
        {/* Card 1: Total Budget */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Budget</span>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'rgba(99, 102, 241, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Wallet size={18} color="var(--primary)" />
            </div>
          </div>
          <div className="mono-num" style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)' }}>
            ₹{totalBudget.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
            Allocated across {summary?.categories.length || 0} categories
          </div>
        </div>

        {/* Card 2: Total Spent */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Spent</span>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'rgba(239, 68, 68, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <TrendingDown size={18} color="var(--status-over)" />
            </div>
          </div>
          <div className="mono-num" style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)' }}>
            ₹{totalSpent.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
            {recentExpenses.length} transactions recorded
          </div>
        </div>

        {/* Card 3: Remaining Balance */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Remaining Balance</span>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: remaining >= 0 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CheckCircle2 size={18} color={remaining >= 0 ? 'var(--status-under)' : 'var(--status-over)'} />
            </div>
          </div>
          <div
            className="mono-num"
            style={{
              fontSize: '1.85rem',
              fontWeight: 800,
              color: remaining >= 0 ? 'var(--status-under)' : 'var(--status-over)',
            }}
          >
            {remaining < 0 ? `-₹${Math.abs(remaining).toLocaleString('en-IN')}` : `₹${remaining.toLocaleString('en-IN')}`}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
            {remaining >= 0 ? 'Buffer available this month' : 'Net monthly deficit'}
          </div>
        </div>

        {/* Card 4: Budget Usage % */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Budget Usage</span>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'rgba(245, 158, 11, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <PieIcon size={18} color="var(--status-near)" />
            </div>
          </div>
          <div className="mono-num" style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)' }}>
            {usagePercentage}%
          </div>
          <div className="progress-track" style={{ height: '6px', marginTop: '4px' }}>
            <div
              className={`progress-fill ${usagePercentage > 100 ? 'over' : usagePercentage >= 80 ? 'near' : 'under'}`}
              style={{ width: `${Math.min(100, usagePercentage)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Row 2: Budget Health Score Card + AI Insights Card */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '1.5rem',
        }}
      >
        <HealthScoreCard />
        <InsightsCard />
      </div>

      {/* Row 3: Recharts Visualizations (Budget vs Actual + Distribution) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {/* Chart 1: Budget vs Actual Bar Chart */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Budget vs Actual Spending</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-subtle)' }}>Comparison per category for {selectedMonth}</p>
            </div>
          </div>

          <div style={{ width: '100%', height: '280px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: '#111827',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#f8fafc',
                  }}
                  formatter={(val: any) => `₹${Number(val).toLocaleString('en-IN')}`}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="Budget" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Spent" fill="#ec4899" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Spending Distribution Donut Chart */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Spending Distribution</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-subtle)' }}>Where your money went this month</p>
            </div>
          </div>

          <div style={{ width: '100%', height: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {pieChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: '#111827',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                    formatter={(val: any) => `₹${Number(val).toLocaleString('en-IN')}`}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ color: 'var(--text-subtle)', fontSize: '0.85rem' }}>No expenses recorded this month.</div>
            )}
          </div>
        </div>
      </div>

      {/* Row 4: Category Budgets Breakdown (Live PS49 Monitoring Table) */}
      <div className="glass-card">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.25rem',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Category Budgets & Utilization</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-subtle)' }}>
              Live spending vs limits. Status auto-updates to Under Budget, Near Limit, or Over Budget.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => {
                setSelectedCategoryForEdit(null);
                setIsBudgetModalOpen(true);
              }}
              className="btn btn-secondary btn-sm"
            >
              <Plus size={15} />
              Set Budget
            </button>
            <button
              onClick={() => setIsExpenseModalOpen(true)}
              className="btn btn-primary btn-sm"
            >
              <Receipt size={15} />
              Add Expense
            </button>
          </div>
        </div>

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Budget Limit</th>
                <th>Actual Spent</th>
                <th>Remaining / Deficit</th>
                <th style={{ width: '22%' }}>Utilization Progress</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
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
                  <tr key={cat.categoryId}>
                    <td style={{ fontWeight: 600 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span
                          style={{
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            background: cat.categoryColor || '#6366f1',
                          }}
                        />
                        <span>{cat.categoryName}</span>
                      </div>
                    </td>
                    <td className="mono-num">₹{cat.budgetAmount.toLocaleString('en-IN')}</td>
                    <td className="mono-num" style={{ fontWeight: 700 }}>
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
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <div className="progress-track">
                          <div
                            className={`progress-fill ${progressClass}`}
                            style={{ width: `${Math.min(100, cat.usagePercentage)}%` }}
                          />
                        </div>
                        <span className="mono-num" style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', minWidth: '42px' }}>
                          {cat.usagePercentage}%
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${badgeClass}`}>{cat.status}</span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => {
                          setSelectedCategoryForEdit(cat);
                          setIsBudgetModalOpen(true);
                        }}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                        title="Edit Budget Limit"
                      >
                        <Edit2 size={13} />
                        Edit Limit
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Row 5: Recent Transactions with Quick Actions */}
      <div className="glass-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Recent Recorded Expenses</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-subtle)' }}>Latest transactions logged for {selectedMonth}</p>
          </div>
          <button
            onClick={() => onNavigateTab('expenses')}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.8rem' }}
          >
            View All Expenses
            <ArrowUpRight size={14} />
          </button>
        </div>

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Title / Description</th>
                <th>Category</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {recentExpenses.length > 0 ? (
                recentExpenses.map((exp) => (
                  <tr key={exp.id}>
                    <td style={{ color: 'var(--text-subtle)', fontSize: '0.85rem' }}>
                      {new Date(exp.date).toISOString().split('T')[0]}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{exp.title}</div>
                      {exp.description && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>{exp.description}</div>
                      )}
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          background: 'rgba(255,255,255,0.06)',
                          color: 'var(--text-main)',
                        }}
                      >
                        {exp.category.name}
                      </span>
                    </td>
                    <td className="mono-num" style={{ textAlign: 'right', fontWeight: 700, color: '#f87171' }}>
                      ₹{exp.amount.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-subtle)', padding: '2rem' }}>
                    No expenses recorded in {selectedMonth}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <BudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        categoryToEdit={selectedCategoryForEdit}
      />
      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
      />
    </div>
  );
};
export default DashboardPage;
