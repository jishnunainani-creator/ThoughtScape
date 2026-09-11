import React, { useRef, useState } from 'react';
import { StickyNote, Group, NoteStack } from '../../types';
import { STICKY_COLORS } from '../../constants/colors';
import { MapPin, Minimize2 } from 'lucide-react';

interface MinimapProps {
  notes: StickyNote[];
  groups: Group[];
  stacks?: NoteStack[];
  transform: { x: number; y: number; scale: number };
  onPanToWorld: (worldX: number, worldY: number) => void;
  isOpen?: boolean;
  onToggle?: () => void;
}

export const Minimap: React.FC<MinimapProps> = ({
  notes,
  groups,
  transform,
  onPanToWorld,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Calculate world bounding box
  let minX = 0;
  let maxX = 1600;
  let minY = 0;
  let maxY = 1200;

  if (notes.length > 0 || groups.length > 0) {
    minX = Math.min(...notes.map((n) => n.x), ...groups.map((g) => g.x), 0);
    maxX = Math.max(...notes.map((n) => n.x + n.width), ...groups.map((g) => g.x + g.width), 1600);
    minY = Math.min(...notes.map((n) => n.y), ...groups.map((g) => g.y), 0);
    maxY = Math.max(...notes.map((n) => n.y + n.height), ...groups.map((g) => g.y + g.height), 1200);
  }

  // Add padding around bounds
  const pad = 400;
  const worldLeft = minX - pad;
  const worldTop = minY - pad;
  const worldWidth = Math.max(1200, maxX - minX + pad * 2);
  const worldHeight = Math.max(900, maxY - minY + pad * 2);

  const mapW = 180;
  const mapH = 120;

  const scaleX = mapW / worldWidth;
  const scaleY = mapH / worldHeight;
  const mapScale = Math.min(scaleX, scaleY);

  // Viewport calculation
  const screenW = typeof window !== 'undefined' ? window.innerWidth : 1200;
  const screenH = typeof window !== 'undefined' ? window.innerHeight : 800;

  const vpWorldX = -transform.x / transform.scale;
  const vpWorldY = -transform.y / transform.scale;
  const vpWorldW = screenW / transform.scale;
  const vpWorldH = screenH / transform.scale;

  const vpMapX = (vpWorldX - worldLeft) * mapScale;
  const vpMapY = (vpWorldY - worldTop) * mapScale;
  const vpMapW = vpWorldW * mapScale;
  const vpMapH = vpWorldH * mapScale;

  const handleMinimapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Convert map coords to world coords (center screen around clicked location)
    const targetWorldX = worldLeft + clickX / mapScale - vpWorldW / 2;
    const targetWorldY = worldTop + clickY / mapScale - vpWorldH / 2;

    onPanToWorld(targetWorldX, targetWorldY);
  };

  if (isCollapsed) {
    return (
      <div className="fixed bottom-6 left-6 z-30 select-none">
        <button
          onClick={() => setIsCollapsed(false)}
          className="p-2 rounded-xl bg-white/90 hover:bg-white text-slate-700 shadow-lg border border-slate-200/80 backdrop-blur-md transition-all hover:scale-105"
          title="Show Minimap"
        >
          <MapPin className="w-4 h-4 text-blue-600" />
        </button>
      </div>
    );
  }

  return (
    <div
      data-export-ignore="true"
      className="fixed bottom-6 left-6 z-30 select-none animate-in fade-in zoom-in-95 duration-150"
    >
      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200/80 p-2 flex flex-col gap-1.5">
        <div className="flex items-center justify-between px-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
            <span>Minimap</span>
          </div>
          <button
            onClick={() => setIsCollapsed(true)}
            className="p-0.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600"
            title="Minimize"
          >
            <Minimize2 className="w-3 h-3" />
          </button>
        </div>

        <div
          ref={containerRef}
          onClick={handleMinimapClick}
          style={{ width: `${mapW}px`, height: `${mapH}px` }}
          className="relative bg-slate-50 rounded-lg border border-slate-200 overflow-hidden cursor-crosshair shadow-inner"
        >
          {/* Groups on Minimap */}
          {groups.map((g) => {
            const gx = (g.x - worldLeft) * mapScale;
            const gy = (g.y - worldTop) * mapScale;
            const gw = g.width * mapScale;
            const gh = g.height * mapScale;
            return (
              <div
                key={g.id}
                style={{
                  left: `${gx}px`,
                  top: `${gy}px`,
                  width: `${gw}px`,
                  height: `${gh}px`,
                }}
                className="absolute border border-blue-400/40 bg-blue-500/10 rounded-xs pointer-events-none"
              />
            );
          })}

          {/* Notes on Minimap */}
          {notes.map((n) => {
            const nx = (n.x - worldLeft) * mapScale;
            const ny = (n.y - worldTop) * mapScale;
            const nw = Math.max(3, n.width * mapScale);
            const nh = Math.max(3, n.height * mapScale);
            const colorCfg = STICKY_COLORS[n.color] || STICKY_COLORS.yellow;
            return (
              <div
                key={n.id}
                style={{
                  left: `${nx}px`,
                  top: `${ny}px`,
                  width: `${nw}px`,
                  height: `${nh}px`,
                  backgroundColor: colorCfg.borderHex,
                }}
                className="absolute rounded-2xs opacity-80 pointer-events-none"
              />
            );
          })}

          {/* Viewport Box */}
          <div
            style={{
              left: `${Math.max(0, Math.min(mapW - 10, vpMapX))}px`,
              top: `${Math.max(0, Math.min(mapH - 10, vpMapY))}px`,
              width: `${Math.max(8, Math.min(mapW, vpMapW))}px`,
              height: `${Math.max(6, Math.min(mapH, vpMapH))}px`,
            }}
            className="absolute border-2 border-blue-600 bg-blue-500/15 rounded-xs pointer-events-none shadow-xs transition-all duration-75"
          />
        </div>
      </div>
    </div>
  );
};
