import React, { useState, useRef } from 'react';
import { Group as GroupType, StickyNote, NoteColor } from '../../types';
import { STICKY_COLORS } from '../../constants/colors';
import {
  ChevronDown,
  ChevronRight,
  Trash2,
  Palette,
  Lock,
  Unlock,
  Eye,
  MoreHorizontal,
  LayoutGrid,
  Info,
} from 'lucide-react';

interface GroupSectionProps {
  group: GroupType;
  notes: StickyNote[];
  isSelected: boolean;
  isHoveredForDrop?: boolean;
  scale: number;
  onSelect: (e: React.MouseEvent) => void;
  onUpdateGroup: (updates: Partial<GroupType>, commitHistory?: boolean) => void;
  onDeleteGroup: () => void;
  onUpdateNotePositions: (notes: StickyNote[]) => void;
  onFocusGroup?: (groupId: string) => void;
}

const PADDING_X = 24;
const PADDING_TOP = 44;
const PADDING_BOTTOM = 24;

export const GroupSection: React.FC<GroupSectionProps> = ({
  group,
  notes,
  isSelected,
  isHoveredForDrop = false,
  scale,
  onSelect,
  onUpdateGroup,
  onDeleteGroup,
  onUpdateNotePositions,
  onFocusGroup,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(group.title);

  const dragStartRef = useRef<{
    clientX: number;
    clientY: number;
    startX: number;
    startY: number;
    notePositions: { id: string; x: number; y: number }[];
  } | null>(null);

  const colorConfig = STICKY_COLORS[group.color] || STICKY_COLORS.blue;
  const memberNotes = notes.filter((n) => n.groupId === group.id);

  // Dynamic Auto-Fitting bounds around member notes
  let calculatedBounds = {
    x: group.x,
    y: group.y,
    width: group.width || 340,
    height: group.height || 180,
  };

  if (memberNotes.length > 0) {
    const minX = Math.min(...memberNotes.map((n) => n.x));
    const minY = Math.min(...memberNotes.map((n) => n.y));
    const maxX = Math.max(...memberNotes.map((n) => n.x + n.width));
    const maxY = Math.max(...memberNotes.map((n) => n.y + n.height));

    calculatedBounds = {
      x: minX - PADDING_X,
      y: minY - PADDING_TOP,
      width: Math.max(320, maxX - minX + PADDING_X * 2),
      height: Math.max(160, maxY - minY + PADDING_TOP + PADDING_BOTTOM),
    };
  } else {
    calculatedBounds = {
      x: group.x,
      y: group.y,
      width: Math.min(group.width || 340, 360),
      height: Math.min(group.height || 180, 200),
    };
  }

  // Pointer drag handler for moving cluster and all its member thoughts together
  const handlePointerDown = (e: React.PointerEvent) => {
    if (group.locked || (e.target as HTMLElement).closest('input, button, .no-drag')) return;

    e.stopPropagation();
    onSelect(e as unknown as React.MouseEvent);

    const target = e.currentTarget as HTMLElement;
    target.setPointerCapture(e.pointerId);

    setIsDragging(true);
    dragStartRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      startX: calculatedBounds.x,
      startY: calculatedBounds.y,
      notePositions: memberNotes.map((n) => ({ id: n.id, x: n.x, y: n.y })),
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !dragStartRef.current) return;

    const dx = (e.clientX - dragStartRef.current.clientX) / scale;
    const dy = (e.clientY - dragStartRef.current.clientY) / scale;

    onUpdateGroup(
      {
        x: Math.round(dragStartRef.current.startX + dx),
        y: Math.round(dragStartRef.current.startY + dy),
      },
      false
    );

    if (memberNotes.length > 0) {
      const updatedNotes = memberNotes.map((n) => {
        const orig = dragStartRef.current!.notePositions.find((p) => p.id === n.id);
        return {
          ...n,
          x: Math.round((orig ? orig.x : n.x) + dx),
          y: Math.round((orig ? orig.y : n.y) + dy),
        };
      });
      onUpdateNotePositions(updatedNotes);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      setIsDragging(false);
      dragStartRef.current = null;
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // Safe release
      }
      onUpdateGroup({ x: group.x, y: group.y }, true);
    }
  };

  // Auto-arrange thoughts in a neat 2-column or 3-column grid inside cluster
  const handleAutoArrange = () => {
    if (memberNotes.length === 0) return;
    const cols = memberNotes.length >= 4 ? (memberNotes.length >= 6 ? 3 : 2) : 2;
    const gap = 20;
    const startX = calculatedBounds.x + PADDING_X;
    const startY = calculatedBounds.y + PADDING_TOP;

    const colHeights = new Array(cols).fill(0);
    const arrangedNotes = memberNotes.map((note, idx) => {
      const col = idx % cols;
      const x = startX + col * (note.width + gap);
      const y = startY + colHeights[col];
      colHeights[col] += note.height + gap;
      return {
        ...note,
        x,
        y,
        rotation: 0,
      };
    });

    onUpdateNotePositions(arrangedNotes);
    setShowMenu(false);
  };

  const handleTitleSubmit = () => {
    setIsEditingTitle(false);
    if (titleInput.trim() && titleInput !== group.title) {
      onUpdateGroup({ title: titleInput.trim() }, true);
    } else {
      setTitleInput(group.title);
    }
  };

  const noteCountLabel =
    memberNotes.length === 0
      ? 'Empty cluster'
      : memberNotes.length === 1
      ? '1 thought'
      : `${memberNotes.length} thoughts`;

  return (
    <div
      data-tutorial={group.isTutorialDemo ? 'group-demo' : 'group'}
      style={{
        position: 'absolute',
        transform: `translate3d(${calculatedBounds.x}px, ${calculatedBounds.y}px, 0)`,
        width: `${calculatedBounds.width}px`,
        height: group.collapsed ? '42px' : `${calculatedBounds.height}px`,
        borderColor: isHoveredForDrop ? '#3b82f6' : isSelected ? '#2563eb' : `${colorConfig.borderHex}45`,
        backgroundColor: isHoveredForDrop ? `${colorConfig.hex}25` : `${colorConfig.hex}10`,
        zIndex: 5,
        transition: isDragging ? 'none' : 'width 0.2s ease, height 0.2s ease, transform 0.15s ease, background-color 0.15s ease',
      }}
      className={`rounded-3xl border border-dashed select-none transition-all flex flex-col overflow-visible ${
        isSelected
          ? 'ring-2 ring-blue-500/50 shadow-md shadow-blue-500/10'
          : isHoveredForDrop
          ? 'ring-2 ring-blue-400 shadow-md shadow-blue-500/15'
          : 'hover:border-solid hover:border-slate-400/60'
      }`}
      onClick={onSelect}
      title="Cluster — groups related thoughts together"
    >
      {/* Drag-Over Drop Banner Pill */}
      {isHoveredForDrop && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-blue-600 text-white rounded-full text-[11px] font-semibold shadow-md animate-bounce z-50 pointer-events-none flex items-center gap-1">
          <span>+ Add to {group.title}</span>
        </div>
      )}

      {/* Sleek Compact Header */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="flex items-center justify-between px-3.5 py-2 bg-white/75 backdrop-blur-xs rounded-t-3xl border-b border-black/5 cursor-grab active:cursor-grabbing group/header"
      >
        {/* Left: Collapse Button + Editable Title + Thought Count */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <button
            onClick={() => onUpdateGroup({ collapsed: !group.collapsed })}
            className="p-1 rounded-lg hover:bg-slate-200/60 text-slate-500 hover:text-slate-800 transition-colors"
            title={group.collapsed ? 'Expand Cluster' : 'Collapse Cluster'}
          >
            {group.collapsed ? (
              <ChevronRight className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>

          {isEditingTitle ? (
            <input
              type="text"
              autoFocus
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              onBlur={handleTitleSubmit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleTitleSubmit();
                if (e.key === 'Escape') {
                  setTitleInput(group.title);
                  setIsEditingTitle(false);
                }
              }}
              className="font-bold text-xs text-slate-800 bg-white border border-blue-400 rounded-md px-1.5 py-0.5 focus:outline-none flex-1 min-w-0"
            />
          ) : (
            <span
              onDoubleClick={() => setIsEditingTitle(true)}
              className="font-bold text-xs tracking-wide text-slate-700 hover:text-slate-900 cursor-text truncate"
              title="Double-click to rename"
            >
              {group.title}
            </span>
          )}

          {/* Thought count badge */}
          <span className="text-[10.5px] font-medium text-slate-400 whitespace-nowrap">
            · {noteCountLabel}
          </span>
        </div>

        {/* Right: Actions Menu */}
        <div className="relative flex items-center gap-1">
          {onFocusGroup && (
            <button
              onClick={() => onFocusGroup(group.id)}
              className="p-1 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition-colors opacity-0 group-hover/header:opacity-100"
              title="Focus Cluster"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
            title="Cluster Actions"
          >
            <MoreHorizontal className="w-3.5 h-3.5" />
          </button>

          {/* Context Dropdown Menu */}
          {showMenu && (
            <div
              className="absolute right-0 top-full mt-1.5 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-50 text-xs flex flex-col animate-in zoom-in-95 duration-100"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => {
                  setIsEditingTitle(true);
                  setShowMenu(false);
                }}
                className="w-full px-3.5 py-2 text-left hover:bg-slate-50 text-slate-700 flex items-center gap-2"
              >
                <span>Rename Cluster</span>
              </button>

              {memberNotes.length > 0 && (
                <button
                  onClick={handleAutoArrange}
                  className="w-full px-3.5 py-2 text-left hover:bg-blue-50 text-blue-700 font-medium flex items-center gap-2"
                >
                  <LayoutGrid className="w-3.5 h-3.5 text-blue-600" />
                  <span>Auto-Arrange Thoughts</span>
                </button>
              )}

              <button
                onClick={() => {
                  onUpdateGroup({ locked: !group.locked });
                  setShowMenu(false);
                }}
                className="w-full px-3.5 py-2 text-left hover:bg-slate-50 text-slate-700 flex items-center gap-2"
              >
                {group.locked ? (
                  <>
                    <Unlock className="w-3.5 h-3.5 text-amber-600" />
                    <span>Unlock Position</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Lock Position</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="w-full px-3.5 py-2 text-left hover:bg-slate-50 text-slate-700 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Palette className="w-3.5 h-3.5 text-slate-400" />
                  <span>Highlight Color</span>
                </div>
                <span
                  style={{ backgroundColor: colorConfig.hex }}
                  className="w-3.5 h-3.5 rounded-full border border-black/10"
                />
              </button>

              {showColorPicker && (
                <div className="px-3.5 py-2 bg-slate-50 border-t border-b border-slate-100 flex items-center gap-1.5 justify-between">
                  {(['blue', 'purple', 'green', 'yellow', 'peach', 'pink', 'orange'] as NoteColor[]).map((c) => (
                    <button
                      key={c}
                      onClick={() => {
                        onUpdateGroup({ color: c });
                        setShowColorPicker(false);
                        setShowMenu(false);
                      }}
                      style={{ backgroundColor: STICKY_COLORS[c].hex }}
                      className="w-5 h-5 rounded-full border border-black/10 hover:scale-110 transition-transform"
                      title={c}
                    />
                  ))}
                </div>
              )}

              <div className="h-px bg-slate-100 my-1" />

              <button
                onClick={() => {
                  onDeleteGroup();
                  setShowMenu(false);
                }}
                className="w-full px-3.5 py-2 text-left hover:bg-red-50 text-red-600 flex items-center gap-2"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-500" />
                <span>Delete Cluster (Keep Thoughts)</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Description subtitle on hover or selection */}
      {group.description && !group.collapsed && (
        <div className="px-3.5 py-1 bg-white/40 text-[10.5px] text-slate-500 italic border-b border-black/5 flex items-center gap-1">
          <Info className="w-3 h-3 text-slate-400 shrink-0" />
          <span className="truncate">{group.description}</span>
        </div>
      )}

      {/* Compact Empty State */}
      {memberNotes.length === 0 && !group.collapsed && (
        <div className="flex-1 flex flex-col items-center justify-center p-4 text-center select-none pointer-events-none">
          <span className="text-xs font-semibold text-slate-500 mb-0.5">
            No thoughts yet
          </span>
          <span className="text-[10.5px] text-slate-400 max-w-[220px] leading-tight">
            Drag thoughts here to group them together
          </span>
        </div>
      )}
    </div>
  );
};
