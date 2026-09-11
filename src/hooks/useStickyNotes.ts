import { useState, useCallback, useEffect, useRef } from 'react';
import {
  StickyNote,
  Group,
  Connection,
  NoteStack,
  Board,
  BoardSnapshot,
  TrashItem,
  NoteColor,
  NoteType,
  LearningState,
  WorkspaceData,
  ConnectionType,
  NoteVisualTheme,
  LandscapeEnvironmentSettings,
} from '../types';
import { loadWorkspace, saveWorkspace, DEFAULT_COLOR_MEANINGS } from '../utils/storage';
import { useHistory } from './useHistory';
import { organizeCanvas, OrganizeMode, generateConceptMap, scatterNotes } from '../utils/layout';
import { playPeelSound, playConnectSound } from '../utils/sound';
import { TEMPLATES } from '../constants/templates';

export function useStickyNotes() {
  const initialData = useRef<WorkspaceData>(loadWorkspace()).current;

  // Multi-board state
  const [boards, setBoards] = useState<Board[]>(initialData.boards);
  const [activeBoardId, setActiveBoardId] = useState<string>(initialData.activeBoardId);
  const [stacks, setStacks] = useState<NoteStack[]>(initialData.stacks || []);
  const [trash, setTrash] = useState<TrashItem[]>(initialData.trash || []);
  const [snapshots, setSnapshots] = useState<BoardSnapshot[]>(initialData.snapshots || []);

  const {
    state: historyState,
    pushState,
    undo: undoHistory,
    redo: redoHistory,
    canUndo,
    canRedo,
    setState: setHistoryState,
  } = useHistory({
    notes: initialData.notes,
    groups: initialData.groups,
    connections: initialData.connections,
  });

  const [colorMeanings, setColorMeanings] = useState<Record<NoteColor, string>>(
    initialData.colorMeanings || DEFAULT_COLOR_MEANINGS
  );
  const [favoriteEnvironments, setFavoriteEnvironments] = useState<string[]>(
    initialData.favoriteEnvironments || ['green-chalkboard', 'cork-board', 'wooden-study']
  );
  const [recentEnvironments, setRecentEnvironments] = useState<string[]>(
    initialData.recentEnvironments || ['white-wall']
  );
  const [globalNoteStyle, setGlobalNoteStyle] = useState<NoteVisualTheme>(
    initialData.globalNoteStyle || 'classic'
  );

  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);
  const [selectedStackId, setSelectedStackId] = useState<string | null>(null);
  const [focusedGroupId, setFocusedGroupId] = useState<string | null>(null);

  // Connecting mode state: holds source note ID when user is creating a connection
  const [connectingSourceId, setConnectingSourceId] = useState<string | null>(null);

  // Saving status
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const allNotes = historyState.notes;
  const allGroups = historyState.groups;
  const allConnections = historyState.connections;

  // Filter notes, groups, connections and stacks for currently active board
  const notes = allNotes.filter((n) => (n.boardId || boards[0]?.id) === activeBoardId);
  const groups = allGroups.filter((g) => (g.boardId || boards[0]?.id) === activeBoardId);
  const connections = allConnections.filter((c) => (c.boardId || boards[0]?.id) === activeBoardId);
  const activeStacks = stacks.filter((s) => (s.boardId || boards[0]?.id) === activeBoardId);

  // Current active board & environment settings
  const activeBoard = boards.find((b) => b.id === activeBoardId) || boards[0];
  const activeEnvironmentSettings: LandscapeEnvironmentSettings = activeBoard?.environmentSettings || {
    environmentId: 'white-wall',
    intensity: 'balanced',
    backgroundFocus: 'normal',
    noteStyle: globalNoteStyle,
    showGrid: true,
  };

  // Debounced auto-save effect
  useEffect(() => {
    setSaveStatus('saving');
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      saveWorkspace({
        version: 2,
        appName: 'Thoughtscape',
        lastModified: Date.now(),
        boards,
        activeBoardId,
        notes: allNotes,
        groups: allGroups,
        connections: allConnections,
        stacks,
        trash,
        snapshots,
        colorMeanings,
        favoriteEnvironments,
        recentEnvironments,
        globalNoteStyle,
      });
      setSaveStatus('saved');
    }, 600);

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [
    allNotes,
    allGroups,
    allConnections,
    boards,
    activeBoardId,
    stacks,
    trash,
    snapshots,
    colorMeanings,
    favoriteEnvironments,
    recentEnvironments,
    globalNoteStyle,
  ]);

  // Max Z-index calculation for active board
  const getMaxZIndex = useCallback(() => {
    return notes.reduce((max, n) => Math.max(max, n.zIndex || 1), 1);
  }, [notes]);

  // Board management
  const switchBoard = useCallback((boardId: string) => {
    setActiveBoardId(boardId);
    setSelectedNoteId(null);
    setSelectedGroupId(null);
    setSelectedConnectionId(null);
    setSelectedStackId(null);
    setFocusedGroupId(null);
  }, []);

  const addBoard = useCallback((name: string) => {
    const newBoard: Board = {
      id: `board_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setBoards((prev) => [...prev, newBoard]);
    setActiveBoardId(newBoard.id);
    return newBoard;
  }, []);

  const duplicateBoard = useCallback((boardId: string) => {
    const targetBoard = boards.find((b) => b.id === boardId);
    if (!targetBoard) return;

    const baseTime = Date.now();
    const newBoardId = `board_${baseTime}_${Math.random().toString(36).substring(2, 6)}`;
    const newBoard: Board = {
      id: newBoardId,
      name: `${targetBoard.name} (Copy)`,
      createdAt: baseTime,
      updatedAt: baseTime,
    };

    const idMap: Record<string, string> = {};
    const clonedNotes: StickyNote[] = allNotes
      .filter((n) => n.boardId === boardId)
      .map((n, idx) => {
        const newId = `note_${baseTime}_${idx}`;
        idMap[n.id] = newId;
        return {
          ...n,
          id: newId,
          boardId: newBoardId,
          createdAt: baseTime,
          updatedAt: baseTime,
        };
      });

    const clonedGroups: Group[] = allGroups
      .filter((g) => g.boardId === boardId)
      .map((g, idx) => ({
        ...g,
        id: `group_${baseTime}_${idx}`,
        boardId: newBoardId,
        createdAt: baseTime,
        updatedAt: baseTime,
      }));

    const clonedConns: Connection[] = allConnections
      .filter((c) => c.boardId === boardId)
      .map((c, idx) => ({
        ...c,
        id: `conn_${baseTime}_${idx}`,
        boardId: newBoardId,
        sourceId: idMap[c.sourceId] || c.sourceId,
        targetId: idMap[c.targetId] || c.targetId,
        createdAt: baseTime,
      }));

    setBoards((prev) => [...prev, newBoard]);
    pushState({
      notes: [...allNotes, ...clonedNotes],
      groups: [...allGroups, ...clonedGroups],
      connections: [...allConnections, ...clonedConns],
    });
    setActiveBoardId(newBoardId);
  }, [boards, allNotes, allGroups, allConnections, pushState]);

  const deleteBoard = useCallback((boardId: string) => {
    if (boards.length <= 1) return;
    const remainingBoards = boards.filter((b) => b.id !== boardId);
    setBoards(remainingBoards);
    const nextActive = remainingBoards[0].id;
    setActiveBoardId(nextActive);

    // Clean up notes on deleted board
    const nextNotes = allNotes.filter((n) => n.boardId !== boardId);
    const nextGroups = allGroups.filter((g) => g.boardId !== boardId);
    const nextConns = allConnections.filter((c) => c.boardId !== boardId);

    pushState({ notes: nextNotes, groups: nextGroups, connections: nextConns });
  }, [boards, allNotes, allGroups, allConnections, pushState]);

  // Create note
  const addNote = useCallback(
    (
      options: Partial<StickyNote> & { color?: NoteColor; x?: number; y?: number } = {}
    ): StickyNote => {
      playPeelSound();
      const maxZ = getMaxZIndex();
      const randomRotation = Number((Math.random() * 4 - 2).toFixed(1)); // -2deg to +2deg

      const newNote: StickyNote = {
        id: `note_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        boardId: activeBoardId,
        type: options.type || 'normal',
        title: options.title || '',
        content: options.content || '',
        color: options.color || 'yellow',
        x: options.x !== undefined ? options.x : 400 + Math.random() * 80 - 40,
        y: options.y !== undefined ? options.y : 300 + Math.random() * 80 - 40,
        width: options.width || 260,
        height: options.height || 210,
        rotation: options.rotation !== undefined ? options.rotation : randomRotation,
        zIndex: maxZ + 1,
        tags: options.tags || [],
        starred: options.starred || false,
        pinned: options.pinned || false,
        locked: options.locked || false,
        groupId: options.groupId,
        learningState: options.learningState,
        codeLanguage: options.codeLanguage || 'javascript',
        taskItems: options.taskItems || (options.type === 'task' ? [{ id: '1', text: 'First task item', completed: false }] : undefined),
        mistakeDetails: options.mistakeDetails,
        quoteAuthor: options.quoteAuthor,
        referenceUrl: options.referenceUrl,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const nextNotes = [...allNotes, newNote];
      pushState({ notes: nextNotes, groups: allGroups, connections: allConnections });
      setSelectedNoteId(newNote.id);
      return newNote;
    },
    [allNotes, allGroups, allConnections, activeBoardId, getMaxZIndex, pushState]
  );

  // Update note
  const updateNote = useCallback(
    (id: string, updates: Partial<StickyNote>, commitHistory = true) => {
      const updatedNotes = allNotes.map((n) =>
        n.id === id ? { ...n, ...updates, updatedAt: Date.now() } : n
      );

      if (commitHistory) {
        pushState({ notes: updatedNotes, groups: allGroups, connections: allConnections });
      } else {
        setHistoryState({ notes: updatedNotes, groups: allGroups, connections: allConnections });
      }
    },
    [allNotes, allGroups, allConnections, pushState, setHistoryState]
  );

  // Delete note (with trash bin backup)
  const deleteNote = useCallback(
    (id: string) => {
      const target = allNotes.find((n) => n.id === id);
      if (target) {
        setTrash((prev) => [
          {
            id: `trash_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            boardId: target.boardId || activeBoardId,
            itemType: 'note',
            title: target.title || target.content.slice(0, 25) || 'Sticky Note',
            deletedAt: Date.now(),
            data: target,
          },
          ...prev,
        ]);
      }

      const nextNotes = allNotes.filter((n) => n.id !== id);
      const nextConnections = allConnections.filter(
        (c) => c.sourceId !== id && c.targetId !== id
      );

      pushState({ notes: nextNotes, groups: allGroups, connections: nextConnections });
      if (selectedNoteId === id) setSelectedNoteId(null);
    },
    [allNotes, allGroups, allConnections, activeBoardId, selectedNoteId, pushState]
  );

  // Duplicate note
  const duplicateNote = useCallback(
    (id: string) => {
      const target = allNotes.find((n) => n.id === id);
      if (!target) return;

      playPeelSound();
      const maxZ = getMaxZIndex();
      const clone: StickyNote = {
        ...target,
        id: `note_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        boardId: activeBoardId,
        x: target.x + 30,
        y: target.y + 30,
        rotation: Number((Math.random() * 4 - 2).toFixed(1)),
        zIndex: maxZ + 1,
        title: target.title ? `${target.title} (Copy)` : '',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      pushState({ notes: [...allNotes, clone], groups: allGroups, connections: allConnections });
      setSelectedNoteId(clone.id);
    },
    [allNotes, allGroups, allConnections, activeBoardId, getMaxZIndex, pushState]
  );

  // Toggle star
  const toggleStar = useCallback(
    (id: string) => {
      const note = allNotes.find((n) => n.id === id);
      if (note) updateNote(id, { starred: !note.starred });
    },
    [allNotes, updateNote]
  );

  // Toggle pin
  const togglePin = useCallback(
    (id: string) => {
      const note = allNotes.find((n) => n.id === id);
      if (note) updateNote(id, { pinned: !note.pinned });
    },
    [allNotes, updateNote]
  );

  // Toggle lock note
  const toggleLockNote = useCallback(
    (id: string) => {
      const note = allNotes.find((n) => n.id === id);
      if (note) updateNote(id, { locked: !note.locked });
    },
    [allNotes, updateNote]
  );

  // Change learning state
  const changeLearningState = useCallback(
    (id: string, learningState: LearningState) => {
      updateNote(id, { learningState });
    },
    [updateNote]
  );

  // Change color
  const changeNoteColor = useCallback(
    (id: string, color: NoteColor) => {
      updateNote(id, { color });
    },
    [updateNote]
  );

  // Change type
  const changeNoteType = useCallback(
    (id: string, type: NoteType) => {
      const note = allNotes.find((n) => n.id === id);
      if (!note) return;

      const updates: Partial<StickyNote> = { type };
      if (type === 'task' && (!note.taskItems || note.taskItems.length === 0)) {
        const lines = note.content.split('\n').filter((l) => l.trim().length > 0);
        if (lines.length > 0) {
          updates.taskItems = lines.map((l, idx) => ({
            id: String(idx + 1),
            text: l.replace(/^[-•*]\s*/, ''),
            completed: false,
          }));
        } else {
          updates.taskItems = [{ id: '1', text: 'New task item', completed: false }];
        }
      } else if (type === 'mistake' && !note.mistakeDetails) {
        updates.mistakeDetails = {
          whatIDid: note.content || '',
          whyWrong: '',
          correctApproach: '',
          howToAvoid: '',
        };
      }
      updateNote(id, updates);
    },
    [allNotes, updateNote]
  );

  // Z-index manipulation
  const bringToFront = useCallback(
    (id: string) => {
      const maxZ = getMaxZIndex();
      updateNote(id, { zIndex: maxZ + 1 });
    },
    [getMaxZIndex, updateNote]
  );

  const sendToBack = useCallback(
    (id: string) => {
      const minZ = allNotes.reduce((min, n) => Math.min(min, n.zIndex || 1), 1);
      updateNote(id, { zIndex: Math.max(1, minZ - 1) });
    },
    [allNotes, updateNote]
  );

  // Group operations
  const addGroup = useCallback(
    (title = 'New Section', color: NoteColor = 'blue', x = 200, y = 200) => {
      const newGroup: Group = {
        id: `group_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        boardId: activeBoardId,
        title,
        color,
        x,
        y,
        width: 620,
        height: 460,
        collapsed: false,
        locked: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      pushState({ notes: allNotes, groups: [...allGroups, newGroup], connections: allConnections });
      setSelectedGroupId(newGroup.id);
      return newGroup;
    },
    [allNotes, allGroups, allConnections, activeBoardId, pushState]
  );

  const updateGroup = useCallback(
    (id: string, updates: Partial<Group>, commitHistory = true) => {
      const updatedGroups = allGroups.map((g) =>
        g.id === id ? { ...g, ...updates, updatedAt: Date.now() } : g
      );

      if (commitHistory) {
        pushState({ notes: allNotes, groups: updatedGroups, connections: allConnections });
      } else {
        setHistoryState({ notes: allNotes, groups: updatedGroups, connections: allConnections });
      }
    },
    [allNotes, allGroups, allConnections, pushState, setHistoryState]
  );

  const deleteGroup = useCallback(
    (id: string) => {
      const target = allGroups.find((g) => g.id === id);
      if (target) {
        setTrash((prev) => [
          {
            id: `trash_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            boardId: target.boardId || activeBoardId,
            itemType: 'group',
            title: `Section: ${target.title}`,
            deletedAt: Date.now(),
            data: target,
          },
          ...prev,
        ]);
      }

      const nextGroups = allGroups.filter((g) => g.id !== id);
      const nextNotes = allNotes.map((n) => (n.groupId === id ? { ...n, groupId: undefined } : n));

      pushState({ notes: nextNotes, groups: nextGroups, connections: allConnections });
      if (selectedGroupId === id) setSelectedGroupId(null);
    },
    [allNotes, allGroups, allConnections, activeBoardId, selectedGroupId, pushState]
  );

  // Connection operations
  const addConnection = useCallback(
    (sourceId: string, targetId: string, type: ConnectionType = 'arrow', label?: string) => {
      if (sourceId === targetId) return null;

      const existing = allConnections.find(
        (c) =>
          (c.sourceId === sourceId && c.targetId === targetId) ||
          (c.sourceId === targetId && c.targetId === sourceId)
      );
      if (existing) return existing;

      playConnectSound();
      const newConn: Connection = {
        id: `conn_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        boardId: activeBoardId,
        sourceId,
        targetId,
        type,
        label,
        createdAt: Date.now(),
      };

      pushState({ notes: allNotes, groups: allGroups, connections: [...allConnections, newConn] });
      setConnectingSourceId(null);
      return newConn;
    },
    [allNotes, allGroups, allConnections, activeBoardId, pushState]
  );

  const updateConnection = useCallback(
    (id: string, updates: Partial<Connection>) => {
      const nextConns = allConnections.map((c) => (c.id === id ? { ...c, ...updates } : c));
      pushState({ notes: allNotes, groups: allGroups, connections: nextConns });
    },
    [allNotes, allGroups, allConnections, pushState]
  );

  const deleteConnection = useCallback(
    (id: string) => {
      const nextConns = allConnections.filter((c) => c.id !== id);
      pushState({ notes: allNotes, groups: allGroups, connections: nextConns });
      if (selectedConnectionId === id) setSelectedConnectionId(null);
    },
    [allNotes, allGroups, allConnections, selectedConnectionId, pushState]
  );

  // Note Stack operations
  const createStack = useCallback(
    (title = 'Topic Stack', noteIds: string[], color: NoteColor = 'yellow', x = 300, y = 300) => {
      const newStack: NoteStack = {
        id: `stack_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        boardId: activeBoardId,
        title,
        color,
        x,
        y,
        noteIds,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      setStacks((prev) => [...prev, newStack]);
      return newStack;
    },
    [activeBoardId]
  );

  const updateStack = useCallback((id: string, updates: Partial<NoteStack>) => {
    setStacks((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  }, []);

  const deleteStack = useCallback((id: string) => {
    setStacks((prev) => prev.filter((s) => s.id !== id));
    if (selectedStackId === id) setSelectedStackId(null);
  }, [selectedStackId]);

  const takeOneFromStack = useCallback(
    (stackId: string) => {
      const targetStack = stacks.find((s) => s.id === stackId);
      if (!targetStack || targetStack.noteIds.length === 0) return;

      const topNoteId = targetStack.noteIds[0];
      const remainingNoteIds = targetStack.noteIds.slice(1);

      // Move top note off the stack
      updateNote(topNoteId, {
        x: targetStack.x + 300,
        y: targetStack.y + 20,
        zIndex: getMaxZIndex() + 1,
      });

      if (remainingNoteIds.length === 0) {
        deleteStack(stackId);
      } else {
        updateStack(stackId, { noteIds: remainingNoteIds });
      }
    },
    [stacks, getMaxZIndex, updateNote, deleteStack, updateStack]
  );

  const disbandStack = useCallback(
    (stackId: string) => {
      const targetStack = stacks.find((s) => s.id === stackId);
      if (!targetStack) return;

      targetStack.noteIds.forEach((noteId, idx) => {
        updateNote(noteId, {
          x: targetStack.x + (idx % 3) * 280,
          y: targetStack.y + Math.floor(idx / 3) * 240,
        });
      });

      deleteStack(stackId);
    },
    [stacks, updateNote, deleteStack]
  );

  // Smart Layouts
  const handleOrganize = useCallback(
    (mode: OrganizeMode) => {
      const { notes: organizedActiveNotes, groups: organizedActiveGroups } = organizeCanvas(
        notes,
        groups,
        connections,
        mode
      );

      // Merge back into allNotes
      const activeIds = new Set(organizedActiveNotes.map((n) => n.id));
      const nextNotes = [...allNotes.filter((n) => !activeIds.has(n.id)), ...organizedActiveNotes];

      const activeGroupIds = new Set(organizedActiveGroups.map((g) => g.id));
      const nextGroups = [...allGroups.filter((g) => !activeGroupIds.has(g.id)), ...organizedActiveGroups];

      pushState({ notes: nextNotes, groups: nextGroups, connections: allConnections });
    },
    [notes, groups, connections, allNotes, allGroups, allConnections, pushState]
  );

  // Concept Map from Selection
  const handleGenerateConceptMap = useCallback(() => {
    const targetNotes = selectedNoteId ? [notes.find((n) => n.id === selectedNoteId)!] : notes;
    const { notes: mappedNotes, connections: newConns } = generateConceptMap(
      targetNotes,
      selectedNoteId || undefined,
      { x: 600, y: 450 }
    );

    const activeIds = new Set(mappedNotes.map((n) => n.id));
    const nextNotes = [...allNotes.filter((n) => !activeIds.has(n.id)), ...mappedNotes];

    pushState({
      notes: nextNotes,
      groups: allGroups,
      connections: [...allConnections, ...newConns.map((c) => ({ ...c, boardId: activeBoardId }))],
    });
  }, [selectedNoteId, notes, allNotes, allGroups, allConnections, activeBoardId, pushState]);

  // Scatter Notes
  const handleScatterNotes = useCallback(() => {
    const scattered = scatterNotes(notes);
    const activeIds = new Set(scattered.map((n) => n.id));
    const nextNotes = [...allNotes.filter((n) => !activeIds.has(n.id)), ...scattered];

    pushState({ notes: nextNotes, groups: allGroups, connections: allConnections });
  }, [notes, allNotes, allGroups, allConnections, pushState]);

  // Snapshot operations
  const takeSnapshot = useCallback(
    (name: string) => {
      const newSnapshot: BoardSnapshot = {
        id: `snap_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        boardId: activeBoardId,
        name,
        timestamp: Date.now(),
        notesCount: notes.length,
        notes: notes.map((n) => ({ ...n })),
        groups: groups.map((g) => ({ ...g })),
        connections: connections.map((c) => ({ ...c })),
        stacks: activeStacks.map((s) => ({ ...s })),
      };
      setSnapshots((prev) => [newSnapshot, ...prev]);
    },
    [activeBoardId, notes, groups, connections, activeStacks]
  );

  const restoreSnapshot = useCallback(
    (snapshot: BoardSnapshot) => {
      const otherBoardNotes = allNotes.filter((n) => n.boardId !== activeBoardId);
      const otherBoardGroups = allGroups.filter((g) => g.boardId !== activeBoardId);
      const otherBoardConns = allConnections.filter((c) => c.boardId !== activeBoardId);

      pushState({
        notes: [...otherBoardNotes, ...snapshot.notes],
        groups: [...otherBoardGroups, ...snapshot.groups],
        connections: [...otherBoardConns, ...snapshot.connections],
      });

      if (snapshot.stacks) {
        setStacks((prev) => [
          ...prev.filter((s) => s.boardId !== activeBoardId),
          ...snapshot.stacks!,
        ]);
      }
    },
    [allNotes, allGroups, allConnections, activeBoardId, pushState]
  );

  const deleteSnapshot = useCallback((snapshotId: string) => {
    setSnapshots((prev) => prev.filter((s) => s.id !== snapshotId));
  }, []);

  // Trash operations
  const restoreTrashItem = useCallback(
    (trashId: string) => {
      const item = trash.find((t) => t.id === trashId);
      if (!item) return;

      if (item.itemType === 'note') {
        const restoredNote = item.data as StickyNote;
        pushState({
          notes: [...allNotes, restoredNote],
          groups: allGroups,
          connections: allConnections,
        });
      } else if (item.itemType === 'group') {
        const restoredGroup = item.data as Group;
        pushState({
          notes: allNotes,
          groups: [...allGroups, restoredGroup],
          connections: allConnections,
        });
      }

      setTrash((prev) => prev.filter((t) => t.id !== trashId));
    },
    [trash, allNotes, allGroups, allConnections, pushState]
  );

  const emptyTrash = useCallback(() => {
    setTrash([]);
  }, []);

  // Template Loader
  const loadTemplate = useCallback(
    (templateId: string) => {
      const template = TEMPLATES.find((t) => t.id === templateId);
      if (!template) return;

      const baseTime = Date.now();
      const noteIdMap: Record<number, string> = {};

      const createdNotes: StickyNote[] = template.notes.map((n, idx) => {
        const id = `note_${baseTime}_${idx}`;
        noteIdMap[idx] = id;
        return {
          ...n,
          id,
          boardId: activeBoardId,
          createdAt: baseTime,
          updatedAt: baseTime,
        };
      });

      const createdGroups: Group[] = template.groups.map((g, idx) => ({
        ...g,
        id: `group_${baseTime}_${idx}`,
        boardId: activeBoardId,
        createdAt: baseTime,
        updatedAt: baseTime,
      }));

      const createdConnections: Connection[] = template.connections.map((c, idx) => ({
        id: `conn_${baseTime}_${idx}`,
        boardId: activeBoardId,
        sourceId: noteIdMap[c.sourceIndex],
        targetId: noteIdMap[c.targetIndex],
        type: c.type,
        label: c.label,
        createdAt: baseTime,
      }));

      const otherBoardNotes = allNotes.filter((n) => n.boardId !== activeBoardId);
      const otherBoardGroups = allGroups.filter((g) => g.boardId !== activeBoardId);
      const otherBoardConns = allConnections.filter((c) => c.boardId !== activeBoardId);

      pushState({
        notes: [...otherBoardNotes, ...createdNotes],
        groups: [...otherBoardGroups, ...createdGroups],
        connections: [...otherBoardConns, ...createdConnections],
      });
      setSelectedNoteId(null);
    },
    [allNotes, allGroups, allConnections, activeBoardId, pushState]
  );

  // Today session notes
  const createTodayNotes = useCallback(() => {
    const today = new Date().toLocaleDateString(undefined, {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

    const startX = 300;
    const startY = 200;

    const group = addGroup(`${today} — Study Landscape`, 'purple', startX - 40, startY - 60);

    const note1 = addNote({
      title: `${today} Focus 🎯`,
      content: 'Key topics to conquer today:\n• \n• \n• ',
      type: 'task',
      color: 'blue',
      x: startX,
      y: startY,
      groupId: group.id,
      starred: true,
      learningState: 'learning',
    });

    const note2 = addNote({
      title: 'Questions & Curious Inquiries ❓',
      content: 'What did I struggle to understand today?\n• ',
      type: 'question',
      color: 'purple',
      x: startX + 280,
      y: startY,
      groupId: group.id,
    });

    const note3 = addNote({
      title: 'Takeaway & Insights 💡',
      content: 'Summarize core mental model in 2 sentences:',
      type: 'idea',
      color: 'yellow',
      x: startX + 140,
      y: startY + 240,
      groupId: group.id,
      learningState: 'understood',
    });

    addConnection(note1.id, note3.id, 'arrow', 'synthesizes');
    addConnection(note2.id, note3.id, 'dashed', 'answers');
  }, [addGroup, addNote, addConnection]);

  // Restore imported data
  const restoreWorkspace = useCallback(
    (data: WorkspaceData) => {
      setBoards(data.boards || [
        {
          id: 'board_main_default',
          name: 'My Thoughtscape',
          isDefault: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ]);
      setActiveBoardId(data.activeBoardId || data.boards?.[0]?.id || 'board_main_default');
      setStacks(data.stacks || []);
      setTrash(data.trash || []);
      setSnapshots(data.snapshots || []);

      pushState({
        notes: data.notes || [],
        groups: data.groups || [],
        connections: data.connections || [],
      });
      if (data.colorMeanings) {
        setColorMeanings(data.colorMeanings);
      }
      if (data.favoriteEnvironments) {
        setFavoriteEnvironments(data.favoriteEnvironments);
      }
      if (data.recentEnvironments) {
        setRecentEnvironments(data.recentEnvironments);
      }
      if (data.globalNoteStyle) {
        setGlobalNoteStyle(data.globalNoteStyle);
      }
      setSelectedNoteId(null);
      setSelectedGroupId(null);
      setSelectedConnectionId(null);
      setSelectedStackId(null);
    },
    [pushState]
  );

  // Update landscape environment settings
  const updateLandscapeEnvironment = useCallback(
    (boardId: string, settings: LandscapeEnvironmentSettings) => {
      setBoards((prev) =>
        prev.map((b) => (b.id === boardId ? { ...b, environmentSettings: settings, updatedAt: Date.now() } : b))
      );

      // Track recents
      setRecentEnvironments((prev) => {
        const filtered = prev.filter((id) => id !== settings.environmentId);
        return [settings.environmentId, ...filtered].slice(0, 8);
      });
    },
    []
  );

  // Toggle favorite environment
  const toggleFavoriteEnvironment = useCallback((envId: string) => {
    setFavoriteEnvironments((prev) =>
      prev.includes(envId) ? prev.filter((id) => id !== envId) : [...prev, envId]
    );
  }, []);

  return {
    boards,
    activeBoardId,
    activeBoard,
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
    stacks: activeStacks,
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
    restoreWorkspace,
    undo: undoHistory,
    redo: redoHistory,
    canUndo,
    canRedo,
  };
}
