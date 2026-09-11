import React from 'react';
import { Plus, BookOpen } from 'lucide-react';
import { NoteColor } from '../../types';
import { ThoughtscapeLogo } from '../common/ThoughtscapeLogo';

interface EmptyStateProps {
  onCreateNote: (color: NoteColor) => void;
  onOpenTemplates: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onCreateNote, onOpenTemplates }) => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none z-10">
      {/* Background Faint Silhouettes of Sticky Notes */}
      <div className="absolute w-64 h-56 bg-yellow-200/20 rounded-md -rotate-6 transform -translate-x-36 -translate-y-24 border border-yellow-300/30" />
      <div className="absolute w-64 h-56 bg-blue-200/20 rounded-md rotate-8 transform translate-x-44 -translate-y-16 border border-blue-300/30" />
      <div className="absolute w-64 h-56 bg-pink-200/20 rounded-md -rotate-3 transform translate-x-12 translate-y-32 border border-pink-300/30" />

      {/* Main Welcoming Card */}
      <div className="relative pointer-events-auto flex flex-col items-center text-center max-w-sm p-8 bg-white/85 backdrop-blur-md rounded-3xl border border-slate-200/80 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl mb-4 shadow-xs border border-blue-100">
          <ThoughtscapeLogo size={32} />
        </div>

        <h2 className="text-xl font-bold text-slate-900 tracking-tight mb-2">
          Your Thoughtscape is empty.
        </h2>

        <div className="text-xs text-slate-600 leading-relaxed mb-6 space-y-1.5">
          <p className="font-medium text-slate-800">
            Start with one thought.
          </p>
          <p className="text-slate-500">
            Place it anywhere. Build from there.
          </p>
          <p className="text-[11px] text-blue-600/80 italic pt-1">
            There is no wrong place for an idea.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full justify-center">
          <button
            onClick={() => onCreateNote('yellow')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Thought</span>
          </button>

          <button
            onClick={onOpenTemplates}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all active:scale-95"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Templates</span>
          </button>
        </div>
      </div>
    </div>
  );
};
