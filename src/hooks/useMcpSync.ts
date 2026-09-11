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
  const [isGenerating, setIsGenerating] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const lastReportedSelectionRef = useRef<string>('');
  const hasInitializedServerRef = useRef(false);

  const serverUrl = 'http://localhost:3001';

  // 1. Check health / connection actively
  const checkHealth = useCallback(async () => {
    try {
      const res = await fetch(`${serverUrl}/health`);
      if (res.ok) {
        setIsConnected(true);
        return true;
      }
    } catch {
      setIsConnected(false);
    }
    return false;
  }, [serverUrl]);

  // 2. Report real-time UI selection context to MCP Server
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
  }, [activeBoardId, selectedNoteId, selectedGroupId, notes, groups, serverUrl]);

  // 3. Connect to Server-Sent Events (SSE) stream for live updates
  const connectSse = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    try {
      const es = new EventSource(`${serverUrl}/sse`);
      eventSourceRef.current = es;

      es.onopen = () => {
        setIsConnected(true);

        // On first connection, initialize server if server is empty but browser has notes
        if (!hasInitializedServerRef.current) {
          hasInitializedServerRef.current = true;
          fetch(`${serverUrl}/api/workspace`)
            .then((r) => r.json())
            .then((serverWs: WorkspaceData) => {
              if (serverWs && serverWs.notes && serverWs.notes.length === 0 && notes.length > 0) {
                // Seed server with current browser workspace
                fetch(`${serverUrl}/api/workspace`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    version: 2,
                    appName: 'Thoughtscape',
                    lastModified: Date.now(),
                    boards: [{ id: activeBoardId, name: 'My Thoughtscape', createdAt: Date.now(), updatedAt: Date.now() }],
                    activeBoardId,
                    notes,
                    groups,
                    connections: [],
                  }),
                }).catch(() => {});
              }
            })
            .catch(() => {});
        }
      };

      es.onerror = () => {
        setIsConnected(false);
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
                `✨ AI Bridge created concept map for "${mapData.topic}" (${mapData.notes.length} thoughts, ${mapData.groups.length} clusters)`,
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
              onShowToast(`✨ AI Bridge added thought "${note.title || 'New Thought'}"`, 'info');
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
  }, [serverUrl, activeBoardId, notes, groups, onWorkspaceUpdate, onShowToast]);

  useEffect(() => {
    checkHealth();
    connectSse();
    const interval = setInterval(() => {
      checkHealth();
    }, 4000);

    return () => {
      clearInterval(interval);
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [checkHealth, connectSse]);

  // Execute AI Prompt directly from UI
  const executeAiPrompt = useCallback(
    async (topic: string, mapType = 'concept', detailLevel = 'detailed', userInstructions = '') => {
      if (!topic.trim()) return;
      setIsGenerating(true);
      try {
        const res = await fetch(`${serverUrl}/api/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            landscapeId: activeBoardId,
            topic: topic.trim(),
            mapType,
            detailLevel,
            userInstructions,
          }),
        });
        const data = await res.json();
        if (data.success) {
          if (onShowToast) {
            onShowToast(`✨ Generated concept map for "${topic}"!`, 'success');
          }
          // Fetch updated workspace
          const wsRes = await fetch(`${serverUrl}/api/workspace`);
          const wsData = await wsRes.json();
          if (onWorkspaceUpdate && wsData.boards) {
            onWorkspaceUpdate(wsData);
          }
        } else {
          if (onShowToast) {
            onShowToast(data.error || 'Failed to generate concept map', 'error');
          }
        }
      } catch (err: any) {
        if (onShowToast) {
          onShowToast(`Failed to connect to MCP server: ${err?.message || 'Server offline'}`, 'error');
        }
      } finally {
        setIsGenerating(false);
      }
    },
    [serverUrl, activeBoardId, onWorkspaceUpdate, onShowToast]
  );

  return {
    isConnected,
    serverUrl,
    activityLogs,
    isGenerating,
    reconnect: connectSse,
    executeAiPrompt,
  };
}
