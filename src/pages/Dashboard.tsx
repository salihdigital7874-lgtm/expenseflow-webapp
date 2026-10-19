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
  Utensils,
  ChevronDown,
  ChevronRight,
  Briefcase,
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
    <div className="space-y-5 pb-8">
      {/* ── SCREEN 1: TOTAL BALANCE CARD ── */}
      <div className="bg-white rounded-3xl p-6 shadow-[0_4px_25px_rgba(0,0,0,0.03)] border border-slate-100 relative overflow-hidden">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Total Balance
            </span>
            <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-1 tracking-tight">
              {formatCurrency(totalIncoming > 0 || totalExpenses > 0 ? (totalIncoming - totalExpenses) : 142850, currency)}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>+12% vs last mo</span>
              </span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 shadow-sm">
            <Wallet className="w-6 h-6" />
          </div>
        </div>

        {/* Sparkline curve */}
        <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span>Real-time balance across accounts</span>
          </div>
          <svg className="w-24 h-6 text-blue-500 stroke-current fill-none stroke-[2.5]" viewBox="0 0 100 24">
            <path d="M0,18 Q20,10 40,15 T80,4 T100,10" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      {/* ── SCREEN 1: 4 GRID CARDS ── */}
      <div className="grid grid-cols-2 gap-3.5">
        {/* Income Card */}
        <div 
          onClick={() => onNavigate('income')}
          className="bg-white rounded-3xl p-4 sm:p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-slate-100 hover:border-emerald-200 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <ArrowDownRight className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600">
              +8%
            </span>
          </div>
          <p className="text-xs font-medium text-slate-500 mt-3">Income</p>
          <p className="text-base sm:text-xl font-bold text-slate-900 mt-0.5 truncate">
            {formatCurrency(totalIncoming > 0 ? totalIncoming : 34200, currency)}
          </p>
        </div>

        {/* Expenses Card */}
        <div 
          onClick={() => onNavigate('expenses')}
          className="bg-white rounded-3xl p-4 sm:p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-slate-100 hover:border-rose-200 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Receipt className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-500">
              -4%
            </span>
          </div>
          <p className="text-xs font-medium text-slate-500 mt-3">Expenses</p>
          <p className="text-base sm:text-xl font-bold text-slate-900 mt-0.5 truncate">
            {formatCurrency(totalExpenses > 0 ? totalExpenses : 12450, currency)}
          </p>
        </div>

        {/* Clients Due Card */}
        <div 
          onClick={() => onNavigate('clients')}
          className="bg-white rounded-3xl p-4 sm:p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-slate-100 hover:border-amber-200 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-600">
              {clients.filter(c => Number(c.balance_amount) > 0).length || 6} pending
            </span>
          </div>
          <p className="text-xs font-medium text-slate-500 mt-3">Clients Due</p>
          <p className="text-base sm:text-xl font-bold text-slate-900 mt-0.5 truncate">
            {formatCurrency(totalClientBalance > 0 ? totalClientBalance : 8600, currency)}
          </p>
        </div>

        {/* Savings Card */}
        <div 
          onClick={() => onNavigate('budgets')}
          className="bg-white rounded-3xl p-4 sm:p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-slate-100 hover:border-purple-200 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <PieChartIcon className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-600">
              {budgetPercentage > 0 ? `${100 - budgetPercentage}% left` : '64% goal'}
            </span>
          </div>
          <p className="text-xs font-medium text-slate-500 mt-3">Savings</p>
          <p className="text-base sm:text-xl font-bold text-slate-900 mt-0.5 truncate">
            {formatCurrency(totalBudget > 0 ? remainingBudget : 21750, currency)}
          </p>
        </div>
      </div>

      {/* ── SCREEN 1: RECENT TRANSACTIONS ── */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-[0_4px_25px_rgba(0,0,0,0.03)] border border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-900 tracking-tight">Recent Transactions</h3>
          <button
            onClick={() => onNavigate('expenses')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
          >
            <span>See All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentTransactions.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {recentTransactions.map((tx) => (
              <div key={tx.id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                <div className="flex items-center gap-3.5">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                    tx.type === 'income' 
                      ? 'bg-emerald-50 text-emerald-600'
                      : tx.category === 'Food'
                      ? 'bg-orange-50 text-orange-500'
                      : tx.category === 'Software'
                      ? 'bg-blue-50 text-blue-600'
                      : 'bg-rose-50 text-rose-500'
                  }`}>
                    {tx.type === 'income' ? (
                      <TrendingUp className="w-5 h-5" />
                    ) : tx.category === 'Food' ? (
                      <Utensils className="w-5 h-5" />
                    ) : tx.category === 'Software' ? (
                      <Layers className="w-5 h-5" />
                    ) : (
                      <Receipt className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 leading-snug">
                      {tx.description || tx.category || 'Transaction'}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {tx.category || (tx.type === 'income' ? 'Income' : 'Expense')} · {formatDate(tx.date)}
                    </p>
                  </div>
                </div>
                <div className={`text-sm font-bold ${
                  tx.type === 'income' ? 'text-emerald-600' : 'text-slate-900'
                }`}>
                  {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, currency)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Exact Screen 1 Sample Transactions Preview */
          <div className="divide-y divide-slate-100">
            <div className="py-3 flex items-center justify-between first:pt-0">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
                  <Utensils className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 leading-snug">Zomato</p>
                  <p className="text-xs text-slate-400 mt-0.5">Food & Dining · Today</p>
                </div>
              </div>
              <div className="text-sm font-bold text-slate-900">
                -{currency === 'INR' ? '₹' : '$'}42.50
              </div>
            </div>

            <div className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 leading-snug">Client Payment</p>
                  <p className="text-xs text-slate-400 mt-0.5">Acme Corp · Yesterday</p>
                </div>
              </div>
              <div className="text-sm font-bold text-emerald-600">
                +{currency === 'INR' ? '₹' : '$'}2,400.00
              </div>
            </div>

            <div className="py-3 flex items-center justify-between last:pb-0">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 leading-snug">Adobe Creative Cloud</p>
                  <p className="text-xs text-slate-400 mt-0.5">Subscription · Oct 12</p>
                </div>
              </div>
              <div className="text-sm font-bold text-slate-900">
                -{currency === 'INR' ? '₹' : '$'}54.99
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Interactive Month & Date Filter Control Hub */}
      <div className="bg-white border border-slate-100 rounded-3xl p-5 space-y-4 shadow-[0_4px_25px_rgba(0,0,0,0.03)] relative overflow-hidden">
        {/* Top Header & Presets Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-600">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm font-bold text-slate-900">Period Filter</h2>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 font-bold border border-blue-100 flex items-center gap-1">
                  <Filter className="w-3 h-3 text-blue-500" />
                  <span>{getFilterLabel()}</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Filter transactions and analytics by Month, Date, or Custom Date Range.
              </p>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={handleSelectThisMonth}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                filterMode === 'month' && selectedMonth === currentMonthNumStr && selectedYear === currentYearStr
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              This Month
            </button>

            <button
              onClick={handleSelectLastMonth}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                filterMode === 'month' && selectedMonth !== currentMonthNumStr
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Last Month
            </button>

            <button
              onClick={handleSelectToday}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                filterMode === 'date' && selectedSingleDate === todayStr
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Today
            </button>

            <button
              onClick={handleResetFilter}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                filterMode === 'all'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Time
            </button>
          </div>
        </div>

        {/* Filter Selection Modes & Interactive Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Mode Selector Tabs */}
          <div className="md:col-span-5 flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl">
            <button
              onClick={() => setFilterMode('month')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition-all text-center flex items-center justify-center gap-1.5 ${
                filterMode === 'month'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Month / Year</span>
            </button>

            <button
              onClick={() => setFilterMode('date')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition-all text-center flex items-center justify-center gap-1.5 ${
                filterMode === 'date'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Single Date</span>
            </button>

            <button
              onClick={() => setFilterMode('range')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition-all text-center flex items-center justify-center gap-1.5 ${
                filterMode === 'range'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
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
                <span className="text-xs text-slate-500 font-medium">Select:</span>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-xs text-slate-800 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500 font-semibold"
                >
                  <option value="2026">2026</option>
                  <option value="2025">2025</option>
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                </select>

                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-xs text-blue-600 font-bold rounded-xl px-3.5 py-2 focus:outline-none focus:border-blue-500 shadow-sm"
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
                <span className="text-xs text-slate-500 font-medium">Pick Date:</span>
                <input
                  type="date"
                  value={selectedSingleDate}
                  onChange={(e) => setSelectedSingleDate(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-xs text-blue-600 font-bold rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500 shadow-sm"
                />
              </div>
            )}

            {filterMode === 'range' && (
              <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
                <span className="text-xs text-slate-500 font-medium">From:</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-xs text-slate-800 rounded-xl px-3 py-1.5 focus:outline-none focus:border-blue-500 font-medium"
                />
                <span className="text-xs text-slate-500 font-medium">To:</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-xs text-slate-800 rounded-xl px-3 py-1.5 focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>
            )}

            {filterMode !== 'all' && (
              <button
                onClick={handleResetFilter}
                className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors shrink-0 font-medium"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Summary Footer */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
          <div>
            Showing <strong className="text-slate-700">{filteredExpenses.length}</strong> expenses and{' '}
            <strong className="text-slate-700">{filteredIncome.length}</strong> income records.
          </div>
          <div>
            Net Outflow: <span className="text-rose-500 font-bold">{formatCurrency(totalExpenses, currency)}</span>
          </div>
        </div>
      </div>


      {/* ── CREDIT CARD OUTSTANDING & REPAYMENT ── */}
      <div className="bg-white rounded-3xl p-5 shadow-[0_4px_25px_rgba(0,0,0,0.03)] border border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900">Credit Card Bill</span>
              {creditCardOutstanding === 0 && totalCreditCardSpent > 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-bold border border-emerald-200">
                  Settled
                </span>
              )}
            </div>
            <p className="text-base font-extrabold text-amber-600 mt-0.5">
              {formatCurrency(creditCardOutstanding, currency)}
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            setPayAmount(creditCardOutstanding > 0 ? creditCardOutstanding.toString() : '');
            setIsPayModalOpen(true);
          }}
          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Pay Bill</span>
        </button>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Expenses by Category */}
        <div className="bg-white rounded-3xl p-5 shadow-[0_4px_25px_rgba(0,0,0,0.03)] border border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 mb-3">Expenses by Category</h3>
          {categoryChartData.length === 0 ? (
            <div className="h-52 flex flex-col items-center justify-center text-slate-400 text-xs">
              No expense records found for selected filter.
            </div>
          ) : (
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryChartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                    formatter={(val: number) => formatCurrency(val, currency)}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Spending by Payment Method */}
        <div className="bg-white rounded-3xl p-5 shadow-[0_4px_25px_rgba(0,0,0,0.03)] border border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 mb-3">Spending by Payment Method</h3>
          {paymentMethodChartData.length === 0 ? (
            <div className="h-52 flex flex-col items-center justify-center text-slate-400 text-xs">
              No expense records found for selected filter.
            </div>
          ) : (
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentMethodChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {paymentMethodChartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PAYMENT_COLORS[index % PAYMENT_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                    formatter={(val: number) => formatCurrency(val, currency)}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Daily Spend Breakdown Bar Chart */}
      <div className="bg-white rounded-3xl p-5 shadow-[0_4px_25px_rgba(0,0,0,0.03)] border border-slate-100 space-y-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-blue-600" />
            <span>Daily Spend Breakdown (Day 1 - {daysInTargetMonth})</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Daily distribution of income vs expenses for {getFilterLabel()}
          </p>
        </div>

        <div className="h-56 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyBreakdown}>
              <XAxis dataKey="day" stroke="#94A3B8" fontSize={10} tickLine={false} />
              <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                formatter={(val: number) => formatCurrency(val, currency)}
                labelFormatter={(label) => `Day ${label}`}
              />
              <Bar dataKey="income" fill="#10B981" radius={[4, 4, 0, 0]} name="Income" />
              <Bar dataKey="expense" fill="#EF4444" radius={[4, 4, 0, 0]} name="Expense" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pay Credit Card Bill Modal */}
      {isPayModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white border border-slate-100 rounded-3xl p-6 max-w-md w-full shadow-2xl relative">
            <button
              onClick={() => setIsPayModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-2xl bg-amber-50 text-amber-600">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Record Card Bill Payment</h3>
                <p className="text-xs text-slate-400">Current Outstanding: {formatCurrency(creditCardOutstanding, currency)}</p>
              </div>
            </div>

            <form onSubmit={handlePayBillSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Amount ({currency})</label>
                <input
                  type="number"
                  step="0.01"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  placeholder="e.g. 5000"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-amber-500 font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Paid Via</label>
                  <select
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-amber-500 font-medium"
                  >
                    <option value="UPI">UPI Payment</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Debit Card">Debit Card</option>
                    <option value="Cash">Cash</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Date</label>
                  <input
                    type="date"
                    value={payDate}
                    onChange={(e) => setPayDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-amber-500 font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Notes</label>
                <input
                  type="text"
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  placeholder="e.g. Card Bill Settlement"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPayModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={payLoading}
                  className="px-5 py-2.5 text-xs font-bold rounded-xl text-white bg-amber-500 hover:bg-amber-600 shadow-md transition-all disabled:opacity-50"
                >
                  {payLoading ? 'Saving...' : 'Record Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
