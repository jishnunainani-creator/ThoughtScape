import React from 'react';
import { X, Trash2, AlertTriangle, Layers, StickyNote as StickyNoteIcon, Network, Undo2 } from 'lucide-react';

interface ClearLandscapeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmClear: () => void;
  landscapeName: string;
  thoughtsCount: number;
  clustersCount: number;
  connectionsCount: number;
}

export const ClearLandscapeModal: React.FC<ClearLandscapeModalProps> = ({
  isOpen,
  onClose,
  onConfirmClear,
  landscapeName,
  thoughtsCount,
  clustersCount,
  connectionsCount,
}) => {
  if (!isOpen) return null;

  const totalItems = thoughtsCount + clustersCount + connectionsCount;

  return (
    <div
      data-export-ignore="true"
      className="fixed inset-0 z-[99999] bg-slate-900/45 backdrop-blur-xs flex items-center justify-center p-4 select-none animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 flex flex-col animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="clear-landscape-title"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100/80">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 id="clear-landscape-title" className="font-bold text-base text-slate-900">
                Clear this landscape?
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Remove all canvas thoughts and structures.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            title="Cancel and close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Description & Target Landscape Box */}
        <div className="space-y-3.5">
          <p className="text-xs text-slate-600 leading-relaxed">
            This will remove all thoughts, clusters, and relationships from:
          </p>

          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl">
            <div className="text-xs font-bold text-slate-800 truncate">
              "{landscapeName || 'Current Landscape'}"
            </div>
          </div>

          {/* Item Count Breakdown */}
          <div className="bg-slate-50/70 border border-slate-100 rounded-2xl p-3.5 space-y-2">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Items to be cleared
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="flex items-center gap-2 p-2 bg-white rounded-xl border border-slate-100 shadow-2xs">
                <StickyNoteIcon className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <div className="min-w-0">
                  <div className="font-bold text-xs text-slate-800">{thoughtsCount}</div>
                  <div className="text-[10px] text-slate-400 truncate">thoughts</div>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2 bg-white rounded-xl border border-slate-100 shadow-2xs">
                <Layers className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <div className="min-w-0">
                  <div className="font-bold text-xs text-slate-800">{clustersCount}</div>
                  <div className="text-[10px] text-slate-400 truncate">clusters</div>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2 bg-white rounded-xl border border-slate-100 shadow-2xs">
                <Network className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <div className="min-w-0">
                  <div className="font-bold text-xs text-slate-800">{connectionsCount}</div>
                  <div className="text-[10px] text-slate-400 truncate">relations</div>
                </div>
              </div>
            </div>
          </div>

          {/* Reassurance Notice */}
          <div className="flex items-center gap-2 text-xs text-slate-500 bg-emerald-50/60 border border-emerald-100/80 rounded-xl px-3 py-2">
            <Undo2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="text-[11.5px] text-emerald-800 font-medium">
              This action can be undone at any time.
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2.5 mt-6 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 active:scale-98 rounded-xl transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirmClear();
              onClose();
            }}
            disabled={totalItems === 0}
            className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 active:scale-98 disabled:opacity-50 disabled:hover:bg-rose-600 rounded-xl shadow-xs shadow-rose-600/20 transition-all flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Landscape</span>
          </button>
        </div>
      </div>
    </div>
  );
};
