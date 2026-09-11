import { StorageProvider } from '../storage/storageProvider.js';
import { LayoutService } from './layoutService.js';
import { globalKnowledgeEngine } from './knowledgeEngine.js';
import {
  StickyNote,
  Group,
  Connection,
  CreateThoughtMapParams,
  MapThoughtSpec,
  MapClusterSpec,
  MapConnectionSpec,
  NoteColor,
  NoteType,
} from '../types/index.js';
import { VALID_COLORS, VALID_NOTE_TYPES } from '../schemas/toolSchemas.js';

export class ThoughtMapService {
  private layoutService = new LayoutService();

  constructor(private storage: StorageProvider) {}

  public createThoughtMap(params: CreateThoughtMapParams): {
    success: boolean;
    topic: string;
    landscapeId: string;
    createdNotesCount: number;
    createdClustersCount: number;
    createdConnectionsCount: number;
    noteIds: string[];
    clusterIds: string[];
    connectionIds: string[];
  } {
    if (!params.topic || typeof params.topic !== 'string' || !params.topic.trim()) {
      throw new Error('A non-empty topic string is required to generate a thought map.');
    }

    const targetBoard = this.storage.resolveLandscape(params.landscapeId);
    const boardId = targetBoard.id;
    const ws = this.storage.getWorkspace();

    // 1. Resolve or Generate Map Specifications
    let thoughts: MapThoughtSpec[] = params.thoughts || [];
    let clusters: MapClusterSpec[] = params.clusters || [];
    let connections: MapConnectionSpec[] = params.connections || [];

    if (thoughts.length === 0) {
      const generated = globalKnowledgeEngine.generateTopicMap(
        params.topic.trim(),
        params.mapType,
        params.detailLevel,
        params.userInstructions
      );
      thoughts = generated.thoughts;
      clusters = generated.clusters;
      connections = generated.connections;
    }

    // 2. Validate all specs before making any state mutations
    this.validateMapSpecs(thoughts, clusters, connections);

    // 3. Staging / Transaction Setup
    const tempToRealId = new Map<string, string>();
    const tempClusterToRealId = new Map<string, string>();

    thoughts.forEach((t) => {
      tempToRealId.set(t.tempId, `note_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`);
    });

    clusters.forEach((c) => {
      tempClusterToRealId.set(c.tempId, `group_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`);
    });

    // 4. Calculate spatial layout
    // Find reasonable center relative to existing notes
    const existingNotes = ws.notes.filter((n) => (n.boardId || ws.activeBoardId) === boardId);
    let centerX = 600;
    let centerY = 400;

    if (existingNotes.length > 0) {
      const maxX = existingNotes.reduce((max, n) => Math.max(max, n.x + n.width), 0);
      centerX = maxX + 350;
      centerY = existingNotes[0].y;
    }

    const layout = this.layoutService.layoutConceptMap(thoughts, clusters, centerX, centerY);
    const layoutNoteMap = new Map(layout.notes.map((n) => [n.tempId, n]));
    const layoutClusterMap = new Map(layout.clusters.map((c) => [c.tempId, c]));

    // 5. Build Real Domain Entities
    const maxZ = ws.notes.reduce((max, n) => Math.max(max, n.zIndex || 1), 1);

    const newGroups: Group[] = clusters.map((c) => {
      const l = layoutClusterMap.get(c.tempId) || { x: centerX, y: centerY, width: 420, height: 360 };
      const color: NoteColor = c.color && VALID_COLORS.includes(c.color) ? c.color : 'blue';
      return {
        id: tempClusterToRealId.get(c.tempId)!,
        boardId,
        title: c.title.trim(),
        description: c.description?.trim(),
        color,
        x: l.x,
        y: l.y,
        width: l.width,
        height: l.height,
        isCollapsed: false,
        createdAt: Date.now(),
      };
    });

    const newNotes: StickyNote[] = thoughts.map((t, idx) => {
      const l = layoutNoteMap.get(t.tempId) || { x: centerX, y: centerY, width: 260, height: 210 };
      const color: NoteColor = t.color && VALID_COLORS.includes(t.color) ? t.color : 'yellow';
      const type: NoteType = t.type && VALID_NOTE_TYPES.includes(t.type) ? t.type : 'concept';
      const realGroupId = t.clusterTempId ? tempClusterToRealId.get(t.clusterTempId) : undefined;

      return {
        id: tempToRealId.get(t.tempId)!,
        boardId,
        title: t.title.trim(),
        content: t.content.trim(),
        color,
        type,
        x: l.x,
        y: l.y,
        width: l.width,
        height: l.height,
        zIndex: maxZ + idx + 1,
        tags: Array.isArray(t.tags) ? t.tags.map((tag) => tag.trim().toLowerCase()).filter(Boolean) : [params.topic.toLowerCase().replace(/\s+/g, '-')],
        starred: t.role === 'main',
        pinned: false,
        locked: false,
        groupId: realGroupId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
    });

    const newConnections: Connection[] = connections.map((conn) => {
      const sourceRealId = tempToRealId.get(conn.sourceTempId)!;
      const targetRealId = tempToRealId.get(conn.targetTempId)!;
      return {
        id: `conn_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        boardId,
        sourceId: sourceRealId,
        targetId: targetRealId,
        type: conn.type || 'arrow',
        label: conn.label?.trim(),
        createdAt: Date.now(),
      };
    });

    // 6. Commit transaction atomically
    ws.groups.push(...newGroups);
    ws.notes.push(...newNotes);
    ws.connections.push(...newConnections);
    this.storage.scheduleSave();

    // 7. Emit change event
    this.storage.emitChange({
      type: 'thought_map_created',
      landscapeId: boardId,
      data: {
        topic: params.topic,
        notes: newNotes,
        groups: newGroups,
        connections: newConnections,
      },
      timestamp: Date.now(),
    });

    return {
      success: true,
      topic: params.topic,
      landscapeId: boardId,
      createdNotesCount: newNotes.length,
      createdClustersCount: newGroups.length,
      createdConnectionsCount: newConnections.length,
      noteIds: newNotes.map((n) => n.id),
      clusterIds: newGroups.map((g) => g.id),
      connectionIds: newConnections.map((c) => c.id),
    };
  }

  private validateMapSpecs(
    thoughts: MapThoughtSpec[],
    clusters: MapClusterSpec[],
    connections: MapConnectionSpec[]
  ): void {
    const tempIds = new Set<string>();
    thoughts.forEach((t) => {
      if (!t.tempId) throw new Error('Every thought in the map must have a unique tempId.');
      if (tempIds.has(t.tempId)) throw new Error(`Duplicate tempId "${t.tempId}" found in thoughts.`);
      tempIds.add(t.tempId);
      if (!t.title || !t.content) throw new Error(`Thought "${t.tempId}" must contain a title and content.`);
    });

    const clusterTempIds = new Set<string>();
    clusters.forEach((c) => {
      if (!c.tempId) throw new Error('Every cluster in the map must have a unique tempId.');
      if (clusterTempIds.has(c.tempId)) throw new Error(`Duplicate cluster tempId "${c.tempId}" found.`);
      clusterTempIds.add(c.tempId);
      if (!c.title) throw new Error(`Cluster "${c.tempId}" must contain a title.`);
    });

    connections.forEach((conn) => {
      if (!tempIds.has(conn.sourceTempId)) {
        throw new Error(`Connection source "${conn.sourceTempId}" does not match any thought tempId.`);
      }
      if (!tempIds.has(conn.targetTempId)) {
        throw new Error(`Connection target "${conn.targetTempId}" does not match any thought tempId.`);
      }
    });
  }
}

