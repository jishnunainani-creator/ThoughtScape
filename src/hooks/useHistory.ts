import { useState, useCallback, useRef } from 'react';
import { StickyNote, Group, Connection } from '../types';

export interface HistorySnapshot {
  notes: StickyNote[];
  groups: Group[];
  connections: Connection[];
}

export function useHistory(initialState: HistorySnapshot) {
  const [past, setPast] = useState<HistorySnapshot[]>([]);
  const [present, setPresent] = useState<HistorySnapshot>(initialState);
  const [future, setFuture] = useState<HistorySnapshot[]>([]);

  const presentRef = useRef<HistorySnapshot>(present);
  presentRef.current = present;

  const pushState = useCallback((nextState: HistorySnapshot) => {
    setPast((prevPast) => {
      // Don't push identical snapshots
      const current = presentRef.current;
      if (JSON.stringify(current) === JSON.stringify(nextState)) {
        return prevPast;
      }
      return [...prevPast.slice(-40), current];
    });
    setPresent(nextState);
    setFuture([]);
  }, []);

  const undo = useCallback((): HistorySnapshot | null => {
    if (past.length === 0) return null;

    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);

    setPast(newPast);
    setFuture((prevFuture) => [present, ...prevFuture]);
    setPresent(previous);

    return previous;
  }, [past, present]);

  const redo = useCallback((): HistorySnapshot | null => {
    if (future.length === 0) return null;

    const next = future[0];
    const newFuture = future.slice(1);

    setPast((prevPast) => [...prevPast, present]);
    setPresent(next);
    setFuture(newFuture);

    return next;
  }, [future, present]);

  return {
    state: present,
    setState: setPresent,
    pushState,
    undo,
    redo,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
  };
}
