import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  Sparkles,
  Star,
  Check,
  Palette,
  Sliders,
  Sun,
  Layers,
  LayoutGrid,
  Eye,
  RotateCcw,
} from 'lucide-react';
import {
  EnvironmentCategory,
  EnvironmentDefinition,
  EnvironmentIntensity,
  BackgroundFocus,
  NoteVisualTheme,
  LandscapeEnvironmentSettings,
} from '../../types';
import {
  ENVIRONMENTS,
  ENVIRONMENT_CATEGORIES,
  NOTE_THEMES,
  getEnvironmentById,
} from '../../constants/environments';

interface EnvironmentModalProps {
  isOpen: boolean;
  activeLandscapeName: string;
  currentEnvironmentId: string;
  currentSettings?: LandscapeEnvironmentSettings;
  favorites?: string[];
  recentEnvironments?: string[];
  onClose: () => void;
  onApplyEnvironment: (id: string, settings: LandscapeEnvironmentSettings) => void;
  onToggleFavorite?: (id: string) => void;
  onLivePreview?: (id: string, settings: LandscapeEnvironmentSettings) => void;
  onCancelPreview?: () => void;
}

export const EnvironmentModal: React.FC<EnvironmentModalProps> = ({
  isOpen,
  activeLandscapeName,
  currentEnvironmentId,
  currentSettings,
  favorites = [],
  recentEnvironments = [],
  onClose,
  onApplyEnvironment,
  onToggleFavorite,
  onLivePreview,
  onCancelPreview,
}) => {
  const [selectedTab, setSelectedTab] = useState<EnvironmentCategory | 'settings'>('all');
  const [selectedEnvId, setSelectedEnvId] = useState<string>(currentEnvironmentId);
  const [intensity, setIntensity] = useState<EnvironmentIntensity>(
    currentSettings?.intensity || 'balanced'
  );
  const [backgroundFocus, setBackgroundFocus] = useState<BackgroundFocus>(
    currentSettings?.backgroundFocus || 'normal'
  );
  const [noteStyle, setNoteStyle] = useState<NoteVisualTheme>(
    currentSettings?.noteStyle || 'classic'
  );
  const [customColor, setCustomColor] = useState<string>(
    currentSettings?.customColor || '#E0E7FF'
  );
  const [customTexture, setCustomTexture] = useState<'none' | 'plaster' | 'paper' | 'grain' | 'grid'>(
    currentSettings?.customTexture || 'grain'
  );
  const [showGrid, setShowGrid] = useState<boolean>(
    currentSettings?.showGrid !== false
  );

  // Sync state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedEnvId(currentEnvironmentId);
      setIntensity(currentSettings?.intensity || 'balanced');
      setBackgroundFocus(currentSettings?.backgroundFocus || 'normal');
      setNoteStyle(currentSettings?.noteStyle || 'classic');
      setCustomColor(currentSettings?.customColor || '#E0E7FF');
      setCustomTexture(currentSettings?.customTexture || 'grain');
      setShowGrid(currentSettings?.showGrid !== false);
    }
  }, [isOpen, currentEnvironmentId, currentSettings]);

  // Trigger live preview on selection change
  const handleSelectEnvironment = (envId: string) => {
    setSelectedEnvId(envId);
    if (onLivePreview) {
      onLivePreview(envId, {
        environmentId: envId,
        intensity,
        backgroundFocus,
        noteStyle,
        customColor,
        customTexture,
        showGrid,
      });
    }
  };

  const handleApply = () => {
    onApplyEnvironment(selectedEnvId, {
      environmentId: selectedEnvId,
      intensity,
      backgroundFocus,
      noteStyle,
      customColor,
      customTexture,
      showGrid,
    });
    onClose();
  };

  const handleCancel = () => {
    if (onCancelPreview) onCancelPreview();
    onClose();
  };

  // Filter environments
  const filteredEnvironments = useMemo(() => {
    if (selectedTab === 'all') return ENVIRONMENTS;
    if (selectedTab === 'settings') return [];
    return ENVIRONMENTS.filter((e) => e.category === selectedTab);
  }, [selectedTab]);

  // Favorite environments definitions
  const favoriteEnvs = useMemo(() => {
    return favorites
      .map((id) => ENVIRONMENTS.find((e) => e.id === id))
      .filter((e): e is EnvironmentDefinition => Boolean(e));
  }, [favorites]);

  // Recent environments definitions
  const recentEnvs = useMemo(() => {
    return recentEnvironments
      .map((id) => ENVIRONMENTS.find((e) => e.id === id))
      .filter((e): e is EnvironmentDefinition => Boolean(e))
      .slice(0, 4);
  }, [recentEnvironments]);

  if (!isOpen) return null;

  const currentEnvDef = getEnvironmentById(selectedEnvId);

  return (
    <div
      data-export-ignore="true"
      className="fixed inset-0 z-[99999] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 select-none animate-in fade-in duration-150"
      onClick={handleCancel}
    >
      <div
        className="w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-base text-slate-900 leading-none">
                  Customize Thoughtscape
                </h2>
                <span className="text-[10px] font-semibold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                  {activeLandscapeName}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Choose the physical environment where your thoughts live.
              </p>
            </div>
          </div>

          <button
            onClick={handleCancel}
            className="p-1.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Categories Tab Bar */}
        <div className="flex items-center gap-1.5 px-6 py-2.5 bg-slate-100/70 border-b border-slate-200/70 overflow-x-auto">
          {ENVIRONMENT_CATEGORIES.map((cat) => {
            const isActive = selectedTab === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedTab(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs scale-102'
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80 hover:bg-slate-50'
                }`}
              >
                {cat.id === 'custom' && <Palette className="w-3.5 h-3.5" />}
                <span>{cat.name}</span>
              </button>
            );
          })}

          <div className="h-4 w-px bg-slate-300 mx-1" />

          <button
            onClick={() => setSelectedTab('settings')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              selectedTab === 'settings'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80 hover:bg-slate-50'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Environment Settings</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Quick Favorites Row (if any) */}
          {selectedTab === 'all' && favoriteEnvs.length > 0 && (
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>Your Favorites</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {favoriteEnvs.map((env) => (
                  <button
                    key={env.id}
                    onClick={() => handleSelectEnvironment(env.id)}
                    className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden flex items-center gap-3 ${
                      selectedEnvId === env.id
                        ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-600/30'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div
                      style={{ background: env.previewGradient }}
                      className="w-9 h-9 rounded-xl shrink-0 border border-black/10 shadow-xs"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-xs text-slate-800 truncate">{env.name}</div>
                      <div className="text-[10px] text-slate-500 truncate">{env.tagline}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Recents Row */}
          {selectedTab === 'all' && recentEnvs.length > 0 && (
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                <span>Recently Used Spaces</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {recentEnvs.map((env) => (
                  <button
                    key={env.id}
                    onClick={() => handleSelectEnvironment(env.id)}
                    className={`p-2.5 rounded-2xl border text-left transition-all relative flex items-center gap-2.5 ${
                      selectedEnvId === env.id
                        ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-600/30'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div
                      style={{ background: env.previewGradient }}
                      className="w-8 h-8 rounded-xl shrink-0 border border-black/10 shadow-xs"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-xs text-slate-800 truncate">{env.name}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Main Environment Gallery Cards Grid */}
          {selectedTab !== 'settings' && selectedTab !== 'custom' && (
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                {selectedTab === 'all' ? 'All Thoughtscape Spaces' : `${selectedTab.toUpperCase()} Spaces`}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredEnvironments.map((env) => {
                  const isSelected = selectedEnvId === env.id;
                  const isFav = favorites.includes(env.id);

                  return (
                    <div
                      key={env.id}
                      onClick={() => handleSelectEnvironment(env.id)}
                      className={`group relative rounded-3xl border-2 p-4 cursor-pointer transition-all hover:scale-[1.015] active:scale-[0.99] flex flex-col justify-between overflow-hidden shadow-xs ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/40 ring-4 ring-blue-500/20'
                          : 'border-slate-200/90 bg-white hover:border-slate-300 hover:shadow-md'
                      }`}
                    >
                      {/* Live Thumbnail Visual Canvas */}
                      <div
                        style={{
                          background: env.previewGradient,
                          borderColor: env.secondaryColor || 'rgba(0,0,0,0.1)',
                        }}
                        className="relative h-28 w-full rounded-2xl border overflow-hidden p-3 flex items-center justify-around shadow-inner mb-3.5"
                      >
                        {/* Simulated Note 1 */}
                        <div
                          style={{
                            backgroundColor: '#FEF08A',
                            borderColor: '#FDE047',
                          }}
                          className={`w-20 h-16 rounded-xs border p-1.5 text-[8px] text-slate-800 font-bold -rotate-3 select-none flex flex-col justify-between ${
                            env.notePhysics.shadowType === 'chalk'
                              ? 'shadow-[0_4px_12px_rgba(0,0,0,0.5)]'
                              : env.notePhysics.shadowType === 'desk'
                              ? 'shadow-[0_4px_12px_rgba(50,25,10,0.3)]'
                              : 'shadow-md'
                          }`}
                        >
                          {env.notePhysics.pinVisible ? (
                            <div className="w-2 h-2 rounded-full bg-red-600 mx-auto -mt-2 border border-red-700 shadow-xs" />
                          ) : (
                            <div className="w-6 h-1 bg-white/50 rounded-xs mx-auto -mt-0.5" />
                          )}
                          <div>{env.name.split(' ')[0]} Idea</div>
                          <div className="text-[6px] text-slate-500 font-normal">Spatial thought</div>
                        </div>

                        {/* Simulated Note 2 */}
                        <div
                          style={{
                            backgroundColor: '#BFDBFE',
                            borderColor: '#93C5FD',
                          }}
                          className={`w-20 h-16 rounded-xs border p-1.5 text-[8px] text-blue-950 font-bold rotate-2 select-none flex flex-col justify-between ${
                            env.notePhysics.shadowType === 'chalk'
                              ? 'shadow-[0_4px_12px_rgba(0,0,0,0.5)]'
                              : env.notePhysics.shadowType === 'desk'
                              ? 'shadow-[0_4px_12px_rgba(50,25,10,0.3)]'
                              : 'shadow-md'
                          }`}
                        >
                          {env.notePhysics.pinVisible ? (
                            <div className="w-2 h-2 rounded-full bg-red-600 mx-auto -mt-2 border border-red-700 shadow-xs" />
                          ) : (
                            <div className="w-6 h-1 bg-white/50 rounded-xs mx-auto -mt-0.5" />
                          )}
                          <div>Core Model</div>
                          <div className="text-[6px] text-blue-700 font-normal">Connected ⚡</div>
                        </div>

                        {/* Selected Indicator Badge */}
                        {isSelected && (
                          <div className="absolute top-2 right-2 bg-blue-600 text-white p-1 rounded-full shadow-md animate-in zoom-in-50 duration-150">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        )}
                      </div>

                      {/* Card Content & Favorite Toggle */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-bold text-sm text-slate-900">{env.name}</h3>
                          {onToggleFavorite && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleFavorite(env.id);
                              }}
                              className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-amber-500 transition-colors"
                              title="Toggle Favorite"
                            >
                              <Star
                                className={`w-4 h-4 ${
                                  isFav ? 'text-amber-500 fill-amber-500' : 'text-slate-300'
                                }`}
                              />
                            </button>
                          )}
                        </div>
                        <p className="text-xs font-semibold text-blue-600 mb-1">{env.tagline}</p>
                        <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                          {env.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Custom Color Wall Tab */}
          {selectedTab === 'custom' && (
            <div className="space-y-6 max-w-xl mx-auto py-2">
              <div className="text-center">
                <h3 className="text-base font-bold text-slate-900">Custom Wall Color & Texture</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Design your own personalized wall with any custom hue and ambient texture.
                </p>
              </div>

              {/* Custom Color Live Preview Canvas */}
              <div
                style={{ backgroundColor: customColor }}
                className="h-40 rounded-3xl border-2 border-slate-200 shadow-inner flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-200"
              >
                {customTexture === 'grain' && (
                  <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:12px_12px]" />
                )}
                {customTexture === 'grid' && (
                  <div className="absolute inset-0 opacity-20 bg-[linear-gradient(rgba(0,0,0,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.1)_1px,transparent_1px)] [background-size:24px_24px]" />
                )}

                <div className="relative z-10 w-28 h-20 bg-amber-100 border border-amber-300 rounded-sm p-2 shadow-lg -rotate-2 text-[10px] text-amber-900 font-bold flex flex-col justify-between">
                  <div>Custom Wall</div>
                  <div className="text-[8px] text-amber-700 font-normal">Thoughts adapt cleanly ✨</div>
                </div>
              </div>

              {/* Preset Palette Swatches */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Popular Wall Swatches
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {[
                    '#FAF9F6',
                    '#F7F5EE',
                    '#E0E7FF',
                    '#E7DFD5',
                    '#8FA395',
                    '#1E293B',
                    '#1B3B2B',
                    '#C26B51',
                    '#D6A6A4',
                    '#9DA0C7',
                    '#5C3D2E',
                    '#0F172A',
                  ].map((hex) => (
                    <button
                      key={hex}
                      onClick={() => {
                        setCustomColor(hex);
                        handleSelectEnvironment('custom');
                      }}
                      style={{ backgroundColor: hex }}
                      className={`h-10 rounded-xl border-2 shadow-xs transition-transform hover:scale-105 ${
                        customColor.toLowerCase() === hex.toLowerCase()
                          ? 'ring-2 ring-blue-600 ring-offset-2'
                          : 'border-slate-300'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Native Color Picker & Hex Input */}
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <input
                  type="color"
                  value={customColor}
                  onChange={(e) => {
                    setCustomColor(e.target.value);
                    handleSelectEnvironment('custom');
                  }}
                  className="w-10 h-10 rounded-xl border border-slate-300 cursor-pointer"
                />
                <div className="flex-1">
                  <span className="text-xs font-semibold text-slate-700 block">Custom Hex Code</span>
                  <input
                    type="text"
                    value={customColor}
                    onChange={(e) => {
                      setCustomColor(e.target.value);
                      handleSelectEnvironment('custom');
                    }}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-mono text-slate-800 uppercase focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Texture Overlay */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Texture Overlay
                </label>
                <div className="grid grid-cols-4 gap-2 text-xs">
                  {[
                    { id: 'none', label: 'Flat' },
                    { id: 'grain', label: 'Fine Plaster' },
                    { id: 'paper', label: 'Paper Fiber' },
                    { id: 'grid', label: 'Drafting Grid' },
                  ].map((tex) => (
                    <button
                      key={tex.id}
                      onClick={() => setCustomTexture(tex.id as any)}
                      className={`p-2.5 rounded-xl border font-semibold text-xs transition-colors ${
                        customTexture === tex.id
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {tex.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {selectedTab === 'settings' && (
            <div className="space-y-6 max-w-xl mx-auto py-2">
              <div className="text-center">
                <h3 className="text-base font-bold text-slate-900">Environment & Note Preferences</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Tune realism intensity, note typography, and background contrast.
                </p>
              </div>

              {/* Environment Intensity */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                  <Sun className="w-4 h-4 text-amber-600" />
                  <span>Environment Realism Intensity</span>
                </label>
                <p className="text-[11px] text-slate-500 mb-3">
                  Controls the presence of atmospheric lighting, wood trims, and realistic surface grain.
                </p>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'minimal', label: 'Minimal', desc: 'Mostly flat, distraction-free' },
                    { id: 'balanced', label: 'Balanced', desc: 'Subtle textures & lighting' },
                    { id: 'immersive', label: 'Immersive', desc: 'Full textures & frames' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setIntensity(opt.id as EnvironmentIntensity)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        intensity === opt.id
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="font-bold text-xs">{opt.label}</div>
                      <div
                        className={`text-[10px] mt-0.5 ${
                          intensity === opt.id ? 'text-blue-100' : 'text-slate-400'
                        }`}
                      >
                        {opt.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Note Style */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-purple-600" />
                  <span>Sticky Note Physical Style</span>
                </label>
                <p className="text-[11px] text-slate-500 mb-3">
                  Choose the visual personality and stationery feel of notes across your landscape.
                </p>

                <div className="grid grid-cols-2 gap-2">
                  {NOTE_THEMES.map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => setNoteStyle(theme.id as NoteVisualTheme)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        noteStyle === theme.id
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="font-bold text-xs">{theme.name}</div>
                      <div
                        className={`text-[10px] mt-0.5 ${
                          noteStyle === theme.id ? 'text-blue-100' : 'text-slate-400'
                        }`}
                      >
                        {theme.description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Background Focus / Dimming */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-indigo-600" />
                  <span>Background Focus & Dimming</span>
                </label>
                <p className="text-[11px] text-slate-500 mb-3">
                  Darkens or softens the environment to maximize thought readability.
                </p>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'normal', label: 'Normal (100%)' },
                    { id: 'soft', label: 'Soft Dim (10%)' },
                    { id: 'dim', label: 'Focus Dim (25%)' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setBackgroundFocus(f.id as BackgroundFocus)}
                      className={`p-2.5 rounded-xl border font-semibold text-xs transition-all ${
                        backgroundFocus === f.id
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Canvas Dot Grid Toggle */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <LayoutGrid className="w-4 h-4 text-slate-600" />
                  <div>
                    <div className="text-xs font-bold text-slate-800">Spatial Dot Grid</div>
                    <div className="text-[11px] text-slate-500">
                      Show infinite coordinate grid dots
                    </div>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showGrid}
                    onChange={(e) => setShowGrid(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              style={{ background: currentEnvDef.previewGradient }}
              className="w-6 h-6 rounded-lg border border-black/10 shadow-xs"
            />
            <div className="text-xs text-slate-600">
              Selected: <strong className="text-slate-900">{currentEnvDef.name}</strong>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium text-xs rounded-xl hover:bg-slate-200/60 transition-colors"
            >
              Cancel
            </button>

            <button
              onClick={handleApply}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Apply to Landscape</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
