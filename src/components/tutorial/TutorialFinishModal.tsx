import React from 'react';
import { Check } from 'lucide-react';

interface TutorialFinishModalProps {
  isOpen: boolean;
  onFinish: (keepDemoNotes: boolean) => void;
}

export const TutorialFinishModal: React.FC<TutorialFinishModalProps> = ({
  isOpen,
  onFinish,
}) => {
  if (!isOpen) return null;

  return (
    <div
      data-export-ignore="true"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs select-none animate-in fade-in duration-200"
    >
      <div
        className="bg-white rounded-3xl shadow-2xl border border-blue-100 max-w-sm w-full p-6 text-center animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Confetti Emoji Banner */}
        <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3 text-2xl shadow-xs">
          🎉
        </div>

        <h2 className="text-lg font-bold text-slate-900 mb-1">
          You're ready.
        </h2>

        <p className="text-xs text-slate-600 leading-relaxed mb-6">
          Your Thoughtscape is yours.
          <br /><br />
          <strong className="text-blue-700">Capture it. Place it. Connect it. Understand it.</strong>
        </p>

        {/* Demo Notes Decision */}
        <div className="space-y-2">
          <button
            onClick={() => onFinish(false)}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Clean Demo Thoughts & Start Fresh</span>
          </button>

          <button
            onClick={() => onFinish(true)}
            className="w-full py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs rounded-xl transition-colors"
          >
            Keep Example Thoughts in Landscape
          </button>
        </div>
      </div>
    </div>
  );
};
