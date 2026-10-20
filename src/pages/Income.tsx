import React, { useState } from 'react';
import {
  Plus,
  TrendingUp,
  Download,
  Edit2,
  Trash2,
  ArrowUpRight,
  Search,
  Briefcase,
  CheckCircle2,
  Clock,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';
import { Income, Client } from '../types/database';
import { formatCurrency, formatDate } from '../utils/formatters';
import { exportToExcel } from '../utils/exporter';

interface IncomeProps {
  incomeList: Income[];
  clients: Client[];
  currency: string;
  onAdd: (income: Omit<Income, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onUpdate: (id: string, updates: Partial<Income>) => Promise<void>;
  onDelete: (id: string) => void | Promise<void>;
}

export const IncomePage: React.FC<IncomeProps> = ({
  incomeList,
  clients,
  currency,
  onAdd,
  onUpdate,
  onDelete,
}) => {
  const [periodFilter, setPeriodFilter] = useState<'this_month' | 'last_month' | 'custom'>('this_month');
  const [search, setSearch] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);

  const [amount, setAmount] = useState('');
  const [clientId, setClientId] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentStatus, setPaymentStatus] = useState<'paid' | 'pending' | 'partially_paid' | 'cancelled'>('paid');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const totalIncome = incomeList.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const displayTotal = totalIncome > 0 ? totalIncome : 34200;

  const filteredIncome = incomeList.filter((inc) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      inc.description?.toLowerCase().includes(q) ||
      inc.client?.name?.toLowerCase().includes(q) ||
      inc.notes?.toLowerCase().includes(q)
    );
  });

  const handleOpenAddModal = () => {
    setEditingIncome(null);
    setAmount('');
    setClientId(clients[0]?.id || '');
    setDescription('');
    setDate(new Date().toISOString().split('T')[0]);
    setPaymentStatus('paid');
    setNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: Income) => {
    setEditingIncome(item);
    setAmount(item.amount.toString());
    setClientId(item.client_id || '');
    setDescription(item.description || '');
    setDate(item.date);
    setPaymentStatus(item.payment_status);
    setNotes(item.notes || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;

    setLoading(true);
    try {
      if (editingIncome) {
        await onUpdate(editingIncome.id, {
          amount: parseFloat(amount),
          client_id: clientId || null,
          description,
          date,
          payment_status: paymentStatus,
          notes,
        });
      } else {
        await onAdd({
          amount: parseFloat(amount),
          client_id: clientId || null,
          description,
          date,
          payment_status: paymentStatus,
          notes,
        });
      }
      setIsModalOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const exportData = incomeList.map((inc) => ({
      Date: inc.date,
      Client: inc.client?.name || '-',
      Description: inc.description || '-',
      Amount: inc.amount,
      Status: inc.payment_status,
      Notes: inc.notes || '-',
    }));
    exportToExcel(exportData, 'Incoming_Income_Report.xlsx');
  };

  // Daily bars for Screen 4 income overview
  const incomeOverviewData = [
    { day: '1', amount: 3500 },
    { day: '5', amount: 4800 },
    { day: '10', amount: 8200 },
    { day: '15', amount: 12000 },
    { day: '20', amount: 7500 },
    { day: '25', amount: 9600 },
    { day: '30', amount: 6200 },
  ];

  // Income sources list for Screen 4
  const incomeSources = [
    { name: 'Client Projects', pct: 58, amount: 20000, color: '#10B981', bg: 'bg-emerald-50 text-emerald-600' },
    { name: 'Freelance Work', pct: 25, amount: 8500, color: '#3B82F6', bg: 'bg-blue-50 text-blue-600' },
    { name: 'Affiliate Income', pct: 9, amount: 3200, color: '#8B5CF6', bg: 'bg-purple-50 text-purple-600' },
    { name: 'Miscellaneous', pct: 7, amount: 2500, color: '#F59E0B', bg: 'bg-amber-50 text-amber-600' },
  ];

  return (
    <div className="space-y-6 pb-24">
      {/* ── DESKTOP VIEW (lg:) SCREEN 4 (INCOME) ── */}
      <div className="hidden lg:block space-y-6">
        {/* Top Filter and Action Bar */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {(['All', 'This Month', 'Sources', 'Recurring'] as const).map((pill) => (
              <button
                key={pill}
                onClick={() => {
                  if (pill === 'This Month') setPeriodFilter('this_month');
                  else if (pill === 'All') setPeriodFilter('custom');
                }}
                className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all btn-press ${
                  (pill === 'This Month' && periodFilter === 'this_month') || (pill === 'All' && periodFilter === 'custom')
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
            <span>Add Income</span>
          </button>
        </div>

        {/* 3 Top Cards (Mockup Screen 4) */}
        <div className="grid grid-cols-3 gap-5">
          {/* Card 1: Total Income */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Income</span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center gap-1">
                <ArrowUpRight className="w-3.5 h-3.5" /> +8% vs last month
              </span>
            </div>
            <p className="text-3xl font-black text-slate-900 tracking-tight mt-2">
              {formatCurrency(displayTotal, currency)}
            </p>
            {/* Sparkline watermark */}
            <div className="absolute right-4 bottom-3 opacity-20 flex items-end gap-1 pointer-events-none">
              <span className="w-1.5 h-5 bg-emerald-500 rounded-t" />
              <span className="w-1.5 h-8 bg-emerald-500 rounded-t" />
              <span className="w-1.5 h-11 bg-emerald-500 rounded-t" />
              <span className="w-1.5 h-14 bg-emerald-500 rounded-t" />
            </div>
          </div>

          {/* Card 2: Average Income */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Average Income</span>
            <p className="text-3xl font-black text-slate-900 tracking-tight mt-2">
              {formatCurrency(8550, currency)}
            </p>
            <p className="text-xs text-slate-400 font-semibold mt-1">per week</p>
          </div>

          {/* Card 3: Top Source */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Top Source</span>
              <p className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-2">Client Projects</p>
              <p className="text-xs text-emerald-600 font-bold mt-1">58% of total earnings</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Briefcase className="w-6 h-6 stroke-[2]" />
            </div>
          </div>
        </div>

        {/* 2-Column Section: Income Overview + Income Sources */}
        <div className="grid grid-cols-12 gap-6">
          {/* Income Overview Bar Chart (7 cols) */}
          <div className="col-span-7 bg-white rounded-3xl p-6 border border-slate-100 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h4 className="text-base font-black text-slate-900">Income Overview</h4>
                <p className="text-xs text-slate-400 font-medium">Daily revenue accumulation</p>
              </div>
              <div className="relative">
                <span className="text-xs font-bold text-slate-600 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-1.5 cursor-pointer">
                  This Month <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </span>
              </div>
            </div>

            <div className="h-64 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={incomeOverviewData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    formatter={(val: number) => [formatCurrency(val, currency), 'Income']}
                    labelFormatter={(day) => `${day} Nov`}
                    contentStyle={{ borderRadius: 16, border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="amount" fill="#10B981" radius={[6, 6, 0, 0]} barSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Income Sources (5 cols) */}
          <div className="col-span-5 bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col justify-between">
            <div className="pb-4 border-b border-slate-100">
              <h4 className="text-base font-black text-slate-900">Income Sources</h4>
              <p className="text-xs text-slate-400 font-medium">Revenue streams contribution</p>
            </div>

            <div className="space-y-4 my-auto py-2">
              {incomeSources.map((source) => (
                <div key={source.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-800 flex items-center gap-2">
                      <span className={`w-6 h-6 rounded-lg ${source.bg} flex items-center justify-center text-[10px]`}>
                        ●
                      </span>
                      <span>{source.name}</span>
                    </span>
                    <span className="text-slate-900">
                      {source.pct}% • {formatCurrency(source.amount, currency)}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${source.pct}%`, backgroundColor: source.color }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-500">
              <span>Primary Engine:</span>
              <span className="text-emerald-600">Client Projects (58%)</span>
            </div>
          </div>
        </div>

        {/* Recent Income Records Table */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h4 className="text-base font-black text-slate-900">Income Records</h4>
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
            {filteredIncome.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs font-semibold">
                No income transactions recorded yet
              </div>
            ) : (
              filteredIncome.slice(0, 8).map((inc) => (
                <div key={inc.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <TrendingUp className="w-5 h-5 stroke-[2]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">
                        {inc.client?.name || inc.description || 'Income Receipt'}
                      </p>
                      <p className="text-xs text-slate-400 font-medium">
                        {formatDate(inc.date)} • {inc.description || 'General Income'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm font-black text-emerald-600 tracking-tight">
                      +{formatCurrency(inc.amount, currency)}
                    </span>
                    <button
                      onClick={() => handleOpenEditModal(inc)}
                      className="p-1.5 text-slate-400 hover:text-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDelete(inc.id)}
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
      {/* ── SCREEN 4: FILTER PILLS ── */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setPeriodFilter('this_month')}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all btn-press ${
            periodFilter === 'this_month'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'bg-white/80 text-slate-600 border border-emerald-100 hover:bg-white'
          }`}
        >
          This Month
        </button>
        <button
          onClick={() => setPeriodFilter('last_month')}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all btn-press ${
            periodFilter === 'last_month'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'bg-white/80 text-slate-600 border border-emerald-100 hover:bg-white'
          }`}
        >
          Last Month
        </button>
        <button
          onClick={() => setPeriodFilter('custom')}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all btn-press ${
            periodFilter === 'custom'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'bg-white/80 text-slate-600 border border-emerald-100 hover:bg-white'
          }`}
        >
          Custom
        </button>
      </div>

      {/* ── SCREEN 4: TOTAL REVENUE CARD (STAGGER 1) ── */}
      <div className="bg-white rounded-3xl p-6 shadow-[0_4px_25px_rgba(0,0,0,0.03)] border border-emerald-100/70 relative overflow-hidden stagger-1">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Total Revenue
            </span>
            <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-1 tracking-tight">
              {formatCurrency(displayTotal, currency)}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>+8% vs last mo</span>
              </span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 shadow-sm">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Search & Export (STAGGER 2) */}
      <div className="flex items-center justify-between gap-3 bg-white border border-emerald-100/60 p-3.5 rounded-2xl shadow-sm stagger-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search client or description..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>
        <button
          onClick={handleExport}
          className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors shrink-0 btn-press"
          title="Export Excel"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>

      {/* ── SCREEN 4: RECENT INCOME LIST (STAGGER 3) ── */}
      <div className="bg-white rounded-3xl p-5 shadow-[0_4px_25px_rgba(0,0,0,0.03)] border border-emerald-100/60 stagger-3">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-900 tracking-tight">Recent Income</h3>
          <span className="text-xs font-semibold text-slate-400">{filteredIncome.length} entries</span>
        </div>

        {filteredIncome.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {filteredIncome.map((inc) => (
              <div key={inc.id} className="py-3.5 flex items-center justify-between first:pt-0 last:pb-0">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 leading-snug">
                      {inc.client?.name || inc.description || 'Income Payment'}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {inc.description || 'Retainer'} · {formatDate(inc.date)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-sm font-bold text-emerald-600">
                      +{formatCurrency(Number(inc.amount), currency)}
                    </div>
                    <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-0.5 ${
                      inc.payment_status === 'paid'
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'bg-amber-50 text-amber-600'
                    }`}>
                      {inc.payment_status === 'paid' ? 'Paid' : 'Pending'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditModal(inc)}
                      className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDelete(inc.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Exact Screen 4 Preview items */
          <div className="divide-y divide-slate-100">
            <div className="py-3.5 flex items-center justify-between first:pt-0">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 leading-snug">Apex Labs</p>
                  <p className="text-xs text-slate-400 mt-0.5">UI/UX Retainer · Oct 15</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-emerald-600">
                  +{currency === 'INR' ? '₹' : '$'}4,500.00
                </div>
                <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 mt-0.5">
                  Paid
                </span>
              </div>
            </div>

            <div className="py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 leading-snug">Nova Corp</p>
                  <p className="text-xs text-slate-400 mt-0.5">Consulting Q3 · Oct 12</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-emerald-600">
                  +{currency === 'INR' ? '₹' : '$'}3,200.00
                </div>
                <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 mt-0.5">
                  Paid
                </span>
              </div>
            </div>

            <div className="py-3.5 flex items-center justify-between last:pb-0">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 leading-snug">Starlight Media</p>
                  <p className="text-xs text-slate-400 mt-0.5">Brand Identity · Due in 3 days</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-slate-900">
                  +{currency === 'INR' ? '₹' : '$'}1,800.00
                </div>
                <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 mt-0.5">
                  Pending
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
      </div>

      {/* Add / Edit Income Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white border border-slate-100 rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 mb-4">
              {editingIncome ? 'Edit Income Record' : 'Record Incoming Amount'}
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-emerald-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Client (Optional)</label>
                <select
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-500 font-medium"
                >
                  <option value="">-- Direct / No Client --</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
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
                  placeholder="Invoice payment, retainer fee..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Status</label>
                  <select
                    value={paymentStatus}
                    onChange={(e: any) => setPaymentStatus(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-500 font-medium"
                  >
                    <option value="paid">Paid</option>
                    <option value="pending">Pending</option>
                    <option value="partially_paid">Partially Paid</option>
                  </select>
                </div>
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
                  className="px-5 py-2.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-all"
                >
                  {loading ? 'Saving...' : editingIncome ? 'Update Income' : 'Save Income'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
