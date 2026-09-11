import React, { useEffect, useState, useRef } from 'react';
import { TutorialStepConfig, TooltipPlacement } from '../../types/tutorial';
import { ChevronRight, ChevronLeft, Sparkles, CheckCircle2 } from 'lucide-react';

interface TutorialTooltipProps {
  step: TutorialStepConfig | undefined;
  currentStepIndex: number;
  totalSteps: number;
  isInteracted?: boolean;
  interactionSuccess?: boolean;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  isActive?: boolean;
}

interface Position {
  top: number;
  left: number;
  placement: TooltipPlacement;
}

export const TutorialTooltip: React.FC<TutorialTooltipProps> = ({
  step,
  currentStepIndex,
  totalSteps,
  isInteracted = false,
  interactionSuccess = false,
  onNext,
  onPrev,
  onSkip,
  isActive = true,
}) => {
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const [pos, setPos] = useState<Position>({
    top: window.innerHeight / 2,
    left: window.innerWidth / 2,
    placement: step?.placement || 'center',
  });

  useEffect(() => {
    if (!isActive || !step) return;

    const calculatePosition = () => {
      const tooltip = tooltipRef.current;
      if (!tooltip) return;

      const tooltipWidth = tooltip.offsetWidth || 340;
      const tooltipHeight = tooltip.offsetHeight || 220;
      const margin = 16;
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      // Special case: Center of canvas
      if (step.targetSelector === '[data-tutorial="canvas"]') {
        setPos({
          left: (vw - tooltipWidth) / 2,
          top: (vh - tooltipHeight) / 2,
          placement: 'center',
        });
        return;
      }

      const targetEl = document.querySelector(step.targetSelector);
      if (!targetEl) {
        // Fallback to center
        setPos({
          left: (vw - tooltipWidth) / 2,
          top: (vh - tooltipHeight) / 2,
          placement: 'center',
        });
        return;
      }

      const targetRect = targetEl.getBoundingClientRect();
      const requestedPlacement = step.placement || 'auto';

      let computedPlacement = requestedPlacement;
      let left = 0;
      let top = 0;

      if (requestedPlacement === 'auto' || requestedPlacement === 'right') {
        // Check if fits right
        if (targetRect.right + margin + tooltipWidth < vw - margin) {
          computedPlacement = 'right';
          left = targetRect.right + margin;
          top = Math.max(margin, Math.min(targetRect.top, vh - tooltipHeight - margin));
        } else if (targetRect.left - margin - tooltipWidth > margin) {
          computedPlacement = 'left';
          left = targetRect.left - margin - tooltipWidth;
          top = Math.max(margin, Math.min(targetRect.top, vh - tooltipHeight - margin));
        } else if (targetRect.bottom + margin + tooltipHeight < vh - margin) {
          computedPlacement = 'bottom';
          left = Math.max(margin, Math.min(targetRect.left, vw - tooltipWidth - margin));
          top = targetRect.bottom + margin;
        } else {
          computedPlacement = 'top';
          left = Math.max(margin, Math.min(targetRect.left, vw - tooltipWidth - margin));
          top = Math.max(margin, targetRect.top - margin - tooltipHeight);
        }
      } else if (requestedPlacement === 'left') {
        if (targetRect.left - margin - tooltipWidth > margin) {
          computedPlacement = 'left';
          left = targetRect.left - margin - tooltipWidth;
          top = Math.max(margin, Math.min(targetRect.top, vh - tooltipHeight - margin));
        } else {
          computedPlacement = 'right';
          left = Math.min(vw - tooltipWidth - margin, targetRect.right + margin);
          top = Math.max(margin, Math.min(targetRect.top, vh - tooltipHeight - margin));
        }
      } else if (requestedPlacement === 'bottom') {
        if (targetRect.bottom + margin + tooltipHeight < vh - margin) {
          computedPlacement = 'bottom';
          left = Math.max(margin, Math.min(targetRect.left + (targetRect.width - tooltipWidth) / 2, vw - tooltipWidth - margin));
          top = targetRect.bottom + margin;
        } else {
          computedPlacement = 'top';
          left = Math.max(margin, Math.min(targetRect.left + (targetRect.width - tooltipWidth) / 2, vw - tooltipWidth - margin));
          top = Math.max(margin, targetRect.top - margin - tooltipHeight);
        }
      } else if (requestedPlacement === 'top') {
        if (targetRect.top - margin - tooltipHeight > margin) {
          computedPlacement = 'top';
          left = Math.max(margin, Math.min(targetRect.left + (targetRect.width - tooltipWidth) / 2, vw - tooltipWidth - margin));
          top = targetRect.top - margin - tooltipHeight;
        } else {
          computedPlacement = 'bottom';
          left = Math.max(margin, Math.min(targetRect.left + (targetRect.width - tooltipWidth) / 2, vw - tooltipWidth - margin));
          top = targetRect.bottom + margin;
        }
      }

      // Keep strictly on screen
      left = Math.max(margin, Math.min(left, vw - tooltipWidth - margin));
      top = Math.max(margin, Math.min(top, vh - tooltipHeight - margin));

      setPos({ left, top, placement: computedPlacement });
    };

    calculatePosition();

    const interval = setInterval(calculatePosition, 80);
    window.addEventListener('resize', calculatePosition);
    window.addEventListener('scroll', calculatePosition, true);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', calculatePosition);
      window.removeEventListener('scroll', calculatePosition, true);
    };
  }, [step, isActive]);

  if (!isActive || !step) return null;

  return (
    <div
      ref={tooltipRef}
      data-export-ignore="true"
      style={{
        position: 'fixed',
        left: `${pos.left}px`,
        top: `${pos.top}px`,
        zIndex: 9999,
      }}
      className="w-[340px] max-w-[calc(100vw-32px)] bg-white rounded-2xl shadow-2xl border border-blue-100 p-5 select-none animate-in fade-in zoom-in-95 duration-200"
    >
      {/* Step Header */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-1.5">
          <span className="px-2 py-0.5 bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-bold rounded-full uppercase tracking-wider">
            Step {currentStepIndex + 1} of {totalSteps}
          </span>
          {step.requiresInteraction && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 animate-pulse">
              <Sparkles className="w-3 h-3" />
              Try it
            </span>
          )}
        </div>

        <button
          onClick={onSkip}
          className="text-[11px] text-slate-400 hover:text-slate-700 font-medium transition-colors"
          title="Skip Guided Tour"
        >
          Skip
        </button>
      </div>

      {/* Step Title */}
      <h3 className="text-sm font-bold text-slate-900 leading-tight mb-1.5 flex items-center gap-1.5">
        <span>{step.title}</span>
      </h3>

      {/* Step Description */}
      <div className="text-xs text-slate-600 leading-relaxed whitespace-pre-line mb-3.5">
        {step.description}
      </div>

      {/* Interaction Prompt or Success State */}
      {step.requiresInteraction && (
        <div
          className={`p-2.5 rounded-xl text-xs font-semibold mb-3.5 flex items-center gap-2 transition-all ${
            interactionSuccess || isInteracted
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 animate-in zoom-in-95'
              : 'bg-amber-50 text-amber-800 border border-amber-200'
          }`}
        >
          {interactionSuccess || isInteracted ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{step.interactionSuccessText || '✓ Nice! Moving to next step...'}</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0 animate-spin" />
              <span>{step.interactionPrompt || 'Try the action now →'}</span>
            </>
          )}
        </div>
      )}

      {/* Action Hint if provided */}
      {step.actionHint && !step.requiresInteraction && (
        <div className="p-2 bg-slate-50 rounded-xl text-[11px] text-slate-500 mb-3 border border-slate-100 flex items-center gap-1.5">
          <span>💡</span>
          <span>{step.actionHint}</span>
        </div>
      )}

      {/* Footer Navigation Buttons & Progress Dots */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-2">
        {/* Progress Dots */}
        <div className="flex items-center gap-1">
          {Array.from({ length: totalSteps }).map((_, idx) => (
            <span
              key={idx}
              className={`h-1.5 rounded-full transition-all ${
                idx === currentStepIndex
                  ? 'w-4 bg-blue-600'
                  : idx < currentStepIndex
                  ? 'w-1.5 bg-blue-200'
                  : 'w-1.5 bg-slate-200'
              }`}
            />
          ))}
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-1.5">
          {currentStepIndex > 0 && (
            <button
              onClick={onPrev}
              className="flex items-center gap-0.5 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          )}

          <button
            onClick={onNext}
            className="flex items-center gap-1 px-3.5 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
          >
            <span>{currentStepIndex === totalSteps - 1 ? 'Finish 🎉' : 'Next'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
