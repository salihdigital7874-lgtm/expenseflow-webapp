import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Trash2,
  X,
  CheckCircle2,
  MapPin,
} from 'lucide-react';
import { CalendarEvent, getStoredEvents, saveEvents } from '../services/productivityStorage';

interface CalendarProps {
  showToast?: (msg: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export const CalendarPage: React.FC<CalendarProps> = ({ showToast }) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [activeView, setActiveView] = useState<'Month' | 'Week' | 'Day' | 'Agenda'>('Month');
  const [selectedDay, setSelectedDay] = useState<number>(25);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('10:00 AM - 11:00 AM');
  const [newTag, setNewTag] = useState<CalendarEvent['tag']>('Work');

  useEffect(() => {
    setEvents(getStoredEvents());
  }, []);

  const handleDeleteEvent = (id: string) => {
    const updated = events.filter((e) => e.id !== id);
    setEvents(updated);
    saveEvents(updated);
    if (showToast) showToast('Event removed', 'info');
  };

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newEvent: CalendarEvent = {
      id: 'evt_' + Date.now(),
      title: newTitle.trim(),
      time: newTime,
      date: `2026-11-${String(selectedDay).padStart(2, '0')}`,
      tag: newTag,
    };

    const updated = [...events, newEvent];
    setEvents(updated);
    saveEvents(updated);
    setIsAddModalOpen(false);
    setNewTitle('');
    if (showToast) showToast('Event added to calendar!', 'success');
  };

  const getTagBadgeStyle = (tag: CalendarEvent['tag']) => {
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

  // November 2026 starts on Sunday (1) and has 30 days
  const daysInNov = Array.from({ length: 30 }, (_, i) => i + 1);

  return (
    <div className="space-y-6">
      {/* Top Filter and Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* View Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {(['Month', 'Week', 'Day', 'Agenda'] as const).map((view) => (
            <button
              key={view}
              onClick={() => setActiveView(view)}
              className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all btn-press shrink-0 ${
                activeView === view
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/25'
                  : 'bg-white/80 hover:bg-white text-slate-600 border border-slate-200/80 shadow-2xs'
              }`}
            >
              {view}
            </button>
          ))}
        </div>

        {/* Add Event Button */}
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-purple-600/30 transition-all btn-press shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Event</span>
        </button>
      </div>

      {/* 2-Column Grid (Calendar + Selected Day Schedule) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Month Calendar Card (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-xs">
          {/* Calendar Header */}
          <div className="flex items-center justify-between pb-5 border-b border-slate-100">
            <button className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              November 2026
            </h3>
            <button className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Weekday Names */}
          <div className="grid grid-cols-7 gap-1 text-center py-3 text-xs font-bold text-slate-400">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {daysInNov.map((day) => {
              const isSelected = selectedDay === day;
              const hasEvents = [10, 15, 20, 25, 28].includes(day);

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`h-10 sm:h-12 rounded-xl flex flex-col items-center justify-center relative font-bold text-xs sm:text-sm transition-all btn-press ${
                    isSelected
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                      : 'hover:bg-purple-50 text-slate-700'
                  }`}
                >
                  <span>{day}</span>
                  {hasEvents && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full mt-0.5 ${
                        isSelected ? 'bg-white' : 'bg-purple-500'
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Schedule for Selected Day (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-xs flex flex-col">
          {/* Schedule Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h4 className="text-base font-black text-slate-900">
                Wed, {selectedDay} Nov 2026
              </h4>
              <p className="text-xs text-slate-400 font-medium">Daily Schedule</p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-purple-50 text-purple-600 border border-purple-200">
              Today
            </span>
          </div>

          {/* Events List for selected day */}
          <div className="space-y-3.5 mt-4 flex-1">
            {events.map((event) => (
              <div
                key={event.id}
                className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-100 hover:bg-slate-50 transition-all flex items-start justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-purple-600" />
                    <span>{event.time}</span>
                  </p>
                  <p className="text-sm font-bold text-slate-900 mt-1 truncate">{event.title}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${getTagBadgeStyle(event.tag)}`}>
                    {event.tag}
                  </span>
                  <button
                    onClick={() => handleDeleteEvent(event.id)}
                    className="p-1 text-slate-300 hover:text-rose-500 rounded-md transition-colors"
                    title="Remove event"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Event Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-black text-slate-900">Add Schedule Event</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddEvent} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Event Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Strategy Sync Meeting"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                />
              </div>

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
                  Save Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
