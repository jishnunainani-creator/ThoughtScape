import React, { useState, useRef, useCallback } from 'react';
import { useStickyNotes } from './hooks/useStickyNotes';
import { useCanvas } from './hooks/useCanvas';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useTutorial } from './hooks/useTutorial';
import { TopNav } from './components/navigation/TopNav';
import { Sidebar } from './components/navigation/Sidebar';
import { Canvas } from './components/canvas/Canvas';
import { Minimap } from './components/canvas/Minimap';
import { FloatingCreation } from './components/navigation/FloatingCreation';
import { CanvasControls } from './components/navigation/CanvasControls';
import { SearchModal } from './components/navigation/SearchModal';
import { CommandPaletteModal } from './components/modals/CommandPaletteModal';
import { SnapshotsModal } from './components/modals/SnapshotsModal';
import { ExportModal } from './components/modals/ExportModal';
import { TemplatesModal } from './components/modals/TemplatesModal';
import { ColorMeaningModal } from './components/modals/ColorMeaningModal';
import { ShortcutsModal } from './components/modals/ShortcutsModal';
import { TechnicalGuideModal } from './components/modals/TechnicalGuideModal';
import { EnvironmentModal } from './components/modals/EnvironmentModal';
import { McpIntegrationModal } from './components/modals/McpIntegrationModal';
import { FocusedThoughtModal } from './components/modals/FocusedThoughtModal';
import { CreateClusterModal } from './components/modals/CreateClusterModal';
import { ClearLandscapeModal } from './components/modals/ClearLandscapeModal';
import { useMcpSync } from './hooks/useMcpSync';
import { TutorialWelcomeModal } from './components/tutorial/TutorialWelcomeModal';
import { TutorialFinishModal } from './components/tutorial/TutorialFinishModal';
import { TutorialSpotlight } from './components/tutorial/TutorialSpotlight';
import { TutorialTooltip } from './components/tutorial/TutorialTooltip';
import { HelpMenuModal } from './components/tutorial/HelpMenuModal';
import { ContextMenu } from './components/common/ContextMenu';
import { ToastContainer } from './components/common/Toast';
import { NoteColor, NoteType, ContextMenuState, ToastMessage, StickyNote, EnvironmentDefinition } from './types';
import { getEnvironmentById } from './constants/environments';
import { exportWorkspaceJSON, importWorkspaceJSON } from './utils/export';

