import React, { useState } from 'react';
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
} from 'lucide-react';
import { OrganizeMode } from '../../utils/layout';
import { isSoundEnabled, toggleSound } from '../../utils/sound';
import { Board, Group } from '../../types';
import { ThoughtscapeLogo } from '../common/ThoughtscapeLogo';

interface TopNavProps {
  boards: Board[];
  activeBoardId: string;
  groups: Group[];
  canUndo: boolean;
  canRedo: boolean;
  saveStatus: 'saved' | 'saving';
  isPresentationMode: boolean;
  activeEnvironmentName?: string;
  onOpenEnvironmentModal?: () => void;
  onSwitchBoard: (boardId: string) => void;
  onUndo: () => void;
  onRedo: () => void;
  onOpenSearch: () => void;
  onOpenCommandPalette: () => void;
  onToggleSidebar: () => void;
  onOrganize: (mode: OrganizeMode) => void;
  onTogglePresentation: () => void;
  onOpenExportModal: () => void;
  onExportJSON: () => void;
  onImportJSON: () => void;
  onOpenSnapshots: () => void;
  onOpenShortcuts: () => void;
  onOpenGuide?: () => void;
  onFocusGroup?: (groupId: string | null) => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  boards,
  activeBoardId,
  groups,
  canUndo,
  canRedo,
  saveStatus,
  isPresentationMode,
  activeEnvironmentName,
  onOpenEnvironmentModal,
  onSwitchBoard,
  onUndo,
  onRedo,
  onOpenSearch,
  onOpenCommandPalette,
  onToggleSidebar,
  onOrganize,
  onTogglePresentation,
  onOpenExportModal,
  onExportJSON,
  onImportJSON,
  onOpenSnapshots,
  onOpenShortcuts,
  onOpenGuide,
  onFocusGroup,
}) => {
  const [showOrganizeMenu, setShowOrganizeMenu] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showBoardMenu, setShowBoardMenu] = useState(false);
  const [presentationStep, setPresentationStep] = useState(0);
  const [soundOn, setSoundOn] = useState(isSoundEnabled());

  const activeBoard = boards.find((b) => b.id === activeBoardId) || boards[0];

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
        className="fixed top-4 inset-x-0 mx-auto w-fit z-50 flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-full text-white text-xs shadow-2xl animate-in slide-in-from-top-3 duration-200"
      >
        <span className="font-semibold text-blue-400">Presentation Mode</span>
        <div className="h-3 w-px bg-slate-700 mx-1" />

        {groups.length > 0 ? (
          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrevConcept}
              className="p-1 rounded-full hover:bg-white/10"
              title="Previous section"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-medium text-slate-200">
              {groups[presentationStep]?.title || 'Section'} ({presentationStep + 1}/{groups.length})
            </span>
            <button
              onClick={handleNextConcept}
              className="p-1 rounded-full hover:bg-white/10"
              title="Next section"
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
      data-export-ignore="true"
      className="fixed top-0 inset-x-0 h-14 bg-white/90 backdrop-blur-md border-b border-slate-200/80 z-40 px-4 flex items-center justify-between select-none"
    >
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
          title="Toggle Explorer Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Thoughtscape Brand Identity */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={onOpenGuide} title="Thoughtscape — A landscape for your thoughts">
          <ThoughtscapeLogo size={24} />
          <div>
            <h1 className="font-bold text-sm text-slate-900 tracking-tight leading-none">
              Thoughtscape
            </h1>
            <span className="text-[10px] text-blue-600 font-medium tracking-wide">
              A landscape for your thoughts
            </span>
          </div>
        </div>

        {/* Landscape Switcher Dropdown in Top Nav */}
        <div className="relative ml-2 hidden sm:block">
          <button
            onClick={() => setShowBoardMenu(!showBoardMenu)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200/80 text-xs font-semibold text-slate-700 transition-colors"
          >
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            <span>{activeBoard?.name || 'My Thoughtscape'}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showBoardMenu && (
            <div className="absolute left-0 top-full mt-1 w-52 bg-white rounded-xl shadow-2xl border border-slate-100 py-1 z-50 text-xs flex flex-col animate-in zoom-in-95 duration-100">
              <div className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                MY LANDSCAPES
              </div>
              {boards.map((b) => (
                <button
                  key={b.id}
                  onClick={() => {
                    onSwitchBoard(b.id);
                    setShowBoardMenu(false);
                  }}
                  className={`px-3 py-1.5 text-left transition-colors flex items-center justify-between ${
                    b.id === activeBoardId
                      ? 'bg-blue-50 text-blue-600 font-semibold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="truncate">{b.name}</span>
                  {b.id === activeBoardId && <span className="text-blue-600 font-bold">✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Save Status Badge */}
        <div className="hidden md:flex items-center gap-1.5 ml-2 px-2.5 py-1 bg-slate-100/80 text-slate-500 rounded-full text-[11px] font-medium border border-slate-200/60">
          <span
            className={`w-2 h-2 rounded-full ${
              saveStatus === 'saved' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'
            }`}
          />
          <span>{saveStatus === 'saved' ? '✓ Saved locally' : 'Saving...'}</span>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        {/* Quick Search Button */}
        {onOpenSearch && (
          <button
            data-tutorial="search-btn"
            onClick={onOpenSearch}
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors hidden sm:flex items-center gap-1.5 px-2.5 text-xs font-medium"
            title="Search your Thoughtscape (Cmd + F)"
          >
            <Search className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden lg:inline">Find</span>
          </button>
        )}

        {/* Command Palette Button */}
        <button
          data-tutorial="command-palette-btn"
          onClick={onOpenCommandPalette}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-600 text-xs font-medium transition-colors"
          title="Explore Thoughtscape (Cmd + K)"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span className="hidden md:inline">Command palette...</span>
          <kbd className="hidden md:inline-block bg-white px-1.5 py-0.5 rounded text-[10px] text-slate-400 font-mono shadow-2xs">
            ⌘K
          </kbd>
        </button>

        {/* Environment Personalization Button */}
        {onOpenEnvironmentModal && (
          <button
            data-tutorial="environment-btn"
            onClick={onOpenEnvironmentModal}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-medium transition-colors"
            title="Personalize Physical Environment Space (Chalkboard, Cork Board, Wooden Study...)"
          >
            <Palette className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden lg:inline">{activeEnvironmentName || 'Environment'}</span>
          </button>
        )}

        <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block" />

        {/* Undo / Redo */}
        <div data-tutorial="undo-redo-btn" className="flex items-center gap-0.5">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="p-1.5 rounded-xl hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent text-slate-600 transition-colors"
            title="Undo (Cmd + Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="p-1.5 rounded-xl hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent text-slate-600 transition-colors"
            title="Redo (Cmd + Shift + Z)"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>

        <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block" />

        {/* Organize Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowOrganizeMenu(!showOrganizeMenu)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl hover:bg-slate-100 text-slate-700 text-xs font-medium transition-colors"
            title="Smart Canvas Auto-Organization"
          >
            <LayoutGrid className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden md:inline">Organize</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showOrganizeMenu && (
            <div className="absolute right-0 top-full mt-1.5 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-50 text-xs flex flex-col animate-in zoom-in-95 duration-100">
              <button
                onClick={() => {
                  onOrganize('grid');
                  setShowOrganizeMenu(false);
                }}
                className="flex items-center gap-2 px-3 py-2 hover:bg-blue-50 text-slate-700 text-left"
              >
                <span>Grid Layout</span>
              </button>
              <button
                onClick={() => {
                  onOrganize('by_group');
                  setShowOrganizeMenu(false);
                }}
                className="flex items-center gap-2 px-3 py-2 hover:bg-blue-50 text-slate-700 text-left"
              >
                <span>Cluster by Sections</span>
              </button>
              <button
                onClick={() => {
                  onOrganize('by_color');
                  setShowOrganizeMenu(false);
                }}
                className="flex items-center gap-2 px-3 py-2 hover:bg-blue-50 text-slate-700 text-left"
              >
                <span>Organize by Color</span>
              </button>
              <button
                onClick={() => {
                  onOrganize('flow');
                  setShowOrganizeMenu(false);
                }}
                className="flex items-center gap-2 px-3 py-2 hover:bg-blue-50 text-slate-700 text-left"
              >
                <span>Connection Flow Hierarchy</span>
              </button>
              <button
                onClick={() => {
                  onOrganize('scatter');
                  setShowOrganizeMenu(false);
                }}
                className="flex items-center gap-2 px-3 py-2 hover:bg-amber-50 text-amber-900 text-left font-medium"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Scatter for Brainstorming</span>
              </button>
              <div className="h-px bg-slate-100 my-1" />
              <button
                onClick={() => {
                  onOrganize('align_horizontal');
                  setShowOrganizeMenu(false);
                }}
                className="flex items-center gap-2 px-3 py-2 hover:bg-blue-50 text-slate-700 text-left"
              >
                <span>Align Horizontally</span>
              </button>
              <button
                onClick={() => {
                  onOrganize('align_vertical');
                  setShowOrganizeMenu(false);
                }}
                className="flex items-center gap-2 px-3 py-2 hover:bg-blue-50 text-slate-700 text-left"
              >
                <span>Align Vertically</span>
              </button>
            </div>
          )}
        </div>

        {/* Presentation Mode */}
        <button
          onClick={onTogglePresentation}
          className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
          title="Presentation / Focus Mode (Hides UI)"
        >
          <Eye className="w-4 h-4" />
        </button>

        {/* Daily Snapshots */}
        <button
          onClick={onOpenSnapshots}
          className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
          title="Daily Snapshots"
        >
          <Camera className="w-4 h-4" />
        </button>

        {/* Export Dropdown */}
        <div className="relative">
          <button
            data-tutorial="export-btn"
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
            title="Export Thoughtscape"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
            <ChevronDown className="w-3 h-3 opacity-70" />
          </button>

          {showExportMenu && (
            <div className="absolute right-0 top-full mt-1.5 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 py-1.5 z-50 text-xs flex flex-col animate-in zoom-in-95 duration-100">
              <button
                onClick={() => {
                  onOpenExportModal();
                  setShowExportMenu(false);
                }}
                className="flex items-center gap-2.5 px-3 py-2 hover:bg-blue-50 text-slate-800 text-left"
              >
                <FileText className="w-4 h-4 text-blue-600" />
                <div>
                  <div className="font-medium leading-none">Export as PDF / PNG</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Share or print your landscape</div>
                </div>
              </button>

              <div className="h-px bg-slate-100 my-1" />

              <button
                onClick={() => {
                  onExportJSON();
                  setShowExportMenu(false);
                }}
                className="flex items-center gap-2.5 px-3 py-2 hover:bg-blue-50 text-slate-800 text-left"
              >
                <FileDown className="w-4 h-4 text-emerald-600" />
                <div>
                  <div className="font-medium leading-none">Backup Thoughtscape (JSON)</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Save complete landscape</div>
                </div>
              </button>

              <button
                onClick={() => {
                  onImportJSON();
                  setShowExportMenu(false);
                }}
                className="flex items-center gap-2.5 px-3 py-2 hover:bg-blue-50 text-slate-800 text-left"
              >
                <Upload className="w-4 h-4 text-purple-600" />
                <div>
                  <div className="font-medium leading-none">Restore Thoughtscape (JSON)</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Load from backup file</div>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Sound toggle, Guide & Shortcuts */}
        <div className="hidden sm:flex items-center gap-1">
          <button
            onClick={handleToggleSound}
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors"
            title={soundOn ? 'Paper sounds enabled (Click to mute)' : 'Paper sounds muted'}
          >
            {soundOn ? <Volume2 className="w-4 h-4 text-blue-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          </button>

          {onOpenGuide && (
            <button
              onClick={onOpenGuide}
              className="flex items-center gap-1 px-2 py-1 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold transition-colors"
              title="Interactive Technical Guide & Tour"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Guide</span>
            </button>
          )}

          <button
            data-tutorial="help-btn"
            onClick={onOpenShortcuts}
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors"
            title="Help & Learning Menu"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
