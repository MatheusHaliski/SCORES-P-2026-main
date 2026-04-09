"use client";

import { useMemo, useRef, useState } from "react";
import {
  BackgroundStudioConfig,
  SoundtrackCategory,
  SoundtrackItem,
  STUDIO_PRESETS,
  buildBackgroundImage,
  getPresetById,
} from "@/types/backgroundStudio";

const SHAPES = ["none", "orb", "diamond", "mesh", "shards", "court-lines", "hex-grid"] as const;
const PATTERNS = ["smooth", "broadcast", "gradient-wave", "high-contrast"] as const;
const MOTIONS = ["none", "left-to-right", "right-to-left", "top-down", "center-pulse"] as const;
const CATEGORIES: SoundtrackCategory[] = ["Hype", "Arena", "Calm Focus", "Playoffs", "Premium Lounge", "Retro Sports", "Urban Energy"];

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

export function BackgroundStudioModal({ open, onClose, config, onChange, onSave, clubPrimary, clubSecondary }: Props) {
  const [trackDraft, setTrackDraft] = useState({ name: "", category: "Hype" as SoundtrackCategory, fileName: "" });
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const activeTrack = config.soundtrack.tracks.find((track) => track.id === config.soundtrack.activeTrackId) ?? null;
  const previewBackground = useMemo(() => buildBackgroundImage(config), [config]);

  if (!open) return null;

  const applyPreset = (presetId: BackgroundStudioConfig["preset"]) => {
    const preset = getPresetById(presetId);
    onChange({
      ...config,
      preset: preset.id,
      glowIntensity: preset.glowIntensity,
      blurStrength: preset.blurStrength,
      density: preset.density,
      depth: preset.depth,
      shapeLanguage: preset.shapeLanguage,
      pattern: preset.pattern,
      motionDirection: preset.motionDirection,
      contrast: preset.contrast,
      palette: {
        ...config.palette,
        primary: config.palette.useClubColors ? clubPrimary : preset.primary,
        secondary: config.palette.useClubColors ? clubSecondary : preset.secondary,
        highlight: preset.highlight,
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
    };
    onChange({
      ...config,
      soundtrack: {
        ...config.soundtrack,
        tracks: [...config.soundtrack.tracks, nextTrack],
      },
    });
    setTrackDraft({ name: "", category: "Hype", fileName: "" });
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

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/85 p-3">
      <div className="max-h-[94vh] w-full max-w-7xl overflow-auto rounded-3xl border border-cyan-300/30 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-4 shadow-[0_0_60px_rgba(34,211,238,0.2)]">
        <div className="mb-3 flex items-center justify-between border-b border-cyan-300/20 pb-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-cyan-200">Background Studio</p>
            <h2 className="text-2xl font-black text-white">Ambient Editor Premium</h2>
          </div>
          <div className="flex gap-2">
            <button onClick={onClose} className="rounded-xl border border-white/15 bg-slate-800/80 px-3 py-2 text-xs font-bold text-white">Fechar</button>
            <button onClick={onSave} className="rounded-xl border border-cyan-300/40 bg-cyan-500/20 px-3 py-2 text-xs font-bold text-cyan-100 shadow-[0_0_20px_rgba(34,211,238,0.25)]">Salvar Studio</button>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.7fr,1fr]">
          <div className="space-y-4">
            <section className="rounded-2xl border border-violet-300/30 bg-violet-500/5 p-3">
              <p className="mb-2 text-sm font-black text-violet-200">1) Presets visuais</p>
              <div className="grid gap-2 md:grid-cols-2">
                {STUDIO_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => applyPreset(preset.id)}
                    className={`rounded-xl border p-3 text-left transition hover:scale-[1.01] ${config.preset === preset.id ? "border-cyan-300/70 bg-cyan-500/15" : "border-white/10 bg-slate-900/70"}`}
                  >
                    <p className="font-bold text-white">{preset.name}</p>
                    <p className="text-xs text-slate-300">{preset.description}</p>
                  </button>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-cyan-300/25 bg-cyan-500/5 p-3">
              <p className="mb-2 text-sm font-black text-cyan-100">2) Composição visual</p>
              <div className="grid gap-3 md:grid-cols-2">
                {[
                  { label: "Glow", key: "glowIntensity", min: 0, max: 100 },
                  { label: "Blur", key: "blurStrength", min: 0, max: 40 },
                  { label: "Densidade", key: "density", min: 0, max: 100 },
                  { label: "Depth", key: "depth", min: 0, max: 100 },
                  { label: "Contraste", key: "contrast", min: 80, max: 130 },
                ].map((control) => (
                  <label key={control.key} className="rounded-xl border border-white/10 bg-slate-900/70 p-2 text-xs text-slate-200">
                    <div className="mb-1 flex items-center justify-between"><span>{control.label}</span><b>{config[control.key as keyof BackgroundStudioConfig] as number}</b></div>
                    <input
                      type="range"
                      className={sliderClass}
                      min={control.min}
                      max={control.max}
                      value={config[control.key as keyof BackgroundStudioConfig] as number}
                      onChange={(event) => onChange({ ...config, [control.key]: Number(event.target.value) })}
                    />
                  </label>
                ))}
              </div>
              <div className="mt-3 grid gap-2 md:grid-cols-3">
                <label className="text-xs text-slate-200">Shape
                  <select className="mt-1 w-full rounded-lg border border-white/15 bg-slate-800 p-2" value={config.shapeLanguage} onChange={(event) => onChange({ ...config, shapeLanguage: event.target.value as BackgroundStudioConfig["shapeLanguage"] })}>
                    {SHAPES.map((shape) => <option key={shape} value={shape}>{shape}</option>)}
                  </select>
                </label>
                <label className="text-xs text-slate-200">Padrão
                  <select className="mt-1 w-full rounded-lg border border-white/15 bg-slate-800 p-2" value={config.pattern} onChange={(event) => onChange({ ...config, pattern: event.target.value as BackgroundStudioConfig["pattern"] })}>
                    {PATTERNS.map((pattern) => <option key={pattern} value={pattern}>{pattern}</option>)}
                  </select>
                </label>
                <label className="text-xs text-slate-200">Motion
                  <select className="mt-1 w-full rounded-lg border border-white/15 bg-slate-800 p-2" value={config.motionDirection} onChange={(event) => onChange({ ...config, motionDirection: event.target.value as BackgroundStudioConfig["motionDirection"] })}>
                    {MOTIONS.map((motion) => <option key={motion} value={motion}>{motion}</option>)}
                  </select>
                </label>
              </div>
            </section>

            <section className="rounded-2xl border border-amber-300/30 bg-amber-500/5 p-3">
              <p className="mb-2 text-sm font-black text-amber-100">3) Paleta de cor</p>
              <label className="mb-2 inline-flex items-center gap-2 text-xs text-slate-100">
                <input
                  type="checkbox"
                  checked={config.palette.useClubColors}
                  onChange={(event) => onChange({
                    ...config,
                    palette: {
                      ...config.palette,
                      useClubColors: event.target.checked,
                      primary: event.target.checked ? clubPrimary : config.palette.primary,
                      secondary: event.target.checked ? clubSecondary : config.palette.secondary,
                    },
                  })}
                />
                Usar cores do clube automaticamente
              </label>
              <div className="grid gap-3 md:grid-cols-3">
                <label className="text-xs text-slate-200">Primária<input disabled={config.palette.useClubColors} type="color" value={config.palette.primary} onChange={(event) => onChange({ ...config, palette: { ...config.palette, primary: event.target.value } })} className="mt-1 h-10 w-full rounded-lg border border-white/20 bg-transparent" /></label>
                <label className="text-xs text-slate-200">Secundária<input disabled={config.palette.useClubColors} type="color" value={config.palette.secondary} onChange={(event) => onChange({ ...config, palette: { ...config.palette, secondary: event.target.value } })} className="mt-1 h-10 w-full rounded-lg border border-white/20 bg-transparent" /></label>
                <label className="text-xs text-slate-200">Highlight<input type="color" value={config.palette.highlight} onChange={(event) => onChange({ ...config, palette: { ...config.palette, highlight: event.target.value } })} className="mt-1 h-10 w-full rounded-lg border border-white/20 bg-transparent" /></label>
              </div>
            </section>

            <section className="rounded-2xl border border-emerald-300/30 bg-emerald-500/5 p-3">
              <p className="mb-2 text-sm font-black text-emerald-100">4) Soundtrack Studio</p>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2 rounded-xl border border-white/10 bg-slate-900/70 p-2">
                  <p className="text-xs uppercase tracking-[0.14em] text-emerald-200">Adicionar música</p>
                  <input value={trackDraft.name} onChange={(event) => setTrackDraft((prev) => ({ ...prev, name: event.target.value }))} placeholder="Nome da soundtrack" className="w-full rounded-lg border border-white/15 bg-slate-800 px-2 py-1 text-sm" />
                  <select value={trackDraft.category} onChange={(event) => setTrackDraft((prev) => ({ ...prev, category: event.target.value as SoundtrackCategory }))} className="w-full rounded-lg border border-white/15 bg-slate-800 px-2 py-1 text-sm">
                    {CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}
                  </select>
                  <div className="flex gap-2">
                    <button onClick={() => fileInputRef.current?.click()} className="rounded-lg border border-white/15 bg-slate-800 px-2 py-1 text-xs">Upload áudio</button>
                    <span className="text-xs text-slate-400">{trackDraft.fileName || "Sem arquivo"}</span>
                  </div>
                  <input ref={fileInputRef} type="file" accept="audio/*" className="hidden" onChange={(event) => setTrackDraft((prev) => ({ ...prev, fileName: event.target.files?.[0]?.name ?? "" }))} />
                  <button onClick={addTrack} className="rounded-lg border border-emerald-300/35 bg-emerald-500/20 px-2 py-1 text-xs font-bold text-emerald-100">Adicionar música</button>
                </div>

                <div className="space-y-2 rounded-xl border border-white/10 bg-slate-900/70 p-2">
                  <p className="text-xs uppercase tracking-[0.14em] text-emerald-200">Trilhas salvas</p>
                  <div className="max-h-44 space-y-1 overflow-auto">
                    {config.soundtrack.tracks.map((track) => (
                      <div key={track.id} className="flex items-center justify-between rounded-lg border border-white/10 bg-slate-800/80 px-2 py-1">
                        <button className="text-left" onClick={() => onChange({ ...config, soundtrack: { ...config.soundtrack, activeTrackId: track.id } })}>
                          <p className="text-xs font-semibold text-white">{track.name}</p>
                          <p className="text-[11px] text-slate-400">{track.category} {track.fileName ? `• ${track.fileName}` : ""}</p>
                        </button>
                        <button onClick={() => removeTrack(track.id)} className="text-xs text-rose-300">Remover</button>
                      </div>
                    ))}
                  </div>
                  <label className="text-xs text-slate-300">Volume {config.soundtrack.volume}%<input type="range" min={0} max={100} value={config.soundtrack.volume} className={sliderClass} onChange={(event) => onChange({ ...config, soundtrack: { ...config.soundtrack, volume: Number(event.target.value) } })} /></label>
                  <div className="flex flex-wrap gap-3 text-xs text-slate-200">
                    <label className="inline-flex items-center gap-1"><input type="checkbox" checked={config.soundtrack.autoPlay} onChange={(event) => onChange({ ...config, soundtrack: { ...config.soundtrack, autoPlay: event.target.checked } })} />Auto play</label>
                    <label className="inline-flex items-center gap-1"><input type="checkbox" checked={config.soundtrack.loop} onChange={(event) => onChange({ ...config, soundtrack: { ...config.soundtrack, loop: event.target.checked } })} />Loop</label>
                  </div>
                  <p className="text-xs text-cyan-100">Trilha ativa: <b>{activeTrack?.name ?? "Nenhuma"}</b></p>
                  {activeTrack?.fileUrl && <audio controls src={activeTrack.fileUrl} className="w-full" />}
                </div>
              </div>
            </section>
          </div>

          <section className="rounded-2xl border border-cyan-300/30 bg-slate-900/70 p-3">
            <p className="text-sm font-black text-cyan-100">5) Preview em tempo real</p>
            <div className="mt-2 space-y-3">
              <div className="rounded-xl border border-white/15 p-3" style={{ backgroundImage: previewBackground, filter: `contrast(${config.contrast}%) blur(${Math.max(0, config.blurStrength - 12)}px)` }}>
                <p className="text-xs uppercase tracking-[0.18em] text-cyan-100">Painel principal</p>
                <p className="text-lg font-black text-white">SCORES Squad HQ</p>
                <p className="text-xs text-slate-200">Preset: {getPresetById(config.preset).name}</p>
              </div>

              <div className="rounded-xl border border-white/15 bg-slate-900/65 p-3" style={{ boxShadow: `0 0 ${Math.max(18, config.glowIntensity)}px ${config.palette.highlight}55` }}>
                <p className="text-[11px] uppercase tracking-[0.16em] text-slate-300">Next Match Card</p>
                <p className="mt-1 text-sm font-bold text-white">Home vs Away</p>
                <p className="text-xs text-slate-300">Mood: {config.shapeLanguage} • {config.motionDirection}</p>
              </div>

              <div className="rounded-xl border border-white/15 p-3" style={{ backgroundImage: previewBackground }}>
                <p className="text-[11px] uppercase tracking-[0.16em] text-slate-200">Squad/Home ambience</p>
                <p className="text-sm text-white">Glow {config.glowIntensity}% • Density {config.density}% • Depth {config.depth}%</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
