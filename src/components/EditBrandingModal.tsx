import React, { useState, useRef } from 'react';
import { X, Upload, RotateCcw, Check, Sparkles, Image as ImageIcon, Palette, Type } from 'lucide-react';
import { useAppBrand } from '../context/BrandContext';
import { DEFAULT_BRANDING } from '../types/branding';


interface EditBrandingModalProps {
  isOpen: boolean;
  onClose: () => void;
  showToast?: (msg: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

const ACCENT_COLORS = [
  { id: 'indigo', name: 'Indigo Blue', bg: 'bg-indigo-600', ring: 'ring-indigo-500' },
  { id: 'emerald', name: 'Emerald Green', bg: 'bg-emerald-600', ring: 'ring-emerald-500' },
  { id: 'violet', name: 'Violet Purple', bg: 'bg-violet-600', ring: 'ring-violet-500' },
  { id: 'cyan', name: 'Cyan Tech', bg: 'bg-cyan-600', ring: 'ring-cyan-500' },
  { id: 'rose', name: 'Rose Red', bg: 'bg-rose-600', ring: 'ring-rose-500' },
  { id: 'amber', name: 'Amber Gold', bg: 'bg-amber-600', ring: 'ring-amber-500' },
];

export const EditBrandingModal: React.FC<EditBrandingModalProps> = ({
  isOpen,
  onClose,
  showToast,
}) => {
  const { branding, updateBranding, resetLogo, resetBranding } = useAppBrand();

  const [appName, setAppName] = useState(branding.appName);
  const [appSubtitle, setAppSubtitle] = useState(branding.appSubtitle);
  const [appLogo, setAppLogo] = useState(branding.appLogo);
  const [accentColor, setAccentColor] = useState(branding.accentColor);
  const [uploadError, setUploadError] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handle image upload & convert to base64 data URL
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setUploadError('');

    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        setUploadError('Image size should be less than 3MB');
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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appName.trim()) {
      setUploadError('App Name cannot be empty');
      return;
    }

    updateBranding({
      appName: appName.trim(),
      appSubtitle: appSubtitle.trim(),
      appLogo,
      accentColor,
    });

    if (showToast) {
      showToast('App Branding updated successfully!', 'success');
    }
    onClose();
  };

  const handleResetLogo = () => {
    resetLogo();
    setAppLogo(DEFAULT_BRANDING.appLogo);
    if (showToast) showToast('Logo reset to default', 'info');
  };

  const handleResetAll = () => {
    resetBranding();
    setAppName('Salih Expense');
    setAppSubtitle('Business Portal');
    setAppLogo(DEFAULT_BRANDING.appLogo);
    setAccentColor('indigo');
    if (showToast) showToast('All branding reset to default', 'info');
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#08090E] border border-white/10 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-[#0D0E16]/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Edit App Branding & Logo</h2>
              <p className="text-xs text-zinc-400">Customize the application name, tagline, and logo icon</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Preview Card */}
        <div className="p-4 bg-indigo-950/20 border-b border-white/5 flex items-center gap-4">
          <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider shrink-0">
            Live Preview:
          </div>
          <div className="flex items-center gap-3 px-3.5 py-2 rounded-xl bg-[#08090E] border border-white/10 shadow-lg min-w-0 flex-1">
            <img
              src={appLogo}
              alt="App Logo"
              className="w-10 h-10 rounded-xl object-cover border border-indigo-500/40 shrink-0"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-sm text-white truncate">{appName || 'App Name'}</h3>
              <span className="text-[11px] text-indigo-400 font-medium block truncate">
                {appSubtitle || 'Tagline'}
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* App Name & Tagline */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <Type className="w-3.5 h-3.5 text-indigo-400" />
                <span>App Name</span>
              </label>
              <input
                type="text"
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                placeholder="e.g. Salih Expense, My Business App..."
                className="w-full bg-[#0D0E16] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Tagline / Subtitle
              </label>
              <input
                type="text"
                value={appSubtitle}
                onChange={(e) => setAppSubtitle(e.target.value)}
                placeholder="e.g. Business Portal, Financial Management..."
                className="w-full bg-[#0D0E16] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          {/* Logo Uploader */}
          <div className="space-y-3 pt-1">
            <label className="block text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
              <span>App Logo Image</span>
            </label>

            <div className="flex items-center gap-4">
              <div className="relative group">
                <img
                  src={appLogo}
                  alt="App Logo"
                  className="w-16 h-16 rounded-2xl object-cover border border-indigo-500/40 shadow-xl"
                />
              </div>

              <div className="flex-1 space-y-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/png, image/jpeg, image/webp, image/svg+xml"
                  className="hidden"
                />

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-600/30 text-xs font-semibold transition-all"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Logo Image</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResetLogo}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-zinc-300 hover:bg-white/10 text-xs font-medium transition-all"
                    title="Reset to default logo"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Logo</span>
                  </button>
                </div>
                <p className="text-[11px] text-zinc-400">Supported formats: PNG, JPG, WebP, SVG (max 3MB)</p>
              </div>
            </div>

            {uploadError && <p className="text-xs text-rose-400 font-medium">{uploadError}</p>}
          </div>

          {/* Accent Color Selection */}
          <div className="space-y-2.5 pt-1">
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
                    className={`flex flex-col items-center p-2 rounded-xl border transition-all ${
                      isSelected
                        ? `${c.ring} ring-2 border-transparent bg-white/10`
                        : 'border-white/10 hover:border-white/20 bg-[#0D0E16]'
                    }`}
                  >
                    <span className={`w-6 h-6 rounded-full ${c.bg} flex items-center justify-center text-white mb-1 shadow-md`}>
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </span>
                    <span className="text-[10px] text-zinc-300 font-medium truncate w-full text-center">
                      {c.name.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleResetAll}
              className="text-xs text-zinc-400 hover:text-rose-400 underline font-medium transition-colors"
            >
              Reset All Defaults
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 font-semibold text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Save Branding</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
