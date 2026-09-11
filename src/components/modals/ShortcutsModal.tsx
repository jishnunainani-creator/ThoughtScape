import React from 'react';
import { X, Keyboard } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'N', desc: 'Create new sticky note at viewport center' },
    { key: '⌘ + ⇧ + N', desc: 'Quick capture sticky note' },
    { key: 'Delete / Backspace', desc: 'Delete selected note, section, or arrow' },
    { key: '⌘ + ⇧ + Backspace', desc: 'Clear current landscape (with confirmation)' },
    { key: '⌘ + D', desc: 'Duplicate selected note' },
    { key: '⌘ + Z', desc: 'Undo last change' },
    { key: '⌘ + ⇧ + Z / ⌘ + Y', desc: 'Redo last undone change' },
    { key: '⌘ + K', desc: 'Open Command Palette' },
    { key: '⌘ + F', desc: 'Spotlight search across notes' },
    { key: '0 / ⌘ + 0', desc: 'Fit all notes in view' },
    { key: '+ / -', desc: 'Zoom in / Zoom out' },
    { key: 'Space + Drag', desc: 'Pan infinite canvas smoothly' },
    { key: 'Trackpad Pinch / Scroll', desc: 'Zoom and pan freely' },
    { key: 'Escape', desc: 'Deselect / Exit Presentation / Close modal' },
  ];

  return (
    <div
      data-export-ignore="true"
      className="fixed inset-0 z-[99999] bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 select-none animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-blue-600" />
            <h2 className="font-bold text-base text-slate-900">Keyboard Shortcuts</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-2.5 max-h-96 overflow-y-auto">
          {shortcuts.map((sc, i) => (
            <div key={i} className="flex items-center justify-between text-xs py-0.5 border-b border-slate-50 last:border-0">
              <span className="text-slate-600">{sc.desc}</span>
              <kbd className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-800 font-mono text-[11px] rounded-md shadow-2xs">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="flex justify-end px-6 py-3 bg-slate-50 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-200 transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
