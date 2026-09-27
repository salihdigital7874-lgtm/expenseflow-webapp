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
  AlertTriangle,
  Receipt,
  TrendingUp,
  Users,
  PieChart,
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
}

const ACCENT_COLORS = [
  { id: 'indigo', name: 'Indigo Blue', bg: 'bg-indigo-600' },
  { id: 'emerald', name: 'Emerald Green', bg: 'bg-emerald-600' },
  { id: 'violet', name: 'Violet Purple', bg: 'bg-violet-600' },
  { id: 'cyan', name: 'Cyan Tech', bg: 'bg-cyan-600' },
  { id: 'rose', name: 'Rose Red', bg: 'bg-rose-600' },
  { id: 'amber', name: 'Amber Gold', bg: 'bg-amber-600' },
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
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">App Branding & Account Settings</h1>
        <p className="text-sm text-zinc-400 mt-1">
          Customize your Application Name, Logo Icon, Tagline, Business Profile, Currency format, and Data Reset Management.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* App Branding & Customization Box */}
        <div className="bg-[#08090E] border border-indigo-500/30 rounded-2xl p-6 space-y-5 relative overflow-hidden shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <span>App Identity & Custom Branding</span>
            </h3>
            <span className="text-xs text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full font-medium">
              Live App Branding
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* App Name */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <Type className="w-3.5 h-3.5 text-indigo-400" />
                <span>Application Name</span>
              </label>
              <input
                type="text"
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                placeholder="e.g. Salih Expense, My Business App..."
                className="w-full bg-[#0D0E16] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                required
              />
              <p className="text-[11px] text-zinc-400 mt-1">
                App name displayed in sidebar, mobile header, and browser title.
              </p>
            </div>

            {/* App Subtitle */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Tagline / Subtitle
              </label>
              <input
                type="text"
                value={appSubtitle}
                onChange={(e) => setAppSubtitle(e.target.value)}
                placeholder="e.g. Business Portal, Financial Ledger..."
                className="w-full bg-[#0D0E16] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
              />
              <p className="text-[11px] text-zinc-400 mt-1">Sub-heading shown under the main logo.</p>
            </div>
          </div>

          {/* Logo Uploader */}
          <div className="pt-2 border-t border-white/10 space-y-3">
            <label className="block text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
              <span>App Logo Icon</span>
            </label>

            <div className="flex items-center gap-4">
              <img
                src={appLogo}
                alt="App Logo"
                className="w-16 h-16 rounded-2xl object-cover border border-indigo-500/40 shadow-xl shrink-0"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/app-icon.jpg';
                }}
              />

              <div className="flex-1 space-y-2">
                <input
                  type="file"
                  ref={logoInputRef}
                  onChange={handleImageUpload}
                  accept="image/png, image/jpeg, image/webp, image/svg+xml"
                  className="hidden"
                />

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-600/30 text-xs font-semibold transition-all"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Custom Logo</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResetLogo}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-zinc-300 hover:bg-white/10 text-xs font-medium transition-all"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Logo</span>
                  </button>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Upload custom PNG/JPG image or SVG file for your app logo.
                </p>
                {uploadError && <p className="text-xs text-rose-400 font-medium">{uploadError}</p>}
              </div>
            </div>
          </div>

          {/* Accent Color */}
          <div className="pt-2 border-t border-white/10 space-y-2">
            <label className="block text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-indigo-400" />
              <span>Theme Accent Color</span>
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {ACCENT_COLORS.map((c) => {
                const isSelected = accentColor === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setAccentColor(c.id)}
                    className={`flex items-center gap-2 p-2 rounded-xl border transition-all ${
                      isSelected
                        ? 'border-indigo-500 bg-white/10 text-white font-semibold'
                        : 'border-white/10 hover:border-white/20 bg-[#0D0E16] text-zinc-400'
                    }`}
                  >
                    <span className={`w-4 h-4 rounded-full ${c.bg} shrink-0`} />
                    <span className="text-xs truncate">{c.name.split(' ')[0]}</span>
                    {isSelected && <Check className="w-3 h-3 text-indigo-400 ml-auto" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Profile Details Box */}
        <div className="bg-[#08090E] border border-white/10 rounded-2xl p-6 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-400" />
            <span>Personal Profile</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Muhammed Salih"
                className="w-full bg-[#0D0E16] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full bg-[#0D0E16] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Business Details Box */}
        <div className="bg-[#08090E] border border-white/10 rounded-2xl p-6 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Building className="w-5 h-5 text-indigo-400" />
            <span>Business Entity & Currency</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Company / Studio Name</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Acme Enterprises"
                className="w-full bg-[#0D0E16] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Default Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full bg-[#0D0E16] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="AED">AED (AED)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Security & Database Status Box */}
        <div className="bg-[#08090E] border border-white/10 rounded-2xl p-6 space-y-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>Database & Security Architecture</span>
          </h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            All user data is stored securely in Supabase PostgreSQL and isolated with Row Level Security (RLS) policies.
          </p>
        </div>

        {/* Data Reset & Protection Management Section */}
        <div className="bg-[#08090E] border border-rose-500/30 rounded-2xl p-6 space-y-5 relative overflow-hidden shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h3 className="text-base font-bold text-rose-400 flex items-center gap-2">
                <Lock className="w-5 h-5 text-rose-400" />
                <span>Data Reset & Protection Management</span>
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Password authentication is required before wiping or resetting any stored transactions or ledgers.
              </p>
            </div>
            <span className="text-[10px] uppercase tracking-wider font-extrabold px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 shrink-0">
              Auth Protected
            </span>
          </div>

          {/* Quick Individual Module Reset Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
            {/* Reset Expenses */}
            <button
              type="button"
              onClick={() =>
                triggerResetModal(
                  'expenses',
                  'Reset Expenses Records',
                  'Are you sure you want to delete all recorded expenses? Password authentication is required.'
                )
              }
              className="flex items-center gap-3 p-3.5 rounded-xl bg-[#0D0E16] border border-white/10 hover:border-rose-500/40 text-zinc-300 hover:text-white transition-all text-left group"
            >
              <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 group-hover:bg-rose-500/20 transition-all">
                <Receipt className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold block text-white">Reset Expenses</span>
                <span className="text-[10px] text-zinc-400">Clear expense log</span>
              </div>
            </button>

            {/* Reset Income */}
            <button
              type="button"
              onClick={() =>
                triggerResetModal(
                  'income',
                  'Reset Income Records',
                  'Are you sure you want to delete all recorded income revenue? Password authentication is required.'
                )
              }
              className="flex items-center gap-3 p-3.5 rounded-xl bg-[#0D0E16] border border-white/10 hover:border-rose-500/40 text-zinc-300 hover:text-white transition-all text-left group"
            >
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20 transition-all">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold block text-white">Reset Income</span>
                <span className="text-[10px] text-zinc-400">Clear income log</span>
              </div>
            </button>

            {/* Reset Client Ledgers */}
            <button
              type="button"
              onClick={() =>
                triggerResetModal(
                  'clients',
                  'Reset Client Ledgers',
                  'Are you sure you want to delete all client directory and outstanding balances? Password authentication is required.'
                )
              }
              className="flex items-center gap-3 p-3.5 rounded-xl bg-[#0D0E16] border border-white/10 hover:border-rose-500/40 text-zinc-300 hover:text-white transition-all text-left group"
            >
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 group-hover:bg-amber-500/20 transition-all">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold block text-white">Reset Clients</span>
                <span className="text-[10px] text-zinc-400">Clear client list</span>
              </div>
            </button>

            {/* Reset Budgets */}
            <button
              type="button"
              onClick={() =>
                triggerResetModal(
                  'budgets',
                  'Reset Budget Limits',
                  'Are you sure you want to clear all budget allocation limits? Password authentication is required.'
                )
              }
              className="flex items-center gap-3 p-3.5 rounded-xl bg-[#0D0E16] border border-white/10 hover:border-rose-500/40 text-zinc-300 hover:text-white transition-all text-left group"
            >
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500/20 transition-all">
                <PieChart className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold block text-white">Reset Budgets</span>
                <span className="text-[10px] text-zinc-400">Clear budget limits</span>
              </div>
            </button>
          </div>

          {/* Full Application Data Wipe */}
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-3">
            <div>
              <h4 className="text-sm font-bold text-rose-300 flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-rose-400" />
                <span>Complete Application Data Wipe</span>
              </h4>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Permanently erase all expenses, income, client ledgers, and budget allocations in one step. Requires password authorization.
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                triggerResetModal(
                  'all',
                  'Password Authentication Required: Full Data Wipe',
                  'This will permanently delete all application data including expenses, income, client balances, and budgets. Please enter your account password to authorize.'
                )
              }
              className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition-all"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Authenticate & Reset All Data</span>
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{loading ? 'Saving Changes...' : 'Save Settings & Branding'}</span>
        </button>
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
