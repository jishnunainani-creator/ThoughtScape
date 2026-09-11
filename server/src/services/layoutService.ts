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

    // If clusters exist, use cluster-first structured layout
    if (clusters.length > 0) {
      const clusterPaddingX = 24;
      const clusterPaddingY = 20;
      const headerH = 54;
      const noteGapX = 20;
      const noteGapY = 20;
      const clusterGapX = 60;
      const clusterGapY = 60;

      // Determine grid configuration for clusters
      const totalClusters = clusters.length;
      const gridCols = totalClusters <= 2 ? totalClusters : totalClusters <= 4 ? 2 : 3;

      // First pass: compute each cluster's dimensions
      const clusterDims = clusters.map((c) => {
        const memberThoughts = thoughts.filter((t) => t.clusterTempId === c.tempId);
        const count = memberThoughts.length;
        const innerCols = count >= 2 ? 2 : 1;
        const innerRows = Math.max(1, Math.ceil(count / innerCols));
        const width = clusterPaddingX * 2 + innerCols * noteWidth + (innerCols - 1) * noteGapX;
        const height = headerH + clusterPaddingY + innerRows * noteHeight + (innerRows - 1) * noteGapY + clusterPaddingY;
        return {
          cluster: c,
          members: memberThoughts,
          innerCols,
          innerRows,
          width,
          height,
        };
      });

      // Calculate row heights and col widths
      const colWidths: number[] = new Array(gridCols).fill(0);
      const rowHeights: number[] = [];

      clusterDims.forEach((cd, idx) => {
        const col = idx % gridCols;
        const row = Math.floor(idx / gridCols);
        colWidths[col] = Math.max(colWidths[col] || 0, cd.width);
        rowHeights[row] = Math.max(rowHeights[row] || 0, cd.height);
      });

      const totalGridWidth = colWidths.reduce((sum, w) => sum + w, 0) + (gridCols - 1) * clusterGapX;
      const startX = Math.round(centerX - totalGridWidth / 2);
      const startY = Math.round(centerY - 100);

      const clusterResults: { tempId: string; x: number; y: number; width: number; height: number }[] = [];
      const notePositions = new Map<string, { x: number; y: number }>();

      // Position clusters & their member notes
      clusterDims.forEach((cd, idx) => {
        const col = idx % gridCols;
        const row = Math.floor(idx / gridCols);

        let currentClusterX = startX;
        for (let c = 0; c < col; c++) {
          currentClusterX += colWidths[c] + clusterGapX;
        }

        let currentClusterY = startY;
        for (let r = 0; r < row; r++) {
          currentClusterY += rowHeights[r] + clusterGapY;
        }

        const clusterBox = {
          tempId: cd.cluster.tempId,
          x: Math.round(currentClusterX),
          y: Math.round(currentClusterY),
          width: Math.round(cd.width),
          height: Math.round(cd.height),
        };
        clusterResults.push(clusterBox);

        // Position notes inside cluster box
        cd.members.forEach((thought, mIdx) => {
          const mCol = mIdx % cd.innerCols;
          const mRow = Math.floor(mIdx / cd.innerCols);
          const nx = clusterBox.x + clusterPaddingX + mCol * (noteWidth + noteGapX);
          const ny = clusterBox.y + headerH + mRow * (noteHeight + noteGapY);
          notePositions.set(thought.tempId, { x: Math.round(nx), y: Math.round(ny) });
        });
      });

      // Position any unclustered thoughts
      const unclustered = thoughts.filter((t) => !t.clusterTempId || !clusters.some((c) => c.tempId === t.clusterTempId));
      unclustered.forEach((t, uIdx) => {
        const nx = startX + uIdx * (noteWidth + 30);
        const ny = startY - noteHeight - 60;
        notePositions.set(t.tempId, { x: Math.round(nx), y: Math.round(ny) });
      });

      const notes = thoughts.map((t) => {
        const pos = notePositions.get(t.tempId) || { x: centerX, y: centerY };
        return {
          tempId: t.tempId,
          x: pos.x,
          y: pos.y,
          width: noteWidth,
          height: noteHeight,
        };
      });

      return { notes, clusters: clusterResults };
    }

    // Fallback: No clusters provided -> role-based positioning
    const paddingX = 60;
    const paddingY = 60;

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

    mainThoughts.forEach((t, i) => {
      notePositions.set(t.tempId, {
        x: centerX + (i - (mainThoughts.length - 1) / 2) * (noteWidth + paddingX),
        y: centerY - 40,
      });
    });

    prereqThoughts.forEach((t, i) => {
      const col = Math.floor(i / 2);
      const row = i % 2;
      notePositions.set(t.tempId, {
        x: centerX - (noteWidth + paddingX + 80) * (col + 1),
        y: centerY - 160 + row * (noteHeight + paddingY),
      });
    });

    mechThoughts.forEach((t, i) => {
      notePositions.set(t.tempId, {
        x: centerX + (i - (mechThoughts.length - 1) / 2) * (noteWidth + paddingX),
        y: centerY + noteHeight + paddingY,
      });
    });

    appThoughts.forEach((t, i) => {
      const col = Math.floor(i / 2);
      const row = i % 2;
      notePositions.set(t.tempId, {
        x: centerX + (noteWidth + paddingX + 80) * (col + 1),
        y: centerY - 140 + row * (noteHeight + paddingY),
      });
    });

    exampleThoughts.forEach((t, i) => {
      notePositions.set(t.tempId, {
        x: centerX + (i - (exampleThoughts.length - 1) / 2) * (noteWidth + paddingX),
        y: centerY + (noteHeight + paddingY) * 2 + 20,
      });
    });

    unclassified.forEach((t, i) => {
      const angle = (i / Math.max(1, unclassified.length)) * Math.PI * 2;
      const radius = 450;
      notePositions.set(t.tempId, {
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
      });
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
      clusters: [],
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
