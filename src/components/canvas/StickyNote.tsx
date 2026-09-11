import React, { useState, useRef } from 'react';
import { StickyNote as StickyNoteType, TaskItem, MistakeDetails, EnvironmentDefinition, NoteVisualTheme } from '../../types';
import { STICKY_COLORS, NOTE_TYPE_INFO, LEARNING_STATE_INFO } from '../../constants/colors';
import {
  Pin,
  Lock,
  CornerRightDown,
  Plus,
  Trash2,
  ExternalLink,
  Copy,
  Check,
  Quote as QuoteIcon,
  ArrowUpRight,
} from 'lucide-react';
import { playDropSound } from '../../utils/sound';

interface StickyNoteProps {
  note: StickyNoteType;
  allNotes?: StickyNoteType[];
  isSelected: boolean;
  isConnectingSource: boolean;
  scale: number;
  environment?: EnvironmentDefinition;
  noteStyle?: NoteVisualTheme;
  onSelect: (e: React.MouseEvent) => void;
  onUpdate: (updates: Partial<StickyNoteType>, commitHistory?: boolean) => void;
  onStartConnection: () => void;
  onNavigateToNote?: (targetTitleOrId: string) => void;
}

export const StickyNote: React.FC<StickyNoteProps> = ({
  note,
  allNotes = [],
  isSelected,
  isConnectingSource,
  scale,
  environment,
  noteStyle = 'classic',
  onSelect,
  onUpdate,
  onStartConnection,
  onNavigateToNote,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showBacklinks, setShowBacklinks] = useState(false);
  const [isEditingContent, setIsEditingContent] = useState(false);

  const noteRef = useRef<HTMLDivElement | null>(null);
  const dragStartRef = useRef<{ x: number; y: number; startX: number; startY: number } | null>(null);
  const resizeStartRef = useRef<{ x: number; y: number; startW: number; startH: number } | null>(null);

  const colorConfig = STICKY_COLORS[note.color] || STICKY_COLORS.yellow;
  const typeInfo = NOTE_TYPE_INFO[note.type] || NOTE_TYPE_INFO.normal;
  const learningInfo = note.learningState ? LEARNING_STATE_INFO[note.learningState] : null;

  // Calculate backlinks: other notes whose content or title references [[This Note Title]]
  const referencingNotes = note.title
    ? allNotes.filter(
        (other) =>
          other.id !== note.id &&
          (other.content.includes(`[[${note.title}]]`) || (other.title && other.title.includes(`[[${note.title}]]`)))
      )
    : [];

  const handlePointerDown = (e: React.PointerEvent) => {
    if (note.pinned || note.locked || (e.target as HTMLElement).closest('input, textarea, button, a, .no-drag')) {
      return;
    }

    e.stopPropagation();
    onSelect(e as unknown as React.MouseEvent);

    const target = e.currentTarget as HTMLElement;
    target.setPointerCapture(e.pointerId);

    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      startX: note.x,
      startY: note.y,
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !dragStartRef.current) return;

    const dx = (e.clientX - dragStartRef.current.x) / scale;
    const dy = (e.clientY - dragStartRef.current.y) / scale;

    onUpdate(
      {
        x: Math.round(dragStartRef.current.startX + dx),
        y: Math.round(dragStartRef.current.startY + dy),
      },
      false
    );
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
      playDropSound();
      onUpdate({ x: note.x, y: note.y }, true);
    }
  };

  const handleResizePointerDown = (e: React.PointerEvent) => {
    if (note.locked) return;
    e.stopPropagation();
    const target = e.currentTarget as HTMLElement;
    target.setPointerCapture(e.pointerId);

    setIsResizing(true);
    resizeStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      startW: note.width,
      startH: note.height,
    };
  };

  const handleResizePointerMove = (e: React.PointerEvent) => {
    if (!isResizing || !resizeStartRef.current) return;

    const dx = (e.clientX - resizeStartRef.current.x) / scale;
    const dy = (e.clientY - resizeStartRef.current.y) / scale;

    const newW = Math.max(200, Math.min(650, resizeStartRef.current.startW + dx));
    const newH = Math.max(150, Math.min(850, resizeStartRef.current.startH + dy));

    onUpdate({ width: Math.round(newW), height: Math.round(newH) }, false);
  };

  const handleResizePointerUp = (e: React.PointerEvent) => {
    if (isResizing) {
      setIsResizing(false);
      resizeStartRef.current = null;
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // Safe release
      }
      onUpdate({ width: note.width, height: note.height }, true);
    }
  };

  // Task methods
  const toggleTask = (taskId: string) => {
    if (!note.taskItems) return;
    const nextTasks = note.taskItems.map((t) =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );
    onUpdate({ taskItems: nextTasks });
  };

  const updateTaskText = (taskId: string, text: string) => {
    if (!note.taskItems) return;
    const nextTasks = note.taskItems.map((t) =>
      t.id === taskId ? { ...t, text } : t
    );
    onUpdate({ taskItems: nextTasks }, false);
  };

  const addTaskItem = () => {
    const nextTasks: TaskItem[] = [
      ...(note.taskItems || []),
      { id: String(Date.now()), text: '', completed: false },
    ];
    onUpdate({ taskItems: nextTasks });
  };

  const removeTaskItem = (taskId: string) => {
    if (!note.taskItems) return;
    const nextTasks = note.taskItems.filter((t) => t.id !== taskId);
    onUpdate({ taskItems: nextTasks });
  };

  // Mistake details updates
  const updateMistakeField = (field: keyof MistakeDetails, value: string) => {
    const current: MistakeDetails = note.mistakeDetails || {
      whatIDid: '',
      whyWrong: '',
      correctApproach: '',
      howToAvoid: '',
    };
    onUpdate({ mistakeDetails: { ...current, [field]: value } });
  };

  // Tags
  const handleAddTag = () => {
    if (!newTagInput.trim()) return;
    const cleanTag = newTagInput.trim().replace(/^#/, '');
    if (!note.tags.includes(cleanTag)) {
      onUpdate({ tags: [...note.tags, cleanTag] });
    }
    setNewTagInput('');
    setShowTagInput(false);
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onUpdate({ tags: note.tags.filter((t) => t !== tagToRemove) });
  };

  // Copy code helper
  const handleCopyCode = () => {
    navigator.clipboard.writeText(note.content).then(() => {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 1500);
    });
  };

  // Render text with clickable [[WikiLinks]]
  const renderContentWithWikiLinks = (text: string) => {
    const parts = text.split(/(\[\[.*?\]\])/g);
    return parts.map((part, i) => {
      if (part.startsWith('[[') && part.endsWith(']]')) {
        const linkTarget = part.slice(2, -2).trim();
        return (
          <button
            key={i}
            onClick={(e) => {
              e.stopPropagation();
              if (onNavigateToNote) onNavigateToNote(linkTarget);
            }}
            className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-blue-100/90 text-blue-800 hover:bg-blue-200 font-medium text-[11px] underline mx-0.5"
            title={`Navigate to note: "${linkTarget}"`}
          >
            <span>{linkTarget}</span>
            <ArrowUpRight className="w-2.5 h-2.5" />
          </button>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  // Environment-specific physics & styling
  const shadowPhysicsClass = isDragging
    ? 'shadow-paper-lifted cursor-grabbing ring-2 ring-blue-500/40'
    : isSelected
    ? 'shadow-paper-hover ring-2 ring-blue-600 ring-offset-2'
    : environment?.notePhysics.shadowType === 'chalk'
    ? 'shadow-[0_6px_20px_rgba(0,0,0,0.5),0_1px_3px_rgba(0,0,0,0.4)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.6)] cursor-grab'
    : environment?.notePhysics.shadowType === 'desk'
    ? 'shadow-[0_6px_20px_rgba(45,25,15,0.28),0_2px_4px_rgba(45,25,15,0.18)] hover:shadow-[0_8px_24px_rgba(45,25,15,0.38)] cursor-grab'
    : environment?.notePhysics.shadowType === 'pinned'
    ? 'shadow-[0_5px_16px_rgba(80,50,25,0.25),0_1px_3px_rgba(80,50,25,0.15)] hover:shadow-[0_7px_20px_rgba(80,50,25,0.35)] cursor-grab'
    : 'shadow-paper hover:shadow-paper-hover cursor-grab';

  const fontStyleClass =
    noteStyle === 'handwritten'
      ? 'font-serif tracking-tight'
      : noteStyle === 'minimal'
      ? 'font-sans font-normal tracking-wide'
      : 'font-sans';

  const isPushPinVisible = environment?.notePhysics.pinVisible || note.pinned;
  const isTapeVisible = noteStyle === 'classic' && !isPushPinVisible;

  return (
    <div
      ref={noteRef}
      id={`note_${note.id}`}
      data-note-id={note.id}
      data-tutorial={note.isTutorialDemo ? 'note-demo-1' : 'note'}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onClick={onSelect}
      style={{
        position: 'absolute',
        transform: `translate3d(${note.x}px, ${note.y}px, 0) rotate(${
          isDragging ? 0 : noteStyle === 'minimal' ? 0 : note.rotation
        }deg) scale(${isDragging ? 1.04 : 1})`,
        width: `${note.width}px`,
        minHeight: `${note.height}px`,
        zIndex: isDragging ? 9999 : isSelected ? 9000 : note.zIndex,
        transition: isDragging || isResizing ? 'none' : 'transform 0.28s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s ease, opacity 0.2s ease',
        backgroundColor: colorConfig.hex,
        borderColor: environment?.notePhysics.borderContrast === 'high' ? 'rgba(0,0,0,0.18)' : colorConfig.borderHex,
      }}
      className={`group/note select-none ${
        noteStyle === 'minimal' ? 'rounded-none border' : 'rounded-sm border'
      } p-3.5 flex flex-col justify-between ${fontStyleClass} ${shadowPhysicsClass} ${
        isConnectingSource ? 'ring-2 ring-dashed ring-blue-600 animate-pulse' : ''
      }`}
    >
      {/* Push-Pin Indicator (e.g. on Cork Board or pinned notes) */}
      {isPushPinVisible ? (
        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 z-20 pointer-events-none drop-shadow-md">
          <div className="w-3.5 h-3.5 rounded-full bg-red-600 border border-red-700 shadow-inner flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-white/80" />
          </div>
        </div>
      ) : isTapeVisible ? (
        /* Top subtle adhesive tape strip visual */
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-12 h-3.5 bg-white/40 backdrop-blur-[1px] rounded-xs border border-white/60 pointer-events-none shadow-xs" />
      ) : null}

      {/* Connection Anchor Points */}
      <button
        title="Connect from top"
        onClick={(e) => {
          e.stopPropagation();
          onStartConnection();
        }}
        className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-blue-600 border-2 border-white shadow-md opacity-0 group-hover/note:opacity-100 transition-opacity hover:scale-125 z-30 cursor-crosshair no-drag flex items-center justify-center"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-white" />
      </button>
      <button
        data-tutorial={note.isTutorialDemo ? 'note-demo-1-connect' : 'note-connect'}
        title="Connect from right"
        onClick={(e) => {
          e.stopPropagation();
          onStartConnection();
        }}
        className="absolute top-1/2 -right-2 -translate-y-1/2 w-4 h-4 rounded-full bg-blue-600 border-2 border-white shadow-md opacity-0 group-hover/note:opacity-100 transition-opacity hover:scale-125 z-30 cursor-crosshair no-drag flex items-center justify-center"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-white" />
      </button>
      <button
        title="Connect from bottom"
        onClick={(e) => {
          e.stopPropagation();
          onStartConnection();
        }}
        className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-blue-600 border-2 border-white shadow-md opacity-0 group-hover/note:opacity-100 transition-opacity hover:scale-125 z-30 cursor-crosshair no-drag flex items-center justify-center"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-white" />
      </button>
      <button
        title="Connect from left"
        onClick={(e) => {
          e.stopPropagation();
          onStartConnection();
        }}
        className="absolute top-1/2 -left-2 -translate-y-1/2 w-4 h-4 rounded-full bg-blue-600 border-2 border-white shadow-md opacity-0 group-hover/note:opacity-100 transition-opacity hover:scale-125 z-30 cursor-crosshair no-drag flex items-center justify-center"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-white" />
      </button>

      {/* Note Header */}
      <div className="flex items-center justify-between gap-1.5 mb-1.5">
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          {typeInfo.badge && (
            <span className="text-xs shrink-0 select-none" title={typeInfo.label}>
              {typeInfo.badge}
            </span>
          )}
          <input
            type="text"
            value={note.title}
            placeholder="Untitled Note..."
            onChange={(e) => onUpdate({ title: e.target.value }, false)}
            onBlur={(e) => onUpdate({ title: e.target.value }, true)}
            className="w-full bg-transparent font-semibold text-slate-800 text-sm placeholder:text-slate-400 focus:outline-none focus:bg-white/40 rounded px-1 -ml-1 transition-colors leading-snug truncate"
          />
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {learningInfo && (
            <span
              style={{ backgroundColor: learningInfo.bg, color: learningInfo.color }}
              className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded-full border border-black/5"
            >
              {learningInfo.label}
            </span>
          )}
          {note.locked && (
            <span title="Locked note" className="text-slate-600 text-xs">
              <Lock className="w-3 h-3 inline" />
            </span>
          )}
          {note.starred && (
            <span title="Starred" className="text-amber-500 text-xs font-bold leading-none">
              ★
            </span>
          )}
          {note.pinned && (
            <span title="Pinned" className="text-blue-700 text-xs leading-none">
              <Pin className="w-3 h-3 fill-current inline" />
            </span>
          )}
        </div>
      </div>

      {/* Note Body Editing Area */}
      <div className="flex-1 flex flex-col my-1 overflow-hidden">
        {note.type === 'mistake' ? (
          <div className="flex-1 flex flex-col gap-1.5 overflow-y-auto max-h-72 text-xs pr-1">
            <div className="bg-red-500/10 border border-red-500/20 rounded-md p-1.5">
              <span className="text-[10px] font-bold text-red-700 uppercase tracking-wider block mb-0.5">
                What I did:
              </span>
              <input
                type="text"
                value={note.mistakeDetails?.whatIDid || ''}
                placeholder="What was the initial mistake..."
                onChange={(e) => updateMistakeField('whatIDid', e.target.value)}
                className="w-full bg-transparent text-slate-800 focus:outline-none"
              />
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 rounded-md p-1.5">
              <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block mb-0.5">
                Why it was wrong:
              </span>
              <input
                type="text"
                value={note.mistakeDetails?.whyWrong || ''}
                placeholder="Root cause explanation..."
                onChange={(e) => updateMistakeField('whyWrong', e.target.value)}
                className="w-full bg-transparent text-slate-800 focus:outline-none"
              />
            </div>

            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-md p-1.5">
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block mb-0.5">
                Correct approach:
              </span>
              <textarea
                rows={2}
                value={note.mistakeDetails?.correctApproach || ''}
                placeholder="The right pattern / formula..."
                onChange={(e) => updateMistakeField('correctApproach', e.target.value)}
                className="w-full bg-transparent text-slate-800 focus:outline-none resize-none"
              />
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-md p-1.5">
              <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block mb-0.5">
                How to avoid in future:
              </span>
              <input
                type="text"
                value={note.mistakeDetails?.howToAvoid || ''}
                placeholder="Checklist rule..."
                onChange={(e) => updateMistakeField('howToAvoid', e.target.value)}
                className="w-full bg-transparent text-slate-800 focus:outline-none"
              />
            </div>
          </div>
        ) : note.type === 'quote' ? (
          <div className="flex-1 flex flex-col justify-between p-1">
            <div className="relative">
              <QuoteIcon className="w-5 h-5 text-slate-400/40 absolute -top-1 -left-1 pointer-events-none" />
              <textarea
                value={note.content}
                placeholder="Paste or write inspirational quotation..."
                onChange={(e) => onUpdate({ content: e.target.value }, false)}
                onBlur={(e) => onUpdate({ content: e.target.value }, true)}
                rows={3}
                className="w-full bg-transparent text-slate-800 text-xs italic font-serif placeholder:text-slate-400 focus:outline-none resize-none pl-4 leading-relaxed overflow-y-auto"
              />
            </div>
            <div className="flex items-center gap-1 mt-1 justify-end text-[11px] text-slate-500">
              <span>—</span>
              <input
                type="text"
                value={note.quoteAuthor || ''}
                placeholder="Author / Source"
                onChange={(e) => onUpdate({ quoteAuthor: e.target.value })}
                className="bg-transparent text-right font-medium text-slate-700 focus:outline-none focus:bg-white/40 rounded px-1"
              />
            </div>
          </div>
        ) : note.type === 'code' ? (
          <div className="flex-1 flex flex-col">
            <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono mb-1 px-1">
              <span>{note.codeLanguage || 'code'}</span>
              <button
                onClick={handleCopyCode}
                className="p-1 hover:bg-slate-200/60 rounded text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors"
                title="Copy snippet"
              >
                {copiedCode ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
            <textarea
              value={note.content}
              placeholder="// Write or paste code snippet..."
              onChange={(e) => onUpdate({ content: e.target.value }, false)}
              onBlur={(e) => onUpdate({ content: e.target.value }, true)}
              rows={4}
              className="w-full flex-1 bg-slate-900/5 text-slate-900 font-mono text-xs p-2 rounded resize-none border border-slate-900/10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white/60 leading-relaxed overflow-y-auto"
            />
          </div>
        ) : note.type === 'task' ? (
          <div className="flex-1 flex flex-col gap-1.5 overflow-y-auto max-h-56 pr-1">
            {(note.taskItems || []).map((task) => (
              <div key={task.id} className="flex items-start gap-1.5 text-xs group/item">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleTask(task.id)}
                  className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 border-slate-400 cursor-pointer"
                />
                <input
                  type="text"
                  value={task.text}
                  placeholder="Task item..."
                  onChange={(e) => updateTaskText(task.id, e.target.value)}
                  onBlur={() => onUpdate({ taskItems: note.taskItems }, true)}
                  className={`flex-1 bg-transparent focus:outline-none focus:bg-white/50 rounded px-1 leading-snug ${
                    task.completed ? 'line-through text-slate-400' : 'text-slate-800'
                  }`}
                />
                <button
                  onClick={() => removeTaskItem(task.id)}
                  className="opacity-0 group-hover/item:opacity-100 text-slate-400 hover:text-red-500 p-0.5 transition-opacity"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
            <button
              onClick={addTaskItem}
              className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-blue-700 py-1 font-medium transition-colors"
            >
              <Plus className="w-3 h-3" /> Add item
            </button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col">
            {isEditingContent || note.content.includes('[[') === false ? (
              <textarea
                value={note.content}
                placeholder="Type your thought here... Use [[Note Title]] to cross-reference."
                onFocus={() => setIsEditingContent(true)}
                onChange={(e) => onUpdate({ content: e.target.value }, false)}
                onBlur={(e) => {
                  setIsEditingContent(false);
                  onUpdate({ content: e.target.value }, true);
                }}
                className="w-full flex-1 bg-transparent text-slate-800 text-xs placeholder:text-slate-400 focus:outline-none focus:bg-white/30 rounded p-1 -m-1 resize-none leading-relaxed overflow-y-auto whitespace-pre-wrap"
              />
            ) : (
              <div
                onClick={() => setIsEditingContent(true)}
                className="w-full flex-1 bg-transparent text-slate-800 text-xs p-1 -m-1 leading-relaxed overflow-y-auto whitespace-pre-wrap cursor-text"
              >
                {renderContentWithWikiLinks(note.content || 'Click to edit thought...')}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Reference URL bar */}
      {note.type === 'reference' && (
        <div className="mt-1 flex items-center gap-1 bg-white/50 border border-slate-300/60 rounded px-1.5 py-0.5 text-[11px]">
          <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
          <input
            type="text"
            value={note.referenceUrl || ''}
            placeholder="https://example.com/paper"
            onChange={(e) => onUpdate({ referenceUrl: e.target.value }, false)}
            onBlur={(e) => onUpdate({ referenceUrl: e.target.value }, true)}
            className="w-full bg-transparent text-blue-700 underline focus:outline-none truncate"
          />
        </div>
      )}

      {/* Backlinks indicator (if other notes reference this note) */}
      {referencingNotes.length > 0 && (
        <div className="mt-1 pt-1 border-t border-black/5">
          <button
            onClick={() => setShowBacklinks(!showBacklinks)}
            className="text-[10px] text-blue-700 hover:underline font-medium flex items-center gap-1"
          >
            <span>Referenced by {referencingNotes.length} notes</span>
          </button>
          {showBacklinks && (
            <div className="mt-1 space-y-0.5">
              {referencingNotes.map((ref) => (
                <button
                  key={ref.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onNavigateToNote) onNavigateToNote(ref.id);
                  }}
                  className="block text-left text-[10px] text-slate-700 hover:text-blue-800 truncate"
                >
                  • {ref.title || 'Untitled Note'}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tags section */}
      <div className="mt-2 pt-1 border-t border-black/5 flex flex-wrap items-center gap-1">
        {note.tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-medium bg-black/5 text-slate-700 hover:bg-black/10 transition-colors group/tag"
          >
            #{tag}
            <button
              onClick={() => handleRemoveTag(tag)}
              className="hidden group-hover/tag:inline-block ml-0.5 text-slate-400 hover:text-red-600 font-bold"
            >
              ×
            </button>
          </span>
        ))}

        {showTagInput ? (
          <div className="inline-flex items-center gap-1">
            <input
              type="text"
              autoFocus
              value={newTagInput}
              placeholder="tag..."
              onChange={(e) => setNewTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddTag();
                if (e.key === 'Escape') setShowTagInput(false);
              }}
              onBlur={handleAddTag}
              className="w-16 text-[10px] bg-white border border-slate-300 rounded px-1 py-0.2 focus:outline-none focus:border-blue-500"
            />
          </div>
        ) : (
          <button
            onClick={() => setShowTagInput(true)}
            className="text-[10px] text-slate-400 hover:text-slate-700 font-medium px-1 hover:bg-black/5 rounded transition-colors"
            title="Add Tag"
          >
            + tag
          </button>
        )}
      </div>

      {/* Paper Curl Corner */}
      <div className="paper-curl-corner" />

      {/* Resize Handle */}
      {!note.locked && (
        <div
          data-tutorial={note.isTutorialDemo ? 'note-demo-1-resize' : 'note-resize'}
          onPointerDown={handleResizePointerDown}
          onPointerMove={handleResizePointerMove}
          onPointerUp={handleResizePointerUp}
          title="Resize Note"
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize flex items-center justify-center opacity-0 group-hover/note:opacity-80 transition-opacity z-20"
        >
          <CornerRightDown className="w-2.5 h-2.5 text-slate-600" />
        </div>
      )}
    </div>
  );
};
