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
  DollarSign,
  Mail,
  Phone,
  MapPin,
  Globe,
  Moon,
  Sun,
  Monitor,
  Bell,
  Shield,
  Cloud,
  Download,
  Camera,
  ChevronRight,
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

  // Desktop Screen 11 sub-navigation & preferences states
  const [activeSubSection, setActiveSubSection] = useState<'profile' | 'preferences' | 'notifications' | 'security' | 'backup' | 'export'>('profile');
  const [themePreference, setThemePreference] = useState<'Light' | 'Dark' | 'System'>('Light');
  const [language, setLanguage] = useState('English');
  const [location, setLocation] = useState('Perinthalmanna, Kerala');
  const [startWeekOn, setStartWeekOn] = useState('Monday');

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
    <div className="space-y-6 pb-28">
      {/* ── DESKTOP VIEW (lg:) SCREEN 11 (SETTINGS & MORE) ── */}
      <div className="hidden lg:block space-y-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Column: Sub-navigation (3 cols) */}
          <div className="col-span-3 bg-white rounded-3xl p-4 border border-slate-100 shadow-xs h-fit space-y-1.5">
            {[
              { id: 'profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
              { id: 'preferences', label: 'Preferences', icon: <Globe className="w-4 h-4" /> },
              { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
              { id: 'security', label: 'Security', icon: <Shield className="w-4 h-4" /> },
              { id: 'backup', label: 'Backup & Sync', icon: <Cloud className="w-4 h-4" /> },
              { id: 'export', label: 'Export Data', icon: <Download className="w-4 h-4" /> },
            ].map((sub) => {
              const isActive = activeSubSection === sub.id;
              return (
                <button
                  key={sub.id}
                  onClick={() => setActiveSubSection(sub.id as any)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all btn-press ${
                    isActive
                      ? 'bg-purple-100 text-purple-700 shadow-2xs font-extrabold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-semibold'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={isActive ? 'text-purple-700' : 'text-slate-400'}>{sub.icon}</span>
                    <span>{sub.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-4 h-4 text-purple-600" />}
                </button>
              );
            })}
          </div>

          {/* Center Column: Profile Information (5 cols) */}
          <div className="col-span-5 bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-5">
            <div className="pb-4 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900">Profile Information</h3>
              <p className="text-xs text-slate-400 font-medium">Update your personal account details</p>
            </div>

            {/* Avatar & Change Photo */}
            <div className="flex items-center gap-4">
              <img
                src={profile?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=140&auto=format&fit=crop&q=80'}
                alt="Salih"
                className="w-16 h-16 rounded-full object-cover border-2 border-purple-100 shadow-xs"
              />
              <div>
                <button
                  type="button"
                  onClick={() => showToast('Photo uploaded successfully!', 'success')}
                  className="px-4 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs border border-purple-200 transition-colors btn-press"
                >
                  Change Photo
                </button>
                <p className="text-[11px] text-slate-400 mt-1">JPG, GIF or PNG. Max size 2MB</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Salih"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address</label>
                <input
                  type="email"
                  disabled
                  value={userEmail || 'salih@example.com'}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold bg-slate-50 text-slate-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Perinthalmanna, Kerala"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-purple-600/30 transition-all btn-press"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: App Preferences (4 cols) */}
          <div className="col-span-4 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-5">
              <div className="pb-4 border-b border-slate-100">
                <h3 className="text-base font-black text-slate-900">App Preferences</h3>
                <p className="text-xs text-slate-400 font-medium">Interface and display options</p>
              </div>

              {/* Theme Segmented Control */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Theme</label>
                <div className="grid grid-cols-3 gap-1.5 bg-slate-100/80 p-1 rounded-2xl border border-slate-200/80">
                  {(['Light', 'Dark', 'System'] as const).map((thm) => (
                    <button
                      type="button"
                      key={thm}
                      onClick={() => setThemePreference(thm)}
                      className={`py-2 rounded-xl text-xs font-bold transition-all ${
                        themePreference === thm
                          ? 'bg-white text-slate-900 shadow-xs font-extrabold'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      {thm}
                    </button>
                  ))}
                </div>
              </div>

              {/* Language */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500/20 bg-white"
                >
                  <option value="English">English</option>
                  <option value="Malayalam">Malayalam</option>
                  <option value="Arabic">Arabic</option>
                  <option value="Hindi">Hindi</option>
                </select>
              </div>

              {/* Currency */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500/20 bg-white"
                >
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="AED">AED (AED)</option>
                </select>
              </div>

              {/* Start Week On */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Start Week On</label>
                <select
                  value={startWeekOn}
                  onChange={(e) => setStartWeekOn(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500/20 bg-white"
                >
                  <option value="Monday">Monday</option>
                  <option value="Sunday">Sunday</option>
                  <option value="Saturday">Saturday</option>
                </select>
              </div>
            </div>

            {/* Quick Data Protection Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-3">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-purple-600" /> Security & Protection
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Reset specific ledgers or wipe test data with password verification.
              </p>
              <button
                type="button"
                onClick={() =>
                  triggerResetModal(
                    'all',
                    'Password Authentication Required: Full Data Wipe',
                    'This will permanently delete all application data. Please enter password to authorize.'
                  )
                }
                className="w-full py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs border border-rose-200 transition-colors btn-press"
              >
                Reset Database Records
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── MOBILE VIEW (<lg) ── */}
      <div className="block lg:hidden space-y-4">
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

        {/* Data Reset & Protection Management Section (STAGGER 2) */}
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
      </div>

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
