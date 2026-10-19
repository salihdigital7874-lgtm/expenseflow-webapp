import React, { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard,
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
  Languages,
  MoreHorizontal,
  ChevronUp,
  ChevronRight,
  HelpCircle,
  ChevronLeft,
} from 'lucide-react';
import { Profile } from '../types/database';
import { useAppBrand } from '../context/BrandContext';
import { EditBrandingModal } from './EditBrandingModal';
import { DEFAULT_BRANDING } from '../types/branding';

export type TabType =
  | 'dashboard'
  | 'health'
  | 'translator'
  | 'expenses'
  | 'income'
  | 'clients'
  | 'budgets'
  | 'reports'
  | 'settings';

interface LayoutProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  onSearch?: (query: string) => void;
  userEmail?: string | null;
  profile?: Profile | null;
  onLogout: () => void;
  showToast?: (msg: string, type: 'success' | 'error' | 'warning' | 'info') => void;
  children: React.ReactNode;
}

// Tab Pastel Background Themes matching the 10 mobile screens
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
    bg: 'bg-gradient-to-b from-[#E0F2FE] via-[#F0F9FF] to-[#FFFFFF]',
    textColor: 'text-slate-900',
    headerTitle: 'ExpenseFlow',
  },
  health: {
    bg: 'bg-gradient-to-b from-[#FFE4E6] via-[#FFF1F2] to-[#FFFFFF]',
    textColor: 'text-slate-900',
    headerTitle: 'Health Suite',
    headerIcon: <Heart className="w-6 h-6 text-rose-500 fill-rose-500" />,
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
  clients: {
    bg: 'bg-gradient-to-b from-[#FEF3C7] via-[#FFFBEB] to-[#FFFFFF]',
    textColor: 'text-slate-900',
    headerTitle: 'Clients',
    showSearchOnMobile: true,
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
  translator: {
    bg: 'bg-gradient-to-b from-[#7C3AED] via-[#5B21B6] to-[#2E1065]',
    textColor: 'text-white',
    headerTitle: 'AI Voice Translator',
  },
  settings: {
    bg: 'bg-gradient-to-b from-[#F8FAFC] via-[#FFFFFF] to-[#F1F5F9]',
    textColor: 'text-slate-900',
    headerTitle: 'Customize App',
  },
};

const TAB_ORDER: TabType[] = [
  'dashboard',
  'health',
  'expenses',
  'income',
  'clients',
  'budgets',
  'reports',
  'translator',
  'settings',
];

export const Layout: React.FC<LayoutProps> = ({
  currentTab,
  onSelectTab,
  onSearch,
  userEmail,
  profile,
  onLogout,
  showToast,
  children,
}) => {
  const [moreSheetOpen, setMoreSheetOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [brandingModalOpen, setBrandingModalOpen] = useState(false);
  const moreSheetRef = useRef<HTMLDivElement>(null);

  // App Launch Splash Screen
  const [showLaunchScreen, setShowLaunchScreen] = useState(() => {
    return !sessionStorage.getItem('expenseflow_launched_session');
  });
  const [launchExiting, setLaunchExiting] = useState(false);

  useEffect(() => {
    if (showLaunchScreen) {
      const exitTimer = setTimeout(() => {
        setLaunchExiting(true);
        const closeTimer = setTimeout(() => {
          setShowLaunchScreen(false);
          sessionStorage.setItem('expenseflow_launched_session', 'true');
        }, 450);
        return () => clearTimeout(closeTimer);
      }, 1000);
      return () => clearTimeout(exitTimer);
    }
  }, [showLaunchScreen]);

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

  const navItems: { id: TabType; label: string; shortLabel: string; icon: React.ReactNode; color: string }[] = [
    { id: 'dashboard', label: 'Dashboard', shortLabel: 'Home', icon: <LayoutDashboard className="w-5 h-5 text-sky-600" />, color: '#0284C7' },
    { id: 'health', label: 'Health Suite', shortLabel: 'Health', icon: <Heart className="w-5 h-5 text-rose-500" />, color: '#F43F5E' },
    { id: 'expenses', label: 'My Expenses', shortLabel: 'Expenses', icon: <Receipt className="w-5 h-5 text-amber-500" />, color: '#F59E0B' },
    { id: 'income', label: 'Incoming Amount', shortLabel: 'Income', icon: <TrendingUp className="w-5 h-5 text-emerald-500" />, color: '#10B981' },
    { id: 'translator', label: 'Voice Translator', shortLabel: 'Translate', icon: <Languages className="w-5 h-5 text-purple-600" />, color: '#9333EA' },
    { id: 'clients', label: 'Client Balances', shortLabel: 'Clients', icon: <Users className="w-5 h-5 text-emerald-600" />, color: '#059669' },
    { id: 'budgets', label: 'Budgets', shortLabel: 'Budgets', icon: <PieChart className="w-5 h-5 text-orange-500" />, color: '#EA580C' },
    { id: 'reports', label: 'Reports & Exports', shortLabel: 'Reports', icon: <BarChart3 className="w-5 h-5 text-indigo-600" />, color: '#4F46E5' },
    { id: 'settings', label: 'Settings & Branding', shortLabel: 'Settings', icon: <SettingsIcon className="w-5 h-5 text-slate-600" />, color: '#475569' },
  ];

  // Mobile bottom bar: show first 4 tabs + "More"
  const mobileBottomTabs = navItems.slice(0, 4);
  const moreMenuTabs = navItems.slice(4);

  // Check if active tab is in "More" group
  const isActiveInMore = moreMenuTabs.some((item) => item.id === currentTab);

  // Active Bottom Index for Sliding Indicator Pill (0 to 4)
  const activeBottomIndex =
    currentTab === 'dashboard'
      ? 0
      : currentTab === 'health'
      ? 1
      : currentTab === 'expenses'
      ? 2
      : currentTab === 'income'
      ? 3
      : 4;

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
  const isTranslatorTab = currentTab === 'translator';

  // Avatar URL (or fallback)
  const avatarUrl = profile?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=140&auto=format&fit=crop&q=80';

  return (
    <div className={`min-h-screen flex ${currentTheme.bg} ${currentTheme.textColor} transition-colors duration-500`}>
      {/* ====== APP LAUNCH / SPLASH OVERLAY ====== */}
      {showLaunchScreen && (
        <div
          className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white/95 backdrop-blur-3xl transition-all ${
            launchExiting ? 'animate-launch-exit' : ''
          }`}
        >
          <div className="flex flex-col items-center gap-4 animate-launch-logo">
            <img
              src={branding.appLogo}
              alt={branding.appName}
              className="w-20 h-20 rounded-3xl object-cover shadow-2xl shadow-sky-500/25 border border-slate-100"
              onError={(e) => {
                (e.target as HTMLImageElement).src = DEFAULT_BRANDING.appLogo;
              }}
            />
            <div className="text-center">
              <h1 className="text-xl font-black text-slate-900 tracking-tight">{branding.appName}</h1>
              <p className="text-xs text-sky-600 font-bold mt-0.5">{branding.appSubtitle}</p>
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="w-2 h-2 rounded-full bg-sky-500 animate-ping" />
              <span className="text-[11px] font-semibold text-slate-400">Loading Executive Suite...</span>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex w-64 flex-col fixed top-0 bottom-0 left-0 bg-white/80 backdrop-blur-2xl border-r border-slate-200/80 z-40 shadow-sm">
        {/* Brand Header - Click to Edit */}
        <div
          onClick={() => setBrandingModalOpen(true)}
          className="p-5 border-b border-slate-100 flex items-center justify-between cursor-pointer group hover:bg-slate-50/70 transition-colors"
          title="Click to edit App Name & Logo"
        >
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={branding.appLogo}
              alt={branding.appName}
              className="w-10 h-10 rounded-2xl object-cover border border-sky-400/40 shadow-md shadow-sky-500/20 shrink-0"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src = DEFAULT_BRANDING.appLogo;
              }}
            />

            <div className="min-w-0 flex-1">
              <h1 className="font-extrabold text-base leading-snug tracking-tight text-slate-900 truncate">
                {branding.appName}
              </h1>
              <span className="text-xs text-sky-600 font-semibold truncate block">
                {branding.appSubtitle}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3.5 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 btn-press ${
                  isActive
                    ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-white' : ''}>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                {item.id === 'translator' && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-purple-100 text-purple-700'}`}>
                    AI
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between">
            <div
              className="flex items-center gap-3 min-w-0 cursor-pointer"
              onClick={() => onSelectTab('settings')}
            >
              <img
                src={avatarUrl}
                alt="User"
                className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm shrink-0"
              />
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">
                  {profile?.full_name || 'Salih Digital'}
                </p>
                <p className="text-[11px] text-slate-500 truncate">{userEmail || 'active@expenseflow.app'}</p>
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
        {/* Top Navbar matching the 10 Mobile Screens */}
        <header className={`h-16 sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between gap-3 ${isTranslatorTab ? 'bg-purple-950/40 backdrop-blur-xl border-b border-purple-500/20' : 'bg-white/70 backdrop-blur-xl border-b border-slate-100/80 shadow-xs'}`}>
          {/* Left Side: Brand Logo or Page Title */}
          <div className="flex items-center gap-2.5 min-w-0">
            {currentTab === 'settings' ? (
              <button
                onClick={() => onSelectTab('dashboard')}
                className="flex items-center gap-2 text-slate-900 font-bold hover:text-sky-600 transition-colors btn-press"
              >
                <ChevronLeft className="w-6 h-6 text-slate-700" />
                <span className="text-lg font-bold">Customize App</span>
              </button>
            ) : currentTab === 'dashboard' ? (
              <div
                className="flex items-center gap-2.5 cursor-pointer btn-press"
                onClick={() => setBrandingModalOpen(true)}
              >
                <img
                  src={branding.appLogo}
                  alt={branding.appName}
                  className="w-8 h-8 rounded-xl object-cover border border-sky-400/40 shadow-sm"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = DEFAULT_BRANDING.appLogo;
                  }}
                />
                <h1 className="text-lg font-extrabold text-slate-900 tracking-tight">
                  {branding.appName}
                </h1>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {currentTheme.headerIcon}
                <h1 className={`text-lg font-bold tracking-tight ${isTranslatorTab ? 'text-white' : 'text-slate-900'}`}>
                  {currentTheme.headerTitle}
                </h1>
              </div>
            )}
          </div>

          {/* Desktop Search bar */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-sm mx-4">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search transactions, clients..."
                className="w-full bg-white/80 border border-slate-200/80 rounded-2xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all shadow-xs"
              />
            </div>
          </form>

          {/* Right Side: Quick Action & Avatar */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Search Icon on mobile for searchable tabs */}
            {currentTheme.showSearchOnMobile && (
              <button
                onClick={() => {
                  const query = prompt('Search records:');
                  if (query && onSearch) onSearch(query);
                }}
                className="w-9 h-9 rounded-full bg-white/90 border border-slate-200/80 shadow-xs flex items-center justify-center text-slate-700 hover:text-slate-900 transition-all btn-press"
                title="Search"
              >
                <Search className="w-4 h-4" />
              </button>
            )}

            {/* User Avatar Circle */}
            <div
              onClick={() => onSelectTab('settings')}
              className="relative cursor-pointer group btn-press"
              title="Profile & Settings"
            >
              <img
                src={avatarUrl}
                alt="User Profile"
                className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-sm ring-1 ring-slate-200/80 group-hover:scale-105 transition-transform"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
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
                          item.id === 'translator'
                            ? '#F3E8FF'
                            : item.id === 'clients'
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
                    {item.id === 'translator' && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                        AI
                      </span>
                    )}
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

        {/* Floating Frosted Glass Bottom Navigation Bar with Sliding Indicator */}
        <div className="mobile-tab-bar pointer-events-auto">
          <div className="mobile-tab-glass-shimmer" />

          <div className="mobile-tab-bar-inner">
            {/* Sliding Pill Indicator that morphs across tabs */}
            <div
              className="mobile-tab-sliding-pill"
              style={{
                transform: `translateX(${activeBottomIndex * 100}%)`,
              }}
            />

            {mobileBottomTabs.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleMobileTabSelect(item.id)}
                  className={`mobile-tab-item btn-press`}
                >
                  <span
                    className={`mobile-tab-icon ${
                      isActive ? 'mobile-tab-icon--active' : ''
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span
                    className={`mobile-tab-label ${
                      isActive ? 'mobile-tab-label--active' : ''
                    }`}
                  >
                    {item.shortLabel}
                  </span>
                  {isActive && <span className="mobile-tab-dot" />}
                </button>
              );
            })}

            {/* More Button */}
            <button
              onClick={() => setMoreSheetOpen(!moreSheetOpen)}
              className={`mobile-tab-item btn-press`}
            >
              <span
                className={`mobile-tab-icon ${
                  isActiveInMore || moreSheetOpen ? 'mobile-tab-icon--active' : ''
                }`}
              >
                {moreSheetOpen ? (
                  <ChevronUp className="w-5 h-5 text-slate-700" />
                ) : (
                  <MoreHorizontal className="w-5 h-5 text-slate-500" />
                )}
              </span>
              <span
                className={`mobile-tab-label ${
                  isActiveInMore || moreSheetOpen ? 'mobile-tab-label--active' : ''
                }`}
              >
                More
              </span>
              {isActiveInMore && <span className="mobile-tab-dot" />}
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
    </div>
  );
};

export default Layout;
