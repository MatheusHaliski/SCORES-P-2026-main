export type StudioPresetId =
  | "arena-neon"
  | "luxury-blue"
  | "championship-gold"
  | "dark-tunnel"
  | "electric-court"
  | "retro-broadcast"
  | "playoffs-night"
  | "minimal-club-premium"
  | "scores-metallic-premium";
export type BackgroundStudioPresetId = "arena-night" | "champions-gold" | "deep-ocean" | "auth-default";

export type ShapeLanguage = "none" | "orb" | "diamond" | "mesh" | "shards" | "court-lines" | "hex-grid";
export type PatternStyle = "smooth" | "broadcast" | "gradient-wave" | "high-contrast";
export type MotionDirection = "none" | "left-to-right" | "right-to-left" | "top-down" | "center-pulse";
export type PageBackgroundMode = "preset-gradient" | "solid-color" | "upload-image" | "auth-default-image";
export type PageBackgroundGradientId = "deep-night" | "arena-purple" | "emerald-glow" | "sunset-lights";

export type SoundtrackCategory = "Hype" | "Arena" | "Calm Focus" | "Playoffs" | "Premium Lounge" | "Retro Sports" | "Urban Energy";

export interface SoundtrackItem {
  id: string;
  name: string;
  category: SoundtrackCategory;
  fileName?: string;
  fileDataUrl?: string;
  fileUrl?: string;
}

export interface BackgroundPalette {
  useClubColors: boolean;
  primary: string;
  secondary: string;
  highlight: string;
}

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
  skinMode: "default" | "scores-metallic-premium";
  palette: BackgroundPalette;
  glowIntensity: number;
  blurStrength: number;
  density: number;
  depth: number;
  textureIntensity: number;
  glossIntensity: number;
  borderPolishIntensity: number;
  shapeLanguage: ShapeLanguage;
  pattern: PatternStyle;
  motionDirection: MotionDirection;
  contrast: number;
  soundtrack: {
    tracks: SoundtrackItem[];
    activeTrackId: string | null;
    volume: number;
    autoPlay: boolean;
    loop: boolean;
  };
  pageBackground: {
    mode: PageBackgroundMode;
    gradientId: PageBackgroundGradientId;
    solidColor: string;
    imageDataUrl: string | null;
  };
}

