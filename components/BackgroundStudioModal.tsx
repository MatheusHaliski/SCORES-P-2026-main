"use client";

import { ReactNode, useRef } from "react";
import {
  BACKGROUND_STUDIO_PRESETS,
  BackgroundStudioConfig,
  buildBackgroundPreviewStyle,
  getBackgroundStudioPreset,
} from "@/types/backgroundStudio";

type Props = {
  open: boolean;
  onClose: () => void;
  config: BackgroundStudioConfig;
  onChange: (next: BackgroundStudioConfig) => void;
  onSave: () => void;
};

const sliderClass = "w-full accent-cyan-300";

function SlotCard(params: {
  title: string;
  subtitle: string;
  imageUrl: string | null;
  overlay: number;
  blur: number;
  glow: number;
  onUpload: () => void;
  onOverlayChange: (value: number) => void;
  onBlurChange: (value: number) => void;
  onGlowChange: (value: number) => void;
  children?: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-cyan-300/25 bg-cyan-500/5 p-3">
      <p className="text-sm font-black text-cyan-100">{params.title}</p>
      <p className="mb-3 text-xs text-cyan-100/80">{params.subtitle}</p>

      <button
        type="button"
        onClick={params.onUpload}
        className="rounded-lg border border-white/15 bg-slate-800 px-3 py-2 text-xs text-white"
      >
        Upload image
      </button>

      <div className="mt-3 grid gap-2 md:grid-cols-3">
        <label className="rounded-lg border border-white/10 bg-slate-900/70 p-2 text-xs text-slate-200">
          Overlay {params.overlay}%
          <input type="range" min={0} max={90} value={params.overlay} className={sliderClass} onChange={(event) => params.onOverlayChange(Number(event.target.value))} />
        </label>
        <label className="rounded-lg border border-white/10 bg-slate-900/70 p-2 text-xs text-slate-200">
          Blur {params.blur}px
          <input type="range" min={0} max={12} value={params.blur} className={sliderClass} onChange={(event) => params.onBlurChange(Number(event.target.value))} />
        </label>
        <label className="rounded-lg border border-white/10 bg-slate-900/70 p-2 text-xs text-slate-200">
          Glow {params.glow}px
          <input type="range" min={0} max={100} value={params.glow} className={sliderClass} onChange={(event) => params.onGlowChange(Number(event.target.value))} />
        </label>
      </div>

      {params.children}

      <div
        className="mt-3 rounded-xl border border-white/15 p-3"
        style={buildBackgroundPreviewStyle({
          imageUrl: params.imageUrl,
          overlay: params.overlay,
          blur: params.blur,
          glow: params.glow,
          fallbackGradient: "linear-gradient(135deg, #0f172a, #1e293b)",
        })}
      >
        <p className="text-[11px] uppercase tracking-[0.16em] text-slate-100">Live Preview</p>
        <p className="text-sm font-semibold text-white">{params.title}</p>
      </div>
    </section>
  );
}

