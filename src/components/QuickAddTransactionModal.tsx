import React, { useState } from 'react';
import { X, ArrowDownRight, ArrowUpRight, Check, Calendar, Tag, CreditCard } from 'lucide-react';

interface QuickAddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddExpense: (data: any) => Promise<void>;
  onAddIncome: (data: any) => Promise<void>;
  currency: string;
}

export const QuickAddTransactionModal: React.FC<QuickAddTransactionModalProps> = ({
  isOpen,
  onClose,
  onAddExpense,
  onAddIncome,
  currency,
}) => {
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const expenseCategories = ['Food', 'Travel', 'Shopping', 'Bills', 'Office', 'Entertainment', 'Health', 'Other'];
  const incomeCategories = ['Salary', 'Freelance', 'Client Payment', 'Investment', 'Business', 'Bonus', 'Other'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;

    setLoading(true);
    try {
      if (type === 'expense') {
        await onAddExpense({
          amount: parseFloat(amount),
          category,
          description: description || category,
          payment_method: paymentMethod,
          date,
        });
      } else {
        await onAddIncome({
          amount: parseFloat(amount),
          source: description || category,
          category,
          payment_method: paymentMethod,
          date,
        });
      }
      setAmount('');
      setDescription('');
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/40 backdrop-blur-md animate-fade-in">
      <div
        className="w-full max-w-md bg-white rounded-t-[36px] sm:rounded-[36px] p-6 shadow-2xl border border-slate-100 animate-slide-up space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight">New Transaction</h3>
            <p className="text-xs text-slate-400 font-medium">Quick entry for your balance</p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors btn-press"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Type Toggle: Expense vs Income */}
        <div className="grid grid-cols-2 p-1 bg-slate-100/80 rounded-2xl gap-1">
          <button
            type="button"
            onClick={() => {
              setType('expense');
              setCategory('Food');
            }}
            className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              type === 'expense'
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/25'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ArrowDownRight className="w-4 h-4" />
            <span>Expense</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setType('income');
              setCategory('Freelance');
            }}
            className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              type === 'income'
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Income</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount Input */}
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-400">
              {currency === 'INR' ? '₹' : currency}
            </span>
            <input
              type="number"
              step="any"
              autoFocus
              required
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-2xl font-black text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Description / Title
            </label>
            <input
              type="text"
              placeholder={type === 'expense' ? 'e.g. Netflix, Grocery, Taxi' : 'e.g. Freelance, Client Project'}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Category Chips */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Category
            </label>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto py-1">
              {(type === 'expense' ? expenseCategories : incomeCategories).map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    category === cat
                      ? type === 'expense'
                        ? 'bg-rose-50 border-rose-300 text-rose-600 shadow-xs'
                        : 'bg-emerald-50 border-emerald-300 text-emerald-600 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Date & Payment Method */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none"
              >
                <option value="UPI">UPI / GPay</option>
                <option value="Cash">Cash</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Debit Card">Debit Card</option>
                <option value="Bank Transfer">Bank Transfer</option>
              </select>
            </div>
          </div>

          {/* Save Button */}
          <button
            type="submit"
            disabled={loading || !amount}
            className={`w-full py-3.5 rounded-2xl text-white font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2 btn-press ${
              type === 'expense'
                ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/30'
                : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <Check className="w-5 h-5 stroke-[2.5]" />
            <span>{loading ? 'Adding...' : `Save ${type === 'expense' ? 'Expense' : 'Income'}`}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
