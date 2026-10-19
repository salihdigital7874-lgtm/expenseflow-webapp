import React, { useState, useEffect, useRef } from 'react';
import {
  User,
  Building,
  Save,
  ShieldCheck,
  Sparkles,
  Upload,
  RotateCcw,
  Palette,
  Image as ImageIcon,
  Type,
  Check,
  Trash2,
  Lock,
  Receipt,
  TrendingUp,
  Users,
  PieChart,
  Languages,
} from 'lucide-react';
import { Profile } from '../types/database';
import { updateProfile } from '../services/profiles';
import { useAppBrand } from '../context/BrandContext';
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

const ACCENT_COLORS = [
  { id: 'indigo', name: 'Blue', color: '#3b82f6', bg: 'bg-blue-500' },
  { id: 'violet', name: 'Violet', color: '#8b5cf6', bg: 'bg-purple-500' },
  { id: 'emerald', name: 'Emerald', color: '#10b981', bg: 'bg-emerald-500' },
  { id: 'amber', name: 'Amber', color: '#f59e0b', bg: 'bg-amber-500' },
  { id: 'rose', name: 'Rose', color: '#f43f5e', bg: 'bg-rose-500' },
  { id: 'cyan', name: 'Cyan', color: '#06b6d4', bg: 'bg-cyan-500' },
  { id: 'pink', name: 'Pink', color: '#ec4899', bg: 'bg-pink-500' },
  { id: 'slate', name: 'Dark', color: '#0f172a', bg: 'bg-slate-900' },
];

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
  const { branding, updateBranding, resetLogo } = useAppBrand();

  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [companyName, setCompanyName] = useState(profile?.company_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [currency, setCurrency] = useState(profile?.currency || 'INR');

  // Branding states
  const [appName, setAppName] = useState(branding.appName);
  const [appSubtitle, setAppSubtitle] = useState(branding.appSubtitle);
  const [appLogo, setAppLogo] = useState(branding.appLogo);
  const [accentColor, setAccentColor] = useState(branding.accentColor);
  const [uploadError, setUploadError] = useState('');

  const [loading, setLoading] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    setAppName(branding.appName);
    setAppSubtitle(branding.appSubtitle);
    setAppLogo(branding.appLogo);
    setAccentColor(branding.accentColor);
  }, [branding]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setUploadError('');

    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        setUploadError('Image size must be less than 3MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAppLogo(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      updateBranding({
        appName: appName.trim() || 'Salih Expense',
        appSubtitle: appSubtitle.trim() || 'Business Portal',
        appLogo,
        accentColor,
      });

      const updated = await updateProfile(userId, {
        full_name: fullName,
        company_name: companyName,
        phone,
        currency,
      });

      onProfileUpdated(updated);
      showToast('App Branding & Settings saved successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResetLogo = () => {
    resetLogo();
    setAppLogo('/app-icon.jpg');
    showToast('App Logo reset to default', 'info');
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
        {/* Screen 10: Customize App White Pastel Card (STAGGER 1) */}
        <div className="bg-white rounded-3xl p-6 shadow-[0_4px_25px_rgba(0,0,0,0.03)] border border-slate-100 space-y-5 stagger-1">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900 tracking-tight">Customize App</h2>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              Screen 10
            </span>
          </div>

          {/* App Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">App Name</label>
            <input
              type="text"
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              placeholder="Salih Expense"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Subtitle */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">Subtitle</label>
            <input
              type="text"
              value={appSubtitle}
              onChange={(e) => setAppSubtitle(e.target.value)}
              placeholder="Business Portal"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* App Logo */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">App Logo</label>
            <div className="flex items-center gap-4">
              <img
                src={appLogo}
                alt="App Logo"
                className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shadow-sm shrink-0"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/app-icon.jpg';
                }}
              />
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={logoInputRef}
                  onChange={handleImageUpload}
                  accept="image/png, image/jpeg, image/webp, image/svg+xml"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all btn-press"
                >
                  Change
                </button>
                <button
                  type="button"
                  onClick={handleResetLogo}
                  className="px-3 py-2 rounded-xl text-slate-400 hover:text-slate-600 text-xs font-semibold btn-press"
                >
                  Reset
                </button>
              </div>
            </div>
            {uploadError && <p className="text-xs text-rose-500 font-bold">{uploadError}</p>}
          </div>

          {/* Accent Color: 8 Swatches */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">Accent Color</label>
            <div className="flex items-center gap-3 overflow-x-auto py-1">
              {ACCENT_COLORS.map((c) => {
                const isSelected = accentColor === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setAccentColor(c.id)}
                    className={`w-9 h-9 rounded-full ${c.bg} flex items-center justify-center transition-transform cursor-pointer shrink-0 btn-press ${
                      isSelected ? 'ring-4 ring-offset-2 ring-blue-500 scale-110' : 'opacity-90 hover:opacity-100'
                    }`}
                  >
                    {isSelected && <Check className="w-4 h-4 text-white stroke-[3]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Currency */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="AED">AED (AED)</option>
            </select>
          </div>

          {/* Save Changes button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer btn-press"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Saving Changes...' : 'Save Changes'}</span>
          </button>
        </div>

        {/* Profile & Business Details (STAGGER 2) */}
        <div className="bg-white rounded-3xl p-6 shadow-[0_4px_25px_rgba(0,0,0,0.03)] border border-slate-100 space-y-4 stagger-2">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <User className="w-4 h-4 text-blue-600" />
            <span>Profile & Business Information</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Muhammed Salih"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-600 mb-1">Company / Studio Name</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Acme Studio"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Voice Translator Shortcut */}
        {onNavigate && (
          <div className="bg-white rounded-3xl p-5 shadow-[0_4px_25px_rgba(0,0,0,0.03)] border border-slate-100 flex items-center justify-between">
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
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
            >
              Open
            </button>
          </div>
        )}

        {/* Data Reset & Protection Management Section */}
        <div className="bg-white rounded-3xl p-6 shadow-[0_4px_25px_rgba(0,0,0,0.03)] border border-rose-100 space-y-4">
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
              className="p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:border-rose-200 text-left transition-all group"
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
              className="p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:border-emerald-200 text-left transition-all group"
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
              className="p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:border-amber-200 text-left transition-all group"
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
              className="p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:border-purple-200 text-left transition-all group"
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
              className="w-full py-3 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs border border-rose-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
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
