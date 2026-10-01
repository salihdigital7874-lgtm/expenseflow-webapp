import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Heart,
  Droplets,
  Moon,
  Footprints,
  Scale,
  Utensils,
  Pill,
  Calendar,
  FileText,
  Bell,
} from 'lucide-react';
import { HealthDataStore, HealthSubTab, DailyHealthLog, WaterLog, SleepLog, ExerciseLog, WeightLog, MealItem, MedicineLog, HealthAppointment, HealthNotificationItem, HealthNotificationSettings } from '../types/health';
import { loadHealthData, saveHealthData } from '../services/healthStorage';
import { evaluateScheduledHealthNotifications } from '../services/healthNotifications';

import { HealthGoalHeader } from '../components/health/HealthGoalHeader';
import { HealthDashboardView } from '../components/health/HealthDashboardView';
import { DailyHealthView } from '../components/health/DailyHealthView';
import { WaterIntakeView } from '../components/health/WaterIntakeView';
import { SleepView } from '../components/health/SleepView';
import { ExerciseView } from '../components/health/ExerciseView';
import { WeightView } from '../components/health/WeightView';
import { MealsView } from '../components/health/MealsView';
import { MedicinesView } from '../components/health/MedicinesView';
import { AppointmentsView } from '../components/health/AppointmentsView';
import { HealthReportsView } from '../components/health/HealthReportsView';
import { HealthNotificationModal } from '../components/health/HealthNotificationModal';
import { HealthNotificationBanner } from '../components/health/HealthNotificationBanner';

interface HealthPageProps {
  showToast?: (msg: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export const HealthPage: React.FC<HealthPageProps> = ({ showToast }) => {
  const [data, setData] = useState<HealthDataStore>(loadHealthData());
  const [activeSubTab, setActiveSubTab] = useState<HealthSubTab>('dashboard');
  const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);
  const [activeBannerNotif, setActiveBannerNotif] = useState<HealthNotificationItem | null>(null);
  const [lastMinuteEvaluated, setLastMinuteEvaluated] = useState('');

  useEffect(() => {
    saveHealthData(data);
  }, [data]);

  // Background Health Notification Scheduler Check (every 15 seconds)
  useEffect(() => {
    const checkTimer = setInterval(() => {
      const { newLogs, currentMinuteStr } = evaluateScheduledHealthNotifications(data, lastMinuteEvaluated);
      if (newLogs.length > 0) {
        setLastMinuteEvaluated(currentMinuteStr);
        setData((prev) => ({
          ...prev,
          notificationLogs: [...newLogs, ...(prev.notificationLogs || [])],
        }));
        setActiveBannerNotif(newLogs[0]);
      }
    }, 15000);

    return () => clearInterval(checkTimer);
  }, [data, lastMinuteEvaluated]);


  const todayStr = new Date().toISOString().split('T')[0];

  const todayWaterMl = data.waterLogs
    .filter((w) => w.date === todayStr)
    .reduce((sum, item) => sum + item.amountMl, 0);

  const todaySteps = data.exerciseLogs
    .filter((e) => e.date === todayStr)
    .reduce((sum, item) => sum + item.stepsCount, 0);

  const todaySleepHrs = data.sleepLogs.find((s) => s.date === todayStr)?.durationHours || 7.5;

  // SubTab Navigation Items
  const subNavItems: { id: HealthSubTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Health Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'daily', label: 'Daily Health', icon: <Heart className="w-4 h-4" /> },
    { id: 'water', label: 'Water Intake', icon: <Droplets className="w-4 h-4" /> },
    { id: 'sleep', label: 'Sleep', icon: <Moon className="w-4 h-4" /> },
    { id: 'exercise', label: 'Exercise', icon: <Footprints className="w-4 h-4" /> },
    { id: 'weight', label: 'Weight Goal', icon: <Scale className="w-4 h-4" /> },
    { id: 'meals', label: 'Meals', icon: <Utensils className="w-4 h-4" /> },
    { id: 'medicines', label: 'Medicines', icon: <Pill className="w-4 h-4" /> },
    { id: 'appointments', label: 'Appointments', icon: <Calendar className="w-4 h-4" /> },
    { id: 'reports', label: 'Health Reports', icon: <FileText className="w-4 h-4" /> },
  ];

