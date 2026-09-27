import React, { useState } from 'react';
import {
  LayoutDashboard,
  Receipt,
  TrendingUp,
  Users,
  PieChart,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Search,
  UserCheck,
  Pencil,
  Sparkles,
} from 'lucide-react';
import { Profile } from '../types/database';
import { useAppBrand } from '../context/BrandContext';
import { EditBrandingModal } from './EditBrandingModal';
import { DEFAULT_BRANDING } from '../types/branding';


export type TabType =
  | 'dashboard'
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
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [brandingModalOpen, setBrandingModalOpen] = useState(false);

  const { branding } = useAppBrand();

  const navItems: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'expenses', label: 'My Expenses', icon: <Receipt className="w-5 h-5" /> },
    { id: 'income', label: 'Incoming Amount', icon: <TrendingUp className="w-5 h-5" /> },
    { id: 'clients', label: 'Client Amount Balance', icon: <Users className="w-5 h-5" /> },
    { id: 'budgets', label: 'Budgets', icon: <PieChart className="w-5 h-5" /> },
    { id: 'reports', label: 'Reports', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'settings', label: 'Settings & Branding', icon: <Settings className="w-5 h-5" /> },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && searchValue.trim()) {
      onSearch(searchValue.trim());
      onSelectTab('expenses');
    }
  };

  return (
    <div className="min-h-screen flex bg-black text-white selection:bg-indigo-500 selection:text-white">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex w-64 flex-col fixed top-0 bottom-0 left-0 bg-[#08090E] border-r border-white/10 z-40">
        {/* Brand Header - Click to Edit */}
        <div
          onClick={() => setBrandingModalOpen(true)}
          className="p-5 border-b border-white/10 flex items-center justify-between cursor-pointer group hover:bg-white/[0.03] transition-colors"
          title="Click to edit App Name & Logo"
        >
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={branding.appLogo}
              alt={branding.appName}
              className="w-10 h-10 rounded-xl object-cover border border-indigo-500/40 shadow-lg shadow-indigo-600/30 shrink-0"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src = DEFAULT_BRANDING.appLogo;
              }}
            />

            <div className="min-w-0 flex-1">
              <h1 className="font-bold text-base leading-snug tracking-tight text-white truncate group-hover:text-indigo-300 transition-colors">
                {branding.appName}
              </h1>
              <span className="text-xs text-indigo-400 font-medium truncate block">
                {branding.appSubtitle}
              </span>
            </div>
          </div>

          <div className="p-1.5 rounded-lg bg-white/5 opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-white transition-opacity shrink-0">
            <Pencil className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 font-semibold'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Footer */}
        <div className="p-4 border-t border-white/10 bg-[#0D0E16]/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center font-bold text-sm shrink-0">
                {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : userEmail?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">
                  {profile?.full_name || 'Active User'}
                </p>
                <p className="text-[11px] text-zinc-400 truncate">{userEmail || 'user@app.com'}</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              title="Sign Out"
              className="p-2 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 border-b border-white/10 bg-[#08090E]/80 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-lg font-semibold text-white capitalize hidden sm:block">
              {navItems.find((n) => n.id === currentTab)?.label}
            </h2>
          </div>

          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md mx-2">
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search expenses, clients, categories..."
                className="w-full bg-[#0D0E16] border border-white/10 rounded-xl pl-9 pr-4 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </form>

          {/* Quick Branding Edit Button & User Status */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setBrandingModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-300 hover:bg-indigo-600/20 text-xs font-semibold transition-all"
              title="Edit App Name, Subtitle & Logo"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Customize App</span>
            </button>

            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
              <UserCheck className="w-3.5 h-3.5" />
              <span>{localStorage.getItem('expenseflow_demo_mode') === 'true' ? 'Demo Local Storage' : 'Supabase Connected'}</span>
            </div>
          </div>
        </header>

        {/* Page Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="relative flex-1 max-w-xs w-full bg-[#08090E] border-r border-white/10 flex flex-col p-4 z-50">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <div
                onClick={() => {
                  setMobileOpen(false);
                  setBrandingModalOpen(true);
                }}
                className="flex items-center gap-2.5 cursor-pointer"
              >
                <img
                  src={branding.appLogo}
                  alt={branding.appName}
                  className="w-8 h-8 rounded-lg object-cover border border-indigo-500/40"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = DEFAULT_BRANDING.appLogo;
                  }}
                />

                <div>
                  <span className="font-bold text-white text-sm block truncate">{branding.appName}</span>
                  <span className="text-[10px] text-indigo-400 font-medium block truncate">
                    {branding.appSubtitle}
                  </span>
                </div>
              </div>
              <button onClick={() => setMobileOpen(false)} className="text-zinc-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            <nav className="flex-1 space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    setMobileOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${
                    currentTab === item.id
                      ? 'bg-indigo-600 text-white font-semibold'
                      : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
            <div className="pt-4 border-t border-white/10 mt-auto">
              <button
                onClick={() => {
                  setMobileOpen(false);
                  onLogout();
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/10 text-rose-400 font-semibold text-sm hover:bg-rose-500/20 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Branding Quick Modal */}
      <EditBrandingModal
        isOpen={brandingModalOpen}
        onClose={() => setBrandingModalOpen(false)}
        showToast={showToast}
      />
    </div>
  );
};

