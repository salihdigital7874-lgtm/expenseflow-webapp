import React, { useState, useEffect } from 'react';
import {
  Target,
  Plus,
  Briefcase,
  GraduationCap,
  Smartphone,
  Heart,
  Calendar,
  X,
  Trash2,
  TrendingUp,
  Award,
} from 'lucide-react';
import { GoalItem, getStoredGoals, saveGoals } from '../services/productivityStorage';

interface GoalsProps {
  showToast?: (msg: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export const GoalsPage: React.FC<GoalsProps> = ({ showToast }) => {
  const [goals, setGoals] = useState<GoalItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<'All' | 'Personal' | 'Business' | 'Completed'>('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<GoalItem['category']>('Business');
  const [newTargetDate, setNewTargetDate] = useState('31 Dec 2026');
  const [newProgress, setNewProgress] = useState(50);

  useEffect(() => {
    setGoals(getStoredGoals());
  }, []);

  const handleDeleteGoal = (id: string) => {
    const updated = goals.filter((g) => g.id !== id);
    setGoals(updated);
    saveGoals(updated);
    if (showToast) showToast('Goal removed', 'info');
  };

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    let color = '#10B981';
    if (newCategory === 'Personal') color = '#8B5CF6';
    if (newCategory === 'Business') color = '#3B82F6';

    const newGoal: GoalItem = {
      id: 'g_' + Date.now(),
      title: newTitle.trim(),
      category: newCategory,
      targetDate: newTargetDate,
      progress: Number(newProgress),
      color,
    };

    const updated = [newGoal, ...goals];
    setGoals(updated);
    saveGoals(updated);
    setIsAddModalOpen(false);
    setNewTitle('');
    if (showToast) showToast('New goal created!', 'success');
  };

  const handleUpdateProgress = (id: string, newProg: number) => {
    const updated = goals.map((g) => (g.id === id ? { ...g, progress: newProg } : g));
    setGoals(updated);
    saveGoals(updated);
  };

  const filteredGoals = goals.filter((g) => {
    if (activeFilter === 'Personal') return g.category === 'Personal';
    if (activeFilter === 'Business') return g.category === 'Business';
    if (activeFilter === 'Completed') return g.progress >= 100;
    return true;
  });

  const getCategoryIcon = (title: string, category: GoalItem['category']) => {
    if (title.toLowerCase().includes('agency') || category === 'Business') {
      return (
        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 shadow-xs">
          <Briefcase className="w-6 h-6 stroke-[2]" />
        </div>
      );
    }
    if (title.toLowerCase().includes('python') || title.toLowerCase().includes('learn')) {
      return (
        <div className="w-12 h-12 rounded-2xl bg-pink-50 text-pink-600 flex items-center justify-center shrink-0 shadow-xs">
          <GraduationCap className="w-6 h-6 stroke-[2]" />
        </div>
      );
    }
    if (title.toLowerCase().includes('iphone') || title.toLowerCase().includes('phone')) {
      return (
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 shadow-xs">
          <Smartphone className="w-6 h-6 stroke-[2]" />
        </div>
      );
    }
    return (
      <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 shadow-xs">
        <Heart className="w-6 h-6 stroke-[2]" />
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Filter and Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {(['All', 'Personal', 'Business', 'Completed'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all btn-press shrink-0 ${
                activeFilter === filter
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/25'
                  : 'bg-white/80 hover:bg-white text-slate-600 border border-slate-200/80 shadow-2xs'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Add Goal Button */}
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-purple-600/30 transition-all btn-press shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Goal</span>
        </button>
      </div>

      {/* Goals List (Matching Screen 6 Mockup) */}
      <div className="space-y-3.5">
        {filteredGoals.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center text-slate-400 border border-slate-100">
            <Target className="w-10 h-10 mx-auto mb-2 text-slate-300 stroke-[1.5]" />
            <p className="text-sm font-semibold">No goals found for this category</p>
          </div>
        ) : (
          filteredGoals.map((goal) => (
            <div
              key={goal.id}
              className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-xs hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              {/* Left: Icon + Title + Category + Target Date */}
              <div className="flex items-center gap-4 min-w-0 flex-1">
                {getCategoryIcon(goal.title, goal.category)}

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm sm:text-base font-black text-slate-900 truncate">{goal.title}</h4>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {goal.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5 mt-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Target: {goal.targetDate}</span>
                  </p>
                </div>
              </div>

              {/* Right: Progress bar & percentage & Actions */}
              <div className="flex items-center gap-4 w-full md:w-72 shrink-0">
                <div className="flex-1">
                  <div className="flex justify-between text-xs font-bold mb-1.5">
                    <span className="text-slate-400">Progress</span>
                    <span className="text-slate-800">{goal.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, goal.progress)}%`,
                        backgroundColor: goal.color || '#8B5CF6',
                      }}
                    />
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteGoal(goal.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors btn-press shrink-0"
                  title="Delete goal"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Goal Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-black text-slate-900">Create New Goal</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddGoal} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Goal Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Learn UI/UX Design"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 bg-white"
                  >
                    <option value="Personal">Personal</option>
                    <option value="Business">Business</option>
                    <option value="Health">Health</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">Target Date</label>
                  <input
                    type="text"
                    placeholder="31 Dec 2026"
                    value={newTargetDate}
                    onChange={(e) => setNewTargetDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Initial Progress: {newProgress}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={newProgress}
                  onChange={(e) => setNewProgress(Number(e.target.value))}
                  className="w-full accent-purple-600 cursor-pointer"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-md shadow-purple-600/30"
                >
                  Save Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
