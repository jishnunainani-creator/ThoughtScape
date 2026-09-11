import { useEffect, useState, useRef, useCallback } from 'react';
import { WorkspaceData, StickyNote, Group } from '../types';

interface UseMcpSyncProps {
  activeBoardId: string;
  selectedNoteId: string | null;
  selectedGroupId: string | null;
  notes: StickyNote[];
  groups: Group[];
  onWorkspaceUpdate?: (data: WorkspaceData) => void;
  onShowToast?: (message: string, type: 'info' | 'success' | 'warning' | 'error') => void;
}

export interface McpActivityLog {
  id: string;
  type: string;
  title: string;
  timestamp: number;
}

export function useMcpSync({
  activeBoardId,
  selectedNoteId,
  selectedGroupId,
  notes,
  groups,
  onWorkspaceUpdate,
  onShowToast,
}: UseMcpSyncProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [activityLogs, setActivityLogs] = useState<McpActivityLog[]>([]);
  const eventSourceRef = useRef<EventSource | null>(null);
  const lastReportedSelectionRef = useRef<string>('');

  const serverUrl = 'http://localhost:3001';

  // 1. Report real-time UI selection context to MCP Server
  useEffect(() => {
    const selectionKey = `${activeBoardId}:${selectedNoteId || ''}:${selectedGroupId || ''}`;
    if (selectionKey === lastReportedSelectionRef.current) return;
    lastReportedSelectionRef.current = selectionKey;

    const selectedNote = notes.find((n) => n.id === selectedNoteId);
    const selectedGroup = groups.find((g) => g.id === selectedGroupId);

    fetch(`${serverUrl}/api/context`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        activeBoardId,
        selectedNoteId,
        selectedNoteTitle: selectedNote?.title,
        selectedNoteContent: selectedNote?.content,
        selectedGroupId,
        selectedGroupTitle: selectedGroup?.title,
      }),
    }).catch(() => {
      // Server not running, ignore gracefully
    });
  }, [activeBoardId, selectedNoteId, selectedGroupId, notes, groups]);

  // 2. Connect to Server-Sent Events (SSE) stream for live updates
  const connectSse = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    try {
      const es = new EventSource(`${serverUrl}/sse`);
      eventSourceRef.current = es;

      es.onopen = () => {
        setIsConnected(true);
      };

      es.onerror = () => {
        setIsConnected(false);
        es.close();
      };

      es.addEventListener('thoughtscape:update', (e: MessageEvent) => {
        try {
          const event = JSON.parse(e.data);
          const type = event.type;

          if (type === 'thought_map_created') {
            const mapData = event.data;
            const logItem: McpActivityLog = {
              id: String(Date.now()),
              type: 'create_thought_map',
              title: `Created concept map for "${mapData.topic}" (${mapData.notes.length} thoughts)`,
              timestamp: Date.now(),
            };
            setActivityLogs((prev) => [logItem, ...prev].slice(0, 20));

            if (onShowToast) {
              onShowToast(
                `✨ ChatGPT created concept map for "${mapData.topic}" (${mapData.notes.length} thoughts, ${mapData.groups.length} clusters)`,
                'success'
              );
            }
          } else if (type === 'note_created') {
            const note = event.data;
            setActivityLogs((prev) => [
              {
                id: String(Date.now()),
                type: 'create_thought',
                title: `Created thought "${note.title || 'Thought'}"`,
                timestamp: Date.now(),
              },
              ...prev,
            ].slice(0, 20));

            if (onShowToast) {
              onShowToast(`✨ ChatGPT added thought "${note.title || 'New Thought'}"`, 'info');
            }
          } else if (type === 'connection_created') {
            const conn = event.data;
            setActivityLogs((prev) => [
              {
                id: String(Date.now()),
                type: 'create_connection',
                title: `Connected thoughts (${conn.label || 'arrow'})`,
                timestamp: Date.now(),
              },
              ...prev,
            ].slice(0, 20));
          }

          // Fetch full workspace state to synchronize React canvas
          fetch(`${serverUrl}/api/workspace`)
            .then((res) => res.json())
            .then((data: WorkspaceData) => {
              if (onWorkspaceUpdate && data.boards) {
                onWorkspaceUpdate(data);
              }
            })
            .catch((err) => console.error('Failed to sync workspace:', err));
        } catch (err) {
          console.error('Failed to parse SSE update:', err);
        }
      });
    } catch {
      setIsConnected(false);
    }
  }, [onWorkspaceUpdate, onShowToast]);

  useEffect(() => {
    connectSse();
    const interval = setInterval(() => {
      if (!isConnected) {
        connectSse();
      }
    }, 5000);

    return () => {
      clearInterval(interval);
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [connectSse, isConnected]);

  // Push local changes to server when local actions occur
  const syncLocalWorkspaceToServer = useCallback((workspaceData: WorkspaceData) => {
    fetch(`${serverUrl}/api/workspace`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(workspaceData),
    }).catch(() => {
      // Background sync, silently fail if server offline
    });
  }, []);

  return {
    isConnected,
    serverUrl,
    activityLogs,
    reconnect: connectSse,
    syncLocalWorkspaceToServer,
  };
}
