import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Plus,
  LayoutGrid,
  FolderPlus,
  Eye,
  Download,
  Upload,
  Layers,
  MapPin,
  Camera,
  Sparkles,
  HelpCircle,
  FileText,
  Share2,
  BookOpen,
  Palette,
  Bot,
} from 'lucide-react';
import { StickyNote, Board, NoteColor } from '../../types';
import { COLOR_LIST, STICKY_COLORS } from '../../constants/colors';
import { OrganizeMode } from '../../utils/layout';

export interface CommandItem {
  id: string;
  title: string;
  category: 'Creation' | 'Canvas' | 'Organize' | 'Navigation' | 'Landscapes' | 'Export & Data';
  icon: React.ReactNode;
  shortcut?: string;
  action: () => void;
}

interface CommandPaletteModalProps {
  isOpen: boolean;
  notes: StickyNote[];
  boards: Board[];
  activeBoardId: string;
  onClose: () => void;
  onCreateNote: (color?: NoteColor) => void;
  onAddGroup: () => void;
  onOrganize: (mode: OrganizeMode) => void;
  onGenerateConceptMap: () => void;
  onScatterNotes: () => void;
  onFitAll: () => void;
  onResetZoom: () => void;
  onTogglePresentation: () => void;
  onToggleSidebar: () => void;
  onOpenSearch: () => void;
  onOpenExportModal: () => void;
  onExportJSON: () => void;
  onImportJSON: () => void;
  onOpenSnapshots: () => void;
  onOpenTemplates: () => void;
  onOpenEnvironmentModal?: () => void;
  onOpenMcpModal?: () => void;
  onOpenShortcuts: () => void;
  onOpenGuide?: () => void;
  onSwitchBoard: (boardId: string) => void;
  onSelectNote: (note: StickyNote) => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  notes,
  boards,
  activeBoardId,
  onClose,
  onCreateNote,
  onAddGroup,
  onOrganize,
  onGenerateConceptMap,
  onScatterNotes,
  onFitAll,
  onResetZoom,
  onTogglePresentation,
  onToggleSidebar,
  onOpenSearch,
  onOpenExportModal,
  onExportJSON,
  onImportJSON,
  onOpenSnapshots,
  onOpenTemplates,
  onOpenEnvironmentModal,
  onOpenMcpModal,
  onOpenShortcuts,
  onOpenGuide,
  onSwitchBoard,
  onSelectNote,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Build command list
  const commands: CommandItem[] = [
    {
      id: 'create-note',
      title: 'Create Thought',
      category: 'Creation',
      icon: <Plus className="w-4 h-4 text-blue-600" />,
      shortcut: 'N',
      action: () => {
        onCreateNote();
        onClose();
      },
    },
    ...COLOR_LIST.map((color) => ({
      id: `create-note-${color}`,
      title: `Create ${STICKY_COLORS[color].name} Thought`,
      category: 'Creation' as const,
      icon: (
        <span
          style={{ backgroundColor: STICKY_COLORS[color].hex }}
          className="w-3.5 h-3.5 rounded-full border border-black/10 inline-block"
        />
      ),
      action: () => {
        onCreateNote(color);
        onClose();
      },
    })),
    {
      id: 'create-group',
      title: 'Create Cluster Group',
      category: 'Creation',
      icon: <FolderPlus className="w-4 h-4 text-purple-600" />,
      action: () => {
        onAddGroup();
        onClose();
      },
    },
    {
      id: 'concept-map',
      title: 'Create Concept Map from Selection',
      category: 'Organize',
      icon: <Share2 className="w-4 h-4 text-emerald-600" />,
      action: () => {
        onGenerateConceptMap();
        onClose();
      },
    },
    {
      id: 'scatter-notes',
      title: 'Scatter Thoughts for Brainstorming',
      category: 'Organize',
      icon: <Sparkles className="w-4 h-4 text-amber-500" />,
      action: () => {
        onScatterNotes();
        onClose();
      },
    },
    ...boards.map((b) => ({
      id: `switch-board-${b.id}`,
      title: `Switch to Landscape: "${b.name}" ${b.id === activeBoardId ? '(Active)' : ''}`,
      category: 'Landscapes' as const,
      icon: <Layers className="w-4 h-4 text-blue-600" />,
      action: () => {
        onSwitchBoard(b.id);
        onClose();
      },
    })),
    {
      id: 'organize-grid',
      title: 'Organize Landscape in Grid Layout',
      category: 'Organize',
      icon: <LayoutGrid className="w-4 h-4 text-blue-600" />,
      action: () => {
        onOrganize('grid');
        onClose();
      },
    },
    {
      id: 'organize-color',
      title: 'Organize by Color Clusters',
      category: 'Organize',
      icon: <LayoutGrid className="w-4 h-4 text-pink-600" />,
      action: () => {
        onOrganize('by_color');
        onClose();
      },
    },
    {
      id: 'organize-flow',
      title: 'Organize by Connection Hierarchy Flow',
      category: 'Organize',
      icon: <LayoutGrid className="w-4 h-4 text-cyan-600" />,
      action: () => {
        onOrganize('flow');
        onClose();
      },
    },
    {
      id: 'fit-all',
      title: 'Zoom to Fit All Thoughts',
      category: 'Canvas',
      icon: <MapPin className="w-4 h-4 text-blue-600" />,
      shortcut: '0',
      action: () => {
        onFitAll();
        onClose();
      },
    },
    {
      id: 'reset-zoom',
      title: 'Reset Zoom to 100%',
      category: 'Canvas',
      icon: <MapPin className="w-4 h-4 text-slate-500" />,
      action: () => {
        onResetZoom();
        onClose();
      },
    },
    {
      id: 'toggle-presentation',
      title: 'Toggle Presentation / Focus Mode',
      category: 'Canvas',
      icon: <Eye className="w-4 h-4 text-indigo-600" />,
      action: () => {
        onTogglePresentation();
        onClose();
      },
    },
    {
      id: 'toggle-sidebar',
      title: 'Toggle Explorer Sidebar',
      category: 'Navigation',
      icon: <Layers className="w-4 h-4 text-slate-600" />,
      action: () => {
        onToggleSidebar();
        onClose();
      },
    },
    {
      id: 'open-search',
      title: 'Search All Thoughts',
      category: 'Navigation',
      icon: <Search className="w-4 h-4 text-slate-600" />,
      shortcut: '⌘F',
      action: () => {
        onClose();
        onOpenSearch();
      },
    },
    {
      id: 'open-templates',
      title: 'Browse Starter Landscapes',
      category: 'Creation',
      icon: <FileText className="w-4 h-4 text-emerald-600" />,
      action: () => {
        onClose();
        onOpenTemplates();
      },
    },
    {
      id: 'customize-environment',
      title: 'Personalize Environment (Chalkboard, Cork Board, Wooden Study...)',
      category: 'Landscapes',
      icon: <Palette className="w-4 h-4 text-indigo-600" />,
      action: () => {
        onClose();
        if (onOpenEnvironmentModal) onOpenEnvironmentModal();
      },
    },
    {
      id: 'mcp-integration',
      title: 'ChatGPT & MCP Agent Integration Settings',
      category: 'Export & Data',
      icon: <Bot className="w-4 h-4 text-emerald-600" />,
      action: () => {
        onClose();
        if (onOpenMcpModal) onOpenMcpModal();
      },
    },
    {
      id: 'daily-snapshot',
      title: 'Daily Snapshots & History',
      category: 'Landscapes',
      icon: <Camera className="w-4 h-4 text-amber-600" />,
      action: () => {
        onClose();
        onOpenSnapshots();
      },
    },
    {
      id: 'export-pdf-png',
      title: 'Export Landscape as High-Res PDF / PNG',
      category: 'Export & Data',
      icon: <Download className="w-4 h-4 text-blue-600" />,
      action: () => {
        onClose();
        onOpenExportModal();
      },
    },
    {
      id: 'export-json',
      title: 'Backup Thoughtscape Workspace (JSON)',
      category: 'Export & Data',
      icon: <Download className="w-4 h-4 text-emerald-600" />,
      action: () => {
        onExportJSON();
        onClose();
      },
    },
    {
      id: 'import-json',
      title: 'Restore Thoughtscape Workspace (JSON)',
      category: 'Export & Data',
      icon: <Upload className="w-4 h-4 text-purple-600" />,
      action: () => {
        onImportJSON();
        onClose();
      },
    },
    {
      id: 'open-technical-guide',
      title: 'Technical Guide & Interactive Tutorial',
      category: 'Navigation',
      icon: <BookOpen className="w-4 h-4 text-blue-600" />,
      shortcut: 'Guide',
      action: () => {
        onClose();
        if (onOpenGuide) onOpenGuide();
      },
    },
    {
      id: 'open-shortcuts',
      title: 'Keyboard Shortcuts Cheat Sheet',
      category: 'Navigation',
      icon: <HelpCircle className="w-4 h-4 text-slate-500" />,
      shortcut: '?',
      action: () => {
        onClose();
        onOpenShortcuts();
      },
    },
  ];

