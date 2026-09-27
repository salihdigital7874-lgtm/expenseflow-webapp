import React, { useState } from 'react';
import { Lock, AlertTriangle, Eye, EyeOff, X, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface ResetAuthModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  userEmail?: string;
  isDemoMode?: boolean;
  onConfirm: (password: string) => Promise<void>;
  onCancel: () => void;
}

export const ResetAuthModal: React.FC<ResetAuthModalProps> = ({
  isOpen,
  title,
  message,
  userEmail,
  isDemoMode = false,
  onConfirm,
  onCancel,
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('Please enter your password to authorize data reset.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await onConfirm(password);
      setPassword('');
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify your password and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPassword('');
    setError('');
    onCancel();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-[#08090E] border border-rose-500/30 rounded-2xl p-6 max-w-md w-full shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={handleClose}
          disabled={loading}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4 mb-4">
          <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/30 shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">{title}</h3>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 mb-5 text-xs text-rose-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>This action is irreversible. All records selected will be permanently wiped.</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-rose-400" />
                <span>Account Password Authorization</span>
              </span>
              {userEmail && <span className="text-[11px] text-zinc-500 font-normal truncate max-w-[150px]">{userEmail}</span>}
            </label>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError('');
                }}
                placeholder={isDemoMode ? 'Enter account password or PIN (e.g. demo123)' : 'Enter your account password'}
                className="w-full bg-[#0D0E16] border border-white/10 rounded-xl px-4 py-2.5 pr-10 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500 transition-colors"
                autoFocus
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <p className="text-[11px] text-zinc-500 mt-1.5">
              {isDemoMode
                ? 'Security Check: Please enter your account password to authorize resetting app data.'
                : 'Enter your account password to verify ownership before performing data reset.'}
            </p>
          </div>

          {error && (
            <div className="bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs p-3 rounded-xl">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/5 rounded-xl transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !password.trim()}
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-xl text-white bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-600/30 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Verifying Password...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verify & Wipe Data</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
