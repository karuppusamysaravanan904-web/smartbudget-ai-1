import React from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { useBudget } from '../context/BudgetContext';

export const MonthSelector: React.FC = () => {
  const { selectedMonth, setSelectedMonth } = useBudget();

  const handlePrevMonth = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const date = new Date(year, month - 2, 1);
    const newMonthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    setSelectedMonth(newMonthStr);
  };

  const handleNextMonth = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const date = new Date(year, month, 1);
    const newMonthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    setSelectedMonth(newMonthStr);
  };

  const formatDisplayMonth = (mStr: string) => {
    const [year, month] = mStr.split('-').map(Number);
    const date = new Date(year, month - 1, 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          padding: '0.2rem',
        }}
      >
        <button
          onClick={handlePrevMonth}
          className="btn btn-secondary btn-sm"
          style={{ padding: '0.35rem 0.5rem', border: 'none', background: 'transparent' }}
          title="Previous Month"
        >
          <ChevronLeft size={16} />
        </button>

        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.35rem 0.75rem',
            fontWeight: 700,
            fontSize: '0.88rem',
            color: 'var(--text-main)',
            cursor: 'pointer',
          }}
        >
          <Calendar size={15} color="var(--primary)" />
          <span>{formatDisplayMonth(selectedMonth)}</span>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => e.target.value && setSelectedMonth(e.target.value)}
            style={{
              position: 'absolute',
              opacity: 0,
              width: 0,
              height: 0,
              pointerEvents: 'none',
            }}
          />
        </label>

        <button
          onClick={handleNextMonth}
          className="btn btn-secondary btn-sm"
          style={{ padding: '0.35rem 0.5rem', border: 'none', background: 'transparent' }}
          title="Next Month"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {selectedMonth !== '2026-09' && (
        <button
          onClick={() => setSelectedMonth('2026-09')}
          className="btn btn-secondary btn-sm"
          style={{
            fontSize: '0.75rem',
            padding: '0.35rem 0.65rem',
            border: '1px dashed rgba(99, 102, 241, 0.5)',
            color: 'var(--primary)',
          }}
        >
          Sep 2026 Demo
        </button>
      )}
    </div>
  );
};
export default MonthSelector;
