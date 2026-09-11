import React from 'react';
import { ZoomIn, ZoomOut, Maximize2, MapPin } from 'lucide-react';

interface CanvasControlsProps {
  scale: number;
  showMinimap: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onFitAll: () => void;
  onToggleMinimap: () => void;
}

export const CanvasControls: React.FC<CanvasControlsProps> = ({
  scale,
  showMinimap,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onFitAll,
  onToggleMinimap,
}) => {
  const percentage = Math.round(scale * 100);

  return (
    <div
      data-export-ignore="true"
      className="fixed bottom-6 left-6 z-40 flex items-center bg-white/95 backdrop-blur-md px-1.5 py-1 rounded-xl shadow-xl border border-slate-200/80 text-slate-700 select-none text-xs gap-1"
    >
      <button
        onClick={onZoomOut}
        className="p-1.5 rounded-lg hover:bg-slate-100 active:bg-slate-200 transition-colors text-slate-600"
        title="Zoom Out (-)"
      >
        <ZoomOut className="w-3.5 h-3.5" />
      </button>

      <button
        onClick={onResetZoom}
        className="px-2 py-1 font-mono font-medium hover:bg-slate-100 rounded-lg transition-colors text-slate-700 min-w-[50px] text-center"
        title="Reset Zoom to 100%"
      >
        {percentage}%
      </button>

      <button
        onClick={onZoomIn}
        className="p-1.5 rounded-lg hover:bg-slate-100 active:bg-slate-200 transition-colors text-slate-600"
        title="Zoom In (+)"
      >
        <ZoomIn className="w-3.5 h-3.5" />
      </button>

      <div className="h-4 w-px bg-slate-200 mx-0.5" />

      <button
        onClick={onFitAll}
        className="p-1.5 rounded-lg hover:bg-slate-100 active:bg-slate-200 transition-colors text-slate-600"
        title="Fit All Notes on Screen (0)"
      >
        <Maximize2 className="w-3.5 h-3.5" />
      </button>

      <button
        onClick={onToggleMinimap}
        className={`p-1.5 rounded-lg transition-colors ${
          showMinimap ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-slate-600 hover:bg-slate-100'
        }`}
        title="Toggle Minimap"
      >
        <MapPin className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
