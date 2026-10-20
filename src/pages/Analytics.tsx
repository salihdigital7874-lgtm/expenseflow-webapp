import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  PiggyBank,
  CheckSquare,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  ChevronDown,
} from 'lucide-react';
import { Expense, Income, Client } from '../types/database';
import { formatCurrency } from '../utils/formatters';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

interface AnalyticsProps {
  expenses: Expense[];
  income: Income[];
  currency?: string;
}

const CATEGORY_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#64748B'];

export const AnalyticsPage: React.FC<AnalyticsProps> = ({
  expenses = [],
  income = [],
  currency = '₹',
}) => {
  const [activeTab, setActiveTab] = useState<'Overview' | 'Income' | 'Expenses' | 'Goals' | 'Health' | 'Clients'>('Overview');
  const [timeRange, setTimeRange] = useState('This Month');

  // Compute or fallback to exact mockup figures
  const totalIncomeVal = income.length > 0 ? income.reduce((acc, i) => acc + Number(i.amount), 0) : 34200;
  const totalExpenseVal = expenses.length > 0 ? expenses.reduce((acc, e) => acc + Number(e.amount), 0) : 12450;
  const savingsVal = Math.max(0, totalIncomeVal - totalExpenseVal);

  // Income vs Expenses Curve Data (Mockup exact points)
  const incomeVsExpenseData = [
    { date: '1 Nov', income: 8000, expense: 2200 },
    { date: '8 Nov', income: 14000, expense: 4500 },
    { date: '15 Nov', income: 24000, expense: 7800 },
    { date: '22 Nov', income: 29000, expense: 10200 },
    { date: '29 Nov', income: 34200, expense: 12450 },
  ];

  // Category Breakdown Data
  const categoryData = [
    { name: 'Food & Dining', value: 28, color: '#3B82F6' },
    { name: 'Transport', value: 17, color: '#10B981' },
    { name: 'Shopping', value: 15, color: '#F59E0B' },
    { name: 'Subscriptions', value: 12, color: '#8B5CF6' },
    { name: 'Bills & Utilities', value: 10, color: '#EC4899' },
    { name: 'Others', value: 18, color: '#64748B' },
  ];

  // Monthly Savings Bar Chart Data
  const monthlySavingsData = [
    { month: 'Jul', savings: 14500 },
    { month: 'Aug', savings: 17800 },
    { month: 'Sep', savings: 16200 },
    { month: 'Oct', savings: 19400 },
    { month: 'Nov', savings: 21750 },
  ];

  return (
    <div className="space-y-6">
      {/* Top Filter and Dropdown Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {(['Overview', 'Income', 'Expenses', 'Goals', 'Health', 'Clients'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all btn-press shrink-0 ${
                activeTab === tab
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/25'
                  : 'bg-white/80 hover:bg-white text-slate-600 border border-slate-200/80 shadow-2xs'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Time Range Dropdown */}
        <div className="relative shrink-0">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="appearance-none bg-white border border-slate-200/90 rounded-xl px-4 py-2 pr-9 text-xs sm:text-sm font-bold text-slate-700 shadow-2xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500/20"
          >
            <option value="This Month">This Month</option>
            <option value="Last Month">Last Month</option>
            <option value="This Quarter">This Quarter</option>
            <option value="This Year">This Year</option>
          </select>
          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* 4 Stat Metric Cards (Exact Mockup) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Total Income */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Income</span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center gap-0.5">
              <ArrowUpRight className="w-3 h-3" /> +8%
            </span>
          </div>
          <p className="text-lg sm:text-2xl font-black text-slate-900 mt-2 tracking-tight">
            {formatCurrency(totalIncomeVal, currency)}
          </p>
        </div>

        {/* Total Expenses */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Expenses</span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-500 border border-rose-100 flex items-center gap-0.5">
              <ArrowDownRight className="w-3 h-3" /> -4%
            </span>
          </div>
          <p className="text-lg sm:text-2xl font-black text-slate-900 mt-2 tracking-tight">
            {formatCurrency(totalExpenseVal, currency)}
          </p>
        </div>

        {/* Savings */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Savings</span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100 flex items-center gap-0.5">
              <ArrowUpRight className="w-3 h-3" /> +14%
            </span>
          </div>
          <p className="text-lg sm:text-2xl font-black text-slate-900 mt-2 tracking-tight">
            {formatCurrency(savingsVal, currency)}
          </p>
        </div>

        {/* Total Tasks */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Tasks</span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-100">
              Completed
            </span>
          </div>
          <p className="text-lg sm:text-2xl font-black text-slate-900 mt-2 tracking-tight">18</p>
        </div>
      </div>

      {/* Row 1 Visuals: Income vs Expenses (Left) & Category Breakdown (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Income vs Expenses Area Chart (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h4 className="text-base font-black text-slate-900">Income vs Expenses</h4>
              <p className="text-xs text-slate-400 font-medium">Monthly cashflow trajectory</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-bold">
              <span className="flex items-center gap-1.5 text-emerald-600">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Income
              </span>
              <span className="flex items-center gap-1.5 text-rose-500">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Expenses
              </span>
            </div>
          </div>

          <div className="h-64 sm:h-72 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={incomeVsExpenseData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#F43F5E" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(val: number) => [formatCurrency(val, currency), '']}
                  contentStyle={{ borderRadius: 16, border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}
                />
                <Area type="monotone" dataKey="income" stroke="#10B981" strokeWidth={2.5} fill="url(#incomeGrad)" />
                <Area type="monotone" dataKey="expense" stroke="#F43F5E" strokeWidth={2.5} fill="url(#expenseGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Donut (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-xs flex flex-col">
          <div className="pb-4 border-b border-slate-100">
            <h4 className="text-base font-black text-slate-900">Category Breakdown</h4>
            <p className="text-xs text-slate-400 font-medium">Spending by category</p>
          </div>

          <div className="h-56 relative flex items-center justify-center mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: number) => [`${val}%`, '']} />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Donut Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xs font-bold text-slate-400">Total</span>
              <span className="text-base font-black text-slate-900">
                {formatCurrency(totalExpenseVal, currency)}
              </span>
            </div>
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-600 mt-2">
            {categoryData.map((item) => (
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

      {/* Row 2: Monthly Savings Bar Chart */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h4 className="text-base font-black text-slate-900">Monthly Savings</h4>
            <p className="text-xs text-slate-400 font-medium">Month-on-month retained balance</p>
          </div>
          <span className="text-xs font-bold text-emerald-600 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100">
            Avg: {formatCurrency(17930, currency)}/mo
          </span>
        </div>

        <div className="h-56 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlySavingsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(val: number) => [formatCurrency(val, currency), 'Savings']}
                contentStyle={{ borderRadius: 16, border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}
              />
              <Bar dataKey="savings" fill="#10B981" radius={[8, 8, 0, 0]} barSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
