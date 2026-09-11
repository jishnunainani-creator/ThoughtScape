import React, { useState } from 'react';
import { StickyNote, NoteColor, NoteType, LearningState } from '../../types';
import { STICKY_COLORS, COLOR_LIST, NOTE_TYPE_INFO, LEARNING_STATE_INFO } from '../../constants/colors';
import {
  Star,
  Pin,
  Lock,
  Unlock,
  Copy,
  Trash2,
  Share2,
  ArrowUpToLine,
  ArrowDownToLine,
  ChevronDown,
  Layers,
  GraduationCap,
  Clipboard,
  Maximize2,
} from 'lucide-react';

interface NoteToolbarProps {
  note: StickyNote;
  scale: number;
  canvasX: number;
  canvasY: number;
  onColorChange: (color: NoteColor) => void;
  onTypeChange: (type: NoteType) => void;
  onToggleStar: () => void;
  onTogglePin: () => void;
  onToggleLock: () => void;
  onLearningStateChange: (state: LearningState) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onStartConnection: () => void;
  onBringToFront: () => void;
  onSendToBack: () => void;
  onCopyText: () => void;
  onFocusNote?: () => void;
}

export const NoteToolbar: React.FC<NoteToolbarProps> = ({
  note,
  scale,
  canvasX,
  canvasY,
  onColorChange,
  onTypeChange,
  onToggleStar,
  onTogglePin,
  onToggleLock,
  onLearningStateChange,
  onDuplicate,
  onDelete,
  onStartConnection,
  onBringToFront,
  onSendToBack,
  onCopyText,
  onFocusNote,
}) => {
  const [showTypeMenu, setShowTypeMenu] = useState(false);
  const [showLearningMenu, setShowLearningMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  // Position toolbar right above the note in screen coordinates
  const screenX = note.x * scale + canvasX;
  const screenY = note.y * scale + canvasY - 48;

  const currentType = NOTE_TYPE_INFO[note.type] || NOTE_TYPE_INFO.normal;

  return (
    <div
      data-export-ignore="true"
      style={{
        position: 'fixed',
        left: `${screenX}px`,
        top: `${Math.max(64, screenY)}px`,
        zIndex: 99999,
        transform: 'translate3d(0, 0, 0)',
      }}
      className="flex items-center gap-1 bg-white/95 backdrop-blur-md px-2 py-1.5 rounded-xl shadow-xl border border-slate-200/80 text-slate-700 animate-in fade-in zoom-in-95 duration-150 select-none"
    >
      {/* Type Selector Dropdown */}
      <div className="relative">
        <button
          onClick={() => setShowTypeMenu(!showTypeMenu)}
          className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium hover:bg-slate-100 text-slate-700 transition-colors"
          title="Change Note Type"
        >
          <span>{currentType.badge || '📝'}</span>
          <span>{currentType.label}</span>
          <ChevronDown className="w-3 h-3 text-slate-400" />
        </button>

        {showTypeMenu && (
          <div className="absolute left-0 top-full mt-1.5 w-48 bg-white rounded-xl shadow-2xl border border-slate-100 py-1.5 z-50 text-xs flex flex-col">
            {Object.entries(NOTE_TYPE_INFO).map(([key, info]) => (
              <button
                key={key}
                onClick={() => {
                  onTypeChange(key as NoteType);
                  setShowTypeMenu(false);
                }}
                className={`flex items-center gap-2 px-3 py-1.5 text-left hover:bg-blue-50 transition-colors ${
                  note.type === key ? 'text-blue-600 font-semibold bg-blue-50/50' : 'text-slate-700'
                }`}
              >
                <span>{info.badge || '📝'}</span>
                <div>
                  <div className="leading-none">{info.label}</div>
                  <div className="text-[10px] text-slate-400 font-normal mt-0.5">{info.desc}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="h-4 w-px bg-slate-200" />

      {/* Color Palette Selector */}
      <div className="flex items-center gap-1 px-1">
        {COLOR_LIST.map((color) => {
          const cfg = STICKY_COLORS[color];
          const isCurrent = note.color === color;
          return (
            <button
              key={color}
              onClick={() => onColorChange(color)}
              title={`${cfg.name} (${cfg.label})`}
              style={{ backgroundColor: cfg.hex }}
              className={`w-4 h-4 rounded-full border transition-all hover:scale-125 ${
                isCurrent
                  ? 'border-blue-600 ring-2 ring-blue-500/30 scale-110'
                  : 'border-black/15 hover:border-black/30'
              }`}
            />
          );
        })}
      </div>

      <div className="h-4 w-px bg-slate-200" />

      {/* Learning State Dropdown */}
      <div className="relative">
        <button
          onClick={() => setShowLearningMenu(!showLearningMenu)}
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
          title="Set Learning Mastery State"
        >
          <GraduationCap className="w-3.5 h-3.5" />
        </button>

        {showLearningMenu && (
          <div className="absolute left-0 top-full mt-1.5 w-36 bg-white rounded-xl shadow-2xl border border-slate-100 py-1.5 z-50 text-xs flex flex-col">
            <div className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase">Learning State</div>
            {Object.entries(LEARNING_STATE_INFO).map(([key, info]) => (
              <button
                key={key}
                onClick={() => {
                  onLearningStateChange(key as LearningState);
                  setShowLearningMenu(false);
                }}
                className="flex items-center gap-2 px-3 py-1.5 text-left hover:bg-slate-50 text-slate-700"
              >
                <span
                  style={{ backgroundColor: info.color }}
                  className="w-2 h-2 rounded-full"
                />
                <span className={note.learningState === key ? 'font-bold text-blue-600' : ''}>
                  {info.label}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Star */}
      <button
        onClick={onToggleStar}
        className={`p-1.5 rounded-lg hover:bg-slate-100 transition-colors ${
          note.starred ? 'text-amber-500 fill-amber-500' : 'text-slate-500'
        }`}
        title={note.starred ? 'Unstar' : 'Star as Important'}
      >
        <Star className={`w-3.5 h-3.5 ${note.starred ? 'fill-amber-500' : ''}`} />
      </button>

      {/* Pin */}
      <button
        onClick={onTogglePin}
        className={`p-1.5 rounded-lg hover:bg-slate-100 transition-colors ${
          note.pinned ? 'text-blue-600' : 'text-slate-500'
        }`}
        title={note.pinned ? 'Unpin' : 'Pin Note in Place'}
      >
        <Pin className="w-3.5 h-3.5" />
      </button>

      {/* Lock */}
      <button
        onClick={onToggleLock}
        className={`p-1.5 rounded-lg hover:bg-slate-100 transition-colors ${
          note.locked ? 'text-amber-600' : 'text-slate-500'
        }`}
        title={note.locked ? 'Unlock Note' : 'Lock Note Position'}
      >
        {note.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
      </button>

      {/* Connect */}
      <button
        onClick={onStartConnection}
        className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-500 hover:text-blue-600 transition-colors"
        title="Connect to another note"
      >
        <Share2 className="w-3.5 h-3.5" />
      </button>

      {/* Duplicate */}
      <button
        onClick={onDuplicate}
        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
        title="Duplicate Note (Cmd+D)"
      >
        <Copy className="w-3.5 h-3.5" />
      </button>

      {/* Focus Thought */}
      {onFocusNote && (
        <button
          onClick={onFocusNote}
          className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-500 hover:text-blue-600 transition-colors"
          title="Focus Thought (Expand Note)"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      )}

      {/* More Options Dropdown */}
      <div className="relative">
        <button
          onClick={() => setShowMoreMenu(!showMoreMenu)}
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
          title="More layering actions"
        >
          <Layers className="w-3.5 h-3.5" />
        </button>

        {showMoreMenu && (
          <div className="absolute right-0 top-full mt-1.5 w-40 bg-white rounded-xl shadow-2xl border border-slate-100 py-1.5 z-50 text-xs flex flex-col">
            <button
              onClick={() => {
                onCopyText();
                setShowMoreMenu(false);
              }}
              className="flex items-center gap-2 px-3 py-1.5 text-left text-slate-700 hover:bg-slate-100"
            >
              <Clipboard className="w-3.5 h-3.5 text-slate-400" />
              <span>Copy Content</span>
            </button>
            <button
              onClick={() => {
                onBringToFront();
                setShowMoreMenu(false);
              }}
              className="flex items-center gap-2 px-3 py-1.5 text-left text-slate-700 hover:bg-slate-100"
            >
              <ArrowUpToLine className="w-3.5 h-3.5 text-slate-400" />
              <span>Bring to Front</span>
            </button>
            <button
              onClick={() => {
                onSendToBack();
                setShowMoreMenu(false);
              }}
              className="flex items-center gap-2 px-3 py-1.5 text-left text-slate-700 hover:bg-slate-100"
            >
              <ArrowDownToLine className="w-3.5 h-3.5 text-slate-400" />
              <span>Send to Back</span>
            </button>
          </div>
        )}
      </div>

      <div className="h-4 w-px bg-slate-200" />

      {/* Delete Note */}
      <button
        onClick={onDelete}
        className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
        title="Delete Note (Delete/Backspace)"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
