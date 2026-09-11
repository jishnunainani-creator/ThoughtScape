import React, { useState, useEffect, useRef } from 'react';
import {
  Menu,
  Search,
  Undo2,
  Redo2,
  LayoutGrid,
  Download,
  Eye,
  Volume2,
  VolumeX,
  HelpCircle,
  Upload,
  FileDown,
  FileText,
  ChevronDown,
  Camera,
  Layers,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Palette,
  Plus,
  Check,
  AlignHorizontalDistributeCenter,
  AlignVerticalDistributeCenter,
  Trash2,
} from 'lucide-react';
import { OrganizeMode } from '../../utils/layout';
import { isSoundEnabled, toggleSound } from '../../utils/sound';
import { Board, Group } from '../../types';
import { ThoughtscapeLogo } from '../common/ThoughtscapeLogo';

interface TopNavProps {
  boards: Board[];
  activeBoardId: string;
  groups: Group[];
  totalItemsInLandscape?: number;
  canUndo: boolean;
  canRedo: boolean;
  saveStatus: 'saved' | 'saving';
  isPresentationMode: boolean;
  activeEnvironmentName?: string;
  isMcpConnected?: boolean;
  onAddNote?: () => void;
  onOpenEnvironmentModal?: () => void;
  onOpenMcpModal?: () => void;
  onSwitchBoard: (boardId: string) => void;
  onUndo: () => void;
  onRedo: () => void;
  onOpenSearch: () => void;
  onOpenCommandPalette: () => void;
  onToggleSidebar: () => void;
  onOrganize: (mode: OrganizeMode) => void;
  onOpenClearLandscape?: () => void;
  onTogglePresentation: () => void;
  onOpenExportModal: () => void;
  onExportJSON: () => void;
  onImportJSON: () => void;
  onOpenSnapshots: () => void;
  onOpenShortcuts: () => void;
  onOpenGuide?: () => void;
  onFocusGroup?: (groupId: string | null) => void;
  onOpenTemplates?: () => void;
  onAddBoard?: (name: string) => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  boards,
  activeBoardId,
  groups,
  totalItemsInLandscape,
  canUndo,
  canRedo,
  saveStatus,
  isPresentationMode,
  activeEnvironmentName,
  onAddNote,
  onOpenEnvironmentModal,
  onOpenMcpModal,
  onSwitchBoard,
  onUndo,
  onRedo,
  onOpenSearch,
  onOpenCommandPalette,
  onToggleSidebar,
  onOrganize,
  onOpenClearLandscape,
  onTogglePresentation,
  onOpenExportModal,
  onExportJSON,
  onImportJSON,
  onOpenSnapshots,
  onOpenShortcuts,
  onOpenGuide,
  onFocusGroup,
  onOpenTemplates,
  onAddBoard,
}) => {
  const [showOrganizeMenu, setShowOrganizeMenu] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showBoardMenu, setShowBoardMenu] = useState(false);
  const [showViewMenu, setShowViewMenu] = useState(false);
  const [presentationStep, setPresentationStep] = useState(0);
  const [soundOn, setSoundOn] = useState(isSoundEnabled());

  const navRef = useRef<HTMLElement>(null);
  const activeBoard = boards.find((b) => b.id === activeBoardId) || boards[0];

  // Close menus on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setShowOrganizeMenu(false);
        setShowExportMenu(false);
        setShowBoardMenu(false);
        setShowViewMenu(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleToggleSound = () => {
    const newState = toggleSound();
    setSoundOn(newState);
  };

  const handleNextConcept = () => {
    if (groups.length === 0) return;
    const nextIdx = (presentationStep + 1) % groups.length;
    setPresentationStep(nextIdx);
    if (onFocusGroup) onFocusGroup(groups[nextIdx].id);
  };

  const handlePrevConcept = () => {
    if (groups.length === 0) return;
    const prevIdx = (presentationStep - 1 + groups.length) % groups.length;
    setPresentationStep(prevIdx);
    if (onFocusGroup) onFocusGroup(groups[prevIdx].id);
  };

  if (isPresentationMode) {
    return (
      <div
        data-export-ignore="true"
        className="fixed top-4 inset-x-0 mx-auto w-fit z-50 flex items-center gap-2 bg-slate-900/95 backdrop-blur-md px-4 py-2 rounded-full text-white text-xs shadow-2xl border border-slate-700 animate-in slide-in-from-top-3 duration-200 select-none"
      >
        <span className="font-semibold text-blue-400">Presentation Mode</span>
        <div className="h-3 w-px bg-slate-700 mx-1" />

        {groups.length > 0 ? (
          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrevConcept}
              className="p-1 rounded-full hover:bg-white/10 transition-colors"
              title="Previous cluster"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-medium text-slate-200">
              {groups[presentationStep]?.title || 'Cluster'} ({presentationStep + 1}/{groups.length})
            </span>
            <button
              onClick={handleNextConcept}
              className="p-1 rounded-full hover:bg-white/10 transition-colors"
              title="Next cluster"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <span className="text-slate-400">Interactive Canvas View</span>
        )}

        <div className="h-3 w-px bg-slate-700 mx-1" />
        <button
          onClick={onTogglePresentation}
          className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors"
          title="Exit Presentation Mode (Esc)"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Exit</span>
        </button>
      </div>
    );
  }

  return (
    <header
      ref={navRef}
      data-export-ignore="true"
      className="fixed top-0 inset-x-0 h-14 bg-white/95 backdrop-blur-md border-b border-slate-200/80 z-40 px-3 sm:px-4 flex items-center justify-between select-none shadow-2xs transition-all"
    >
      {/* ================= LEFT / BRANDING & WORKSPACE ================= */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Sidebar Toggle */}
        <button
          onClick={onToggleSidebar}
          className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
          title="Toggle Explorer Sidebar"
        >
          <Menu className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
        </button>

        {/* Thoughtscape Logo & Fixed Width Single-Line Tagline */}
        <div
          onClick={onOpenGuide}
          className="flex items-center gap-2.5 cursor-pointer max-w-[205px] group"
          title="Thoughtscape — A landscape for your thoughts."
        >
          <ThoughtscapeLogo size={26} className="group-hover:scale-105 transition-transform" />
          <div className="flex flex-col justify-center">
            <h1 className="font-bold text-sm tracking-tight text-slate-900 leading-tight group-hover:text-blue-600 transition-colors">
              Thoughtscape
            </h1>
            <span className="text-[10.5px] text-slate-500 font-normal leading-tight whitespace-nowrap overflow-hidden text-ellipsis">
              A landscape for your thoughts.
            </span>
          </div>
        </div>

        {/* Vertical Divider */}
        <div className="h-4 w-px bg-slate-200/90 mx-0.5 hidden sm:block" />

        {/* Landscape Selector: [ ◇  My Thoughtscape ▾ ] */}
        <div className="relative hidden sm:block">
          <button
            onClick={() => {
              setShowBoardMenu(!showBoardMenu);
              setShowOrganizeMenu(false);
              setShowExportMenu(false);
              setShowViewMenu(false);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-50/80 hover:bg-slate-100 border border-slate-200/80 text-xs font-semibold text-slate-800 shadow-2xs hover:border-slate-300 transition-all group"
            title="Switch Thoughtscape Landscape"
          >
            <Layers className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="truncate max-w-[150px] font-medium">{activeBoard?.name || 'Welcome to Thoughtscape'}</span>
            <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-slate-600 transition-colors" />
          </button>

          {showBoardMenu && (
            <div className="absolute left-0 top-full mt-1.5 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-50 text-xs flex flex-col animate-in zoom-in-95 duration-100">
              <div className="px-3.5 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>MY LANDSCAPES</span>
                <span className="text-slate-400 font-normal">{boards.length} spaces</span>
              </div>
              <div className="max-h-72 overflow-y-auto py-0.5 divide-y divide-slate-50">
                {boards.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => {
                      onSwitchBoard(b.id);
                      setShowBoardMenu(false);
                    }}
                    className={`w-full px-3.5 py-2.5 text-left transition-colors flex items-start justify-between gap-2 ${
                      b.id === activeBoardId
                        ? 'bg-blue-50/80 text-blue-900'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex flex-col min-w-0">
                      <span className={`truncate font-semibold ${b.id === activeBoardId ? 'text-blue-700' : 'text-slate-800'}`}>
                        {b.name}
                      </span>
                      {b.description && (
                        <span className="text-[10.5px] text-slate-400 truncate mt-0.5">
                          {b.description}
                        </span>
                      )}
                    </div>
                    {b.id === activeBoardId && (
                      <Check className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    )}
                  </button>
                ))}
              </div>

              {/* Bottom Actions */}
              <div className="p-1.5 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl space-y-1">
                {onAddBoard && (
                  <button
                    onClick={() => {
                      onAddBoard('New Landscape');
                      setShowBoardMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-white text-slate-700 font-medium text-xs transition-colors border border-transparent hover:border-slate-200"
                  >
                    <Plus className="w-3.5 h-3.5 text-blue-600" />
                    <span>+ New Empty Landscape</span>
                  </button>
                )}
                {onOpenTemplates && (
                  <button
                    onClick={() => {
                      onOpenTemplates();
                      setShowBoardMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-white text-slate-700 font-medium text-xs transition-colors border border-transparent hover:border-slate-200"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Explore Templates & Demos</span>
                  </button>
                )}
                {onOpenClearLandscape && (
                  <button
                    onClick={() => {
                      if ((totalItemsInLandscape ?? 1) > 0) {
                        onOpenClearLandscape();
                        setShowBoardMenu(false);
                      }
                    }}
                    disabled={(totalItemsInLandscape ?? 1) === 0}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-rose-50 text-slate-600 hover:text-rose-700 font-medium text-xs transition-colors border border-transparent hover:border-rose-100 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-slate-600 cursor-pointer disabled:cursor-not-allowed"
                    title={(totalItemsInLandscape ?? 1) === 0 ? 'Nothing to clear in this landscape' : 'Clear all thoughts, clusters and relationships from this landscape'}
                  >
                    <Trash2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>Clear Landscape</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* PRIMARY ACTIONS: [+ Add Thought] and [✨ AI] */}
        <div className="flex items-center gap-1.5 ml-1">
          {/* Primary Action Button: + Add Thought */}
          {onAddNote && (
            <button
              onClick={onAddNote}
              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white text-xs font-semibold shadow-xs shadow-blue-600/20 transition-all flex items-center gap-1.5 shrink-0"
              title="Add a new thought note (N)"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="font-semibold">Add Thought</span>
            </button>
          )}

          {/* AI Feature Action: ✨ AI */}
          {onOpenMcpModal && (
            <button
              onClick={onOpenMcpModal}
              className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-50/90 to-indigo-50/90 hover:from-blue-100 hover:to-indigo-100 text-blue-700 hover:text-blue-800 border border-blue-200/80 text-xs font-semibold shadow-2xs transition-all flex items-center gap-1.5 shrink-0"
              title="AI Concept Maps, Synthesis & Suggestions"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>AI</span>
            </button>
          )}
        </div>
      </div>

      {/* ================= RIGHT / UTILITIES & CONTROLS ================= */}
      <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
        {/* Subtle Saved Status (Non-button indicator) */}
        <div className="hidden xl:flex items-center gap-1.5 px-2 py-1 text-[11px] text-slate-400 font-medium">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              saveStatus === 'saved' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'
            }`}
          />
          <span>{saveStatus === 'saved' ? 'Saved locally' : 'Saving…'}</span>
        </div>

        {/* Find Button (⌕ Find) */}
        {onOpenSearch && (
          <button
            data-tutorial="search-btn"
            onClick={onOpenSearch}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-1.5 text-xs font-medium"
            title="Search thoughts (Cmd + F)"
          >
            <Search className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden lg:inline">Find</span>
          </button>
        )}

        {/* Command Palette Button [⌘K] */}
        <button
          data-tutorial="command-palette-btn"
          onClick={onOpenCommandPalette}
          className="p-1.5 sm:px-2 sm:py-1.5 rounded-xl hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-1 text-xs font-medium"
          title="Command palette (Cmd + K)"
        >
          <kbd className="bg-slate-100/90 hover:bg-slate-200 px-1.5 py-0.5 rounded text-[10.5px] text-slate-500 font-mono border border-slate-200/80 shadow-2xs">
            ⌘K
          </kbd>
        </button>

        {/* Organize Dropdown [Organize ▼] */}
        <div className="relative">
          <button
            onClick={() => {
              setShowOrganizeMenu(!showOrganizeMenu);
              setShowExportMenu(false);
              setShowBoardMenu(false);
              setShowViewMenu(false);
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl hover:bg-slate-100 text-slate-700 text-xs font-medium transition-colors"
            title="Smart Canvas Organization"
          >
            <LayoutGrid className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden md:inline">Organize</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showOrganizeMenu && (
            <div className="absolute right-0 top-full mt-1.5 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-50 text-xs flex flex-col animate-in zoom-in-95 duration-100">
              <div className="px-3.5 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                LAYOUT & STRUCTURE
              </div>
              <button
                onClick={() => {
                  onOrganize('grid');
                  setShowOrganizeMenu(false);
                }}
                className="flex items-center gap-2.5 px-3.5 py-2 hover:bg-slate-50 text-slate-700 text-left transition-colors"
              >
                <span>Grid Layout</span>
              </button>
              <button
                onClick={() => {
                  onOrganize('by_group');
                  setShowOrganizeMenu(false);
                }}
                className="flex items-center gap-2.5 px-3.5 py-2 hover:bg-slate-50 text-slate-700 text-left transition-colors"
              >
                <span>Organize by Clusters</span>
              </button>
              <button
                onClick={() => {
                  onOrganize('by_color');
                  setShowOrganizeMenu(false);
                }}
                className="flex items-center gap-2.5 px-3.5 py-2 hover:bg-slate-50 text-slate-700 text-left transition-colors"
              >
                <span>Organize by Color</span>
              </button>
              <button
                onClick={() => {
                  onOrganize('flow');
                  setShowOrganizeMenu(false);
                }}
                className="flex items-center gap-2.5 px-3.5 py-2 hover:bg-slate-50 text-slate-700 text-left transition-colors"
              >
                <span>Connection Flow Hierarchy</span>
              </button>
              <button
                onClick={() => {
                  onOrganize('scatter');
                  setShowOrganizeMenu(false);
                }}
                className="flex items-center gap-2.5 px-3.5 py-2 hover:bg-amber-50 text-amber-900 text-left font-medium transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Scatter for Brainstorming</span>
              </button>

              <div className="h-px bg-slate-100 my-1" />

              <div className="px-3.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                ALIGNMENT
              </div>
              <button
                onClick={() => {
                  onOrganize('align_horizontal');
                  setShowOrganizeMenu(false);
                }}
                className="flex items-center gap-2.5 px-3.5 py-2 hover:bg-slate-50 text-slate-700 text-left transition-colors"
              >
                <AlignHorizontalDistributeCenter className="w-3.5 h-3.5 text-slate-400" />
                <span>Align Horizontally</span>
              </button>
              <button
                onClick={() => {
                  onOrganize('align_vertical');
                  setShowOrganizeMenu(false);
                }}
                className="flex items-center gap-2.5 px-3.5 py-2 hover:bg-slate-50 text-slate-700 text-left transition-colors"
              >
                <AlignVerticalDistributeCenter className="w-3.5 h-3.5 text-slate-400" />
                <span>Align Vertically</span>
              </button>

              <div className="h-px bg-slate-100 my-1" />

              <button
                onClick={() => {
                  if (onOpenClearLandscape && (totalItemsInLandscape ?? 1) > 0) {
                    onOpenClearLandscape();
                    setShowOrganizeMenu(false);
                  }
                }}
                disabled={(totalItemsInLandscape ?? 1) === 0}
                className="flex items-center gap-2.5 px-3.5 py-2 hover:bg-rose-50 text-slate-700 hover:text-rose-700 text-left transition-colors disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-slate-700 cursor-pointer disabled:cursor-not-allowed"
                title={(totalItemsInLandscape ?? 1) === 0 ? 'Nothing to clear in this landscape' : 'Clear all thoughts, clusters and relationships from this landscape'}
              >
                <Trash2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Clear Landscape</span>
              </button>
            </div>
          )}
        </div>

        {/* Undo / Redo Compact Icon Group */}
        <div data-tutorial="undo-redo-btn" className="flex items-center gap-0.5">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent text-slate-600 transition-colors"
            title="Undo (Cmd + Z)"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent text-slate-600 transition-colors"
            title="Redo (Cmd + Shift + Z)"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="h-3.5 w-px bg-slate-200/90 mx-0.5 hidden sm:block" />

        {/* View Dropdown [View ▼] */}
        <div className="relative">
          <button
            onClick={() => {
              setShowViewMenu(!showViewMenu);
              setShowOrganizeMenu(false);
              setShowExportMenu(false);
              setShowBoardMenu(false);
            }}
            className="flex items-center gap-1 px-2 py-1.5 rounded-xl hover:bg-slate-100 text-slate-700 text-xs font-medium transition-colors"
            title="View & Atmosphere Settings"
          >
            <Eye className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden lg:inline">View</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showViewMenu && (
            <div className="absolute right-0 top-full mt-1.5 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-50 text-xs flex flex-col animate-in zoom-in-95 duration-100">
              <button
                onClick={() => {
                  onTogglePresentation();
                  setShowViewMenu(false);
                }}
                className="flex items-center gap-2.5 px-3.5 py-2 hover:bg-blue-50 text-slate-800 text-left transition-colors"
              >
                <Eye className="w-3.5 h-3.5 text-blue-600" />
                <span>Presentation Mode</span>
              </button>

              {onOpenEnvironmentModal && (
                <button
                  data-tutorial="environment-btn"
                  onClick={() => {
                    onOpenEnvironmentModal();
                    setShowViewMenu(false);
                  }}
                  className="flex items-center justify-between px-3.5 py-2 hover:bg-blue-50 text-slate-800 text-left transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Palette className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Environment Space</span>
                  </div>
                  <span className="text-[10px] text-slate-400">{activeEnvironmentName || 'White Wall'}</span>
                </button>
              )}

              <button
                onClick={() => {
                  onOpenSnapshots();
                  setShowViewMenu(false);
                }}
                className="flex items-center gap-2.5 px-3.5 py-2 hover:bg-blue-50 text-slate-800 text-left transition-colors"
              >
                <Camera className="w-3.5 h-3.5 text-slate-600" />
                <span>Daily Snapshots</span>
              </button>

              <div className="h-px bg-slate-100 my-1" />

              <button
                onClick={handleToggleSound}
                className="flex items-center justify-between px-3.5 py-2 hover:bg-slate-50 text-slate-700 text-left transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  {soundOn ? (
                    <Volume2 className="w-3.5 h-3.5 text-blue-600" />
                  ) : (
                    <VolumeX className="w-3.5 h-3.5 text-slate-400" />
                  )}
                  <span>Paper Sound Effects</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">{soundOn ? 'ON' : 'OFF'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Export Dropdown [Export ▼] */}
        <div className="relative">
          <button
            data-tutorial="export-btn"
            onClick={() => {
              setShowExportMenu(!showExportMenu);
              setShowOrganizeMenu(false);
              setShowBoardMenu(false);
              setShowViewMenu(false);
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200/80 text-slate-800 text-xs font-semibold shadow-2xs transition-colors"
            title="Export Thoughtscape"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden sm:inline">Export</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showExportMenu && (
            <div className="absolute right-0 top-full mt-1.5 w-60 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-50 text-xs flex flex-col animate-in zoom-in-95 duration-100">
              <button
                onClick={() => {
                  onOpenExportModal();
                  setShowExportMenu(false);
                }}
                className="flex items-center gap-2.5 px-3.5 py-2 hover:bg-blue-50 text-slate-800 text-left transition-colors"
              >
                <FileText className="w-4 h-4 text-blue-600" />
                <div>
                  <div className="font-semibold leading-tight">Export PDF / PNG</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Share or print your landscape</div>
                </div>
              </button>

              <div className="h-px bg-slate-100 my-1" />

              <button
                onClick={() => {
                  onExportJSON();
                  setShowExportMenu(false);
                }}
                className="flex items-center gap-2.5 px-3.5 py-2 hover:bg-emerald-50 text-slate-800 text-left transition-colors"
              >
                <FileDown className="w-4 h-4 text-emerald-600" />
                <div>
                  <div className="font-semibold leading-tight">Backup Landscape (JSON)</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Save complete landscape data</div>
                </div>
              </button>

              <button
                onClick={() => {
                  onImportJSON();
                  setShowExportMenu(false);
                }}
                className="flex items-center gap-2.5 px-3.5 py-2 hover:bg-purple-50 text-slate-800 text-left transition-colors"
              >
                <Upload className="w-4 h-4 text-purple-600" />
                <div>
                  <div className="font-semibold leading-tight">Restore Landscape (JSON)</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Load from backup file</div>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Interactive Guide Tour Button */}
        {onOpenGuide && (
          <button
            onClick={onOpenGuide}
            className="flex items-center gap-1 px-2 py-1.5 rounded-xl hover:bg-slate-100 text-slate-600 hover:text-slate-900 text-xs font-medium transition-colors"
            title="Interactive Guided Tour"
          >
            <BookOpen className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden xl:inline">Guide</span>
          </button>
        )}

        {/* Help Button (?) */}
        <button
          data-tutorial="help-btn"
          onClick={onOpenShortcuts}
          className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors flex items-center justify-center"
          title="Help & shortcuts (?)"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

