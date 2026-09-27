import React, { useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Sparkles, Mail, Lock, User, ArrowRight, ShieldAlert } from 'lucide-react';
import { ToastType } from '../components/Toast';
import { useAppBrand } from '../context/BrandContext';
import { DEFAULT_BRANDING } from '../types/branding';

interface AuthProps {
  onSuccess: () => void;
  showToast: (msg: string, type: ToastType) => void;
}

export const Auth: React.FC<AuthProps> = ({ onSuccess, showToast }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(false);

  const { branding } = useAppBrand();
  const configured = isSupabaseConfigured();

  const handleDemoLogin = () => {
    localStorage.setItem('expenseflow_demo_mode', 'true');
    showToast('Signed in to Demo Mode with sample financial records!', 'success');
    onSuccess();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please enter both email and password', 'warning');
      return;
    }

    if (!configured) {
      handleDemoLogin();
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              company_name: companyName,
            },
          },
        });
        if (error) throw error;
        showToast('Registration successful! Please sign in or check your email for confirmation.', 'success');
        setIsSignUp(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        showToast('Signed in successfully!', 'success');
        onSuccess();
      }
    } catch (err: any) {
      const msg = err?.message || '';
      if (msg.includes('Load failed') || msg.includes('Failed to fetch') || msg.includes('fetch')) {
        showToast('Supabase server unreachable. Switching to local Demo Mode...', 'info');
        handleDemoLogin();
      } else {
        showToast(msg || 'Authentication failed', 'error');
      }
    } finally {
      setLoading(false);
    }

  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Glow Effect */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full relative z-10">
        {/* Logo Header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-1.5 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 mb-4 shadow-xl shadow-indigo-600/20">
            <img
              src={branding.appLogo}
              alt={branding.appName}
              className="w-14 h-14 rounded-xl object-cover border border-indigo-400/50 shadow-md"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src = DEFAULT_BRANDING.appLogo;
              }}
            />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">{branding.appName}</h1>
          <p className="text-sm text-indigo-400 font-medium mt-1">{branding.appSubtitle}</p>
          <p className="text-xs text-zinc-400 mt-2">
            {isSignUp ? 'Create your business expense management account' : 'Sign in to access your financial portal'}
          </p>
        </div>

        {/* Warning if Supabase URL / Key is placeholder */}
        {!configured && (
          <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-200">Supabase Connection Notice</p>
              <p className="mt-1 leading-relaxed">
                Update <code className="bg-black/50 px-1 py-0.5 rounded text-amber-400">VITE_SUPABASE_URL</code> in <code className="bg-black/50 px-1 py-0.5 rounded text-amber-400">.env</code> to a valid Supabase project, or click <strong>Explore in Demo Mode</strong> below to run fully offline.
              </p>
            </div>
          </div>
        )}

        {/* Auth Box */}
        <div className="bg-[#08090E] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required={isSignUp}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Muhammed Salih"
                    className="w-full bg-[#0D0E16] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-[#0D0E16] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#0D0E16] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold text-sm text-white shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-white/10 text-center space-y-4">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-xs text-zinc-400 hover:text-white transition-colors block w-full"
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account yet? Create one"}
            </button>

            <div className="pt-2 border-t border-white/5 flex flex-col items-center gap-2">
              <span className="text-[11px] text-zinc-500 font-medium">Want to test without Supabase configuration?</span>
              <button
                type="button"
                onClick={handleDemoLogin}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-xs font-semibold text-indigo-300 hover:text-indigo-200 transition-all shadow-sm group"
              >
                <Sparkles className="w-4 h-4 text-indigo-400 group-hover:rotate-12 transition-transform" />
                <span>Explore in Demo Mode (Local Storage)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

