import { useState, useEffect, useCallback } from 'react';
import { TUTORIAL_STEPS } from '../constants/tutorialSteps';
import { TutorialStepConfig } from '../types/tutorial';
import { StickyNote, Group, Connection, NoteColor } from '../types';

interface UseTutorialProps {
  notes: StickyNote[];
  addNote: (params: Partial<StickyNote>) => StickyNote;
  deleteNote: (id: string) => void;
  addGroup: (title: string, color: NoteColor, x: number, y: number) => Group;
  deleteGroup: (id: string) => void;
  addConnection: (sourceId: string, targetId: string, type?: any, label?: string) => Connection | null;
  deleteConnection: (id: string) => void;
  centerOnNote?: (note: StickyNote) => void;
  fitToNotes?: (notesToFit: StickyNote[]) => void;
}

const TUTORIAL_STORAGE_KEY = 'thoughtscape_tutorial_status_v1';
const FALLBACK_TUTORIAL_KEY = 'wall_tutorial_status_v1';

export function useTutorial({
  notes,
  addNote,
  deleteNote,
  addGroup,
  deleteGroup,
  addConnection,
  deleteConnection,
  centerOnNote,
}: UseTutorialProps) {
  const [showWelcome, setShowWelcome] = useState<boolean>(false);
  const [showFinish, setShowFinish] = useState<boolean>(false);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isInteracted, setIsInteracted] = useState<boolean>(false);
  const [interactionSuccess, setInteractionSuccess] = useState<boolean>(false);
  const [demoNoteIds, setDemoNoteIds] = useState<string[]>([]);
  const [demoGroupId, setDemoGroupId] = useState<string | null>(null);
  const [demoConnectionId, setDemoConnectionId] = useState<string | null>(null);

  // Check initial launch state
  useEffect(() => {
    const saved = localStorage.getItem(TUTORIAL_STORAGE_KEY) || localStorage.getItem(FALLBACK_TUTORIAL_KEY);
    if (!saved) {
      // First time launch -> show clean 60-second tour welcome dialog
      setShowWelcome(true);
    }
  }, []);

  const currentStep: TutorialStepConfig | undefined = TUTORIAL_STEPS[currentStepIndex];

  // Helper to ensure demo elements exist on canvas for tutorial
  const setupDemoElements = useCallback(() => {
    const existingDemoNotes = notes.filter((n) => n.isTutorialDemo);
    if (existingDemoNotes.length >= 2) {
      setDemoNoteIds(existingDemoNotes.map((n) => n.id));
      return existingDemoNotes;
    }

    const startX = window.innerWidth > 900 ? window.innerWidth / 2 - 250 : 300;
    const startY = window.innerHeight > 700 ? window.innerHeight / 2 - 150 : 250;

    // Demo Group
    const group = addGroup('DSA Patterns 🧠', 'blue', startX - 40, startY - 60);
    setDemoGroupId(group.id);

    // Demo Note 1: Array
    const note1 = addNote({
      title: 'Array Data Structure 📦',
      content: 'Contiguous memory block with O(1) indexed lookup.\n\nTry [[Two Pointers]] pattern for linear scans!',
      type: 'concept',
      color: 'yellow',
      x: startX,
      y: startY,
      width: 240,
      height: 180,
      groupId: group.id,
      isTutorialDemo: true,
      learningState: 'understood',
    });

    // Demo Note 2: Two Pointers
    const note2 = addNote({
      title: 'Two Pointers Pattern ⚡',
      content: 'Uses left & right indices to solve array problems in O(N) time without extra memory.',
      type: 'concept',
      color: 'blue',
      x: startX + 290,
      y: startY,
      width: 240,
      height: 180,
      groupId: group.id,
      isTutorialDemo: true,
      learningState: 'learning',
    });

    const conn = addConnection(note1.id, note2.id, 'arrow', 'optimizes');
    if (conn) {
      setDemoConnectionId(conn.id);
    }

    setDemoNoteIds([note1.id, note2.id]);
    return [note1, note2];
  }, [notes, addGroup, addNote, addConnection]);

  // Start Tour
  const startTour = useCallback(() => {
    setShowWelcome(false);
    setShowFinish(false);
    setIsActive(true);
    setCurrentStepIndex(0);
    setIsInteracted(false);
    setInteractionSuccess(false);

    const demoNotes = setupDemoElements();
    if (demoNotes && demoNotes.length > 0 && centerOnNote) {
      setTimeout(() => centerOnNote(demoNotes[0]), 100);
    }
  }, [setupDemoElements, centerOnNote]);

  // Skip Tour
  const skipTour = useCallback(() => {
    setShowWelcome(false);
    setIsActive(false);
    localStorage.setItem(TUTORIAL_STORAGE_KEY, JSON.stringify({ completed: false, skipped: true, timestamp: Date.now() }));
  }, []);

  // Next Step
  const nextStep = useCallback(() => {
    setIsInteracted(false);
    setInteractionSuccess(false);

    if (currentStepIndex < TUTORIAL_STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      // Reached end of tour
      setIsActive(false);
      setShowFinish(true);
    }
  }, [currentStepIndex]);

  // Prev Step
  const prevStep = useCallback(() => {
    setIsInteracted(false);
    setInteractionSuccess(false);
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  }, [currentStepIndex]);

  // Finish Tour
  const finishTour = useCallback(
    (keepDemoNotes: boolean) => {
      setShowFinish(false);
      setIsActive(false);
      localStorage.setItem(
        TUTORIAL_STORAGE_KEY,
        JSON.stringify({ completed: true, skipped: false, timestamp: Date.now() })
      );

      if (!keepDemoNotes) {
        // Clean up demonstration notes
        demoNoteIds.forEach((id) => deleteNote(id));
        if (demoGroupId) deleteGroup(demoGroupId);
        if (demoConnectionId) deleteConnection(demoConnectionId);
      }
    },
    [demoNoteIds, demoGroupId, demoConnectionId, deleteNote, deleteGroup, deleteConnection]
  );

  // Reset progress (for Replay Tour / Settings)
  const resetTutorialProgress = useCallback(() => {
    localStorage.removeItem(TUTORIAL_STORAGE_KEY);
    startTour();
  }, [startTour]);

  // Interaction triggers
  const notifyNoteDragged = useCallback(
    (_noteId?: string) => {
      if (isActive && currentStep?.id === 'step_6_drag_note') {
        setIsInteracted(true);
        setInteractionSuccess(true);
        setTimeout(() => {
          nextStep();
        }, 1200);
      }
    },
    [isActive, currentStep, nextStep]
  );

  const notifyNoteResized = useCallback(
    (_noteId?: string) => {
      if (isActive && currentStep?.id === 'step_7_resize_note') {
        setIsInteracted(true);
        setInteractionSuccess(true);
        setTimeout(() => {
          nextStep();
        }, 1200);
      }
    },
    [isActive, currentStep, nextStep]
  );

  const notifyColorSelected = useCallback(
    (_color?: NoteColor) => {
      if (isActive && currentStep?.id === 'step_3_color_select') {
        setIsInteracted(true);
        setInteractionSuccess(true);
        setTimeout(() => {
          nextStep();
        }, 1000);
      }
    },
    [isActive, currentStep, nextStep]
  );

  return {
    showWelcome,
    showFinish,
    isActive,
    currentStepIndex,
    currentStep,
    totalSteps: TUTORIAL_STEPS.length,
    isInteracted,
    interactionSuccess,
    startTour,
    skipTour,
    nextStep,
    prevStep,
    finishTour,
    resetTutorialProgress,
    notifyNoteDragged,
    notifyNoteResized,
    notifyColorSelected,
  };
}
