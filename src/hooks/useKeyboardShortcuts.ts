import { useEffect } from 'react';

export interface ShortcutHandlers {
  onNewNote?: () => void;
  onQuickCapture?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onCommandPalette?: () => void;
  onSearch?: () => void;
  onFitView?: () => void;
  onResetZoom?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onEscape?: () => void;
  onSelectAll?: () => void;
  onClearLandscape?: () => void;
}

export function useKeyboardShortcuts(handlers: ShortcutHandlers) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeElement = document.activeElement;
      const isInput =
        activeElement instanceof HTMLInputElement ||
        activeElement instanceof HTMLTextAreaElement ||
        (activeElement instanceof HTMLElement && activeElement.isContentEditable);

      // Escape always works
      if (e.key === 'Escape') {
        handlers.onEscape?.();
        return;
      }

      // If user is actively typing in an input or textarea, skip global hotkeys
      if (isInput) {
        return;
      }

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      // Quick Capture: Cmd+Shift+N
      if (cmdOrCtrl && e.shiftKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        handlers.onQuickCapture?.();
        return;
      }

      // Clear Landscape: Cmd+Shift+Backspace / Cmd+Shift+Delete
      if (cmdOrCtrl && e.shiftKey && (e.key === 'Backspace' || e.key === 'Delete')) {
        e.preventDefault();
        handlers.onClearLandscape?.();
        return;
      }

      // Undo: Cmd+Z
      if (cmdOrCtrl && !e.shiftKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        handlers.onUndo?.();
        return;
      }

      // Redo: Cmd+Shift+Z or Cmd+Y
      if ((cmdOrCtrl && e.shiftKey && e.key.toLowerCase() === 'z') || (cmdOrCtrl && e.key.toLowerCase() === 'y')) {
        e.preventDefault();
        handlers.onRedo?.();
        return;
      }

      // Command Palette: Cmd+K
      if (cmdOrCtrl && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        handlers.onCommandPalette?.();
        return;
      }

      // Search: Cmd+F
      if (cmdOrCtrl && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        handlers.onSearch?.();
        return;
      }

      // Duplicate: Cmd+D
      if (cmdOrCtrl && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        handlers.onDuplicate?.();
        return;
      }

      // Fit View: Cmd+0 or 0
      if ((cmdOrCtrl && e.key === '0') || e.key === '0') {
        e.preventDefault();
        handlers.onFitView?.();
        return;
      }

      // Zoom In: + or =
      if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        handlers.onZoomIn?.();
        return;
      }

      // Zoom Out: -
      if (e.key === '-') {
        e.preventDefault();
        handlers.onZoomOut?.();
        return;
      }

      // New Note: N
      if (!cmdOrCtrl && !e.altKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        handlers.onNewNote?.();
        return;
      }

      // Delete note: Delete or Backspace
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        handlers.onDelete?.();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlers]);
}
