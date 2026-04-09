export type StudioPresetId =
  | "arena-neon"
  | "luxury-blue"
  | "championship-gold"
  | "dark-tunnel"
  | "electric-court"
  | "retro-broadcast"
  | "playoffs-night"
  | "minimal-club-premium";

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
  fileUrl?: string;
}

export interface BackgroundPalette {
  useClubColors: boolean;
  primary: string;
  secondary: string;
  highlight: string;
}

export interface BackgroundStudioConfig {
  preset: StudioPresetId;
  palette: BackgroundPalette;
  glowIntensity: number;
  blurStrength: number;
  density: number;
  depth: number;
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

export interface PageBackgroundGradientOption {
  id: PageBackgroundGradientId;
  name: string;
  css: string;
  backgroundColor: string;
}

export const AUTHVIEW_DEFAULT_BACKGROUND_CSS = "url('/ChatGPT Image 9 de abr. de 2026, 13_10_17.png')";

export const PAGE_BACKGROUND_GRADIENTS: PageBackgroundGradientOption[] = [
  {
    id: "deep-night",
    name: "Deep Night",
    backgroundColor: "#020617",
    css: "radial-gradient(circle at 22% 18%, rgba(56, 189, 248, 0.2) 0%, transparent 40%), linear-gradient(145deg, #0f172a 0%, #020617 100%)",
  },
  {
    id: "arena-purple",
    name: "Arena Purple",
    backgroundColor: "#1e1b4b",
    css: "radial-gradient(circle at 14% 22%, rgba(236, 72, 153, 0.3) 0%, transparent 36%), radial-gradient(circle at 84% 78%, rgba(34, 211, 238, 0.2) 0%, transparent 34%), linear-gradient(150deg, #1e1b4b 0%, #312e81 100%)",
  },
  {
    id: "emerald-glow",
    name: "Emerald Glow",
    backgroundColor: "#052e2b",
    css: "radial-gradient(circle at 18% 20%, rgba(16, 185, 129, 0.35) 0%, transparent 40%), radial-gradient(circle at 85% 30%, rgba(34, 211, 238, 0.22) 0%, transparent 36%), linear-gradient(150deg, #052e2b 0%, #0f172a 100%)",
  },
  {
    id: "sunset-lights",
    name: "Sunset Lights",
    backgroundColor: "#1f2937",
    css: "radial-gradient(circle at 18% 22%, rgba(251, 146, 60, 0.35) 0%, transparent 36%), radial-gradient(circle at 82% 20%, rgba(236, 72, 153, 0.28) 0%, transparent 32%), linear-gradient(150deg, #111827 0%, #1d4ed8 45%, #0f766e 100%)",
  },
];

export function buildPageBackgroundStyle(config: BackgroundStudioConfig) {
  const gradient = PAGE_BACKGROUND_GRADIENTS.find((option) => option.id === config.pageBackground.gradientId) ?? PAGE_BACKGROUND_GRADIENTS[0];
  if (config.pageBackground.mode === "solid-color") {
    return {
      backgroundColor: config.pageBackground.solidColor,
      backgroundImage: "none",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      backgroundAttachment: "fixed",
    };
  }
  if (config.pageBackground.mode === "upload-image" && config.pageBackground.imageDataUrl) {
    return {
      backgroundColor: "#020617",
      backgroundImage: `linear-gradient(rgba(2,6,23,0.45), rgba(2,6,23,0.45)), url('${config.pageBackground.imageDataUrl}')`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      backgroundAttachment: "fixed",
      backgroundBlendMode: "multiply, normal",
    };
  }
  if (config.pageBackground.mode === "auth-default-image") {
    return {
      backgroundColor: "#0f172a",
      backgroundImage: AUTHVIEW_DEFAULT_BACKGROUND_CSS,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      backgroundAttachment: "fixed",
    };
  }
  return {
    backgroundColor: gradient.backgroundColor,
    backgroundImage: gradient.css,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backgroundAttachment: "fixed",
  };
}

export interface BackgroundPreset {
  id: StudioPresetId;
  name: string;
  description: string;
  primary: string;
  secondary: string;
  highlight: string;
  glowIntensity: number;
  blurStrength: number;
  density: number;
  depth: number;
  shapeLanguage: ShapeLanguage;
  pattern: PatternStyle;
  motionDirection: MotionDirection;
  contrast: number;
}

export const STUDIO_PRESETS: BackgroundPreset[] = [
  { id: "arena-neon", name: "Arena Neon", description: "Luzes vibrantes e energia de arena.", primary: "#0f172a", secondary: "#2563eb", highlight: "#22d3ee", glowIntensity: 82, blurStrength: 18, density: 75, depth: 78, shapeLanguage: "court-lines", pattern: "broadcast", motionDirection: "left-to-right", contrast: 108 },
  { id: "luxury-blue", name: "Luxury Blue", description: "Estética premium azul profunda.", primary: "#020617", secondary: "#1d4ed8", highlight: "#a78bfa", glowIntensity: 68, blurStrength: 20, density: 55, depth: 70, shapeLanguage: "mesh", pattern: "smooth", motionDirection: "center-pulse", contrast: 103 },
  { id: "championship-gold", name: "Championship Gold", description: "Aura de título e troféu.", primary: "#111827", secondary: "#b45309", highlight: "#fbbf24", glowIntensity: 75, blurStrength: 15, density: 72, depth: 80, shapeLanguage: "shards", pattern: "high-contrast", motionDirection: "top-down", contrast: 115 },
  { id: "dark-tunnel", name: "Dark Tunnel", description: "Pré-jogo sombrio com foco total.", primary: "#020617", secondary: "#0f172a", highlight: "#38bdf8", glowIntensity: 50, blurStrength: 24, density: 40, depth: 85, shapeLanguage: "none", pattern: "smooth", motionDirection: "none", contrast: 98 },
  { id: "electric-court", name: "Electric Court", description: "Linhas elétricas de quadra.", primary: "#111827", secondary: "#4f46e5", highlight: "#22d3ee", glowIntensity: 88, blurStrength: 14, density: 82, depth: 74, shapeLanguage: "court-lines", pattern: "gradient-wave", motionDirection: "right-to-left", contrast: 112 },
  { id: "retro-broadcast", name: "Retro Sports Broadcast", description: "Pacote visual broadcast retrô.", primary: "#1e1b4b", secondary: "#0e7490", highlight: "#f59e0b", glowIntensity: 65, blurStrength: 18, density: 64, depth: 62, shapeLanguage: "diamond", pattern: "broadcast", motionDirection: "left-to-right", contrast: 109 },
  { id: "playoffs-night", name: "Playoffs Night", description: "Noite de playoffs com tensão máxima.", primary: "#020617", secondary: "#7c3aed", highlight: "#22d3ee", glowIntensity: 90, blurStrength: 16, density: 70, depth: 88, shapeLanguage: "hex-grid", pattern: "high-contrast", motionDirection: "center-pulse", contrast: 118 },
  { id: "minimal-club-premium", name: "Minimal Club Premium", description: "Visual clean e sofisticado.", primary: "#0f172a", secondary: "#334155", highlight: "#38bdf8", glowIntensity: 40, blurStrength: 10, density: 25, depth: 55, shapeLanguage: "none", pattern: "smooth", motionDirection: "none", contrast: 100 },
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

export function getPresetById(presetId: StudioPresetId) {
  return STUDIO_PRESETS.find((preset) => preset.id === presetId) ?? STUDIO_PRESETS[0];
}

export function createDefaultStudioConfig(clubPrimary: string, clubSecondary: string): BackgroundStudioConfig {
  const preset = STUDIO_PRESETS[0];
  return {
    preset: preset.id,
    palette: {
      useClubColors: true,
      primary: clubPrimary,
      secondary: clubSecondary,
      highlight: preset.highlight,
    },
    glowIntensity: preset.glowIntensity,
    blurStrength: preset.blurStrength,
    density: preset.density,
    depth: preset.depth,
    shapeLanguage: preset.shapeLanguage,
    pattern: preset.pattern,
    motionDirection: preset.motionDirection,
    contrast: preset.contrast,
    soundtrack: {
      tracks: DEFAULT_TRACKS,
      activeTrackId: DEFAULT_TRACKS[0].id,
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

export function normalizeBackgroundStudioConfig(
  candidate: Partial<BackgroundStudioConfig> | null | undefined,
  clubPrimary: string,
  clubSecondary: string,
): BackgroundStudioConfig {
  const base = createDefaultStudioConfig(clubPrimary, clubSecondary);
  if (!candidate) return base;
  return {
    ...base,
    ...candidate,
    palette: {
      ...base.palette,
      ...(candidate.palette ?? {}),
    },
    soundtrack: {
      ...base.soundtrack,
      ...(candidate.soundtrack ?? {}),
      tracks: candidate.soundtrack?.tracks ?? base.soundtrack.tracks,
    },
    pageBackground: {
      ...base.pageBackground,
      ...(candidate.pageBackground ?? {}),
    },
  };
}
