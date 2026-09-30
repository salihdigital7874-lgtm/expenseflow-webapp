import React, { useState } from 'react';
import { Droplets, Plus, Trash2, GlassWater, Award, Clock } from 'lucide-react';
import { WaterLog } from '../../types/health';

interface WaterIntakeViewProps {
  waterLogs: WaterLog[];
  waterGoalLiters: number; // 2.5 L
  onAddWaterLog: (log: WaterLog) => void;
  onDeleteWaterLog: (id: string) => void;
}

export const WaterIntakeView: React.FC<WaterIntakeViewProps> = ({
  waterLogs,
  waterGoalLiters,
  onAddWaterLog,
  onDeleteWaterLog,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const todayLogs = waterLogs.filter((w) => w.date === todayStr);
  const totalTodayMl = todayLogs.reduce((sum, item) => sum + item.amountMl, 0);
  const goalMl = waterGoalLiters * 1000;
  const progressPercent = Math.min(100, Math.round((totalTodayMl / goalMl) * 100));
  const remainingMl = Math.max(0, goalMl - totalTodayMl);

  const [customMl, setCustomMl] = useState<number>(250);

  const handleQuickAdd = (amountMl: number, containerName: WaterLog['container']) => {
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    const newLog: WaterLog = {
      id: 'w-' + Date.now(),
      date: todayStr,
      time: timeNow,
      amountMl,
      container: containerName,
    };
    onAddWaterLog(newLog);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Droplets className="w-5 h-5 text-cyan-400" /> Hydration & Water Intake Tracker
          </h3>
          <p className="text-xs text-zinc-400">Target: {waterGoalLiters} Liters ({goalMl} ml) per day</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Cylinder Visual & Quick Log Buttons */}
        <div className="lg:col-span-1 bg-[#0D0E16] border border-white/10 rounded-2xl p-6 space-y-6 flex flex-col items-center justify-between text-center">
          <div className="w-full">
            <h4 className="text-sm font-bold text-zinc-300 mb-1">Today's Hydration Cylinder</h4>
            <span className="text-2xl font-black text-cyan-400">
              {(totalTodayMl / 1000).toFixed(2)} / {waterGoalLiters} L
            </span>
          </div>

          {/* Water Bottle Graphic */}
          <div className="relative w-32 h-64 bg-white/5 border-2 border-cyan-500/40 rounded-3xl overflow-hidden flex flex-col justify-end p-1 shadow-2xl shadow-cyan-500/10">
            <div
              className="w-full bg-gradient-to-t from-cyan-600 via-cyan-400 to-blue-400 rounded-2xl transition-all duration-700 relative overflow-hidden"
              style={{ height: `${progressPercent}%` }}
            >
              {/* Wave effect */}
              <div className="absolute inset-0 bg-white/20 animate-pulse" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center font-black text-xl text-white drop-shadow-md">
              {progressPercent}%
            </div>
          </div>

          <div className="w-full space-y-1">
            <div className="text-xs text-zinc-400">
              {remainingMl > 0 ? `${(remainingMl / 1000).toFixed(2)} L left to reach goal` : '🎉 Goal Achieved!'}
            </div>
          </div>
        </div>

        {/* Right Column: Preset Quick Action Buttons & Today's Hydration Logs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Presets */}
          <div className="bg-[#0D0E16] border border-white/10 rounded-2xl p-5 space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <GlassWater className="w-4 h-4 text-cyan-400" /> Log Water Intake
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                onClick={() => handleQuickAdd(250, 'Glass (250ml)')}
                className="p-4 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 rounded-xl flex flex-col items-center gap-2 transition-all hover:scale-[1.02]"
              >
                <GlassWater className="w-6 h-6 text-cyan-400" />
                <span className="text-xs font-bold text-white">+250 ml</span>
                <span className="text-[10px] text-zinc-400">Glass</span>
              </button>

              <button
                onClick={() => handleQuickAdd(500, 'Bottle (500ml)')}
                className="p-4 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 rounded-xl flex flex-col items-center gap-2 transition-all hover:scale-[1.02]"
              >
                <Droplets className="w-6 h-6 text-cyan-400" />
                <span className="text-xs font-bold text-white">+500 ml</span>
                <span className="text-[10px] text-zinc-400">Bottle</span>
              </button>

              <button
                onClick={() => handleQuickAdd(750, 'Sports Bottle (750ml)')}
                className="p-4 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 rounded-xl flex flex-col items-center gap-2 transition-all hover:scale-[1.02]"
              >
                <Droplets className="w-6 h-6 text-cyan-300" />
                <span className="text-xs font-bold text-white">+750 ml</span>
                <span className="text-[10px] text-zinc-400">Sports Bottle</span>
              </button>

              <button
                onClick={() => handleQuickAdd(1000, 'Pitcher (1000ml)')}
                className="p-4 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 rounded-xl flex flex-col items-center gap-2 transition-all hover:scale-[1.02]"
              >
                <Droplets className="w-6 h-6 text-blue-400" />
                <span className="text-xs font-bold text-white">+1000 ml</span>
                <span className="text-[10px] text-zinc-400">Large Pitcher</span>
              </button>
            </div>
          </div>

          {/* Today's Hydration History Table */}
          <div className="bg-[#0D0E16] border border-white/10 rounded-2xl p-5 space-y-3">
            <h4 className="text-sm font-bold text-white">Today's Intake Log</h4>

            <div className="space-y-2">
              {todayLogs.length > 0 ? (
                todayLogs.map((log) => (
                  <div key={log.id} className="p-3 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400">
                        <Droplets className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-white">{log.container}</span>
                        <span className="text-[10px] text-zinc-400 block flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {log.time}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-cyan-400">+{log.amountMl} ml</span>
                      <button
                        onClick={() => onDeleteWaterLog(log.id)}
                        className="text-zinc-500 hover:text-rose-400 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-xs text-zinc-500">No water intake logged for today.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
