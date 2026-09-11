import { StorageProvider } from '../storage/storageProvider.js';
import { Board, WorkspaceData } from '../types/index.js';

export class BoardService {
  constructor(private storage: StorageProvider) {}

  public getLandscapes(): { id: string; name: string; noteCount: number; groupCount: number; lastModified: number }[] {
    const ws = this.storage.getWorkspace();
    return ws.boards.map((b) => {
      const noteCount = ws.notes.filter((n) => (n.boardId || ws.activeBoardId) === b.id).length;
      const groupCount = ws.groups.filter((g) => (g.boardId || ws.activeBoardId) === b.id).length;
      return {
        id: b.id,
        name: b.name,
        noteCount,
        groupCount,
        lastModified: b.updatedAt || b.createdAt || ws.lastModified,
      };
    });
  }

  public getLandscape(
    landscapeId?: string,
    includeNotes = true,
    includeGroups = true,
    includeConnections = true
  ): {
    landscape: Board;
    notes?: any[];
    groups?: any[];
    connections?: any[];
  } {
    const ws = this.storage.getWorkspace();
    const board = this.storage.resolveLandscape(landscapeId);

    const result: any = { landscape: board };

    if (includeNotes) {
      result.notes = ws.notes.filter((n) => (n.boardId || ws.activeBoardId) === board.id);
    }
    if (includeGroups) {
      result.groups = ws.groups.filter((g) => (g.boardId || ws.activeBoardId) === board.id);
    }
    if (includeConnections) {
      result.connections = ws.connections.filter((c) => (c.boardId || ws.activeBoardId) === board.id);
    }

    return result;
  }

  public getActiveBoardId(): string {
    return this.storage.getWorkspace().activeBoardId;
  }

  public createLandscape(name: string): Board {
    const ws = this.storage.getWorkspace();
    const cleanName = name.trim();
    const id = `board_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newBoard: Board = {
      id,
      name: cleanName,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    ws.boards.push(newBoard);
    this.storage.scheduleSave();
    return newBoard;
  }
}
