import React, { useEffect } from 'react';
import { Bell, Droplets, Moon, Pill, Utensils, X, ArrowRight } from 'lucide-react';
import { HealthNotificationItem } from '../../types/health';

interface HealthNotificationBannerProps {
  notification: HealthNotificationItem | null;
  onDismiss: () => void;
  onActionClick: (actionType: 'water' | 'medicine' | 'meal' | 'sleep') => void;
}

export const HealthNotificationBanner: React.FC<HealthNotificationBannerProps> = ({
  notification,
  onDismiss,
  onActionClick,
}) => {
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        onDismiss();
      }, 7000); // auto dismiss after 7 seconds
      return () => clearTimeout(timer);
    }
  }, [notification, onDismiss]);

  if (!notification) return null;

  let icon = <Bell className="w-5 h-5 text-cyan-400" />;
  let accentColor = 'from-cyan-500/20 to-blue-500/20 border-cyan-500/40 text-cyan-400';
  let badgeText = 'Health Alert';

  if (notification.type === 'sleep') {
    icon = <Moon className="w-5 h-5 text-indigo-400" />;
    accentColor = 'from-indigo-500/20 to-purple-500/20 border-indigo-500/40 text-indigo-400';
    badgeText = 'Sleep Time 😴';
  } else if (notification.type === 'drink') {
    icon = <Droplets className="w-5 h-5 text-cyan-400" />;
    accentColor = 'from-cyan-500/20 to-teal-500/20 border-cyan-500/40 text-cyan-400';
    badgeText = 'Drink Water 🚰';
  } else if (notification.type === 'medicine') {
    icon = <Pill className="w-5 h-5 text-rose-400" />;
    accentColor = 'from-rose-500/20 to-pink-500/20 border-rose-500/40 text-rose-400';
    badgeText = 'Medicine Time 💊';
  } else if (notification.type === 'food') {
    icon = <Utensils className="w-5 h-5 text-emerald-400" />;
    accentColor = 'from-emerald-500/20 to-green-500/20 border-emerald-500/40 text-emerald-400';
    badgeText = 'Meal Reminder 🥗';
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md w-full animate-slideUp">
      <div
        className={`bg-slate-900/95 backdrop-blur-xl border bg-gradient-to-r ${accentColor} rounded-2xl p-4 shadow-2xl flex items-start gap-3.5`}
      >
        <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-center shrink-0">
          {icon}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-950/80 border border-slate-800 text-slate-300">
              {badgeText}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              {new Date(notification.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          <h4 className="text-sm font-bold text-white mt-1.5 truncate">{notification.title}</h4>
          <p className="text-xs text-slate-300 mt-0.5 line-clamp-2 leading-relaxed">{notification.message}</p>

          {notification.actionType && (
            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={() => {
                  onActionClick(notification.actionType!);
                  onDismiss();
                }}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/15 flex items-center gap-1.5 transition-all shadow-sm"
              >
                Open Tab <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={onDismiss}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white text-xs transition-colors"
              >
                Dismiss
              </button>
            </div>
          )}
        </div>

        <button
          onClick={onDismiss}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
