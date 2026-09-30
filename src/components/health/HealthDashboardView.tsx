import React from 'react';
import {
  Heart,
  Droplets,
  Footprints,
  Moon,
  Pill,
  Calendar,
  Utensils,
  Plus,
  ArrowUpRight,
  Activity,
  CheckCircle2,
  Clock,
  Zap,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { HealthDataStore, HealthSubTab } from '../../types/health';

interface HealthDashboardViewProps {
  data: HealthDataStore;
  onNavigateTab: (tab: HealthSubTab) => void;
  onQuickLogWater: (amountMl: number) => void;
  onQuickToggleMedicine: (medId: string) => void;
}

export const HealthDashboardView: React.FC<HealthDashboardViewProps> = ({
  data,
  onNavigateTab,
  onQuickLogWater,
  onQuickToggleMedicine,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  // Daily totals
  const todayWater = data.waterLogs
    .filter((w) => w.date === todayStr)
    .reduce((sum, item) => sum + item.amountMl, 0);

  const todaySteps = data.exerciseLogs
    .filter((e) => e.date === todayStr)
    .reduce((sum, item) => sum + item.stepsCount, 0);

  const todayCaloriesBurned = data.exerciseLogs
    .filter((e) => e.date === todayStr)
    .reduce((sum, item) => sum + item.caloriesBurned, 0);

  const todaySleep = data.sleepLogs.find((s) => s.date === todayStr);

  const todayMeals = data.meals.filter((m) => m.date === todayStr);
  const todayCaloriesConsumed = todayMeals.reduce((sum, m) => sum + m.calories, 0);

  const todayDailyLog = data.dailyLogs.find((d) => d.date === todayStr);

  // Weight Trend Data for Chart
  const weightTrendChartData = data.weightLogs
    .slice()
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((w) => ({
      date: new Date(w.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      weight: w.weightKg,
      target: data.goals.targetWeight,
    }));

  const upcomingAppointments = data.appointments
    .filter((a) => a.status === 'Upcoming')
    .slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Quick Actions & Shortcut Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white/5 p-4 rounded-2xl border border-white/10">
        <div className="flex items-center gap-2 text-sm text-zinc-300 font-medium">
          <Zap className="w-4 h-4 text-amber-400" />
          <span>Quick Actions:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onQuickLogWater(250)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 border border-cyan-500/20 transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> +250ml Water
          </button>
          <button
            onClick={() => onNavigateTab('exercise')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border border-purple-500/20 transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> Log Exercise
          </button>
          <button
            onClick={() => onNavigateTab('weight')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> Log Weight
          </button>
          <button
            onClick={() => onNavigateTab('meals')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 border border-orange-500/20 transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> Add Meal
          </button>
          <button
            onClick={() => onNavigateTab('daily')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/20 transition-all"
          >
            <Heart className="w-3.5 h-3.5" /> Daily Check-in
          </button>
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Weight Trajectory Chart & Nutrition */}
        <div className="lg:col-span-2 space-y-6">
          {/* Weight Progress Chart Card */}
          <div className="bg-[#0D0E16] border border-white/10 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-400" /> Weight Loss Trajectory (Goal: 75 kg)
                </h3>
                <p className="text-xs text-zinc-400">Tracking progress from initial 80 kg towards target</p>
              </div>
              <button
                onClick={() => onNavigateTab('weight')}
                className="text-xs font-medium text-emerald-400 hover:underline flex items-center gap-1"
              >
                View Details <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weightTrendChartData}>
                  <defs>
                    <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="date" stroke="#71717a" fontSize={12} />
                  <YAxis domain={[74, 81]} stroke="#71717a" fontSize={12} unit="kg" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#18181b',
                      borderColor: '#27272a',
                      borderRadius: '0.75rem',
                      color: '#fff',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="weight"
                    name="Logged Weight"
                    stroke="#10b981"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#weightGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Today's Meals & Calorie Summary */}
          <div className="bg-[#0D0E16] border border-white/10 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <Utensils className="w-5 h-5 text-orange-400" /> Today's Meals & Nutrition
                </h3>
                <p className="text-xs text-zinc-400">
                  Total Consumed: <span className="text-white font-bold">{todayCaloriesConsumed} kcal</span> / {data.goals.calorieGoal} kcal target
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('meals')}
                className="text-xs font-medium text-orange-400 hover:underline flex items-center gap-1"
              >
                Log Meal <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {todayMeals.length > 0 ? (
                todayMeals.map((meal) => (
                  <div key={meal.id} className="p-3 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-semibold uppercase text-orange-400 tracking-wider">
                        {meal.mealType}
                      </span>
                      <p className="text-sm font-medium text-white line-clamp-1">{meal.foodName}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-white">{meal.calories} kcal</span>
                      <span className="block text-[10px] text-zinc-400">{meal.proteinGrams}g Protein</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-center py-6 text-xs text-zinc-500">No meals logged for today yet.</div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Medicine Checklist & Upcoming Doctor Appointments */}
        <div className="space-y-6">
          {/* Today's Daily Health Check-in Status */}
          <div className="bg-[#0D0E16] border border-white/10 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-400" /> Today's Vitals Check
              </h3>
              <button
                onClick={() => onNavigateTab('daily')}
                className="text-xs text-indigo-400 hover:underline"
              >
                Edit
              </button>
            </div>

            {todayDailyLog ? (
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-white/5 rounded-lg border border-white/5">
                  <span className="text-zinc-400 block">Mood & Energy</span>
                  <span className="font-semibold text-white">{todayDailyLog.mood} ({todayDailyLog.energyLevel}/5)</span>
                </div>
                <div className="p-2.5 bg-white/5 rounded-lg border border-white/5">
                  <span className="text-zinc-400 block">Heart Rate</span>
                  <span className="font-semibold text-rose-400">{todayDailyLog.heartRate || 72} BPM</span>
                </div>
                <div className="p-2.5 bg-white/5 rounded-lg border border-white/5">
                  <span className="text-zinc-400 block">Blood Pressure</span>
                  <span className="font-semibold text-emerald-400">{todayDailyLog.bloodPressure || '120/80'}</span>
                </div>
                <div className="p-2.5 bg-white/5 rounded-lg border border-white/5">
                  <span className="text-zinc-400 block">Oxygen (SpO2)</span>
                  <span className="font-semibold text-cyan-400">{todayDailyLog.spo2 || 98}%</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 bg-white/5 rounded-xl border stroke-dashed border-white/10">
                <p className="text-xs text-zinc-400 mb-2">Haven't completed daily health check-in yet</p>
                <button
                  onClick={() => onNavigateTab('daily')}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-500/20 text-rose-300 hover:bg-rose-500/30"
                >
                  Start Check-in
                </button>
              </div>
            )}
          </div>

          {/* Medicines Schedule */}
          <div className="bg-[#0D0E16] border border-white/10 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Pill className="w-4 h-4 text-purple-400" /> Today's Medicine Checklist
              </h3>
              <button onClick={() => onNavigateTab('medicines')} className="text-xs text-purple-400 hover:underline">
                Manage
              </button>
            </div>

            <div className="space-y-2">
              {data.medicines.map((med) => (
                <div
                  key={med.id}
                  onClick={() => onQuickToggleMedicine(med.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    med.takenToday
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-white/5 border-white/10 hover:border-purple-500/40 text-zinc-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2
                      className={`w-4 h-4 ${med.takenToday ? 'text-emerald-400 fill-emerald-400/20' : 'text-zinc-600'}`}
                    />
                    <div>
                      <p className="text-xs font-semibold text-white">{med.name}</p>
                      <span className="text-[10px] text-zinc-400">{med.dosage} • {med.instruction}</span>
                    </div>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${med.takenToday ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-300'}`}>
                    {med.takenToday ? 'Taken' : 'Pending'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Appointments */}
          <div className="bg-[#0D0E16] border border-white/10 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Calendar className="w-4 h-4 text-cyan-400" /> Doctor Appointments
              </h3>
              <button onClick={() => onNavigateTab('appointments')} className="text-xs text-cyan-400 hover:underline">
                View All
              </button>
            </div>

            {upcomingAppointments.length > 0 ? (
              upcomingAppointments.map((apt) => (
                <div key={apt.id} className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-white">{apt.doctorName}</h4>
                    <span className="text-[10px] font-medium text-cyan-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {apt.appointmentTime}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400">{apt.specialty} • {apt.clinicHospital}</p>
                  <div className="text-[10px] text-zinc-500 pt-1 font-mono">Date: {apt.appointmentDate}</div>
                </div>
              ))
            ) : (
              <p className="text-xs text-zinc-500 text-center py-4">No upcoming appointments scheduled.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
