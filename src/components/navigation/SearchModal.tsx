import React, { useState, useEffect, useRef } from 'react';
import { StickyNote } from '../../types';
import { STICKY_COLORS, NOTE_TYPE_INFO } from '../../constants/colors';
import { Search, X, Star, CornerDownLeft } from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  notes: StickyNote[];
  groups?: unknown;
  onClose: () => void;
  onSelectNote: (note: StickyNote) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  notes,
  onClose,
  onSelectNote,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const cleanQuery = query.toLowerCase().trim();

  const matchedNotes = notes.filter((n) => {
    if (!cleanQuery) return true;
    const inTitle = (n.title || '').toLowerCase().includes(cleanQuery);
    const inContent = (n.content || '').toLowerCase().includes(cleanQuery);
    const inTags = n.tags.some((t) => t.toLowerCase().includes(cleanQuery));
    return inTitle || inContent || inTags;
  });

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, matchedNotes.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && matchedNotes[selectedIndex]) {
      e.preventDefault();
      onSelectNote(matchedNotes[selectedIndex]);
      onClose();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div
      data-export-ignore="true"
      className="fixed inset-0 z-[99999] bg-slate-900/40 backdrop-blur-xs flex items-start justify-center pt-24 px-4 select-none animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[70vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100">
          <Search className="w-5 h-5 text-blue-600 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            placeholder="Search your Thoughtscape... (Cmd + F)"
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            className="w-full bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {matchedNotes.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-400">
              No thoughts matched "{query}"
            </div>
          ) : (
            matchedNotes.map((note, idx) => {
              const cfg = STICKY_COLORS[note.color];
              const typeInfo = NOTE_TYPE_INFO[note.type];
              const isHighlighted = idx === selectedIndex;

              return (
                <div
                  key={note.id}
                  onClick={() => {
                    onSelectNote(note);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                    isHighlighted ? 'bg-blue-50/80 border border-blue-200' : 'hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  <div
                    style={{ backgroundColor: cfg.hex, borderColor: cfg.borderHex }}
                    className="w-4 h-4 rounded-full border shrink-0 mt-0.5"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-slate-800 truncate">
                        {note.title || 'Untitled Thought'}
                      </span>
                      {typeInfo.badge && <span className="text-xs">{typeInfo.badge}</span>}
                      {note.starred && <Star className="w-3 h-3 text-amber-500 fill-amber-500" />}
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-2 mt-0.5 whitespace-pre-wrap leading-snug">
                      {note.content || '(Empty content)'}
                    </p>

                    {note.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {note.tags.map((t) => (
                          <span
                            key={t}
                            className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-medium"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {isHighlighted && (
                    <div className="flex items-center gap-1 text-[11px] text-blue-600 font-medium shrink-0 self-center">
                      <span>Jump</span>
                      <CornerDownLeft className="w-3 h-3" />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select & Center</span>
            <span>Esc Close</span>
          </div>
          <span>{matchedNotes.length} {matchedNotes.length === 1 ? 'thought' : 'thoughts'} found</span>
        </div>
      </div>
    </div>
  );
};
