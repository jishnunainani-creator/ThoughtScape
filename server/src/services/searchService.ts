import { StorageProvider } from '../storage/storageProvider.js';
import { StickyNote, NoteColor, NoteType } from '../types/index.js';

export interface SearchParams {
  landscapeId?: string;
  query: string;
  color?: NoteColor;
  type?: NoteType;
  limit?: number;
}

export class SearchService {
  constructor(private storage: StorageProvider) {}

  public searchThoughts(params: SearchParams): { results: any[]; totalCount: number } {
    const ws = this.storage.getWorkspace();
    const boardId = params.landscapeId || ws.activeBoardId;
    const query = params.query.trim().toLowerCase();
    const limit = params.limit || 15;

    let notes = ws.notes.filter((n) => (n.boardId || ws.activeBoardId) === boardId);

    if (params.color) {
      notes = notes.filter((n) => n.color === params.color);
    }
    if (params.type) {
      notes = notes.filter((n) => n.type === params.type);
    }

    if (!query) {
      return {
        results: notes.slice(0, limit),
        totalCount: notes.length,
      };
    }

    const scored = notes
      .map((note) => {
        let score = 0;
        const title = (note.title || '').toLowerCase();
        const content = note.content.toLowerCase();
        const tags = note.tags.map((t) => t.toLowerCase());

        if (title === query) score += 100;
        else if (title.startsWith(query)) score += 50;
        else if (title.includes(query)) score += 30;

        if (tags.includes(query)) score += 40;
        else if (tags.some((t) => t.includes(query))) score += 20;

        if (content.includes(query)) score += 15;

        return { note, score };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score);

    const results = scored.slice(0, limit).map((item) => ({
      id: item.note.id,
      title: item.note.title || '(Untitled Thought)',
      content: item.note.content,
      type: item.note.type,
      color: item.note.color,
      tags: item.note.tags,
      starred: item.note.starred,
      learningState: item.note.learningState,
      x: item.note.x,
      y: item.note.y,
    }));

    return {
      results,
      totalCount: scored.length,
    };
  }
}
