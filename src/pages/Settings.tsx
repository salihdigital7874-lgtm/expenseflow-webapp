import React, { useState, useEffect } from 'react';
import {
  User,
  Building,
  Save,
  Trash2,
  Lock,
  Receipt,
  TrendingUp,
  Users,
  PieChart,
  Languages,
  DollarSign,
} from 'lucide-react';
import { Profile } from '../types/database';
import { updateProfile } from '../services/profiles';
import { ResetAuthModal } from '../components/ResetAuthModal';

interface SettingsProps {
  userId: string;
  userEmail?: string;
  isDemoMode?: boolean;
  profile: Profile | null;
  onProfileUpdated: (updated: Profile) => void;
  onResetDataWithAuth?: (
    type: 'all' | 'expenses' | 'income' | 'clients' | 'budgets',
    password: string
  ) => Promise<void>;
  onResetAllData?: () => void;
  showToast: (msg: string, type: 'success' | 'error' | 'warning' | 'info') => void;
  onNavigate?: (tab: any) => void;
}

export const Settings: React.FC<SettingsProps> = ({
  userId,
  userEmail,
  isDemoMode = false,
  profile,
  onProfileUpdated,
  onResetDataWithAuth,
  onResetAllData,
  showToast,
  onNavigate,
}) => {
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [companyName, setCompanyName] = useState(profile?.company_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [currency, setCurrency] = useState(profile?.currency || 'INR');

  const [loading, setLoading] = useState(false);

  // Data Reset Password Modal State
  const [resetModalState, setResetModalState] = useState<{
    isOpen: boolean;
    type: 'all' | 'expenses' | 'income' | 'clients' | 'budgets';
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: 'all',
    title: '',
    message: '',
  });

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setCompanyName(profile.company_name || '');
      setPhone(profile.phone || '');
      setCurrency(profile.currency || 'INR');
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updated = await updateProfile(userId, {
        full_name: fullName,
        company_name: companyName,
        phone,
        currency,
      });

      onProfileUpdated(updated);
      showToast('Settings saved successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const triggerResetModal = (
    type: 'all' | 'expenses' | 'income' | 'clients' | 'budgets',
    title: string,
    message: string
  ) => {
    setResetModalState({
      isOpen: true,
      type,
      title,
      message,
    });
  };

  const handleConfirmResetWithPassword = async (password: string) => {
    if (onResetDataWithAuth) {
      await onResetDataWithAuth(resetModalState.type, password);
    } else if (onResetAllData) {
      onResetAllData();
    }
    setResetModalState((prev) => ({ ...prev, isOpen: false }));
  };

  return (
    <div className="space-y-4 pb-28">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Profile & Business Details (STAGGER 1) */}
        <div className="bg-white rounded-3xl p-6 shadow-[0_4px_25px_rgba(0,0,0,0.03)] border border-slate-100 space-y-4 stagger-1">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              <span>Profile & Business Settings</span>
            </h3>
            <span className="text-xs font-semibold text-slate-400">Account Details</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Muhammed Salih"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Company / Studio Name</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Acme Studio"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-blue-600" />
                <span>Default Currency</span>
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="AED">AED (AED)</option>
              </select>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer btn-press"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Saving Changes...' : 'Save Settings'}</span>
            </button>
          </div>
        </div>

        {/* Voice Translator Shortcut (STAGGER 2) */}
        {onNavigate && (
          <div className="bg-white rounded-3xl p-5 shadow-[0_4px_25px_rgba(0,0,0,0.03)] border border-slate-100 flex items-center justify-between stagger-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                <Languages className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Voice Translator</h4>
                <p className="text-xs text-slate-400 font-medium">Speech recognition & audio engine</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('translator')}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all cursor-pointer btn-press"
            >
              Open
            </button>
          </div>
        )}

        {/* Data Reset & Protection Management Section (STAGGER 3) */}
        <div className="bg-white rounded-3xl p-6 shadow-[0_4px_25px_rgba(0,0,0,0.03)] border border-rose-100 space-y-4 stagger-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-rose-600 text-sm flex items-center gap-2">
                <Lock className="w-4 h-4 text-rose-500" />
                <span>Data Reset & Protection</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Password authentication required before wiping data.</p>
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-rose-50 text-rose-600 border border-rose-100">
              Protected
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <button
              type="button"
              onClick={() =>
                triggerResetModal(
                  'expenses',
                  'Reset Expenses Records',
                  'Are you sure you want to delete all recorded expenses? Password authentication is required.'
                )
              }
              className="p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:border-rose-200 text-left transition-all group btn-press"
            >
              <Receipt className="w-4 h-4 text-rose-500 mb-1" />
              <span className="text-xs font-bold block text-slate-800">Expenses</span>
              <span className="text-[10px] text-slate-400">Clear all</span>
            </button>

            <button
              type="button"
              onClick={() =>
                triggerResetModal(
                  'income',
                  'Reset Income Records',
                  'Are you sure you want to delete all recorded income revenue? Password authentication is required.'
                )
              }
              className="p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:border-emerald-200 text-left transition-all group btn-press"
            >
              <TrendingUp className="w-4 h-4 text-emerald-500 mb-1" />
              <span className="text-xs font-bold block text-slate-800">Income</span>
              <span className="text-[10px] text-slate-400">Clear all</span>
            </button>

            <button
              type="button"
              onClick={() =>
                triggerResetModal(
                  'clients',
                  'Reset Client Ledgers',
                  'Are you sure you want to delete all client directory and outstanding balances? Password authentication is required.'
                )
              }
              className="p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:border-amber-200 text-left transition-all group btn-press"
            >
              <Users className="w-4 h-4 text-amber-500 mb-1" />
              <span className="text-xs font-bold block text-slate-800">Clients</span>
              <span className="text-[10px] text-slate-400">Clear all</span>
            </button>

            <button
              type="button"
              onClick={() =>
                triggerResetModal(
                  'budgets',
                  'Reset Budget Limits',
                  'Are you sure you want to clear all budget allocation limits? Password authentication is required.'
                )
              }
              className="p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:border-purple-200 text-left transition-all group btn-press"
            >
              <PieChart className="w-4 h-4 text-purple-500 mb-1" />
              <span className="text-xs font-bold block text-slate-800">Budgets</span>
              <span className="text-[10px] text-slate-400">Clear all</span>
            </button>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() =>
                triggerResetModal(
                  'all',
                  'Password Authentication Required: Full Data Wipe',
                  'This will permanently delete all application data including expenses, income, client balances, and budgets. Please enter your account password to authorize.'
                )
              }
              className="w-full py-3 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs border border-rose-200 transition-all flex items-center justify-center gap-2 cursor-pointer btn-press"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Full Application Data Wipe (Password Protected)</span>
            </button>
          </div>
        </div>
      </form>

      {/* Reset Password Authentication Modal */}
      <ResetAuthModal
        isOpen={resetModalState.isOpen}
        title={resetModalState.title}
        message={resetModalState.message}
        userEmail={userEmail}
        isDemoMode={isDemoMode}
        onConfirm={handleConfirmResetWithPassword}
        onCancel={() => setResetModalState((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};
