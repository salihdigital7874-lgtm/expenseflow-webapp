import React from 'react';
import { Target, Droplets, Footprints, Moon, TrendingDown, Award, Zap, ArrowRight } from 'lucide-react';
import { HealthGoals } from '../../types/health';

interface HealthGoalHeaderProps {
  goals: HealthGoals;
  todayWaterMl: number;
  todaySteps: number;
  todaySleepHrs: number;
  onNavigateTab: (tab: any) => void;
}

export const HealthGoalHeader: React.FC<HealthGoalHeaderProps> = ({
  goals,
  todayWaterMl,
  todaySteps,
  todaySleepHrs,
  onNavigateTab,
}) => {
  // Goal stats calculations
  // Goal: Lose 5 kg. Current weight logged = 77.9 kg (80kg initial - 2.1kg progress)
  const totalWeightToLose = goals.initialWeight - goals.targetWeight; // 5 kg
  const progressPercent = Math.min(100, Math.max(0, (goals.progressKg / totalWeightToLose) * 100));
  const remainingKg = (totalWeightToLose - goals.progressKg).toFixed(1);

  const waterPercent = Math.min(100, Math.round((todayWaterMl / (goals.waterGoalLiters * 1000)) * 100));
  const stepsPercent = Math.min(100, Math.round((todaySteps / goals.stepsGoal) * 100));
  const sleepPercent = Math.min(100, Math.round((todaySleepHrs / goals.sleepGoalHours) * 100));

  return (
    <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-indigo-950/70 border border-emerald-500/20 rounded-2xl p-6 shadow-2xl relative overflow-hidden backdrop-blur-md">
      {/* Background ambient glow */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-6">
        {/* Top Header Row */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-white/10 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-xl text-black shadow-lg shadow-emerald-500/20 font-extrabold flex items-center justify-center">
              <Target className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider">
                  Primary Goal
                </span>
                <span className="text-xs text-zinc-400">Target Date: Q4 2026</span>
              </div>
              <h2 className="text-2xl font-bold text-white mt-1 flex items-center gap-2">
                {goals.weightGoalTitle}
                <span className="text-sm font-normal text-zinc-400">({goals.initialWeight} kg → {goals.targetWeight} kg)</span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-3 px-4 backdrop-blur-sm">
            <Award className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <div className="text-xs text-zinc-400">Goal Achievement</div>
              <div className="text-sm font-semibold text-emerald-400">
                {goals.progressKg} kg Lost ({progressPercent.toFixed(0)}%)
              </div>
            </div>
          </div>
        </div>

        {/* Primary Goal Progress Card & Secondary Daily Goals */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Main Weight Goal Progress */}
          <div
            onClick={() => onNavigateTab('weight')}
            className="group cursor-pointer bg-black/40 border border-emerald-500/30 hover:border-emerald-400/60 p-4 rounded-xl transition-all duration-200 hover:scale-[1.01]"
          >
            <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
              <span className="flex items-center gap-1.5 font-medium text-emerald-400">
                <TrendingDown className="w-4 h-4" /> Weight Loss Progress
              </span>
              <span className="text-white font-bold">{goals.progressKg} kg / 5 kg</span>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <div className="text-xl font-extrabold text-white">
                {(goals.initialWeight - goals.progressKg).toFixed(1)} <span className="text-xs text-zinc-400 font-normal">kg Current</span>
              </div>
              <div className="text-xs text-emerald-400 font-medium">
                {remainingKg} kg left to {goals.targetWeight} kg
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-3 w-full bg-white/10 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Water Goal Card */}
          <div
            onClick={() => onNavigateTab('water')}
            className="group cursor-pointer bg-black/40 border border-cyan-500/20 hover:border-cyan-400/50 p-4 rounded-xl transition-all duration-200 hover:scale-[1.01]"
          >
            <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
              <span className="flex items-center gap-1.5 font-medium text-cyan-400">
                <Droplets className="w-4 h-4" /> Water Goal
              </span>
              <span className="text-cyan-300 font-semibold">{waterPercent}%</span>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <div className="text-xl font-extrabold text-white">
                {(todayWaterMl / 1000).toFixed(1)} <span className="text-xs text-zinc-400 font-normal">/ {goals.waterGoalLiters} L/day</span>
              </div>
            </div>
            <div className="mt-3 w-full bg-white/10 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-cyan-500 to-blue-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${waterPercent}%` }}
              />
            </div>
          </div>

          {/* Steps Goal Card */}
          <div
            onClick={() => onNavigateTab('exercise')}
            className="group cursor-pointer bg-black/40 border border-purple-500/20 hover:border-purple-400/50 p-4 rounded-xl transition-all duration-200 hover:scale-[1.01]"
          >
            <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
              <span className="flex items-center gap-1.5 font-medium text-purple-400">
                <Footprints className="w-4 h-4" /> Steps Goal
              </span>
              <span className="text-purple-300 font-semibold">{stepsPercent}%</span>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <div className="text-xl font-extrabold text-white">
                {todaySteps.toLocaleString()} <span className="text-xs text-zinc-400 font-normal">/ {goals.stepsGoal.toLocaleString()}</span>
              </div>
            </div>
            <div className="mt-3 w-full bg-white/10 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-purple-500 to-indigo-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${stepsPercent}%` }}
              />
            </div>
          </div>

          {/* Sleep Goal Card */}
          <div
            onClick={() => onNavigateTab('sleep')}
            className="group cursor-pointer bg-black/40 border border-amber-500/20 hover:border-amber-400/50 p-4 rounded-xl transition-all duration-200 hover:scale-[1.01]"
          >
            <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
              <span className="flex items-center gap-1.5 font-medium text-amber-400">
                <Moon className="w-4 h-4" /> Sleep Goal
              </span>
              <span className="text-amber-300 font-semibold">{sleepPercent}%</span>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <div className="text-xl font-extrabold text-white">
                {todaySleepHrs} <span className="text-xs text-zinc-400 font-normal">/ {goals.sleepGoalHours} hrs</span>
              </div>
            </div>
            <div className="mt-3 w-full bg-white/10 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-500 to-orange-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${sleepPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
