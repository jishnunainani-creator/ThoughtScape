import React, { useState } from 'react';
import { NoteColor } from '../../types';
import { STICKY_COLORS, COLOR_LIST } from '../../constants/colors';
import { X, Palette, Check } from 'lucide-react';

interface ColorMeaningModalProps {
  isOpen: boolean;
  colorMeanings: Record<NoteColor, string>;
  onClose: () => void;
  onSave: (meanings: Record<NoteColor, string>) => void;
}

export const ColorMeaningModal: React.FC<ColorMeaningModalProps> = ({
  isOpen,
  colorMeanings,
  onClose,
  onSave,
}) => {
  const [meanings, setMeanings] = useState<Record<NoteColor, string>>(colorMeanings);

  if (!isOpen) return null;

  const handleChange = (color: NoteColor, value: string) => {
    setMeanings((prev) => ({ ...prev, [color]: value }));
  };

  const handleSave = () => {
    onSave(meanings);
    onClose();
  };

  return (
    <div
      data-export-ignore="true"
      className="fixed inset-0 z-[99999] bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 select-none animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-blue-600" />
            <h2 className="font-bold text-base text-slate-900">Customize Color Meanings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List of Colors */}
        <div className="p-6 overflow-y-auto space-y-3">
          {COLOR_LIST.map((color) => {
            const cfg = STICKY_COLORS[color];
            return (
              <div key={color} className="flex items-center gap-3">
                <div
                  style={{ backgroundColor: cfg.hex, borderColor: cfg.borderHex }}
                  className="w-7 h-7 rounded-lg border shadow-xs shrink-0"
                />
                <div className="w-28 text-xs font-semibold text-slate-700 truncate shrink-0">
                  {cfg.name}
                </div>
                <input
                  type="text"
                  value={meanings[color] || ''}
                  placeholder={cfg.label}
                  onChange={(e) => handleChange(color, e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium text-xs rounded-xl hover:bg-slate-200/60 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-md transition-all active:scale-95"
          >
            <Check className="w-3.5 h-3.5" />
            Save Legend
          </button>
        </div>
      </div>
    </div>
  );
};