  // Note search matches
  const noteMatches: CommandItem[] = query.trim().length > 1
    ? notes
        .filter(
          (n) =>
            n.title.toLowerCase().includes(query.toLowerCase()) ||
            n.content.toLowerCase().includes(query.toLowerCase()) ||
            n.tags.some((t) => t.toLowerCase().includes(query.toLowerCase()))
        )
        .slice(0, 5)
        .map((n) => ({
          id: `note-${n.id}`,
          title: n.title || n.content.slice(0, 30) || 'Untitled Thought',
          category: 'Navigation' as const,
          icon: <FileText className="w-4 h-4 text-blue-500" />,
          action: () => {
            onSelectNote(n);
            onClose();
          },
        }))
    : [];

  const filteredCommands = query.trim()
    ? [
        ...noteMatches,
        ...commands.filter(
          (c) =>
            c.title.toLowerCase().includes(query.toLowerCase()) ||
            c.category.toLowerCase().includes(query.toLowerCase())
        ),
      ]
    : commands;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredCommands.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % Math.max(1, filteredCommands.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const current = filteredCommands[selectedIndex];
      if (current) current.action();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div
      data-export-ignore="true"
      className="fixed inset-0 z-[99999] bg-slate-900/40 backdrop-blur-xs flex items-start justify-center pt-24 p-4 select-none animate-in fade-in duration-100"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in zoom-in-95 duration-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100">
          <Search className="w-5 h-5 text-blue-600 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            placeholder="Type a command or search thoughts... (e.g. thought, export, organize)"
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            className="w-full bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
          />
          <kbd className="bg-slate-100 px-2 py-0.5 rounded text-[10px] text-slate-400 font-mono">ESC</kbd>
        </div>

        {/* Command Items List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-0.5">
          {filteredCommands.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No matching commands or thoughts found for "{query}"
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={cmd.id}
                  onClick={cmd.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-colors ${
                    isSelected ? 'bg-blue-600 text-white font-medium shadow-xs' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={isSelected ? 'text-white' : ''}>{cmd.icon}</span>
                    <span className="truncate">{cmd.title}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full ${
                        isSelected ? 'bg-blue-700 text-blue-100' : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {cmd.category}
                    </span>
                    {cmd.shortcut && (
                      <kbd
                        className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                          isSelected ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {cmd.shortcut}
                      </kbd>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>Esc Close</span>
          </div>
          <span className="font-semibold text-blue-600">Thoughtscape Commands</span>
        </div>
      </div>
    </div>
  );
};