export function App() {
  const {
    boards,
    activeBoardId,
    activeEnvironmentSettings,
    favoriteEnvironments,
    recentEnvironments,
    globalNoteStyle,
    setGlobalNoteStyle,
    updateLandscapeEnvironment,
    toggleFavoriteEnvironment,
    notes,
    groups,
    connections,
    stacks,
    trash,
    snapshots,
    colorMeanings,
    setColorMeanings,
    selectedNoteId,
    setSelectedNoteId,
    selectedGroupId,
    setSelectedGroupId,
    selectedConnectionId,
    setSelectedConnectionId,
    selectedStackId,
    setSelectedStackId,
    focusedGroupId,
    setFocusedGroupId,
    connectingSourceId,
    setConnectingSourceId,
    saveStatus,
    switchBoard,
    addBoard,
    duplicateBoard,
    deleteBoard,
    addNote,
    updateNote,
    deleteNote,
    duplicateNote,
    toggleStar,
    togglePin,
    toggleLockNote,
    changeLearningState,
    changeNoteColor,
    changeNoteType,
    bringToFront,
    sendToBack,
    addGroup,
    updateGroup,
    deleteGroup,
    addConnection,
    updateConnection,
    deleteConnection,
    createStack,
    updateStack,
    deleteStack,
    takeOneFromStack,
    disbandStack,
    handleOrganize,
    handleGenerateConceptMap,
    handleScatterNotes,
    takeSnapshot,
    restoreSnapshot,
    deleteSnapshot,
    restoreTrashItem,
    emptyTrash,
    loadTemplate,
    createTodayNotes,
    clearLandscape,
    restoreWorkspace,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useStickyNotes();

  const {
    transform,
    isPanning,
    startPan,
    updatePan,
    endPan,
    zoomIn,
    zoomOut,
    zoomAtPoint,
    resetZoom,
    fitToNotes,
    centerOnNote,
    panToWorld,
    screenToWorld,
    canvasContainerRef,
  } = useCanvas();

  // Modals and UI state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isSnapshotsOpen, setIsSnapshotsOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [isClearLandscapeModalOpen, setIsClearLandscapeModalOpen] = useState(false);
  const [isCreateClusterModalOpen, setIsCreateClusterModalOpen] = useState(false);
  const [clusterSpawnPos, setClusterSpawnPos] = useState<{ x: number; y: number } | null>(null);
  const [isEnvironmentModalOpen, setIsEnvironmentModalOpen] = useState(false);
  const [isMcpModalOpen, setIsMcpModalOpen] = useState(false);
  const [focusedThoughtId, setFocusedThoughtId] = useState<string | null>(null);
  const [previewEnvironment, setPreviewEnvironment] = useState<EnvironmentDefinition | null>(null);
  const [isColorMeaningOpen, setIsColorMeaningOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isHelpMenuOpen, setIsHelpMenuOpen] = useState(false);
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [showMinimap, setShowMinimap] = useState(true);

  const handleOpenCreateCluster = useCallback((pos?: { x: number; y: number }) => {
    const targetPos = pos || screenToWorld(window.innerWidth / 2, window.innerHeight / 2);
    setClusterSpawnPos(targetPos);
    setIsCreateClusterModalOpen(true);
  }, [screenToWorld]);

  // Active Environment resolution (with live preview capability)
  const activeEnvironment = previewEnvironment || getEnvironmentById(activeEnvironmentSettings.environmentId);

  // Guided Spotlight Tutorial Controller
  const tutorial = useTutorial({
    notes,
    addNote,
    deleteNote,
    addGroup,
    deleteGroup,
    addConnection,
    deleteConnection,
    centerOnNote,
  });

  // Intercept note update for tutorial action detection
  const handleUpdateNote = useCallback(
    (id: string, updates: Partial<StickyNote>, recordHistory = true) => {
      updateNote(id, updates, recordHistory);
      if (updates.x !== undefined || updates.y !== undefined) {
        tutorial.notifyNoteDragged(id);
      }
      if (updates.width !== undefined || updates.height !== undefined) {
        tutorial.notifyNoteResized(id);
      }
    },
    [updateNote, tutorial]
  );

  // Filter state (from sidebar)
  const [activeFilter, setActiveFilter] = useState<{
    type?: NoteType | 'all' | 'starred' | 'locked';
    tag?: string;
    color?: NoteColor;
    groupId?: string;
  } | null>(null);

  // Context Menu state
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    isOpen: false,
    x: 0,
    y: 0,
    targetType: 'canvas',
  });

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const showToast = useCallback(
    (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info', action?: { label: string; onClick: () => void }) => {
      const id = String(Date.now() + Math.random());
      setToasts((prev) => [...prev, { id, message, type, action }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3500);
    },
    []
  );

  // Real-time MCP Server Sync & Live ChatGPT Bridge
  const {
    isConnected: isMcpConnected,
    serverUrl: mcpServerUrl,
    activityLogs: mcpActivityLogs,
    isGenerating: isAiGenerating,
    executeAiPrompt,
    reconnect: reconnectMcp,
  } = useMcpSync({
    boards,
    activeBoardId,
    selectedNoteId,
    selectedGroupId,
    notes,
    groups,
    connections,
    onWorkspaceUpdate: (incomingData) => {
      restoreWorkspace(incomingData);
    },
    onShowToast: (msg, type) => {
      showToast(msg, type);
    },
  });

  // Filtered Notes
  const displayedNotes = notes.filter((n) => {
    if (!activeFilter) return true;
    if (activeFilter.type === 'starred') return n.starred;
    if (activeFilter.type === 'locked') return n.locked;
    if (activeFilter.type && activeFilter.type !== 'all') return n.type === activeFilter.type;
    if (activeFilter.tag) return n.tags.includes(activeFilter.tag);
    if (activeFilter.color) return n.color === activeFilter.color;
    if (activeFilter.groupId) return n.groupId === activeFilter.groupId;
    return true;
  });

  // Navigate directly to note by Title or ID
  const handleNavigateToNote = useCallback(
    (targetTitleOrId: string) => {
      const clean = targetTitleOrId.trim();
      const target =
        notes.find((n) => n.id === clean) ||
        notes.find((n) => n.title && n.title.toLowerCase() === clean.toLowerCase()) ||
        notes.find((n) => n.title && n.title.toLowerCase().includes(clean.toLowerCase()));

      if (target) {
        setSelectedNoteId(target.id);
        centerOnNote(target);
        showToast(`Jumped to "${target.title || 'Thought'}"`, 'info');
      } else {
        showToast(`Thought "${targetTitleOrId}" not found`, 'warning');
      }
    },
    [notes, centerOnNote, setSelectedNoteId, showToast]
  );

  // Hotkeys
  useKeyboardShortcuts({
    onNewNote: () => {
      const centerWorld = screenToWorld(window.innerWidth / 2, window.innerHeight / 2);
      addNote({ x: centerWorld.x - 130, y: centerWorld.y - 105 });
      showToast('Created new thought', 'success');
    },
    onQuickCapture: () => {
      const centerWorld = screenToWorld(window.innerWidth / 2, window.innerHeight / 2);
      addNote({ x: centerWorld.x - 130, y: centerWorld.y - 105, title: 'Quick Thought ⚡' });
      showToast('Quick thought captured', 'success');
    },
    onDelete: () => {
      if (selectedNoteId) {
        deleteNote(selectedNoteId);
        showToast('Thought deleted', 'info', {
          label: 'Undo',
          onClick: () => {
            if (canUndo) undo();
          },
        });
      } else if (selectedGroupId) {
        deleteGroup(selectedGroupId);
        showToast('Cluster deleted', 'info');
      } else if (selectedConnectionId) {
        deleteConnection(selectedConnectionId);
        showToast('Connection deleted', 'info');
      } else if (selectedStackId) {
        deleteStack(selectedStackId);
        showToast('Thought stack deleted', 'info');
      }
    },
    onDuplicate: () => {
      if (selectedNoteId) {
        duplicateNote(selectedNoteId);
        showToast('Duplicated thought', 'success');
      }
    },
    onUndo: () => {
      if (canUndo) {
        undo();
        showToast('Undone', 'info');
      }
    },
    onRedo: () => {
      if (canRedo) {
        redo();
        showToast('Redone', 'info');
      }
    },
    onClearLandscape: () => {
      setIsClearLandscapeModalOpen(true);
    },
    onCommandPalette: () => setIsCommandPaletteOpen(true),
    onSearch: () => setIsSearchOpen(true),
    onFitView: () => fitToNotes(notes),
    onZoomIn: zoomIn,
    onZoomOut: zoomOut,
    onEscape: () => {
      setSelectedNoteId(null);
      setSelectedGroupId(null);
      setSelectedConnectionId(null);
      setSelectedStackId(null);
      setFocusedGroupId(null);
      setConnectingSourceId(null);
      setContextMenu((prev) => ({ ...prev, isOpen: false }));
      if (isPresentationMode) setIsPresentationMode(false);
      setIsSearchOpen(false);
      setIsCommandPaletteOpen(false);
      setIsSnapshotsOpen(false);
      setIsExportOpen(false);
      setIsTemplatesOpen(false);
      setIsClearLandscapeModalOpen(false);
      setIsColorMeaningOpen(false);
      setIsShortcutsOpen(false);
      setIsEnvironmentModalOpen(false);
      setIsMcpModalOpen(false);
      setPreviewEnvironment(null);
    },
  });

  const totalItemsInLandscape = notes.length + groups.length + connections.length;
  const currentBoard = boards.find((b) => b.id === activeBoardId) || boards[0];

  const handleClearLandscape = useCallback(() => {
    if (totalItemsInLandscape === 0) {
      showToast('Nothing to clear.', 'info');
      return;
    }
    clearLandscape();
    showToast('Landscape cleared', 'info', {
      label: 'Undo',
      onClick: () => {
        if (canUndo) {
          undo();
          showToast('Landscape restored', 'success');
        }
      },
    });
  }, [totalItemsInLandscape, clearLandscape, showToast, canUndo, undo]);

  // Connection flow start / end
  const handleStartConnection = (sourceId: string) => {
    setConnectingSourceId(sourceId);
    showToast('Click target thought to connect curved arrow', 'info');
  };

  const handleEndConnection = (targetId: string) => {
    if (connectingSourceId && connectingSourceId !== targetId) {
      addConnection(connectingSourceId, targetId, 'arrow');
      setConnectingSourceId(null);
      showToast('Connected thoughts with curved arrow', 'success');
    }
  };

  // Copy note text
  const handleCopyNoteText = (id: string) => {
    const note = notes.find((n) => n.id === id);
    if (!note) return;
    const fullText = `${note.title ? note.title + '\n\n' : ''}${note.content}`;
    navigator.clipboard.writeText(fullText).then(() => {
      showToast('Copied thought text to clipboard', 'success');
    });
  };

  // Bulk update notes positions from group move
  const handleUpdateNotePositions = (updatedNotes: StickyNote[]) => {
    updatedNotes.forEach((n) => {
      updateNote(n.id, { x: n.x, y: n.y }, false);
    });
  };

  // Context menu trigger
  const handleOpenContextMenu = (
    e: React.MouseEvent,
    type: 'canvas' | 'note' | 'group' | 'stack',
    targetId?: string
  ) => {
    setContextMenu({
      isOpen: true,
      x: e.clientX,
      y: e.clientY,
      targetType: type,
      targetId,
    });
  };

  // Export JSON
  const handleExportJSON = () => {
    exportWorkspaceJSON(
      {
        version: 2,
        appName: 'Thoughtscape',
        lastModified: Date.now(),
        boards,
        activeBoardId,
        notes,
        groups,
        connections,
        stacks,
        trash,
        snapshots,
        colorMeanings,
      },
      `thoughtscape-backup-${new Date().toISOString().split('T')[0]}.json`
    );
    showToast('Thoughtscape JSON exported', 'success');
  };

  // Import JSON
  const handleImportJSONClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await importWorkspaceJSON(file);
      restoreWorkspace(data);
      showToast('Thoughtscape restored successfully!', 'success');
      setTimeout(() => fitToNotes(data.notes), 150);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to import JSON file';
      showToast(message, 'error');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Spotlight search selection
  const handleSearchSelectNote = (note: StickyNote) => {
    setSelectedNoteId(note.id);
    centerOnNote(note);
    showToast(`Focused on "${note.title || 'Thought'}"`, 'info');
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#FAF9F6] text-slate-900 font-sans">
      {/* Hidden file input for JSON restore */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Top Navigation */}
      <TopNav
        boards={boards}
        activeBoardId={activeBoardId}
        groups={groups}
        totalItemsInLandscape={totalItemsInLandscape}
        canUndo={canUndo}
        canRedo={canRedo}
        saveStatus={saveStatus}
        isPresentationMode={isPresentationMode}
        activeEnvironmentName={activeEnvironment.name}
        isMcpConnected={isMcpConnected}
        onAddNote={() => {
          const centerWorld = screenToWorld(window.innerWidth / 2, window.innerHeight / 2);
          addNote({ x: centerWorld.x - 130, y: centerWorld.y - 105 });
        }}
        onOpenEnvironmentModal={() => setIsEnvironmentModalOpen(true)}
        onOpenMcpModal={() => setIsMcpModalOpen(true)}
        onSwitchBoard={switchBoard}
        onUndo={undo}
        onRedo={redo}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onOrganize={handleOrganize}
        onOpenClearLandscape={() => setIsClearLandscapeModalOpen(true)}
        onTogglePresentation={() => setIsPresentationMode(!isPresentationMode)}
        onOpenExportModal={() => setIsExportOpen(true)}
        onExportJSON={handleExportJSON}
        onImportJSON={handleImportJSONClick}
        onOpenSnapshots={() => setIsSnapshotsOpen(true)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        onOpenGuide={() => setIsHelpMenuOpen(true)}
        onFocusGroup={(gid) => setFocusedGroupId(gid)}
        onOpenTemplates={() => setIsTemplatesOpen(true)}
        onAddBoard={addBoard}
      />

      {/* Sidebar Explorer */}
      <Sidebar
        isOpen={isSidebarOpen && !isPresentationMode}
        notes={notes}
        groups={groups}
        boards={boards}
        activeBoardId={activeBoardId}
        trash={trash}
        colorMeanings={colorMeanings}
        selectedFilter={activeFilter?.type || activeFilter?.tag || activeFilter?.color || null}
        onClose={() => setIsSidebarOpen(false)}
        onSelectFilter={(filter) => {
          setActiveFilter(filter);
          if (filter) showToast('Filter applied', 'info');
        }}
        onSelectNote={(id) => {
          const target = notes.find((n) => n.id === id);
          if (target) handleSearchSelectNote(target);
        }}
        onSwitchBoard={switchBoard}
        onAddBoard={(name) => {
          addBoard(name);
          showToast(`Created new landscape "${name}"`, 'success');
        }}
        onDuplicateBoard={(bid) => {
          duplicateBoard(bid);
          showToast('Landscape duplicated', 'success');
        }}
        onDeleteBoard={(bid) => {
          deleteBoard(bid);
          showToast('Landscape deleted', 'info');
        }}
        onAddGroup={() => handleOpenCreateCluster()}
        onOpenTemplates={() => setIsTemplatesOpen(true)}
        onOpenSnapshots={() => setIsSnapshotsOpen(true)}
        onOpenEnvironmentModal={() => setIsEnvironmentModalOpen(true)}
        onOpenGuide={() => setIsHelpMenuOpen(true)}
        onCreateTodayNotes={() => {
          createTodayNotes();
          showToast('Created today session thoughts', 'success');
        }}
        onOpenColorMeaningModal={() => setIsColorMeaningOpen(true)}
        onRestoreTrashItem={(tid) => {
          restoreTrashItem(tid);
          showToast('Restored item from trash', 'success');
        }}
        onEmptyTrash={() => {
          emptyTrash();
          showToast('Trash emptied', 'info');
        }}
      />

      {/* Main Interactive Canvas */}
      <Canvas
        notes={displayedNotes}
        groups={groups}
        connections={connections}
        stacks={stacks}
        selectedNoteId={selectedNoteId}
        selectedGroupId={selectedGroupId}
        selectedConnectionId={selectedConnectionId}
        selectedStackId={selectedStackId}
        connectingSourceId={connectingSourceId}
        focusedGroupId={focusedGroupId}
        transform={transform}
        isPanning={isPanning}
        isPresentationMode={isPresentationMode}
        environment={activeEnvironment}
        environmentSettings={activeEnvironmentSettings}
        globalNoteStyle={globalNoteStyle}
        canvasContainerRef={canvasContainerRef}
        onSelectNote={(id) => {
          setSelectedNoteId(id);
          setSelectedGroupId(null);
          setSelectedConnectionId(null);
          setSelectedStackId(null);
        }}
        onSelectGroup={(id) => {
          setSelectedGroupId(id);
          setSelectedNoteId(null);
          setSelectedConnectionId(null);
          setSelectedStackId(null);
        }}
        onSelectConnection={(id) => {
          setSelectedConnectionId(id);
          setSelectedNoteId(null);
          setSelectedGroupId(null);
          setSelectedStackId(null);
        }}
        onSelectStack={(id) => {
          setSelectedStackId(id);
          setSelectedNoteId(null);
          setSelectedGroupId(null);
          setSelectedConnectionId(null);
        }}
        onUpdateNote={handleUpdateNote}
        onDeleteNote={deleteNote}
        onDuplicateNote={duplicateNote}
        onToggleStar={toggleStar}
        onTogglePin={togglePin}
        onToggleLockNote={toggleLockNote}
        onChangeLearningState={changeLearningState}
        onChangeNoteColor={changeNoteColor}
        onChangeNoteType={changeNoteType}
        onBringToFront={bringToFront}
        onSendToBack={sendToBack}
        onCopyNoteText={handleCopyNoteText}
        onUpdateGroup={updateGroup}
        onDeleteGroup={deleteGroup}
        onFocusGroup={(gid) => setFocusedGroupId(focusedGroupId === gid ? null : gid)}
        onUpdateNotePositions={handleUpdateNotePositions}
        onStartConnection={handleStartConnection}
        onEndConnection={handleEndConnection}
        onUpdateConnection={updateConnection}
        onDeleteConnection={deleteConnection}
        onUpdateStack={updateStack}
        onDeleteStack={deleteStack}
        onTakeOneFromStack={takeOneFromStack}
        onDisbandStack={disbandStack}
        onNavigateToNote={handleNavigateToNote}
        onFocusNote={(id) => setFocusedThoughtId(id)}
        onOpenContextMenu={handleOpenContextMenu}
        onCreateNote={(color) => {
          const centerWorld = screenToWorld(window.innerWidth / 2, window.innerHeight / 2);
          addNote({ color, x: centerWorld.x - 130, y: centerWorld.y - 105 });
          tutorial.notifyColorSelected(color);
        }}
        onOpenTemplates={() => setIsTemplatesOpen(true)}
        onStartPan={startPan}
        onUpdatePan={updatePan}
        onEndPan={endPan}
        onZoomAtPoint={zoomAtPoint}
        screenToWorld={screenToWorld}
      />

      {/* Interactive Minimap */}
      {showMinimap && !isPresentationMode && (
        <Minimap
          notes={notes}
          groups={groups}
          stacks={stacks}
          transform={transform}
          onPanToWorld={panToWorld}
        />
      )}

      {/* Active Filter Pill Badge */}
      {activeFilter && !isPresentationMode && (
        <div className="fixed top-16 left-6 z-30 flex items-center gap-2 bg-blue-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg animate-in slide-in-from-top-2 duration-150">
          <span>Filtering active</span>
          <button
            onClick={() => setActiveFilter(null)}
            className="hover:text-blue-200 ml-1 font-bold"
          >
            × Clear
          </button>
        </div>
      )}

      {/* Floating Sticky Note Creation Stack Button */}
      {!isPresentationMode && (
        <FloatingCreation
          onCreateNote={(color) => {
            const centerWorld = screenToWorld(window.innerWidth / 2, window.innerHeight / 2);
            addNote({ color, x: centerWorld.x - 130, y: centerWorld.y - 105 });
            tutorial.notifyColorSelected(color);
          }}
        />
      )}

      {/* Canvas Controls (Zoom, Fit All, Minimap toggle) */}
      {!isPresentationMode && (
        <div className="fixed bottom-6 left-64 z-30">
          <CanvasControls
            scale={transform.scale}
            showMinimap={showMinimap}
            onZoomIn={zoomIn}
            onZoomOut={zoomOut}
            onResetZoom={resetZoom}
            onFitAll={() => fitToNotes(notes)}
            onToggleMinimap={() => setShowMinimap(!showMinimap)}
          />
        </div>
      )}

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        notes={notes}
        groups={groups}
        onClose={() => setIsSearchOpen(false)}
        onSelectNote={handleSearchSelectNote}
      />

      {/* Command Palette Modal (Cmd + K) */}
      <CommandPaletteModal
        isOpen={isCommandPaletteOpen}
        notes={notes}
        boards={boards}
        activeBoardId={activeBoardId}
        onClose={() => setIsCommandPaletteOpen(false)}
        onCreateNote={(color) => {
          const centerWorld = screenToWorld(window.innerWidth / 2, window.innerHeight / 2);
          addNote({ color, x: centerWorld.x - 130, y: centerWorld.y - 105 });
          showToast('Created thought', 'success');
        }}
        onAddGroup={() => handleOpenCreateCluster()}
        onOrganize={handleOrganize}
        onGenerateConceptMap={handleGenerateConceptMap}
        onScatterNotes={handleScatterNotes}
        onFitAll={() => fitToNotes(notes)}
        onResetZoom={resetZoom}
        onTogglePresentation={() => setIsPresentationMode(!isPresentationMode)}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenExportModal={() => setIsExportOpen(true)}
        onExportJSON={handleExportJSON}
        onImportJSON={handleImportJSONClick}
        onOpenSnapshots={() => setIsSnapshotsOpen(true)}
        onOpenTemplates={() => setIsTemplatesOpen(true)}
        onOpenClearLandscape={() => setIsClearLandscapeModalOpen(true)}
        onOpenEnvironmentModal={() => setIsEnvironmentModalOpen(true)}
        onOpenMcpModal={() => setIsMcpModalOpen(true)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        onOpenGuide={() => setIsHelpMenuOpen(true)}
        onSwitchBoard={switchBoard}
        onSelectNote={handleSearchSelectNote}
      />

      {/* Snapshots Modal */}
      <SnapshotsModal
        isOpen={isSnapshotsOpen}
        snapshots={snapshots}
        onClose={() => setIsSnapshotsOpen(false)}
        onTakeSnapshot={(name) => {
          takeSnapshot(name);
          showToast(`Snapshot "${name}" saved`, 'success');
        }}
        onRestoreSnapshot={(snap) => {
          restoreSnapshot(snap);
          showToast(`Restored snapshot "${snap.name}"`, 'success');
          setTimeout(() => fitToNotes(snap.notes), 150);
        }}
        onDeleteSnapshot={(sid) => {
          deleteSnapshot(sid);
          showToast('Snapshot deleted', 'info');
        }}
      />

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        canvasLayerElement={document.getElementById('knowledge-canvas-layer')}
      />

      {/* ChatGPT & MCP Integration Modal */}
      <McpIntegrationModal
        isOpen={isMcpModalOpen}
        onClose={() => setIsMcpModalOpen(false)}
        isConnected={isMcpConnected}
        serverUrl={mcpServerUrl}
        activityLogs={mcpActivityLogs}
        onReconnect={reconnectMcp}
        activeLandscapeId={activeBoardId}
        activeLandscapeName={boards.find((b) => b.id === activeBoardId)?.name}
        boards={boards}
        onSelectLandscape={switchBoard}
        onExecuteAiPrompt={executeAiPrompt}
        isGenerating={isAiGenerating}
      />

      {/* Focused Thought Modal (Paper Magnify Experience) */}
      <FocusedThoughtModal
        note={notes.find((n) => n.id === focusedThoughtId) || null}
        allNotes={notes}
        isOpen={!!focusedThoughtId}
        canvasTransform={transform}
        onClose={() => setFocusedThoughtId(null)}
        onUpdateNote={(id, updates, commit) => updateNote(id, updates, commit)}
        onDeleteNote={(id) => deleteNote(id)}
        onDuplicateNote={(id) => duplicateNote(id)}
        onNavigateToNote={handleNavigateToNote}
        onSwitchFocusedNote={(id) => setFocusedThoughtId(id)}
        onOpenAiModal={() => setIsMcpModalOpen(true)}
      />

      {/* Environment Personalization Modal */}
      <EnvironmentModal
        isOpen={isEnvironmentModalOpen}
        onClose={() => {
          setIsEnvironmentModalOpen(false);
          setPreviewEnvironment(null);
        }}
        activeLandscapeName={boards.find((b) => b.id === activeBoardId)?.name || 'My Thoughtscape'}
        currentEnvironmentId={activeEnvironmentSettings.environmentId}
        currentSettings={activeEnvironmentSettings}
        favorites={favoriteEnvironments}
        recentEnvironments={recentEnvironments}
        onApplyEnvironment={(id, settings) => {
          updateLandscapeEnvironment(activeBoardId, settings);
          if (settings.noteStyle) {
            setGlobalNoteStyle(settings.noteStyle);
          }
          setPreviewEnvironment(null);
          showToast(`Applied ${getEnvironmentById(id).name} space`, 'success');
        }}
        onToggleFavorite={toggleFavoriteEnvironment}
        onLivePreview={(id) => {
          const env = getEnvironmentById(id);
          setPreviewEnvironment(env);
        }}
        onCancelPreview={() => setPreviewEnvironment(null)}
      />

      {/* Templates Modal */}
      <TemplatesModal
        isOpen={isTemplatesOpen}
        onClose={() => setIsTemplatesOpen(false)}
        onSelectTemplate={(tmplId) => {
          loadTemplate(tmplId);
          showToast('Loaded landscape template', 'success');
          setTimeout(() => fitToNotes(notes), 200);
        }}
      />

      {/* Create Cluster Modal */}
      <CreateClusterModal
        isOpen={isCreateClusterModalOpen}
        onClose={() => setIsCreateClusterModalOpen(false)}
        onCreate={(title, description, color) => {
          const pos = clusterSpawnPos || screenToWorld(window.innerWidth / 2, window.innerHeight / 2);
          addGroup(title, color, pos.x - 170, pos.y - 90, description);
          showToast(`Created cluster "${title}"`, 'success');
        }}
      />

      {/* Color Meaning Modal */}
      <ColorMeaningModal
        isOpen={isColorMeaningOpen}
        colorMeanings={colorMeanings}
        onClose={() => setIsColorMeaningOpen(false)}
        onSave={(meanings) => {
          setColorMeanings(meanings);
          showToast('Updated color meanings', 'success');
        }}
      />

      {/* Shortcuts Modal */}
      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      {/* Technical Guide Modal */}
      <TechnicalGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        onLoadTutorialTemplate={() => {
          loadTemplate('tutorial_guide');
          showToast('Loaded interactive tutorial landscape', 'success');
          setTimeout(() => fitToNotes(notes), 250);
        }}
      />

      {/* Interactive Tutorial Spotlight & Coach Mark Overlay */}
      <TutorialSpotlight
        targetSelector={tutorial.currentStep?.targetSelector || null}
        isActive={tutorial.isActive}
        padding={12}
        radius={16}
      />
      <TutorialTooltip
        step={tutorial.currentStep}
        currentStepIndex={tutorial.currentStepIndex}
        totalSteps={tutorial.totalSteps}
        isInteracted={tutorial.isInteracted}
        interactionSuccess={tutorial.interactionSuccess}
        onNext={tutorial.nextStep}
        onPrev={tutorial.prevStep}
        onSkip={tutorial.skipTour}
        isActive={tutorial.isActive}
      />

      {/* First-launch Welcome Modal */}
      <TutorialWelcomeModal
        isOpen={tutorial.showWelcome}
        onStartTour={tutorial.startTour}
        onSkipTour={tutorial.skipTour}
        onSelectLandscape={(boardId) => {
          switchBoard(boardId);
        }}
      />

      {/* Tutorial Completion Dialog */}
      <TutorialFinishModal
        isOpen={tutorial.showFinish}
        onFinish={tutorial.finishTour}
      />

      {/* Help & Tour Hub Modal */}
      <HelpMenuModal
        isOpen={isHelpMenuOpen}
        onClose={() => setIsHelpMenuOpen(false)}
        onStartTour={() => {
          setIsHelpMenuOpen(false);
          tutorial.startTour();
        }}
        onOpenShortcuts={() => {
          setIsHelpMenuOpen(false);
          setIsShortcutsOpen(true);
        }}
        onOpenColorMeaning={() => {
          setIsHelpMenuOpen(false);
          setIsColorMeaningOpen(true);
        }}
        onOpenTechnicalGuide={() => {
          setIsHelpMenuOpen(false);
          setIsGuideOpen(true);
        }}
        onResetTutorial={() => {
          setIsHelpMenuOpen(false);
          tutorial.resetTutorialProgress();
          showToast('Tutorial progress reset - starting tour', 'info');
        }}
      />

      {/* Clear Landscape Confirmation Modal */}
      <ClearLandscapeModal
        isOpen={isClearLandscapeModalOpen}
        onClose={() => setIsClearLandscapeModalOpen(false)}
        onConfirmClear={handleClearLandscape}
        landscapeName={currentBoard?.name || 'Current Landscape'}
        thoughtsCount={notes.length}
        clustersCount={groups.length}
        connectionsCount={connections.length}
      />

      {/* Context Menu */}
      <ContextMenu
        state={contextMenu}
        onClose={() => setContextMenu((prev) => ({ ...prev, isOpen: false }))}
        onCreateNote={(color, x, y) => addNote({ color, x, y })}
        onAddGroup={(x, y) => handleOpenCreateCluster({ x, y })}
        onDuplicateNote={duplicateNote}
        onDeleteNote={deleteNote}
        onToggleStar={toggleStar}
        onTogglePin={togglePin}
        onToggleLockNote={toggleLockNote}
        onChangeColor={changeNoteColor}
        onChangeType={changeNoteType}
        onStartConnection={handleStartConnection}
        onBringToFront={bringToFront}
        onSendToBack={sendToBack}
        onOrganize={handleOrganize}
        onResetZoom={resetZoom}
        onFitAll={() => fitToNotes(notes)}
        onTakeOneFromStack={takeOneFromStack}
        onDisbandStack={disbandStack}
        onCreateStack={createStack}
        screenToWorld={screenToWorld}
      />

      {/* Toasts */}
      <ToastContainer
        toasts={toasts}
        onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))}
      />
    </div>
  );
}

export default App;
