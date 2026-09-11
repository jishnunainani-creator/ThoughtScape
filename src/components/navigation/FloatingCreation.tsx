import React, { useState } from 'react';
import { NoteColor } from '../../types';
import { STICKY_COLORS, COLOR_LIST } from '../../constants/colors';
import { Plus } from 'lucide-react';
import { playPeelSound } from '../../utils/sound';

interface FloatingCreationProps {
  onCreateNote: (color: NoteColor) => void;
}

export const FloatingCreation: React.FC<FloatingCreationProps> = ({ onCreateNote }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredColor, setHoveredColor] = useState<NoteColor | null>(null);
  const [peelingColor, setPeelingColor] = useState<NoteColor | null>(null);

  const handleSelectColor = (color: NoteColor) => {
    setPeelingColor(color);
    playPeelSound();

    setTimeout(() => {
      onCreateNote(color);
      setPeelingColor(null);
      setIsOpen(false);
    }, 380);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end select-none">
      {/* 3D Flying Peeling Note Animation */}
      {peelingColor && (
        <div
          style={{
            backgroundColor: STICKY_COLORS[peelingColor].hex,
            borderColor: STICKY_COLORS[peelingColor].borderHex,
          }}
          className="fixed bottom-20 right-10 w-32 h-32 rounded-md border shadow-paper-lifted animate-peel-and-fly pointer-events-none z-[9999]"
        >
          <div className="absolute top-1 left-1/2 -translate-x-1/2 w-10 h-2.5 bg-white/40 rounded-xs shadow-2xs" />
          <div className="paper-curl-corner" />
        </div>
      )}

      {/* Compact Palette Popup */}
      {isOpen && (
        <div
          data-tutorial="color-picker"
          className="mb-3 p-3 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200/80 flex flex-col gap-2.5 animate-in slide-in-from-bottom-3 duration-200"
        >
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-1">
            <span>Choose your thought's color</span>
            {hoveredColor && (
              <span className="text-blue-600 normal-case font-medium">
                {STICKY_COLORS[hoveredColor].name}
              </span>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2">
            {COLOR_LIST.map((color) => {
              const cfg = STICKY_COLORS[color];
              return (
                <button
                  key={color}
                  onMouseEnter={() => setHoveredColor(color)}
                  onMouseLeave={() => setHoveredColor(null)}
                  onClick={() => handleSelectColor(color)}
                  style={{ backgroundColor: cfg.hex, borderColor: cfg.borderHex }}
                  className="group relative w-12 h-12 rounded-lg border shadow-xs hover:shadow-md hover:scale-110 active:scale-95 transition-all flex flex-col items-center justify-center p-1"
                >
                  <span className="text-[10px] text-slate-700 font-semibold truncate w-full text-center">
                    {cfg.name.split(' ')[0]}
                  </span>
                  <div className="paper-curl-corner" />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Signature Stack of Sticky Notes + Add Thought Button */}
      <div className="relative group/stackbtn">
        {/* Layered Paper Stack Visual Beneath Button */}
        <div className="absolute -inset-1 bg-yellow-200 border border-yellow-300 rounded-2xl rotate-6 opacity-70 group-hover/stackbtn:rotate-12 transition-transform shadow-xs" />
        <div className="absolute -inset-1 bg-sky-200 border border-sky-300 rounded-2xl -rotate-6 opacity-80 group-hover/stackbtn:-rotate-8 transition-transform shadow-xs" />

        <button
          data-tutorial="add-note"
          onClick={() => setIsOpen(!isOpen)}
          title="Add a new thought to your landscape (N)"
          className={`relative flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white shadow-xl hover:shadow-2xl transition-all duration-200 active:scale-90 ${
            isOpen ? 'rotate-45 bg-slate-800 hover:bg-slate-900' : ''
          }`}
        >
          <Plus className="w-6 h-6 transition-transform group-hover/stackbtn:scale-110" />

          {!isOpen && (
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-blue-500 border-2 border-white" />
            </span>
          )}
        </button>
      </div>
    </div>
  );
};
