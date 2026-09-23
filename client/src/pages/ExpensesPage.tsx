import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, ArrowUpDown, Edit2, Trash2, Receipt } from 'lucide-react';
import { useBudget } from '../context/BudgetContext';
import ExpenseModal from '../components/ExpenseModal';
import { api } from '../api/client';

export const ExpensesPage: React.FC = () => {
  const { selectedMonth, categories, refreshData } = useBudget();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState<any | null>(null);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const data = await api.getExpenses({
        month: selectedMonth,
        categoryId: selectedCategory,
        search,
        sortBy,
        sortOrder,
      });
      setExpenses(data);
    } catch (err) {
      console.error('Failed to load expenses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [selectedMonth, selectedCategory, search, sortBy, sortOrder]);

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Delete expense "${title}"?`)) return;
    try {
      await api.deleteExpense(id);
      await refreshData();
      fetchExpenses();
    } catch (err) {
      console.error('Failed to delete expense:', err);
    }
  };

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const totalExpenseAmount = expenses.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header & Total */}
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
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Recorded Expense Entries</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-subtle)' }}>
            Showing {expenses.length} transactions for {selectedMonth}. Total: <span className="mono-num" style={{ color: '#f87171', fontWeight: 700 }}>₹{totalExpenseAmount.toLocaleString('en-IN')}</span>
          </p>
        </div>

        <button
          onClick={() => {
            setExpenseToEdit(null);
            setIsModalOpen(true);
          }}
          className="btn btn-primary"
        >
          <Plus size={16} />
          Record New Expense
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="glass-card"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          padding: '1.25rem',
        }}
      >
        {/* Search */}
        <div style={{ position: 'relative' }}>
          <Search
            size={16}
            color="var(--text-subtle)"
            style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            className="form-control"
            placeholder="Search by title or memo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '2.25rem' }}
          />
        </div>

        {/* Category Filter */}
        <div style={{ position: 'relative' }}>
          <select
            className="form-control"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Controls */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => toggleSort('date')}
            className={`btn btn-secondary ${sortBy === 'date' ? 'btn-primary' : ''}`}
            style={{ flex: 1, fontSize: '0.8rem' }}
          >
            <ArrowUpDown size={14} />
            Date {sortBy === 'date' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
          </button>
          <button
            onClick={() => toggleSort('amount')}
            className={`btn btn-secondary ${sortBy === 'amount' ? 'btn-primary' : ''}`}
            style={{ flex: 1, fontSize: '0.8rem' }}
          >
            <ArrowUpDown size={14} />
            Amount {sortBy === 'amount' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
          </button>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="data-table-container" style={{ border: 'none' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Title / Notes</th>
                <th>Category</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.length > 0 ? (
                expenses.map((exp) => (
                  <tr key={exp.id}>
                    <td style={{ color: 'var(--text-subtle)', fontSize: '0.85rem', width: '130px' }}>
                      {new Date(exp.date).toISOString().split('T')[0]}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{exp.title}</div>
                      {exp.description && (
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', marginTop: '2px' }}>
                          {exp.description}
                        </div>
                      )}
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: '0.78rem',
                          padding: '0.2rem 0.55rem',
                          borderRadius: '9999px',
                          background: 'rgba(255, 255, 255, 0.06)',
                          border: '1px solid var(--border-subtle)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                        }}
                      >
                        <span
                          style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: exp.category.color || '#6366f1',
                          }}
                        />
                        {exp.category.name}
                      </span>
                    </td>
                    <td
                      className="mono-num"
                      style={{
                        textAlign: 'right',
                        fontWeight: 700,
                        fontSize: '0.95rem',
                        color: '#f87171',
                      }}
                    >
                      ₹{exp.amount.toLocaleString('en-IN')}
                    </td>
                    <td style={{ textAlign: 'right', width: '120px' }}>
                      <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                        <button
                          onClick={() => {
                            setExpenseToEdit(exp);
                            setIsModalOpen(true);
                          }}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.3rem 0.5rem' }}
                          title="Edit"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(exp.id, exp.title)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.3rem 0.5rem', color: 'var(--status-over)' }}
                          title="Delete"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-subtle)' }}>
                    No expenses matching current filter in {selectedMonth}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ExpenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        expenseToEdit={expenseToEdit}
        onSuccess={fetchExpenses}
      />
    </div>
  );
};
export default ExpensesPage;
