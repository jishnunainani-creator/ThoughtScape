import React from 'react';
import { ArrowRight } from 'lucide-react';
import { ThoughtscapeLogo } from '../common/ThoughtscapeLogo';

interface TutorialWelcomeModalProps {
  isOpen: boolean;
  onStartTour: () => void;
  onSkipTour: () => void;
}

export const TutorialWelcomeModal: React.FC<TutorialWelcomeModalProps> = ({
  isOpen,
  onStartTour,
  onSkipTour,
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
        {/* Logo */}
        <div className="flex justify-center mb-3.5">
          <div className="p-3 bg-blue-50/80 rounded-2xl border border-blue-100 shadow-xs">
            <ThoughtscapeLogo size={36} />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-lg font-bold text-slate-900 mb-1">
          Welcome to Thoughtscape 👋
        </h2>

        {/* Tagline & Concept */}
        <div className="text-xs text-slate-600 leading-relaxed mb-6 space-y-2">
          <p className="font-semibold text-blue-600 text-xs">
            A landscape for your thoughts.
          </p>
          <p className="text-[11px] text-slate-500">
            Capture ideas.
            <br />
            Place them anywhere.
            <br />
            Connect what belongs together.
          </p>
          <p className="text-xs text-slate-700 font-medium pt-1">
            Let's take a quick tour.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            onClick={onStartTour}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            <span>Start Tour</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onSkipTour}
            className="w-full py-2 px-4 bg-transparent hover:bg-slate-100 text-slate-500 font-medium text-xs rounded-xl transition-colors"
          >
            Explore on My Own
          </button>
        </div>
      </div>
    </div>
  );
};

