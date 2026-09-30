import React, { useState } from 'react';
import { Moon, Clock, Plus, Trash2, Award, Zap, BedDouble } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { SleepLog } from '../../types/health';

interface SleepViewProps {
  sleepLogs: SleepLog[];
  sleepGoalHours: number; // 7.5 hrs
  onAddSleepLog: (log: SleepLog) => void;
  onDeleteSleepLog: (id: string) => void;
}

export const SleepView: React.FC<SleepViewProps> = ({
  sleepLogs,
  sleepGoalHours,
  onAddSleepLog,
  onDeleteSleepLog,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const [date, setDate] = useState(todayStr);
  const [bedtime, setBedtime] = useState('23:00');
  const [wakeTime, setWakeTime] = useState('06:30');
  const [durationHours, setDurationHours] = useState(7.5);
  const [quality, setQuality] = useState<SleepLog['quality']>('Deep Restful');
  const [notes, setNotes] = useState('');
  const [showModal, setShowModal] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newLog: SleepLog = {
      id: 'slp-' + Date.now(),
      date,
      bedtime,
      wakeTime,
      durationHours: Number(durationHours),
      quality,
      notes,
    };
    onAddSleepLog(newLog);
    setShowModal(false);
  };

  const chartData = sleepLogs
    .slice()
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((s) => ({
      date: new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      hours: s.durationHours,
      goal: sleepGoalHours,
    }));

  const latestSleep = sleepLogs[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Moon className="w-5 h-5 text-amber-400" /> Sleep Duration & Rest Tracker
          </h3>
          <p className="text-xs text-zinc-400">Sleep Goal: {sleepGoalHours} Hours per night</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-xl text-xs transition-all shadow-lg shadow-amber-600/20"
        >
          <Plus className="w-4 h-4" /> Log Night Sleep
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#0D0E16] border border-white/10 rounded-2xl p-5 flex items-center gap-4">
          <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl">
            <BedDouble className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-zinc-400 block">Latest Night Sleep</span>
            <span className="text-xl font-black text-white">{latestSleep ? `${latestSleep.durationHours} hrs` : 'No data'}</span>
          </div>
        </div>

        <div className="bg-[#0D0E16] border border-white/10 rounded-2xl p-5 flex items-center gap-4">
          <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-xl">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-zinc-400 block">Sleep Goal Achievement</span>
            <span className="text-xl font-black text-indigo-400">
              {latestSleep && latestSleep.durationHours >= sleepGoalHours ? 'Target Achieved 🎉' : '7.5 Hrs Goal'}
            </span>
          </div>
        </div>

        <div className="bg-[#0D0E16] border border-white/10 rounded-2xl p-5 flex items-center gap-4">
          <div className="p-3 bg-purple-500/20 text-purple-400 rounded-xl">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-zinc-400 block">Quality Index</span>
            <span className="text-xl font-black text-purple-300">{latestSleep ? latestSleep.quality : 'Good'}</span>
          </div>
        </div>
      </div>

      {/* Sleep Duration Bar Chart */}
      <div className="bg-[#0D0E16] border border-white/10 rounded-2xl p-5 space-y-4">
        <h4 className="text-sm font-bold text-white">Sleep Trend History (Goal: 7.5 hrs)</h4>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="date" stroke="#71717a" fontSize={12} />
              <YAxis domain={[0, 10]} stroke="#71717a" fontSize={12} unit="h" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#18181b',
                  borderColor: '#27272a',
                  borderRadius: '0.75rem',
                  color: '#fff',
                }}
              />
              <Bar dataKey="hours" name="Sleep Hours" fill="#f59e0b" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Log Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#12131F] border border-white/10 w-full max-w-md rounded-2xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="font-bold text-white text-lg flex items-center gap-2">
                <Moon className="w-5 h-5 text-amber-400" /> Log Sleep Session
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
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Bedtime</label>
                  <input
                    type="time"
                    value={bedtime}
                    onChange={(e) => setBedtime(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Wake Time</label>
                  <input
                    type="time"
                    value={wakeTime}
                    onChange={(e) => setWakeTime(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Duration (Hours)</label>
                <input
                  type="number"
                  step="0.25"
                  value={durationHours}
                  onChange={(e) => setDurationHours(Number(e.target.value))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Sleep Quality</label>
                <select
                  value={quality}
                  onChange={(e) => setQuality(e.target.value as any)}
                  className="w-full bg-[#1A1B2E] border border-white/10 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="Deep Restful">Deep Restful</option>
                  <option value="Good">Good</option>
                  <option value="Disturbed">Disturbed</option>
                  <option value="Insomnia">Insomnia</option>
                </select>
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
                  className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-amber-600 hover:bg-amber-500 shadow-lg shadow-amber-600/30"
                >
                  Save Sleep
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
