import React from 'react';
import {
  X,
  Sparkles,
  Command,
  Palette,
  RotateCcw,
  BookOpen,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { ThoughtscapeLogo } from '../common/ThoughtscapeLogo';

interface HelpMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartTour: () => void;
  onOpenShortcuts: () => void;
  onOpenColorMeaning: () => void;
  onOpenTechnicalGuide: () => void;
  onResetTutorial: () => void;
}

export const HelpMenuModal: React.FC<HelpMenuModalProps> = ({
  isOpen,
  onClose,
  onStartTour,
  onOpenShortcuts,
  onOpenColorMeaning,
  onOpenTechnicalGuide,
  onResetTutorial,
}) => {
  if (!isOpen) return null;

  return (
    <div
      data-export-ignore="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs select-none animate-in fade-in duration-150"
    >
      <div
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md p-6 overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2.5">
            <ThoughtscapeLogo size={24} />
            <div>
              <h2 className="font-bold text-sm text-slate-900 leading-tight">Thoughtscape Help</h2>
              <p className="text-[10px] text-slate-500">A landscape for your thoughts</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2">
          {/* Interactive Guided Tour */}
          <button
            onClick={() => {
              onClose();
              onStartTour();
            }}
            className="w-full flex items-center justify-between p-3 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-900 transition-colors text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 text-white rounded-xl shadow-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-xs">Take the Interactive Guided Tour</div>
                <div className="text-[11px] text-blue-700">60-second spotlight walkthrough on your landscape</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-blue-500 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Keyboard Shortcuts */}
          <button
            onClick={() => {
              onClose();
              onOpenShortcuts();
            }}
            className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 text-slate-800 transition-colors text-left border border-slate-100"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 text-slate-700 rounded-xl">
                <Command className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-xs">Keyboard Shortcuts Cheat Sheet</div>
                <div className="text-[11px] text-slate-500">Quick keys for maximum spatial flow</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          {/* Color Meanings */}
          <button
            onClick={() => {
              onClose();
              onOpenColorMeaning();
            }}
            className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 text-slate-800 transition-colors text-left border border-slate-100"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 text-slate-700 rounded-xl">
                <Palette className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-xs">Color Meanings & Thought Palette</div>
                <div className="text-[11px] text-slate-500">Customize what colors mean in your landscape</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          {/* Step-by-Step Technical Guide */}
          <button
            onClick={() => {
              onClose();
              onOpenTechnicalGuide();
            }}
            className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 text-slate-800 transition-colors text-left border border-slate-100"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 text-slate-700 rounded-xl">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-xs">Reference Guide & Mental Models</div>
                <div className="text-[11px] text-slate-500">Deep dive into archetypes and Thought Links</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Reset Tutorial Progress Option */}
        <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-400">Restart first-run tour?</span>
          <button
            onClick={() => {
              onResetTutorial();
              onClose();
            }}
            className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Tutorial Progress</span>
          </button>
        </div>

        {/* About Thoughtscape & Local-First Privacy */}
        <div className="mt-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-600">
          <div className="flex items-center gap-1.5 font-bold text-slate-800 mb-0.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Local-First & Private by Design</span>
          </div>
          <p className="text-[10.5px] leading-relaxed text-slate-500">
            Your Thoughtscape stays on this device unless you choose to export it. No tracking, no external storage.
          </p>
          <div className="mt-1.5 pt-1.5 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-400">
            <span>Thoughtscape v1.0.0</span>
            <span>A landscape for your thoughts</span>
          </div>
        </div>
      </div>
    </div>
  );
};
