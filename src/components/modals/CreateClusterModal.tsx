import React, { useState } from 'react';
import { X, Layers, Sparkles } from 'lucide-react';
import { NoteColor } from '../../types';
import { STICKY_COLORS } from '../../constants/colors';

interface CreateClusterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (title: string, description: string, color: NoteColor) => void;
}

const CLUSTER_COLORS: { color: NoteColor; label: string }[] = [
  { color: 'blue', label: 'Blue' },
  { color: 'purple', label: 'Lavender' },
  { color: 'green', label: 'Green' },
  { color: 'yellow', label: 'Yellow' },
  { color: 'peach', label: 'Peach' },
  { color: 'pink', label: 'Pink' },
  { color: 'orange', label: 'Orange' },
];

export const CreateClusterModal: React.FC<CreateClusterModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState<NoteColor>('blue');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onCreate(title.trim(), description.trim(), color);
    setTitle('');
    setDescription('');
    setColor('blue');
    onClose();
  };

  return (
    <div
      data-export-ignore="true"
      className="fixed inset-0 z-[99999] bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 select-none animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 flex flex-col animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-slate-900">Create Cluster</h2>
              <p className="text-xs text-slate-500">Group related thoughts together.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Cluster Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Exam Preparation, Weekend Plans, Ideas..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all font-medium"
            />
          </div>

          {/* Description (Optional) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Topics and tasks for my upcoming tests"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
            />
          </div>

          {/* Color Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Highlight Tint
            </label>
            <div className="flex items-center gap-2">
              {CLUSTER_COLORS.map((c) => {
                const isSelected = color === c.color;
                const config = STICKY_COLORS[c.color];
                return (
                  <button
                    key={c.color}
                    type="button"
                    onClick={() => setColor(c.color)}
                    style={{ backgroundColor: config.hex }}
                    className={`w-7 h-7 rounded-xl border transition-all flex items-center justify-center ${
                      isSelected
                        ? 'ring-2 ring-blue-600 ring-offset-2 scale-110 shadow-xs'
                        : 'border-slate-300 hover:scale-105'
                    }`}
                    title={c.label}
                  />
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-xl shadow-xs shadow-blue-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Create Cluster</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
