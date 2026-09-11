import { StorageProvider } from '../storage/storageProvider.js';
import { Connection, ConnectionType } from '../types/index.js';

export interface CreateConnectionInput {
  landscapeId?: string;
  sourceThoughtId: string;
  targetThoughtId: string;
  relationshipType?: ConnectionType;
  label?: string;
}

export class ConnectionService {
  constructor(private storage: StorageProvider) {}

  public createConnection(input: CreateConnectionInput): Connection {
    const ws = this.storage.getWorkspace();
    const boardId = input.landscapeId || ws.activeBoardId;

    if (!input.sourceThoughtId || !input.targetThoughtId) {
      throw new Error('Both sourceThoughtId and targetThoughtId are required.');
    }

    if (input.sourceThoughtId === input.targetThoughtId) {
      throw new Error('Cannot connect a thought to itself.');
    }

    const sourceNote = ws.notes.find((n) => n.id === input.sourceThoughtId);
    const targetNote = ws.notes.find((n) => n.id === input.targetThoughtId);

    if (!sourceNote) {
      throw new Error(`Source thought with ID "${input.sourceThoughtId}" not found.`);
    }
    if (!targetNote) {
      throw new Error(`Target thought with ID "${input.targetThoughtId}" not found.`);
    }

    // Check duplicate connection
    const existing = ws.connections.find(
      (c) =>
        (c.sourceId === input.sourceThoughtId && c.targetId === input.targetThoughtId) ||
        (c.sourceId === input.targetThoughtId && c.targetId === input.sourceThoughtId)
    );

    if (existing) {
      if (input.label && existing.label !== input.label) {
        existing.label = input.label;
        this.storage.scheduleSave();
      }
      return existing;
    }

    const newConnection: Connection = {
      id: `conn_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      boardId,
      sourceId: input.sourceThoughtId,
      targetId: input.targetThoughtId,
      type: input.relationshipType || 'arrow',
      label: input.label?.trim(),
      createdAt: Date.now(),
    };

    ws.connections.push(newConnection);
    this.storage.scheduleSave();
    this.storage.emitChange({
      type: 'connection_created',
      landscapeId: boardId,
      data: newConnection,
      timestamp: Date.now(),
    });

    return newConnection;
  }

  public suggestConnections(landscapeId?: string, topicFilter?: string): {
    suggestions: {
      sourceId: string;
      sourceTitle: string;
      targetId: string;
      targetTitle: string;
      relationshipType: string;
      label: string;
      reasoning: string;
    }[];
  } {
    const ws = this.storage.getWorkspace();
    const boardId = landscapeId || ws.activeBoardId;
    const notes = ws.notes.filter((n) => (n.boardId || ws.activeBoardId) === boardId);

    if (notes.length < 2) {
      return { suggestions: [] };
    }

    const existingPairs = new Set(
      ws.connections.map((c) => `${c.sourceId}:${c.targetId}`).concat(ws.connections.map((c) => `${c.targetId}:${c.sourceId}`))
    );

    const suggestions: any[] = [];

    for (let i = 0; i < notes.length; i++) {
      for (let j = i + 1; j < notes.length; j++) {
        const n1 = notes[i];
        const n2 = notes[j];

        if (existingPairs.has(`${n1.id}:${n2.id}`)) continue;

        const title1 = (n1.title || '').toLowerCase();
        const title2 = (n2.title || '').toLowerCase();
        const content1 = n1.content.toLowerCase();
        const content2 = n2.content.toLowerCase();

        // 1. Tag overlap
        const sharedTags = n1.tags.filter((t) => n2.tags.includes(t));
        if (sharedTags.length > 0) {
          suggestions.push({
            sourceId: n1.id,
            sourceTitle: n1.title || n1.content.slice(0, 30),
            targetId: n2.id,
            targetTitle: n2.title || n2.content.slice(0, 30),
            relationshipType: 'dashed',
            label: `shares #${sharedTags[0]}`,
            reasoning: `Both thoughts are tagged with #${sharedTags[0]}.`,
          });
          continue;
        }

        // 2. Mention in content or title
        if (title1 && (content2.includes(title1) || title2.includes(title1))) {
          suggestions.push({
            sourceId: n1.id,
            sourceTitle: n1.title || n1.content.slice(0, 30),
            targetId: n2.id,
            targetTitle: n2.title || n2.content.slice(0, 30),
            relationshipType: 'arrow',
            label: 'referenced in',
            reasoning: `"${n2.title || 'Thought'}" directly mentions "${n1.title}".`,
          });
          continue;
        }

        // 3. Question -> Solution relationship
        if (n1.type === 'question' && (n2.type === 'concept' || n2.type === 'action')) {
          suggestions.push({
            sourceId: n1.id,
            sourceTitle: n1.title || n1.content.slice(0, 30),
            targetId: n2.id,
            targetTitle: n2.title || n2.content.slice(0, 30),
            relationshipType: 'arrow',
            label: 'answered by',
            reasoning: `The question in "${n1.title || 'Note'}" may be resolved by "${n2.title || 'Note'}".`,
          });
        }
      }
    }

    return { suggestions: suggestions.slice(0, 8) };
  }
}
