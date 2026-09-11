import { WorkspaceData, NoteColor, Board, StickyNote, Group, Connection } from '../types';
import { DEMO_LANDSCAPES } from '../constants/demoLandscapes';

const STORAGE_KEY = 'thoughtscape_workspace_v3';
const FALLBACK_V2_KEY = 'thoughtscape_workspace_v2';
const FALLBACK_WALL_KEY = 'wall_workspace_v2';
const LEGACY_STORAGE_KEY = 'sticknotes_workspace_v1';
const DB_NAME = 'ThoughtscapeLocalDB';
const DB_VERSION = 2;
const STORE_NAME = 'workspace';
const CURRENT_VERSION = 3;

export const DEFAULT_COLOR_MEANINGS: Record<NoteColor, string> = {
  yellow: 'Ideas / Things to Explore',
  blue: 'Information / References',
  green: 'Tasks / Plans',
  pink: 'Important / Remember',
  purple: 'Questions / Reflections',
  peach: 'Personal Notes',
  orange: 'Brainstorm / Creative',
  red: 'Mistakes / Pitfalls',
  white: 'Code & Neutral',
};

export const DEFAULT_BOARDS: Board[] = DEMO_LANDSCAPES.map((d) => d.board);
export const DEFAULT_BOARD_ID = DEMO_LANDSCAPES[0].board.id; // 'landscape_welcome'

// Build initial sample notes, groups, and connections across all default demo landscapes
const INITIAL_DEMO_NOTES: StickyNote[] = DEMO_LANDSCAPES.flatMap((d) =>
  d.notes.map((n) => ({
    ...n,
    createdAt: 1726041600000,
    updatedAt: 1726041600000,
  }))
);

const INITIAL_DEMO_GROUPS: Group[] = DEMO_LANDSCAPES.flatMap((d) =>
  d.groups.map((g) => ({
    ...g,
    createdAt: 1726041600000,
    updatedAt: 1726041600000,
  }))
);

const INITIAL_DEMO_CONNECTIONS: Connection[] = DEMO_LANDSCAPES.flatMap((d) =>
  d.connections.map((c) => ({
    ...c,
    createdAt: 1726041600000,
  }))
);

export const INITIAL_SAMPLE_WORKSPACE: WorkspaceData = {
  version: CURRENT_VERSION,
  appName: 'Thoughtscape',
  lastModified: Date.now(),
  boards: DEFAULT_BOARDS,
  activeBoardId: DEFAULT_BOARD_ID,
  notes: INITIAL_DEMO_NOTES,
  groups: INITIAL_DEMO_GROUPS,
  connections: INITIAL_DEMO_CONNECTIONS,
  stacks: [],
  trash: [],
  snapshots: [],
  colorMeanings: DEFAULT_COLOR_MEANINGS,
  canvasTransform: {
    x: 40,
    y: 20,
    scale: 1,
  },
};

// IndexedDB Helper
function openIndexedDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Synchronous initial load with migration
export function loadWorkspace(): WorkspaceData {
  try {
    // 1. Check current Thoughtscape v3 storage key in localStorage
    const rawV3 = localStorage.getItem(STORAGE_KEY);
    if (rawV3) {
      const parsed = JSON.parse(rawV3);
      if (parsed && typeof parsed === 'object') {
        return sanitizeWorkspaceData(parsed);
      }
    }

    // 2. Check previous v2 storage
    const rawV2 = localStorage.getItem(FALLBACK_V2_KEY);
    if (rawV2) {
      const parsed = JSON.parse(rawV2);
      if (parsed && typeof parsed === 'object') {
        const migrated = sanitizeWorkspaceData(parsed);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
        return migrated;
      }
    }

    // 3. Check previous Wall v2 storage
    const rawWall = localStorage.getItem(FALLBACK_WALL_KEY);
    if (rawWall) {
      const parsed = JSON.parse(rawWall);
      if (parsed && typeof parsed === 'object') {
        const migrated = sanitizeWorkspaceData(parsed);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
        return migrated;
      }
    }

    // 4. Check legacy v1 storage
    const rawV1 = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (rawV1) {
      const parsed = JSON.parse(rawV1);
      if (parsed && typeof parsed === 'object') {
        const migrated = sanitizeWorkspaceData(parsed);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
        return migrated;
      }
    }

    return INITIAL_SAMPLE_WORKSPACE;
  } catch (error) {
    console.error('Error loading workspace from storage:', error);
    return INITIAL_SAMPLE_WORKSPACE;
  }
}

