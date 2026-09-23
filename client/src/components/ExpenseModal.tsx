import React, { useState, useEffect } from 'react';
import { X, Check, Trash2 } from 'lucide-react';
import { api } from '../api/client';
import { useBudget } from '../context/BudgetContext';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  expenseToEdit?: any | null;
  onSuccess?: () => void;
}

export const ExpenseModal: React.FC<ExpenseModalProps> = ({
  isOpen,
  onClose,
  expenseToEdit,
  onSuccess,
}) => {
  const { selectedMonth, categories, refreshData } = useBudget();
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (expenseToEdit) {
      setTitle(expenseToEdit.title);
      setAmount(String(expenseToEdit.amount));
      setCategoryId(expenseToEdit.categoryId);
      setDate(new Date(expenseToEdit.date).toISOString().split('T')[0]);
      setDescription(expenseToEdit.description || '');
    } else {
      setTitle('');
      setAmount('');
      setCategoryId(categories[0]?.id || '');
      // Set to selectedMonth mid-point or today
      const now = new Date();
      const currentMonthStr = now.toISOString().slice(0, 7);
      if (selectedMonth === currentMonthStr) {
        setDate(now.toISOString().split('T')[0]);
      } else {
        setDate(`${selectedMonth}-15`);
      }
      setDescription('');
    }
    setError(null);
  }, [expenseToEdit, categories, selectedMonth, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount || !categoryId || !date) {
      setError('Title, amount, category, and date are required.');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Amount must be greater than zero.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      if (expenseToEdit) {
        await api.updateExpense(expenseToEdit.id, {
          title,
          amount: numAmount,
          categoryId,
          date,
          description,
        });
      } else {
        await api.createExpense({
          title,
          amount: numAmount,
          categoryId,
          date,
          description,
        });
      }
      await refreshData();
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save expense.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!expenseToEdit) return;
    if (!window.confirm(`Delete expense "${expenseToEdit.title}"?`)) return;

    setLoading(true);
    try {
      await api.deleteExpense(expenseToEdit.id);
      await refreshData();
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to delete expense.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
            {expenseToEdit ? 'Edit Expense Transaction' : 'Record New Expense'}
          </h3>
          <button onClick={onClose} className="btn btn-secondary btn-sm" style={{ padding: '0.35rem 0.5rem' }}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div
                style={{
                  background: 'var(--status-over-bg)',
                  border: '1px solid var(--status-over-border)',
                  color: '#fca5a5',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '1rem',
                  fontSize: '0.85rem',
                }}
              >
                {error}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Expense Title</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Supermarket Grocery Run"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Amount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  className="form-control mono-num"
                  placeholder="e.g. 1500"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  className="form-control"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Transaction Date</label>
              <input
                type="date"
                className="form-control"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description / Notes (Optional)</label>
              <textarea
                className="form-control"
                rows={2}
                placeholder="Additional memo or details..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            {expenseToEdit && (
              <button
                type="button"
                onClick={handleDelete}
                className="btn btn-outline-danger btn-sm"
                disabled={loading}
                style={{ marginRight: 'auto' }}
              >
                <Trash2 size={15} />
                Delete
              </button>
            )}
            <button type="button" onClick={onClose} className="btn btn-secondary" disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <Check size={16} />
              {expenseToEdit ? 'Update Expense' : 'Save Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default ExpenseModal;
