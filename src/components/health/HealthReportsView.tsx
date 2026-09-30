import React, { useRef } from 'react';
import { FileText, Download, Award, CheckCircle, Heart, Droplets, Footprints, Moon, Scale, ShieldCheck } from 'lucide-react';
import { HealthDataStore } from '../../types/health';

interface HealthReportsViewProps {
  data: HealthDataStore;
}

export const HealthReportsView: React.FC<HealthReportsViewProps> = ({ data }) => {
  const reportRef = useRef<HTMLDivElement>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  // Calculate Health Score Scorecard (0-100)
  const todayWater = data.waterLogs
    .filter((w) => w.date === todayStr)
    .reduce((sum, item) => sum + item.amountMl, 0);

  const todaySteps = data.exerciseLogs
    .filter((e) => e.date === todayStr)
    .reduce((sum, item) => sum + item.stepsCount, 0);

  const todaySleep = data.sleepLogs.find((s) => s.date === todayStr)?.durationHours || 7.5;

  const waterScore = Math.min(100, Math.round((todayWater / (data.goals.waterGoalLiters * 1000)) * 100));
  const stepsScore = Math.min(100, Math.round((todaySteps / data.goals.stepsGoal) * 100));
  const sleepScore = Math.min(100, Math.round((todaySleep / data.goals.sleepGoalHours) * 100));
  const weightScore = Math.min(100, Math.round((data.goals.progressKg / (data.goals.initialWeight - data.goals.targetWeight)) * 100));

  const overallScore = Math.round((waterScore + stepsScore + sleepScore + weightScore) / 4);

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const opt = {
        margin: 0.5,
        filename: `Health_Report_${todayStr}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
      };
      html2pdf().set(opt).from(reportRef.current).save();
    } catch (err) {
      console.error('Error generating PDF:', err);
      window.print();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400" /> Health Analytics & PDF Reports
          </h3>
          <p className="text-xs text-zinc-400">Generate executive summary & printable medical health scorecard</p>
        </div>
        <button
          onClick={handleDownloadPDF}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs transition-all shadow-lg shadow-emerald-600/20"
        >
          <Download className="w-4 h-4" /> Download PDF Report
        </button>
      </div>

      {/* Printable Report Section Container */}
      <div ref={reportRef} className="bg-[#0D0E16] border border-white/10 rounded-2xl p-6 space-y-6 text-white">
        {/* Report Header Branding */}
        <div className="flex items-center justify-between border-b border-white/10 pb-5">
          <div>
            <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider">Health Executive Summary</span>
            <h2 className="text-2xl font-extrabold text-white mt-1">Personal Health & Wellness Progress Report</h2>
            <p className="text-xs text-zinc-400">Date Generated: {new Date().toLocaleDateString('en-US', { dateStyle: 'full' })}</p>
          </div>
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-center">
            <span className="text-[10px] text-zinc-400 uppercase tracking-wider block font-semibold">Overall Health Score</span>
            <span className="text-3xl font-black text-emerald-400">{overallScore}%</span>
            <span className="text-[10px] text-emerald-300 block font-medium">Excellent Compliance</span>
          </div>
        </div>

        {/* Primary Goal Section */}
        <div className="p-4 bg-white/5 border border-white/5 rounded-xl space-y-3">
          <h4 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" /> Weight Loss Goal Breakdown: {data.goals.weightGoalTitle}
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-zinc-400 block text-[10px]">Initial Weight</span>
              <span className="font-bold text-white">{data.goals.initialWeight} kg</span>
            </div>
            <div>
              <span className="text-zinc-400 block text-[10px]">Current Logged Weight</span>
              <span className="font-bold text-emerald-400">{data.goals.currentWeight} kg</span>
            </div>
            <div>
              <span className="text-zinc-400 block text-[10px]">Target Weight</span>
              <span className="font-bold text-cyan-400">{data.goals.targetWeight} kg</span>
            </div>
            <div>
              <span className="text-zinc-400 block text-[10px]">Progress Achieved</span>
              <span className="font-bold text-teal-300">{data.goals.progressKg} kg Lost ({weightScore}%)</span>
            </div>
          </div>
        </div>

        {/* Goal Metrics Summary Table */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-white">Daily Target Achievement Scorecard</h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-1">
              <span className="flex items-center gap-1.5 text-cyan-400 font-semibold">
                <Droplets className="w-4 h-4" /> Water Intake Goal
              </span>
              <div className="text-lg font-bold text-white">
                {(todayWater / 1000).toFixed(1)} / {data.goals.waterGoalLiters} L/day
              </div>
              <span className="text-[11px] text-cyan-300 font-medium block">Compliance: {waterScore}%</span>
            </div>

            <div className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-1">
              <span className="flex items-center gap-1.5 text-purple-400 font-semibold">
                <Footprints className="w-4 h-4" /> Daily Steps Goal
              </span>
              <div className="text-lg font-bold text-white">
                {todaySteps.toLocaleString()} / {data.goals.stepsGoal.toLocaleString()} steps
              </div>
              <span className="text-[11px] text-purple-300 font-medium block">Compliance: {stepsScore}%</span>
            </div>

            <div className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-1">
              <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
                <Moon className="w-4 h-4" /> Night Sleep Goal
              </span>
              <div className="text-lg font-bold text-white">
                {todaySleep} / {data.goals.sleepGoalHours} Hours
              </div>
              <span className="text-[11px] text-amber-300 font-medium block">Compliance: {sleepScore}%</span>
            </div>
          </div>
        </div>

        {/* Medicines Schedule Summary */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-white">Active Medication Summary</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {data.medicines.map((med) => (
              <div key={med.id} className="p-3 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between">
                <div>
                  <p className="font-bold text-white">{med.name}</p>
                  <span className="text-[10px] text-zinc-400">{med.dosage} • {med.frequency}</span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${med.takenToday ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-300'}`}>
                  {med.takenToday ? 'Taken Today' : 'Scheduled'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
