import { WorkspaceData, NoteColor, Board } from '../types';

const STORAGE_KEY = 'thoughtscape_workspace_v2';
const FALLBACK_WALL_KEY = 'wall_workspace_v2';
const LEGACY_STORAGE_KEY = 'sticknotes_workspace_v1';
const DB_NAME = 'ThoughtscapeLocalDB';
const DB_VERSION = 1;
const STORE_NAME = 'workspace';
const CURRENT_VERSION = 2;

export const DEFAULT_COLOR_MEANINGS: Record<NoteColor, string> = {
  yellow: 'General Overview',
  pink: 'Important & Urgent',
  green: 'Completed / Solution',
  blue: 'Concepts & Definitions',
  purple: 'Questions & Doubts',
  peach: 'Rules & Formulas',
  orange: 'Ideas & Brainstorm',
  red: 'Mistakes / Pitfalls',
  white: 'Neutral & Code',
};

const DEFAULT_BOARD_ID = 'landscape_main_default';

const DEFAULT_BOARDS: Board[] = [
  {
    id: DEFAULT_BOARD_ID,
    name: 'My Thoughtscape',
    description: 'Primary visual thinking landscape',
    isDefault: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
];

export const INITIAL_SAMPLE_WORKSPACE: WorkspaceData = {
  version: CURRENT_VERSION,
  appName: 'Thoughtscape',
  lastModified: Date.now(),
  boards: DEFAULT_BOARDS,
  activeBoardId: DEFAULT_BOARD_ID,
  notes: [
    {
      id: 'welcome_thought_1',
      boardId: DEFAULT_BOARD_ID,
      title: 'Welcome to Thoughtscape 👋',
      content: 'A landscape for your thoughts.\n\n• Click any thought to edit directly in-place\n• Drag to arrange thoughts across the space\n• Connect thoughts with relationship arrows\n• Cluster related concepts together\n\n[[Explore]] your new mental landscape!',
      type: 'concept',
      color: 'yellow',
      x: 300,
      y: 180,
      width: 270,
      height: 220,
      rotation: -1.2,
      zIndex: 1,
      tags: ['welcome', 'getting-started'],
      starred: true,
      pinned: false,
      learningState: 'understood',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: 'welcome_thought_2',
      boardId: DEFAULT_BOARD_ID,
      title: 'Physical Stationery Metaphor 📌',
      content: 'Click "+ Add Thought" in the bottom right or press "N" to place a thought!\n\nUse [[Thought Links]] to cross-reference concepts like [[Welcome to Thoughtscape 👋]].',
      type: 'idea',
      color: 'blue',
      x: 630,
      y: 180,
      width: 260,
      height: 210,
      rotation: 1.8,
      zIndex: 2,
      tags: ['tips', 'hotkeys'],
      starred: false,
      pinned: false,
      learningState: 'learning',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: 'welcome_thought_3',
      boardId: DEFAULT_BOARD_ID,
      title: 'Explore Mode & Power Tools ⚡',
      content: '• Infinite pan & zoom across your landscape\n• Command palette (Cmd + K)\n• Interactive Minimap\n• Multi-Landscape switching & Snapshots\n• Mistake journals & Code blocks\n• High-Res PNG & Multi-page PDF export',
      type: 'task',
      color: 'green',
      x: 460,
      y: 440,
      width: 280,
      height: 210,
      rotation: -0.6,
      zIndex: 3,
      tags: ['features'],
      starred: false,
      pinned: false,
      learningState: 'mastered',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  ],
  groups: [
    {
      id: 'welcome_cluster_1',
      boardId: DEFAULT_BOARD_ID,
      title: 'Getting Started Landscape',
      description: 'Your initial visual thinking space',
      color: 'blue',
      x: 260,
      y: 110,
      width: 680,
      height: 570,
      collapsed: false,
      locked: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  ],
  connections: [
    {
      id: 'welcome_conn_1',
      boardId: DEFAULT_BOARD_ID,
      sourceId: 'welcome_thought_1',
      targetId: 'welcome_thought_2',
      type: 'arrow',
      label: 'leads to',
      createdAt: Date.now(),
    },
    {
      id: 'welcome_conn_2',
      boardId: DEFAULT_BOARD_ID,
      sourceId: 'welcome_thought_2',
      targetId: 'welcome_thought_3',
      type: 'dashed',
      label: 'explore',
      createdAt: Date.now(),
    },
  ],
  stacks: [],
  trash: [],
  snapshots: [],
  colorMeanings: DEFAULT_COLOR_MEANINGS,
  canvasTransform: {
    x: 100,
    y: 50,
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
    // 1. Check current Thoughtscape v2 storage key in localStorage
    const rawV2 = localStorage.getItem(STORAGE_KEY);
    if (rawV2) {
      const parsed = JSON.parse(rawV2);
      if (parsed && typeof parsed === 'object') {
        return sanitizeWorkspaceData(parsed);
      }
    }

    // 2. Check previous Wall v2 storage
    const rawWall = localStorage.getItem(FALLBACK_WALL_KEY);
    if (rawWall) {
      const parsed = JSON.parse(rawWall);
      if (parsed && typeof parsed === 'object') {
        const migrated = sanitizeWorkspaceData(parsed);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
        return migrated;
      }
    }

    // 3. Check legacy v1 storage
    const rawV1 = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (rawV1) {
      const parsed = JSON.parse(rawV1);
      if (parsed && typeof parsed === 'object') {
        const migrated = sanitizeWorkspaceData(parsed);
        // Save to v2
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
  const boards: Board[] = Array.isArray(parsed.boards) && parsed.boards.length > 0
    ? parsed.boards
    : DEFAULT_BOARDS;

  const activeBoardId = parsed.activeBoardId || boards[0]?.id || DEFAULT_BOARD_ID;

  // Ensure every note has a boardId
  const notes = (Array.isArray(parsed.notes) ? parsed.notes : []).map((n) => ({
    ...n,
    boardId: n.boardId || activeBoardId,
    tags: Array.isArray(n.tags) ? n.tags : [],
    starred: Boolean(n.starred),
    pinned: Boolean(n.pinned),
    locked: Boolean(n.locked),
  }));

  const groups = (Array.isArray(parsed.groups) ? parsed.groups : []).map((g) => ({
    ...g,
    boardId: g.boardId || activeBoardId,
    collapsed: Boolean(g.collapsed),
    locked: Boolean(g.locked),
  }));

  const connections = (Array.isArray(parsed.connections) ? parsed.connections : []).map((c) => ({
    ...c,
    boardId: c.boardId || activeBoardId,
  }));

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
    colorMeanings: parsed.colorMeanings || DEFAULT_COLOR_MEANINGS,
    canvasTransform: parsed.canvasTransform || { x: 0, y: 0, scale: 1 },
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
  localStorage.removeItem(FALLBACK_WALL_KEY);
  localStorage.removeItem(LEGACY_STORAGE_KEY);
  openIndexedDB().then((db) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).clear();
  }).catch(() => {});
  return INITIAL_SAMPLE_WORKSPACE;
}
