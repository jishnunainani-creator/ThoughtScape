import fs from 'node:fs';
import path from 'node:path';
import { EventEmitter } from 'node:events';
import { WorkspaceData, Board } from '../types/index.js';

export interface StorageChangeEvent {
  type:
    | 'note_created'
    | 'note_updated'
    | 'note_deleted'
    | 'group_created'
    | 'group_updated'
    | 'group_deleted'
    | 'connection_created'
    | 'connection_deleted'
    | 'thought_map_created'
    | 'landscape_cleared'
    | 'workspace_synced';
  landscapeId: string;
  data?: any;
  timestamp: number;
}

export class StorageProvider extends EventEmitter {
  private filePath: string;
  private data: WorkspaceData;
  private isDirty = false;
  private saveTimeout: NodeJS.Timeout | null = null;

  constructor(customPath?: string) {
    super();
    // Default storage path in project directory or user home
    this.filePath = customPath || path.resolve(process.cwd(), '.thoughtscape-workspace.json');
    this.data = this.loadInitialData();
  }

  private getDefaultWorkspace(): WorkspaceData {
    const defaultBoard: Board = {
      id: 'landscape_welcome',
      name: 'Welcome to Thoughtscape',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    return {
      version: 2,
      appName: 'Thoughtscape',
      lastModified: Date.now(),
      boards: [defaultBoard],
      activeBoardId: 'landscape_welcome',
      notes: [],
      groups: [],
      connections: [],
      stacks: [],
      trash: [],
      snapshots: [],
      colorMeanings: {
        yellow: 'Ideas / Things to Explore',
        blue: 'Information / References',
        pink: 'Important / Remember',
        green: 'Tasks / Plans',
        purple: 'Questions / Reflections',
        orange: 'Brainstorm / Creative',
        cyan: 'References',
        coral: 'Insights',
      },
    };
  }

  public resolveLandscape(targetId?: string, nameHint?: string): Board {
    if (!this.data.boards || !Array.isArray(this.data.boards)) {
      this.data.boards = [];
    }

    // 1. If targetId is provided, find by id or name
    if (targetId && typeof targetId === 'string' && targetId.trim()) {
      const clean = targetId.trim();

      // Exact ID match
      const exact = this.data.boards.find((b) => b.id === clean);
      if (exact) return exact;

      // Case-insensitive ID match
      const caseIdMatch = this.data.boards.find((b) => b.id.toLowerCase() === clean.toLowerCase());
      if (caseIdMatch) return caseIdMatch;

      // Case-insensitive Name match
      const nameMatch = this.data.boards.find((b) => b.name.toLowerCase() === clean.toLowerCase());
      if (nameMatch) return nameMatch;

      // If not found, dynamically register this board in the workspace
      const formatName = (str: string) => {
        if (nameHint && nameHint.trim()) return nameHint.trim();
        return str
          .replace(/^(landscape_|board_)/i, '')
          .replace(/[_-]/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase());
      };

      const newBoard: Board = {
        id: clean,
        name: formatName(clean),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      this.data.boards.push(newBoard);
      this.scheduleSave();
      return newBoard;
    }

    // 2. If targetId not provided, look for activeBoardId
    if (this.data.activeBoardId) {
      const active = this.data.boards.find((b) => b.id === this.data.activeBoardId);
      if (active) return active;
    }

    // 3. Fallback to first existing board
    if (this.data.boards.length > 0) {
      this.data.activeBoardId = this.data.boards[0].id;
      return this.data.boards[0];
    }

    // 4. Fallback create default board
    const defaultBoard: Board = {
      id: 'landscape_welcome',
      name: 'Welcome to Thoughtscape',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    this.data.boards.push(defaultBoard);
    this.data.activeBoardId = defaultBoard.id;
    this.scheduleSave();
    return defaultBoard;
  }

  public syncBoards(incomingBoards: Board[]): void {
    if (!Array.isArray(incomingBoards) || incomingBoards.length === 0) return;
    if (!this.data.boards || !Array.isArray(this.data.boards)) {
      this.data.boards = [];
    }

    const existingMap = new Map(this.data.boards.map((b) => [b.id, b]));
    let modified = false;

    for (const b of incomingBoards) {
      if (!b || !b.id) continue;
      if (!existingMap.has(b.id)) {
        this.data.boards.push({
          id: b.id,
          name: b.name || b.id,
          createdAt: b.createdAt || Date.now(),
          updatedAt: b.updatedAt || Date.now(),
        });
        modified = true;
      } else {
        const existing = existingMap.get(b.id)!;
        if (b.name && existing.name !== b.name) {
          existing.name = b.name;
          existing.updatedAt = Date.now();
          modified = true;
        }
      }
    }

    if (modified) {
      this.scheduleSave();
    }
  }

  private loadInitialData(): WorkspaceData {
    try {
      if (fs.existsSync(this.filePath)) {
        const content = fs.readFileSync(this.filePath, 'utf-8');
        const parsed = JSON.parse(content);
        if (parsed && Array.isArray(parsed.boards) && parsed.boards.length > 0) {
          return {
            ...this.getDefaultWorkspace(),
            ...parsed,
          };
        }
      }
    } catch (err) {
      console.warn(`[StorageProvider] Could not load ${this.filePath}, initializing fresh workspace:`, err);
    }
    return this.getDefaultWorkspace();
  }

  public getWorkspace(): WorkspaceData {
    return this.data;
  }

  public setWorkspace(newData: WorkspaceData, notify = true): void {
    this.data = {
      ...newData,
      lastModified: Date.now(),
    };
    this.scheduleSave();
    if (notify) {
      this.emitChange({
        type: 'workspace_synced',
        landscapeId: this.data.activeBoardId,
        timestamp: Date.now(),
      });
    }
  }

  public emitChange(event: StorageChangeEvent): void {
    this.emit('change', event);
  }

  public scheduleSave(): void {
    this.isDirty = true;
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    this.saveTimeout = setTimeout(() => {
      this.persistToDisk();
    }, 200);
  }

  public persistToDisk(): void {
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const tempPath = `${this.filePath}.tmp.${Date.now()}`;
      fs.writeFileSync(tempPath, JSON.stringify(this.data, null, 2), 'utf-8');
      fs.renameSync(tempPath, this.filePath);
      this.isDirty = false;
    } catch (err) {
      console.error('[StorageProvider] Failed to persist workspace to disk:', err);
    }
  }
}

export const globalStorage = new StorageProvider();