export interface BackgroundStudioPreset {
  id: BackgroundStudioPresetId;
  name: string;
  description: string;
  skinMode: BackgroundStudioConfig["skinMode"];
  primary: string;
  secondary: string;
  highlight: string;
  glowIntensity: number;
  blurStrength: number;
  density: number;
  depth: number;
  textureIntensity: number;
  glossIntensity: number;
  borderPolishIntensity: number;
  shapeLanguage: ShapeLanguage;
  pattern: PatternStyle;
  motionDirection: MotionDirection;
  contrast: number;
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
export const PAGE_BACKGROUND_GRADIENTS: Array<{ id: PageBackgroundGradientId; name: string; css: string }> = [
  { id: "deep-night", name: "Deep Night", css: "linear-gradient(135deg,#020617,#0f172a,#1e293b)" },
  { id: "arena-purple", name: "Arena Purple", css: "linear-gradient(135deg,#1e1b4b,#312e81,#4f46e5)" },
  { id: "emerald-glow", name: "Emerald Glow", css: "linear-gradient(135deg,#022c22,#065f46,#10b981)" },
  { id: "sunset-lights", name: "Sunset Lights", css: "linear-gradient(135deg,#7c2d12,#c2410c,#fb7185)" },
];

export const BACKGROUND_STUDIO_PRESETS: BackgroundStudioPreset[] = [
  {
    id: "arena-night",
    name: "Arena Night",
    description: "Visual escuro de arena para shell e cartão de jogo.",
    skinMode: "default",
    primary: "#0f172a",
    secondary: "#2563eb",
    highlight: "#22d3ee",
    glowIntensity: 82,
    blurStrength: 18,
    density: 75,
    depth: 78,
    textureIntensity: 48,
    glossIntensity: 50,
    borderPolishIntensity: 52,
    shapeLanguage: "court-lines",
    pattern: "broadcast",
    motionDirection: "left-to-right",
    contrast: 108,
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
    skinMode: "default",
    primary: "#111827",
    secondary: "#b45309",
    highlight: "#fbbf24",
    glowIntensity: 75,
    blurStrength: 15,
    density: 72,
    depth: 80,
    textureIntensity: 56,
    glossIntensity: 60,
    borderPolishIntensity: 66,
    shapeLanguage: "shards",
    pattern: "high-contrast",
    motionDirection: "top-down",
    contrast: 115,
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
    skinMode: "default",
    primary: "#020617",
    secondary: "#1d4ed8",
    highlight: "#a78bfa",
    glowIntensity: 68,
    blurStrength: 20,
    density: 55,
    depth: 70,
    textureIntensity: 44,
    glossIntensity: 54,
    borderPolishIntensity: 50,
    shapeLanguage: "mesh",
    pattern: "smooth",
    motionDirection: "center-pulse",
    contrast: 103,
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
    skinMode: "default",
    primary: "#020617",
    secondary: "#0f172a",
    highlight: "#38bdf8",
    glowIntensity: 50,
    blurStrength: 24,
    density: 40,
    depth: 85,
    textureIntensity: 30,
    glossIntensity: 35,
    borderPolishIntensity: 42,
    shapeLanguage: "none",
    pattern: "smooth",
    motionDirection: "none",
    contrast: 98,
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
  const visualPreset = STUDIO_PRESETS[0];
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
    skinMode: visualPreset.skinMode,
    palette: {
      useClubColors: true,
      primary: visualPreset.primary,
      secondary: visualPreset.secondary,
      highlight: visualPreset.highlight,
    },
    glowIntensity: visualPreset.glowIntensity,
    blurStrength: visualPreset.blurStrength,
    density: visualPreset.density,
    depth: visualPreset.depth,
    textureIntensity: visualPreset.textureIntensity,
    glossIntensity: visualPreset.glossIntensity,
    borderPolishIntensity: visualPreset.borderPolishIntensity,
    shapeLanguage: visualPreset.shapeLanguage,
    pattern: visualPreset.pattern,
    motionDirection: visualPreset.motionDirection,
    contrast: visualPreset.contrast,
    soundtrack: {
      tracks: DEFAULT_TRACKS,
      activeTrackId: DEFAULT_TRACKS[0]?.id ?? null,
      volume: 55,
      autoPlay: true,
      loop: true,
    },
    pageBackground: {
      mode: "auth-default-image",
      gradientId: "deep-night",
      solidColor: "#020617",
      imageDataUrl: null,
    },
  };
}

export interface BackgroundPreset {
  id: StudioPresetId;
  name: string;
  description: string;
  skinMode: BackgroundStudioConfig["skinMode"];
  primary: string;
  secondary: string;
  highlight: string;
  glowIntensity: number;
  blurStrength: number;
  density: number;
  depth: number;
  textureIntensity: number;
  glossIntensity: number;
  borderPolishIntensity: number;
  shapeLanguage: ShapeLanguage;
  pattern: PatternStyle;
  motionDirection: MotionDirection;
  contrast: number;
}

export const STUDIO_PRESETS: BackgroundPreset[] = [
  { id: "arena-neon", name: "Arena Neon", description: "Luzes vibrantes e energia de arena.", skinMode: "default", primary: "#0f172a", secondary: "#2563eb", highlight: "#22d3ee", glowIntensity: 82, blurStrength: 18, density: 75, depth: 78, textureIntensity: 48, glossIntensity: 50, borderPolishIntensity: 52, shapeLanguage: "court-lines", pattern: "broadcast", motionDirection: "left-to-right", contrast: 108 },
  { id: "luxury-blue", name: "Luxury Blue", description: "Estética premium azul profunda.", skinMode: "default", primary: "#020617", secondary: "#1d4ed8", highlight: "#a78bfa", glowIntensity: 68, blurStrength: 20, density: 55, depth: 70, textureIntensity: 44, glossIntensity: 54, borderPolishIntensity: 50, shapeLanguage: "mesh", pattern: "smooth", motionDirection: "center-pulse", contrast: 103 },
  { id: "championship-gold", name: "Championship Gold", description: "Aura de título e troféu.", skinMode: "default", primary: "#111827", secondary: "#b45309", highlight: "#fbbf24", glowIntensity: 75, blurStrength: 15, density: 72, depth: 80, textureIntensity: 56, glossIntensity: 60, borderPolishIntensity: 66, shapeLanguage: "shards", pattern: "high-contrast", motionDirection: "top-down", contrast: 115 },
  { id: "dark-tunnel", name: "Dark Tunnel", description: "Pré-jogo sombrio com foco total.", skinMode: "default", primary: "#020617", secondary: "#0f172a", highlight: "#38bdf8", glowIntensity: 50, blurStrength: 24, density: 40, depth: 85, textureIntensity: 30, glossIntensity: 35, borderPolishIntensity: 42, shapeLanguage: "none", pattern: "smooth", motionDirection: "none", contrast: 98 },
  { id: "electric-court", name: "Electric Court", description: "Linhas elétricas de quadra.", skinMode: "default", primary: "#111827", secondary: "#4f46e5", highlight: "#22d3ee", glowIntensity: 88, blurStrength: 14, density: 82, depth: 74, textureIntensity: 58, glossIntensity: 64, borderPolishIntensity: 57, shapeLanguage: "court-lines", pattern: "gradient-wave", motionDirection: "right-to-left", contrast: 112 },
  { id: "retro-broadcast", name: "Retro Sports Broadcast", description: "Pacote visual broadcast retrô.", skinMode: "default", primary: "#1e1b4b", secondary: "#0e7490", highlight: "#f59e0b", glowIntensity: 65, blurStrength: 18, density: 64, depth: 62, textureIntensity: 52, glossIntensity: 43, borderPolishIntensity: 49, shapeLanguage: "diamond", pattern: "broadcast", motionDirection: "left-to-right", contrast: 109 },
  { id: "playoffs-night", name: "Playoffs Night", description: "Noite de playoffs com tensão máxima.", skinMode: "default", primary: "#020617", secondary: "#7c3aed", highlight: "#22d3ee", glowIntensity: 90, blurStrength: 16, density: 70, depth: 88, textureIntensity: 53, glossIntensity: 61, borderPolishIntensity: 58, shapeLanguage: "hex-grid", pattern: "high-contrast", motionDirection: "center-pulse", contrast: 118 },
  { id: "minimal-club-premium", name: "Minimal Club Premium", description: "Visual clean e sofisticado.", skinMode: "default", primary: "#0f172a", secondary: "#334155", highlight: "#38bdf8", glowIntensity: 40, blurStrength: 10, density: 25, depth: 55, textureIntensity: 20, glossIntensity: 28, borderPolishIntensity: 32, shapeLanguage: "none", pattern: "smooth", motionDirection: "none", contrast: 100 },
  { id: "scores-metallic-premium", name: "SCORES Metallic Premium", description: "Luxo esportivo com metal escovado dourado e esmalte verde.", skinMode: "scores-metallic-premium", primary: "#123930", secondary: "#8a6425", highlight: "#e8d086", glowIntensity: 62, blurStrength: 9, density: 58, depth: 86, textureIntensity: 84, glossIntensity: 74, borderPolishIntensity: 88, shapeLanguage: "mesh", pattern: "smooth", motionDirection: "center-pulse", contrast: 112 },
];

const DEFAULT_TRACKS: SoundtrackItem[] = [
  { id: "trk-hype", name: "Hype Entrance", category: "Hype" },
  { id: "trk-arena", name: "Arena Lights", category: "Arena" },
  { id: "trk-playoffs", name: "Playoffs Pressure", category: "Playoffs" },
];

export function buildBackgroundImage(config: BackgroundStudioConfig) {
  const { primary, secondary, highlight } = config.palette;
  const glow = config.glowIntensity / 100;
  const density = config.density / 100;
  const overlayOpacity = Math.max(0.12, Math.min(0.78, glow * 0.65));
  return `radial-gradient(circle at 16% 18%, ${highlight}${Math.round(overlayOpacity * 255).toString(16).padStart(2, "0")} 0%, transparent ${28 + density * 22}%), radial-gradient(circle at 82% 78%, ${secondary}${Math.round((overlayOpacity + 0.1) * 255).toString(16).padStart(2, "0")} 0%, transparent ${34 + density * 20}%), linear-gradient(135deg, ${primary}cc, #020617f2)`;
}

export function buildShellBackgroundStyle(config: BackgroundStudioConfig) {
  const overlayOpacity = clampPercent(config.shellOverlay) / 100;
  const solidColor = config.pageBackground.solidColor || "#020617";
  let shellImage: string | null = null;

  if (config.pageBackground.mode === "upload-image" && config.pageBackground.imageDataUrl) {
    shellImage = `url('${config.pageBackground.imageDataUrl}')`;
  } else if (config.pageBackground.mode === "preset-gradient") {
    const gradient = PAGE_BACKGROUND_GRADIENTS.find((item) => item.id === config.pageBackground.gradientId);
    shellImage = gradient?.css ?? PAGE_BACKGROUND_GRADIENTS[0].css;
  } else if (config.pageBackground.mode === "auth-default-image") {
    shellImage = AUTHVIEW_DEFAULT_BACKGROUND_CSS;
  } else if (config.shellBackgroundUrl) {
    shellImage = `url('${config.shellBackgroundUrl}')`;
  } else {
    shellImage = AUTHVIEW_DEFAULT_BACKGROUND_CSS;
  }

  return {
    backgroundColor: config.pageBackground.mode === "solid-color" ? solidColor : "#020617",
    backgroundImage: shellImage
      ? `linear-gradient(rgba(2, 6, 23, ${overlayOpacity}), rgba(2, 6, 23, ${overlayOpacity})), ${shellImage}`
      : `linear-gradient(rgba(2, 6, 23, ${overlayOpacity}), rgba(2, 6, 23, ${overlayOpacity}))`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backgroundAttachment: "fixed",
    backgroundBlendMode: "normal",
  };
}

const SHAPES: ShapeLanguage[] = ["none", "orb", "diamond", "mesh", "shards", "court-lines", "hex-grid"];
const PATTERNS: PatternStyle[] = ["smooth", "broadcast", "gradient-wave", "high-contrast"];
const MOTIONS: MotionDirection[] = ["none", "left-to-right", "right-to-left", "top-down", "center-pulse"];
const PAGE_MODES: PageBackgroundMode[] = ["preset-gradient", "solid-color", "upload-image", "auth-default-image"];
const PAGE_GRADIENTS: PageBackgroundGradientId[] = ["deep-night", "arena-purple", "emerald-glow", "sunset-lights"];

function clampPercent(value: number, min = 0, max = 100) {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, Math.round(value)));
}

