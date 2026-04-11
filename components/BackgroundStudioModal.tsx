"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AUTHVIEW_DEFAULT_BACKGROUND_CSS,
  BACKGROUND_STUDIO_PRESETS,
  BackgroundStudioConfig,
  PageBackgroundMode,
  PAGE_BACKGROUND_GRADIENTS,
  SoundtrackCategory,
  SoundtrackItem,
  buildBackgroundImage,
  getBackgroundStudioPreset,
  resolveStudioPresetTheme,
} from "@/types/backgroundStudio";
import { getMetallicGradient, getMetallicStyle } from "@/styles/metallicTheme";

type Props = {
  open: boolean;
  onClose: () => void;
  config: BackgroundStudioConfig;
  onChange: (next: BackgroundStudioConfig) => void;
  onSave: () => void;
  clubPrimary: string;
  clubSecondary: string;
};

const sliderClass = "w-full accent-cyan-300";
const SHAPES = ["none", "orb", "diamond", "mesh", "shards", "court-lines", "hex-grid"] as const;
const PATTERNS = ["smooth", "broadcast", "gradient-wave", "high-contrast"] as const;
const MOTIONS = ["none", "left-to-right", "right-to-left", "top-down", "center-pulse"] as const;
const CATEGORIES: SoundtrackCategory[] = ["Hype", "Arena", "Calm Focus", "Playoffs", "Premium Lounge", "Retro Sports", "Urban Energy"];

