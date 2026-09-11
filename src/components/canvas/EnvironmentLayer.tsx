import React, { useMemo } from 'react';
import { EnvironmentDefinition, LandscapeEnvironmentSettings } from '../../types';

interface EnvironmentLayerProps {
  environment: EnvironmentDefinition;
  settings?: LandscapeEnvironmentSettings;
  pan: { x: number; y: number };
  zoom: number;
  isPresentationMode?: boolean;
}

export const EnvironmentLayer: React.FC<EnvironmentLayerProps> = ({
  environment,
  settings,
  pan,
  zoom,
}) => {
  const intensity = settings?.intensity || 'balanced';
  const backgroundFocus = settings?.backgroundFocus || 'normal';
  const showGrid = settings?.showGrid !== false;

  // Custom color overrides
  const effectiveBgColor = useMemo(() => {
    if (environment.id === 'custom' && settings?.customColor) {
      return settings.customColor;
    }
    return environment.backgroundColor;
  }, [environment, settings]);

  const effectiveGridColor = useMemo(() => {
    if (environment.id === 'custom' && settings?.customColor) {
      return 'rgba(0,0,0,0.12)';
    }
    return environment.gridColor || 'rgba(148, 163, 184, 0.25)';
  }, [environment, settings]);

  // Lighting overlay style based on intensity & environment lightingStyle
  const lightingStyle = useMemo(() => {
    if (intensity === 'minimal') return null;

    switch (environment.lightingStyle) {
      case 'top-spot':
        return 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(255, 255, 255, 0.15) 0%, rgba(0, 0, 0, 0.28) 100%)';
      case 'desk-lamp':
        return 'radial-gradient(circle 900px at 75% 15%, rgba(254, 243, 199, 0.18) 0%, rgba(0, 0, 0, 0.32) 100%)';
      case 'warm-ambient':
        return 'radial-gradient(ellipse 100% 80% at 50% 50%, rgba(255, 247, 237, 0.08) 0%, rgba(0, 0, 0, 0.18) 100%)';
      case 'studio':
        return 'radial-gradient(circle 1200px at 50% 20%, rgba(255, 255, 255, 0.12) 0%, rgba(0, 0, 0, 0.15) 100%)';
      default:
        return 'radial-gradient(ellipse at center, transparent 40%, rgba(0, 0, 0, 0.06) 100%)';
    }
  }, [environment.lightingStyle, intensity]);

  // Procedural SVG noise/texture pattern based on textureType
  const textureMarkup = useMemo(() => {
    if (intensity === 'minimal') return null;

    const textureType =
      environment.id === 'custom'
        ? settings?.customTexture || 'grain'
        : environment.textureType;

    switch (textureType) {
      case 'chalk':
        return (
          <div
            className="absolute inset-0 pointer-events-none opacity-25 mix-blend-overlay"
            style={{
              backgroundImage: `radial-gradient(circle at 50% 50%, rgba(255,255,255,0.12) 1px, transparent 1px), radial-gradient(circle at 20% 80%, rgba(255,255,255,0.08) 2px, transparent 2px)`,
              backgroundSize: '24px 24px, 48px 48px',
            }}
          />
        );
      case 'cork':
        return (
          <div
            className="absolute inset-0 pointer-events-none opacity-35 mix-blend-multiply"
            style={{
              backgroundImage: `radial-gradient(circle at 25% 25%, rgba(92, 61, 38, 0.18) 2px, transparent 2px), radial-gradient(circle at 75% 75%, rgba(139, 90, 43, 0.15) 1.5px, transparent 1.5px), radial-gradient(circle at 50% 10%, rgba(69, 26, 3, 0.12) 2.5px, transparent 2.5px)`,
              backgroundSize: '20px 20px, 32px 32px, 44px 44px',
            }}
          />
        );
      case 'wood':
        return (
          <div
            className="absolute inset-0 pointer-events-none opacity-20 mix-blend-soft-light"
            style={{
              backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 120px, rgba(0,0,0,0.15) 121px, transparent 122px), repeating-linear-gradient(0deg, rgba(255,255,255,0.03) 0px, transparent 2px, rgba(0,0,0,0.04) 4px)`,
              backgroundSize: '100% 100%, 100% 8px',
            }}
          />
        );
      case 'blueprint':
        return (
          <div
            className="absolute inset-0 pointer-events-none opacity-30 mix-blend-screen"
            style={{
              backgroundImage: `linear-gradient(rgba(56, 189, 248, 0.25) 1px, transparent 1px), linear-gradient(90deg, rgba(56, 189, 248, 0.25) 1px, transparent 1px)`,
              backgroundSize: '100px 100px',
            }}
          />
        );
      case 'paper':
        return (
          <div
            className="absolute inset-0 pointer-events-none opacity-15 mix-blend-multiply"
            style={{
              backgroundImage: `radial-gradient(rgba(0,0,0,0.08) 1px, transparent 0)`,
              backgroundSize: '16px 16px',
            }}
          />
        );
      case 'plaster':
      case 'grain':
        return (
          <div
            className="absolute inset-0 pointer-events-none opacity-15 mix-blend-overlay"
            style={{
              backgroundImage: `radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 1px, transparent 1px)`,
              backgroundSize: '12px 12px',
            }}
          />
        );
      default:
        return null;
    }
  }, [environment.id, environment.textureType, settings?.customTexture, intensity]);

  // Frame border decoration
  const frameDecoration = useMemo(() => {
    if (intensity !== 'immersive' || !environment.frameType || environment.frameType === 'none') {
      return null;
    }

    switch (environment.frameType) {
      case 'chalkboard':
        return (
          <div className="absolute inset-0 pointer-events-none border-12 border-[#4A3525] shadow-[inset_0_0_24px_rgba(0,0,0,0.6)] z-10" />
        );
      case 'cork':
        return (
          <div className="absolute inset-0 pointer-events-none border-10 border-[#8B6B4C] shadow-[inset_0_0_18px_rgba(0,0,0,0.4)] z-10" />
        );
      case 'wood':
        return (
          <div className="absolute inset-0 pointer-events-none border-12 border-[#241711] shadow-[inset_0_0_30px_rgba(0,0,0,0.7)] z-10" />
        );
      default:
        return null;
    }
  }, [environment.frameType, intensity]);

  // Background Dimming Overlay for high readability
  const focusDimmingOverlay = useMemo(() => {
    if (backgroundFocus === 'soft') {
      return <div className="absolute inset-0 bg-black/10 pointer-events-none transition-opacity duration-300" />;
    }
    if (backgroundFocus === 'dim') {
      return <div className="absolute inset-0 bg-black/25 pointer-events-none transition-opacity duration-300" />;
    }
    return null;
  }, [backgroundFocus]);

  // Grid spacing calculations for infinite pan & zoom
  const gridSize = 24 * zoom;
  const gridOffsetX = ((pan.x % gridSize) + gridSize) % gridSize;
  const gridOffsetY = ((pan.y % gridSize) + gridSize) % gridSize;

  return (
    <div
      data-environment-id={environment.id}
      className="absolute inset-0 overflow-hidden select-none transition-colors duration-400 ease-in-out"
      style={{
        backgroundColor: effectiveBgColor,
      }}
    >
      {/* Procedural Texture Layer */}
      {textureMarkup}

      {/* Atmospheric Lighting Vignette */}
      {lightingStyle && (
        <div
          className="absolute inset-0 pointer-events-none transition-all duration-400"
          style={{ background: lightingStyle }}
        />
      )}

      {/* Infinite Canvas Coordinate Dot Grid */}
      {showGrid && (
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-200"
          style={{
            backgroundImage: `radial-gradient(circle, ${effectiveGridColor} 1.2px, transparent 1.2px)`,
            backgroundSize: `${gridSize}px ${gridSize}px`,
            backgroundPosition: `${gridOffsetX}px ${gridOffsetY}px`,
            opacity: intensity === 'minimal' ? 0.35 : intensity === 'immersive' ? 0.18 : 0.28,
          }}
        />
      )}

      {/* Background Focus Dimming */}
      {focusDimmingOverlay}

      {/* Ambient Outer Frame / Molding (for immersive study & chalkboard environments) */}
      {frameDecoration}
    </div>
  );
};
