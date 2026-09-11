import { StorageProvider } from '../storage/storageProvider.js';
import { CurrentContext } from '../types/index.js';

export class ContextService {
  private currentContext: CurrentContext | null = null;

  constructor(private storage: StorageProvider) {}

  public updateContext(partial: Partial<CurrentContext> & { boards?: any[] }): void {
    if (partial.boards && Array.isArray(partial.boards)) {
      this.storage.syncBoards(partial.boards);
    }

    const ws = this.storage.getWorkspace();
    const activeBoard = this.storage.resolveLandscape(partial.activeBoardId, partial.activeBoardName);
    ws.activeBoardId = activeBoard.id;

    const currentNotes = ws.notes.filter((n) => (n.boardId || ws.activeBoardId) === activeBoard.id);
    const currentGroups = ws.groups.filter((g) => (g.boardId || ws.activeBoardId) === activeBoard.id);
    const currentConnections = ws.connections.filter((c) => (c.boardId || ws.activeBoardId) === activeBoard.id);

    let selectedNoteTitle: string | null | undefined = partial.selectedNoteTitle;
    let selectedNoteContent: string | null | undefined = partial.selectedNoteContent;

    if (partial.selectedNoteId && (!selectedNoteTitle || !selectedNoteContent)) {
      const note = ws.notes.find((n) => n.id === partial.selectedNoteId);
      if (note) {
        selectedNoteTitle = note.title || '(Untitled Thought)';
        selectedNoteContent = note.content;
      }
    }

    let selectedGroupTitle: string | null | undefined = partial.selectedGroupTitle;
    if (partial.selectedGroupId && !selectedGroupTitle) {
      const group = ws.groups.find((g) => g.id === partial.selectedGroupId);
      if (group) {
        selectedGroupTitle = group.title;
      }
    }

    this.currentContext = {
      activeBoardId: activeBoard.id,
      activeBoardName: activeBoard.name,
      selectedNoteId: partial.selectedNoteId,
      selectedNoteTitle,
      selectedNoteContent,
      selectedGroupId: partial.selectedGroupId,
      selectedGroupTitle,
      totalNotes: currentNotes.length,
      totalGroups: currentGroups.length,
      totalConnections: currentConnections.length,
      viewportCenter: partial.viewportCenter || { x: 500, y: 400 },
    };
  }

  public getCurrentContext(): CurrentContext {
    if (this.currentContext) {
      // Refresh counts from storage
      const ws = this.storage.getWorkspace();
      const board = ws.boards.find((b) => b.id === this.currentContext?.activeBoardId) || ws.boards[0];
      const noteCount = ws.notes.filter((n) => (n.boardId || ws.activeBoardId) === board.id).length;
      const groupCount = ws.groups.filter((g) => (g.boardId || ws.activeBoardId) === board.id).length;
      const connCount = ws.connections.filter((c) => (c.boardId || ws.activeBoardId) === board.id).length;

      return {
        ...this.currentContext,
        activeBoardId: board.id,
        activeBoardName: board.name,
        totalNotes: noteCount,
        totalGroups: groupCount,
        totalConnections: connCount,
      };
    }

    // Default context when frontend has not connected or sent selection
    const ws = this.storage.getWorkspace();
    const activeBoard = ws.boards.find((b) => b.id === ws.activeBoardId) || ws.boards[0];
    const notes = ws.notes.filter((n) => (n.boardId || ws.activeBoardId) === activeBoard.id);
    const groups = ws.groups.filter((g) => (g.boardId || ws.activeBoardId) === activeBoard.id);
    const connections = ws.connections.filter((c) => (c.boardId || ws.activeBoardId) === activeBoard.id);

    return {
      activeBoardId: activeBoard.id,
      activeBoardName: activeBoard.name,
      selectedNoteId: null,
      selectedGroupId: null,
      totalNotes: notes.length,
      totalGroups: groups.length,
      totalConnections: connections.length,
      viewportCenter: { x: 600, y: 400 },
    };
  }
}
