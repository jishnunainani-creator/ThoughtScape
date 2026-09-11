import React, { useState, useRef } from 'react';
import { Group as GroupType, StickyNote, NoteColor } from '../../types';
import { STICKY_COLORS } from '../../constants/colors';
import { ChevronDown, ChevronRight, Trash2, Palette, Lock, Unlock, Eye } from 'lucide-react';

interface GroupSectionProps {
  group: GroupType;
  notes: StickyNote[];
  isSelected: boolean;
  scale: number;
  onSelect: (e: React.MouseEvent) => void;
  onUpdateGroup: (updates: Partial<GroupType>, commitHistory?: boolean) => void;
  onDeleteGroup: () => void;
  onUpdateNotePositions: (notes: StickyNote[]) => void;
  onFocusGroup?: (groupId: string) => void;
}

export const GroupSection: React.FC<GroupSectionProps> = ({
  group,
  notes,
  isSelected,
  scale,
  onSelect,
  onUpdateGroup,
  onDeleteGroup,
  onUpdateNotePositions,
  onFocusGroup,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const dragStartRef = useRef<{
    clientX: number;
    clientY: number;
    startX: number;
    startY: number;
    notePositions: { id: string; x: number; y: number }[];
  } | null>(null);

  const colorConfig = STICKY_COLORS[group.color] || STICKY_COLORS.blue;
  const memberNotes = notes.filter((n) => n.groupId === group.id);

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
      startX: group.x,
      startY: group.y,
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

    const updatedNotes = memberNotes.map((n) => {
      const orig = dragStartRef.current!.notePositions.find((p) => p.id === n.id);
      return {
        ...n,
        x: Math.round((orig ? orig.x : n.x) + dx),
        y: Math.round((orig ? orig.y : n.y) + dy),
      };
    });

    onUpdateNotePositions(updatedNotes);
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

  return (
    <div
      data-tutorial={group.isTutorialDemo ? 'group-demo' : 'group'}
      style={{
        position: 'absolute',
        transform: `translate3d(${group.x}px, ${group.y}px, 0)`,
        width: `${group.width}px`,
        height: group.collapsed ? '52px' : `${group.height}px`,
        borderColor: colorConfig.borderHex,
        backgroundColor: `${colorConfig.hex}44`,
        zIndex: 5,
        transition: isDragging ? 'none' : 'height 0.2s ease, transform 0.15s ease',
      }}
      className={`rounded-xl border-2 border-dashed select-none transition-shadow ${
        isSelected ? 'ring-2 ring-blue-500 shadow-md' : 'hover:border-solid hover:shadow-xs'
      }`}
      onClick={onSelect}
    >
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="flex items-center justify-between px-3 py-2 bg-white/70 backdrop-blur-[2px] rounded-t-lg border-b border-black/5 cursor-grab active:cursor-grabbing group/header"
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <button
            onClick={() => onUpdateGroup({ collapsed: !group.collapsed })}
            className="p-0.5 rounded hover:bg-black/5 text-slate-600"
            title={group.collapsed ? 'Expand Section' : 'Collapse Section'}
          >
            {group.collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          <input
            type="text"
            value={group.title}
            placeholder="Section Name..."
            onChange={(e) => onUpdateGroup({ title: e.target.value }, false)}
            onBlur={(e) => onUpdateGroup({ title: e.target.value }, true)}
            className="font-bold text-xs uppercase tracking-wider text-slate-800 bg-transparent focus:outline-none focus:bg-white/80 rounded px-1 -ml-1 flex-1 truncate"
          />

          <span className="text-[10px] font-medium text-slate-400 bg-black/5 px-1.5 py-0.5 rounded-full">
            {memberNotes.length} {memberNotes.length === 1 ? 'note' : 'notes'}
          </span>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover/header:opacity-100 transition-opacity">
          {onFocusGroup && (
            <button
              onClick={() => onFocusGroup(group.id)}
              className="p-1 text-slate-400 hover:text-blue-600 rounded hover:bg-black/5"
              title="Focus on this section"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={() => onUpdateGroup({ locked: !group.locked })}
            className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-black/5"
            title={group.locked ? 'Unlock Section' : 'Lock Section Position'}
          >
            {group.locked ? <Lock className="w-3.5 h-3.5 text-amber-600" /> : <Unlock className="w-3.5 h-3.5" />}
          </button>

          <div className="relative">
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-black/5"
              title="Change Group Color"
            >
              <Palette className="w-3.5 h-3.5" />
            </button>

            {showColorPicker && (
              <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-xl border border-slate-200 p-1.5 flex gap-1 z-50">
                {(['blue', 'purple', 'green', 'orange', 'pink', 'yellow', 'red'] as NoteColor[]).map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      onUpdateGroup({ color: c });
                      setShowColorPicker(false);
                    }}
                    style={{ backgroundColor: STICKY_COLORS[c].hex }}
                    className="w-5 h-5 rounded-full border border-black/10 hover:scale-110 transition-transform"
                  />
                ))}
              </div>
            )}
          </div>

          <button
            onClick={onDeleteGroup}
            className="p-1 text-slate-400 hover:text-red-600 rounded hover:bg-black/5"
            title="Delete Section (Notes will stay)"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
