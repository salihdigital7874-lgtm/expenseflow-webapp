import React, { useState } from 'react';
import {
  Bell,
  BellOff,
  Volume2,
  VolumeX,
  Droplets,
  Moon,
  Pill,
  Utensils,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldCheck,
  Trash2,
  X,
  Play,
} from 'lucide-react';
import { HealthNotificationItem, HealthNotificationSettings } from '../../types/health';
import { requestBrowserNotificationPermission, triggerInstantNotification } from '../../services/healthNotifications';

interface HealthNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: HealthNotificationSettings;
  logs: HealthNotificationItem[];
  onUpdateSettings: (newSettings: HealthNotificationSettings) => void;
  onAddLog: (newLog: HealthNotificationItem) => void;
  onClearLogs: () => void;
  onQuickAction: (actionType: 'water' | 'medicine' | 'meal' | 'sleep') => void;
}

export const HealthNotificationModal: React.FC<HealthNotificationModalProps> = ({
  isOpen,
  onClose,
  settings,
  logs,
  onUpdateSettings,
  onAddLog,
  onClearLogs,
  onQuickAction,
}) => {
  const [activeTab, setActiveTab] = useState<'test' | 'settings' | 'logs'>('test');
  const [browserPermissionGranted, setBrowserPermissionGranted] = useState<boolean>(
    typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted'
  );

  if (!isOpen) return null;

  const handleRequestPermission = async () => {
    const granted = await requestBrowserNotificationPermission();
    setBrowserPermissionGranted(granted);
  };

  const handleTestClick = (type: 'sleep' | 'drink' | 'medicine' | 'food') => {
    const newLog = triggerInstantNotification(type, settings);
    onAddLog(newLog);
  };

  const handleSettingChange = <K extends keyof HealthNotificationSettings>(
    key: K,
    value: HealthNotificationSettings[K]
  ) => {
    onUpdateSettings({
      ...settings,
      [key]: value,
    });
  };

  const unreadCount = logs.filter((l) => !l.read).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Bell className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Health Reminders & Notifications
                {unreadCount > 0 && (
                  <span className="bg-cyan-500 text-black font-semibold text-xs px-2 py-0.5 rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400">
                Sleep, Water Hydration, Medicine & Meal Time Scheduled Alerts
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Controls & Master Toggle */}
        <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            {/* Master Toggle */}
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enabled}
                onChange={(e) => handleSettingChange('enabled', e.target.checked)}
                className="w-4 h-4 rounded text-cyan-500 bg-slate-800 border-slate-700 focus:ring-cyan-500"
              />
              <span className="text-sm font-medium text-slate-200">
                {settings.enabled ? 'Notifications Enabled' : 'Notifications Paused'}
              </span>
            </label>

            {/* Sound Toggle */}
            <button
              onClick={() => handleSettingChange('soundEnabled', !settings.soundEnabled)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                settings.soundEnabled
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
            >
              {settings.soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              {settings.soundEnabled ? 'Chime Sound On' : 'Muted'}
            </button>
          </div>

          {/* Browser Permission Button */}
          <div>
            {browserPermissionGranted ? (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                <ShieldCheck className="w-3.5 h-3.5" /> Browser Alerts Active
              </span>
            ) : (
              <button
                onClick={handleRequestPermission}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black transition-all shadow-md shadow-cyan-500/20"
              >
                <Bell className="w-3.5 h-3.5" /> Allow Desktop/Browser Alerts
              </button>
            )}
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-900/50">
          <button
            onClick={() => setActiveTab('test')}
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'test'
                ? 'border-cyan-500 text-cyan-400 bg-cyan-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Play className="w-4 h-4" /> Instant Test Reminders
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'settings'
                ? 'border-cyan-500 text-cyan-400 bg-cyan-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-4 h-4" /> Schedule Times
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'logs'
                ? 'border-cyan-500 text-cyan-400 bg-cyan-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bell className="w-4 h-4" /> Notification Logs ({logs.length})
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 bg-slate-950">
          {/* TAB 1: INSTANT TEST REMINDERS */}
          {activeTab === 'test' && (
            <div className="space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" /> Instant Notification Demo
                  </h3>
                  <p className="text-xs text-slate-400">
                    Click any card below to test audio chimes, browser push alerts & in-app notifications immediately.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Sleep Notification Card */}
                <div className="bg-slate-900/90 border border-indigo-500/30 hover:border-indigo-500/60 rounded-xl p-4 transition-all flex flex-col justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                      <Moon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">1. Sleep Time Notification</h4>
                      <p className="text-xs text-slate-400 mt-1">
                        Bedtime target ({settings.bedtime}) & Wake-up alerts to maintain healthy circadian rhythm.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleTestClick('sleep')}
                    className="w-full py-2 px-3 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/40 text-indigo-300 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
                  >
                    <Play className="w-3.5 h-3.5" /> Test Sleep Notification
                  </button>
                </div>

                {/* 2. Drink Water Card */}
                <div className="bg-slate-900/90 border border-cyan-500/30 hover:border-cyan-500/60 rounded-xl p-4 transition-all flex flex-col justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                      <Droplets className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">2. Drink Water Notification</h4>
                      <p className="text-xs text-slate-400 mt-1">
                        Hydration alerts every {settings.drinkIntervalMinutes} mins between {settings.drinkStartHour} - {settings.drinkEndHour}.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleTestClick('drink')}
                    className="w-full py-2 px-3 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/40 border border-cyan-500/40 text-cyan-300 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
                  >
                    <Play className="w-3.5 h-3.5" /> Test Drink Water Notification
                  </button>
                </div>

                {/* 3. Medicine Card */}
                <div className="bg-slate-900/90 border border-rose-500/30 hover:border-rose-500/60 rounded-xl p-4 transition-all flex flex-col justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30">
                      <Pill className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">3. Medicine Time Notification</h4>
                      <p className="text-xs text-slate-400 mt-1">
                        Dosage & schedule reminders (Morning, Afternoon, Evening, Night) so you never miss a pill.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleTestClick('medicine')}
                    className="w-full py-2 px-3 rounded-lg bg-rose-600/20 hover:bg-rose-600/40 border border-rose-500/40 text-rose-300 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
                  >
                    <Play className="w-3.5 h-3.5" /> Test Medicine Notification
                  </button>
                </div>

                {/* 4. Food / Meal Card */}
                <div className="bg-slate-900/90 border border-emerald-500/30 hover:border-emerald-500/60 rounded-xl p-4 transition-all flex flex-col justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      <Utensils className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">4. Food / Meal Time Notification</h4>
                      <p className="text-xs text-slate-400 mt-1">
                        Breakfast, Lunch, Evening Snack & Dinner alerts for balanced calorie & macro tracking.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleTestClick('food')}
                    className="w-full py-2 px-3 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/40 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
                  >
                    <Play className="w-3.5 h-3.5" /> Test Food/Meal Notification
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SCHEDULE TIMES CONFIGURATOR */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              {/* 1. Sleep Reminders Settings */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                    <Moon className="w-4 h-4" /> Sleep & Bedtime Schedule
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.sleepEnabled}
                    onChange={(e) => handleSettingChange('sleepEnabled', e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-500 bg-slate-800 border-slate-700"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Target Bedtime</label>
                    <input
                      type="time"
                      value={settings.bedtime}
                      onChange={(e) => handleSettingChange('bedtime', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Target Wake-up Time</label>
                    <input
                      type="time"
                      value={settings.wakeTime}
                      onChange={(e) => handleSettingChange('wakeTime', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Drink Water Reminders Settings */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                    <Droplets className="w-4 h-4" /> Water Hydration Frequency
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.drinkEnabled}
                    onChange={(e) => handleSettingChange('drinkEnabled', e.target.checked)}
                    className="w-4 h-4 rounded text-cyan-500 bg-slate-800 border-slate-700"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Reminder Interval</label>
                    <select
                      value={settings.drinkIntervalMinutes}
                      onChange={(e) => handleSettingChange('drinkIntervalMinutes', Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm"
                    >
                      <option value={30}>Every 30 mins</option>
                      <option value={60}>Every 60 mins (1 hour)</option>
                      <option value={90}>Every 90 mins (1.5 hours)</option>
                      <option value={120}>Every 120 mins (2 hours)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Start Hour</label>
                    <input
                      type="time"
                      value={settings.drinkStartHour}
                      onChange={(e) => handleSettingChange('drinkStartHour', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">End Hour</label>
                    <input
                      type="time"
                      value={settings.drinkEndHour}
                      onChange={(e) => handleSettingChange('drinkEndHour', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Medicine Reminders Settings */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                    <Pill className="w-4 h-4" /> Medicine Dosage Schedule
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.medicineEnabled}
                    onChange={(e) => handleSettingChange('medicineEnabled', e.target.checked)}
                    className="w-4 h-4 rounded text-rose-500 bg-slate-800 border-slate-700"
                  />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Morning Dose</label>
                    <input
                      type="time"
                      value={settings.medicineTimes.morning}
                      onChange={(e) =>
                        handleSettingChange('medicineTimes', {
                          ...settings.medicineTimes,
                          morning: e.target.value,
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Afternoon Dose</label>
                    <input
                      type="time"
                      value={settings.medicineTimes.afternoon}
                      onChange={(e) =>
                        handleSettingChange('medicineTimes', {
                          ...settings.medicineTimes,
                          afternoon: e.target.value,
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Evening Dose</label>
                    <input
                      type="time"
                      value={settings.medicineTimes.evening}
                      onChange={(e) =>
                        handleSettingChange('medicineTimes', {
                          ...settings.medicineTimes,
                          evening: e.target.value,
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Night Dose</label>
                    <input
                      type="time"
                      value={settings.medicineTimes.night}
                      onChange={(e) =>
                        handleSettingChange('medicineTimes', {
                          ...settings.medicineTimes,
                          night: e.target.value,
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* 4. Food / Meal Reminders Settings */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                    <Utensils className="w-4 h-4" /> Food & Meal Schedules
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.foodEnabled}
                    onChange={(e) => handleSettingChange('foodEnabled', e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-500 bg-slate-800 border-slate-700"
                  />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Breakfast Time</label>
                    <input
                      type="time"
                      value={settings.mealTimes.breakfast}
                      onChange={(e) =>
                        handleSettingChange('mealTimes', {
                          ...settings.mealTimes,
                          breakfast: e.target.value,
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Lunch Time</label>
                    <input
                      type="time"
                      value={settings.mealTimes.lunch}
                      onChange={(e) =>
                        handleSettingChange('mealTimes', {
                          ...settings.mealTimes,
                          lunch: e.target.value,
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Evening Snack</label>
                    <input
                      type="time"
                      value={settings.mealTimes.snack}
                      onChange={(e) =>
                        handleSettingChange('mealTimes', {
                          ...settings.mealTimes,
                          snack: e.target.value,
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Dinner Time</label>
                    <input
                      type="time"
                      value={settings.mealTimes.dinner}
                      onChange={(e) =>
                        handleSettingChange('mealTimes', {
                          ...settings.mealTimes,
                          dinner: e.target.value,
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: NOTIFICATION LOGS FEED */}
          {activeTab === 'logs' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">
                  Showing recent triggered alerts ({logs.length})
                </span>
                {logs.length > 0 && (
                  <button
                    onClick={onClearLogs}
                    className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Clear All History
                  </button>
                )}
              </div>

              {logs.length === 0 ? (
                <div className="text-center py-12 bg-slate-900/50 border border-slate-800 rounded-xl">
                  <BellOff className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-300">No notification alerts logged yet</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Use the Instant Test tab or wait for scheduled alerts to trigger.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {logs.map((log) => {
                    const timeStr = new Date(log.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    });
                    const dateStr = new Date(log.timestamp).toLocaleDateString();

                    let icon = <Bell className="w-4 h-4 text-cyan-400" />;
                    let iconBg = 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400';

                    if (log.type === 'sleep') {
                      icon = <Moon className="w-4 h-4 text-indigo-400" />;
                      iconBg = 'bg-indigo-500/20 border-indigo-500/30 text-indigo-400';
                    } else if (log.type === 'drink') {
                      icon = <Droplets className="w-4 h-4 text-cyan-400" />;
                      iconBg = 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400';
                    } else if (log.type === 'medicine') {
                      icon = <Pill className="w-4 h-4 text-rose-400" />;
                      iconBg = 'bg-rose-500/20 border-rose-500/30 text-rose-400';
                    } else if (log.type === 'food') {
                      icon = <Utensils className="w-4 h-4 text-emerald-400" />;
                      iconBg = 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400';
                    }

                    return (
                      <div
                        key={log.id}
                        className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl flex items-start justify-between gap-3 hover:border-slate-700 transition-all"
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg border ${iconBg}`}>{icon}</div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h5 className="text-sm font-bold text-white">{log.title}</h5>
                              <span className="text-[10px] text-slate-500 font-mono">
                                {dateStr} at {timeStr}
                              </span>
                            </div>
                            <p className="text-xs text-slate-300 mt-0.5">{log.message}</p>
                          </div>
                        </div>

                        {log.actionType && (
                          <button
                            onClick={() => {
                              onQuickAction(log.actionType!);
                              onClose();
                            }}
                            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 hover:text-white border border-slate-700 flex items-center gap-1 transition-colors"
                          >
                            <CheckCircle2 className="w-3 h-3 text-cyan-400" /> Action
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900 flex items-center justify-between text-xs text-slate-400">
          <span>ExpenseFlow Health Scheduler v2.0</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors"
          >
            Done & Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};
