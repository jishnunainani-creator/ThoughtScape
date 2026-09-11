import React, { useState } from 'react';
import { ArrowRight, Sparkles, GraduationCap, Briefcase, Home, Lightbulb, BookOpen } from 'lucide-react';
import { ThoughtscapeLogo } from '../common/ThoughtscapeLogo';

interface TutorialWelcomeModalProps {
  isOpen: boolean;
  onStartTour: () => void;
  onSkipTour: () => void;
  onSelectLandscape?: (boardId: string) => void;
}

const EXPLORE_CARDS = [
  {
    id: 'landscape_class10',
    title: 'Study',
    icon: GraduationCap,
    desc: 'Class 10 & Board prep',
    color: 'from-blue-500 to-indigo-600',
    bgLight: 'hover:border-blue-300 hover:bg-blue-50/50',
    emoji: '🎓',
  },
  {
    id: 'landscape_work',
    title: 'Work',
    icon: Briefcase,
    desc: 'Tasks, meetings & roadmaps',
    color: 'from-emerald-500 to-teal-600',
    bgLight: 'hover:border-emerald-300 hover:bg-emerald-50/50',
    emoji: '💼',
  },
  {
    id: 'landscape_personal',
    title: 'Personal',
    icon: Home,
    desc: 'Plans, trips & reminders',
    color: 'from-amber-500 to-orange-600',
    bgLight: 'hover:border-amber-300 hover:bg-amber-50/50',
    emoji: '🏠',
  },
  {
    id: 'landscape_welcome',
    title: 'Ideas',
    icon: Lightbulb,
    desc: 'Welcome tour across spaces',
    color: 'from-yellow-500 to-amber-600',
    bgLight: 'hover:border-yellow-300 hover:bg-yellow-50/50',
    emoji: '💡',
  },
  {
    id: 'landscape_college',
    title: 'Learning',
    icon: BookOpen,
    desc: 'College semester & projects',
    color: 'from-purple-500 to-violet-600',
    bgLight: 'hover:border-purple-300 hover:bg-purple-50/50',
    emoji: '📚',
  },
  {
    id: 'landscape_empty',
    title: 'Start Empty',
    icon: Sparkles,
    desc: 'Blank canvas from scratch',
    color: 'from-slate-500 to-slate-700',
    bgLight: 'hover:border-slate-400 hover:bg-slate-50',
    emoji: '✨',
  },
];

export const TutorialWelcomeModal: React.FC<TutorialWelcomeModalProps> = ({
  isOpen,
  onStartTour,
  onSkipTour,
  onSelectLandscape,
}) => {
  const [selectedId, setSelectedId] = useState<string>('landscape_welcome');

  if (!isOpen) return null;

  const handleCardClick = (id: string) => {
    setSelectedId(id);
    if (onSelectLandscape) {
      onSelectLandscape(id);
    }
  };

  return (
    <div
      data-export-ignore="true"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs select-none animate-in fade-in duration-200"
    >
      <div
        className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-lg w-full p-6 text-center animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Logo & Header */}
        <div className="flex justify-center mb-3">
          <div className="p-2.5 bg-blue-50/90 rounded-2xl border border-blue-100 shadow-xs">
            <ThoughtscapeLogo size={34} />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-slate-900 mb-0.5 tracking-tight">
          Welcome to Thoughtscape 👋
        </h2>
        <p className="text-xs font-semibold text-blue-600 mb-4">
          A landscape for your thoughts.
        </p>

        {/* Prompt */}
        <div className="text-left mb-3">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            What would you like to explore?
          </span>
        </div>

        {/* 6 Exploration Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-5 text-left">
          {EXPLORE_CARDS.map((card) => {
            const isSelected = selectedId === card.id;
            return (
              <button
                key={card.id}
                onClick={() => handleCardClick(card.id)}
                className={`p-3 rounded-2xl border transition-all flex flex-col justify-between group cursor-pointer ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/60 shadow-xs ring-2 ring-blue-600/20'
                    : `border-slate-200/90 bg-white ${card.bgLight} hover:shadow-xs`
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg">{card.emoji}</span>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-blue-600" />
                  )}
                </div>
                <div>
                  <div className={`font-bold text-xs ${isSelected ? 'text-blue-900' : 'text-slate-800'}`}>
                    {card.title}
                  </div>
                  <div className="text-[10px] text-slate-500 font-normal leading-tight mt-0.5 line-clamp-1">
                    {card.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          <button
            onClick={onStartTour}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Start 60-Second Guided Tour</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onSkipTour}
            className="w-full py-2 px-4 bg-slate-50 hover:bg-slate-100 text-slate-600 font-medium text-xs rounded-xl transition-colors cursor-pointer"
          >
            Explore Landscape Directly
          </button>
        </div>
      </div>
    </div>
  );
};
