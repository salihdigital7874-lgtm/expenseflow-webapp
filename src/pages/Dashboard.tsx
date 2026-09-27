import React, { useState } from 'react';
import {
  Receipt,
  TrendingUp,
  Users,
  PieChart as PieChartIcon,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  CreditCard,
  Building2,
  CheckCircle2,
  X,
  Calendar as CalendarIcon,
  Filter,
  Layers,
  Clock,
  CalendarDays,
  RotateCcw,
} from 'lucide-react';
import { Expense, Income, Client, Budget } from '../types/database';
import { formatCurrency, formatDate } from '../utils/formatters';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from 'recharts';

interface DashboardProps {
  expenses: Expense[];
  income: Income[];
  clients: Client[];
  budgets: Budget[];
  currency: string;
  onNavigate: (tab: 'expenses' | 'income' | 'clients' | 'budgets') => void;
  onAddExpense?: (expense: Omit<Expense, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
}

const MONTH_OPTIONS = [
  { value: 'all', label: 'All Months' },
  { value: '01', label: 'January' },
  { value: '02', label: 'February' },
  { value: '03', label: 'March' },
  { value: '04', label: 'April' },
  { value: '05', label: 'May' },
  { value: '06', label: 'June' },
  { value: '07', label: 'July' },
  { value: '08', label: 'August' },
  { value: '09', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
];

export const Dashboard: React.FC<DashboardProps> = ({
  expenses,
  income,
  clients,
  budgets,
  currency,
  onNavigate,
  onAddExpense,
}) => {
  // Pay Credit Card Bill Modal state
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState<'UPI' | 'Cash' | 'Bank Transfer' | 'Debit Card' | 'Other'>('UPI');
  const [payDate, setPayDate] = useState(new Date().toISOString().split('T')[0]);
  const [payNotes, setPayNotes] = useState('Credit Card Bill Repayment');
  const [payLoading, setPayLoading] = useState(false);

  // Month & Date Filtering State
  const todayStr = new Date().toISOString().split('T')[0];
  const currentYearStr = new Date().getFullYear().toString();
  const currentMonthNumStr = (new Date().getMonth() + 1).toString().padStart(2, '0');

  type FilterMode = 'month' | 'date' | 'range' | 'all';
  const [filterMode, setFilterMode] = useState<FilterMode>('month');
  const [selectedYear, setSelectedYear] = useState<string>(currentYearStr);
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthNumStr); // Default to current month
  const [selectedSingleDate, setSelectedSingleDate] = useState<string>(todayStr);
  const [startDate, setStartDate] = useState<string>(`${currentYearStr}-${currentMonthNumStr}-01`);
  const [endDate, setEndDate] = useState<string>(todayStr);

  // Quick Preset Actions
  const handleSelectThisMonth = () => {
    setFilterMode('month');
    setSelectedYear(currentYearStr);
    setSelectedMonth(currentMonthNumStr);
  };

  const handleSelectLastMonth = () => {
    const now = new Date();
    const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    setFilterMode('month');
    setSelectedYear(lm.getFullYear().toString());
    setSelectedMonth((lm.getMonth() + 1).toString().padStart(2, '0'));
  };

  const handleSelectToday = () => {
    setFilterMode('date');
    setSelectedSingleDate(todayStr);
  };

  const handleResetFilter = () => {
    setFilterMode('all');
    setSelectedMonth('all');
  };

  // Dataset Filtering
  const filteredExpenses = expenses.filter((e) => {
    if (filterMode === 'all') return true;
    if (filterMode === 'month') {
      if (selectedMonth === 'all') return e.date.startsWith(selectedYear);
      return e.date.startsWith(`${selectedYear}-${selectedMonth}`);
    }
    if (filterMode === 'date') {
      return e.date === selectedSingleDate;
    }
    if (filterMode === 'range') {
      if (!startDate && !endDate) return true;
      if (startDate && !endDate) return e.date >= startDate;
      if (!startDate && endDate) return e.date <= endDate;
      return e.date >= startDate && e.date <= endDate;
    }
    return true;
  });

  const filteredIncome = income.filter((i) => {
    if (filterMode === 'all') return true;
    if (filterMode === 'month') {
      if (selectedMonth === 'all') return i.date.startsWith(selectedYear);
      return i.date.startsWith(`${selectedYear}-${selectedMonth}`);
    }
    if (filterMode === 'date') {
      return i.date === selectedSingleDate;
    }
    if (filterMode === 'range') {
      if (!startDate && !endDate) return true;
      if (startDate && !endDate) return i.date >= startDate;
      if (!startDate && endDate) return i.date <= endDate;
      return i.date >= startDate && i.date <= endDate;
    }
    return true;
  });

  // Active Filter Human Readable Label
  const getFilterLabel = () => {
    if (filterMode === 'all') return 'All Time Records';
    if (filterMode === 'month') {
      const monthObj = MONTH_OPTIONS.find((m) => m.value === selectedMonth);
      return selectedMonth === 'all'
        ? `Entire Year ${selectedYear}`
        : `${monthObj?.label || selectedMonth} ${selectedYear}`;
    }
    if (filterMode === 'date') {
      return `Date: ${formatDate(selectedSingleDate)}`;
    }
    if (filterMode === 'range') {
      return `Range: ${formatDate(startDate)} to ${formatDate(endDate)}`;
    }
    return 'Custom Filter';
  };

  // Calculated Metrics from filtered Records
  const totalExpenses = filteredExpenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const totalIncoming = filteredIncome.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const totalClientBalance = clients.reduce((sum, item) => sum + Number(item.balance_amount || 0), 0);
  const totalBudget = budgets.reduce((sum, item) => sum + Number(item.budget_amount || 0), 0);

  // Credit Card Outstanding Calculation (Period-based vs Lifetime)
  const totalCreditCardSpent = filteredExpenses
    .filter(
      (e) =>
        e.payment_method === 'Credit Card' &&
        e.category !== 'Credit Card Bill' &&
        e.category !== 'Credit Card Payment' &&
        e.category !== 'Credit Card Repayment'
    )
    .reduce((sum, e) => sum + Number(e.amount || 0), 0);

  const totalCreditCardPaid = filteredExpenses
    .filter(
      (e) =>
        e.category === 'Credit Card Bill' ||
        e.category === 'Credit Card Payment' ||
        e.category === 'Credit Card Repayment' ||
        e.description?.toLowerCase().includes('credit card bill') ||
        e.description?.toLowerCase().includes('credit card payment')
    )
    .reduce((sum, e) => sum + Number(e.amount || 0), 0);

  const creditCardOutstanding = Math.max(0, totalCreditCardSpent - totalCreditCardPaid);

  const handlePayBillSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payAmount || parseFloat(payAmount) <= 0) return;

