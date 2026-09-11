import { StorageProvider } from '../storage/storageProvider.js';
import { StickyNote, NoteColor, NoteType, LearningState } from '../types/index.js';
import { VALID_COLORS, VALID_NOTE_TYPES } from '../schemas/toolSchemas.js';

export interface CreateNoteInput {
  landscapeId?: string;
  title?: string;
  content: string;
  type?: NoteType;
  color?: NoteColor;
  tags?: string[];
  clusterId?: string;
  x?: number;
  y?: number;
}

export interface UpdateNoteInput {
  landscapeId?: string;
  thoughtId: string;
  title?: string;
  content?: string;
  type?: NoteType;
  color?: NoteColor;
  tags?: string[];
  starred?: boolean;
  learningState?: LearningState;
}

export class NoteService {
  constructor(private storage: StorageProvider) {}

  public createThought(input: CreateNoteInput): StickyNote {
    const ws = this.storage.getWorkspace();
    const boardId = input.landscapeId || ws.activeBoardId;

    if (!input.content || typeof input.content !== 'string') {
      throw new Error('Content is required and must be a string.');
    }

    const color: NoteColor = input.color && VALID_COLORS.includes(input.color) ? input.color : 'yellow';
    const type: NoteType = input.type && VALID_NOTE_TYPES.includes(input.type) ? input.type : 'concept';

    // Auto calculate placement if not supplied
    let x = input.x;
    let y = input.y;

    if (x === undefined || y === undefined) {
      const existingNotes = ws.notes.filter((n) => (n.boardId || ws.activeBoardId) === boardId);
      if (existingNotes.length === 0) {
        x = 400;
        y = 300;
      } else {
        // Place in a readable offset from the latest note
        const lastNote = existingNotes[existingNotes.length - 1];
        const angle = (existingNotes.length * 45) % 360;
        const rad = (angle * Math.PI) / 180;
        const distance = 260;
        x = lastNote.x + Math.cos(rad) * distance;
        y = lastNote.y + Math.sin(rad) * distance;
      }
    }

    const maxZ = ws.notes.reduce((max, n) => Math.max(max, n.zIndex || 1), 1);
    const newNote: StickyNote = {
      id: `note_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      boardId,
      title: input.title ? input.title.trim() : undefined,
      content: input.content.trim(),
      color,
      type,
      x: Math.round(x),
      y: Math.round(y),
      width: 260,
      height: 210,
      zIndex: maxZ + 1,
      tags: Array.isArray(input.tags) ? input.tags.map((t) => t.trim().toLowerCase()).filter(Boolean) : [],
      starred: false,
      pinned: false,
      locked: false,
      groupId: input.clusterId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    ws.notes.push(newNote);
    this.storage.scheduleSave();
    this.storage.emitChange({
      type: 'note_created',
      landscapeId: boardId,
      data: newNote,
      timestamp: Date.now(),
    });

    return newNote;
  }

  public updateThought(input: UpdateNoteInput): StickyNote {
    const ws = this.storage.getWorkspace();
    const boardId = input.landscapeId || ws.activeBoardId;
    const noteIndex = ws.notes.findIndex((n) => n.id === input.thoughtId);

    if (noteIndex === -1) {
      throw new Error(`Thought with ID "${input.thoughtId}" not found.`);
    }

    const note = ws.notes[noteIndex];
    if (note.locked) {
      throw new Error(`Thought "${note.title || note.id}" is locked and cannot be modified.`);
    }

    if (input.title !== undefined) note.title = input.title.trim();
    if (input.content !== undefined) note.content = input.content.trim();
    if (input.color && VALID_COLORS.includes(input.color)) note.color = input.color;
    if (input.type && VALID_NOTE_TYPES.includes(input.type)) note.type = input.type;
    if (Array.isArray(input.tags)) {
      note.tags = input.tags.map((t) => t.trim().toLowerCase()).filter(Boolean);
    }
    if (typeof input.starred === 'boolean') note.starred = input.starred;
    if (input.learningState) note.learningState = input.learningState;
    note.updatedAt = Date.now();

    this.storage.scheduleSave();
    this.storage.emitChange({
      type: 'note_updated',
      landscapeId: boardId,
      data: note,
      timestamp: Date.now(),
    });

    return note;
  }

  public moveThought(landscapeId: string | undefined, thoughtId: string, x: number, y: number): StickyNote {
    const ws = this.storage.getWorkspace();
    const boardId = landscapeId || ws.activeBoardId;
    const note = ws.notes.find((n) => n.id === thoughtId);

    if (!note) {
      throw new Error(`Thought with ID "${thoughtId}" not found.`);
    }

    note.x = Math.round(x);
    note.y = Math.round(y);
    note.updatedAt = Date.now();

    this.storage.scheduleSave();
    this.storage.emitChange({
      type: 'note_updated',
      landscapeId: boardId,
      data: note,
      timestamp: Date.now(),
    });

    return note;
  }

  public deleteThought(landscapeId: string | undefined, thoughtId: string, permanent = false): { success: boolean; id: string } {
    const ws = this.storage.getWorkspace();
    const boardId = landscapeId || ws.activeBoardId;
    const note = ws.notes.find((n) => n.id === thoughtId);

    if (!note) {
      throw new Error(`Thought with ID "${thoughtId}" not found.`);
    }

    // Remove from notes
    ws.notes = ws.notes.filter((n) => n.id !== thoughtId);

    // Remove any connected relationships
    ws.connections = ws.connections.filter((c) => c.sourceId !== thoughtId && c.targetId !== thoughtId);

    // If soft-delete, push to trash
    if (!permanent) {
      if (!ws.trash) ws.trash = [];
      ws.trash.push({
        id: `trash_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        boardId,
        type: 'note',
        title: note.title || note.content.slice(0, 30),
        deletedAt: Date.now(),
        data: note,
      });
    }

    this.storage.scheduleSave();
    this.storage.emitChange({
      type: 'note_deleted',
      landscapeId: boardId,
      data: { id: thoughtId },
      timestamp: Date.now(),
    });

    return { success: true, id: thoughtId };
  }
}
