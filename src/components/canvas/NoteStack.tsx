import React from 'react';
import { NoteStack as NoteStackType, StickyNote } from '../../types';
import { STICKY_COLORS } from '../../constants/colors';
import { Layers, ArrowUpRight, Trash2 } from 'lucide-react';
import { playPeelSound } from '../../utils/sound';

interface NoteStackProps {
  stack: NoteStackType;
  notes: StickyNote[];
  isSelected: boolean;
  scale: number;
  onSelect: (e: React.MouseEvent) => void;
  onUpdateStack: (updates: Partial<NoteStackType>) => void;
  onDeleteStack: () => void;
  onTakeOneNote: (stackId: string) => void;
  onDisbandStack: (stackId: string) => void;
}

export const NoteStack: React.FC<NoteStackProps> = ({
  stack,
  notes,
  isSelected,
  onSelect,
  onUpdateStack,
  onDeleteStack,
  onTakeOneNote,
  onDisbandStack,
}) => {
  const colorCfg = STICKY_COLORS[stack.color] || STICKY_COLORS.yellow;
  const memberNotes = notes.filter((n) => stack.noteIds.includes(n.id));

  const handleTakeOne = (e: React.MouseEvent) => {
    e.stopPropagation();
    playPeelSound();
    onTakeOneNote(stack.id);
  };

  return (
    <div
      style={{
        position: 'absolute',
        transform: `translate3d(${stack.x}px, ${stack.y}px, 0)`,
        width: '260px',
        zIndex: isSelected ? 8000 : 10,
      }}
      onClick={onSelect}
      className={`group/stack select-none relative ${isSelected ? 'ring-2 ring-blue-600 ring-offset-2' : ''}`}
    >
      {/* 3D Stack Effect Underneath */}
      <div
        style={{
          backgroundColor: colorCfg.hex,
          borderColor: colorCfg.borderHex,
          transform: 'translate3d(6px, 6px, 0) rotate(2deg)',
        }}
        className="absolute inset-0 rounded-sm border shadow-xs pointer-events-none opacity-60"
      />
      <div
        style={{
          backgroundColor: colorCfg.hex,
          borderColor: colorCfg.borderHex,
          transform: 'translate3d(3px, 3px, 0) rotate(-1.5deg)',
        }}
        className="absolute inset-0 rounded-sm border shadow-xs pointer-events-none opacity-80"
      />

      {/* Top Stack Note */}
      <div
        style={{
          backgroundColor: colorCfg.hex,
          borderColor: colorCfg.borderHex,
        }}
        className="relative rounded-sm border p-4 shadow-paper flex flex-col justify-between min-h-[160px] cursor-grab active:cursor-grabbing"
      >
        <div className="flex items-center justify-between gap-1 mb-2">
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <Layers className="w-4 h-4 text-slate-700 shrink-0" />
            <input
              type="text"
              value={stack.title}
              placeholder="Note Stack..."
              onChange={(e) => onUpdateStack({ title: e.target.value })}
              className="font-bold text-xs uppercase tracking-wider text-slate-800 bg-transparent focus:outline-none focus:bg-white/60 rounded px-1 -ml-1 flex-1 truncate"
            />
          </div>

          <div className="flex items-center gap-1">
            <span className="text-[10px] font-semibold text-slate-700 bg-black/10 px-2 py-0.5 rounded-full shrink-0">
              {memberNotes.length} {memberNotes.length === 1 ? 'note' : 'notes'}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteStack();
              }}
              className="opacity-0 group-hover/stack:opacity-100 p-1 text-slate-400 hover:text-red-600 rounded transition-opacity"
              title="Delete stack"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>

        <div className="flex-1 text-xs text-slate-600 italic line-clamp-3 mb-3">
          {memberNotes[0]?.title || memberNotes[0]?.content || 'Empty stack'}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-black/5">
          <button
            onClick={handleTakeOne}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/80 hover:bg-white text-slate-800 text-xs font-semibold rounded shadow-xs hover:shadow transition-all active:scale-95"
            title="Peel and take top note off the stack"
          >
            <ArrowUpRight className="w-3.5 h-3.5 text-blue-600" />
            <span>Take one</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onDisbandStack(stack.id);
            }}
            className="text-[10px] text-slate-500 hover:text-blue-700 underline font-medium"
            title="Unpack all notes"
          >
            Unpack all
          </button>
        </div>
      </div>
    </div>
  );
};
