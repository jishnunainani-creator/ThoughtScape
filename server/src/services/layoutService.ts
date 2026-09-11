import { StickyNote, Group, Connection, MapThoughtSpec, MapClusterSpec } from '../types/index.js';

export interface LayoutResult {
  notes: { tempId: string; x: number; y: number; width: number; height: number }[];
  clusters: { tempId: string; x: number; y: number; width: number; height: number }[];
}

export class LayoutService {
  /**
   * Calculates spatial coordinates for generated concept maps.
   * Places the central/main concept near (centerX, centerY),
   * prerequisites to the top-left,
   * mechanisms in the center/middle,
   * applications to the right,
   * and examples/questions at the bottom.
   */
  public layoutConceptMap(
    thoughts: MapThoughtSpec[],
    clusters: MapClusterSpec[] = [],
    centerX = 600,
    centerY = 450
  ): LayoutResult {
    const noteWidth = 260;
    const noteHeight = 210;
    const paddingX = 60;
    const paddingY = 60;

    // Classify thoughts by role
    const mainThoughts = thoughts.filter((t) => t.role === 'main' || (!t.role && thoughts.indexOf(t) === 0));
    const prereqThoughts = thoughts.filter((t) => t.role === 'prerequisite');
    const mechThoughts = thoughts.filter((t) => t.role === 'mechanism' || (!t.role && !mainThoughts.includes(t) && thoughts.indexOf(t) < 4));
    const appThoughts = thoughts.filter((t) => t.role === 'application');
    const exampleThoughts = thoughts.filter((t) => t.role === 'example' || t.role === 'question');
    const unclassified = thoughts.filter(
      (t) =>
        !mainThoughts.includes(t) &&
        !prereqThoughts.includes(t) &&
        !mechThoughts.includes(t) &&
        !appThoughts.includes(t) &&
        !exampleThoughts.includes(t)
    );

    const notePositions = new Map<string, { x: number; y: number }>();

    // 1. Place Main Thoughts at center
    mainThoughts.forEach((t, i) => {
      notePositions.set(t.tempId, {
        x: centerX + (i - (mainThoughts.length - 1) / 2) * (noteWidth + paddingX),
        y: centerY - 40,
      });
    });

    // 2. Place Prerequisites at Left / Top-Left
    prereqThoughts.forEach((t, i) => {
      const col = Math.floor(i / 2);
      const row = i % 2;
      notePositions.set(t.tempId, {
        x: centerX - (noteWidth + paddingX + 80) * (col + 1),
        y: centerY - 160 + row * (noteHeight + paddingY),
      });
    });

    // 3. Place Core Mechanisms (Below / Around Main)
    mechThoughts.forEach((t, i) => {
      notePositions.set(t.tempId, {
        x: centerX + (i - (mechThoughts.length - 1) / 2) * (noteWidth + paddingX),
        y: centerY + noteHeight + paddingY,
      });
    });

    // 4. Place Applications at Right / Top-Right
    appThoughts.forEach((t, i) => {
      const col = Math.floor(i / 2);
      const row = i % 2;
      notePositions.set(t.tempId, {
        x: centerX + (noteWidth + paddingX + 80) * (col + 1),
        y: centerY - 140 + row * (noteHeight + paddingY),
      });
    });

    // 5. Place Examples & Questions Below
    exampleThoughts.forEach((t, i) => {
      notePositions.set(t.tempId, {
        x: centerX + (i - (exampleThoughts.length - 1) / 2) * (noteWidth + paddingX),
        y: centerY + (noteHeight + paddingY) * 2 + 20,
      });
    });

    // 6. Place any remaining unclassified in radial grid
    unclassified.forEach((t, i) => {
      const angle = (i / Math.max(1, unclassified.length)) * Math.PI * 2;
      const radius = 450;
      notePositions.set(t.tempId, {
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
      });
    });

    // Layout cluster bounding boxes based on thoughts they contain
    const clusterResults: { tempId: string; x: number; y: number; width: number; height: number }[] = [];

    clusters.forEach((cluster, idx) => {
      const containedThoughts = thoughts.filter((t) => t.clusterTempId === cluster.tempId);
      if (containedThoughts.length > 0) {
        let minX = Infinity;
        let minY = Infinity;
        let maxX = -Infinity;
        let maxY = -Infinity;

        containedThoughts.forEach((t) => {
          const pos = notePositions.get(t.tempId);
          if (pos) {
            minX = Math.min(minX, pos.x);
            minY = Math.min(minY, pos.y);
            maxX = Math.max(maxX, pos.x + noteWidth);
            maxY = Math.max(maxY, pos.y + noteHeight);
          }
        });

        const margin = 40;
        clusterResults.push({
          tempId: cluster.tempId,
          x: Math.round(minX - margin),
          y: Math.round(minY - margin - 30),
          width: Math.round(maxX - minX + margin * 2),
          height: Math.round(maxY - minY + margin * 2 + 30),
        });
      } else {
        // Standalone cluster box
        clusterResults.push({
          tempId: cluster.tempId,
          x: centerX + (idx - 1) * 380,
          y: centerY + 400,
          width: 340,
          height: 280,
        });
      }
    });

    const notes = thoughts.map((t) => {
      const pos = notePositions.get(t.tempId) || { x: centerX, y: centerY };
      return {
        tempId: t.tempId,
        x: Math.round(pos.x),
        y: Math.round(pos.y),
        width: noteWidth,
        height: noteHeight,
      };
    });

    return {
      notes,
      clusters: clusterResults,
    };
  }

  /**
   * Organizes existing notes on a board.
   */
  public organizeNotes(
    notes: StickyNote[],
    groups: Group[],
    mode: 'grid' | 'by_group' | 'by_color' | 'flow' | 'scatter'
  ): { updatedNotes: StickyNote[]; updatedGroups: Group[] } {
    const updatedNotes = [...notes];
    const updatedGroups = [...groups];

    const noteW = 260;
    const noteH = 210;
    const gap = 40;

    if (mode === 'grid') {
      const cols = Math.max(3, Math.ceil(Math.sqrt(notes.length * 1.5)));
      notes.forEach((note, idx) => {
        const col = idx % cols;
        const row = Math.floor(idx / cols);
        note.x = 200 + col * (noteW + gap);
        note.y = 200 + row * (noteH + gap);
        note.updatedAt = Date.now();
      });
    } else if (mode === 'by_color') {
      const colors = ['yellow', 'blue', 'pink', 'green', 'purple', 'orange', 'cyan', 'coral'];
      let currentX = 200;
      colors.forEach((color) => {
        const groupNotes = notes.filter((n) => n.color === color);
        if (groupNotes.length > 0) {
          groupNotes.forEach((n, idx) => {
            n.x = currentX;
            n.y = 200 + idx * (noteH + 20);
            n.updatedAt = Date.now();
          });
          currentX += noteW + gap;
        }
      });
    } else if (mode === 'scatter') {
      notes.forEach((note) => {
        note.x += (Math.random() - 0.5) * 80;
        note.y += (Math.random() - 0.5) * 80;
        note.updatedAt = Date.now();
      });
    }

    return { updatedNotes, updatedGroups };
  }
}
