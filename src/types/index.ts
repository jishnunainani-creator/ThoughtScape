export type NoteType =
  | 'normal'
  | 'idea'
  | 'question'
  | 'concept'
  | 'code'
  | 'task'
  | 'mistake'
  | 'reference'
  | 'quote';

export type NoteColor =
  | 'yellow'
  | 'pink'
  | 'green'
  | 'blue'
  | 'purple'
  | 'peach'
  | 'orange'
  | 'red'
  | 'white';

export type LearningState = 'new' | 'learning' | 'understood' | 'practicing' | 'mastered';

export interface TaskItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface MistakeDetails {
  whatIDid: string;
  whyWrong: string;
  correctApproach: string;
  howToAvoid: string;
}

export interface StickyNote {
  id: string;
  boardId?: string;
  type: NoteType;
  title: string;
  content: string;
  color: NoteColor;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
  tags: string[];
  starred: boolean;
  pinned: boolean;
  locked?: boolean;
  groupId?: string;
  stackId?: string;
  stackOrder?: number;
  learningState?: LearningState;
  codeLanguage?: string;
  taskItems?: TaskItem[];
  mistakeDetails?: MistakeDetails;
  quoteAuthor?: string;
  referenceUrl?: string;
  isTutorialDemo?: boolean;
  createdAt: number;
  updatedAt: number;
}

export type ConnectionType = 'arrow' | 'line' | 'dashed' | 'bidirectional';

export interface Connection {
  id: string;
  boardId?: string;
  sourceId: string;
  targetId: string;
  type: ConnectionType;
  label?: string;
  color?: string;
  isTutorialDemo?: boolean;
  createdAt: number;
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
  collapsed: boolean;
  locked?: boolean;
  isTutorialDemo?: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface NoteStack {
  id: string;
  boardId?: string;
  title: string;
  color: NoteColor;
  x: number;
  y: number;
  noteIds: string[];
  isExpanded?: boolean;
  createdAt: number;
  updatedAt: number;
}

export type EnvironmentCategory =
  | 'all'
  | 'minimal'
  | 'study'
  | 'creative'
  | 'cozy'
  | 'professional'
  | 'custom';

export type EnvironmentIntensity = 'minimal' | 'balanced' | 'immersive';
export type BackgroundFocus = 'normal' | 'soft' | 'dim';
export type NoteVisualTheme = 'classic' | 'clean' | 'handwritten' | 'minimal';

export interface NotePhysicsConfig {
  shadowType: 'crisp' | 'soft' | 'chalk' | 'pinned' | 'desk';
  pinVisible?: boolean;
  borderContrast?: 'normal' | 'high';
  ambientWarmth?: boolean;
}

export interface EnvironmentDefinition {
  id: string;
  name: string;
  tagline: string;
  description: string;
  category: EnvironmentCategory;
  backgroundColor: string;
  secondaryColor?: string;
  accentColor?: string;
  textColor?: string;
  gridColor?: string;
  textureType: 'none' | 'plaster' | 'chalk' | 'cork' | 'wood' | 'paper' | 'blueprint' | 'concrete' | 'custom';
  frameType?: 'none' | 'chalkboard' | 'cork' | 'wood' | 'slate' | 'minimal';
  lightingStyle?: 'none' | 'top-spot' | 'desk-lamp' | 'warm-ambient' | 'studio';
  notePhysics: NotePhysicsConfig;
  previewGradient: string;
  isPopular?: boolean;
}

export interface LandscapeEnvironmentSettings {
  environmentId: string;
  intensity?: EnvironmentIntensity;
  backgroundFocus?: BackgroundFocus;
  noteStyle?: NoteVisualTheme;
  customColor?: string;
  customBrightness?: number;
  customTexture?: 'none' | 'plaster' | 'paper' | 'grain' | 'grid';
  showGrid?: boolean;
}

export interface Board {
  id: string;
  name: string;
  description?: string;
  isDefault?: boolean;
  environmentSettings?: LandscapeEnvironmentSettings;
  createdAt: number;
  updatedAt: number;
}

export interface BoardSnapshot {
  id: string;
  boardId: string;
  name: string;
  timestamp: number;
  notesCount: number;
  notes: StickyNote[];
  groups: Group[];
  connections: Connection[];
  stacks?: NoteStack[];
  environmentSettings?: LandscapeEnvironmentSettings;
}

export interface TrashItem {
  id: string;
  boardId: string;
  itemType: 'note' | 'group' | 'connection' | 'stack';
  title: string;
  deletedAt: number;
  data: StickyNote | Group | Connection | NoteStack;
}

export interface CanvasTransform {
  x: number;
  y: number;
  scale: number;
}

export interface ColorMeaning {
  color: NoteColor;
  label: string;
  name: string;
  bgClass: string;
  borderClass: string;
  hex: string;
  borderHex: string;
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
  stacks: NoteStack[];
  trash: TrashItem[];
  snapshots: BoardSnapshot[];
  colorMeanings?: Record<NoteColor, string>;
  favoriteEnvironments?: string[];
  recentEnvironments?: string[];
  globalNoteStyle?: NoteVisualTheme;
  canvasTransform?: CanvasTransform;
}

export interface ContextMenuState {
  isOpen: boolean;
  x: number;
  y: number;
  targetType: 'note' | 'group' | 'connection' | 'stack' | 'canvas';
  targetId?: string;
}

export interface ToastMessage {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}
