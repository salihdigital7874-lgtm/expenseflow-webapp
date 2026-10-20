import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Clock,
  AlertCircle,
  CheckCircle2,
  Plus,
  MoreVertical,
  Trash2,
  Calendar,
  Tag,
  X,
  Search,
} from 'lucide-react';
import { TaskItem, getStoredTasks, saveTasks } from '../services/productivityStorage';

interface TasksProps {
  showToast?: (msg: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export const TasksPage: React.FC<TasksProps> = ({ showToast }) => {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<'All' | 'Today' | 'Upcoming' | 'Completed'>('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('10:00 AM - 11:00 AM');
  const [newDate, setNewDate] = useState('Today');
  const [newTag, setNewTag] = useState<TaskItem['tag']>('Work');

  useEffect(() => {
    setTasks(getStoredTasks());
  }, []);

  const handleToggleTask = (id: string) => {
    const updated = tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
    setTasks(updated);
    saveTasks(updated);
  };

  const handleDeleteTask = (id: string) => {
    const updated = tasks.filter((t) => t.id !== id);
    setTasks(updated);
    saveTasks(updated);
    if (showToast) showToast('Task deleted', 'info');
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newTask: TaskItem = {
      id: 'task_' + Date.now(),
      title: newTitle.trim(),
      time: newTime,
      date: newDate,
      tag: newTag,
      completed: false,
    };

    const updated = [newTask, ...tasks];
    setTasks(updated);
    saveTasks(updated);
    setIsAddModalOpen(false);
    setNewTitle('');
    if (showToast) showToast('New task added successfully!', 'success');
  };

  // Metrics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const inProgressTasks = tasks.filter((t) => !t.completed && t.date === 'Today').length;
  const pendingTasks = tasks.filter((t) => !t.completed && t.date !== 'Today').length;

  // Filtered List
  const filteredTasks = tasks.filter((t) => {
    if (activeFilter === 'Today') return t.date === 'Today';
    if (activeFilter === 'Upcoming') return t.date === 'Tomorrow' || t.date.includes('2026');
    if (activeFilter === 'Completed') return t.completed;
    return true;
  });

  const getTagBadgeStyle = (tag: TaskItem['tag']) => {
    switch (tag) {
      case 'Work':
        return 'bg-blue-50 text-blue-600 border border-blue-200';
      case 'Marketing':
        return 'bg-pink-50 text-pink-600 border border-pink-200';
      case 'Health':
        return 'bg-emerald-50 text-emerald-600 border border-emerald-200';
      case 'Clients':
        return 'bg-orange-50 text-orange-600 border border-orange-200';
      case 'Personal':
        return 'bg-purple-50 text-purple-600 border border-purple-200';
      default:
        return 'bg-slate-50 text-slate-600 border border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Filter and Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {(['All', 'Today', 'Upcoming', 'Completed'] as const).map((filter) => (
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

        {/* Add Task Button */}
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-purple-600/30 transition-all btn-press shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Task</span>
        </button>
      </div>

      {/* 4 Status Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Total Tasks */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
            <CheckSquare className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <p className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{totalTasks}</p>
            <p className="text-xs font-semibold text-slate-500">Total Tasks</p>
          </div>
        </div>

        {/* Completed */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
            <CheckCircle2 className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <p className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{completedTasks}</p>
            <p className="text-xs font-semibold text-slate-500">Completed</p>
          </div>
        </div>

        {/* In Progress */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
            <Clock className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <p className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{inProgressTasks}</p>
            <p className="text-xs font-semibold text-slate-500">In Progress</p>
          </div>
        </div>

        {/* Pending */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500 shrink-0">
            <AlertCircle className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <p className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{pendingTasks}</p>
            <p className="text-xs font-semibold text-slate-500">Pending</p>
          </div>
        </div>
      </div>

      {/* Task List Table Container (Exact Mockup) */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden">
        <div className="divide-y divide-slate-100">
          {filteredTasks.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <CheckSquare className="w-10 h-10 mx-auto mb-2 text-slate-300 stroke-[1.5]" />
              <p className="text-sm font-semibold">No tasks found for this filter</p>
            </div>
          ) : (
            filteredTasks.map((task) => (
              <div
                key={task.id}
                className={`p-4 sm:p-5 flex items-center justify-between gap-3 sm:gap-4 transition-colors hover:bg-slate-50/70 ${
                  task.completed ? 'bg-slate-50/40' : ''
                }`}
              >
                {/* Left: Checkbox + Title + Time */}
                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                  <button
                    onClick={() => handleToggleTask(task.id)}
                    className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all shrink-0 btn-press ${
                      task.completed
                        ? 'bg-purple-600 border-purple-600 text-white'
                        : 'border-slate-300 hover:border-purple-500 bg-white'
                    }`}
                  >
                    {task.completed && <CheckCircle2 className="w-4 h-4" />}
                  </button>

                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-sm sm:text-base font-bold text-slate-900 truncate ${
                        task.completed ? 'line-through text-slate-400 font-normal' : ''
                      }`}
                    >
                      {task.title}
                    </p>
                    <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5 mt-0.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>
                        {task.date}, {task.time}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Right: Tag + Avatar + Actions */}
                <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                  {/* Category Tag */}
                  <span className={`text-[11px] font-bold px-3 py-1 rounded-full ${getTagBadgeStyle(task.tag)}`}>
                    {task.tag}
                  </span>

                  {/* Assignee Avatar */}
                  <img
                    src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&auto=format&fit=crop&q=80"
                    alt="Salih"
                    className="w-7 h-7 rounded-full object-cover border border-white shadow-xs hidden sm:block"
                  />

                  {/* Delete / Actions */}
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors btn-press"
                    title="Delete task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Task Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-black text-slate-900">Add New Task</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddTask} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Task Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Client presentation review"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">Time Range</label>
                  <input
                    type="text"
                    placeholder="10:00 AM - 11:00 AM"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">Date</label>
                  <select
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 bg-white"
                  >
                    <option value="Today">Today</option>
                    <option value="Tomorrow">Tomorrow</option>
                    <option value="Upcoming">Upcoming</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Category Tag</label>
                <div className="flex flex-wrap gap-2">
                  {(['Work', 'Marketing', 'Health', 'Clients', 'Personal'] as const).map((tag) => (
                    <button
                      type="button"
                      key={tag}
                      onClick={() => setNewTag(tag)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        newTag === tag
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
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
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
