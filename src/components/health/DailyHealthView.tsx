import React, { useState } from 'react';
import { Heart, Smile, BatteryCharging, Activity, Star, Plus, Trash2, Calendar } from 'lucide-react';
import { DailyHealthLog } from '../../types/health';

interface DailyHealthViewProps {
  logs: DailyHealthLog[];
  onAddDailyLog: (log: DailyHealthLog) => void;
  onDeleteDailyLog: (id: string) => void;
}

export const DailyHealthView: React.FC<DailyHealthViewProps> = ({
  logs,
  onAddDailyLog,
  onDeleteDailyLog,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const [date, setDate] = useState(todayStr);
  const [mood, setMood] = useState<DailyHealthLog['mood']>('Good');
  const [energyLevel, setEnergyLevel] = useState(4);
  const [heartRate, setHeartRate] = useState(72);
  const [bloodPressure, setBloodPressure] = useState('120/80');
  const [bloodSugar, setBloodSugar] = useState(95);
  const [spo2, setSpo2] = useState(98);
  const [rating, setRating] = useState(5);
  const [notes, setNotes] = useState('');

  const [showModal, setShowModal] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newLog: DailyHealthLog = {
      id: 'daily-' + Date.now(),
      date,
      mood,
      energyLevel: Number(energyLevel),
      heartRate: Number(heartRate),
      bloodPressure,
      bloodSugar: Number(bloodSugar),
      spo2: Number(spo2),
      rating: Number(rating),
      notes,
    };
    onAddDailyLog(newLog);
    setShowModal(false);
    setNotes('');
  };

  const moodsList: DailyHealthLog['mood'][] = ['Excellent', 'Good', 'Neutral', 'Tired', 'Stressed'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500" /> Daily Health & Vitals Journal
          </h3>
          <p className="text-xs text-zinc-400">Track daily mood, energy levels, heart rate, blood pressure & vitals</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-xl text-xs transition-all shadow-lg shadow-rose-600/20"
        >
          <Plus className="w-4 h-4" /> New Daily Check-in
        </button>
      </div>

      {/* Logs Table / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {logs.map((log) => (
          <div key={log.id} className="bg-[#0D0E16] border border-white/10 rounded-2xl p-5 space-y-4 hover:border-rose-500/30 transition-all">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300">
                <Calendar className="w-4 h-4 text-rose-400" /> {log.date}
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300">
                  {log.mood}
                </span>
                <button
                  onClick={() => onDeleteDailyLog(log.id)}
                  className="text-zinc-500 hover:text-rose-400 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-white/5 rounded-xl border border-white/5">
                <span className="text-zinc-400 block text-[10px]">Energy Level</span>
                <span className="font-bold text-amber-400">{log.energyLevel} / 5</span>
              </div>
              <div className="p-2.5 bg-white/5 rounded-xl border border-white/5">
                <span className="text-zinc-400 block text-[10px]">Heart Rate</span>
                <span className="font-bold text-rose-400">{log.heartRate || 70} BPM</span>
              </div>
              <div className="p-2.5 bg-white/5 rounded-xl border border-white/5">
                <span className="text-zinc-400 block text-[10px]">Blood Pressure</span>
                <span className="font-bold text-emerald-400">{log.bloodPressure || '120/80'}</span>
              </div>
              <div className="p-2.5 bg-white/5 rounded-xl border border-white/5">
                <span className="text-zinc-400 block text-[10px]">Oxygen (SpO2)</span>
                <span className="font-bold text-cyan-400">{log.spo2 || 98}%</span>
              </div>
            </div>

            {log.notes && (
              <p className="text-xs text-zinc-300 bg-white/5 p-3 rounded-xl border border-white/5 italic">
                "{log.notes}"
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Check-in Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#12131F] border border-white/10 w-full max-w-lg rounded-2xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="font-bold text-white text-lg flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-500" /> Daily Health Check-in
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
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-rose-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Mood</label>
                <div className="grid grid-cols-5 gap-2">
                  {moodsList.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMood(m)}
                      className={`p-2 rounded-xl text-xs font-semibold border transition-all ${
                        mood === m
                          ? 'bg-rose-600 text-white border-rose-500 shadow-lg shadow-rose-600/30'
                          : 'bg-white/5 text-zinc-400 border-white/10 hover:text-white'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Energy Level (1-5)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={energyLevel}
                    onChange={(e) => setEnergyLevel(Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Heart Rate (BPM)</label>
                  <input
                    type="number"
                    value={heartRate}
                    onChange={(e) => setHeartRate(Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Blood Pressure</label>
                  <input
                    type="text"
                    placeholder="120/80"
                    value={bloodPressure}
                    onChange={(e) => setBloodPressure(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Sugar (mg/dL)</label>
                  <input
                    type="number"
                    value={bloodSugar}
                    onChange={(e) => setBloodSugar(Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">SpO2 (%)</label>
                  <input
                    type="number"
                    value={spo2}
                    onChange={(e) => setSpo2(Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Daily Notes & Observations</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="How did you feel today? Any physical symptoms or workouts?"
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-rose-500"
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
                  className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-600/30"
                >
                  Save Check-in
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
