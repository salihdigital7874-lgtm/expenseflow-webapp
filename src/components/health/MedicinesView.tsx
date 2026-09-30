import React, { useState } from 'react';
import { Pill, Plus, Trash2, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import { MedicineLog } from '../../types/health';

interface MedicinesViewProps {
  medicines: MedicineLog[];
  onAddMedicine: (med: MedicineLog) => void;
  onToggleTaken: (id: string) => void;
  onDeleteMedicine: (id: string) => void;
}

export const MedicinesView: React.FC<MedicinesViewProps> = ({
  medicines,
  onAddMedicine,
  onToggleTaken,
  onDeleteMedicine,
}) => {
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('500mg');
  const [frequency, setFrequency] = useState<MedicineLog['frequency']>('Once Daily');
  const [instruction, setInstruction] = useState<MedicineLog['instruction']>('After Food');
  const [stockCount, setStockCount] = useState(30);
  const [notes, setNotes] = useState('');

  const [showModal, setShowModal] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const newMed: MedicineLog = {
      id: 'med-' + Date.now(),
      name: name.trim(),
      dosage,
      frequency,
      timeOfDay: ['Morning'],
      instruction,
      stockCount: Number(stockCount),
      takenToday: false,
      notes,
    };
    onAddMedicine(newMed);
    setShowModal(false);
    setName('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Pill className="w-5 h-5 text-purple-400" /> Medication Schedule & Pill Inventory
          </h3>
          <p className="text-xs text-zinc-400">Track daily dosages, time schedules, and remaining pill stock</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl text-xs transition-all shadow-lg shadow-purple-600/20"
        >
          <Plus className="w-4 h-4" /> Add Medicine
        </button>
      </div>

      {/* Medicines Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {medicines.map((med) => {
          const isLowStock = med.stockCount <= 10;

          return (
            <div
              key={med.id}
              className={`bg-[#0D0E16] border rounded-2xl p-5 space-y-4 transition-all ${
                med.takenToday
                  ? 'border-emerald-500/40 bg-emerald-950/10'
                  : 'border-white/10 hover:border-purple-500/30'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl ${med.takenToday ? 'bg-emerald-500/20 text-emerald-400' : 'bg-purple-500/20 text-purple-400'}`}>
                    <Pill className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-base">{med.name}</h4>
                    <span className="text-xs font-medium text-purple-300">{med.dosage} • {med.frequency}</span>
                  </div>
                </div>

                <button
                  onClick={() => onDeleteMedicine(med.id)}
                  className="text-zinc-500 hover:text-rose-400 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-white/5 rounded-xl border border-white/5">
                  <span className="text-zinc-400 block text-[10px]">Timing Instruction</span>
                  <span className="font-semibold text-white">{med.instruction}</span>
                </div>
                <div className="p-2.5 bg-white/5 rounded-xl border border-white/5">
                  <span className="text-zinc-400 block text-[10px]">Stock Left</span>
                  <span className={`font-bold flex items-center gap-1 ${isLowStock ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {med.stockCount} Pills {isLowStock && <AlertTriangle className="w-3 h-3" />}
                  </span>
                </div>
              </div>

              <button
                onClick={() => onToggleTaken(med.id)}
                className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  med.takenToday
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                    : 'bg-white/10 text-zinc-300 hover:bg-purple-600 hover:text-white'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                {med.takenToday ? 'Marked as Taken Today' : 'Mark Taken for Today'}
              </button>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#12131F] border border-white/10 w-full max-w-md rounded-2xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="font-bold text-white text-lg flex items-center gap-2">
                <Pill className="w-5 h-5 text-purple-400" /> Add New Medicine
              </h3>
              <button onClick={() => setShowModal(false)} className="text-zinc-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Medicine Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Multivitamin / Paracetamol"
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Dosage</label>
                  <input
                    type="text"
                    value={dosage}
                    onChange={(e) => setDosage(e.target.value)}
                    placeholder="e.g. 500mg"
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Frequency</label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as any)}
                    className="w-full bg-[#1A1B2E] border border-white/10 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="Once Daily">Once Daily</option>
                    <option value="Twice Daily">Twice Daily</option>
                    <option value="Three Times Daily">Three Times Daily</option>
                    <option value="As Needed">As Needed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Instruction</label>
                  <select
                    value={instruction}
                    onChange={(e) => setInstruction(e.target.value as any)}
                    className="w-full bg-[#1A1B2E] border border-white/10 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="Before Food">Before Food</option>
                    <option value="After Food">After Food</option>
                    <option value="With Water">With Water</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Pill Stock Count</label>
                  <input
                    type="number"
                    value={stockCount}
                    onChange={(e) => setStockCount(Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
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
                  Save Medicine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
