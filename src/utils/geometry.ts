import { StickyNote } from '../types';

export interface Point {
  x: number;
  y: number;
}

export interface AnchorPoint extends Point {
  direction: 'top' | 'right' | 'bottom' | 'left';
}

/**
 * Calculates the four cardinal anchor points of a sticky note.
 */
export function getNoteAnchors(note: StickyNote): AnchorPoint[] {
  const { x, y, width, height } = note;
  return [
    { x: x + width / 2, y, direction: 'top' },
    { x: x + width, y: y + height / 2, direction: 'right' },
    { x: x + width / 2, y: y + height, direction: 'bottom' },
    { x, y: y + height / 2, direction: 'left' },
  ];
}

/**
 * Finds the optimal anchor pair between two notes for natural curved connections.
 */
export function getBestConnectionPoints(source: StickyNote, target: StickyNote) {
  const sourceAnchors = getNoteAnchors(source);
  const targetAnchors = getNoteAnchors(target);

  let minDistance = Infinity;
  let bestPair = {
    sourceAnchor: sourceAnchors[1], // default right
    targetAnchor: targetAnchors[3], // default left
  };

  for (const sAnchor of sourceAnchors) {
    for (const tAnchor of targetAnchors) {
      const dx = tAnchor.x - sAnchor.x;
      const dy = tAnchor.y - sAnchor.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Penalize awkward back-facing angles slightly for smoother flows
      let penalty = 0;
      if (sAnchor.direction === 'right' && dx < 0) penalty += 50;
      if (sAnchor.direction === 'left' && dx > 0) penalty += 50;
      if (sAnchor.direction === 'top' && dy > 0) penalty += 50;
      if (sAnchor.direction === 'bottom' && dy < 0) penalty += 50;

      const score = dist + penalty;
      if (score < minDistance) {
        minDistance = score;
        bestPair = { sourceAnchor: sAnchor, targetAnchor: tAnchor };
      }
    }
  }

  return bestPair;
}

/**
 * Generates an SVG path string for a smooth cubic bezier curve between two anchors.
 */
export function calculateBezierPath(
  start: AnchorPoint,
  end: AnchorPoint,
  curvature = 0.5
): { path: string; midPoint: Point; angle: number } {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const offset = Math.max(distance * curvature, 40);

  let cp1: Point = { x: start.x, y: start.y };
  let cp2: Point = { x: end.x, y: end.y };

  switch (start.direction) {
    case 'top': cp1.y -= offset; break;
    case 'right': cp1.x += offset; break;
    case 'bottom': cp1.y += offset; break;
    case 'left': cp1.x -= offset; break;
  }

  switch (end.direction) {
    case 'top': cp2.y -= offset; break;
    case 'right': cp2.x += offset; break;
    case 'bottom': cp2.y += offset; break;
    case 'left': cp2.x -= offset; break;
  }

  // Midpoint on cubic bezier curve at t = 0.5
  const t = 0.5;
  const mt = 1 - t;
  const midX = mt * mt * mt * start.x + 3 * mt * mt * t * cp1.x + 3 * mt * t * t * cp2.x + t * t * t * end.x;
  const midY = mt * mt * mt * start.y + 3 * mt * mt * t * cp1.y + 3 * mt * t * t * cp2.y + t * t * t * end.y;

  // Tangent at end point for arrow angle
  const angle = Math.atan2(end.y - cp2.y, end.x - cp2.x) * (180 / Math.PI);

  const path = `M ${start.x} ${start.y} C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${end.x} ${end.y}`;

  return {
    path,
    midPoint: { x: midX, y: midY },
    angle,
  };
}

/**
 * Calculates bounding box around a list of notes.
 */
export function getBoundingBox(notes: StickyNote[], padding = 100) {
  if (notes.length === 0) {
    return { minX: 0, minY: 0, maxX: 1200, maxY: 800, width: 1200, height: 800, centerX: 600, centerY: 400 };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const note of notes) {
    minX = Math.min(minX, note.x);
    minY = Math.min(minY, note.y);
    maxX = Math.max(maxX, note.x + note.width);
    maxY = Math.max(maxY, note.y + note.height);
  }

  minX -= padding;
  minY -= padding;
  maxX += padding;
  maxY += padding;

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
    centerX: (minX + maxX) / 2,
    centerY: (minY + maxY) / 2,
  };
}