  // Handler functions
  const handleQuickLogWater = (amountMl: number) => {
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    const newLog: WaterLog = {
      id: 'w-' + Date.now(),
      date: todayStr,
      time: timeNow,
      amountMl,
      container: amountMl === 250 ? 'Glass (250ml)' : 'Bottle (500ml)',
    };
    setData((prev) => ({
      ...prev,
      waterLogs: [newLog, ...prev.waterLogs],
    }));
    if (showToast) showToast(`Added +${amountMl}ml water intake!`, 'success');
  };

  const handleQuickToggleMedicine = (medId: string) => {
    setData((prev) => ({
      ...prev,
      medicines: prev.medicines.map((m) =>
        m.id === medId ? { ...m, takenToday: !m.takenToday } : m
      ),
    }));
    if (showToast) showToast('Updated medicine status!', 'info');
  };

  // Daily Log CRUD
  const handleAddDailyLog = (log: DailyHealthLog) => {
    setData((prev) => ({
      ...prev,
      dailyLogs: [log, ...prev.dailyLogs.filter((d) => d.date !== log.date)],
    }));
    if (showToast) showToast('Daily Health Check-in saved!', 'success');
  };

  const handleDeleteDailyLog = (id: string) => {
    setData((prev) => ({
      ...prev,
      dailyLogs: prev.dailyLogs.filter((d) => d.id !== id),
    }));
    if (showToast) showToast('Deleted check-in entry.', 'info');
  };

  // Water Log CRUD
  const handleAddWaterLog = (log: WaterLog) => {
    setData((prev) => ({
      ...prev,
      waterLogs: [log, ...prev.waterLogs],
    }));
    if (showToast) showToast(`Logged ${log.amountMl} ml water!`, 'success');
  };

  const handleDeleteWaterLog = (id: string) => {
    setData((prev) => ({
      ...prev,
      waterLogs: prev.waterLogs.filter((w) => w.id !== id),
    }));
    if (showToast) showToast('Deleted water log.', 'info');
  };

  // Sleep Log CRUD
  const handleAddSleepLog = (log: SleepLog) => {
    setData((prev) => ({
      ...prev,
      sleepLogs: [log, ...prev.sleepLogs.filter((s) => s.date !== log.date)],
    }));
    if (showToast) showToast('Sleep session saved!', 'success');
  };

  const handleDeleteSleepLog = (id: string) => {
    setData((prev) => ({
      ...prev,
      sleepLogs: prev.sleepLogs.filter((s) => s.id !== id),
    }));
    if (showToast) showToast('Deleted sleep log.', 'info');
  };

  // Exercise Log CRUD
  const handleAddExerciseLog = (log: ExerciseLog) => {
    setData((prev) => ({
      ...prev,
      exerciseLogs: [log, ...prev.exerciseLogs],
    }));
    if (showToast) showToast('Logged exercise workout!', 'success');
  };

  const handleDeleteExerciseLog = (id: string) => {
    setData((prev) => ({
      ...prev,
      exerciseLogs: prev.exerciseLogs.filter((e) => e.id !== id),
    }));
    if (showToast) showToast('Deleted workout log.', 'info');
  };

  // Weight Log CRUD
  const handleAddWeightLog = (log: WeightLog) => {
    // Calculate new progress (80 kg initial - log.weightKg)
    const newProgress = Math.max(0, Number((data.goals.initialWeight - log.weightKg).toFixed(1)));

    setData((prev) => ({
      ...prev,
      goals: {
        ...prev.goals,
        currentWeight: log.weightKg,
        progressKg: newProgress,
      },
      weightLogs: [log, ...prev.weightLogs],
    }));
    if (showToast) showToast(`Logged weight ${log.weightKg} kg! Progress: ${newProgress} kg lost`, 'success');
  };

