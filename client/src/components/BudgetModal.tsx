import React, { useState, useEffect } from 'react';
import { X, Check, Trash2 } from 'lucide-react';
import { api } from '../api/client';
import { useBudget, CategoryDetail } from '../context/BudgetContext';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryToEdit?: CategoryDetail | null;
}

export const BudgetModal: React.FC<BudgetModalProps> = ({
  isOpen,
  onClose,
  categoryToEdit,
}) => {
  const { selectedMonth, categories, refreshData } = useBudget();
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (categoryToEdit) {
      setCategoryId(categoryToEdit.categoryId);
      setAmount(String(categoryToEdit.budgetAmount));
    } else {
      setCategoryId(categories[0]?.id || '');
      setAmount('');
    }
    setError(null);
  }, [categoryToEdit, categories, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId || !amount) {
      setError('Please select a category and specify an amount.');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount < 0) {
      setError('Amount must be a positive number.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await api.upsertBudget({
        categoryId,
        month: selectedMonth,
        amount: numAmount,
      });
      await refreshData();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save budget.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!categoryToEdit?.budgetId) return;
    if (!window.confirm(`Are you sure you want to remove the budget for ${categoryToEdit.categoryName}?`)) return;

    setLoading(true);
    try {
      await api.deleteBudget(categoryToEdit.budgetId);
      await refreshData();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to delete budget.');
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
            {categoryToEdit ? `Edit ${categoryToEdit.categoryName} Budget` : 'Set Monthly Budget'}
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
              <label className="form-label">Month</label>
              <input
                type="text"
                className="form-control"
                value={selectedMonth}
                disabled
                style={{ opacity: 0.8 }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-control"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                disabled={!!categoryToEdit}
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Monthly Spending Limit (₹)</label>
              <input
                type="number"
                step="100"
                min="0"
                className="form-control mono-num"
                placeholder="e.g. 8000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="modal-footer">
            {categoryToEdit?.budgetId && (
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
              Save Budget
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default BudgetModal;
