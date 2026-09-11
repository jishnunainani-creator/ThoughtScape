import React, { useEffect, useRef } from 'react';
import { ContextMenuState, NoteColor, NoteType } from '../../types';
import { STICKY_COLORS, COLOR_LIST } from '../../constants/colors';
import {
  Plus,
  Copy,
  Trash2,
  Star,
  Pin,
  Lock,
  Share2,
  ArrowUpToLine,
  ArrowDownToLine,
  RotateCcw,
  LayoutGrid,
  FolderPlus,
  Maximize2,
  Sparkles,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import { OrganizeMode } from '../../utils/layout';

interface ContextMenuProps {
  state: ContextMenuState;
  onClose: () => void;
  onCreateNote: (color: NoteColor, x: number, y: number) => void;
  onAddGroup: (x: number, y: number) => void;
  onDuplicateNote: (id: string) => void;
  onDeleteNote: (id: string) => void;
  onToggleStar: (id: string) => void;
  onTogglePin: (id: string) => void;
  onToggleLockNote?: (id: string) => void;
  onChangeColor: (id: string, color: NoteColor) => void;
  onChangeType?: (id: string, type: NoteType) => void;
  onStartConnection: (id: string) => void;
  onBringToFront: (id: string) => void;
  onSendToBack: (id: string) => void;
  onOrganize: (mode: OrganizeMode) => void;
  onResetZoom: () => void;
  onFitAll: () => void;
  onTakeOneFromStack?: (stackId: string) => void;
  onDisbandStack?: (stackId: string) => void;
  onCreateStack?: (title: string, noteIds: string[]) => void;
  screenToWorld: (x: number, y: number) => { x: number; y: number };
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  state,
  onClose,
  onCreateNote,
  onAddGroup,
  onDuplicateNote,
  onDeleteNote,
  onToggleStar,
  onTogglePin,
  onToggleLockNote,
  onChangeColor,
  onStartConnection,
  onBringToFront,
  onSendToBack,
  onOrganize,
  onResetZoom,
  onFitAll,
  onTakeOneFromStack,
  onDisbandStack,
  onCreateStack,
  screenToWorld,
}) => {
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  if (!state.isOpen) return null;

  const worldPos = screenToWorld(state.x, state.y);
  const left = Math.min(state.x, window.innerWidth - 240);
  const top = Math.min(state.y, window.innerHeight - 380);

  return (
    <div
      ref={menuRef}
      data-export-ignore="true"
      style={{ left: `${left}px`, top: `${top}px` }}
      className="fixed z-[999999] w-60 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200/90 py-1.5 text-xs text-slate-700 animate-in zoom-in-95 duration-100 select-none"
    >
      {state.targetType === 'note' && state.targetId ? (
        <>
          <button
            onClick={() => {
              onDuplicateNote(state.targetId!);
              onClose();
            }}
            className="w-full flex items-center gap-2.5 px-3.5 py-1.5 hover:bg-blue-50 hover:text-blue-700 text-left"
          >
            <Copy className="w-3.5 h-3.5 text-slate-400" />
            <span>Duplicate Thought</span>
            <span className="ml-auto text-[10px] text-slate-400">⌘D</span>
          </button>

          <button
            onClick={() => {
              onStartConnection(state.targetId!);
              onClose();
            }}
            className="w-full flex items-center gap-2.5 px-3.5 py-1.5 hover:bg-blue-50 hover:text-blue-700 text-left"
          >
            <Share2 className="w-3.5 h-3.5 text-slate-400" />
            <span>Connect Thought...</span>
          </button>

          <button
            onClick={() => {
              onToggleStar(state.targetId!);
              onClose();
            }}
            className="w-full flex items-center gap-2.5 px-3.5 py-1.5 hover:bg-blue-50 hover:text-blue-700 text-left"
          >
            <Star className="w-3.5 h-3.5 text-slate-400" />
            <span>Star as Important</span>
          </button>

          <button
            onClick={() => {
              onTogglePin(state.targetId!);
              onClose();
            }}
            className="w-full flex items-center gap-2.5 px-3.5 py-1.5 hover:bg-blue-50 hover:text-blue-700 text-left"
          >
            <Pin className="w-3.5 h-3.5 text-slate-400" />
            <span>Pin in Place</span>
          </button>

          {onToggleLockNote && (
            <button
              onClick={() => {
                onToggleLockNote(state.targetId!);
                onClose();
              }}
              className="w-full flex items-center gap-2.5 px-3.5 py-1.5 hover:bg-blue-50 hover:text-blue-700 text-left"
            >
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Lock / Unlock Position</span>
            </button>
          )}

          {onCreateStack && (
            <button
              onClick={() => {
                onCreateStack('Thought Stack', [state.targetId!]);
                onClose();
              }}
              className="w-full flex items-center gap-2.5 px-3.5 py-1.5 hover:bg-blue-50 hover:text-blue-700 text-left"
            >
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              <span>Convert to Thought Stack</span>
            </button>
          )}

          <div className="px-3.5 py-2 border-t border-slate-100">
            <div className="text-[10px] text-slate-400 font-semibold mb-1.5">Change Color</div>
            <div className="grid grid-cols-5 gap-1.5">
              {COLOR_LIST.slice(0, 5).map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    onChangeColor(state.targetId!, c);
                    onClose();
                  }}
                  style={{ backgroundColor: STICKY_COLORS[c].hex }}
                  className="w-6 h-6 rounded-md border border-black/10 hover:scale-110 transition-transform"
                />
              ))}
            </div>
          </div>

          <div className="h-px bg-slate-100 my-1" />

          <button
            onClick={() => {
              onBringToFront(state.targetId!);
              onClose();
            }}
            className="w-full flex items-center gap-2.5 px-3.5 py-1.5 hover:bg-slate-100 text-left"
          >
            <ArrowUpToLine className="w-3.5 h-3.5 text-slate-400" />
            <span>Bring to Front</span>
          </button>

          <button
            onClick={() => {
              onSendToBack(state.targetId!);
              onClose();
            }}
            className="w-full flex items-center gap-2.5 px-3.5 py-1.5 hover:bg-slate-100 text-left"
          >
            <ArrowDownToLine className="w-3.5 h-3.5 text-slate-400" />
            <span>Send to Back</span>
          </button>

          <div className="h-px bg-slate-100 my-1" />

          <button
            onClick={() => {
              onDeleteNote(state.targetId!);
              onClose();
            }}
            className="w-full flex items-center gap-2.5 px-3.5 py-1.5 hover:bg-red-50 text-red-600 text-left font-medium"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Thought</span>
            <span className="ml-auto text-[10px] text-red-400">Del</span>
          </button>
        </>
      ) : state.targetType === 'stack' && state.targetId ? (
        <>
          <button
            onClick={() => {
              if (onTakeOneFromStack) onTakeOneFromStack(state.targetId!);
              onClose();
            }}
            className="w-full flex items-center gap-2.5 px-3.5 py-1.5 hover:bg-blue-50 hover:text-blue-700 text-left font-medium text-slate-800"
          >
            <ArrowUpRight className="w-3.5 h-3.5 text-blue-600" />
            <span>Take One Thought</span>
          </button>

          <button
            onClick={() => {
              if (onDisbandStack) onDisbandStack(state.targetId!);
              onClose();
            }}
            className="w-full flex items-center gap-2.5 px-3.5 py-1.5 hover:bg-blue-50 hover:text-blue-700 text-left"
          >
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            <span>Unpack All Thoughts</span>
          </button>
        </>
      ) : (
        <>
          <button
            onClick={() => {
              onCreateNote('yellow', worldPos.x, worldPos.y);
              onClose();
            }}
            className="w-full flex items-center gap-2.5 px-3.5 py-1.5 hover:bg-blue-50 hover:text-blue-700 text-left font-semibold text-slate-800"
          >
            <Plus className="w-3.5 h-3.5 text-blue-600" />
            <span>New Thought</span>
            <span className="ml-auto text-[10px] text-slate-400">N</span>
          </button>

          <button
            onClick={() => {
              onAddGroup(worldPos.x, worldPos.y);
              onClose();
            }}
            className="w-full flex items-center gap-2.5 px-3.5 py-1.5 hover:bg-blue-50 hover:text-blue-700 text-left"
          >
            <FolderPlus className="w-3.5 h-3.5 text-slate-400" />
            <span>New Thought Cluster</span>
          </button>

          <div className="h-px bg-slate-100 my-1" />

          <button
            onClick={() => {
              onOrganize('grid');
              onClose();
            }}
            className="w-full flex items-center gap-2.5 px-3.5 py-1.5 hover:bg-slate-100 text-left"
          >
            <LayoutGrid className="w-3.5 h-3.5 text-slate-400" />
            <span>Organize (Grid)</span>
          </button>

          <button
            onClick={() => {
              onOrganize('scatter');
              onClose();
            }}
            className="w-full flex items-center gap-2.5 px-3.5 py-1.5 hover:bg-amber-50 text-amber-900 text-left font-medium"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Scatter & Brainstorm</span>
          </button>

          <button
            onClick={() => {
              onFitAll();
              onClose();
            }}
            className="w-full flex items-center gap-2.5 px-3.5 py-1.5 hover:bg-slate-100 text-left"
          >
            <Maximize2 className="w-3.5 h-3.5 text-slate-400" />
            <span>Fit Landscape in View</span>
            <span className="ml-auto text-[10px] text-slate-400">0</span>
          </button>

          <button
            onClick={() => {
              onResetZoom();
              onClose();
            }}
            className="w-full flex items-center gap-2.5 px-3.5 py-1.5 hover:bg-slate-100 text-left"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Reset View (100%)</span>
          </button>
        </>
      )}
    </div>
  );
};