export function normalizeBackgroundStudioConfig(
  input?: Partial<BackgroundStudioConfig> | null,
): BackgroundStudioConfig {
  const fallback = createDefaultStudioConfig();
  const preset = input?.preset ? getBackgroundStudioPreset(input.preset) : getBackgroundStudioPreset(fallback.preset);

  return {
    preset: input?.preset ?? fallback.preset,
    shellBackgroundUrl: input?.shellBackgroundUrl ?? preset.shellBackgroundUrl ?? fallback.shellBackgroundUrl,
    nextMatchBackgroundUrl: input?.nextMatchBackgroundUrl ?? preset.nextMatchBackgroundUrl ?? fallback.nextMatchBackgroundUrl,
    shellOverlay: clampPercent(input?.shellOverlay ?? preset.shellOverlay ?? fallback.shellOverlay, 0, 90),
    nextMatchOverlay: clampPercent(input?.nextMatchOverlay ?? preset.nextMatchOverlay ?? fallback.nextMatchOverlay, 0, 90),
    shellBlur: clampPercent(input?.shellBlur ?? preset.shellBlur ?? fallback.shellBlur, 0, 20),
    shellGlow: clampPercent(input?.shellGlow ?? preset.shellGlow ?? fallback.shellGlow, 0, 120),
    nextMatchBlur: clampPercent(input?.nextMatchBlur ?? preset.nextMatchBlur ?? fallback.nextMatchBlur, 0, 20),
    nextMatchGlow: clampPercent(input?.nextMatchGlow ?? preset.nextMatchGlow ?? fallback.nextMatchGlow, 0, 120),
    skinMode: input?.skinMode === "scores-metallic-premium" ? "scores-metallic-premium" : "default",
    palette: {
      useClubColors: input?.palette?.useClubColors ?? fallback.palette.useClubColors,
      primary: input?.palette?.primary ?? fallback.palette.primary,
      secondary: input?.palette?.secondary ?? fallback.palette.secondary,
      highlight: input?.palette?.highlight ?? fallback.palette.highlight,
    },
    glowIntensity: clampPercent(input?.glowIntensity ?? fallback.glowIntensity),
    blurStrength: clampPercent(input?.blurStrength ?? fallback.blurStrength, 0, 40),
    density: clampPercent(input?.density ?? fallback.density),
    depth: clampPercent(input?.depth ?? fallback.depth),
    textureIntensity: clampPercent(input?.textureIntensity ?? fallback.textureIntensity),
    glossIntensity: clampPercent(input?.glossIntensity ?? fallback.glossIntensity),
    borderPolishIntensity: clampPercent(input?.borderPolishIntensity ?? fallback.borderPolishIntensity),
    shapeLanguage: SHAPES.includes(input?.shapeLanguage as ShapeLanguage) ? (input?.shapeLanguage as ShapeLanguage) : fallback.shapeLanguage,
    pattern: PATTERNS.includes(input?.pattern as PatternStyle) ? (input?.pattern as PatternStyle) : fallback.pattern,
    motionDirection: MOTIONS.includes(input?.motionDirection as MotionDirection) ? (input?.motionDirection as MotionDirection) : fallback.motionDirection,
    contrast: clampPercent(input?.contrast ?? fallback.contrast, 80, 130),
    soundtrack: {
      tracks: (input?.soundtrack?.tracks ?? fallback.soundtrack.tracks).map((track) => ({
        ...track,
        fileUrl: track.fileUrl?.startsWith("blob:") ? undefined : track.fileUrl,
      })),
      activeTrackId: input?.soundtrack?.activeTrackId ?? fallback.soundtrack.activeTrackId,
      volume: clampPercent(input?.soundtrack?.volume ?? fallback.soundtrack.volume),
      autoPlay: input?.soundtrack?.autoPlay ?? fallback.soundtrack.autoPlay,
      loop: input?.soundtrack?.loop ?? fallback.soundtrack.loop,
    },
    pageBackground: {
      mode: PAGE_MODES.includes(input?.pageBackground?.mode as PageBackgroundMode)
        ? (input?.pageBackground?.mode as PageBackgroundMode)
        : fallback.pageBackground.mode,
      gradientId: PAGE_GRADIENTS.includes(input?.pageBackground?.gradientId as PageBackgroundGradientId)
        ? (input?.pageBackground?.gradientId as PageBackgroundGradientId)
        : fallback.pageBackground.gradientId,
      solidColor: input?.pageBackground?.solidColor ?? fallback.pageBackground.solidColor,
      imageDataUrl: input?.pageBackground?.imageDataUrl ?? fallback.pageBackground.imageDataUrl,
    },
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
