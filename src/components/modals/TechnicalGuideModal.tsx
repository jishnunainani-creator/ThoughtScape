import React, { useState } from 'react';
import {
  X,
  BookOpen,
  Sparkles,
  Layers,
  Link2,
  Zap,
  Brain,
  Eye,
  ArrowRight,
  ChevronRight,
  ChevronLeft,
  Move,
  MousePointer2,
  Plus,
} from 'lucide-react';
import { STICKY_COLORS, COLOR_LIST } from '../../constants/colors';
import { playPeelSound } from '../../utils/sound';
import { NoteColor } from '../../types';

interface TechnicalGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadTutorialTemplate?: () => void;
}

export const TechnicalGuideModal: React.FC<TechnicalGuideModalProps> = ({
  isOpen,
  onClose,
  onLoadTutorialTemplate,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [demoText, setDemoText] = useState('Click here and type your thought...');
  const [demoColor, setDemoColor] = useState<NoteColor>('yellow');
  const [demoLinkHighlight, setDemoLinkHighlight] = useState(false);

  if (!isOpen) return null;

  const steps = [
    {
      id: 'landscape',
      title: '1. The Infinite Landscape',
      subtitle: 'A spatial thinking canvas in your browser',
      icon: <Move className="w-4 h-4 text-blue-600" />,
    },
    {
      id: 'peel',
      title: '2. Pull & Place Thoughts',
      subtitle: 'Tactile thoughts with physical paper feel',
      icon: <Plus className="w-4 h-4 text-emerald-600" />,
    },
    {
      id: 'typing',
      title: '3. Instant In-Place Writing',
      subtitle: 'No modal popups, edit directly on canvas',
      icon: <Brain className="w-4 h-4 text-purple-600" />,
    },
    {
      id: 'connectors',
      title: '4. Drag Connecting Arrows',
      subtitle: 'Link thoughts with interactive bezier paths',
      icon: <Link2 className="w-4 h-4 text-indigo-600" />,
    },
    {
      id: 'wikilinks',
      title: '5. [[WikiLinks]] & Thought Graph',
      subtitle: 'Type [[Title]] to fly the camera across your landscape',
      icon: <Sparkles className="w-4 h-4 text-amber-600" />,
    },
    {
      id: 'stacks_powertools',
      title: '6. Stacks & Power Tools',
      subtitle: 'Thought stacks, Clusters, and ⌘K Command Palette',
      icon: <Zap className="w-4 h-4 text-rose-600" />,
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <div
      data-export-ignore="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150 select-none"
    >
      <div
        className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Title and Close */}
        <div className="px-6 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 leading-none">
                Thoughtscape Technical Guide
              </h2>
              <span className="text-[11px] text-slate-500 font-medium">
                Step {currentStep + 1} of {steps.length} — {steps[currentStep].title}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Navigation Pill Bar */}
        <div className="flex items-center gap-1.5 px-6 py-2.5 bg-slate-100/60 border-b border-slate-200/60 overflow-x-auto">
          {steps.map((step, idx) => {
            const isActive = idx === currentStep;
            const isCompleted = idx < currentStep;
            return (
              <button
                key={step.id}
                onClick={() => setCurrentStep(idx)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs scale-102'
                    : isCompleted
                    ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                    : 'bg-white/80 text-slate-600 hover:bg-white hover:text-slate-900 border border-slate-200/60'
                }`}
              >
                <span>{idx + 1}</span>
                <span className="hidden sm:inline">{step.title.split('. ')[1]}</span>
              </button>
            );
          })}
        </div>

        {/* Main Step Content Slide */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col justify-between">
          {/* STEP 1: THE INFINITE LANDSCAPE */}
          {currentStep === 0 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-3 duration-200">
              <div className="text-center max-w-md mx-auto">
                <h3 className="text-lg font-bold text-slate-900">Your Infinite Thoughtscape</h3>
                <p className="text-xs text-slate-600 mt-1">
                  Instead of tables or linear documents, arrange your thoughts freely across an open landscape.
                </p>
              </div>

              {/* Visual Interactive Sandbox */}
              <div className="relative h-56 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-4 overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:16px_16px]" />

                {/* Simulated Notes in Space */}
                <div className="relative z-10 flex items-center gap-4">
                  <div className="w-28 h-24 bg-amber-100 border border-amber-300 rounded-sm shadow-md p-2 -rotate-3 text-[10px] text-amber-900 font-medium">
                    📌 Core Concept
                    <div className="text-[8px] text-amber-700 mt-1">Spatial thinking connects ideas 3x faster than linear notes.</div>
                  </div>

                  <div className="w-28 h-24 bg-blue-100 border border-blue-300 rounded-sm shadow-md p-2 rotate-2 text-[10px] text-blue-900 font-medium">
                    ⚡ Action Item
                    <div className="text-[8px] text-blue-700 mt-1">✓ Build thought landscape<br/>✓ Review insights</div>
                  </div>
                </div>

                <div className="relative z-10 mt-4 flex items-center gap-4 text-xs font-semibold text-slate-700 bg-white/90 px-3 py-1.5 rounded-full border border-slate-200 shadow-xs">
                  <span className="flex items-center gap-1">
                    <MousePointer2 className="w-3.5 h-3.5 text-blue-600" />
                    <strong>Drag</strong> empty landscape to Pan
                  </span>
                  <span className="text-slate-300">|</span>
                  <span>
                    <strong>Scroll wheel</strong> to Zoom
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100">
                  <strong className="text-blue-900 block mb-0.5">🔒 100% Local-First & Private</strong>
                  <span className="text-blue-800 text-[11px]">No login required. Automatically saved locally on your device.</span>
                </div>
                <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
                  <strong className="text-emerald-900 block mb-0.5">🗺️ Interactive Radar Minimap</strong>
                  <span className="text-emerald-800 text-[11px]">Use the radar in the bottom-left to navigate large landscapes effortlessly.</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: PULL & PLACE THOUGHTS */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-3 duration-200">
              <div className="text-center max-w-md mx-auto">
                <h3 className="text-lg font-bold text-slate-900">Pull & Place Thoughts</h3>
                <p className="text-xs text-slate-600 mt-1">
                  Click any paper color below to test the tactile paper physics!
                </p>
              </div>

              {/* Interactive Color Peel Tester */}
              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 flex flex-col items-center">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                  Click a color to peel a thought:
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5 max-w-md w-full">
                  {COLOR_LIST.slice(0, 6).map((c) => {
                    const cfg = STICKY_COLORS[c];
                    return (
                      <button
                        key={c}
                        onClick={() => {
                          setDemoColor(c);
                          playPeelSound();
                        }}
                        style={{ backgroundColor: cfg.hex, borderColor: cfg.borderHex }}
                        className={`h-12 rounded-lg border-2 shadow-sm hover:scale-105 active:scale-95 transition-all flex flex-col items-center justify-center ${
                          demoColor === c ? 'ring-2 ring-blue-600 ring-offset-2' : ''
                        }`}
                      >
                        <span className="text-[10px] font-bold text-slate-800">{cfg.name}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Animated Mock Sticky Note */}
                <div className="mt-4 flex items-center justify-center">
                  <div
                    style={{
                      backgroundColor: STICKY_COLORS[demoColor].hex,
                      borderColor: STICKY_COLORS[demoColor].borderHex,
                    }}
                    className="w-44 h-28 rounded-sm border p-3 shadow-md rotate-1 transition-colors duration-200 relative flex flex-col justify-between"
                  >
                    <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-10 h-3 bg-white/40 rounded-xs border border-white/60" />
                    <div className="font-bold text-xs text-slate-800">New Thought Sample</div>
                    <div className="text-[10px] text-slate-600">Peels smoothly with realistic paper sounds 🎶</div>
                    <div className="text-[9px] text-slate-400 font-mono">Press 'N' anywhere in landscape</div>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-100/80 rounded-xl text-xs text-slate-700 flex items-center justify-between">
                <span>💡 <strong>Tip:</strong> Look at the floating stack in the bottom-right corner ↘️ to create thoughts anytime.</span>
                <kbd className="bg-white border px-2 py-0.5 rounded text-[11px] font-mono shadow-2xs">N</kbd>
              </div>
            </div>
          )}

          {/* STEP 3: DIRECT IN-PLACE WRITING */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-3 duration-200">
              <div className="text-center max-w-md mx-auto">
                <h3 className="text-lg font-bold text-slate-900">Direct In-Place Writing</h3>
                <p className="text-xs text-slate-600 mt-1">
                  Never get interrupted by popup modals. Click directly on any text to edit instantly.
                </p>
              </div>

              {/* Interactive Typing Sandbox */}
              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 flex flex-col items-center">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Try typing inside this live thought:
                </div>

                <div className="w-full max-w-sm bg-amber-100 border border-amber-300 rounded-sm p-4 shadow-paper relative">
                  <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-10 h-3 bg-white/40 rounded-xs border border-white/60" />
                  
                  <div className="font-bold text-xs text-slate-800 mb-1 flex items-center justify-between">
                    <span>In-Place Editing Demo ✍️</span>
                    <span className="text-[9px] bg-amber-200/80 px-1.5 py-0.5 rounded text-amber-800 font-mono">Live</span>
                  </div>

                  <textarea
                    value={demoText}
                    onChange={(e) => setDemoText(e.target.value)}
                    rows={3}
                    className="w-full bg-white/70 focus:bg-white rounded p-2 text-xs text-slate-800 border border-amber-300 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                  />
                  <div className="text-[10px] text-slate-500 mt-1 text-right">
                    Click outside or press Esc to save
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div className="p-2.5 bg-slate-50 rounded-xl border">
                  <strong>📐 Resizing:</strong> Drag bottom-right corner to change width & height.
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border">
                  <strong>🔒 Locking:</strong> Right-click to lock thoughts against accidental moves.
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border">
                  <strong>⚡ Quick Thought:</strong> Press <kbd className="bg-white border px-1 rounded font-mono">⌘⇧N</kbd> for instant capture.
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: DRAG CONNECTING ARROWS */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-3 duration-200">
              <div className="text-center max-w-md mx-auto">
                <h3 className="text-lg font-bold text-slate-900">Drag Connecting Arrows</h3>
                <p className="text-xs text-slate-600 mt-1">
                  Connect related thoughts to form visual mind maps, decision trees, and cause-effect flows.
                </p>
              </div>

              {/* Visual Interactive Sandbox */}
              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 flex flex-col items-center">
                <div className="flex items-center justify-center gap-8 w-full max-w-md py-4">
                  {/* Note 1 */}
                  <div className="w-32 h-24 bg-blue-100 border border-blue-300 rounded-sm p-2 shadow-xs text-center flex flex-col justify-center relative">
                    <span className="font-bold text-xs text-blue-900">Problem / Cause</span>
                    <span className="text-[9px] text-blue-700 mt-0.5">API Latency Spike</span>
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1.5 w-3 h-3 rounded-full bg-blue-600 border border-white shadow-xs animate-ping" />
                  </div>

                  {/* Bezier Arrow Graphic */}
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full mb-1">
                      causes
                    </span>
                    <div className="w-16 h-0.5 bg-blue-500 relative">
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent border-l-6 border-l-blue-500" />
                    </div>
                  </div>

                  {/* Note 2 */}
                  <div className="w-32 h-24 bg-emerald-100 border border-emerald-300 rounded-sm p-2 shadow-xs text-center flex flex-col justify-center">
                    <span className="font-bold text-xs text-emerald-900">Solution / Rule</span>
                    <span className="text-[9px] text-emerald-700 mt-0.5">Add Redis Cache</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border">
                  <strong>How to connect:</strong> Hover over any thought to see 4 circular connection handles. Click and drag an arrow to another thought.
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border">
                  <strong>Custom Styles:</strong> Click any connection arrow to change it between <em>Smooth Bezier</em>, <em>Straight</em>, or <em>Dashed</em>.
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: WIKILINKS & THOUGHT GRAPH */}
          {currentStep === 4 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-3 duration-200">
              <div className="text-center max-w-md mx-auto">
                <h3 className="text-lg font-bold text-slate-900">Bidirectional [[WikiLinks]]</h3>
                <p className="text-xs text-slate-600 mt-1">
                  Cross-link your thoughts just by typing their titles inside double brackets.
                </p>
              </div>

              {/* Interactive WikiLink Demo */}
              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 flex flex-col items-center">
                <div className="w-full max-w-sm bg-purple-100 border border-purple-300 rounded-sm p-4 shadow-paper">
                  <div className="font-bold text-xs text-purple-900 mb-1">Architecture Thought 🏛️</div>
                  <div className="text-xs text-slate-800 leading-relaxed">
                    This component depends on{' '}
                    <button
                      onClick={() => {
                        setDemoLinkHighlight(true);
                        setTimeout(() => setDemoLinkHighlight(false), 1200);
                      }}
                      className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded bg-blue-200 text-blue-900 font-bold text-xs underline hover:bg-blue-300 transition-colors"
                    >
                      <span>[[Cache Layer]]</span>
                      <Sparkles className="w-2.5 h-2.5 text-blue-700" />
                    </button>
                    {' '}for sub-millisecond retrieval.
                  </div>
                  {demoLinkHighlight && (
                    <div className="mt-2 text-[10px] text-blue-700 font-bold bg-blue-50 p-1.5 rounded border border-blue-200 animate-in fade-in">
                      ✨ Camera smoothly glides to and spotlights "Cache Layer"!
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border">
                  <strong>Camera Flight:</strong> Click any <span className="bg-blue-100 text-blue-800 px-1 py-0.5 rounded font-mono text-[11px]">[[WikiLink]]</span> to smoothly pan and zoom directly to that thought in your landscape.
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border">
                  <strong>Backlinks Drawer:</strong> Thoughts automatically list every other thought that references them.
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: STACKS & POWER TOOLS */}
          {currentStep === 5 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-3 duration-200">
              <div className="text-center max-w-md mx-auto">
                <h3 className="text-lg font-bold text-slate-900">Stacks, Clusters & Power Tools</h3>
                <p className="text-xs text-slate-600 mt-1">
                  Keep your landscape organized with physical stacks, clusters, and the ⌘K Command Palette.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between">
                  <div>
                    <div className="font-bold text-slate-900 flex items-center gap-1.5 mb-1">
                      <Layers className="w-4 h-4 text-blue-600" />
                      Thought Stacks
                    </div>
                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      Pile related thoughts together. Click <em>"Take One"</em> to peel thoughts off the stack individually.
                    </p>
                  </div>
                  <div className="mt-2 text-[10px] text-blue-600 font-bold">Right-click thought → Convert to Stack</div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between">
                  <div>
                    <div className="font-bold text-slate-900 flex items-center gap-1.5 mb-1">
                      <Eye className="w-4 h-4 text-indigo-600" />
                      Thought Clusters & Focus
                    </div>
                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      Create colored clusters. Focus mode dims background clutter so you can explore one area without distractions.
                    </p>
                  </div>
                  <div className="mt-2 text-[10px] text-indigo-600 font-bold">Top Nav → Eye Icon (Focus)</div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between">
                  <div>
                    <div className="font-bold text-slate-900 flex items-center gap-1.5 mb-1">
                      <Zap className="w-4 h-4 text-amber-600" />
                      Command Palette
                    </div>
                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      Search thoughts, switch landscapes, auto-organize into concept maps, and export to PDF/PNG.
                    </p>
                  </div>
                  <div className="mt-2 text-[10px] text-amber-600 font-bold font-mono">Press ⌘K anytime</div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-xs text-blue-900">Ready to try it on a real canvas?</div>
                  <div className="text-xs text-blue-800">Load the interactive starter landscape with pre-built mental models and connectors.</div>
                </div>
                {onLoadTutorialTemplate && (
                  <button
                    onClick={() => {
                      onLoadTutorialTemplate();
                      onClose();
                    }}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-xs transition-colors shrink-0 flex items-center gap-1.5"
                  >
                    <span>Load Interactive Landscape</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Bar */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-white text-xs font-semibold text-slate-700 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <div className="flex items-center gap-1.5">
            {steps.map((_, idx) => (
              <span
                key={idx}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentStep ? 'w-5 bg-blue-600' : 'bg-slate-300'
                }`}
              />
            ))}
          </div>

          {currentStep < steps.length - 1 ? (
            <button
              onClick={handleNext}
              className="flex items-center gap-1 px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              Start Exploring Thoughtscape! 🚀
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
