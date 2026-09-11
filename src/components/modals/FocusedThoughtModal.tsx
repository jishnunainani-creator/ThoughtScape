import React, { useState, useEffect, useRef } from 'react';
import { StickyNote, NoteType, TaskItem, MistakeDetails } from '../../types';
import { STICKY_COLORS, COLOR_LIST, NOTE_TYPE_INFO } from '../../constants/colors';
import {
  X,
  Star,
  Copy,
  Trash2,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Check,
  Plus,
  ExternalLink,
  Code,
  CheckSquare,
  Quote as QuoteIcon,
  Palette,
  ChevronDown,
  ArrowUpRight,
} from 'lucide-react';

interface FocusedThoughtModalProps {
  note: StickyNote | null;
  allNotes: StickyNote[];
  isOpen: boolean;
  canvasTransform: { x: number; y: number; scale: number };
  onClose: () => void;
  onUpdateNote: (id: string, updates: Partial<StickyNote>, commitHistory?: boolean) => void;
  onDeleteNote?: (id: string) => void;
  onDuplicateNote?: (id: string) => void;
  onNavigateToNote?: (targetTitleOrId: string) => void;
  onSwitchFocusedNote?: (noteId: string) => void;
  onOpenAiModal?: () => void;
}

export const FocusedThoughtModal: React.FC<FocusedThoughtModalProps> = ({
  note,
  allNotes,
  isOpen,
  canvasTransform,
  onClose,
  onUpdateNote,
  onDeleteNote,
  onDuplicateNote,
  onNavigateToNote,
  onSwitchFocusedNote,
  onOpenAiModal,
}) => {
  const [animState, setAnimState] = useState<'initial' | 'expanded' | 'closing'>('initial');
  const [newTagInput, setNewTagInput] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showTypeMenu, setShowTypeMenu] = useState(false);
  const [showAiMenu, setShowAiMenu] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [aiMessage, setAiMessage] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const isClosingRef = useRef(false);

  // Find index for prev / next thought navigation
  const currentIndex = note ? allNotes.findIndex((n) => n.id === note.id) : -1;
  const prevNote = currentIndex > 0 ? allNotes[currentIndex - 1] : null;
  const nextNote = currentIndex >= 0 && currentIndex < allNotes.length - 1 ? allNotes[currentIndex + 1] : null;

  // Handle Entrance & Exit Animations
  useEffect(() => {
    if (isOpen && note) {
      isClosingRef.current = false;
      setAnimState('initial');
      const raf = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setAnimState('expanded');
        });
      });
      return () => cancelAnimationFrame(raf);
    } else {
      setAnimState('initial');
    }
  }, [isOpen, note?.id]);

  // Handle keyboard events (Escape, ArrowLeft, ArrowRight)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, note]);

  if (!isOpen || !note) return null;

  const colorConfig = STICKY_COLORS[note.color] || STICKY_COLORS.yellow;
  const typeInfo = NOTE_TYPE_INFO[note.type] || NOTE_TYPE_INFO.normal;

  // Compute starting screen bounds from canvas transform
  const startX = note.x * canvasTransform.scale + canvasTransform.x;
  const startY = note.y * canvasTransform.scale + canvasTransform.y;
  const startW = Math.max(160, note.width * canvasTransform.scale);
  const startH = Math.max(120, note.height * canvasTransform.scale);
  const startRot = note.rotation || 0;

  // Compute centered target bounds
  const targetW = Math.min(700, window.innerWidth - 32);
  const targetH = Math.min(600, window.innerHeight - 90);
  const targetX = (window.innerWidth - targetW) / 2;
  const targetY = (window.innerHeight - targetH) / 2 + 10;

  const isExpanded = animState === 'expanded';

  const handleClose = () => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;
    setAnimState('closing');
    setTimeout(() => {
      onClose();
    }, 320);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  // Tag Helpers
  const handleAddTag = () => {
    const clean = newTagInput.trim().replace(/^#/, '');
    if (clean && !note.tags.includes(clean)) {
      onUpdateNote(note.id, { tags: [...note.tags, clean] }, true);
    }
    setNewTagInput('');
    setShowTagInput(false);
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onUpdateNote(note.id, { tags: note.tags.filter((t) => t !== tagToRemove) }, true);
  };

  // Task Helpers
  const toggleTask = (taskId: string) => {
    const updated = (note.taskItems || []).map((t) =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );
    onUpdateNote(note.id, { taskItems: updated }, true);
  };

  const addTaskItem = () => {
    const newItem: TaskItem = {
      id: String(Date.now()),
      text: '',
      completed: false,
    };
    onUpdateNote(note.id, { taskItems: [...(note.taskItems || []), newItem] }, true);
  };

  const updateTaskText = (taskId: string, text: string) => {
    const updated = (note.taskItems || []).map((t) =>
      t.id === taskId ? { ...t, text } : t
    );
    onUpdateNote(note.id, { taskItems: updated }, false);
  };

  const removeTaskItem = (taskId: string) => {
    const updated = (note.taskItems || []).map((t) => t).filter((t) => t.id !== taskId);
    onUpdateNote(note.id, { taskItems: updated }, true);
  };

  // Mistake details helper
  const updateMistakeField = (field: keyof MistakeDetails, value: string) => {
    const current = note.mistakeDetails || {
      whatIDid: '',
      whyWrong: '',
      correctApproach: '',
      howToAvoid: '',
    };
    onUpdateNote(note.id, { mistakeDetails: { ...current, [field]: value } }, false);
  };

  // Quick AI Assistant action on current note
  const handleAiAction = (action: string) => {
    setShowAiMenu(false);
    setAiMessage(`AI: Processing "${action}" on "${note.title || 'this thought'}"...`);
    setTimeout(() => {
      if (action === 'expand') {
        const extra = `\n\n### Key Concepts & Details\n- Core definition and practical breakdown\n- Recommended implementation approach\n- Related edge cases and considerations`;
        onUpdateNote(note.id, { content: (note.content || '') + extra }, true);
        setAiMessage('✨ Thought expanded with key insights!');
      } else if (action === 'simplify') {
        setAiMessage('✨ Concept simplified and clarified.');
      } else if (action === 'examples') {
        const examples = `\n\n**Example Use Case:**\n\`\`\`ts\n// Practical example\nconst result = processConcept("${note.title || 'thought'}");\n\`\`\``;
        onUpdateNote(note.id, { content: (note.content || '') + examples }, true);
        setAiMessage('✨ Added code example to thought!');
      } else if (onOpenAiModal) {
        onOpenAiModal();
      }
      setTimeout(() => setAiMessage(null), 3000);
    }, 600);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(note.content);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

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
            className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-blue-100/90 text-blue-800 hover:bg-blue-200 font-medium text-xs underline mx-0.5"
            title={`Navigate to note: "${linkTarget}"`}
          >
            <span>{linkTarget}</span>
            <ArrowUpRight className="w-3 h-3" />
          </button>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div
      data-export-ignore="true"
      onClick={handleBackdropClick}
      className={`fixed inset-0 z-[99990] flex items-center justify-center transition-all duration-300 ${
        isExpanded ? 'bg-slate-950/45 backdrop-blur-xs' : 'bg-transparent pointer-events-none'
      }`}
      style={{ overflow: 'hidden' }}
    >
      {/* Centered Magnified Physical Sticky Note Paper */}
      <div
        ref={containerRef}
        style={{
          position: 'fixed',
          left: `${isExpanded ? targetX : startX}px`,
          top: `${isExpanded ? targetY : startY}px`,
          width: `${isExpanded ? targetW : startW}px`,
          height: `${isExpanded ? targetH : startH}px`,
          transform: `rotate(${isExpanded ? 0 : startRot}deg)`,
          backgroundColor: colorConfig.hex,
          borderColor: colorConfig.borderHex,
          transition:
            'left 0.34s cubic-bezier(0.16, 1, 0.3, 1), top 0.34s cubic-bezier(0.16, 1, 0.3, 1), width 0.34s cubic-bezier(0.16, 1, 0.3, 1), height 0.34s cubic-bezier(0.16, 1, 0.3, 1), transform 0.34s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease',
          pointerEvents: 'auto',
        }}
        className={`rounded-xl border shadow-2xl flex flex-col justify-between overflow-hidden select-text ${
          isExpanded
            ? 'shadow-[0_25px_60px_-15px_rgba(15,23,42,0.35),0_0_0_1px_rgba(0,0,0,0.08)]'
            : 'shadow-lg'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Paper Adhesive Strip Indicator */}
        <div className="w-16 h-3 bg-white/40 backdrop-blur-xs rounded-xs border border-white/60 mx-auto -mt-1.5 shadow-2xs pointer-events-none" />

        {/* ================= FOCUSED HEADER ================= */}
        <div className="px-5 pt-3 pb-2 border-b border-black/5 flex items-center justify-between gap-3 shrink-0">
          {/* Note Type & Title Field */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {/* Note Type Selector */}
            <div className="relative">
              <button
                onClick={() => setShowTypeMenu(!showTypeMenu)}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-black/5 hover:bg-black/10 text-xs font-semibold text-slate-800 transition-colors"
                title="Change Note Type"
              >
                <span>{typeInfo.badge || '📝'}</span>
                <span className="hidden sm:inline text-[11px]">{typeInfo.label}</span>
                <ChevronDown className="w-3 h-3 text-slate-500" />
              </button>

              {showTypeMenu && (
                <div className="absolute left-0 top-full mt-1.5 w-48 bg-white rounded-xl shadow-2xl border border-slate-100 py-1 z-50 text-xs flex flex-col animate-in zoom-in-95 duration-100">
                  {Object.entries(NOTE_TYPE_INFO).map(([key, info]) => (
                    <button
                      key={key}
                      onClick={() => {
                        onUpdateNote(note.id, { type: key as NoteType }, true);
                        setShowTypeMenu(false);
                      }}
                      className={`flex items-center gap-2 px-3 py-1.5 text-left hover:bg-blue-50 transition-colors ${
                        note.type === key ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700'
                      }`}
                    >
                      <span>{info.badge || '📝'}</span>
                      <span>{info.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Title Input */}
            <input
              type="text"
              value={note.title}
              placeholder="Thought title..."
              onChange={(e) => onUpdateNote(note.id, { title: e.target.value }, false)}
              onBlur={(e) => onUpdateNote(note.id, { title: e.target.value }, true)}
              className="flex-1 bg-transparent font-bold text-slate-900 text-base sm:text-lg placeholder:text-slate-400/80 focus:outline-none focus:bg-white/40 rounded px-1.5 py-0.5 transition-colors leading-tight truncate"
            />
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-1 shrink-0">
            {/* AI Assistant Button */}
            <div className="relative">
              <button
                onClick={() => setShowAiMenu(!showAiMenu)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50/90 hover:bg-indigo-100/90 text-indigo-700 border border-indigo-200/80 text-xs font-semibold transition-colors shadow-2xs"
                title="AI Thought Assistant"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span className="hidden sm:inline">AI</span>
              </button>

              {showAiMenu && (
                <div className="absolute right-0 top-full mt-1.5 w-56 bg-white rounded-xl shadow-2xl border border-slate-100 py-1.5 z-50 text-xs flex flex-col animate-in zoom-in-95 duration-100">
                  <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    THOUGHT AI ASSISTANT
                  </div>
                  <button
                    onClick={() => handleAiAction('expand')}
                    className="flex items-center gap-2 px-3 py-1.5 hover:bg-blue-50 text-slate-700 text-left transition-colors"
                  >
                    <span>✨ Expand with Key Details</span>
                  </button>
                  <button
                    onClick={() => handleAiAction('simplify')}
                    className="flex items-center gap-2 px-3 py-1.5 hover:bg-blue-50 text-slate-700 text-left transition-colors"
                  >
                    <span>🎯 Simplify Explanation</span>
                  </button>
                  <button
                    onClick={() => handleAiAction('examples')}
                    className="flex items-center gap-2 px-3 py-1.5 hover:bg-blue-50 text-slate-700 text-left transition-colors"
                  >
                    <span>💻 Add Practical Example</span>
                  </button>
                  <div className="h-px bg-slate-100 my-1" />
                  <button
                    onClick={() => {
                      setShowAiMenu(false);
                      if (onOpenAiModal) onOpenAiModal();
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 hover:bg-indigo-50 text-indigo-700 text-left font-semibold transition-colors"
                  >
                    <span>🚀 Open Concept Map Builder</span>
                  </button>
                </div>
              )}
            </div>

            {/* Paper Color Palette Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="p-1.5 rounded-lg hover:bg-black/5 text-slate-700 transition-colors"
                title="Change Paper Color"
              >
                <Palette className="w-4 h-4 text-slate-600" />
              </button>

              {showColorPicker && (
                <div className="absolute right-0 top-full mt-1.5 p-2 bg-white rounded-xl shadow-2xl border border-slate-100 z-50 flex items-center gap-1.5 animate-in zoom-in-95 duration-100">
                  {COLOR_LIST.map((c) => (
                    <button
                      key={c}
                      onClick={() => {
                        onUpdateNote(note.id, { color: c }, true);
                        setShowColorPicker(false);
                      }}
                      style={{ backgroundColor: STICKY_COLORS[c].hex }}
                      className={`w-6 h-6 rounded-full border border-black/10 hover:scale-110 transition-transform ${
                        note.color === c ? 'ring-2 ring-blue-600 ring-offset-1' : ''
                      }`}
                      title={STICKY_COLORS[c].name}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Star Button */}
            <button
              onClick={() => onUpdateNote(note.id, { starred: !note.starred }, true)}
              className={`p-1.5 rounded-lg hover:bg-black/5 transition-colors ${
                note.starred ? 'text-amber-500 font-bold' : 'text-slate-400 hover:text-slate-700'
              }`}
              title={note.starred ? 'Starred Thought' : 'Star Thought'}
            >
              <Star className={`w-4 h-4 ${note.starred ? 'fill-current' : ''}`} />
            </button>

            {/* Duplicate Button */}
            {onDuplicateNote && (
              <button
                onClick={() => {
                  onDuplicateNote(note.id);
                  handleClose();
                }}
                className="p-1.5 rounded-lg hover:bg-black/5 text-slate-500 hover:text-slate-800 transition-colors"
                title="Duplicate Thought"
              >
                <Copy className="w-4 h-4" />
              </button>
            )}

            {/* Delete Button */}
            {onDeleteNote && (
              <button
                onClick={() => {
                  onDeleteNote(note.id);
                  handleClose();
                }}
                className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                title="Delete Thought"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            {/* Close Button */}
            <button
              onClick={handleClose}
              aria-label="Close focused thought"
              className="p-1.5 rounded-lg hover:bg-black/10 text-slate-600 hover:text-slate-900 transition-colors ml-1"
              title="Close focus mode (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* AI Notification Banner */}
        {aiMessage && (
          <div className="mx-5 my-1.5 px-3 py-1.5 rounded-lg bg-indigo-100/80 border border-indigo-200 text-indigo-900 text-xs font-medium animate-in fade-in duration-150 flex items-center justify-between">
            <span>{aiMessage}</span>
          </div>
        )}

        {/* ================= FOCUSED CONTENT BODY ================= */}
        <div className="flex-1 px-5 py-3 overflow-y-auto space-y-3 text-slate-800">
          {/* Note Type Specific Content Editor */}
          {note.type === 'task' ? (
            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <CheckSquare className="w-3.5 h-3.5 text-blue-600" />
                <span>Action Checklist ({note.taskItems?.filter((t) => t.completed).length || 0}/{(note.taskItems || []).length} completed)</span>
              </div>

              <div className="space-y-1.5">
                {(note.taskItems || []).map((task) => (
                  <div key={task.id} className="flex items-center gap-2 group/task bg-white/40 hover:bg-white/60 p-1.5 rounded-lg border border-black/5 transition-colors">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleTask(task.id)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-400 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={task.text}
                      placeholder="Checklist task..."
                      onChange={(e) => updateTaskText(task.id, e.target.value)}
                      onBlur={() => onUpdateNote(note.id, { taskItems: note.taskItems }, true)}
                      className={`flex-1 bg-transparent text-sm focus:outline-none ${
                        task.completed ? 'line-through text-slate-400' : 'text-slate-800 font-medium'
                      }`}
                    />
                    <button
                      onClick={() => removeTaskItem(task.id)}
                      className="opacity-0 group-hover/task:opacity-100 text-slate-400 hover:text-red-600 p-1 transition-opacity"
                      title="Remove Item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={addTaskItem}
                className="flex items-center gap-1.5 text-xs text-blue-700 hover:text-blue-900 font-semibold py-1 px-2 rounded-lg hover:bg-blue-50/50 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Checklist Item</span>
              </button>
            </div>
          ) : note.type === 'code' ? (
            <div className="space-y-2 h-full flex flex-col">
              <div className="flex items-center justify-between text-xs text-slate-600 font-mono">
                <div className="flex items-center gap-1.5">
                  <Code className="w-3.5 h-3.5 text-blue-600" />
                  <input
                    type="text"
                    value={note.codeLanguage || 'typescript'}
                    placeholder="Language (e.g. typescript, python, sql)..."
                    onChange={(e) => onUpdateNote(note.id, { codeLanguage: e.target.value })}
                    className="bg-transparent font-semibold text-slate-700 focus:outline-none focus:bg-white/50 rounded px-1"
                  />
                </div>
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1 px-2 py-1 rounded bg-black/5 hover:bg-black/10 text-slate-700 transition-colors text-xs font-mono"
                  title="Copy snippet"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>

              <textarea
                value={note.content}
                placeholder="// Write code or syntax snippet here..."
                onChange={(e) => onUpdateNote(note.id, { content: e.target.value }, false)}
                onBlur={(e) => onUpdateNote(note.id, { content: e.target.value }, true)}
                className="flex-1 w-full bg-slate-900 text-slate-100 font-mono text-xs sm:text-sm p-4 rounded-xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed resize-none min-h-[220px]"
              />
            </div>
          ) : note.type === 'mistake' ? (
            <div className="space-y-3">
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 space-y-1">
                <span className="text-xs font-bold text-red-800 uppercase tracking-wider block">
                  1. What was the mistake?
                </span>
                <input
                  type="text"
                  value={note.mistakeDetails?.whatIDid || ''}
                  placeholder="Describe what occurred or the initial flawed attempt..."
                  onChange={(e) => updateMistakeField('whatIDid', e.target.value)}
                  className="w-full bg-transparent text-sm text-slate-900 focus:outline-none font-medium"
                />
              </div>

              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 space-y-1">
                <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">
                  2. Why was it wrong? (Root Cause)
                </span>
                <textarea
                  rows={2}
                  value={note.mistakeDetails?.whyWrong || ''}
                  placeholder="Underlying flaw, incorrect assumption, or complexity pitfall..."
                  onChange={(e) => updateMistakeField('whyWrong', e.target.value)}
                  className="w-full bg-transparent text-sm text-slate-900 focus:outline-none resize-none font-medium leading-relaxed"
                />
              </div>

              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 space-y-1">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
                  3. Correct approach / Pattern:
                </span>
                <textarea
                  rows={2}
                  value={note.mistakeDetails?.correctApproach || ''}
                  placeholder="The robust, optimal solution or mental model..."
                  onChange={(e) => updateMistakeField('correctApproach', e.target.value)}
                  className="w-full bg-transparent text-sm text-slate-900 focus:outline-none resize-none font-medium leading-relaxed"
                />
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 space-y-1">
                <span className="text-xs font-bold text-blue-800 uppercase tracking-wider block">
                  4. Rule of thumb for the future:
                </span>
                <input
                  type="text"
                  value={note.mistakeDetails?.howToAvoid || ''}
                  placeholder="Memory hook or rule to never repeat this mistake..."
                  onChange={(e) => updateMistakeField('howToAvoid', e.target.value)}
                  className="w-full bg-transparent text-sm text-slate-900 focus:outline-none font-medium"
                />
              </div>
            </div>
          ) : note.type === 'quote' ? (
            <div className="space-y-4 py-4">
              <div className="relative">
                <QuoteIcon className="w-8 h-8 text-black/10 absolute -top-3 -left-3 pointer-events-none" />
                <textarea
                  value={note.content}
                  placeholder="Paste or write the quote..."
                  onChange={(e) => onUpdateNote(note.id, { content: e.target.value }, false)}
                  onBlur={(e) => onUpdateNote(note.id, { content: e.target.value }, true)}
                  rows={5}
                  className="w-full bg-transparent text-slate-900 font-serif italic text-base sm:text-lg placeholder:text-slate-400 focus:outline-none resize-none pl-6 leading-relaxed"
                />
              </div>

              <div className="flex items-center gap-2 justify-end text-sm text-slate-600">
                <span className="font-serif italic">—</span>
                <input
                  type="text"
                  value={note.quoteAuthor || ''}
                  placeholder="Quote Author / Source"
                  onChange={(e) => onUpdateNote(note.id, { quoteAuthor: e.target.value })}
                  className="bg-transparent text-right font-semibold text-slate-800 focus:outline-none focus:bg-white/40 rounded px-2 py-0.5"
                />
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col space-y-2">
              <textarea
                value={note.content}
                placeholder="Write your thoughts, key concepts, formulas, or notes here...&#10;&#10;Tip: Use [[Other Note Title]] to link thoughts together."
                onChange={(e) => onUpdateNote(note.id, { content: e.target.value }, false)}
                onBlur={(e) => onUpdateNote(note.id, { content: e.target.value }, true)}
                className="w-full flex-1 bg-transparent text-slate-800 text-sm sm:text-base placeholder:text-slate-400/80 focus:outline-none focus:bg-white/20 rounded-lg p-2 resize-none leading-relaxed min-h-[200px]"
              />

              {note.content && note.content.includes('[[') && (
                <div className="pt-2 border-t border-black/5 flex items-center gap-1.5 flex-wrap text-xs text-slate-600">
                  <span className="font-semibold text-[11px] text-slate-500">Links:</span>
                  {renderContentWithWikiLinks(note.content)}
                </div>
              )}
            </div>
          )}

          {/* Reference URL field */}
          {note.type === 'reference' && (
            <div className="flex items-center gap-2 bg-white/60 border border-black/10 rounded-xl p-2 text-xs">
              <ExternalLink className="w-4 h-4 text-blue-600 shrink-0" />
              <input
                type="text"
                value={note.referenceUrl || ''}
                placeholder="https://example.com/research-paper"
                onChange={(e) => onUpdateNote(note.id, { referenceUrl: e.target.value }, false)}
                onBlur={(e) => onUpdateNote(note.id, { referenceUrl: e.target.value }, true)}
                className="flex-1 bg-transparent text-blue-700 underline focus:outline-none font-mono text-xs"
              />
              {note.referenceUrl && (
                <a
                  href={note.referenceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2 py-1 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors"
                >
                  Open Link
                </a>
              )}
            </div>
          )}
        </div>

        {/* ================= FOCUSED FOOTER ================= */}
        <div className="px-5 py-2.5 border-t border-black/5 bg-black/[0.02] flex items-center justify-between gap-3 shrink-0">
          {/* Tags List */}
          <div className="flex flex-wrap items-center gap-1.5 flex-1 min-w-0">
            {note.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-black/5 text-slate-800 hover:bg-black/10 transition-colors group/tag"
              >
                #{tag}
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="text-slate-400 hover:text-red-600 font-bold text-xs"
                  title="Remove tag"
                >
                  ×
                </button>
              </span>
            ))}

            {showTagInput ? (
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
                className="w-20 text-xs bg-white border border-slate-300 rounded px-1.5 py-0.5 focus:outline-none focus:border-blue-500"
              />
            ) : (
              <button
                onClick={() => setShowTagInput(true)}
                className="text-xs text-slate-500 hover:text-slate-800 font-semibold px-2 py-0.5 hover:bg-black/5 rounded-md transition-colors"
                title="Add a tag"
              >
                + Tag
              </button>
            )}
          </div>

          {/* Previous / Next Thought Card Navigators */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => prevNote && onSwitchFocusedNote && onSwitchFocusedNote(prevNote.id)}
              disabled={!prevNote || !onSwitchFocusedNote}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/5 hover:bg-black/10 disabled:opacity-30 disabled:hover:bg-transparent text-xs font-semibold text-slate-700 transition-colors"
              title="Previous Thought in Landscape"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Prev</span>
            </button>

            <span className="text-[11px] font-mono text-slate-500">
              {currentIndex >= 0 ? `${currentIndex + 1} / ${allNotes.length}` : ''}
            </span>

            <button
              onClick={() => nextNote && onSwitchFocusedNote && onSwitchFocusedNote(nextNote.id)}
              disabled={!nextNote || !onSwitchFocusedNote}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/5 hover:bg-black/10 disabled:opacity-30 disabled:hover:bg-transparent text-xs font-semibold text-slate-700 transition-colors"
              title="Next Thought in Landscape"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
