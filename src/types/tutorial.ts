export type TutorialStepId =
  | 'idle'
  | 'welcome'
  | 'step_1_canvas'
  | 'step_2_add_note'
  | 'step_3_color_select'
  | 'step_4_animation'
  | 'step_5_edit_note'
  | 'step_6_drag_note'
  | 'step_7_resize_note'
  | 'step_8_color_change'
  | 'step_9_connect_notes'
  | 'step_10_group_notes'
  | 'step_11_search'
  | 'step_12_undo_redo'
  | 'step_13_export'
  | 'step_14_command_palette'
  | 'complete';

export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right' | 'center' | 'auto';

export interface TutorialStepConfig {
  id: TutorialStepId;
  stepNumber: number;
  totalSteps: number;
  targetSelector: string; // e.g. '[data-tutorial="canvas"]'
  title: string;
  description: string;
  placement?: TooltipPlacement;
  requiresInteraction?: boolean;
  interactionPrompt?: string;
  interactionSuccessText?: string;
  actionHint?: string;
  onEnter?: () => void;
  onExit?: () => void;
}

export interface TutorialState {
  isActive: boolean;
  currentStepId: TutorialStepId;
  currentStepIndex: number;
  isInteracted: boolean;
  interactionSuccess: boolean;
  hasSeenWelcome: boolean;
  isCompleted: boolean;
  isSkipped: boolean;
  demoNoteIds: string[];
  demoGroupId: string | null;
  demoConnectionId: string | null;
}

export interface ContextualTip {
  id: string;
  title: string;
  message: string;
  actionText?: string;
}