  const handleDeleteWeightLog = (id: string) => {
    setData((prev) => ({
      ...prev,
      weightLogs: prev.weightLogs.filter((w) => w.id !== id),
    }));
    if (showToast) showToast('Deleted weight entry.', 'info');
  };

  // Meals CRUD
  const handleAddMeal = (meal: MealItem) => {
    setData((prev) => ({
      ...prev,
      meals: [meal, ...prev.meals],
    }));
    if (showToast) showToast(`Logged ${meal.foodName}!`, 'success');
  };

  const handleDeleteMeal = (id: string) => {
    setData((prev) => ({
      ...prev,
      meals: prev.meals.filter((m) => m.id !== id),
    }));
    if (showToast) showToast('Deleted meal item.', 'info');
  };

  // Medicines CRUD
  const handleAddMedicine = (med: MedicineLog) => {
    setData((prev) => ({
      ...prev,
      medicines: [med, ...prev.medicines],
    }));
    if (showToast) showToast('Added new medicine!', 'success');
  };

  const handleDeleteMedicine = (id: string) => {
    setData((prev) => ({
      ...prev,
      medicines: prev.medicines.filter((m) => m.id !== id),
    }));
    if (showToast) showToast('Deleted medicine.', 'info');
  };

  // Appointments CRUD
  const handleAddAppointment = (apt: HealthAppointment) => {
    setData((prev) => ({
      ...prev,
      appointments: [apt, ...prev.appointments],
    }));
    if (showToast) showToast('Booked doctor appointment!', 'success');
  };

  const handleDeleteAppointment = (id: string) => {
    setData((prev) => ({
      ...prev,
      appointments: prev.appointments.filter((a) => a.id !== id),
    }));
    if (showToast) showToast('Deleted appointment.', 'info');
  };

  // Notification Handlers
  const handleUpdateNotificationSettings = (newSettings: HealthNotificationSettings) => {
    setData((prev) => ({
      ...prev,
      notificationSettings: newSettings,
    }));
    if (showToast) showToast('Notification settings saved!', 'success');
  };

  const handleAddNotificationLog = (newLog: HealthNotificationItem) => {
    setData((prev) => ({
      ...prev,
      notificationLogs: [newLog, ...(prev.notificationLogs || [])],
    }));
    setActiveBannerNotif(newLog);
  };

  const handleClearNotificationLogs = () => {
    setData((prev) => ({
      ...prev,
      notificationLogs: [],
    }));
    if (showToast) showToast('Cleared notification history.', 'info');
  };

  const handleNotificationQuickAction = (actionType: 'water' | 'medicine' | 'meal' | 'sleep') => {
    if (actionType === 'water') setActiveSubTab('water');
    else if (actionType === 'medicine') setActiveSubTab('medicines');
    else if (actionType === 'meal') setActiveSubTab('meals');
    else if (actionType === 'sleep') setActiveSubTab('sleep');
  };