    setPayLoading(true);
    try {
      if (onAddExpense) {
        await onAddExpense({
          amount: parseFloat(payAmount),
          category: 'Credit Card Bill',
          description: 'Credit Card Bill Payment',
          date: payDate,
          payment_method: payMethod,
          notes: payNotes,
        });
      } else {
        onNavigate('expenses');
      }
      setIsPayModalOpen(false);
    } catch (err) {
      console.error('Failed to submit credit card bill payment', err);
    } finally {
      setPayLoading(false);
    }
  };

  const upiSpent = filteredExpenses
    .filter((e) => e.payment_method === 'UPI')
    .reduce((sum, e) => sum + Number(e.amount || 0), 0);

  const cashSpent = filteredExpenses
    .filter((e) => e.payment_method === 'Cash')
    .reduce((sum, e) => sum + Number(e.amount || 0), 0);

  const budgetUsed = totalExpenses;
  const remainingBudget = Math.max(0, totalBudget - budgetUsed);
  const budgetPercentage = totalBudget > 0 ? Math.min(100, Math.round((budgetUsed / totalBudget) * 100)) : 0;

  // Chart data: Category Break-down for Expenses
  const expensesByCategoryMap: Record<string, number> = {};
  filteredExpenses.forEach((item) => {
    expensesByCategoryMap[item.category] = (expensesByCategoryMap[item.category] || 0) + Number(item.amount);
  });

  const categoryChartData = Object.keys(expensesByCategoryMap).map((cat) => ({
    name: cat,
    value: expensesByCategoryMap[cat],
  }));

  // Chart data: Payment Method Breakdown
  const paymentMethodMap: Record<string, number> = {};
  filteredExpenses.forEach((item) => {
    const method = item.payment_method || 'Other';
    paymentMethodMap[method] = (paymentMethodMap[method] || 0) + Number(item.amount);
  });

  const paymentMethodChartData = Object.keys(paymentMethodMap).map((method) => ({
    name: method,
    value: paymentMethodMap[method],
  }));

  const CATEGORY_COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6', '#EC4899'];
  const PAYMENT_COLORS = ['#F59E0B', '#6366F1', '#10B981', '#3B82F6', '#8B5CF6', '#EF4444'];

  // Calculate Daily Spend Breakdown (Day 1 - Day 31) for Target Month/Year
  const targetYear = parseInt(selectedYear, 10) || new Date().getFullYear();
  const targetMonthNum =
    selectedMonth === 'all' || !selectedMonth
      ? new Date().getMonth() + 1
      : parseInt(selectedMonth, 10);
  const daysInTargetMonth = new Date(targetYear, targetMonthNum, 0).getDate();

  const dailyBreakdown: {
    day: number;
    dateStr: string;
    expense: number;
    income: number;
    categories: string[];
    itemsCount: number;
  }[] = [];

  for (let d = 1; d <= daysInTargetMonth; d++) {
    const dayPad = d.toString().padStart(2, '0');
    const monthPad = targetMonthNum.toString().padStart(2, '0');
    const fullDateKey = `${targetYear}-${monthPad}-${dayPad}`;

    const dayExps = filteredExpenses.filter((e) => e.date === fullDateKey);
    const dayIncs = filteredIncome.filter((i) => i.date === fullDateKey);

    const dayExpTotal = dayExps.reduce((s, e) => s + Number(e.amount || 0), 0);
    const dayIncTotal = dayIncs.reduce((s, i) => s + Number(i.amount || 0), 0);
    const cats = Array.from(new Set(dayExps.map((e) => e.category)));

    dailyBreakdown.push({
      day: d,
      dateStr: fullDateKey,
      expense: dayExpTotal,
      income: dayIncTotal,
      categories: cats,
      itemsCount: dayExps.length + dayIncs.length,
    });
  }

  // Combined Recent Transactions
  const recentTransactions = [
    ...filteredExpenses.map((e) => ({ ...e, type: 'expense' as const })),
    ...filteredIncome.map((i) => ({ ...i, type: 'income' as const, category: 'Income' })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-indigo-900/40 via-[#08090E] to-[#08090E] p-6 rounded-2xl border border-indigo-500/20">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Executive Dashboard</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Real-time financial summary & credit card bill tracking powered by Supabase PostgreSQL.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('expenses')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* Interactive Month & Date Filter Control Hub */}
      <div className="bg-[#08090E] border border-indigo-500/30 rounded-2xl p-5 space-y-4 shadow-xl relative overflow-hidden">
        {/* Top Header & Presets Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm font-bold text-white">Month & Date Selection Filter</h2>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30 flex items-center gap-1">
                  <Filter className="w-3 h-3 text-indigo-400" />
                  <span>{getFilterLabel()}</span>
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Select any Month, Specific Single Date, or Custom Date Range to filter metrics & daily transactions.
              </p>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={handleSelectThisMonth}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                filterMode === 'month' && selectedMonth === currentMonthNumStr && selectedYear === currentYearStr
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20'
                  : 'bg-[#0D0E16] text-zinc-400 border-white/10 hover:text-white hover:border-white/20'
              }`}
            >
              This Month
            </button>

            <button
              onClick={handleSelectLastMonth}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                filterMode === 'month' && selectedMonth !== currentMonthNumStr
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20'
                  : 'bg-[#0D0E16] text-zinc-400 border-white/10 hover:text-white hover:border-white/20'
              }`}
            >
              Last Month
            </button>

            <button
              onClick={handleSelectToday}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                filterMode === 'date' && selectedSingleDate === todayStr
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20'
                  : 'bg-[#0D0E16] text-zinc-400 border-white/10 hover:text-white hover:border-white/20'
              }`}
            >
              Today
            </button>

            <button
              onClick={handleResetFilter}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                filterMode === 'all'
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20'
                  : 'bg-[#0D0E16] text-zinc-400 border-white/10 hover:text-white hover:border-white/20'
              }`}
            >
              All Time
            </button>
          </div>
        </div>

        {/* Filter Selection Modes & Interactive Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Mode Selector Tabs */}
          <div className="md:col-span-5 flex items-center gap-1.5 bg-[#0D0E16] p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setFilterMode('month')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all text-center flex items-center justify-center gap-1.5 ${
                filterMode === 'month'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Month / Year</span>
            </button>

            <button
              onClick={() => setFilterMode('date')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all text-center flex items-center justify-center gap-1.5 ${
                filterMode === 'date'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Single Date</span>
            </button>

            <button
              onClick={() => setFilterMode('range')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all text-center flex items-center justify-center gap-1.5 ${
                filterMode === 'range'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Date Range</span>
            </button>
          </div>

          {/* Dynamic Input Control Fields */}
          <div className="md:col-span-7 flex flex-wrap items-center justify-end gap-3">
            {filterMode === 'month' && (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs text-zinc-400 font-medium">Select:</span>
                {/* Year Dropdown */}
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="bg-[#0D0E16] border border-white/10 text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500 font-semibold"
                >
                  <option value="2026">2026</option>
                  <option value="2025">2025</option>
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                </select>

                {/* Month Dropdown */}
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="bg-[#0D0E16] border border-indigo-500/40 text-xs text-indigo-300 font-bold rounded-xl px-3.5 py-2 focus:outline-none focus:border-indigo-500 shadow-md"
                >
                  {MONTH_OPTIONS.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {filterMode === 'date' && (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs text-zinc-400 font-medium">Pick Date:</span>
                <input
                  type="date"
                  value={selectedSingleDate}
                  onChange={(e) => setSelectedSingleDate(e.target.value)}
                  className="bg-[#0D0E16] border border-indigo-500/40 text-xs text-indigo-300 font-bold rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500 shadow-md"
                />
              </div>
            )}

            {filterMode === 'range' && (
              <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
                <span className="text-xs text-zinc-400 font-medium">From:</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-[#0D0E16] border border-white/10 text-xs text-white rounded-xl px-3 py-1.5 focus:outline-none focus:border-indigo-500 font-medium"
                />
                <span className="text-xs text-zinc-400 font-medium">To:</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-[#0D0E16] border border-white/10 text-xs text-white rounded-xl px-3 py-1.5 focus:outline-none focus:border-indigo-500 font-medium"
                />
              </div>
            )}

            {/* Clear / Reset Filter Button */}
            {filterMode !== 'all' && (
              <button
                onClick={handleResetFilter}
                className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white px-3 py-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-colors shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear Filter</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Summary Footer */}
        <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-2 border-t border-white/5">
          <div>
            Showing <strong className="text-white">{filteredExpenses.length}</strong> expenses and{' '}
            <strong className="text-white">{filteredIncome.length}</strong> income records for{' '}
            <span className="text-indigo-400 font-semibold">{getFilterLabel()}</span>.
          </div>
          <div>
            Period Net Outflow: <span className="text-rose-400 font-bold">{formatCurrency(totalExpenses, currency)}</span>
          </div>
        </div>
      </div>


      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        {/* Total Expenses */}
        <div className="bg-[#08090E] border border-white/10 rounded-2xl p-5 hover:border-indigo-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">Total Expenses</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-extrabold text-white mt-3">{formatCurrency(totalExpenses, currency)}</p>
          <span className="text-[11px] text-rose-400 flex items-center gap-1 mt-1 font-medium">
            <ArrowUpRight className="w-3 h-3" /> Outflow
          </span>
        </div>

        {/* Credit Card Outstanding Bill */}
        <div className="bg-[#08090E] border border-amber-500/30 bg-gradient-to-b from-amber-500/5 to-transparent rounded-2xl p-5 hover:border-amber-500/50 transition-all shadow-lg shadow-amber-500/5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-300">Credit Card Bill</span>
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>
            <p className="text-xl font-extrabold text-amber-400 mt-3">{formatCurrency(creditCardOutstanding, currency)}</p>
            <span className="text-[11px] text-amber-300/80 flex items-center gap-1 mt-1 font-medium">
              {creditCardOutstanding === 0 && totalCreditCardSpent > 0 ? (
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Paid in Full
                </span>
              ) : (
                `Spent: ${formatCurrency(totalCreditCardSpent, currency)} | Paid: ${formatCurrency(totalCreditCardPaid, currency)}`
              )}
            </span>
          </div>
          <button
            onClick={() => {
              setPayAmount(creditCardOutstanding > 0 ? creditCardOutstanding.toString() : '');
              setIsPayModalOpen(true);
            }}
            className="mt-3 w-full py-1.5 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-semibold text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{creditCardOutstanding > 0 ? 'Pay Bill' : 'Record Payment'}</span>
          </button>
        </div>

        {/* Total Incoming Amount */}
        <div className="bg-[#08090E] border border-white/10 rounded-2xl p-5 hover:border-indigo-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">Incoming Amount</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-extrabold text-white mt-3">{formatCurrency(totalIncoming, currency)}</p>
          <span className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1 font-medium">
            <ArrowDownRight className="w-3 h-3" /> Inflow
          </span>
        </div>

        {/* Total Client Balance */}
        <div className="bg-[#08090E] border border-white/10 rounded-2xl p-5 hover:border-indigo-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">Client Balance</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-extrabold text-white mt-3">{formatCurrency(totalClientBalance, currency)}</p>
          <span className="text-[11px] text-amber-400 mt-1 font-medium block">Outstanding receivables</span>
        </div>

        {/* Total Budget */}
        <div className="bg-[#08090E] border border-white/10 rounded-2xl p-5 hover:border-indigo-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">Total Budget</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <PieChartIcon className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-extrabold text-white mt-3">{formatCurrency(totalBudget, currency)}</p>
          <span className="text-[11px] text-zinc-400 mt-1 font-medium block">Allocated limit</span>
        </div>

        {/* Budget Used */}
        <div className="bg-[#08090E] border border-white/10 rounded-2xl p-5 hover:border-indigo-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">Budget Used</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-extrabold text-white mt-3">{formatCurrency(budgetUsed, currency)}</p>
          <span className="text-[11px] text-purple-400 mt-1 font-medium block">{budgetPercentage}% Utilized</span>
        </div>

        {/* Remaining Budget */}
        <div className="bg-[#08090E] border border-white/10 rounded-2xl p-5 hover:border-indigo-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">Remaining Budget</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <PieChartIcon className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-extrabold text-white mt-3">{formatCurrency(remainingBudget, currency)}</p>
          <span className="text-[11px] text-blue-400 mt-1 font-medium block">Available</span>
        </div>
      </div>

      {/* Credit Card & Payment Mode Summary Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#08090E] border border-white/10 rounded-2xl p-5 flex items-center justify-between hover:border-amber-500/30 transition-all">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-400 font-semibold">Credit Card Outstanding</span>
              {creditCardOutstanding === 0 && totalCreditCardSpent > 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                  Settled
                </span>
              )}
            </div>
            <p className="text-lg font-bold text-amber-400 mt-1">{formatCurrency(creditCardOutstanding, currency)}</p>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Spent: {formatCurrency(totalCreditCardSpent, currency)} • Repaid: {formatCurrency(totalCreditCardPaid, currency)}
            </p>
          </div>
          <button
            onClick={() => {
              setPayAmount(creditCardOutstanding > 0 ? creditCardOutstanding.toString() : '');
              setIsPayModalOpen(true);
            }}
            className="px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 transition-all text-xs font-semibold flex items-center gap-1.5"
          >
            <CreditCard className="w-4 h-4" />
            <span>Pay Bill</span>
          </button>
        </div>

        <div className="bg-[#08090E] border border-white/10 rounded-2xl p-5 flex items-center justify-between hover:border-indigo-500/30 transition-all">
          <div>
            <span className="text-xs text-zinc-400 font-semibold">UPI Spent</span>
            <p className="text-lg font-bold text-indigo-400 mt-1">{formatCurrency(upiSpent, currency)}</p>
          </div>
          <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400">
            <Wallet className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#08090E] border border-white/10 rounded-2xl p-5 flex items-center justify-between hover:border-indigo-500/30 transition-all">
          <div>
            <span className="text-xs text-zinc-400 font-semibold">Cash Spent</span>
            <p className="text-lg font-bold text-emerald-400 mt-1">{formatCurrency(cashSpent, currency)}</p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
            <Building2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Overall Budget Progress Bar */}
      <div className="bg-[#08090E] border border-white/10 rounded-2xl p-5 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-white">Overall Budget Utilization</span>
          <span className="text-zinc-400 font-bold">{budgetPercentage}%</span>
        </div>
        <div className="w-full h-3 bg-zinc-900 rounded-full overflow-hidden border border-white/5">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              budgetPercentage > 90 ? 'bg-rose-500' : budgetPercentage > 75 ? 'bg-amber-500' : 'bg-indigo-600'
            }`}
            style={{ width: `${budgetPercentage}%` }}
          />
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Expenses by Category */}
        <div className="bg-[#08090E] border border-white/10 rounded-2xl p-6">
          <h3 className="text-base font-bold text-white mb-4">Expenses by Category</h3>
          {categoryChartData.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-zinc-500 text-xs">
              No expense records found for selected filter.
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryChartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0D0E16', borderColor: '#27272A', borderRadius: '12px' }}
                    formatter={(val: number) => formatCurrency(val, currency)}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Spending by Payment Method */}
        <div className="bg-[#08090E] border border-white/10 rounded-2xl p-6">
          <h3 className="text-base font-bold text-white mb-4">Spending by Payment Method</h3>
          {paymentMethodChartData.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-zinc-500 text-xs">
              No expense records found for selected filter.
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentMethodChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {paymentMethodChartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PAYMENT_COLORS[index % PAYMENT_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0D0E16', borderColor: '#27272A', borderRadius: '12px' }}
                    formatter={(val: number) => formatCurrency(val, currency)}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Recent Transactions List */}
        <div className="bg-[#08090E] border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white">Recent Transactions</h3>
            <button
              onClick={() => onNavigate('expenses')}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              View All
            </button>
          </div>

          {recentTransactions.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-zinc-500 text-xs">
              No recent transactions recorded.
            </div>
          ) : (
            <div className="space-y-3">
              {recentTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#0D0E16] border border-white/5 hover:border-white/10 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-xl ${
                        tx.type === 'income'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-rose-500/10 text-rose-400'
                      }`}
                    >
                      {tx.type === 'income' ? <TrendingUp className="w-4 h-4" /> : <Receipt className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{tx.category || tx.description || 'Transaction'}</p>
                      <p className="text-[11px] text-zinc-400">
                        {formatDate(tx.date)} • {(tx.type === 'expense' ? tx.payment_method : tx.payment_status) || 'General'}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-extrabold ${
                      tx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, currency)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Daily Spend Breakdown (1 - 31) Bar Chart */}
      <div className="bg-[#08090E] border border-white/10 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-indigo-400" />
              <span>Daily Spend Breakdown (Day 1 - Day {daysInTargetMonth})</span>
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Daily distribution of income vs expenses for {getFilterLabel()}
            </p>
          </div>
        </div>

        <div className="h-64 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyBreakdown}>
              <XAxis dataKey="day" stroke="#71717A" fontSize={11} tickLine={false} />
              <YAxis stroke="#71717A" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0D0E16', borderColor: '#27272A', borderRadius: '12px' }}
                formatter={(val: number) => formatCurrency(val, currency)}
                labelFormatter={(label) => `Day ${label}`}
              />
              <Bar dataKey="expense" fill="#EF4444" radius={[4, 4, 0, 0]} name="Expense" />
              <Bar dataKey="income" fill="#10B981" radius={[4, 4, 0, 0]} name="Income" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pay Credit Card Bill Modal */}
      {isPayModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#08090E] border border-amber-500/30 rounded-2xl p-6 max-w-md w-full shadow-2xl relative">
            <button
              onClick={() => setIsPayModalOpen(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Record Credit Card Bill Payment</h3>
                <p className="text-xs text-zinc-400">Current Outstanding: {formatCurrency(creditCardOutstanding, currency)}</p>
              </div>
            </div>

            <form onSubmit={handlePayBillSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Payment Amount ({currency})</label>
                <input
                  type="number"
                  step="0.01"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  placeholder="e.g. 5000"
                  className="w-full bg-[#0D0E16] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Paid Via</label>
                  <select
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value as any)}
                    className="w-full bg-[#0D0E16] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="UPI">UPI Payment</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Debit Card">Debit Card</option>
                    <option value="Cash">Cash</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Payment Date</label>
                  <input
                    type="date"
                    value={payDate}
                    onChange={(e) => setPayDate(e.target.value)}
                    className="w-full bg-[#0D0E16] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Payment Notes</label>
                <input
                  type="text"
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  placeholder="e.g. September HDFC Credit Card Bill Settlement"
                  className="w-full bg-[#0D0E16] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsPayModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={payLoading}
                  className="px-5 py-2.5 text-xs font-bold rounded-xl text-white bg-amber-600 hover:bg-amber-500 shadow-lg shadow-amber-600/20 transition-all disabled:opacity-50"
                >
                  {payLoading ? 'Saving Payment...' : 'Record Payment Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
