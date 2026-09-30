import React, { useState } from 'react';
import { Footprints, Dumbbell, Flame, Timer, Plus, Trash2, Trophy, Activity } from 'lucide-react';
import { ExerciseLog } from '../../types/health';

interface ExerciseViewProps {
  exerciseLogs: ExerciseLog[];
  stepsGoal: number; // 8,000 steps
  onAddExerciseLog: (log: ExerciseLog) => void;
  onDeleteExerciseLog: (id: string) => void;
}

export const ExerciseView: React.FC<ExerciseViewProps> = ({
  exerciseLogs,
  stepsGoal,
  onAddExerciseLog,
  onDeleteExerciseLog,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const todayLogs = exerciseLogs.filter((e) => e.date === todayStr);
  const totalTodaySteps = todayLogs.reduce((sum, item) => sum + item.stepsCount, 0);
  const totalTodayCalories = todayLogs.reduce((sum, item) => sum + item.caloriesBurned, 0);
  const totalTodayMinutes = todayLogs.reduce((sum, item) => sum + item.durationMinutes, 0);

  const stepsPercent = Math.min(100, Math.round((totalTodaySteps / stepsGoal) * 100));

  const [date, setDate] = useState(todayStr);
  const [activityType, setActivityType] = useState<ExerciseLog['activityType']>('Brisk Walk');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [stepsCount, setStepsCount] = useState(4000);
  const [caloriesBurned, setCaloriesBurned] = useState(200);
  const [intensity, setIntensity] = useState<ExerciseLog['intensity']>('Moderate');
  const [notes, setNotes] = useState('');

  const [showModal, setShowModal] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newLog: ExerciseLog = {
      id: 'ex-' + Date.now(),
      date,
      activityType,
      durationMinutes: Number(durationMinutes),
      stepsCount: Number(stepsCount),
      caloriesBurned: Number(caloriesBurned),
      intensity,
      notes,
    };
    onAddExerciseLog(newLog);
    setShowModal(false);
  };

  const activityOptions: ExerciseLog['activityType'][] = [
    'Running',
    'Gym Workout',
    'Cycling',
    'Yoga & Stretching',
    'Swimming',
    'Brisk Walk',
    'HIIT',
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Footprints className="w-5 h-5 text-purple-400" /> Exercise & Steps Goal Tracker
          </h3>
          <p className="text-xs text-zinc-400">Steps Goal: {stepsGoal.toLocaleString()} steps per day</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl text-xs transition-all shadow-lg shadow-purple-600/20"
        >
          <Plus className="w-4 h-4" /> Log Workout / Steps
        </button>
      </div>

      {/* Main Steps Progress Banner */}
      <div className="bg-[#0D0E16] border border-purple-500/20 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3.5 bg-purple-500/20 text-purple-400 rounded-2xl border border-purple-500/30">
              <Footprints className="w-8 h-8" />
            </div>
            <div>
              <span className="text-xs text-zinc-400">Today's Step Count</span>
              <h2 className="text-3xl font-black text-white">
                {totalTodaySteps.toLocaleString()} <span className="text-sm font-normal text-zinc-400">/ {stepsGoal.toLocaleString()} steps</span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-6 text-sm">
            <div>
              <span className="text-xs text-zinc-400 block flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-orange-400" /> Burned
              </span>
              <span className="font-bold text-orange-400">{totalTodayCalories} kcal</span>
            </div>
            <div>
              <span className="text-xs text-zinc-400 block flex items-center gap-1">
                <Timer className="w-3.5 h-3.5 text-indigo-400" /> Active Time
              </span>
              <span className="font-bold text-indigo-400">{totalTodayMinutes} mins</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-zinc-400">
            <span>Steps Progress</span>
            <span className="text-purple-300 font-bold">{stepsPercent}% Achieved</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-purple-500 to-indigo-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${stepsPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-[#0D0E16] border border-white/10 rounded-2xl p-5 space-y-4">
        <h4 className="text-sm font-bold text-white flex items-center gap-2">
          <Dumbbell className="w-4 h-4 text-purple-400" /> Today's Workouts & Activities
        </h4>

        <div className="space-y-2">
          {todayLogs.length > 0 ? (
            todayLogs.map((log) => (
              <div key={log.id} className="p-4 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-white">{log.activityType}</span>
                    <p className="text-xs text-zinc-400">
                      {log.durationMinutes} mins • {log.intensity} Intensity {log.notes && `• "${log.notes}"`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-sm font-bold text-purple-300 block">{log.stepsCount.toLocaleString()} steps</span>
                    <span className="text-xs text-orange-400 font-medium">{log.caloriesBurned} kcal</span>
                  </div>
                  <button
                    onClick={() => onDeleteExerciseLog(log.id)}
                    className="text-zinc-500 hover:text-rose-400 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-xs text-zinc-500">No workout activities logged today.</div>
          )}
        </div>
      </div>

      {/* Log Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#12131F] border border-white/10 w-full max-w-md rounded-2xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="font-bold text-white text-lg flex items-center gap-2">
                <Dumbbell className="w-5 h-5 text-purple-400" /> Log Workout / Exercise
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
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Activity Type</label>
                <select
                  value={activityType}
                  onChange={(e) => setActivityType(e.target.value as any)}
                  className="w-full bg-[#1A1B2E] border border-white/10 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
                >
                  {activityOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Duration (Mins)</label>
                  <input
                    type="number"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Steps Counted</label>
                  <input
                    type="number"
                    value={stepsCount}
                    onChange={(e) => setStepsCount(Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Calories Burned (kcal)</label>
                  <input
                    type="number"
                    value={caloriesBurned}
                    onChange={(e) => setCaloriesBurned(Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Intensity</label>
                  <select
                    value={intensity}
                    onChange={(e) => setIntensity(e.target.value as any)}
                    className="w-full bg-[#1A1B2E] border border-white/10 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="Low">Low</option>
                    <option value="Moderate">Moderate</option>
                    <option value="High">High</option>
                    <option value="Intense">Intense</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Workout Notes</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. 5k morning run pace 5:30/km"
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
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
                  className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 shadow-lg shadow-purple-600/30"
                >
                  Save Activity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
