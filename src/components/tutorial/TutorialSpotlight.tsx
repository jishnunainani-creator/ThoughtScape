import React, { useEffect, useState, useRef } from 'react';

interface RectBounds {
  top: number;
  left: number;
  width: number;
  height: number;
  radius: number;
}

interface TutorialSpotlightProps {
  targetSelector: string | null;
  padding?: number;
  radius?: number;
  isActive: boolean;
  onTargetNotFound?: () => void;
}

export const TutorialSpotlight: React.FC<TutorialSpotlightProps> = ({
  targetSelector,
  padding = 8,
  radius = 12,
  isActive,
  onTargetNotFound,
}) => {
  const [bounds, setBounds] = useState<RectBounds | null>(null);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const animRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isActive || !targetSelector) {
      setBounds(null);
      return;
    }

    const updateBounds = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });

      if (targetSelector === '[data-tutorial="canvas"]') {
        // Special case: spotlight center area of canvas
        const w = Math.min(window.innerWidth * 0.7, 800);
        const h = Math.min(window.innerHeight * 0.5, 450);
        setBounds({
          left: (window.innerWidth - w) / 2,
          top: (window.innerHeight - h) / 2,
          width: w,
          height: h,
          radius: 20,
        });
        return;
      }

      const el = document.querySelector(targetSelector);
      if (el) {
        const rect = el.getBoundingClientRect();
        const computedRadius =
          radius ||
          parseInt(window.getComputedStyle(el).borderRadius, 10) ||
          8;

        setBounds({
          left: Math.max(0, rect.left - padding),
          top: Math.max(0, rect.top - padding),
          width: rect.width + padding * 2,
          height: rect.height + padding * 2,
          radius: computedRadius + 4,
        });
      } else {
        if (onTargetNotFound) {
          onTargetNotFound();
        }
      }
    };

    updateBounds();

    // Track movement smoothly (for dragging notes or resizing window)
    const interval = setInterval(updateBounds, 60);

    const handleResize = () => updateBounds();
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleResize, true);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleResize, true);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [targetSelector, padding, radius, isActive, onTargetNotFound]);

  if (!isActive) return null;

  return (
    <div
      data-export-ignore="true"
      className="fixed inset-0 z-[9990] pointer-events-none select-none transition-all duration-300"
    >
      <svg
        className="w-full h-full"
        viewBox={`0 0 ${windowSize.width} ${windowSize.height}`}
        preserveAspectRatio="none"
      >
        <defs>
          <mask id="tutorial-spotlight-mask">
            {/* White background = visible overlay */}
            <rect width="100%" height="100%" fill="white" />
            {/* Black rectangle = cut-out hole */}
            {bounds && (
              <rect
                x={bounds.left}
                y={bounds.top}
                width={bounds.width}
                height={bounds.height}
                rx={bounds.radius}
                ry={bounds.radius}
                fill="black"
                className="transition-all duration-300 ease-out"
              />
            )}
          </mask>
        </defs>

        {/* Darkened backdrop with cut-out mask */}
        <rect
          width="100%"
          height="100%"
          fill="rgba(15, 23, 42, 0.65)"
          mask="url(#tutorial-spotlight-mask)"
        />
      </svg>

      {/* Subtle Royal Blue glowing pulse ring around the target element */}
      {bounds && (
        <div
          style={{
            position: 'absolute',
            left: `${bounds.left}px`,
            top: `${bounds.top}px`,
            width: `${bounds.width}px`,
            height: `${bounds.height}px`,
            borderRadius: `${bounds.radius}px`,
          }}
          className="border-2 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all duration-300 ease-out pointer-events-none animate-pulse"
        />
      )}
    </div>
  );
};