export function BackgroundStudioModal({ open, onClose, config, onChange, onSave }: Props) {
  const shellInputRef = useRef<HTMLInputElement | null>(null);
  const nextMatchInputRef = useRef<HTMLInputElement | null>(null);
  const handleShellUploadClick = () => shellInputRef.current?.click();
  const handleNextMatchUploadClick = () => nextMatchInputRef.current?.click();

  if (!open) return null;

  const applyPreset = (presetId: BackgroundStudioConfig["preset"]) => {
    const preset = getBackgroundStudioPreset(presetId);
    onChange({
      ...config,
      preset: preset.id,
      shellBackgroundUrl: preset.shellBackgroundUrl,
      nextMatchBackgroundUrl: preset.nextMatchBackgroundUrl,
      shellOverlay: preset.shellOverlay,
      nextMatchOverlay: preset.nextMatchOverlay,
      shellBlur: preset.shellBlur,
      shellGlow: preset.shellGlow,
      nextMatchBlur: preset.nextMatchBlur,
      nextMatchGlow: preset.nextMatchGlow,
    });
  };

  const readImage = (file: File, onLoad: (imageData: string) => void) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") onLoad(reader.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/85 p-3">
      <div className="max-h-[94vh] w-full max-w-6xl overflow-auto rounded-3xl border border-cyan-300/30 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-4 shadow-[0_0_60px_rgba(34,211,238,0.2)]">
        <div className="mb-3 flex items-center justify-between border-b border-cyan-300/20 pb-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-cyan-200">Background Studio</p>
            <h2 className="text-2xl font-black text-white">Edita apenas as camadas de imagem/art</h2>
            <p className="text-xs text-cyan-100/85">Aqui você controla somente os backgrounds visuais da View e do card Next Match.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={onClose} className="rounded-xl border border-white/15 bg-slate-800/80 px-3 py-2 text-xs font-bold text-white">Fechar</button>
            <button onClick={onSave} className="rounded-xl border border-cyan-300/40 bg-cyan-500/20 px-3 py-2 text-xs font-bold text-cyan-100 shadow-[0_0_20px_rgba(34,211,238,0.25)]">Salvar Background Studio</button>
          </div>
        </div>

        <section className="mb-4 rounded-2xl border border-violet-300/30 bg-violet-500/5 p-3">
          <p className="mb-2 text-sm font-black text-violet-200">Preset de imagens</p>
          <div className="grid gap-2 md:grid-cols-2">
            {BACKGROUND_STUDIO_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => applyPreset(preset.id)}
                className={`rounded-xl border p-3 text-left transition ${config.preset === preset.id ? "border-cyan-300/70 bg-cyan-500/15" : "border-white/10 bg-slate-900/70"}`}
              >
                <p className="font-bold text-white">{preset.name}</p>
                <p className="text-xs text-slate-300">{preset.description}</p>
              </button>
            ))}
          </div>
        </section>

        <div className="grid gap-4 xl:grid-cols-2">
          <SlotCard
            title="1) View Background / Shell Background"
            subtitle="Define somente o wallpaper da página/view principal."
            imageUrl={config.shellBackgroundUrl}
            overlay={config.shellOverlay}
            blur={config.shellBlur}
            glow={config.shellGlow}
            onUpload={handleShellUploadClick}
            onOverlayChange={(value) => onChange({ ...config, shellOverlay: value })}
            onBlurChange={(value) => onChange({ ...config, shellBlur: value })}
            onGlowChange={(value) => onChange({ ...config, shellGlow: value })}
          >
            <p className="mt-2 text-[11px] text-slate-300">Não altera textos, bordas, botões ou modal de identidade do clube.</p>
          </SlotCard>

          <SlotCard
            title="2) Next Match Background"
            subtitle="Define somente a imagem de fundo do card Next Match."
            imageUrl={config.nextMatchBackgroundUrl}
            overlay={config.nextMatchOverlay}
            blur={config.nextMatchBlur}
            glow={config.nextMatchGlow}
            onUpload={handleNextMatchUploadClick}
            onOverlayChange={(value) => onChange({ ...config, nextMatchOverlay: value })}
            onBlurChange={(value) => onChange({ ...config, nextMatchBlur: value })}
            onGlowChange={(value) => onChange({ ...config, nextMatchGlow: value })}
          >
            <p className="mt-2 text-[11px] text-slate-300">Não altera o wallpaper global da view e não muda tema interno de UI.</p>
          </SlotCard>
        </div>

        <input
          ref={shellInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            readImage(file, (imageData) => onChange({ ...config, shellBackgroundUrl: imageData }));
          }}
        />
        <input
          ref={nextMatchInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            readImage(file, (imageData) => onChange({ ...config, nextMatchBackgroundUrl: imageData }));
          }}
        />
      </div>
    </div>
  );
}
