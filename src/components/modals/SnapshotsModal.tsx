import React, { useState } from 'react';
import { BoardSnapshot } from '../../types';
import { Camera, X, Trash2, RotateCcw, Plus, Calendar } from 'lucide-react';

interface SnapshotsModalProps {
  isOpen: boolean;
  snapshots: BoardSnapshot[];
  onClose: () => void;
  onTakeSnapshot: (name: string) => void;
  onRestoreSnapshot: (snapshot: BoardSnapshot) => void;
  onDeleteSnapshot: (snapshotId: string) => void;
}

export const SnapshotsModal: React.FC<SnapshotsModalProps> = ({
  isOpen,
  snapshots,
  onClose,
  onTakeSnapshot,
  onRestoreSnapshot,
  onDeleteSnapshot,
}) => {
  const [snapshotName, setSnapshotName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  if (!isOpen) return null;

  const handleCreate = () => {
    const defaultName = `${new Date().toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })} Snapshot`;
    onTakeSnapshot(snapshotName.trim() || defaultName);
    setSnapshotName('');
    setIsCreating(false);
  };

  return (
    <div
      data-export-ignore="true"
      className="fixed inset-0 z-[99999] bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 select-none animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-amber-600" />
            <h2 className="font-bold text-base text-slate-900">Daily Workspace Snapshots</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs text-slate-700 max-h-[480px] overflow-y-auto">
          {/* Create new snapshot box */}
          {isCreating ? (
            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
              <label className="block text-amber-900 font-semibold">Snapshot Name</label>
              <input
                type="text"
                autoFocus
                placeholder="e.g. Sept 11, 2026 — Science Board Revision"
                value={snapshotName}
                onChange={(e) => setSnapshotName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreate();
                  if (e.key === 'Escape') setIsCreating(false);
                }}
                className="w-full bg-white border border-amber-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-amber-600"
              />
              <div className="flex justify-end gap-2 pt-1">
                <button
                  onClick={() => setIsCreating(false)}
                  className="px-2.5 py-1 text-slate-600 hover:bg-amber-100 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded shadow-xs"
                >
                  Save Snapshot
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsCreating(true)}
              className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl border border-dashed border-amber-300 bg-amber-50/50 hover:bg-amber-100/60 text-amber-800 font-semibold transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Take New Snapshot of Landscape</span>
            </button>
          )}

          {/* List of snapshots */}
          <div className="space-y-2">
            {snapshots.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p>No snapshots taken yet.</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Save daily checkpoints to review your knowledge evolution over time.
                </p>
              </div>
            ) : (
              snapshots.map((snap) => (
                <div
                  key={snap.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-slate-800 truncate">{snap.name}</div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                      <span>{new Date(snap.timestamp).toLocaleString()}</span>
                      <span>•</span>
                      <span>{snap.notes.length} notes</span>
                      <span>•</span>
                      <span>{snap.groups.length} groups</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 ml-3">
                    <button
                      onClick={() => {
                        if (confirm(`Restore snapshot "${snap.name}"? Current canvas will be updated.`)) {
                          onRestoreSnapshot(snap);
                          onClose();
                        }
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-medium transition-colors"
                      title="Restore this snapshot"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Restore</span>
                    </button>
                    <button
                      onClick={() => onDeleteSnapshot(snap.id)}
                      className="p-1 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100 transition-colors"
                      title="Delete snapshot"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex justify-end px-6 py-3.5 bg-slate-50 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
