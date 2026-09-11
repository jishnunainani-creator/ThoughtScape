import React, { useState, useEffect } from 'react';
import {
  StickyNote as StickyNoteType,
  Group as GroupType,
  Connection,
  NoteStack as NoteStackType,
  NoteColor,
  NoteType,
  LearningState,
  EnvironmentDefinition,
  LandscapeEnvironmentSettings,
  NoteVisualTheme,
} from '../../types';
import { StickyNote } from './StickyNote';
import { GroupSection } from './GroupSection';
import { ConnectionLayer } from './ConnectionLayer';
import { NoteStack } from './NoteStack';
import { NoteToolbar } from './NoteToolbar';
import { EmptyState } from './EmptyState';
import { EnvironmentLayer } from './EnvironmentLayer';
import { getEnvironmentById } from '../../constants/environments';

interface CanvasProps {
  notes: StickyNoteType[];
  groups: GroupType[];
  connections: Connection[];
  stacks: NoteStackType[];
  selectedNoteId: string | null;
  selectedGroupId: string | null;
  selectedConnectionId: string | null;
  selectedStackId: string | null;
  connectingSourceId: string | null;
  focusedGroupId: string | null;
  transform: { x: number; y: number; scale: number };
  isPanning: boolean;
  isPresentationMode?: boolean;
  environment?: EnvironmentDefinition;
  environmentSettings?: LandscapeEnvironmentSettings;
  globalNoteStyle?: NoteVisualTheme;
  canvasContainerRef: React.RefObject<HTMLDivElement | null>;
  onSelectNote: (id: string | null) => void;
  onSelectGroup: (id: string | null) => void;
  onSelectConnection: (id: string | null) => void;
  onSelectStack: (id: string | null) => void;
  onUpdateNote: (id: string, updates: Partial<StickyNoteType>, commitHistory?: boolean) => void;
  onDeleteNote: (id: string) => void;
  onDuplicateNote: (id: string) => void;
  onToggleStar: (id: string) => void;
  onTogglePin: (id: string) => void;
  onToggleLockNote: (id: string) => void;
  onChangeLearningState: (id: string, state: LearningState) => void;
  onChangeNoteColor: (id: string, color: NoteColor) => void;
  onChangeNoteType: (id: string, type: NoteType) => void;
  onBringToFront: (id: string) => void;
  onSendToBack: (id: string) => void;
  onCopyNoteText: (id: string) => void;
  onUpdateGroup: (id: string, updates: Partial<GroupType>, commitHistory?: boolean) => void;
  onDeleteGroup: (id: string) => void;
  onFocusGroup: (groupId: string | null) => void;
  onUpdateNotePositions: (notes: StickyNoteType[]) => void;
  onStartConnection: (sourceId: string) => void;
  onEndConnection: (targetId: string) => void;
  onUpdateConnection: (id: string, updates: Partial<Connection>) => void;
  onDeleteConnection: (id: string) => void;
  onUpdateStack: (id: string, updates: Partial<NoteStackType>) => void;
  onDeleteStack: (id: string) => void;
  onTakeOneFromStack: (stackId: string) => void;
  onDisbandStack: (stackId: string) => void;
  onNavigateToNote: (titleOrId: string) => void;
  onOpenContextMenu: (
    e: React.MouseEvent,
    type: 'canvas' | 'note' | 'group' | 'stack',
    targetId?: string
  ) => void;
  onCreateNote: (color: NoteColor) => void;
  onOpenTemplates: () => void;
  onStartPan: (clientX: number, clientY: number) => void;
  onUpdatePan: (clientX: number, clientY: number) => void;
  onEndPan: () => void;
  onZoomAtPoint: (factor: number, clientX?: number, clientY?: number) => void;
  screenToWorld: (x: number, y: number) => { x: number; y: number };
}

