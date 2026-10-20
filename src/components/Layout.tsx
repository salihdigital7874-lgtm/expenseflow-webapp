import React, { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard,
  Home,
  Receipt,
  TrendingUp,
  Users,
  PieChart,
  BarChart3,
  Settings as SettingsIcon,
  LogOut,
  X,
  Search,
  Sparkles,
  Heart,
  MoreHorizontal,
  ChevronUp,
  ChevronRight,
  ChevronDown,
  HelpCircle,
  ChevronLeft,
  Bell,
  Plus,
  CheckSquare,
  Target,
  Calendar,
  FileText,
} from 'lucide-react';
import { Profile } from '../types/database';
import { useAppBrand } from '../context/BrandContext';
import { EditBrandingModal } from './EditBrandingModal';
import { DEFAULT_BRANDING } from '../types/branding';
import { QuickAddTransactionModal } from './QuickAddTransactionModal';

export type TabType =
  | 'dashboard'
  | 'tasks'
  | 'expenses'
  | 'income'
  | 'health'
  | 'goals'
  | 'clients'
  | 'calendar'
  | 'notes'
  | 'analytics'
  | 'settings'
  | 'budgets'
  | 'reports';

interface LayoutProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  onSearch?: (query: string) => void;
  userEmail?: string | null;
  profile?: Profile | null;
  onLogout: () => void;
  showToast?: (msg: string, type: 'success' | 'error' | 'warning' | 'info') => void;
  currency?: string;
  onAddExpense?: (data: any) => Promise<void>;
  onAddIncome?: (data: any) => Promise<void>;
  children: React.ReactNode;
}

// Tab Pastel Background Themes matching the LifeSync design
const TAB_THEMES: Record<
  TabType,
  {
    bg: string;
    textColor: string;
    headerTitle: string;
    showSearchOnMobile?: boolean;
    headerIcon?: React.ReactNode;
  }
> = {
  dashboard: {
    bg: 'bg-gradient-to-b from-[#ECE7FB] via-[#E8E2FA] to-[#E2DCF8]',
    textColor: 'text-slate-900',
    headerTitle: 'Home',
  },
  tasks: {
    bg: 'bg-gradient-to-b from-[#EDE9FE] via-[#F5F3FF] to-[#FFFFFF]',
    textColor: 'text-slate-900',
    headerTitle: 'Tasks',
  },
  expenses: {
    bg: 'bg-gradient-to-b from-[#F3E8FF] via-[#FAF5FF] to-[#FFFFFF]',
    textColor: 'text-slate-900',
    headerTitle: 'Expenses',
    showSearchOnMobile: true,
  },
  income: {
    bg: 'bg-gradient-to-b from-[#DCFCE7] via-[#F0FDF4] to-[#FFFFFF]',
    textColor: 'text-slate-900',
    headerTitle: 'Income',
    showSearchOnMobile: true,
  },
  health: {
    bg: 'bg-gradient-to-b from-[#FFE4E6] via-[#FFF1F2] to-[#FFFFFF]',
    textColor: 'text-slate-900',
    headerTitle: 'Health',
    headerIcon: <Heart className="w-6 h-6 text-rose-500 fill-rose-500" />,
  },
  goals: {
    bg: 'bg-gradient-to-b from-[#FEF3C7] via-[#FFFBEB] to-[#FFFFFF]',
    textColor: 'text-slate-900',
    headerTitle: 'Goals',
  },
  clients: {
    bg: 'bg-gradient-to-b from-[#FEF3C7] via-[#FFFBEB] to-[#FFFFFF]',
    textColor: 'text-slate-900',
    headerTitle: 'Clients',
    showSearchOnMobile: true,
  },
  calendar: {
    bg: 'bg-gradient-to-b from-[#E0E7FF] via-[#EEF2FF] to-[#FFFFFF]',
    textColor: 'text-slate-900',
    headerTitle: 'Calendar',
  },
  notes: {
    bg: 'bg-gradient-to-b from-[#FEF9C3] via-[#FEFCE8] to-[#FFFFFF]',
    textColor: 'text-slate-900',
    headerTitle: 'Notes',
  },
  analytics: {
    bg: 'bg-gradient-to-b from-[#E0F2FE] via-[#F0F9FF] to-[#FFFFFF]',
    textColor: 'text-slate-900',
    headerTitle: 'Analytics',
    headerIcon: <BarChart3 className="w-6 h-6 text-sky-600" />,
  },
  settings: {
    bg: 'bg-gradient-to-b from-[#F8FAFC] via-[#FFFFFF] to-[#F1F5F9]',
    textColor: 'text-slate-900',
    headerTitle: 'Settings & More',
  },
  budgets: {
    bg: 'bg-gradient-to-b from-[#FFEDD5] via-[#FFF7ED] to-[#FFFFFF]',
    textColor: 'text-slate-900',
    headerTitle: 'Budgets',
    headerIcon: <PieChart className="w-6 h-6 text-rose-500" />,
  },
  reports: {
    bg: 'bg-gradient-to-b from-[#E0F2FE] via-[#F0F9FF] to-[#FFFFFF]',
    textColor: 'text-slate-900',
    headerTitle: 'Reports',
    headerIcon: <BarChart3 className="w-6 h-6 text-sky-600" />,
  },
};

