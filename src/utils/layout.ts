import { StickyNote, Group, Connection } from '../types';

export type OrganizeMode =
  | 'grid'
  | 'by_group'
  | 'by_color'
  | 'align_horizontal'
  | 'align_vertical'
  | 'flow'
  | 'scatter';

export interface LayoutResult {
  notes: StickyNote[];
  groups: Group[];
}

/**
 * Generates an automated radial/hierarchical Concept Map layout from selected notes
 * with automatic curved connections branching out from the central concept.
 */
export function generateConceptMap(
  selectedNotes: StickyNote[],
  rootNoteId?: string,
  centerPos = { x: 500, y: 400 }
): { notes: StickyNote[]; connections: Connection[] } {
  if (selectedNotes.length === 0) return { notes: [], connections: [] };

  const notesCopy = selectedNotes.map((n) => ({ ...n }));
  const rootNote =
    (rootNoteId ? notesCopy.find((n) => n.id === rootNoteId) : null) ||
    notesCopy.find((n) => n.starred) ||
    notesCopy[0];

  const childNotes = notesCopy.filter((n) => n.id !== rootNote.id);
  const createdConnections: Connection[] = [];
  const baseTimestamp = Date.now();

  // Place root at center
  rootNote.x = centerPos.x - rootNote.width / 2;
  rootNote.y = centerPos.y - rootNote.height / 2;
  rootNote.rotation = 0;

  if (childNotes.length === 0) {
    return { notes: [rootNote], connections: [] };
  }

  // Position children in radial orbits around root
  const radius = Math.max(320, childNotes.length * 45);
  const angleStep = (2 * Math.PI) / childNotes.length;

  childNotes.forEach((child, idx) => {
    const angle = idx * angleStep - Math.PI / 2;
    child.x = Math.round(centerPos.x + Math.cos(angle) * radius - child.width / 2);
    child.y = Math.round(centerPos.y + Math.sin(angle) * radius - child.height / 2);
    child.rotation = ((idx % 3) - 1) * 1.2;

    createdConnections.push({
      id: `conn_cmap_${baseTimestamp}_${idx}`,
      sourceId: rootNote.id,
      targetId: child.id,
      type: 'arrow',
      label: 'relates to',
      createdAt: baseTimestamp,
    });
  });

  return {
    notes: [rootNote, ...childNotes],
    connections: createdConnections,
  };
}

/**
 * Gently scatters notes around an organic area for creative brainstorming sessions.
 */
export function scatterNotes(
  notesToScatter: StickyNote[],
  centerPos = { x: 500, y: 400 },
  spreadRadius = 380
): StickyNote[] {
  return notesToScatter.map((note, idx) => {
    const angle = (idx / notesToScatter.length) * 2 * Math.PI + (Math.random() * 0.4 - 0.2);
    const dist = spreadRadius * (0.4 + Math.random() * 0.7);
    const randomTilt = Math.random() * 5 - 2.5; // -2.5° to +2.5°

    return {
      ...note,
      x: Math.round(centerPos.x + Math.cos(angle) * dist - note.width / 2),
      y: Math.round(centerPos.y + Math.sin(angle) * dist - note.height / 2),
      rotation: Number(randomTilt.toFixed(1)),
      updatedAt: Date.now(),
    };
  });
}

/**
 * Organizes notes and groups automatically according to specified layout algorithm.
 */
