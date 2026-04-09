export type BackgroundStudioPresetId = "arena-night" | "champions-gold" | "deep-ocean" | "auth-default";

export interface BackgroundStudioConfig {
  preset: BackgroundStudioPresetId;
  shellBackgroundUrl: string | null;
  nextMatchBackgroundUrl: string | null;
  shellOverlay: number;
  nextMatchOverlay: number;
  shellBlur: number;
  shellGlow: number;
  nextMatchBlur: number;
  nextMatchGlow: number;
}

export interface BackgroundStudioPreset {
  id: BackgroundStudioPresetId;
  name: string;
  description: string;
  shellBackgroundUrl: string | null;
  nextMatchBackgroundUrl: string | null;
  shellOverlay: number;
  nextMatchOverlay: number;
  shellBlur: number;
  shellGlow: number;
  nextMatchBlur: number;
  nextMatchGlow: number;
}

export const AUTHVIEW_DEFAULT_BACKGROUND_CSS = "url('/ChatGPT Image 9 de abr. de 2026, 13_10_17.png')";

export const BACKGROUND_STUDIO_PRESETS: BackgroundStudioPreset[] = [
  {
    id: "arena-night",
    name: "Arena Night",
    description: "Visual escuro de arena para shell e cartão de jogo.",
    shellBackgroundUrl: "/9C7464B5-579E-4D0D-947F-B24A4D449097.png",
    nextMatchBackgroundUrl: "/F7B8D2E0-9994-4BFC-8D62-0206D32198DA.png",
    shellOverlay: 42,
    nextMatchOverlay: 32,
    shellBlur: 0,
    shellGlow: 30,
    nextMatchBlur: 0,
    nextMatchGlow: 48,
  },
  {
    id: "champions-gold",
    name: "Champions Gold",
    description: "Arte premium em tons dourados para fases decisivas.",
    shellBackgroundUrl: "/1968F4FE-A4FF-44BB-944E-08BE533C975E.png",
    nextMatchBackgroundUrl: "/8F897497-4F06-4D51-8537-1FEF8E0386E1.png",
    shellOverlay: 36,
    nextMatchOverlay: 28,
    shellBlur: 0,
    shellGlow: 36,
    nextMatchBlur: 0,
    nextMatchGlow: 54,
  },
  {
    id: "deep-ocean",
    name: "Deep Ocean",
    description: "Profundidade azul com contraste de palco esportivo.",
    shellBackgroundUrl: "/3EBDF5AB-F316-409D-9580-2361B8552B33.png",
    nextMatchBackgroundUrl: "/7E8229A2-91F0-4EE7-A227-8B9CF14A4F2B.png",
    shellOverlay: 48,
    nextMatchOverlay: 35,
    shellBlur: 0,
    shellGlow: 26,
    nextMatchBlur: 0,
    nextMatchGlow: 45,
  },
  {
    id: "auth-default",
    name: "Auth Default",
    description: "Usa o wallpaper principal padrão do produto.",
    shellBackgroundUrl: null,
    nextMatchBackgroundUrl: "/4EF8DF9F-0088-4132-8F71-282EED3B7506.png",
    shellOverlay: 40,
    nextMatchOverlay: 30,
    shellBlur: 0,
    shellGlow: 20,
    nextMatchBlur: 0,
    nextMatchGlow: 42,
  },
];

export function getBackgroundStudioPreset(presetId: BackgroundStudioPresetId): BackgroundStudioPreset {
  return BACKGROUND_STUDIO_PRESETS.find((preset) => preset.id === presetId) ?? BACKGROUND_STUDIO_PRESETS[0];
}

export function createDefaultStudioConfig(): BackgroundStudioConfig {
  const preset = BACKGROUND_STUDIO_PRESETS[0];
  return {
    preset: preset.id,
    shellBackgroundUrl: preset.shellBackgroundUrl,
    nextMatchBackgroundUrl: preset.nextMatchBackgroundUrl,
    shellOverlay: preset.shellOverlay,
    nextMatchOverlay: preset.nextMatchOverlay,
    shellBlur: preset.shellBlur,
    shellGlow: preset.shellGlow,
    nextMatchBlur: preset.nextMatchBlur,
    nextMatchGlow: preset.nextMatchGlow,
  };
}

export function normalizeBackgroundStudioConfig(candidate: Partial<BackgroundStudioConfig> | null | undefined): BackgroundStudioConfig {
  const base = createDefaultStudioConfig();
  if (!candidate) return base;
  return {
    ...base,
    ...candidate,
  };
}

function clampPercent(value: number) {
  return Math.max(0, Math.min(100, value));
}

export function buildShellBackgroundStyle(config: BackgroundStudioConfig) {
  const overlayOpacity = clampPercent(config.shellOverlay) / 100;
  const shellImage = config.shellBackgroundUrl
    ? `url('${config.shellBackgroundUrl}')`
    : AUTHVIEW_DEFAULT_BACKGROUND_CSS;

  return {
    backgroundColor: "#020617",
    backgroundImage: `linear-gradient(rgba(2, 6, 23, ${overlayOpacity}), rgba(2, 6, 23, ${overlayOpacity})), ${shellImage}`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backgroundAttachment: "fixed",
    filter: `blur(${Math.max(0, config.shellBlur)}px)`,
  };
}

export function buildBackgroundPreviewStyle(params: {
  imageUrl: string | null;
  overlay: number;
  blur: number;
  glow: number;
  fallbackGradient: string;
}) {
  const overlayOpacity = clampPercent(params.overlay) / 100;
  const imageLayer = params.imageUrl
    ? `url('${params.imageUrl}')`
    : params.fallbackGradient;

  return {
    backgroundImage: `linear-gradient(rgba(2, 6, 23, ${overlayOpacity}), rgba(2, 6, 23, ${overlayOpacity})), ${imageLayer}`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    filter: `blur(${Math.max(0, params.blur)}px)`,
    boxShadow: `0 0 ${Math.max(0, params.glow)}px rgba(34, 211, 238, 0.45)`,
  };
}