// Sanitize & migrate data
export function sanitizeWorkspaceData(parsed: Partial<WorkspaceData>): WorkspaceData {
  // If boards are missing or only contain the single legacy board, merge default demo boards
  let boards: Board[] = Array.isArray(parsed.boards) && parsed.boards.length > 0
    ? parsed.boards
    : DEFAULT_BOARDS;

  // Ensure default demo boards exist in the board list
  const existingBoardIds = new Set(boards.map((b) => b.id));
  const missingDemoBoards = DEFAULT_BOARDS.filter((db) => !existingBoardIds.has(db.id));
  if (missingDemoBoards.length > 0) {
    boards = [...boards, ...missingDemoBoards];
  }

  // Active board ID
  let activeBoardId = parsed.activeBoardId || boards[0]?.id || DEFAULT_BOARD_ID;
  if (activeBoardId === 'landscape_main_default' || activeBoardId === 'board_default') {
    activeBoardId = DEFAULT_BOARD_ID;
  }

  // Ensure every note has a valid boardId
  let notes: StickyNote[] = (Array.isArray(parsed.notes) ? parsed.notes : []).map((n) => ({
    ...n,
    boardId: n.boardId || activeBoardId,
    tags: Array.isArray(n.tags) ? n.tags : [],
    starred: Boolean(n.starred),
    pinned: Boolean(n.pinned),
    locked: Boolean(n.locked),
  }));

  let groups: Group[] = (Array.isArray(parsed.groups) ? parsed.groups : []).map((g) => ({
    ...g,
    boardId: g.boardId || activeBoardId,
    collapsed: Boolean(g.collapsed),
    locked: Boolean(g.locked),
  }));

  let connections: Connection[] = (Array.isArray(parsed.connections) ? parsed.connections : []).map((c) => ({
    ...c,
    boardId: c.boardId || activeBoardId,
  }));

  // If notes on the default welcome board are empty or only the 3 legacy welcome notes, seed with universal demo notes
  const welcomeNotes = notes.filter((n) => n.boardId === DEFAULT_BOARD_ID);
  const isLegacyDemoOnly = welcomeNotes.length === 0 || 
    (welcomeNotes.length <= 3 && welcomeNotes.some((n) => n.id.startsWith('welcome_thought_')));

  if (isLegacyDemoOnly) {
    // Filter out old legacy welcome notes and add new universal notes
    const otherNotes = notes.filter((n) => n.boardId !== DEFAULT_BOARD_ID && !n.id.startsWith('welcome_thought_'));
    const otherGroups = groups.filter((g) => g.boardId !== DEFAULT_BOARD_ID && !g.id.startsWith('welcome_cluster_'));
    const otherConns = connections.filter((c) => c.boardId !== DEFAULT_BOARD_ID && !c.id.startsWith('welcome_conn_'));

    // Re-seed demo content for demo boards that are currently empty
    const demoNotesToSeed = INITIAL_DEMO_NOTES.filter((dn) => {
      const hasNotesForBoard = otherNotes.some((on) => on.boardId === dn.boardId);
      return dn.boardId === DEFAULT_BOARD_ID || !hasNotesForBoard;
    });
    const demoGroupsToSeed = INITIAL_DEMO_GROUPS.filter((dg) => {
      const hasGroupsForBoard = otherGroups.some((og) => og.boardId === dg.boardId);
      return dg.boardId === DEFAULT_BOARD_ID || !hasGroupsForBoard;
    });
    const demoConnsToSeed = INITIAL_DEMO_CONNECTIONS.filter((dc) => {
      const hasConnsForBoard = otherConns.some((oc) => oc.boardId === dc.boardId);
      return dc.boardId === DEFAULT_BOARD_ID || !hasConnsForBoard;
    });

    notes = [...otherNotes, ...demoNotesToSeed];
    groups = [...otherGroups, ...demoGroupsToSeed];
    connections = [...otherConns, ...demoConnsToSeed];
  }

  const stacks = Array.isArray(parsed.stacks) ? parsed.stacks : [];
  const trash = Array.isArray(parsed.trash) ? parsed.trash : [];
  const snapshots = Array.isArray(parsed.snapshots) ? parsed.snapshots : [];

  return {
    version: CURRENT_VERSION,
    appName: 'Thoughtscape',
    lastModified: parsed.lastModified || Date.now(),
    boards,
    activeBoardId,
    notes,
    groups,
    connections,
    stacks,
    trash,
    snapshots,
    colorMeanings: {
      ...DEFAULT_COLOR_MEANINGS,
      ...(parsed.colorMeanings || {}),
    },
    canvasTransform: parsed.canvasTransform || { x: 40, y: 20, scale: 1 },
  };
}

// Save workspace to both localStorage (sync fast fallback) and IndexedDB (durable async storage)
export function saveWorkspace(data: WorkspaceData): boolean {
  try {
    const payload: WorkspaceData = {
      ...data,
      version: CURRENT_VERSION,
      appName: 'Thoughtscape',
      lastModified: Date.now(),
    };

    // Fast localStorage save
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));

    // Async IndexedDB durable save
    openIndexedDB()
      .then((db) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.put(payload, 'current_workspace');
      })
      .catch((idbErr) => {
        // Fallback already saved to localStorage
        console.warn('IndexedDB write warning:', idbErr);
      });

    return true;
  } catch (error) {
    console.error('Failed to save workspace:', error);
    return false;
  }
}

export function resetWorkspace(): WorkspaceData {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(FALLBACK_V2_KEY);
  localStorage.removeItem(FALLBACK_WALL_KEY);
  localStorage.removeItem(LEGACY_STORAGE_KEY);
  openIndexedDB().then((db) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).clear();
  }).catch(() => {});
  return INITIAL_SAMPLE_WORKSPACE;
}
