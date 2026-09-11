import React from 'react';

interface ThoughtscapeLogoProps {
  size?: number;
  className?: string;
}

/**
 * Thoughtscape Logo:
 * Overlapping pieces of pastel/royal paper forming a subtle landscape horizon and 'T' silhouette.
 * Communicates: Thought, Paper, Spatial Organization, Exploration, and Connection.
 */
export const ThoughtscapeLogo: React.FC<ThoughtscapeLogoProps> = ({
  size = 28,
  className = '',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-label="Thoughtscape Logo"
    >
      <defs>
        <filter id="ts-shadow" x="-10%" y="-10%" width="130%" height="130%">
          <feDropShadow dx="0" dy="1" stdDeviation="0.8" floodOpacity="0.15" />
        </filter>
        <linearGradient id="ts-blue" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>
      </defs>

      {/* Background paper 1 (warm yellow note behind - left horizon) */}
      <rect
        x="3.5"
        y="9.5"
        width="13"
        height="13"
        rx="2.5"
        transform="rotate(-8 3.5 9.5)"
        fill="#FEF08A"
        stroke="#FACC15"
        strokeWidth="0.75"
        filter="url(#ts-shadow)"
      />

      {/* Background paper 2 (soft purple note behind - right horizon) */}
      <rect
        x="15.5"
        y="8.5"
        width="13"
        height="13"
        rx="2.5"
        transform="rotate(6 15.5 8.5)"
        fill="#DDD6FE"
        stroke="#C4B5FD"
        strokeWidth="0.75"
        filter="url(#ts-shadow)"
      />

      {/* Foreground primary paper (Royal Blue focal note with subtle paper corner fold forming the 'T') */}
      <rect
        x="7"
        y="6"
        width="18"
        height="18"
        rx="3.5"
        fill="url(#ts-blue)"
        filter="url(#ts-shadow)"
      />

      {/* Minimalist White / Ice Blue "T" Horizon Motif */}
      <path
        d="M10 11.5 H22 M16 11.5 V20.5"
        stroke="white"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Tiny subtle corner peel highlight on royal paper */}
      <path
        d="M21.5 6 L25 9.5 H22.5 C21.9 9.5 21.5 9.1 21.5 8.5 V6 Z"
        fill="#93C5FD"
        opacity="0.85"
      />
    </svg>
  );
};
