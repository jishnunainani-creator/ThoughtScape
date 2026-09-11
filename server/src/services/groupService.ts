import { StorageProvider } from '../storage/storageProvider.js';
import { Group, NoteColor } from '../types/index.js';
import { VALID_COLORS } from '../schemas/toolSchemas.js';

export interface CreateClusterInput {
  landscapeId?: string;
  title: string;
  description?: string;
  color?: NoteColor;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export class GroupService {
  constructor(private storage: StorageProvider) {}

  public createCluster(input: CreateClusterInput): Group {
    const ws = this.storage.getWorkspace();
    const boardId = input.landscapeId || ws.activeBoardId;

    if (!input.title || typeof input.title !== 'string') {
      throw new Error('Cluster title is required and must be a string.');
    }

    const color: NoteColor = input.color && VALID_COLORS.includes(input.color) ? input.color : 'blue';

    const existingGroups = ws.groups.filter((g) => (g.boardId || ws.activeBoardId) === boardId);
    let x = input.x ?? (existingGroups.length === 0 ? 300 : existingGroups[existingGroups.length - 1].x + 400);
    let y = input.y ?? 200;

    const newGroup: Group = {
      id: `group_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      boardId,
      title: input.title.trim(),
      description: input.description?.trim(),
      color,
      x: Math.round(x),
      y: Math.round(y),
      width: input.width || 420,
      height: input.height || 360,
      isCollapsed: false,
      createdAt: Date.now(),
    };

    ws.groups.push(newGroup);
    this.storage.scheduleSave();
    this.storage.emitChange({
      type: 'group_created',
      landscapeId: boardId,
      data: newGroup,
      timestamp: Date.now(),
    });

    return newGroup;
  }

  public getClusters(landscapeId?: string): Group[] {
    const ws = this.storage.getWorkspace();
    const boardId = landscapeId || ws.activeBoardId;
    return ws.groups.filter((g) => (g.boardId || ws.activeBoardId) === boardId);
  }
}