export function organizeCanvas(
  notes: StickyNote[],
  groups: Group[],
  connections: Connection[],
  mode: OrganizeMode,
  startX = 100,
  startY = 100
): LayoutResult {
  if (notes.length === 0) return { notes, groups };

  const updatedNotes = [...notes];
  const updatedGroups = [...groups];

  switch (mode) {
    case 'scatter': {
      const avgX = updatedNotes.reduce((sum, n) => sum + n.x, 0) / updatedNotes.length;
      const avgY = updatedNotes.reduce((sum, n) => sum + n.y, 0) / updatedNotes.length;
      const scattered = scatterNotes(updatedNotes, { x: avgX, y: avgY });
      return { notes: scattered, groups };
    }

    case 'grid': {
      const cols = Math.ceil(Math.sqrt(updatedNotes.length * 1.5));
      const colWidth = 280;
      const rowHeight = 250;

      updatedNotes.forEach((note, index) => {
        const row = Math.floor(index / cols);
        const col = index % cols;
        note.x = startX + col * colWidth;
        note.y = startY + row * rowHeight;
        // Keep a subtle natural tilt
        note.rotation = ((index % 5) - 2) * 0.7;
      });
      break;
    }

    case 'by_color': {
      // Group notes by their colors
      const colorBuckets = new Map<string, StickyNote[]>();
      updatedNotes.forEach((n) => {
        const bucket = colorBuckets.get(n.color) || [];
        bucket.push(n);
        colorBuckets.set(n.color, bucket);
      });

      let currentX = startX;
      colorBuckets.forEach((bucketNotes) => {
        let currentY = startY;
        bucketNotes.forEach((note, idx) => {
          note.x = currentX;
          note.y = currentY;
          note.rotation = ((idx % 3) - 1) * 0.8;
          currentY += note.height + 40;
        });
        currentX += 300;
      });
      break;
    }

    case 'align_horizontal': {
      // Sort by current X position
      updatedNotes.sort((a, b) => a.x - b.x);
      const avgY = updatedNotes.reduce((acc, n) => acc + n.y, 0) / updatedNotes.length;
      let currX = startX;

      updatedNotes.forEach((note, idx) => {
        note.x = currX;
        note.y = avgY;
        note.rotation = ((idx % 3) - 1) * 0.5;
        currX += note.width + 40;
      });
      break;
    }

    case 'align_vertical': {
      // Sort by current Y position
      updatedNotes.sort((a, b) => a.y - b.y);
      const avgX = updatedNotes.reduce((acc, n) => acc + n.x, 0) / updatedNotes.length;
      let currY = startY;

      updatedNotes.forEach((note, idx) => {
        note.x = avgX;
        note.y = currY;
        note.rotation = ((idx % 3) - 1) * 0.5;
        currY += note.height + 40;
      });
      break;
    }

    case 'by_group': {
      let groupOffsetY = startY;
      const groupedNoteIds = new Set<string>();

      updatedGroups.forEach((group) => {
        const memberNotes = updatedNotes.filter((n) => n.groupId === group.id);
        if (memberNotes.length > 0) {
          group.x = startX;
          group.y = groupOffsetY;

          const cols = Math.min(3, memberNotes.length);
          const colW = 260;
          const rowH = 230;

          memberNotes.forEach((note, idx) => {
            groupedNoteIds.add(note.id);
            const r = Math.floor(idx / cols);
            const c = idx % cols;
            note.x = group.x + 40 + c * colW;
            note.y = group.y + 70 + r * rowH;
          });

          const totalRows = Math.ceil(memberNotes.length / cols);
          group.width = Math.max(320, 80 + cols * colW);
          group.height = 100 + totalRows * rowH;

          groupOffsetY += group.height + 60;
        }
      });

      // Place ungrouped notes in a column to the right
      const ungrouped = updatedNotes.filter((n) => !groupedNoteIds.has(n.id));
      if (ungrouped.length > 0) {
        let ungroupedX = startX + 900;
        let ungroupedY = startY;
        ungrouped.forEach((note, idx) => {
          note.x = ungroupedX;
          note.y = ungroupedY;
          note.rotation = ((idx % 3) - 1) * 0.6;
          ungroupedY += note.height + 40;
          if (idx > 0 && idx % 4 === 0) {
            ungroupedX += 280;
            ungroupedY = startY;
          }
        });
      }
      break;
    }

    case 'flow': {
      // Topological-like layout along connections
      const visited = new Set<string>();
      const nodeMap = new Map(updatedNotes.map((n) => [n.id, n]));
      const incomingEdges = new Map<string, string[]>();
      const outgoingEdges = new Map<string, string[]>();

      connections.forEach((conn) => {
        const outList = outgoingEdges.get(conn.sourceId) || [];
        outList.push(conn.targetId);
        outgoingEdges.set(conn.sourceId, outList);

        const inList = incomingEdges.get(conn.targetId) || [];
        inList.push(conn.sourceId);
        incomingEdges.set(conn.targetId, inList);
      });

      // Find root notes (nodes with no incoming connections)
      const roots = updatedNotes.filter((n) => !incomingEdges.has(n.id) || incomingEdges.get(n.id)!.length === 0);
      const queue: { id: string; level: number; lane: number }[] = [];

      roots.forEach((root, idx) => {
        queue.push({ id: root.id, level: 0, lane: idx });
      });

      const levels = new Map<number, StickyNote[]>();

      while (queue.length > 0) {
        const { id, level } = queue.shift()!;
        if (visited.has(id)) continue;
        visited.add(id);

        const note = nodeMap.get(id);
        if (note) {
          const list = levels.get(level) || [];
          list.push(note);
          levels.set(level, list);

          const nextTargets = outgoingEdges.get(id) || [];
          nextTargets.forEach((targetId, tIdx) => {
            if (!visited.has(targetId)) {
              queue.push({ id: targetId, level: level + 1, lane: tIdx });
            }
          });
        }
      }

      // Any remaining disconnected notes
      updatedNotes.forEach((n) => {
        if (!visited.has(n.id)) {
          const list = levels.get(0) || [];
          list.push(n);
          levels.set(0, list);
        }
      });

      // Position by level and lane
      levels.forEach((notesAtLevel, level) => {
        const levelY = startY + level * 260;
        notesAtLevel.forEach((note, idx) => {
          note.x = startX + idx * 300;
          note.y = levelY;
          note.rotation = ((idx % 3) - 1) * 0.7;
        });
      });
      break;
    }
  }

  return { notes: updatedNotes, groups: updatedGroups };
}