export const Canvas: React.FC<CanvasProps> = ({
  notes,
  groups,
  connections,
  stacks,
  selectedNoteId,
  selectedGroupId,
  selectedConnectionId,
  selectedStackId,
  connectingSourceId,
  focusedGroupId,
  transform,
  isPanning,
  isPresentationMode = false,
  environment,
  environmentSettings,
  globalNoteStyle = 'classic',
  canvasContainerRef,
  onSelectNote,
  onSelectGroup,
  onSelectConnection,
  onSelectStack,
  onUpdateNote,
  onDeleteNote,
  onDuplicateNote,
  onToggleStar,
  onTogglePin,
  onToggleLockNote,
  onChangeLearningState,
  onChangeNoteColor,
  onChangeNoteType,
  onBringToFront,
  onSendToBack,
  onCopyNoteText,
  onUpdateGroup,
  onDeleteGroup,
  onFocusGroup,
  onUpdateNotePositions,
  onStartConnection,
  onEndConnection,
  onUpdateConnection,
  onDeleteConnection,
  onUpdateStack,
  onDeleteStack,
  onTakeOneFromStack,
  onDisbandStack,
  onNavigateToNote,
  onOpenContextMenu,
  onCreateNote,
  onOpenTemplates,
  onStartPan,
  onUpdatePan,
  onEndPan,
  onZoomAtPoint,
  screenToWorld,
}) => {
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [cursorWorldPos, setCursorWorldPos] = useState<{ x: number; y: number } | null>(null);

  const selectedNote = notes.find((n) => n.id === selectedNoteId);
  const connectingSourceNote = notes.find((n) => n.id === connectingSourceId) || null;

  // Space key tracking for Pan tool
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat) {
        const active = document.activeElement;
        const isInput =
          active instanceof HTMLInputElement ||
          active instanceof HTMLTextAreaElement ||
          (active instanceof HTMLElement && active.isContentEditable);
        if (!isInput) {
          setIsSpacePressed(true);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Mouse Wheel Zoom / Pan
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
      onZoomAtPoint(zoomFactor, e.clientX, e.clientY);
    } else {
      // Pan on 2-finger trackpad scroll
      e.preventDefault();
      onUpdatePan(transform.x - e.deltaX, transform.y - e.deltaY);
    }
  };

  // Canvas Pointer Events
  const handleCanvasPointerDown = (e: React.PointerEvent) => {
    if (e.button === 1 || isSpacePressed || e.target === canvasContainerRef.current) {
      e.preventDefault();
      onStartPan(e.clientX, e.clientY);
    } else if (e.target === canvasContainerRef.current) {
      onSelectNote(null);
      onSelectGroup(null);
      onSelectConnection(null);
      onSelectStack(null);
    }
  };

  const handleCanvasPointerMove = (e: React.PointerEvent) => {
    const worldPos = screenToWorld(e.clientX, e.clientY);
    setCursorWorldPos(worldPos);

    if (isPanning) {
      onUpdatePan(e.clientX, e.clientY);
    }
  };

  const handleCanvasPointerUp = () => {
    if (isPanning) {
      onEndPan();
    }
  };

  // Right-click context menu
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    const targetElement = e.target as HTMLElement;

    const noteEl = targetElement.closest('[data-note-id]');
    if (noteEl) {
      const noteId = noteEl.getAttribute('data-note-id');
      if (noteId) {
        onSelectNote(noteId);
        onOpenContextMenu(e, 'note', noteId);
        return;
      }
    }

    onOpenContextMenu(e, 'canvas');
  };

  return (
    <div
      ref={canvasContainerRef}
      data-tutorial="canvas"
      onWheel={handleWheel}
      onPointerDown={handleCanvasPointerDown}
      onPointerMove={handleCanvasPointerMove}
      onPointerUp={handleCanvasPointerUp}
      onContextMenu={handleContextMenu}
      style={{
        cursor: isSpacePressed ? (isPanning ? 'grabbing' : 'grab') : 'default',
        touchAction: 'none',
      }}
      className="relative w-full h-full overflow-hidden select-none"
    >
      {/* Personalized Thoughtscape Environment Layer */}
      <EnvironmentLayer
        environment={environment || getEnvironmentById('white-wall')}
        settings={environmentSettings}
        pan={{ x: transform.x, y: transform.y }}
        zoom={transform.scale}
        isPresentationMode={isPresentationMode}
      />

      {/* Scalable & Pannable World Layer */}
      <div
        id="knowledge-canvas-layer"
        style={{
          position: 'absolute',
          transformOrigin: '0 0',
          transform: `translate3d(${transform.x}px, ${transform.y}px, 0) scale(${transform.scale})`,
          width: '100%',
          height: '100%',
          pointerEvents: isPanning ? 'none' : 'auto',
        }}
      >
        {/* Thought Clusters */}
        {groups.map((group) => {
          const isDimmed = focusedGroupId && focusedGroupId !== group.id;
          return (
            <div
              key={group.id}
              style={{
                opacity: isDimmed ? 0.25 : 1,
                transition: 'opacity 0.25s ease',
              }}
            >
              <GroupSection
                group={group}
                notes={notes}
                isSelected={selectedGroupId === group.id}
                scale={transform.scale}
                onSelect={(e) => {
                  e.stopPropagation();
                  onSelectGroup(group.id);
                }}
                onUpdateGroup={(updates, commit) => onUpdateGroup(group.id, updates, commit)}
                onDeleteGroup={() => onDeleteGroup(group.id)}
                onUpdateNotePositions={onUpdateNotePositions}
                onFocusGroup={() => onFocusGroup(group.id)}
              />
            </div>
          );
        })}

        {/* Dynamic Curved Connection Arrows Layer */}
        <ConnectionLayer
          connections={connections}
          notes={notes}
          selectedConnectionId={selectedConnectionId}
          onSelectConnection={onSelectConnection}
          onUpdateConnection={onUpdateConnection}
          onDeleteConnection={onDeleteConnection}
          connectingSourceNote={connectingSourceNote}
          cursorWorldPos={cursorWorldPos}
        />

        {/* Note Stacks */}
        {stacks.map((stack) => (
          <NoteStack
            key={stack.id}
            stack={stack}
            notes={notes}
            isSelected={selectedStackId === stack.id}
            scale={transform.scale}
            onSelect={(e) => {
              e.stopPropagation();
              onSelectStack(stack.id);
            }}
            onUpdateStack={(updates) => onUpdateStack(stack.id, updates)}
            onDeleteStack={() => onDeleteStack(stack.id)}
            onTakeOneNote={onTakeOneFromStack}
            onDisbandStack={onDisbandStack}
          />
        ))}

        {/* Sticky Notes */}
        {notes.map((note) => {
          const isDimmed = focusedGroupId && note.groupId !== focusedGroupId;
          return (
            <div
              key={note.id}
              style={{
                opacity: isDimmed ? 0.2 : 1,
                transition: 'opacity 0.25s ease',
              }}
            >
              <StickyNote
                note={note}
                allNotes={notes}
                isSelected={selectedNoteId === note.id}
                isConnectingSource={connectingSourceId === note.id}
                scale={transform.scale}
                environment={environment}
                noteStyle={environmentSettings?.noteStyle || globalNoteStyle || 'classic'}
                onSelect={(e) => {
                  e.stopPropagation();
                  if (connectingSourceId && connectingSourceId !== note.id) {
                    onEndConnection(note.id);
                  } else {
                    onSelectNote(note.id);
                  }
                }}
                onUpdate={(updates, commit) => onUpdateNote(note.id, updates, commit)}
                onStartConnection={() => onStartConnection(note.id)}
                onNavigateToNote={onNavigateToNote}
              />
            </div>
          );
        })}
      </div>

      {/* Contextual Floating Toolbar for Selected Note */}
      {selectedNote && !isPanning && (
        <NoteToolbar
          note={selectedNote}
          scale={transform.scale}
          canvasX={transform.x}
          canvasY={transform.y}
          onColorChange={(color) => onChangeNoteColor(selectedNote.id, color)}
          onTypeChange={(type) => onChangeNoteType(selectedNote.id, type)}
          onToggleStar={() => onToggleStar(selectedNote.id)}
          onTogglePin={() => onTogglePin(selectedNote.id)}
          onToggleLock={() => onToggleLockNote(selectedNote.id)}
          onLearningStateChange={(state) => onChangeLearningState(selectedNote.id, state)}
          onDuplicate={() => onDuplicateNote(selectedNote.id)}
          onDelete={() => onDeleteNote(selectedNote.id)}
          onStartConnection={() => onStartConnection(selectedNote.id)}
          onBringToFront={() => onBringToFront(selectedNote.id)}
          onSendToBack={() => onSendToBack(selectedNote.id)}
          onCopyText={() => onCopyNoteText(selectedNote.id)}
        />
      )}

      {/* Empty State Welcome Illustration */}
      {notes.length === 0 && (
        <EmptyState onCreateNote={onCreateNote} onOpenTemplates={onOpenTemplates} />
      )}
    </div>
  );
};
