import fs from 'node:fs';
import path from 'node:path';
import { EventEmitter } from 'node:events';
import { WorkspaceData, Board } from '../types/index.js';

export interface StorageChangeEvent {
  type: 'note_created' | 'note_updated' | 'note_deleted' | 'group_created' | 'group_updated' | 'group_deleted' | 'connection_created' | 'connection_deleted' | 'thought_map_created' | 'workspace_synced';
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
      id: 'default',
      name: 'My Thoughtscape',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    return {
      version: 2,
      appName: 'Thoughtscape',
      lastModified: Date.now(),
      boards: [defaultBoard],
      activeBoardId: 'default',
      notes: [],
      groups: [],
      connections: [],
      stacks: [],
      trash: [],
      snapshots: [],
      colorMeanings: {
        yellow: 'General thoughts',
        blue: 'Key concepts',
        pink: 'Important points',
        green: 'Solutions & Ideas',
        purple: 'Questions & Research',
        orange: 'Urgent & Action',
        cyan: 'References',
        coral: 'Insights',
      },
    };
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