  const unreadNotifCount = (data.notificationLogs || []).filter((l) => !l.read).length;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner Goal Component */}
      <HealthGoalHeader
        goals={data.goals}
        todayWaterMl={todayWaterMl}
        todaySteps={todaySteps}
        todaySleepHrs={todaySleepHrs}
        onNavigateTab={(tab) => setActiveSubTab(tab)}
      />

      {/* Sub-tab Navigation Pills + Reminders Bell Button */}
      <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {subNavItems.map((item) => {
            const isActive = activeSubTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSubTab(item.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                    : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Notifications & Reminders Button */}
        <button
          onClick={() => setIsNotifModalOpen(true)}
          className="relative flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-bold whitespace-nowrap transition-all shadow-md shrink-0"
        >
          <Bell className="w-4 h-4 text-cyan-400 animate-bounce" />
          <span className="hidden sm:inline">Reminders & Alerts</span>
          {unreadNotifCount > 0 && (
            <span className="bg-cyan-500 text-black font-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
              {unreadNotifCount}
            </span>
          )}
        </button>
      </div>

      {/* Render Selected SubTab Module View */}
      {activeSubTab === 'dashboard' && (
        <HealthDashboardView
          data={data}
          onNavigateTab={(tab) => setActiveSubTab(tab)}
          onQuickLogWater={handleQuickLogWater}
          onQuickToggleMedicine={handleQuickToggleMedicine}
        />
      )}

      {activeSubTab === 'daily' && (
        <DailyHealthView
          logs={data.dailyLogs}
          onAddDailyLog={handleAddDailyLog}
          onDeleteDailyLog={handleDeleteDailyLog}
        />
      )}

      {activeSubTab === 'water' && (
        <WaterIntakeView
          waterLogs={data.waterLogs}
          waterGoalLiters={data.goals.waterGoalLiters}
          onAddWaterLog={handleAddWaterLog}
          onDeleteWaterLog={handleDeleteWaterLog}
        />
      )}

      {activeSubTab === 'sleep' && (
        <SleepView
          sleepLogs={data.sleepLogs}
          sleepGoalHours={data.goals.sleepGoalHours}
          onAddSleepLog={handleAddSleepLog}
          onDeleteSleepLog={handleDeleteSleepLog}
        />
      )}

      {activeSubTab === 'exercise' && (
        <ExerciseView
          exerciseLogs={data.exerciseLogs}
          stepsGoal={data.goals.stepsGoal}
          onAddExerciseLog={handleAddExerciseLog}
          onDeleteExerciseLog={handleDeleteExerciseLog}
        />
      )}

      {activeSubTab === 'weight' && (
        <WeightView
          weightLogs={data.weightLogs}
          goals={data.goals}
          onAddWeightLog={handleAddWeightLog}
          onDeleteWeightLog={handleDeleteWeightLog}
        />
      )}

      {activeSubTab === 'meals' && (
        <MealsView
          meals={data.meals}
          calorieGoal={data.goals.calorieGoal}
          onAddMeal={handleAddMeal}
          onDeleteMeal={handleDeleteMeal}
        />
      )}

      {activeSubTab === 'medicines' && (
        <MedicinesView
          medicines={data.medicines}
          onAddMedicine={handleAddMedicine}
          onToggleTaken={handleQuickToggleMedicine}
          onDeleteMedicine={handleDeleteMedicine}
        />
      )}

      {activeSubTab === 'appointments' && (
        <AppointmentsView
          appointments={data.appointments}
          onAddAppointment={handleAddAppointment}
          onDeleteAppointment={handleDeleteAppointment}
        />
      )}

      {activeSubTab === 'reports' && (
        <HealthReportsView data={data} />
      )}

      {/* Health Notification Modal */}
      <HealthNotificationModal
        isOpen={isNotifModalOpen}
        onClose={() => setIsNotifModalOpen(false)}
        settings={
          data.notificationSettings || {
            enabled: true,
            browserNotifications: true,
            soundEnabled: true,
            sleepEnabled: true,
            bedtime: '22:30',
            wakeTime: '06:30',
            drinkEnabled: true,
            drinkIntervalMinutes: 60,
            drinkStartHour: '08:00',
            drinkEndHour: '22:00',
            medicineEnabled: true,
            medicineTimes: { morning: '08:00', afternoon: '13:00', evening: '18:00', night: '21:30' },
            foodEnabled: true,
            mealTimes: { breakfast: '08:30', lunch: '13:30', snack: '17:00', dinner: '20:30' },
          }
        }
        logs={data.notificationLogs || []}
        onUpdateSettings={handleUpdateNotificationSettings}
        onAddLog={handleAddNotificationLog}
        onClearLogs={handleClearNotificationLogs}
        onQuickAction={handleNotificationQuickAction}
      />

      {/* Health Notification Floating Banner Toast */}
      <HealthNotificationBanner
        notification={activeBannerNotif}
        onDismiss={() => setActiveBannerNotif(null)}
        onActionClick={handleNotificationQuickAction}
      />
    </div>
  );
};

