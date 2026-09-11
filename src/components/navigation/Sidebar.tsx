import React, { useState } from 'react';
import {
  StickyNote,
  Group,
  NoteType,
  NoteColor,
  Board,
  TrashItem,
} from '../../types';
import { STICKY_COLORS, COLOR_LIST, NOTE_TYPE_INFO } from '../../constants/colors';
import {
  X,
  Star,
  FolderPlus,
  BookOpen,
  Calendar,
  Camera,
  Layers,
  Plus,
  Copy,
  Trash2,
  RotateCcw,
  Lock,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Palette,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  notes: StickyNote[];
  groups: Group[];
  boards: Board[];
  activeBoardId: string;
  trash: TrashItem[];
  colorMeanings: Record<NoteColor, string>;
  selectedFilter: string | null;
  onClose: () => void;
  onSelectFilter: (
    filter: {
      type?: NoteType | 'all' | 'starred' | 'locked';
      tag?: string;
      color?: NoteColor;
      groupId?: string;
    } | null
  ) => void;
  onSelectNote: (id: string) => void;
  onSwitchBoard: (boardId: string) => void;
  onAddBoard: (name: string) => void;
  onDuplicateBoard: (boardId: string) => void;
  onDeleteBoard: (boardId: string) => void;
  onAddGroup: () => void;
  onOpenTemplates: () => void;
  onOpenSnapshots: () => void;
  onOpenEnvironmentModal?: () => void;
  onCreateTodayNotes: () => void;
  onOpenColorMeaningModal: () => void;
  onRestoreTrashItem: (trashId: string) => void;
  onEmptyTrash: () => void;
  onOpenGuide?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  notes,
  groups,
  boards,
  activeBoardId,
  trash,
  colorMeanings,
  onClose,
  onSelectFilter,
  onSwitchBoard,
  onAddBoard,
  onDuplicateBoard,
  onDeleteBoard,
  onAddGroup,
  onOpenTemplates,
  onOpenSnapshots,
  onOpenEnvironmentModal,
  onCreateTodayNotes,
  onOpenColorMeaningModal,
  onRestoreTrashItem,
  onEmptyTrash,
  onOpenGuide,
}) => {
  const [showNewBoardInput, setShowNewBoardInput] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const [showTrashSection, setShowTrashSection] = useState(false);

  const tagCounts = new Map<string, number>();
  notes.forEach((n) => {
    n.tags.forEach((t) => {
      tagCounts.set(t, (tagCounts.get(t) || 0) + 1);
    });
  });

  const starredCount = notes.filter((n) => n.starred).length;
  const lockedCount = notes.filter((n) => n.locked).length;
  const noteTypeCounts = (type: NoteType) => notes.filter((n) => n.type === type).length;

  const handleCreateBoard = () => {
    if (!newBoardName.trim()) return;
    onAddBoard(newBoardName.trim());
    setNewBoardName('');
    setShowNewBoardInput(false);
  };

  if (!isOpen) return null;

  return (
    <aside
      data-export-ignore="true"
      className="fixed inset-y-0 left-0 w-80 bg-white/95 backdrop-blur-md shadow-2xl border-r border-slate-200/80 z-50 flex flex-col animate-in slide-in-from-left duration-200 select-none"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
          <span className="font-bold text-xs uppercase tracking-wider text-slate-800">
            Thoughtscape Explorer
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 text-xs text-slate-700">
        {/* Quick Launch Actions */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onCreateTodayNotes}
            className="flex items-center gap-2 p-2 rounded-xl bg-blue-50/70 hover:bg-blue-100/70 text-blue-700 font-semibold transition-colors border border-blue-100"
          >
            <Calendar className="w-3.5 h-3.5 shrink-0 text-blue-600" />
            <span>Today Session</span>
          </button>

          <button
            onClick={onOpenSnapshots}
            className="flex items-center gap-2 p-2 rounded-xl bg-amber-50/70 hover:bg-amber-100/70 text-amber-800 font-semibold transition-colors border border-amber-200/60"
          >
            <Camera className="w-3.5 h-3.5 shrink-0 text-amber-600" />
            <span>Snapshots</span>
          </button>
        </div>

        {/* Environment Workspace Button */}
        {onOpenEnvironmentModal && (
          <button
            onClick={onOpenEnvironmentModal}
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-indigo-50/80 via-blue-50/80 to-purple-50/80 hover:from-indigo-100/80 hover:to-purple-100/80 text-indigo-900 font-semibold transition-all border border-indigo-100/90 shadow-2xs group"
          >
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition-transform" />
              <span>Customize Environment</span>
            </div>
            <span className="text-[10px] bg-white/80 px-2 py-0.5 rounded-full text-indigo-700 border border-indigo-200/50">
              Spaces
            </span>
          </button>
        )}

        {/* Landscapes Switcher */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              MY LANDSCAPES
            </span>
            <button
              onClick={() => setShowNewBoardInput(true)}
              className="p-1 rounded hover:bg-slate-100 text-blue-600 font-medium text-[11px] flex items-center gap-1"
              title="Create New Landscape"
            >
              <Plus className="w-3 h-3" />
              New Landscape
            </button>
          </div>

          {showNewBoardInput && (
            <div className="mb-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 animate-in fade-in duration-100">
              <div className="text-[11px] font-medium text-slate-600">Create a new landscape</div>
              <input
                type="text"
                autoFocus
                placeholder="Name your space (e.g. DSA, College, Projects)..."
                value={newBoardName}
                onChange={(e) => setNewBoardName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateBoard();
                  if (e.key === 'Escape') setShowNewBoardInput(false);
                }}
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
              />
              <div className="flex justify-end gap-1.5">
                <button
                  onClick={() => setShowNewBoardInput(false)}
                  className="px-2 py-1 text-slate-500 hover:text-slate-700 text-xs rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateBoard}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs"
                >
                  Create Landscape
                </button>
              </div>
            </div>
          )}

          <div className="space-y-1">
            {boards.map((b) => {
              const count = notes.filter((n) => (n.boardId || activeBoardId) === b.id).length;
              return (
                <div
                  key={b.id}
                  className={`group flex items-center justify-between p-2 rounded-xl transition-all ${
                    b.id === activeBoardId
                      ? 'bg-blue-50/80 text-blue-700 font-semibold border border-blue-100'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <button
                    onClick={() => onSwitchBoard(b.id)}
                    className="flex-1 flex items-center gap-2 text-left truncate"
                  >
                    <Layers
                      className={`w-3.5 h-3.5 shrink-0 ${
                        b.id === activeBoardId ? 'text-blue-600' : 'text-slate-400'
                      }`}
                    />
                    <span className="truncate">{b.name}</span>
                    <span className="text-[10px] text-slate-400 font-normal">({count})</span>
                  </button>

                  <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity">
                    <button
                      onClick={() => onDuplicateBoard(b.id)}
                      className="p-1 hover:bg-slate-200 rounded text-slate-500"
                      title="Duplicate Landscape"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                    {boards.length > 1 && (
                      <button
                        onClick={() => onDeleteBoard(b.id)}
                        className="p-1 hover:bg-red-50 rounded text-red-500"
                        title="Delete Landscape"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Thought Filters */}
        <div>
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Thoughts
          </div>
          <div className="space-y-0.5">
            <button
              onClick={() => onSelectFilter(null)}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors font-medium text-slate-800"
            >
              <span>All Thoughts</span>
              <span className="text-[11px] text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded-full">
                {notes.length}
              </span>
            </button>

            <button
              onClick={() => onSelectFilter({ type: 'starred' })}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-700"
            >
              <div className="flex items-center gap-2">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>Starred Thoughts</span>
              </div>
              <span className="text-[11px] text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded-full">
                {starredCount}
              </span>
            </button>

            {lockedCount > 0 && (
              <button
                onClick={() => onSelectFilter({ type: 'locked' })}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-700"
              >
                <div className="flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-slate-600" />
                  <span>Locked Thoughts</span>
                </div>
                <span className="text-[11px] text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded-full">
                  {lockedCount}
                </span>
              </button>
            )}

            {(['concept', 'mistake', 'code', 'task', 'quote', 'idea', 'question'] as NoteType[]).map(
              (type) => {
                const info = NOTE_TYPE_INFO[type];
                const count = noteTypeCounts(type);
                if (count === 0) return null;
                return (
                  <button
                    key={type}
                    onClick={() => onSelectFilter({ type })}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-700"
                  >
                    <div className="flex items-center gap-2">
                      <span>{info.badge}</span>
                      <span>{info.label}s</span>
                    </div>
                    <span className="text-[11px] text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded-full">
                      {count}
                    </span>
                  </button>
                );
              }
            )}
          </div>
        </div>

        {/* Clusters & Sections */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Clusters & Sections
            </span>
            <button
              onClick={onAddGroup}
              className="p-1 rounded hover:bg-slate-100 text-blue-600 font-medium text-[11px] flex items-center gap-1"
              title="Create New Cluster"
            >
              <FolderPlus className="w-3 h-3" />
              New Cluster
            </button>
          </div>

          {groups.length === 0 ? (
            <div className="text-[11px] text-slate-400 px-2 py-1">No clusters created yet</div>
          ) : (
            <div className="space-y-0.5">
              {groups.map((group) => {
                const count = notes.filter((n) => n.groupId === group.id).length;
                return (
                  <button
                    key={group.id}
                    onClick={() => onSelectFilter({ groupId: group.id })}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors text-left"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <div
                        style={{ backgroundColor: STICKY_COLORS[group.color].borderHex }}
                        className="w-2 h-2 rounded-full shrink-0"
                      />
                      <span className="truncate">{group.title}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded-full shrink-0">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Tags */}
        <div>
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Tags
          </div>

          {tagCounts.size === 0 ? (
            <div className="text-[11px] text-slate-400 px-2 py-1">No tags added yet</div>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {Array.from(tagCounts.entries()).map(([tag, count]) => (
                <button
                  key={tag}
                  onClick={() => onSelectFilter({ tag })}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 font-medium text-[11px] transition-colors"
                >
                  <span>#{tag}</span>
                  <span className="text-[9px] text-slate-400 font-normal">({count})</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Color Legend */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Color Legend
            </span>
            <button
              onClick={onOpenColorMeaningModal}
              className="text-[11px] text-blue-600 hover:underline"
            >
              Edit Meanings
            </button>
          </div>

          <div className="space-y-1">
            {COLOR_LIST.map((c) => {
              const cfg = STICKY_COLORS[c];
              const count = notes.filter((n) => n.color === c).length;
              const label = colorMeanings[c] || cfg.label;
              return (
                <button
                  key={c}
                  onClick={() => onSelectFilter({ color: c })}
                  className="w-full flex items-center justify-between px-2 py-1 rounded-md hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span
                      style={{ backgroundColor: cfg.hex, borderColor: cfg.borderHex }}
                      className="w-3 h-3 rounded-full border shrink-0"
                    />
                    <span className="truncate text-slate-700">{label}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0">{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Local Trash Recovery Bin */}
        <div className="pt-2 border-t border-slate-100">
          <button
            onClick={() => setShowTrashSection(!showTrashSection)}
            className="w-full flex items-center justify-between py-1.5 text-slate-500 hover:text-slate-800 transition-colors font-medium text-[11px]"
          >
            <div className="flex items-center gap-1.5">
              <Trash2 className="w-3.5 h-3.5" />
              <span>Trash Bin ({trash.length})</span>
            </div>
            {showTrashSection ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          </button>

          {showTrashSection && (
            <div className="mt-2 space-y-1.5 animate-in fade-in duration-100">
              {trash.length === 0 ? (
                <div className="text-[11px] text-slate-400 py-1">Trash is empty</div>
              ) : (
                <>
                  <div className="flex justify-end">
                    <button
                      onClick={onEmptyTrash}
                      className="text-[10px] text-red-600 hover:underline font-medium"
                    >
                      Empty Trash
                    </button>
                  </div>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {trash.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-1.5 bg-slate-50 rounded-lg text-[11px]"
                      >
                        <span className="truncate flex-1 mr-2 text-slate-700">{item.title}</span>
                        <button
                          onClick={() => onRestoreTrashItem(item.id)}
                          className="p-1 hover:bg-blue-100 text-blue-700 rounded transition-colors"
                          title="Restore item"
                        >
                          <RotateCcw className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Guide & Starter Templates */}
        <div className="pt-2 border-t border-slate-100 space-y-2">
          {onOpenGuide && (
            <button
              onClick={onOpenGuide}
              className="w-full flex items-center justify-center gap-2 p-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl font-semibold text-xs transition-colors"
            >
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Technical Guide & Tutorial</span>
            </button>
          )}

          <button
            onClick={onOpenTemplates}
            className="w-full flex items-center justify-center gap-2 p-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-semibold text-xs transition-colors"
          >
            <BookOpen className="w-4 h-4 text-slate-600" />
            <span>Browse Starter Templates</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
