import React, { useState } from 'react';
import { Target, TrendingDown, Scale, Plus, Trash2, Award, ArrowDownRight, Calculator } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { WeightLog, HealthGoals } from '../../types/health';

interface WeightViewProps {
  weightLogs: WeightLog[];
  goals: HealthGoals;
  onAddWeightLog: (log: WeightLog) => void;
  onDeleteWeightLog: (id: string) => void;
}

export const WeightView: React.FC<WeightViewProps> = ({
  weightLogs,
  goals,
  onAddWeightLog,
  onDeleteWeightLog,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const sortedLogs = weightLogs
    .slice()
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const latestLog = sortedLogs[sortedLogs.length - 1];
  const currentWeight = latestLog ? latestLog.weightKg : goals.currentWeight; // 77.9 kg
  const initialWeight = goals.initialWeight; // 80.0 kg
  const targetWeight = goals.targetWeight; // 75.0 kg
  const totalGoalToLose = initialWeight - targetWeight; // 5.0 kg

  const progressAchievedKg = goals.progressKg; // 2.1 kg
  const remainingKg = (totalGoalToLose - progressAchievedKg).toFixed(1); // 2.9 kg
  const progressPercent = Math.min(100, Math.round((progressAchievedKg / totalGoalToLose) * 100)); // 42%

  const [date, setDate] = useState(todayStr);
  const [weightKg, setWeightKg] = useState(currentWeight);
  const [bodyFatPercent, setBodyFatPercent] = useState(22.5);
  const [muscleMassKg, setMuscleMassKg] = useState(59.0);
  const [notes, setNotes] = useState('');
  const [showModal, setShowModal] = useState(false);

  // BMI Calculator states
  const [heightCm, setHeightCm] = useState(175);
  const bmiValue = (currentWeight / ((heightCm / 100) * (heightCm / 100))).toFixed(1);
  const getBmiStatus = (val: number) => {
    if (val < 18.5) return { status: 'Underweight', color: 'text-amber-400' };
    if (val < 24.9) return { status: 'Normal Weight', color: 'text-emerald-400' };
    if (val < 29.9) return { status: 'Overweight', color: 'text-orange-400' };
    return { status: 'Obese', color: 'text-rose-400' };
  };
  const bmiObj = getBmiStatus(Number(bmiValue));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newLog: WeightLog = {
      id: 'wt-' + Date.now(),
      date,
      weightKg: Number(weightKg),
      bodyFatPercent: Number(bodyFatPercent),
      muscleMassKg: Number(muscleMassKg),
      notes,
    };
    onAddWeightLog(newLog);
    setShowModal(false);
  };

  const chartData = sortedLogs.map((w) => ({
    date: new Date(w.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    weight: w.weightKg,
    target: targetWeight,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Scale className="w-5 h-5 text-emerald-400" /> Primary Weight Goal: Lose 5 kg
          </h3>
          <p className="text-xs text-zinc-400">
            Initial: {initialWeight} kg → Target: {targetWeight} kg | Progress Achieved: {progressAchievedKg} kg
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs transition-all shadow-lg shadow-emerald-600/20"
        >
          <Plus className="w-4 h-4" /> Log Current Weight
        </button>
      </div>

      {/* Goal Overview Card Banner */}
      <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-teal-950/60 border border-emerald-500/30 rounded-2xl p-6 space-y-5 backdrop-blur-md">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-black/40 rounded-xl border border-white/10">
            <span className="text-xs text-zinc-400 block mb-1">Current Weight</span>
            <div className="text-2xl font-black text-white">{currentWeight} kg</div>
            <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold mt-1">
              <ArrowDownRight className="w-3.5 h-3.5" /> -{progressAchievedKg} kg lost
            </span>
          </div>

          <div className="p-4 bg-black/40 rounded-xl border border-white/10">
            <span className="text-xs text-zinc-400 block mb-1">Target Weight</span>
            <div className="text-2xl font-black text-emerald-400">{targetWeight} kg</div>
            <span className="text-[11px] text-zinc-400 mt-1 block">Goal: Lose 5.0 kg total</span>
          </div>

          <div className="p-4 bg-black/40 rounded-xl border border-white/10">
            <span className="text-xs text-zinc-400 block mb-1">Remaining Target</span>
            <div className="text-2xl font-black text-amber-400">{remainingKg} kg</div>
            <span className="text-[11px] text-zinc-400 mt-1 block">To reach 75.0 kg</span>
          </div>

          <div className="p-4 bg-black/40 rounded-xl border border-white/10">
            <span className="text-xs text-zinc-400 block mb-1">Completion Progress</span>
            <div className="text-2xl font-black text-teal-300">{progressPercent}%</div>
            <span className="text-[11px] text-teal-400 font-medium mt-1 block">{progressAchievedKg} kg / 5 kg</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 h-full rounded-full transition-all duration-700"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Trajectory Recharts Chart & BMI Calculator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weight Trajectory Chart */}
        <div className="lg:col-span-2 bg-[#0D0E16] border border-white/10 rounded-2xl p-5 space-y-4">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-emerald-400" /> Weight Progression Trend (80 kg → 75 kg)
          </h4>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="weightGradView" x1="0" y1="0" x2="0" y2="1">
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
                  name="Weight (kg)"
                  stroke="#10b981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#weightGradView)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* BMI Calculator Widget */}
        <div className="bg-[#0D0E16] border border-white/10 rounded-2xl p-5 space-y-4">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Calculator className="w-4 h-4 text-indigo-400" /> BMI & Body Metric Calculator
          </h4>

          <div className="space-y-3">
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Height (cm)</label>
              <input
                type="number"
                value={heightCm}
                onChange={(e) => setHeightCm(Number(e.target.value))}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="p-4 bg-white/5 border border-white/10 rounded-xl text-center space-y-1">
              <span className="text-xs text-zinc-400">Body Mass Index (BMI)</span>
              <div className="text-3xl font-black text-white">{bmiValue}</div>
              <span className={`text-xs font-bold uppercase tracking-wider ${bmiObj.color}`}>
                {bmiObj.status}
              </span>
            </div>

            {latestLog && (
              <div className="grid grid-cols-2 gap-2 text-xs pt-2">
                <div className="p-2.5 bg-white/5 rounded-lg border border-white/5">
                  <span className="text-zinc-400 block text-[10px]">Body Fat %</span>
                  <span className="font-bold text-amber-400">{latestLog.bodyFatPercent || 22.5}%</span>
                </div>
                <div className="p-2.5 bg-white/5 rounded-lg border border-white/5">
                  <span className="text-zinc-400 block text-[10px]">Muscle Mass</span>
                  <span className="font-bold text-cyan-400">{latestLog.muscleMassKg || 59} kg</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Log Entry History Table */}
      <div className="bg-[#0D0E16] border border-white/10 rounded-2xl p-5 space-y-3">
        <h4 className="text-sm font-bold text-white">Weight Log History</h4>
        <div className="space-y-2">
          {sortedLogs.slice().reverse().map((log) => (
            <div key={log.id} className="p-3 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-white">{log.weightKg} kg</span>
                <span className="text-xs text-zinc-400 block">{log.date} {log.notes && `• "${log.notes}"`}</span>
              </div>
              <button
                onClick={() => onDeleteWeightLog(log.id)}
                className="text-zinc-500 hover:text-rose-400 p-1"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#12131F] border border-white/10 w-full max-w-md rounded-2xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="font-bold text-white text-lg flex items-center gap-2">
                <Scale className="w-5 h-5 text-emerald-400" /> Log Weight Entry
              </h3>
              <button onClick={() => setShowModal(false)} className="text-zinc-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={weightKg}
                  onChange={(e) => setWeightKg(Number(e.target.value))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Body Fat (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={bodyFatPercent}
                    onChange={(e) => setBodyFatPercent(Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Muscle Mass (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={muscleMassKg}
                    onChange={(e) => setMuscleMassKg(Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Notes</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Fasted morning check-in"
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/30"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
