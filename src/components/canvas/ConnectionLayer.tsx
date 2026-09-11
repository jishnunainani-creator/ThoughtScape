import React, { useState } from 'react';
import { Connection, StickyNote } from '../../types';
import { getBestConnectionPoints, calculateBezierPath } from '../../utils/geometry';
import { Trash2 } from 'lucide-react';

interface ConnectionLayerProps {
  connections: Connection[];
  notes: StickyNote[];
  selectedConnectionId: string | null;
  onSelectConnection: (id: string) => void;
  onUpdateConnection: (id: string, updates: Partial<Connection>) => void;
  onDeleteConnection: (id: string) => void;
  connectingSourceNote: StickyNote | null;
  cursorWorldPos?: { x: number; y: number } | null;
}

export const ConnectionLayer: React.FC<ConnectionLayerProps> = ({
  connections,
  notes,
  selectedConnectionId,
  onSelectConnection,
  onUpdateConnection,
  onDeleteConnection,
  connectingSourceNote,
  cursorWorldPos,
}) => {
  const [editingLabelId, setEditingLabelId] = useState<string | null>(null);
  const [labelText, setLabelText] = useState('');

  const noteMap = new Map(notes.map((n) => [n.id, n]));

  const handleStartEditLabel = (conn: Connection) => {
    setEditingLabelId(conn.id);
    setLabelText(conn.label || '');
  };

  const handleSaveLabel = (id: string) => {
    onUpdateConnection(id, { label: labelText.trim() || undefined });
    setEditingLabelId(null);
  };

  return (
    <svg
      className="absolute inset-0 pointer-events-none w-full h-full overflow-visible z-10"
      style={{ overflow: 'visible' }}
    >
      <defs>
        <marker
          id="arrowhead-normal"
          viewBox="0 0 10 10"
          refX="7"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#3B82F6" />
        </marker>

        <marker
          id="arrowhead-selected"
          viewBox="0 0 10 10"
          refX="7"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#1D4ED8" />
        </marker>

        <marker
          id="arrowhead-start"
          viewBox="0 0 10 10"
          refX="1"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 8 1.5 L 0 5 L 8 8.5 z" fill="#3B82F6" />
        </marker>
      </defs>

      {connections.map((conn) => {
        const sourceNote = noteMap.get(conn.sourceId);
        const targetNote = noteMap.get(conn.targetId);

        if (!sourceNote || !targetNote) return null;

        const { sourceAnchor, targetAnchor } = getBestConnectionPoints(sourceNote, targetNote);
        const { path, midPoint } = calculateBezierPath(sourceAnchor, targetAnchor);

        const isSelected = selectedConnectionId === conn.id;

        return (
          <g key={conn.id} className="group/conn pointer-events-auto">
            <path
              d={path}
              fill="none"
              stroke="transparent"
              strokeWidth="24"
              className="cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                onSelectConnection(conn.id);
              }}
            />

            <path
              d={path}
              fill="none"
              stroke={isSelected ? '#1D4ED8' : '#3B82F6'}
              strokeWidth={isSelected ? '2.8' : '2'}
              strokeDasharray={conn.type === 'dashed' ? '5,5' : undefined}
              strokeOpacity={isSelected ? 1 : 0.8}
              markerEnd={
                conn.type === 'arrow' || conn.type === 'bidirectional'
                  ? isSelected
                    ? 'url(#arrowhead-selected)'
                    : 'url(#arrowhead-normal)'
                  : undefined
              }
              markerStart={conn.type === 'bidirectional' ? 'url(#arrowhead-start)' : undefined}
              className="transition-colors group-hover/conn:stroke-blue-700"
            />

            <foreignObject
              x={midPoint.x - 70}
              y={midPoint.y - 14}
              width="140"
              height="40"
              className="overflow-visible"
            >
              <div className="flex items-center justify-center gap-1">
                {editingLabelId === conn.id ? (
                  <input
                    type="text"
                    autoFocus
                    value={labelText}
                    placeholder="label..."
                    onChange={(e) => setLabelText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveLabel(conn.id);
                      if (e.key === 'Escape') setEditingLabelId(null);
                    }}
                    onBlur={() => handleSaveLabel(conn.id)}
                    className="text-[11px] font-sans bg-white border border-blue-500 rounded px-1.5 py-0.5 shadow-sm text-slate-800 text-center focus:outline-none max-w-[120px]"
                  />
                ) : (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectConnection(conn.id);
                    }}
                    onDoubleClick={() => handleStartEditLabel(conn)}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium transition-all shadow-xs select-none cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-md'
                        : conn.label
                        ? 'bg-white/90 text-slate-700 border border-slate-200 hover:bg-blue-50 hover:text-blue-700'
                        : 'opacity-0 group-hover/conn:opacity-100 bg-white/90 text-slate-500 border border-slate-200 text-[10px]'
                    }`}
                  >
                    <span>{conn.label || '+ label'}</span>
                    {isSelected && (
                      <button
                        title="Delete connection"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteConnection(conn.id);
                        }}
                        className="p-0.5 hover:text-red-300 transition-colors ml-0.5"
                      >
                        <Trash2 className="w-2.5 h-2.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </foreignObject>
          </g>
        );
      })}

      {connectingSourceNote && cursorWorldPos && (
        <path
          d={`M ${connectingSourceNote.x + connectingSourceNote.width / 2} ${
            connectingSourceNote.y + connectingSourceNote.height / 2
          } L ${cursorWorldPos.x} ${cursorWorldPos.y}`}
          fill="none"
          stroke="#2563EB"
          strokeWidth="2"
          strokeDasharray="4,4"
          markerEnd="url(#arrowhead-normal)"
          className="animate-pulse"
        />
      )}
    </svg>
  );
};
