export type NoteColor =
  | 'yellow'
  | 'blue'
  | 'pink'
  | 'green'
  | 'purple'
  | 'orange'
  | 'cyan'
  | 'coral';

export type NoteType =
  | 'concept'
  | 'action'
  | 'question'
  | 'reference'
  | 'insight'
  | 'warning'
  | 'quote';

export type LearningState = 'todo' | 'in_progress' | 'mastered' | 'review';

export interface StickyNote {
  id: string;
  boardId?: string;
  title?: string;
  content: string;
  color: NoteColor;
  type: NoteType;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  tags: string[];
  starred: boolean;
  pinned: boolean;
  locked: boolean;
  learningState?: LearningState;
  groupId?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Group {
  id: string;
  boardId?: string;
  title: string;
  description?: string;
  color: NoteColor;
  x: number;
  y: number;
  width: number;
  height: number;
  isCollapsed: boolean;
  createdAt: number;
}

export type ConnectionType = 'arrow' | 'dashed' | 'bidirectional' | 'straight' | 'step';

export interface Connection {
  id: string;
  boardId?: string;
  sourceId: string;
  targetId: string;
  type: ConnectionType;
  label?: string;
  createdAt: number;
}

export interface NoteStack {
  id: string;
  boardId?: string;
  title: string;
  color: NoteColor;
  x: number;
  y: number;
  noteIds: string[];
  createdAt: number;
  updatedAt: number;
}

export interface TrashItem {
  id: string;
  boardId?: string;
  type: 'note' | 'group' | 'connection' | 'stack';
  title: string;
  deletedAt: number;
  data: any;
}

export interface Board {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  environmentSettings?: any;
}

export interface WorkspaceData {
  version: number;
  appName: string;
  lastModified: number;
  boards: Board[];
  activeBoardId: string;
  notes: StickyNote[];
  groups: Group[];
  connections: Connection[];
  stacks?: NoteStack[];
  trash?: TrashItem[];
  snapshots?: any[];
  colorMeanings?: Record<string, string>;
}

export interface CurrentContext {
  activeBoardId: string;
  activeBoardName: string;
  selectedNoteId?: string | null;
  selectedNoteTitle?: string | null;
  selectedNoteContent?: string | null;
  selectedGroupId?: string | null;
  selectedGroupTitle?: string | null;
  totalNotes: number;
  totalGroups: number;
  totalConnections: number;
  viewportCenter?: { x: number; y: number };
}

// Thought Map Generation Specs
export interface MapThoughtSpec {
  tempId: string;
  title: string;
  content: string;
  type?: NoteType;
  color?: NoteColor;
  tags?: string[];
  clusterTempId?: string;
  role?: 'main' | 'prerequisite' | 'mechanism' | 'application' | 'example' | 'question';
}

export interface MapClusterSpec {
  tempId: string;
  title: string;
  description?: string;
  color?: NoteColor;
}

export interface MapConnectionSpec {
  sourceTempId: string;
  targetTempId: string;
  type?: ConnectionType;
  label?: string;
}

export interface CreateThoughtMapParams {
  landscapeId?: string;
  topic: string;
  mapType?: 'concept' | 'revision' | 'flow' | 'brainstorm' | 'hierarchy';
  detailLevel?: 'brief' | 'detailed' | 'comprehensive';
  userInstructions?: string;
  thoughts?: MapThoughtSpec[];
  clusters?: MapClusterSpec[];
  connections?: MapConnectionSpec[];
}

// MCP Protocol Types
export interface McpTool {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
}

export interface McpRequest {
  jsonrpc: '2.0';
  id?: string | number | null;
  method: string;
  params?: any;
}

export interface McpResponse {
  jsonrpc: '2.0';
  id?: string | number | null;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}
