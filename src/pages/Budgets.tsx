import React, { useState } from 'react';
import { Plus, PieChart, Edit2, Trash2, Home, ShoppingBag, Car, Plane, Coffee, Briefcase, Film, HeartPulse, Wrench, FileText, Sparkles, CheckCircle2 } from 'lucide-react';
import { Budget, Expense } from '../types/database';
import { formatCurrency } from '../utils/formatters';

interface BudgetsProps {
  budgets: Budget[];
  expenses: Expense[];
  currency: string;
  onAdd: (budget: Omit<Budget, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onUpdate: (id: string, updates: Partial<Budget>) => Promise<void>;
  onDelete: (id: string) => void | Promise<void>;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'Housing & Rent': <Home className="w-5 h-5 text-rose-500" />,
  'Software': <Film className="w-5 h-5 text-indigo-500" />,
  'Food': <Coffee className="w-5 h-5 text-amber-500" />,
  'Dining & Groceries': <Coffee className="w-5 h-5 text-amber-500" />,
  'Travel': <Plane className="w-5 h-5 text-sky-500" />,
  'Transport & Fuel': <Car className="w-5 h-5 text-emerald-500" />,
  'Fuel': <Car className="w-5 h-5 text-emerald-500" />,
  'Office': <Briefcase className="w-5 h-5 text-purple-500" />,
  'Advertising': <Sparkles className="w-5 h-5 text-pink-500" />,
  'Equipment': <Wrench className="w-5 h-5 text-orange-500" />,
  'Other': <ShoppingBag className="w-5 h-5 text-slate-500" />,
};

const CATEGORIES = [
  'Housing & Rent',
  'Software',
  'Dining & Groceries',
  'Transport & Fuel',
  'Travel',
  'Office',
  'Advertising',
  'Equipment',
  'Food',
  'Fuel',
  'Other',
];

export const Budgets: React.FC<BudgetsProps> = ({
  budgets,
  expenses,
  currency,
  onAdd,
  onUpdate,
  onDelete,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  const [category, setCategory] = useState(CATEGORIES[0]);
  const [budgetAmount, setBudgetAmount] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);

  // Calculate spent amounts for each budget category
  const spentByCategory: Record<string, number> = {};
  expenses.forEach((e) => {
    spentByCategory[e.category] = (spentByCategory[e.category] || 0) + Number(e.amount);
  });

  const handleOpenAddModal = () => {
    setEditingBudget(null);
    setCategory(CATEGORIES[0]);
    setBudgetAmount('');
    setStartDate('');
    setEndDate('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (b: Budget) => {
    setEditingBudget(b);
    setCategory(b.category);
    setBudgetAmount(b.budget_amount.toString());
    setStartDate(b.start_date || '');
    setEndDate(b.end_date || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!budgetAmount || parseFloat(budgetAmount) <= 0) return;

    setLoading(true);
    try {
      if (editingBudget) {
        await onUpdate(editingBudget.id, {
          category,
          budget_amount: parseFloat(budgetAmount),
          start_date: startDate || null,
          end_date: endDate || null,
        });
      } else {
        await onAdd({
          category,
          budget_amount: parseFloat(budgetAmount),
          start_date: startDate || null,
          end_date: endDate || null,
        });
      }
      setIsModalOpen(false);
    } finally {
      setLoading(false);
    }
  };

  // Default display demo budgets if none are created yet to showcase Screen 6 layout perfectly
  const displayBudgets = budgets.length > 0 ? budgets : [
    {
      id: 'demo-1',
      user_id: 'demo',
      category: 'Housing & Rent',
      budget_amount: 1500,
      start_date: null,
      end_date: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'demo-2',
      user_id: 'demo',
      category: 'Software Subscriptions',
      budget_amount: 350,
      start_date: null,
      end_date: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'demo-3',
      user_id: 'demo',
      category: 'Dining & Groceries',
      budget_amount: 600,
      start_date: null,
      end_date: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'demo-4',
      user_id: 'demo',
      category: 'Transport & Fuel',
      budget_amount: 400,
      start_date: null,
      end_date: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  const isDemo = budgets.length === 0;

  return (
    <div className="space-y-4 pb-28">
      {/* Category Budget Cards */}
      <div className="space-y-3">
        {displayBudgets.map((b, idx) => {
          const spent = isDemo
            ? idx === 0
              ? 1450
              : idx === 1
              ? 290
              : idx === 2
              ? 250
              : 120
            : spentByCategory[b.category] || 0;

          const percentage = b.budget_amount > 0 ? Math.min(100, Math.round((spent / b.budget_amount) * 100)) : 0;
          const remaining = Math.max(0, b.budget_amount - spent);

          // Badge & bar colors based on percentage
          const isHigh = percentage >= 90;
          const isMed = percentage >= 70 && percentage < 90;

          const badgeBg = isHigh
            ? 'bg-rose-50 text-rose-600 border border-rose-100'
            : isMed
            ? 'bg-amber-50 text-amber-600 border border-amber-100'
            : 'bg-emerald-50 text-emerald-600 border border-emerald-100';

          const barColor = isHigh
            ? 'bg-gradient-to-r from-rose-500 to-red-500'
            : isMed
            ? 'bg-gradient-to-r from-amber-400 to-orange-500'
            : 'bg-gradient-to-r from-teal-400 to-emerald-500';

          const icon = CATEGORY_ICONS[b.category] || <ShoppingBag className="w-5 h-5 text-indigo-500" />;

          return (
            <div
              key={b.id}
              className={`bg-white rounded-3xl p-5 shadow-[0_4px_25px_rgba(0,0,0,0.03)] border border-slate-100 space-y-3 transition-all hover:shadow-md stagger-${Math.min(8, idx + 1)}`}
            >
              {/* Header row: Icon + Category + Percent badge */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                    {icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{b.category}</h3>
                    <p className="text-xs text-slate-400 font-medium">Monthly budget limit</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-black ${badgeBg}`}>
                    {percentage}%
                  </span>
                  {!isDemo && (
                    <div className="flex items-center">
                      <button
                        onClick={() => handleOpenEditModal(b as Budget)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg btn-press"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDelete(b.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg btn-press"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5">
                <div
                  className={`h-full rounded-full progress-fill ${barColor}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>

              {/* Bottom Spent & Remaining */}
              <div className="flex items-center justify-between text-xs pt-0.5">
                <span className="font-bold text-slate-800">
                  {formatCurrency(spent, currency)}{' '}
                  <span className="font-normal text-slate-400">of {formatCurrency(Number(b.budget_amount), currency)}</span>
                </span>
                <span className={`font-semibold ${remaining === 0 ? 'text-rose-500' : 'text-slate-500'}`}>
                  {formatCurrency(remaining, currency)} remaining
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sticky Bottom Action Button */}
      <div className="fixed bottom-24 left-0 right-0 max-w-md mx-auto px-4 pointer-events-none z-30">
        <button
          onClick={handleOpenAddModal}
          className="pointer-events-auto w-full py-4 rounded-2xl bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500 hover:from-rose-600 hover:to-orange-600 text-white font-bold text-sm shadow-xl shadow-rose-500/25 flex items-center justify-center gap-2 fab-btn cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create Budget</span>
        </button>
      </div>

      {/* Add / Edit Budget Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              {editingBudget ? 'Edit Category Budget' : 'Create Category Budget'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">Set spending limits to monitor and optimize your expenses.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Budget Amount ({currency})</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={budgetAmount}
                  onChange={(e) => setBudgetAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Start Date (Optional)</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2.5 text-xs text-slate-700 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">End Date (Optional)</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2.5 text-xs text-slate-700 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-sm font-semibold text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 text-sm font-bold rounded-2xl bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-lg shadow-rose-500/25 transition-all"
                >
                  {loading ? 'Saving...' : editingBudget ? 'Update Budget' : 'Save Budget'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
