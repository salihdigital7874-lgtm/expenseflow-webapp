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
} from 'lucide-react';
import { HealthDataStore, HealthSubTab, DailyHealthLog, WaterLog, SleepLog, ExerciseLog, WeightLog, MealItem, MedicineLog, HealthAppointment } from '../types/health';
import { loadHealthData, saveHealthData } from '../services/healthStorage';

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

interface HealthPageProps {
  showToast?: (msg: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export const HealthPage: React.FC<HealthPageProps> = ({ showToast }) => {
  const [data, setData] = useState<HealthDataStore>(loadHealthData());
  const [activeSubTab, setActiveSubTab] = useState<HealthSubTab>('dashboard');

  useEffect(() => {
    saveHealthData(data);
  }, [data]);

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

      {/* Sub-tab Navigation Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none border-b border-white/10">
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
    </div>
  );
};