const TAB_ORDER: TabType[] = [
  'dashboard',
  'tasks',
  'expenses',
  'income',
  'health',
  'goals',
  'clients',
  'calendar',
  'notes',
  'analytics',
  'settings',
  'budgets',
  'reports',
];

export const Layout: React.FC<LayoutProps> = ({
  currentTab,
  onSelectTab,
  onSearch,
  userEmail,
  profile,
  onLogout,
  showToast,
  currency = '₹',
  onAddExpense,
  onAddIncome,
  children,
}) => {
  const [moreSheetOpen, setMoreSheetOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [brandingModalOpen, setBrandingModalOpen] = useState(false);
  const moreSheetRef = useRef<HTMLDivElement>(null);

  // Tab Transition Direction Handling
  const [prevTab, setPrevTab] = useState<TabType>(currentTab);
  const [transitionClass, setTransitionClass] = useState<string>('screen-transition-fade');

  useEffect(() => {
    if (currentTab !== prevTab) {
      const prevIdx = TAB_ORDER.indexOf(prevTab);
      const currIdx = TAB_ORDER.indexOf(currentTab);
      if (currIdx > prevIdx) {
        setTransitionClass('screen-transition-right');
      } else {
        setTransitionClass('screen-transition-left');
      }
      setPrevTab(currentTab);
    }
  }, [currentTab, prevTab]);

  const { branding } = useAppBrand();

  // Close "More" sheet on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (moreSheetRef.current && !moreSheetRef.current.contains(e.target as Node)) {
        setMoreSheetOpen(false);
      }
    };
    if (moreSheetOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [moreSheetOpen]);

  // 11 Mockup Navigation items in order
  const navItems: { id: TabType; label: string; shortLabel: string; icon: React.ReactNode; color: string }[] = [
    { id: 'dashboard', label: 'Home', shortLabel: 'Home', icon: <Home className="w-5 h-5" />, color: '#7C3AED' },
    { id: 'tasks', label: 'Tasks', shortLabel: 'Tasks', icon: <CheckSquare className="w-5 h-5" />, color: '#7C3AED' },
    { id: 'expenses', label: 'Expenses', shortLabel: 'Expenses', icon: <Receipt className="w-5 h-5" />, color: '#F43F5E' },
    { id: 'income', label: 'Income', shortLabel: 'Income', icon: <TrendingUp className="w-5 h-5" />, color: '#10B981' },
    { id: 'health', label: 'Health', shortLabel: 'Health', icon: <Heart className="w-5 h-5" />, color: '#F43F5E' },
    { id: 'goals', label: 'Goals', shortLabel: 'Goals', icon: <Target className="w-5 h-5" />, color: '#D97706' },
    { id: 'clients', label: 'Clients', shortLabel: 'Clients', icon: <Users className="w-5 h-5" />, color: '#3B82F6' },
    { id: 'calendar', label: 'Calendar', shortLabel: 'Calendar', icon: <Calendar className="w-5 h-5" />, color: '#6366F1' },
    { id: 'notes', label: 'Notes', shortLabel: 'Notes', icon: <FileText className="w-5 h-5" />, color: '#EAB308' },
    { id: 'analytics', label: 'Analytics', shortLabel: 'Analytics', icon: <BarChart3 className="w-5 h-5" />, color: '#0EA5E9' },
    { id: 'settings', label: 'More', shortLabel: 'More', icon: <MoreHorizontal className="w-5 h-5" />, color: '#64748B' },
  ];

  // More Menu tabs for mobile drawer
  const moreMenuTabs = [
    navItems.find((n) => n.id === 'tasks')!,
    navItems.find((n) => n.id === 'health')!,
    navItems.find((n) => n.id === 'goals')!,
    navItems.find((n) => n.id === 'clients')!,
    navItems.find((n) => n.id === 'calendar')!,
    navItems.find((n) => n.id === 'notes')!,
    navItems.find((n) => n.id === 'analytics')!,
    navItems.find((n) => n.id === 'settings')!,
  ];

  // Check if active tab is in "More" group
  const isActiveInMore = ['tasks', 'health', 'goals', 'clients', 'calendar', 'notes', 'analytics', 'settings', 'budgets', 'reports'].includes(currentTab);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && searchValue.trim()) {
      onSearch(searchValue.trim());
      onSelectTab('expenses');
    }
  };

  const handleMobileTabSelect = (tabId: TabType) => {
    onSelectTab(tabId);
    setMoreSheetOpen(false);
  };

  const currentTheme = TAB_THEMES[currentTab] || TAB_THEMES.dashboard;

  // Avatar URL (or fallback)
  const avatarUrl = profile?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=140&auto=format&fit=crop&q=80';

  return (
    <div className={`min-h-screen flex ${currentTheme.bg} ${currentTheme.textColor} transition-colors duration-500`}>

      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex w-64 flex-col fixed top-0 bottom-0 left-0 bg-white/90 backdrop-blur-2xl border-r border-purple-100/70 z-40 shadow-xs">
        {/* Brand Header */}
        <div
          onClick={() => setBrandingModalOpen(true)}
          className="p-5 border-b border-purple-100/60 flex items-center justify-between cursor-pointer group hover:bg-purple-50/40 transition-colors"
          title="Click to edit App Name & Logo"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white font-black text-lg shadow-md shadow-purple-500/20 shrink-0">
              ✦
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="font-black text-base leading-snug tracking-tight text-slate-900 truncate flex items-center gap-0.5">
                <span>{branding.appName}</span>
              </h1>
              <span className="text-xs text-purple-600 font-bold truncate block -mt-0.5">
                {branding.appSubtitle}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation (11 items) */}
        <nav className="flex-1 p-3.5 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all duration-150 btn-press ${
                  isActive
                    ? 'bg-purple-100 text-purple-700 shadow-2xs font-extrabold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60 font-semibold'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-purple-700' : 'text-slate-400'}>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
              </button>
            );
          })}
        </nav>

        {/* User Footer */}
        <div className="p-4 border-t border-purple-100/60 bg-purple-50/20">
          <div className="flex items-center justify-between">
            <div
              className="flex items-center gap-3 min-w-0 cursor-pointer"
              onClick={() => onSelectTab('settings')}
            >
              <div className="relative">
                <img
                  src={avatarUrl}
                  alt="User"
                  className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-xs shrink-0"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full shadow-xs" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">
                  {profile?.full_name || 'Salih'}
                </p>
                <p className="text-[11px] text-slate-500 truncate">{userEmail || 'salih@example.com'}</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              title="Sign Out"
              className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors btn-press"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 sticky top-0 z-30 px-4 sm:px-6 bg-white/75 backdrop-blur-xl border-b border-purple-100/60 shadow-xs flex items-center justify-between gap-4">
          {/* Desktop Top Header Layout (hidden on mobile) */}
          <div className="hidden lg:flex items-center justify-between w-full">
            {/* Page Title */}
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                {currentTheme.headerTitle}
              </h2>
            </div>

            {/* Right Group: Search + Bell + Avatar Profile */}
            <div className="flex items-center gap-3.5">
              <form onSubmit={handleSearchSubmit} className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder="Search anything..."
                  className="w-64 bg-slate-50/80 border border-slate-200/80 rounded-2xl pl-9 pr-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:bg-white transition-all shadow-2xs font-medium"
                />
              </form>

              {/* Notification Bell */}
              <button
                onClick={() => {
                  if (showToast) showToast('All notifications are up to date!', 'info');
                }}
                className="relative w-9 h-9 rounded-full bg-slate-50 border border-slate-200/80 shadow-2xs flex items-center justify-center text-slate-700 hover:text-purple-600 hover:bg-white transition-all btn-press"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
              </button>

              {/* User Profile Pill */}
              <div
                onClick={() => onSelectTab('settings')}
                className="flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-full bg-slate-50 hover:bg-white border border-slate-200/80 cursor-pointer shadow-2xs transition-all btn-press"
                title="Profile & Settings"
              >
                <div className="relative">
                  <img
                    src={avatarUrl}
                    alt="Salih"
                    className="w-7 h-7 rounded-full object-cover border border-white shadow-xs"
                  />
                  <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 border border-white rounded-full" />
                </div>
                <span className="text-xs font-bold text-slate-800">
                  {profile?.full_name?.split(' ')[0] || 'Salih'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 -ml-0.5" />
              </div>
            </div>
          </div>

          {/* Mobile Top Header Layout (flex on mobile, hidden on lg) */}
          <div className="flex lg:hidden items-center justify-between w-full">
            <div className="flex items-center gap-2.5 min-w-[70px]">
              {currentTab !== 'dashboard' ? (
                <button
                  onClick={() => onSelectTab('dashboard')}
                  className="flex items-center gap-1.5 text-slate-800 hover:text-purple-600 font-bold transition-colors btn-press px-2 py-1.5 rounded-xl hover:bg-white/80"
                >
                  <ChevronLeft className="w-5 h-5 text-slate-700" />
                  <span className="text-sm font-bold hidden sm:inline">{currentTheme.headerTitle}</span>
                </button>
              ) : (
                <div className="w-[70px]" />
              )}
            </div>

            <div className="flex flex-col items-center justify-center text-center flex-1 min-w-0">
              <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 flex items-center justify-center gap-0.5 truncate">
                <span>{branding.appName}</span>
              </h1>
              <p className="text-[10px] sm:text-xs font-bold text-purple-600/90 tracking-wide -mt-0.5 truncate">
                {branding.appSubtitle}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0 min-w-[70px] justify-end">
              <button
                onClick={() => {
                  if (showToast) showToast('All notifications are up to date!', 'info');
                }}
                className="relative w-9 h-9 rounded-full bg-white/90 border border-purple-100/80 shadow-xs flex items-center justify-center text-slate-700 hover:text-purple-600 transition-all btn-press"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
              </button>

              <div
                onClick={() => onSelectTab('settings')}
                className="relative cursor-pointer group btn-press"
              >
                <img
                  src={avatarUrl}
                  alt="Profile"
                  className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-xs ring-1 ring-purple-100"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full shadow-xs" />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content Area with Fluid Horizontal Slide + Fade Directional Transition */}
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 pb-28 lg:pb-8 max-w-7xl w-full mx-auto">
          <div key={currentTab} className={transitionClass}>
            {children}
          </div>
        </main>
      </div>

      {/* ====== MOBILE FLOATING CLEAN GLASS BOTTOM TAB BAR ====== */}
      <div className="mobile-bottom-bar lg:hidden fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
        {/* "More" Bottom Sheet overlay */}
        {moreSheetOpen && (
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 mobile-sheet-overlay pointer-events-auto transition-opacity"
            onClick={() => setMoreSheetOpen(false)}
          />
        )}

        {/* "More" Bottom Sheet (Screen 9) */}
        <div
          ref={moreSheetRef}
          className={`mobile-more-sheet ${moreSheetOpen ? 'mobile-more-sheet--open' : ''} pointer-events-auto bg-white/95 backdrop-blur-2xl text-slate-900 border-t border-slate-200/80`}
        >
          {/* Sheet handle */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-10 h-1.5 rounded-full bg-slate-300" />
          </div>

          <div className="px-5 pb-3 flex items-center justify-between border-b border-slate-100">
            <span className="text-base font-extrabold text-slate-900">More</span>
            <div className="flex items-center gap-2">
              <img src={avatarUrl} alt="User" className="w-8 h-8 rounded-full object-cover border border-slate-200 shadow-xs" />
              <button
                onClick={() => setMoreSheetOpen(false)}
                className="p-1.5 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors ml-1 btn-press"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* More Menu Items matching Screen 9 */}
          <nav className="p-4 space-y-2">
            {moreMenuTabs.map((item, idx) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleMobileTabSelect(item.id)}
                  className={`w-full flex items-center justify-between p-3.5 rounded-2xl text-sm font-bold transition-all btn-press stagger-${Math.min(8, idx + 1)} ${
                    isActive
                      ? 'bg-sky-50 text-sky-900 border border-sky-200/70 shadow-xs'
                      : 'text-slate-800 hover:bg-slate-50 bg-white border border-slate-100 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs"
                      style={{
                        background:
                          item.id === 'clients'
                            ? '#DCFCE7'
                            : item.id === 'budgets'
                            ? '#FFEDD5'
                            : item.id === 'reports'
                            ? '#E0F2FE'
                            : '#F1F5F9',
                      }}
                    >
                      {item.icon}
                    </div>
                    <span>{item.label}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </button>
              );
            })}

            {/* Help & Support */}
            <div className="w-full flex items-center justify-between p-3.5 rounded-2xl text-sm font-bold text-slate-800 bg-white border border-slate-100 shadow-2xs cursor-pointer hover:bg-slate-50 btn-press">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 shrink-0 shadow-xs">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <span>Help & Support</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>

            {/* Sign Out Button */}
            <button
              onClick={() => {
                setMoreSheetOpen(false);
                onLogout();
              }}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold text-white bg-rose-500 hover:bg-rose-600 shadow-md shadow-rose-500/25 transition-all mt-4 cursor-pointer btn-press"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </nav>
        </div>

        {/* Floating Frosted Glass Bottom Navigation Bar with 5 slots matching Mockup */}
        <div className="mobile-tab-bar pointer-events-auto shadow-2xl shadow-purple-950/15 border border-white/90 bg-white/95 backdrop-blur-2xl rounded-[36px] max-w-[420px] mx-auto px-3 py-2">
          <div className="flex items-center justify-between relative">
            {/* 1. Home */}
            <button
              onClick={() => handleMobileTabSelect('dashboard')}
              className="flex-1 flex flex-col items-center justify-center py-1 transition-all btn-press"
            >
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                  currentTab === 'dashboard'
                    ? 'bg-[#7C3AED] text-white shadow-md shadow-purple-500/30'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <Home
                  className={`w-5 h-5 ${
                    currentTab === 'dashboard' ? 'fill-white text-white' : 'stroke-[1.8]'
                  }`}
                />
              </div>
              <span
                className={`text-[11px] mt-0.5 ${
                  currentTab === 'dashboard'
                    ? 'font-bold text-purple-700'
                    : 'font-medium text-slate-400'
                }`}
              >
                Home
              </span>
            </button>

            {/* 2. Expenses */}
            <button
              onClick={() => handleMobileTabSelect('expenses')}
              className="flex-1 flex flex-col items-center justify-center py-1 transition-all btn-press"
            >
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                  currentTab === 'expenses'
                    ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <Receipt
                  className={`w-5 h-5 ${
                    currentTab === 'expenses' ? 'stroke-[2.2]' : 'stroke-[1.8]'
                  }`}
                />
              </div>
              <span
                className={`text-[11px] mt-0.5 ${
                  currentTab === 'expenses'
                    ? 'font-bold text-rose-600'
                    : 'font-medium text-slate-400'
                }`}
              >
                Expenses
              </span>
            </button>

            {/* 3. Center Elevated Floating Quick Add (+) Button */}
            <div className="flex-1 flex items-center justify-center -mt-6">
              <button
                onClick={() => setQuickAddOpen(true)}
                className="w-13 h-13 rounded-full bg-gradient-to-tr from-[#7C3AED] via-purple-600 to-indigo-600 text-white shadow-xl shadow-purple-600/40 border-[3.5px] border-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all btn-press group"
                title="Quick Add Transaction"
              >
                <Plus className="w-6 h-6 stroke-[2.8]" />
              </button>
            </div>

            {/* 4. Income */}
            <button
              onClick={() => handleMobileTabSelect('income')}
              className="flex-1 flex flex-col items-center justify-center py-1 transition-all btn-press"
            >
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                  currentTab === 'income'
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <BarChart3
                  className={`w-5 h-5 ${
                    currentTab === 'income' ? 'stroke-[2.2]' : 'stroke-[1.8]'
                  }`}
                />
              </div>
              <span
                className={`text-[11px] mt-0.5 ${
                  currentTab === 'income'
                    ? 'font-bold text-emerald-600'
                    : 'font-medium text-slate-400'
                }`}
              >
                Income
              </span>
            </button>

            {/* 5. More */}
            <button
              onClick={() => setMoreSheetOpen(!moreSheetOpen)}
              className="flex-1 flex flex-col items-center justify-center py-1 transition-all btn-press"
            >
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                  isActiveInMore || moreSheetOpen
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-500/30'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <MoreHorizontal
                  className={`w-5 h-5 ${
                    isActiveInMore || moreSheetOpen ? 'stroke-[2.2]' : 'stroke-[1.8]'
                  }`}
                />
              </div>
              <span
                className={`text-[11px] mt-0.5 ${
                  isActiveInMore || moreSheetOpen
                    ? 'font-bold text-purple-700'
                    : 'font-medium text-slate-400'
                }`}
              >
                More
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Edit Branding Modal */}
      <EditBrandingModal
        isOpen={brandingModalOpen}
        onClose={() => setBrandingModalOpen(false)}
        showToast={showToast}
      />

      {/* Quick Add Transaction Modal */}
      <QuickAddTransactionModal
        isOpen={quickAddOpen}
        onClose={() => setQuickAddOpen(false)}
        onAddExpense={onAddExpense || (async () => {})}
        onAddIncome={onAddIncome || (async () => {})}
        currency={currency}
      />
    </div>
  );
};

export default Layout;
