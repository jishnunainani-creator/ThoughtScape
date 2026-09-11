import { useState, useCallback, useRef } from 'react';
import { CanvasTransform, StickyNote } from '../types';
import { getBoundingBox } from '../utils/geometry';

const MIN_SCALE = 0.2;
const MAX_SCALE = 3.0;

export function useCanvas(initialTransform: CanvasTransform = { x: 0, y: 0, scale: 1 }) {
  const [transform, setTransform] = useState<CanvasTransform>(initialTransform);
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef<{ x: number; y: number; startTx: number; startTy: number } | null>(null);
  const canvasContainerRef = useRef<HTMLDivElement | null>(null);

  const screenToWorld = useCallback(
    (screenX: number, screenY: number) => {
      const container = canvasContainerRef.current;
      const rect = container ? container.getBoundingClientRect() : { left: 0, top: 0 };
      const relativeX = screenX - rect.left;
      const relativeY = screenY - rect.top;

      return {
        x: (relativeX - transform.x) / transform.scale,
        y: (relativeY - transform.y) / transform.scale,
      };
    },
    [transform]
  );

  const worldToScreen = useCallback(
    (worldX: number, worldY: number) => {
      const container = canvasContainerRef.current;
      const rect = container ? container.getBoundingClientRect() : { left: 0, top: 0 };
      return {
        x: worldX * transform.scale + transform.x + rect.left,
        y: worldY * transform.scale + transform.y + rect.top,
      };
    },
    [transform]
  );

  const startPan = useCallback(
    (clientX: number, clientY: number) => {
      setIsPanning(true);
      panStartRef.current = {
        x: clientX,
        y: clientY,
        startTx: transform.x,
        startTy: transform.y,
      };
    },
    [transform]
  );

  const updatePan = useCallback(
    (clientX: number, clientY: number) => {
      if (!panStartRef.current) return;
      const dx = clientX - panStartRef.current.x;
      const dy = clientY - panStartRef.current.y;

      setTransform((prev) => ({
        ...prev,
        x: panStartRef.current!.startTx + dx,
        y: panStartRef.current!.startTy + dy,
      }));
    },
    []
  );

  const endPan = useCallback(() => {
    setIsPanning(false);
    panStartRef.current = null;
  }, []);

  const zoomAtPoint = useCallback((factor: number, centerX?: number, centerY?: number) => {
    setTransform((prev) => {
      const container = canvasContainerRef.current;
      const rect = container ? container.getBoundingClientRect() : { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };

      const px = centerX !== undefined ? centerX - rect.left : rect.width / 2;
      const py = centerY !== undefined ? centerY - rect.top : rect.height / 2;

      const newScale = Math.min(Math.max(prev.scale * factor, MIN_SCALE), MAX_SCALE);
      const scaleRatio = newScale / prev.scale;

      const newX = px - (px - prev.x) * scaleRatio;
      const newY = py - (py - prev.y) * scaleRatio;

      return {
        x: newX,
        y: newY,
        scale: newScale,
      };
    });
  }, []);

  const zoomIn = useCallback(() => zoomAtPoint(1.2), [zoomAtPoint]);
  const zoomOut = useCallback(() => zoomAtPoint(0.8), [zoomAtPoint]);
  const resetZoom = useCallback(() => {
    setTransform({ x: 100, y: 50, scale: 1 });
  }, []);

  const fitToNotes = useCallback((notes: StickyNote[]) => {
    if (notes.length === 0) {
      resetZoom();
      return;
    }

    const container = canvasContainerRef.current;
    if (!container) return;

    const bounds = getBoundingBox(notes, 120);
    const rect = container.getBoundingClientRect();

    const scaleX = rect.width / bounds.width;
    const scaleY = rect.height / bounds.height;
    const scale = Math.min(Math.max(Math.min(scaleX, scaleY), 0.35), 1.4);

    const x = rect.width / 2 - bounds.centerX * scale;
    const y = rect.height / 2 - bounds.centerY * scale;

    setTransform({ x, y, scale });
  }, [resetZoom]);

  const centerOnNote = useCallback((note: StickyNote) => {
    const container = canvasContainerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const scale = Math.max(transform.scale, 0.9);

    const noteCenterX = note.x + note.width / 2;
    const noteCenterY = note.y + note.height / 2;

    const targetX = rect.width / 2 - noteCenterX * scale;
    const targetY = rect.height / 2 - noteCenterY * scale;

    setTransform({
      x: targetX,
      y: targetY,
      scale,
    });
  }, [transform.scale]);

  const panToWorld = useCallback((worldX: number, worldY: number) => {
    setTransform((prev) => ({
      ...prev,
      x: -worldX * prev.scale,
      y: -worldY * prev.scale,
    }));
  }, []);

  return {
    transform,
    setTransform,
    isPanning,
    startPan,
    updatePan,
    endPan,
    zoomIn,
    zoomOut,
    zoomAtPoint,
    resetZoom,
    fitToNotes,
    centerOnNote,
    panToWorld,
    screenToWorld,
    worldToScreen,
    canvasContainerRef,
  };
}
