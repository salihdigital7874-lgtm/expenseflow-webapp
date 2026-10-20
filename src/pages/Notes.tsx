import React, { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  Trash2,
  X,
  Search,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { NoteItem, getStoredNotes, saveNotes } from '../services/productivityStorage';

interface NotesProps {
  showToast?: (msg: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export const NotesPage: React.FC<NotesProps> = ({ showToast }) => {
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<'All' | 'Work' | 'Personal' | 'Ideas'>('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<NoteItem['category']>('Ideas');

  useEffect(() => {
    setNotes(getStoredNotes());
  }, []);

  const handleDeleteNote = (id: string) => {
    const updated = notes.filter((n) => n.id !== id);
    setNotes(updated);
    saveNotes(updated);
    if (showToast) showToast('Note deleted', 'info');
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    let color = 'bg-amber-50 border-amber-200 text-amber-950';
    if (newCategory === 'Work') color = 'bg-rose-50 border-rose-200 text-rose-950';
    if (newCategory === 'Personal') color = 'bg-emerald-50 border-emerald-200 text-emerald-950';

    const newNote: NoteItem = {
      id: 'note_' + Date.now(),
      title: newTitle.trim(),
      content: newContent.trim(),
      category: newCategory,
      date: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      color,
    };

    const updated = [newNote, ...notes];
    setNotes(updated);
    saveNotes(updated);
    setIsAddModalOpen(false);
    setNewTitle('');
    setNewContent('');
    if (showToast) showToast('New note saved!', 'success');
  };

  const filteredNotes = notes.filter((n) => {
    if (activeFilter === 'Work') return n.category === 'Work';
    if (activeFilter === 'Personal') return n.category === 'Personal';
    if (activeFilter === 'Ideas') return n.category === 'Ideas';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Filter and Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {(['All', 'Work', 'Personal', 'Ideas'] as const).map((filter) => (
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

        {/* Add Note Button */}
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-purple-600/30 transition-all btn-press shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Note</span>
        </button>
      </div>

      {/* Pastel Sticky Notes Grid (Screen 9 Mockup) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {filteredNotes.length === 0 ? (
          <div className="col-span-full bg-white rounded-3xl p-12 text-center text-slate-400 border border-slate-100">
            <FileText className="w-10 h-10 mx-auto mb-2 text-slate-300 stroke-[1.5]" />
            <p className="text-sm font-semibold">No notes in this category</p>
          </div>
        ) : (
          filteredNotes.map((note) => (
            <div
              key={note.id}
              className={`rounded-3xl p-5 border shadow-2xs hover:shadow-md transition-all flex flex-col justify-between min-h-[170px] ${note.color}`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-black text-sm sm:text-base leading-snug">{note.title}</h4>
                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    className="p-1 opacity-60 hover:opacity-100 hover:text-rose-600 rounded-md transition-opacity"
                    title="Delete note"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-xs mt-2 leading-relaxed opacity-85 line-clamp-3">
                  {note.content}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 mt-3 border-t border-black/5 text-[11px] font-semibold opacity-70">
                <span>{note.date}</span>
                <span className="px-2 py-0.5 rounded-md bg-black/5 font-bold">{note.category}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Note Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-black text-slate-900">Create Sticky Note</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddNote} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Note Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Marketing Campaign Ideas"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 bg-white"
                >
                  <option value="Ideas">Ideas (Yellow Note)</option>
                  <option value="Work">Work (Rose Note)</option>
                  <option value="Personal">Personal (Mint Note)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Content</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Write your note here..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
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
                  Save Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
