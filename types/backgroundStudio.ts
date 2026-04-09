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
  };
}
