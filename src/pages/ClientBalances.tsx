import React, { useState } from 'react';
import {
  Plus,
  Users,
  Edit2,
  Trash2,
  Phone,
  Mail,
  CheckCircle,
  AlertCircle,
  Search,
  DollarSign,
  Eye,
  X,
  Building,
  Calendar,
  CreditCard,
  CheckCircle2,
  Clock,
  MessageSquare,
} from 'lucide-react';
import { Client, Income } from '../types/database';
import { formatCurrency, formatDate } from '../utils/formatters';

interface ClientBalancesProps {
  clients: Client[];
  income?: Income[];
  currency: string;
  onAdd: (client: Omit<Client, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'balance_amount'>) => Promise<void>;
  onUpdate: (id: string, updates: Partial<Client>) => Promise<void>;
  onDelete: (id: string) => void | Promise<void>;
  onAddIncome?: (income: Omit<Income, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
}

export const ClientBalances: React.FC<ClientBalancesProps> = ({
  clients,
  income = [],
  currency,
  onAdd,
  onUpdate,
  onDelete,
  onAddIncome,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'paid' | 'active'>('all');

  // Add / Edit Client Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [paidAmount, setPaidAmount] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [loading, setLoading] = useState(false);

  // View Client Details Modal
  const [viewingClient, setViewingClient] = useState<Client | null>(null);

  // Receive Payment Modal
  const [paymentModalClient, setPaymentModalClient] = useState<Client | null>(null);
  const [payAmount, setPayAmount] = useState('');
  const [payDescription, setPayDescription] = useState('Payment Received');
  const [payNotes, setPayNotes] = useState('');
  const [payLoading, setPayLoading] = useState(false);

  // Summary Metrics
  const totalBilled = clients.reduce((sum, c) => sum + Number(c.total_amount || 0), 0);
  const totalPaid = clients.reduce((sum, c) => sum + Number(c.paid_amount || 0), 0);
  const totalOutstanding = clients.reduce((sum, c) => sum + Number(c.balance_amount || 0), 0);
  const activeCount = clients.filter((c) => c.status === 'active').length;

  // Filtered Clients
  const filteredClients = clients.filter((c) => {
    const matchesSearch =
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase()) ||
      c.phone?.toLowerCase().includes(search.toLowerCase());

    let matchesFilter = true;
    if (statusFilter === 'pending') {
      matchesFilter = Number(c.balance_amount) > 0;
    } else if (statusFilter === 'paid') {
      matchesFilter = Number(c.balance_amount) <= 0;
    } else if (statusFilter === 'active') {
      matchesFilter = c.status === 'active';
    }

    return matchesSearch && matchesFilter;
  });

  const handleOpenAddModal = () => {
    setEditingClient(null);
    setName('');
    setEmail('');
    setPhone('');
    setTotalAmount('');
    setPaidAmount('');
    setStatus('active');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (c: Client) => {
    setEditingClient(c);
    setName(c.name);
    setEmail(c.email || '');
    setPhone(c.phone || '');
    setTotalAmount(c.total_amount.toString());
    setPaidAmount(c.paid_amount.toString());
    setStatus(c.status);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    setLoading(true);
    try {
      const tot = parseFloat(totalAmount) || 0;
      const pd = parseFloat(paidAmount) || 0;

      if (editingClient) {
        await onUpdate(editingClient.id, {
          name,
          email,
          phone,
          total_amount: tot,
          paid_amount: pd,
          balance_amount: Math.max(0, tot - pd),
          status,
        });
      } else {
        await onAdd({
          name,
          email,
          phone,
          total_amount: tot,
          paid_amount: pd,
          status,
        });
      }
      setIsModalOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const handleReceivePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentModalClient || !payAmount || parseFloat(payAmount) <= 0) return;

    setPayLoading(true);
    try {
      const recAmount = parseFloat(payAmount);
      const newPaid = Number(paymentModalClient.paid_amount || 0) + recAmount;
      const newBalance = Math.max(0, Number(paymentModalClient.total_amount || 0) - newPaid);

      // 1. Update Client Ledger
      await onUpdate(paymentModalClient.id, {
        paid_amount: newPaid,
        balance_amount: newBalance,
      });

      // 2. Add Income entry if onAddIncome callback exists
      if (onAddIncome) {
        await onAddIncome({
          client_id: paymentModalClient.id,
          amount: recAmount,
          description: payDescription || `Payment from ${paymentModalClient.name}`,
          date: new Date().toISOString().split('T')[0],
          payment_status: 'paid',
          notes: payNotes,
        });
      }

      setPaymentModalClient(null);
      setPayAmount('');
      setPayDescription('Payment Received');
      setPayNotes('');
    } catch (err) {
      console.error('Failed to record payment', err);
    } finally {
      setPayLoading(false);
    }
  };

  const AVATAR_COLORS = [
    { bg: 'bg-blue-100 text-blue-700' },
    { bg: 'bg-emerald-100 text-emerald-700' },
    { bg: 'bg-rose-100 text-rose-700' },
    { bg: 'bg-purple-100 text-purple-700' },
    { bg: 'bg-cyan-100 text-cyan-700' },
    { bg: 'bg-amber-100 text-amber-700' },
  ];

  const defaultMockClients = [
    {
      id: 'c1',
      name: 'Arjun Marketing',
      company: 'Arjun Marketing',
      status: 'active' as const,
      phone: '+91 98765 43210',
      email: 'arjun@mail.com',
      total_amount: 45000,
      paid_amount: 45000,
      balance_amount: 0,
      user_id: '',
      created_at: '',
      updated_at: '',
    },
    {
      id: 'c2',
      name: 'GreenTech Solutions',
      company: 'GreenTech Solutions',
      status: 'pending' as const,
      phone: '+91 98765 43211',
      email: 'contact@greentech.com',
      total_amount: 60000,
      paid_amount: 25000,
      balance_amount: 35000,
      user_id: '',
      created_at: '',
      updated_at: '',
    },
    {
      id: 'c3',
      name: 'Naadan Foodstuff',
      company: 'Naadan Foodstuff',
      status: 'active' as const,
      phone: '+91 98765 43212',
      email: 'info@naadan.com',
      total_amount: 30000,
      paid_amount: 30000,
      balance_amount: 0,
      user_id: '',
      created_at: '',
      updated_at: '',
    },
    {
      id: 'c4',
      name: 'Kayakalpa Spa',
      company: 'Kayakalpa Spa',
      status: 'active' as const,
      phone: '+91 98765 43213',
      email: 'spa@kayakalpa.com',
      total_amount: 28000,
      paid_amount: 28000,
      balance_amount: 0,
      user_id: '',
      created_at: '',
      updated_at: '',
    },
    {
      id: 'c5',
      name: 'Mumtaz Clinic',
      company: 'Mumtaz Clinic',
      status: 'inactive' as const,
      phone: '+91 98765 43214',
      email: 'info@mumtazclinic.com',
      total_amount: 15000,
      paid_amount: 0,
      balance_amount: 15000,
      user_id: '',
      created_at: '',
      updated_at: '',
    },
  ];

  const desktopClientList = clients.length > 0 ? filteredClients : defaultMockClients;

  const [desktopFilter, setDesktopFilter] = useState<'All' | 'Active' | 'Pending' | 'Inactive'>('All');

  const filteredDesktopClients = desktopClientList.filter((c: any) => {
    if (desktopFilter === 'Active') return c.status === 'active';
    if (desktopFilter === 'Pending') return c.status === 'pending' || Number(c.balance_amount) > 0;
    if (desktopFilter === 'Inactive') return c.status === 'inactive';
    return true;
  });

  return (
    <div className="space-y-6 pb-24">
      {/* ── DESKTOP VIEW (lg:) SCREEN 7 (CLIENTS) ── */}
      <div className="hidden lg:block space-y-6">
        {/* Top Filter and Action Bar */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {(['All', 'Active', 'Pending', 'Inactive'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setDesktopFilter(filter)}
                className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all btn-press ${
                  desktopFilter === filter
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/25'
                    : 'bg-white/80 hover:bg-white text-slate-600 border border-slate-200/80 shadow-2xs'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          <button
            onClick={handleOpenAddModal}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-purple-600/30 transition-all btn-press shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Client</span>
          </button>
        </div>

        {/* Clients Table (Exact Mockup Screen 7) */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60 text-slate-400 text-xs font-bold uppercase tracking-wider">
                <th className="py-4 px-6">Name</th>
                <th className="py-4 px-6">Company</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6">Phone</th>
                <th className="py-4 px-6">Email</th>
                <th className="py-4 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredDesktopClients.map((client: any, idx: number) => {
                const initials = client.name
                  .split(' ')
                  .map((n: string) => n[0])
                  .join('')
                  .substring(0, 2)
                  .toUpperCase();
                const avatarPalette = AVATAR_COLORS[idx % AVATAR_COLORS.length];
                const isPending = client.status === 'pending' || Number(client.balance_amount) > 0;
                const isInactive = client.status === 'inactive';

                return (
                  <tr key={client.id || idx} className="hover:bg-slate-50/70 transition-colors">
                    {/* Name + Initials Avatar */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs ${avatarPalette.bg}`}
                        >
                          {initials}
                        </div>
                        <span className="font-bold text-slate-900">{client.name}</span>
                      </div>
                    </td>

                    {/* Company */}
                    <td className="py-4 px-6 text-slate-600 font-medium">
                      {client.company || client.name}
                    </td>

                    {/* Status Pill */}
                    <td className="py-4 px-6">
                      <span
                        className={`inline-block text-[11px] font-bold px-3 py-1 rounded-full ${
                          isInactive
                            ? 'bg-rose-50 text-rose-500 border border-rose-200'
                            : isPending
                            ? 'bg-amber-50 text-amber-600 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                        }`}
                      >
                        {isInactive ? 'Inactive' : isPending ? 'Pending' : 'Active'}
                      </span>
                    </td>

                    {/* Phone */}
                    <td className="py-4 px-6 text-slate-600 font-medium">{client.phone || '-'}</td>

                    {/* Email */}
                    <td className="py-4 px-6 text-slate-600 font-medium">{client.email || '-'}</td>

                    {/* Action Icons */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {client.phone && (
                          <a
                            href={`tel:${client.phone}`}
                            className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                            title="Call client"
                          >
                            <Phone className="w-4 h-4" />
                          </a>
                        )}
                        {client.phone && (
                          <a
                            href={`sms:${client.phone}`}
                            className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                            title="Message client"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </a>
                        )}
                        {client.email && (
                          <a
                            href={`mailto:${client.email}`}
                            className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                            title="Email client"
                          >
                            <Mail className="w-4 h-4" />
                          </a>
                        )}
                        {client.id && !client.id.startsWith('c') && (
                          <button
                            onClick={() => handleOpenEditModal(client)}
                            className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                        {client.id && !client.id.startsWith('c') && (
                          <button
                            onClick={() => onDelete(client.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── MOBILE VIEW (<lg) ── */}
      <div className="block lg:hidden space-y-5">
      {/* ── SCREEN 5: FILTER PILLS ── */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-0.5">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all btn-press ${
            statusFilter === 'all'
              ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
              : 'bg-white/80 text-slate-700 border border-amber-200 hover:bg-white'
          }`}
        >
          All ({clients.length || 12})
        </button>
        <button
          onClick={() => setStatusFilter('pending')}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all btn-press ${
            statusFilter === 'pending'
              ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
              : 'bg-white/80 text-slate-700 border border-amber-200 hover:bg-white'
          }`}
        >
          Receivables ({clients.filter((c) => Number(c.balance_amount) > 0).length || 6})
        </button>
        <button
          onClick={() => setStatusFilter('active')}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all btn-press ${
            statusFilter === 'active'
              ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
              : 'bg-white/80 text-slate-700 border border-amber-200 hover:bg-white'
          }`}
        >
          Active
        </button>
      </div>

      {/* Search Input */}
      <div className="flex items-center gap-3 bg-white border border-amber-100/70 p-3.5 rounded-2xl shadow-sm">
        <Search className="w-4 h-4 text-slate-400 shrink-0" />
        <input
          type="text"
          placeholder="Search client by name, phone, email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
        />
      </div>

      {/* ── SCREEN 5: CLIENT CARDS LIST ── */}
      <div className="space-y-3">
        {filteredClients.length > 0 ? (
          filteredClients.map((client, idx) => {
            const initial = client.name ? client.name.charAt(0).toUpperCase() : 'C';
            const avatarColor = AVATAR_COLORS[idx % AVATAR_COLORS.length];
            const bal = Number(client.balance_amount || 0);

            return (
              <div
                key={client.id}
                className="bg-white rounded-3xl p-4 sm:p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-amber-100/60 flex items-center justify-between hover:border-amber-300 transition-all cursor-pointer"
                onClick={() => setViewingClient(client)}
              >
                <div className="flex items-center gap-3.5">
                  <div className={`w-11 h-11 rounded-full ${avatarColor.bg} flex items-center justify-center font-bold text-base shrink-0 shadow-sm`}>
                    {initial}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">{client.name}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {client.phone || client.email || 'Active Client'} · {bal > 0 ? 'Due soon' : 'Settled'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-extrabold text-slate-900">
                      {formatCurrency(bal, currency)}
                    </p>
                    <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-0.5 ${
                      bal > 0 ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                    }`}>
                      {bal > 0 ? 'Pending' : 'Settled'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    {bal > 0 && (
                      <button
                        onClick={() => {
                          setPaymentModalClient(client);
                          setPayAmount(bal.toString());
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-600 text-xs font-bold transition-colors"
                        title="Record Payment"
                      >
                        Pay
                      </button>
                    )}
                    <button
                      onClick={() => handleOpenEditModal(client)}
                      className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDelete(client.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          /* Exact Screen 5 Sample Clients Preview */
          <div className="space-y-3">
            {[
              { name: 'Acme Corporation', initial: 'A', color: 'bg-blue-100 text-blue-700', sub: '2 active projects · Due in 4 days', bal: 2400 },
              { name: 'MediaFlow Studios', initial: 'M', color: 'bg-emerald-100 text-emerald-700', sub: 'Brand Identity · Due today', bal: 1800 },
              { name: 'Kuro Tech Labs', initial: 'K', color: 'bg-rose-100 text-rose-700', sub: 'Retainer Nov · Paid Oct 28', bal: 0 },
              { name: 'Monolith Design', initial: 'M', color: 'bg-purple-100 text-purple-700', sub: 'Web App UI · Due in 12 days', bal: 3200 },
              { name: 'Nexus Ventures', initial: 'N', color: 'bg-cyan-100 text-cyan-700', sub: 'Consulting · Due in 2 days', bal: 950 },
              { name: 'Solstice AI', initial: 'S', color: 'bg-amber-100 text-amber-700', sub: 'API Integration · Due in 8 days', bal: 4100 },
            ].map((c) => (
              <div
                key={c.name}
                onClick={handleOpenAddModal}
                className="bg-white rounded-3xl p-4 sm:p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-amber-100/60 flex items-center justify-between hover:border-amber-300 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <div className={`w-11 h-11 rounded-full ${c.color} flex items-center justify-center font-bold text-base shrink-0 shadow-sm`}>
                    {c.initial}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">{c.name}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{c.sub}</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-sm font-extrabold text-slate-900">
                    {formatCurrency(c.bal, currency)}
                  </p>
                  <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-0.5 ${
                    c.bal > 0 ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                  }`}>
                    {c.bal > 0 ? 'Pending' : 'Settled'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── SCREEN 5: STICKY FLOATING "+ ADD CLIENT" BUTTON ── */}
      <div className="fixed bottom-24 left-0 right-0 max-w-md mx-auto px-4 z-30 pointer-events-none">
        <button
          onClick={handleOpenAddModal}
          className="w-full py-4 px-6 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-xl shadow-amber-500/30 flex items-center justify-center gap-2 pointer-events-auto fab-btn cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          <span>Add Client</span>
        </button>
      </div>
      </div>

      {/* View Full Client Details Modal */}
      {viewingClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#0D0E16] border border-white/10 rounded-2xl p-6 max-w-xl w-full shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Building className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{viewingClient.name}</h2>
                  <span className="text-xs text-zinc-400">Client Profile & Ledger History</span>
                </div>
              </div>
              <button
                onClick={() => setViewingClient(null)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contact Info Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-[#08090E] border border-white/5 flex items-center gap-3">
                <Phone className="w-4 h-4 text-amber-400" />
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-bold block">Phone</span>
                  <span className="text-xs font-semibold text-white">{viewingClient.phone || 'Not provided'}</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-[#08090E] border border-white/5 flex items-center gap-3">
                <Mail className="w-4 h-4 text-indigo-400" />
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-bold block">Email</span>
                  <span className="text-xs font-semibold text-white">{viewingClient.email || 'Not provided'}</span>
                </div>
              </div>
            </div>

            {/* Full Financial Ledger Card */}
            <div className="p-4 rounded-xl bg-[#08090E] border border-amber-500/20 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">Financial Ledger Summary</h4>
              <div className="grid grid-cols-3 gap-3 text-center pt-2">
                <div className="p-3 rounded-xl bg-white/5">
                  <span className="text-[10px] text-zinc-400 block">Total Contract Billed</span>
                  <span className="text-base font-extrabold text-white mt-1 block">
                    {formatCurrency(Number(viewingClient.total_amount), currency)}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <span className="text-[10px] text-emerald-400 block">Paid Amount</span>
                  <span className="text-base font-extrabold text-emerald-400 mt-1 block">
                    {formatCurrency(Number(viewingClient.paid_amount), currency)}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <span className="text-[10px] text-amber-300 block">Pending Balance</span>
                  <span className="text-base font-extrabold text-amber-400 mt-1 block">
                    {formatCurrency(Number(viewingClient.balance_amount), currency)}
                  </span>
                </div>
              </div>
            </div>

            {/* Income Payments History List */}
            <div>
              <h4 className="text-xs font-bold text-white mb-3">Received Payments History</h4>
              {income.filter((i) => i.client_id === viewingClient.id).length === 0 ? (
                <div className="p-6 text-center text-zinc-500 bg-[#08090E] rounded-xl text-xs border border-white/5">
                  No payment history recorded yet for this client.
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {income
                    .filter((i) => i.client_id === viewingClient.id)
                    .map((inc) => (
                      <div
                        key={inc.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-[#08090E] border border-white/5 text-xs"
                      >
                        <div>
                          <p className="font-semibold text-white">{inc.description || 'Income Payment'}</p>
                          <span className="text-[11px] text-zinc-400">{formatDate(inc.date)}</span>
                        </div>
                        <span className="font-bold text-emerald-400">+{formatCurrency(Number(inc.amount), currency)}</span>
                      </div>
                    ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-white/10">
              <button
                onClick={() => setViewingClient(null)}
                className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-all"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receive Payment Modal */}
      {paymentModalClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#0D0E16] border border-emerald-500/30 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Record Payment Received</h3>
                  <p className="text-xs text-zinc-400">{paymentModalClient.name}</p>
                </div>
              </div>
              <button
                onClick={() => setPaymentModalClient(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs flex justify-between items-center text-amber-300">
              <span>Current Pending Balance:</span>
              <span className="font-bold text-amber-400">{formatCurrency(Number(paymentModalClient.balance_amount), currency)}</span>
            </div>

            <form onSubmit={handleReceivePaymentSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Amount Received ({currency})</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full bg-[#08090E] border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Description</label>
                <input
                  type="text"
                  placeholder="e.g. Phase 1 Payment"
                  value={payDescription}
                  onChange={(e) => setPayDescription(e.target.value)}
                  className="w-full bg-[#08090E] border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="Additional notes"
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  className="w-full bg-[#08090E] border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setPaymentModalClient(null)}
                  className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={payLoading}
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25 transition-all"
                >
                  {payLoading ? 'Saving...' : 'Record Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Client Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#08090E] border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">
              {editingClient ? 'Edit Client Ledger' : 'Add New Client'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Client Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Acme Corp / John Doe"
                  className="w-full bg-[#0D0E16] border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="client@acme.com"
                    className="w-full bg-[#0D0E16] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-[#0D0E16] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Total Billed Full Amount ({currency})</label>
                  <input
                    type="number"
                    step="0.01"
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-[#0D0E16] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Paid / Collected ({currency})</label>
                  <input
                    type="number"
                    step="0.01"
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-[#0D0E16] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full bg-[#0D0E16] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 text-sm font-semibold rounded-xl bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-600/25 transition-all"
                >
                  {loading ? 'Saving...' : editingClient ? 'Update Client' : 'Save Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