export function BackgroundStudioModal({ open, onClose, config, onChange, onSave, clubPrimary, clubSecondary }: Props) {
  const [trackDraft, setTrackDraft] = useState({ name: "", category: "Hype" as SoundtrackCategory, fileName: "", fileDataUrl: "" });
  const [activeTrackPlaybackUrl, setActiveTrackPlaybackUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  const activeTrack = config.soundtrack.tracks.find((track) => track.id === config.soundtrack.activeTrackId) ?? null;
  const activeTrackPlaybackSrc = activeTrack?.fileDataUrl ? activeTrackPlaybackUrl : (activeTrack?.fileUrl ?? null);
  const previewBackground = useMemo(() => buildBackgroundImage(config), [config]);
  const shellPreviewStyle = useMemo(() => {
    if (config.pageBackground.mode === "solid-color") return { backgroundColor: config.pageBackground.solidColor };
    if (config.pageBackground.mode === "upload-image" && config.pageBackground.imageDataUrl) {
      return { backgroundImage: `url('${config.pageBackground.imageDataUrl}')`, backgroundSize: "cover", backgroundPosition: "center" };
    }
    if (config.pageBackground.mode === "preset-gradient") {
      const gradient = PAGE_BACKGROUND_GRADIENTS.find((item) => item.id === config.pageBackground.gradientId);
      return { backgroundImage: gradient?.css ?? PAGE_BACKGROUND_GRADIENTS[0].css };
    }
    return { backgroundImage: AUTHVIEW_DEFAULT_BACKGROUND_CSS, backgroundSize: "cover", backgroundPosition: "center" };
  }, [config]);
  const modalChromeStyle = useMemo(
    () => ({
      ...getMetallicStyle(),
      borderColor: `${config.uiPalette.highlight}66`,
      backgroundImage: `${getMetallicGradient()}, linear-gradient(160deg, ${config.uiPalette.primary}b8, ${config.uiPalette.secondary}8f), repeating-linear-gradient(0deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 1px, transparent 1px, transparent 3px)`,
      boxShadow: "inset 0 0 25px rgba(255,255,255,0.1), 0 10px 40px rgba(0,0,0,0.6)",
    }),
    [config.uiPalette.highlight, config.uiPalette.primary, config.uiPalette.secondary],
  );
  const primaryActionStyle = useMemo(
    () => ({
      ...getMetallicStyle(),
      borderColor: `${config.uiPalette.highlight}99`,
      backgroundImage: `${getMetallicGradient()}, linear-gradient(120deg, ${config.uiPalette.highlight}33, ${config.uiPalette.primary}66)`,
      color: "#ecfeff",
      borderRadius: "10px",
      padding: "8px 14px",
    }),
    [config.uiPalette.highlight, config.uiPalette.primary],
  );

  useEffect(() => {
    if (!activeTrack?.fileDataUrl) return;

    const response = fetch(activeTrack.fileDataUrl).then((result) => result.blob());
    let cancelled = false;
    let playbackUrl: string | null = null;
    response.then((blob) => {
      if (cancelled) return;
      playbackUrl = URL.createObjectURL(blob);
      setActiveTrackPlaybackUrl(playbackUrl);
    }).catch(() => {
      if (cancelled) return;
      setActiveTrackPlaybackUrl(null);
    });

    return () => {
      cancelled = true;
      if (playbackUrl) URL.revokeObjectURL(playbackUrl);
    };
  }, [activeTrack?.fileDataUrl]);

  if (!open) return null;

  const applyPreset = (presetId: BackgroundStudioConfig["matchVisual"]["presetId"]) => {
    const presetTheme = resolveStudioPresetTheme(presetId, {
      primary: clubPrimary,
      secondary: clubSecondary,
    });
    onChange({
      ...config,
      matchVisual: {
        ...config.matchVisual,
        ...(presetTheme.matchVisual ?? {}),
      },
      uiPalette: {
        ...config.uiPalette,
        ...(presetTheme.uiPalette ?? {}),
      },
    });
  };

  const addTrack = () => {
    if (!trackDraft.name.trim()) return;
    const nextTrack: SoundtrackItem = {
      id: `custom-${Date.now()}`,
      name: trackDraft.name.trim(),
      category: trackDraft.category,
      fileName: trackDraft.fileName || undefined,
      fileDataUrl: trackDraft.fileDataUrl || undefined,
    };
    onChange({
      ...config,
      soundtrack: {
        ...config.soundtrack,
        tracks: [...config.soundtrack.tracks, nextTrack],
        activeTrackId: config.soundtrack.activeTrackId ?? nextTrack.id,
      },
    });
    setTrackDraft({ name: "", category: "Hype", fileName: "", fileDataUrl: "" });
  };

  const updateTrack = (trackId: string, patch: Partial<SoundtrackItem>) => {
    onChange({
      ...config,
      soundtrack: {
        ...config.soundtrack,
        tracks: config.soundtrack.tracks.map((track) => (track.id === trackId ? { ...track, ...patch } : track)),
      },
    });
  };

  const removeTrack = (trackId: string) => {
    const tracks = config.soundtrack.tracks.filter((track) => track.id !== trackId);
    onChange({
      ...config,
      soundtrack: {
        ...config.soundtrack,
        tracks,
        activeTrackId: config.soundtrack.activeTrackId === trackId ? tracks[0]?.id ?? null : config.soundtrack.activeTrackId,
      },
    });
  };

  const applyDerivedClubTheme = () => {
    onChange({
      ...config,
      uiPalette: {
        ...config.uiPalette,
        useClubColors: true,
        primary: clubPrimary,
        secondary: clubSecondary,
      },
      matchVisual: {
        ...config.matchVisual,
        glowIntensity: Math.max(55, config.matchVisual.glowIntensity),
        contrast: Math.max(102, config.matchVisual.contrast),
      },
    });
  };

  const updatePageBackgroundMode = (mode: PageBackgroundMode) => {
    onChange({
      ...config,
      pageBackground: {
        ...config.pageBackground,
        mode,
      },
    });
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/85 p-3">
      <div className="max-h-[94vh] w-full max-w-6xl overflow-auto rounded-3xl border p-4 text-white" style={modalChromeStyle}>
        <div className="mb-3 flex items-center justify-between border-b border-cyan-300/20 pb-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-cyan-200">Background Studio</p>
            <h2 className="text-2xl font-black text-white">3 camadas separadas: Página, MatchView e UI</h2>
            <p className="text-xs text-cyan-100/85">Presets/Composição alteram MatchView. Paleta altera UI. Background da página altera apenas wallpaper global.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="rounded-xl border px-3 py-2 text-xs font-bold text-white transition-all duration-200 hover:scale-[1.03] hover:shadow-[0_0_25px_rgba(34,197,94,0.35)]"
              style={getMetallicStyle()}
            >
              Fechar
            </button>
            <button onClick={onSave} className="rounded-xl border px-3 py-2 text-xs font-bold transition-all duration-200 hover:scale-[1.03] hover:shadow-[0_0_25px_rgba(34,197,94,0.35)]" style={primaryActionStyle}>Salvar Background Studio</button>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.7fr,1fr]">
          <div className="space-y-4">
            <section className="rounded-2xl border border-violet-300/30 bg-violet-500/5 p-3">
              <p className="mb-2 text-sm font-black text-violet-200">1) Presets visuais (somente CAMADA B)</p>
              <div className="grid gap-2 md:grid-cols-3">
                {BACKGROUND_STUDIO_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => applyPreset(preset.id)}
                    className={`rounded-xl border p-3 text-left transition hover:scale-[1.01] ${config.matchVisual.presetId === preset.id ? "border-cyan-300 bg-cyan-500/20 shadow-[0_0_0_1px_rgba(34,211,238,0.5)]" : "border-white/10 bg-slate-900/70"}`}
                  >
                    <p className="font-bold text-white">{preset.name}</p>
                    <p className="text-xs text-slate-300">{preset.description}</p>
                  </button>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-cyan-300/25 bg-cyan-500/5 p-3">
              <p className="mb-2 text-sm font-black text-cyan-100">2) Composição visual (refino da CAMADA B)</p>
              <div className="grid gap-3 md:grid-cols-2">
                {[
                  { label: "Glow", key: "glowIntensity", min: 0, max: 100 },
                  { label: "Blur", key: "blurStrength", min: 0, max: 40 },
                  { label: "Densidade", key: "density", min: 0, max: 100 },
                  { label: "Depth", key: "depth", min: 0, max: 100 },
                  { label: "Contraste", key: "contrast", min: 80, max: 130 },
                  { label: "Textura", key: "textureIntensity", min: 0, max: 100 },
                  { label: "Gloss/Reflexo", key: "glossIntensity", min: 0, max: 100 },
                  { label: "Polimento de borda", key: "borderPolishIntensity", min: 0, max: 100 },
                ].map((control) => (
                  <label key={control.key} className="rounded-xl border border-white/10 bg-slate-900/70 p-2 text-xs text-slate-200">
                    <div className="mb-1 flex items-center justify-between"><span>{control.label}</span><b>{config.matchVisual[control.key as keyof BackgroundStudioConfig["matchVisual"]] as number}</b></div>
                    <input type="range" className={sliderClass} min={control.min} max={control.max} value={config.matchVisual[control.key as keyof BackgroundStudioConfig["matchVisual"]] as number} onChange={(event) => onChange({ ...config, matchVisual: { ...config.matchVisual, [control.key]: Number(event.target.value) } })} />
                  </label>
                ))}
              </div>
              <div className="mt-3 grid gap-2 md:grid-cols-3">
                <label className="text-xs text-slate-200">Shape
                  <select className="mt-1 w-full rounded-lg border border-white/15 bg-slate-800 p-2" value={config.matchVisual.shapeLanguage} onChange={(event) => onChange({ ...config, matchVisual: { ...config.matchVisual, shapeLanguage: event.target.value as BackgroundStudioConfig["matchVisual"]["shapeLanguage"] } })}>
                    {SHAPES.map((shape) => <option key={shape} value={shape}>{shape}</option>)}
                  </select>
                </label>
                <label className="text-xs text-slate-200">Padrão
                  <select className="mt-1 w-full rounded-lg border border-white/15 bg-slate-800 p-2" value={config.matchVisual.pattern} onChange={(event) => onChange({ ...config, matchVisual: { ...config.matchVisual, pattern: event.target.value as BackgroundStudioConfig["matchVisual"]["pattern"] } })}>
                    {PATTERNS.map((pattern) => <option key={pattern} value={pattern}>{pattern}</option>)}
                  </select>
                </label>
                <label className="text-xs text-slate-200">Motion
                  <select className="mt-1 w-full rounded-lg border border-white/15 bg-slate-800 p-2" value={config.matchVisual.motionDirection} onChange={(event) => onChange({ ...config, matchVisual: { ...config.matchVisual, motionDirection: event.target.value as BackgroundStudioConfig["matchVisual"]["motionDirection"] } })}>
                    {MOTIONS.map((motion) => <option key={motion} value={motion}>{motion}</option>)}
                  </select>
                </label>
              </div>
            </section>

            <section className="rounded-2xl border border-amber-300/30 bg-amber-500/5 p-3">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-black text-amber-100">3) Paleta de cor (somente CAMADA C)</p>
                <button onClick={applyDerivedClubTheme} className="rounded-lg border border-amber-300/35 bg-amber-500/20 px-2 py-1 text-[11px] font-bold text-amber-100">Aplicar tema do clube</button>
              </div>
              <label className="mb-2 inline-flex items-center gap-2 text-xs text-slate-100">
                <input type="checkbox" checked={config.uiPalette.useClubColors} onChange={(event) => onChange({ ...config, uiPalette: { ...config.uiPalette, useClubColors: event.target.checked, primary: event.target.checked ? clubPrimary : config.uiPalette.primary, secondary: event.target.checked ? clubSecondary : config.uiPalette.secondary } })} />
                Usar cores do clube automaticamente
              </label>
              <div className="grid gap-3 md:grid-cols-3">
                <label className="text-xs text-slate-200">Primária<input disabled={config.uiPalette.useClubColors} type="color" value={config.uiPalette.primary} onChange={(event) => onChange({ ...config, uiPalette: { ...config.uiPalette, primary: event.target.value } })} className="mt-1 h-10 w-full rounded-lg border border-white/20 bg-transparent" /></label>
                <label className="text-xs text-slate-200">Secundária<input disabled={config.uiPalette.useClubColors} type="color" value={config.uiPalette.secondary} onChange={(event) => onChange({ ...config, uiPalette: { ...config.uiPalette, secondary: event.target.value } })} className="mt-1 h-10 w-full rounded-lg border border-white/20 bg-transparent" /></label>
                <label className="text-xs text-slate-200">Highlight<input type="color" value={config.uiPalette.highlight} onChange={(event) => onChange({ ...config, uiPalette: { ...config.uiPalette, highlight: event.target.value } })} className="mt-1 h-10 w-full rounded-lg border border-white/20 bg-transparent" /></label>
              </div>
            </section>

            <section className="rounded-2xl border border-indigo-300/30 bg-indigo-500/5 p-3">
              <p className="mb-2 text-sm font-black text-indigo-100">4) Background da página inteira (somente CAMADA A)</p>
              <p className="mb-3 text-xs text-indigo-200/85">Aqui entra a arte global (ex.: paleta mexicana), atrás de toda a view.</p>
              <div className="grid gap-2 md:grid-cols-2">
                {[{ id: "preset-gradient", label: "Gradientes prontos" }, { id: "solid-color", label: "Cor sólida" }, { id: "upload-image", label: "Upload de imagem" }, { id: "auth-default-image", label: "Imagem padrão AuthView" }].map((mode) => (
                  <button key={mode.id} type="button" onClick={() => updatePageBackgroundMode(mode.id as PageBackgroundMode)} className={`rounded-lg border px-3 py-2 text-left text-xs transition ${config.pageBackground.mode === mode.id ? "border-cyan-300/70 bg-cyan-500/20 text-cyan-100" : "border-white/10 bg-slate-900/70 text-slate-300 hover:border-cyan-500/40"}`}>{mode.label}</button>
                ))}
              </div>
              <div className="mt-3 grid gap-2 md:grid-cols-2">
                <label className="rounded-lg border border-white/10 bg-slate-900/70 p-2 text-xs text-slate-200">Overlay da página {config.pageBackground.overlayOpacity}%<input type="range" min={0} max={90} value={config.pageBackground.overlayOpacity} className={sliderClass} onChange={(event) => onChange({ ...config, pageBackground: { ...config.pageBackground, overlayOpacity: Number(event.target.value) } })} /></label>
                <label className="rounded-lg border border-white/10 bg-slate-900/70 p-2 text-xs text-slate-200">Blur da página {config.pageBackground.blur}px<input type="range" min={0} max={20} value={config.pageBackground.blur} className={sliderClass} onChange={(event) => onChange({ ...config, pageBackground: { ...config.pageBackground, blur: Number(event.target.value) } })} /></label>
              </div>
              {config.pageBackground.mode === "preset-gradient" && <div className="mt-3 grid gap-2 md:grid-cols-2">{PAGE_BACKGROUND_GRADIENTS.map((gradient) => <button key={gradient.id} type="button" onClick={() => onChange({ ...config, pageBackground: { ...config.pageBackground, gradientId: gradient.id } })} className={`rounded-lg border p-2 text-left ${config.pageBackground.gradientId === gradient.id ? "border-cyan-300/70" : "border-white/10"}`} style={{ backgroundImage: gradient.css }}><span className="text-xs font-semibold text-white">{gradient.name}</span></button>)}</div>}
              {config.pageBackground.mode === "solid-color" && <label className="mt-3 block text-xs text-slate-200">Cor da página<input type="color" value={config.pageBackground.solidColor} onChange={(event) => onChange({ ...config, pageBackground: { ...config.pageBackground, solidColor: event.target.value } })} className="mt-1 h-10 w-full rounded-lg border border-white/20 bg-transparent" /></label>}
              {config.pageBackground.mode === "upload-image" && (
                <div className="mt-3 space-y-2">
                  <button type="button" onClick={() => imageInputRef.current?.click()} className="rounded-lg border border-white/15 bg-slate-800 px-2 py-1 text-xs text-white">Upload imagem de fundo</button>
                  <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = () => {
                      if (typeof reader.result === "string") onChange({ ...config, pageBackground: { ...config.pageBackground, imageDataUrl: reader.result } });
                    };
                    reader.readAsDataURL(file);
                  }} />
                  <p className="text-[11px] text-slate-300">{config.pageBackground.imageDataUrl ? "Imagem carregada no studio." : "Nenhuma imagem carregada."}</p>
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-emerald-300/30 bg-emerald-500/5 p-3">
              <p className="mb-2 text-sm font-black text-emerald-100">5) Soundtrack Studio</p>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2 rounded-xl border border-white/10 bg-slate-900/70 p-2">
                  <p className="text-xs uppercase tracking-[0.14em] text-emerald-200">Adicionar música</p>
                  <input value={trackDraft.name} onChange={(event) => setTrackDraft((prev) => ({ ...prev, name: event.target.value }))} placeholder="Nome da soundtrack" className="w-full rounded-lg border border-white/15 bg-slate-800 px-2 py-1 text-sm" />
                  <select value={trackDraft.category} onChange={(event) => setTrackDraft((prev) => ({ ...prev, category: event.target.value as SoundtrackCategory }))} className="w-full rounded-lg border border-white/15 bg-slate-800 px-2 py-1 text-sm">{CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}</select>
                  <div className="flex gap-2">
                    <button onClick={() => fileInputRef.current?.click()} className="rounded-lg border border-white/15 bg-slate-800 px-2 py-1 text-xs">Upload áudio</button>
                    <span className="text-xs text-slate-400">{trackDraft.fileName || "Sem arquivo"}</span>
                  </div>
                  <input ref={fileInputRef} type="file" accept="audio/*" className="hidden" onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (!file) return setTrackDraft((prev) => ({ ...prev, fileName: "", fileDataUrl: "" }));
                    const reader = new FileReader();
                    reader.onload = () => {
                      const result = reader.result;
                      if (typeof result === "string") setTrackDraft((prev) => ({ ...prev, fileName: file.name, fileDataUrl: result }));
                    };
                    reader.readAsDataURL(file);
                  }} />
                  <button onClick={addTrack} className="rounded-lg border border-emerald-300/35 bg-emerald-500/20 px-2 py-1 text-xs font-bold text-emerald-100">Adicionar música</button>
                </div>

                <div className="space-y-2 rounded-xl border border-white/10 bg-slate-900/70 p-2">
                  <p className="text-xs uppercase tracking-[0.14em] text-emerald-200">Trilhas salvas</p>
                  <div className="max-h-44 space-y-1 overflow-auto">
                    {config.soundtrack.tracks.map((track) => (
                      <div key={track.id} className="rounded-lg border border-white/10 bg-slate-800/80 px-2 py-1">
                        <div className="mb-1 flex items-center justify-between gap-2">
                          <button className="text-left" onClick={() => onChange({ ...config, soundtrack: { ...config.soundtrack, activeTrackId: track.id } })}><p className="text-xs font-semibold text-white">{track.name}</p><p className="text-[11px] text-slate-400">{track.category} {track.fileName ? `• ${track.fileName}` : ""}</p></button>
                          <div className="flex items-center gap-2">
                            <button onClick={() => onChange({ ...config, soundtrack: { ...config.soundtrack, activeTrackId: track.id } })} className="text-[11px] text-cyan-200">Definir ativa</button>
                            <button onClick={() => removeTrack(track.id)} className="text-[11px] text-rose-300">Remover</button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-1">
                          <input value={track.name} onChange={(event) => updateTrack(track.id, { name: event.target.value })} className="rounded border border-white/15 bg-slate-900 px-1 py-0.5 text-[11px]" />
                          <select value={track.category} onChange={(event) => updateTrack(track.id, { category: event.target.value as SoundtrackCategory })} className="rounded border border-white/15 bg-slate-900 px-1 py-0.5 text-[11px]">{CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}</select>
                        </div>
                      </div>
                    ))}
                  </div>
                  <label className="text-xs text-slate-300">Volume {config.soundtrack.volume}%<input type="range" min={0} max={100} value={config.soundtrack.volume} className={sliderClass} onChange={(event) => onChange({ ...config, soundtrack: { ...config.soundtrack, volume: Number(event.target.value) } })} /></label>
                  <div className="flex flex-wrap gap-3 text-xs text-slate-200">
                    <label className="inline-flex items-center gap-1"><input type="checkbox" checked={config.soundtrack.autoPlay} onChange={(event) => onChange({ ...config, soundtrack: { ...config.soundtrack, autoPlay: event.target.checked } })} />Auto play</label>
                    <label className="inline-flex items-center gap-1"><input type="checkbox" checked={config.soundtrack.loop} onChange={(event) => onChange({ ...config, soundtrack: { ...config.soundtrack, loop: event.target.checked } })} />Loop</label>
                  </div>
                  <p className="text-xs text-cyan-100">Trilha ativa: <b>{activeTrack?.name ?? "Nenhuma"}</b></p>
                  {activeTrackPlaybackSrc && <audio controls src={activeTrackPlaybackSrc} className="w-full" />}
                </div>
              </div>
            </section>
          </div>

          <section className="rounded-2xl border border-cyan-300/30 bg-slate-900/70 p-3">
            <p className="text-sm font-black text-cyan-100">6) Preview em tempo real</p>
            <p className="mt-1 text-xs text-cyan-100/85">Preview em tempo real: SquadView, Match shell, Next Match e chrome principal atualizam instantaneamente.</p>
            <p className="mt-1 text-[11px] text-cyan-100/80">Skin ativa: <span className="font-semibold">{config.matchVisual.skinMode === "scores-metallic-premium" ? "SCORES Metallic Premium" : "Default"}</span></p>
            <div className="mt-2 space-y-3">
              <div className="rounded-xl border border-white/15 p-3" style={{ backgroundImage: previewBackground, filter: `contrast(${config.matchVisual.contrast}%) blur(${Math.max(0, config.matchVisual.blurStrength - 12)}px)` }}>
                <p className="text-xs uppercase tracking-[0.18em] text-cyan-100">Preview CAMADA B • Match visual</p>
                <p className="text-lg font-black text-white">SCORES MatchView</p>
                <p className="text-xs text-slate-200">Preset: {getBackgroundStudioPreset(config.matchVisual.presetId).name}</p>
              </div>

              <div className={`rounded-xl border border-white/15 p-3 ${config.matchVisual.skinMode === "scores-metallic-premium" ? "sa-premium-metallic-panel" : "bg-slate-900/65"}`} style={{ boxShadow: `0 0 ${Math.max(18, config.matchVisual.glowIntensity)}px ${config.uiPalette.highlight}55` }}>
                <p className="text-[11px] uppercase tracking-[0.16em] text-slate-300">Preview CAMADA C • UI theme accents</p>
                <p className="mt-1 text-sm font-bold text-white">Topbar, botões, cards, modais</p>
                <p className="text-xs text-slate-300">Highlight: {config.uiPalette.highlight}</p>
              </div>

              <div className="rounded-xl border border-white/15 p-3" style={shellPreviewStyle}>
                <p className="text-[11px] uppercase tracking-[0.16em] text-slate-200">Preview CAMADA A • Page background</p>
                <p className="text-sm text-white">Modo: {config.pageBackground.mode}</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
