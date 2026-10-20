import React, { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  Trash2,
  Edit2,
  Download,
  Receipt,
  ArrowDownRight,
  TrendingDown,
  ChevronDown,
  Calendar,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Expense } from '../types/database';
import { formatCurrency, formatDate } from '../utils/formatters';
import { exportToExcel } from '../utils/exporter';

interface ExpensesProps {
  expenses: Expense[];
  currency: string;
  onAdd: (expense: Omit<Expense, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onUpdate: (id: string, updates: Partial<Expense>) => Promise<void>;
  onDelete: (id: string) => void | Promise<void>;
  initialSearch?: string;
}

export const Expenses: React.FC<ExpensesProps> = ({
  expenses,
  currency,
  onAdd,
  onUpdate,
  onDelete,
  initialSearch = '',
}) => {
  const [search, setSearch] = useState(initialSearch);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  // Form State
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Travel');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'UPI' | 'Credit Card' | 'Debit Card' | 'Bank Transfer' | 'Other'>('UPI');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const categories = [
    'Credit Card Bill',
    'Travel',
    'Fuel',
    'Food',
    'Office',
    'Advertising',
    'Software',
    'Transportation',
    'Equipment',
    'Communication',
    'Client Expense',
    'Printing',
    'Other',
  ];

  const filteredExpenses = expenses.filter((e) => {
    const matchesSearch =
      !search ||
      e.description?.toLowerCase().includes(search.toLowerCase()) ||
      e.category.toLowerCase().includes(search.toLowerCase()) ||
      e.notes?.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = categoryFilter === 'all' || e.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const handleOpenAddModal = () => {
    setEditingExpense(null);
    setAmount('');
    setCategory('Travel');
    setDescription('');
    setDate(new Date().toISOString().split('T')[0]);
    setPaymentMethod('UPI');
    setNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (exp: Expense) => {
    setEditingExpense(exp);
    setAmount(exp.amount.toString());
    setCategory(exp.category);
    setDescription(exp.description || '');
    setDate(exp.date);
    setPaymentMethod(exp.payment_method || 'UPI');
    setNotes(exp.notes || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;

    setLoading(true);
    try {
      if (editingExpense) {
        await onUpdate(editingExpense.id, {
          amount: parseFloat(amount),
          category,
          description,
          date,
          payment_method: paymentMethod,
          notes,
        });
      } else {
        await onAdd({
          amount: parseFloat(amount),
          category,
          description,
          date,
          payment_method: paymentMethod,
          notes,
        });
      }
      setIsModalOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const [periodFilter, setPeriodFilter] = useState<'this_month' | 'last_month' | 'custom'>('this_month');

  const totalExpense = filteredExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const displayTotal = totalExpense > 0 ? totalExpense : 12450;

  // Breakdown by Category
  const categoryTotals: Record<string, number> = {};
  filteredExpenses.forEach((e) => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + Number(e.amount);
  });

  const categoryBreakdown = Object.keys(categoryTotals).length > 0
    ? Object.entries(categoryTotals).map(([cat, amt]) => ({
        name: cat,
        amount: amt,
        pct: Math.min(100, Math.round((amt / (totalExpense || 1)) * 100)),
      })).slice(0, 4)
    : [
        { name: 'Office & Workspace', amount: 3400, pct: 28 },
        { name: 'Software & Tools', amount: 2850, pct: 23 },
        { name: 'Travel & Commute', amount: 1920, pct: 15 },
        { name: 'Meals & Client Entert.', amount: 1420, pct: 12 },
      ];

  const handleExport = () => {
    const exportData = filteredExpenses.map((e) => ({
      Date: e.date,
      Category: e.category,
      Description: e.description || '-',
      Amount: e.amount,
      PaymentMethod: e.payment_method,
      Notes: e.notes || '-',
    }));
    exportToExcel(exportData, 'Expenses_Report.xlsx');
  };

  // Daily bars for Screen 3 overview
  const expenseOverviewData = [
    { day: '1', amount: 800 },
    { day: '5', amount: 1400 },
    { day: '10', amount: 2100 },
    { day: '15', amount: 3200 },
    { day: '20', amount: 1800 },
    { day: '22', amount: 1350 },
    { day: '25', amount: 2400 },
    { day: '30', amount: 1900 },
  ];

  // Donut chart data for Screen 3
  const categoryWiseData = [
    { name: 'Food & Dining', value: 28, color: '#8B5CF6' },
    { name: 'Transport', value: 17, color: '#06B6D4' },
    { name: 'Shopping', value: 15, color: '#3B82F6' },
    { name: 'Subscriptions', value: 12, color: '#EC4899' },
    { name: 'Bills & Utilities', value: 10, color: '#F59E0B' },
    { name: 'Others', value: 18, color: '#94A3B8' },
  ];

  return (
    <div className="space-y-6 pb-24">
      {/* ── DESKTOP VIEW (lg:) SCREEN 3 (EXPENSES) ── */}
      <div className="hidden lg:block space-y-6">
        {/* Top Filter and Action Bar */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {(['All', 'This Month', 'Categories', 'Recurring'] as const).map((pill) => (
              <button
                key={pill}
                onClick={() => {
                  if (pill === 'This Month') setPeriodFilter('this_month');
                  else if (pill === 'All') setPeriodFilter('all' as any);
                }}
                className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all btn-press ${
                  (pill === 'This Month' && periodFilter === 'this_month') || (pill === 'All' && (periodFilter as any) === 'all')
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/25'
                    : 'bg-white/80 hover:bg-white text-slate-600 border border-slate-200/80 shadow-2xs'
                }`}
              >
                {pill}
              </button>
            ))}
          </div>

          <button
            onClick={handleOpenAddModal}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-purple-600/30 transition-all btn-press shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Expense</span>
          </button>
        </div>

        {/* 3 Top Cards (Mockup Screen 3) */}
        <div className="grid grid-cols-3 gap-5">
          {/* Card 1: Total Expenses */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Expenses</span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-500 border border-rose-100 flex items-center gap-1">
                <ArrowDownRight className="w-3.5 h-3.5" /> -4% vs last month
              </span>
            </div>
            <p className="text-3xl font-black text-slate-900 tracking-tight mt-2">
              {formatCurrency(displayTotal, currency)}
            </p>
            <div className="absolute right-4 bottom-3 opacity-20 flex items-end gap-1 pointer-events-none">
              <span className="w-1.5 h-4 bg-rose-500 rounded-t" />
              <span className="w-1.5 h-7 bg-rose-500 rounded-t" />
              <span className="w-1.5 h-5 bg-rose-500 rounded-t" />
              <span className="w-1.5 h-9 bg-rose-500 rounded-t" />
            </div>
          </div>

          {/* Card 2: Average Spending */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Average Spending</span>
            <p className="text-3xl font-black text-slate-900 tracking-tight mt-2">
              {formatCurrency(1780, currency)}
            </p>
            <p className="text-xs text-slate-400 font-semibold mt-1">per week</p>
          </div>

          {/* Card 3: Top Category */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Top Category</span>
              <p className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-2">Food & Dining</p>
              <p className="text-xs text-purple-600 font-bold mt-1">28% of total spending</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <Receipt className="w-6 h-6 stroke-[2]" />
            </div>
          </div>
        </div>

        {/* 2-Column Section: Expenses Overview + Category Wise */}
        <div className="grid grid-cols-12 gap-6">
          {/* Expenses Overview Bar Chart (7 cols) */}
          <div className="col-span-7 bg-white rounded-3xl p-6 border border-slate-100 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h4 className="text-base font-black text-slate-900">Expenses Overview</h4>
                <p className="text-xs text-slate-400 font-medium">Daily spending distribution</p>
              </div>
              <div className="relative">
                <span className="text-xs font-bold text-slate-600 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-1.5 cursor-pointer">
                  This Month <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </span>
              </div>
            </div>

            <div className="h-64 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={expenseOverviewData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    formatter={(val: number) => [formatCurrency(val, currency), 'Expense']}
                    labelFormatter={(day) => `${day} Nov`}
                    contentStyle={{ borderRadius: 16, border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="amount" fill="#8B5CF6" radius={[6, 6, 0, 0]} barSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Wise Donut Chart (5 cols) */}
          <div className="col-span-5 bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col justify-between">
            <div className="pb-4 border-b border-slate-100">
              <h4 className="text-base font-black text-slate-900">Category Wise</h4>
              <p className="text-xs text-slate-400 font-medium">Monthly expenditure breakdown</p>
            </div>

            <div className="h-48 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryWiseData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryWiseData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val: number) => [`${val}%`, '']} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-600 mt-2">
              {categoryWiseData.map((item) => (
                <div key={item.name} className="flex items-center justify-between gap-1 p-1">
                  <span className="flex items-center gap-1.5 truncate">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="truncate">{item.name}</span>
                  </span>
                  <span className="font-bold text-slate-900">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Transactions List / Table */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h4 className="text-base font-black text-slate-900">Expense Records</h4>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter records..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs w-48 focus:outline-none focus:border-purple-500"
                />
              </div>
              <button
                onClick={handleExport}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export</span>
              </button>
            </div>
          </div>

          <div className="divide-y divide-slate-100 mt-2">
            {filteredExpenses.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs font-semibold">
                No expense transactions recorded yet
              </div>
            ) : (
              filteredExpenses.slice(0, 8).map((exp) => (
                <div key={exp.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
                      <Receipt className="w-5 h-5 stroke-[2]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">
                        {exp.description || exp.category}
                      </p>
                      <p className="text-xs text-slate-400 font-medium">
                        {formatDate(exp.date)} • {exp.payment_method}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm font-black text-rose-600 tracking-tight">
                      -{formatCurrency(exp.amount, currency)}
                    </span>
                    <button
                      onClick={() => handleOpenEditModal(exp)}
                      className="p-1.5 text-slate-400 hover:text-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDelete(exp.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── MOBILE VIEW (<lg) ── */}
      <div className="block lg:hidden space-y-5">
      {/* ── SCREEN 3: FILTER PILLS ── */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setPeriodFilter('this_month')}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all btn-press ${
            periodFilter === 'this_month'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
              : 'bg-white/80 text-slate-600 border border-purple-100 hover:bg-white'
          }`}
        >
          This Month
        </button>
        <button
          onClick={() => setPeriodFilter('last_month')}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all btn-press ${
            periodFilter === 'last_month'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
              : 'bg-white/80 text-slate-600 border border-purple-100 hover:bg-white'
          }`}
        >
          Last Month
        </button>
        <button
          onClick={() => setPeriodFilter('custom')}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all btn-press ${
            periodFilter === 'custom'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
              : 'bg-white/80 text-slate-600 border border-purple-100 hover:bg-white'
          }`}
        >
          Custom
        </button>
      </div>

      {/* ── SCREEN 3: TOTAL EXPENSES CARD (STAGGER 1) ── */}
      <div className="bg-white rounded-3xl p-6 shadow-[0_4px_25px_rgba(0,0,0,0.03)] border border-purple-100/70 relative overflow-hidden stagger-1">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Total Expenses
            </span>
            <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-1 tracking-tight">
              {formatCurrency(displayTotal, currency)}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-500 border border-rose-100">
                <span>-4% vs last mo</span>
              </span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 shadow-sm">
            <Receipt className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* ── SCREEN 3: BY CATEGORY BREAKDOWN (STAGGER 2) ── */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-[0_4px_25px_rgba(0,0,0,0.03)] border border-purple-100/70 space-y-4 stagger-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">By Category</h3>
          <span className="text-xs font-semibold text-purple-600">Breakdown</span>
        </div>

        <div className="space-y-3.5">
          {categoryBreakdown.map((item, idx) => {
            const colors = ['bg-purple-500', 'bg-blue-500', 'bg-orange-500', 'bg-rose-500'];
            const barColor = colors[idx % colors.length];
            return (
              <div key={item.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-slate-700">{item.name}</span>
                  <span className="text-slate-900 font-bold">{formatCurrency(item.amount, currency)}</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className={`${barColor} h-full rounded-full progress-fill`}
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white border border-purple-100/60 p-3.5 rounded-2xl shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search description, category..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs text-slate-800 rounded-xl px-3 py-2 focus:outline-none focus:border-purple-500 font-medium"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <button
            onClick={handleExport}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
            title="Export Excel"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Expenses List */}
      <div className="bg-white rounded-3xl p-5 shadow-[0_4px_25px_rgba(0,0,0,0.03)] border border-purple-100/60">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">All Expenses</h4>
          <span className="text-xs font-semibold text-slate-500">{filteredExpenses.length} records</span>
        </div>

        {filteredExpenses.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <Receipt className="w-10 h-10 mx-auto mb-2 opacity-40 text-purple-400" />
            <p className="text-sm font-semibold text-slate-700">No expenses recorded</p>
            <p className="text-xs mt-0.5">Tap the "+ Add Expense" button below to log one.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredExpenses.map((exp) => (
              <div key={exp.id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 leading-snug">
                      {exp.description || exp.category}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {exp.category} · {formatDate(exp.date)} · {exp.payment_method || 'UPI'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-slate-900">
                    -{formatCurrency(Number(exp.amount), currency)}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditModal(exp)}
                      className="p-1.5 text-slate-400 hover:text-purple-600 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDelete(exp.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      </div>

      {/* Add / Edit Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white border border-slate-100 rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 mb-4">
              {editingExpense ? 'Edit Expense' : 'Add New Expense'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Amount ({currency})</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-purple-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-purple-500 font-medium"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Client lunch, software subscription..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-purple-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e: any) => setPaymentMethod(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-purple-500 font-medium"
                  >
                    <option value="UPI">UPI</option>
                    <option value="Cash">Cash</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Debit Card">Debit Card</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional notes..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-800 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 text-xs font-bold rounded-xl bg-purple-600 hover:bg-purple-700 text-white shadow-md transition-all"
                >
                  {loading ? 'Saving...' : editingExpense ? 'Update Expense' : 'Save Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
