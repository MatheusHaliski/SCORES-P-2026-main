export type StudioVisualPreset = "club-identity" | "reverse-club-identity" | "authview-default";
export type BackgroundStudioPresetId = StudioVisualPreset;

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

export interface UIPalette {
  useClubColors: boolean;
  primary: string;
  secondary: string;
  highlight: string;
}

export interface BackgroundStudioConfig {
  pageBackground: {
    mode: PageBackgroundMode;
    gradientId: PageBackgroundGradientId;
    solidColor: string;
    imageDataUrl: string | null;
    overlayOpacity: number;
    blur: number;
  };
  matchVisual: {
    presetId: BackgroundStudioPresetId;
    shellBackgroundUrl: string | null;
    nextMatchBackgroundUrl: string | null;
    shellOverlay: number;
    nextMatchOverlay: number;
    shellBlur: number;
    shellGlow: number;
    nextMatchBlur: number;
    nextMatchGlow: number;
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
    skinMode: "default" | "scores-metallic-premium";
  };
  uiPalette: UIPalette;
  soundtrack: {
    tracks: SoundtrackItem[];
    activeTrackId: string | null;
    volume: number;
    autoPlay: boolean;
    loop: boolean;
  };
}

export type BackgroundStudioChangeDetail = {
  saveId: string;
  config: BackgroundStudioConfig;
};

export interface BackgroundStudioPreset {
  id: BackgroundStudioPresetId;
  name: string;
  description: string;
  skinMode: BackgroundStudioConfig["matchVisual"]["skinMode"];
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

type ClubColorsInput = {
  primary: string;
  secondary: string;
  accent?: string;
};

export const AUTHVIEW_DEFAULT_BACKGROUND_CSS = "url('/ChatGPT Image 9 de abr. de 2026, 13_10_17.png')";
export const PAGE_BACKGROUND_GRADIENTS: Array<{ id: PageBackgroundGradientId; name: string; css: string }> = [
  { id: "deep-night", name: "Deep Night", css: "linear-gradient(135deg,#020617,#0f172a,#1e293b)" },
  { id: "arena-purple", name: "Arena Purple", css: "linear-gradient(135deg,#1e1b4b,#312e81,#4f46e5)" },
  { id: "emerald-glow", name: "Emerald Glow", css: "linear-gradient(135deg,#022c22,#065f46,#10b981)" },
  { id: "sunset-lights", name: "Sunset Lights", css: "linear-gradient(135deg,#7c2d12,#c2410c,#fb7185)" },
];

export const BACKGROUND_STUDIO_PRESETS: BackgroundStudioPreset[] = [
  {
    id: "club-identity",
    name: "Club Identity",
    description: "Uses official club colors as the main MatchView and Next Match theme.",
    skinMode: "default",
    primary: "#2563eb",
    secondary: "#1e293b",
    highlight: "#60a5fa",
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
    shellBackgroundUrl: null,
    nextMatchBackgroundUrl: null,
    shellOverlay: 42,
    nextMatchOverlay: 32,
    shellBlur: 0,
    shellGlow: 30,
    nextMatchBlur: 0,
    nextMatchGlow: 48,
  },
  {
    id: "reverse-club-identity",
    name: "Reverse Club Identity",
    description: "Uses club colors with inverted dominance, making the secondary color the main theme.",
    skinMode: "default",
    primary: "#1e293b",
    secondary: "#2563eb",
    highlight: "#93c5fd",
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
    shellBackgroundUrl: null,
    nextMatchBackgroundUrl: null,
    shellOverlay: 36,
    nextMatchOverlay: 28,
    shellBlur: 0,
    shellGlow: 36,
    nextMatchBlur: 0,
    nextMatchGlow: 54,
  },
  {
    id: "authview-default",
    name: "AuthView Default",
    description: "Restores the official default SCORES premium product theme.",
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
    nextMatchBackgroundUrl: null,
    shellOverlay: 40,
    nextMatchOverlay: 30,
    shellBlur: 0,
    shellGlow: 20,
    nextMatchBlur: 0,
    nextMatchGlow: 42,
  },
];

function blendHexColors(primary: string, secondary: string) {
  const normalize = (value: string) => {
    const hex = value.replace("#", "");
    if (hex.length === 3) {
      return hex.split("").map((char) => `${char}${char}`).join("");
    }
    return hex.padEnd(6, "0").slice(0, 6);
  };
  const a = normalize(primary);
  const b = normalize(secondary);
  const mix = [0, 2, 4].map((index) => {
    const left = Number.parseInt(a.slice(index, index + 2), 16);
    const right = Number.parseInt(b.slice(index, index + 2), 16);
    return Math.round((left + right) / 2).toString(16).padStart(2, "0");
  }).join("");
  return `#${mix}`;
}

export function resolveStudioPresetTheme(
  preset: StudioVisualPreset,
  clubColors: ClubColorsInput,
): Partial<BackgroundStudioConfig> {
  const authPreset = getBackgroundStudioPreset("authview-default");
  if (preset === "authview-default") {
    return {
      matchVisual: {
        presetId: "authview-default",
        skinMode: authPreset.skinMode,
        shellBackgroundUrl: null,
        nextMatchBackgroundUrl: null,
        shellOverlay: authPreset.shellOverlay,
        nextMatchOverlay: authPreset.nextMatchOverlay,
        shellBlur: authPreset.shellBlur,
        shellGlow: authPreset.shellGlow,
        nextMatchBlur: authPreset.nextMatchBlur,
        nextMatchGlow: authPreset.nextMatchGlow,
        glowIntensity: authPreset.glowIntensity,
        blurStrength: authPreset.blurStrength,
        density: authPreset.density,
        depth: authPreset.depth,
        textureIntensity: authPreset.textureIntensity,
        glossIntensity: authPreset.glossIntensity,
        borderPolishIntensity: authPreset.borderPolishIntensity,
        shapeLanguage: authPreset.shapeLanguage,
        pattern: authPreset.pattern,
        motionDirection: authPreset.motionDirection,
        contrast: authPreset.contrast,
      },
      uiPalette: {
        useClubColors: false,
        primary: authPreset.primary,
        secondary: authPreset.secondary,
        highlight: authPreset.highlight,
      },
    };
  }

  const isReverse = preset === "reverse-club-identity";
  const primary = isReverse ? clubColors.secondary : clubColors.primary;
  const secondary = isReverse ? clubColors.primary : clubColors.secondary;
  return {
    matchVisual: {
      presetId: preset,
      skinMode: "default",
      shellBackgroundUrl: null,
      nextMatchBackgroundUrl: null,
      shellOverlay: 36,
      nextMatchOverlay: 28,
      shellBlur: 0,
      shellGlow: 34,
      nextMatchBlur: 0,
      nextMatchGlow: 48,
      glowIntensity: 76,
      blurStrength: 16,
      density: 66,
      depth: 74,
      textureIntensity: 42,
      glossIntensity: 48,
      borderPolishIntensity: 50,
      shapeLanguage: isReverse ? "shards" : "court-lines",
      pattern: isReverse ? "high-contrast" : "broadcast",
      motionDirection: isReverse ? "top-down" : "left-to-right",
      contrast: isReverse ? 112 : 108,
    },
    uiPalette: {
      useClubColors: true,
      primary,
      secondary,
      highlight: clubColors.accent ?? blendHexColors(primary, secondary),
    },
  };
}

export function getBackgroundStudioPreset(presetId: BackgroundStudioPresetId): BackgroundStudioPreset {
  return BACKGROUND_STUDIO_PRESETS.find((preset) => preset.id === presetId) ?? BACKGROUND_STUDIO_PRESETS[0];
}

const DEFAULT_TRACKS: SoundtrackItem[] = [
  { id: "trk-hype", name: "Hype Entrance", category: "Hype" },
  { id: "trk-arena", name: "Arena Lights", category: "Arena" },
  { id: "trk-playoffs", name: "Playoffs Pressure", category: "Playoffs" },
];

export function createDefaultStudioConfig(): BackgroundStudioConfig {
  const preset = getBackgroundStudioPreset("club-identity");
  return {
    pageBackground: {
      mode: "auth-default-image",
      gradientId: "deep-night",
      solidColor: "#020617",
      imageDataUrl: null,
      overlayOpacity: 44,
      blur: 0,
    },
    matchVisual: {
      presetId: preset.id,
      shellBackgroundUrl: null,
      nextMatchBackgroundUrl: null,
      shellOverlay: preset.shellOverlay,
      nextMatchOverlay: preset.nextMatchOverlay,
      shellBlur: preset.shellBlur,
      shellGlow: preset.shellGlow,
      nextMatchBlur: preset.nextMatchBlur,
      nextMatchGlow: preset.nextMatchGlow,
      skinMode: preset.skinMode,
      glowIntensity: preset.glowIntensity,
      blurStrength: preset.blurStrength,
      density: preset.density,
      depth: preset.depth,
      textureIntensity: preset.textureIntensity,
      glossIntensity: preset.glossIntensity,
      borderPolishIntensity: preset.borderPolishIntensity,
      shapeLanguage: preset.shapeLanguage,
      pattern: preset.pattern,
      motionDirection: preset.motionDirection,
      contrast: preset.contrast,
    },
    uiPalette: {
      useClubColors: true,
      primary: preset.primary,
      secondary: preset.secondary,
      highlight: preset.highlight,
    },
    soundtrack: {
      tracks: DEFAULT_TRACKS,
      activeTrackId: DEFAULT_TRACKS[0]?.id ?? null,
      volume: 55,
      autoPlay: true,
      loop: true,
    },
  };
}

export function buildBackgroundImage(config: BackgroundStudioConfig) {
  const { primary, secondary, highlight } = config.uiPalette;
  const glow = config.matchVisual.glowIntensity / 100;
  const density = config.matchVisual.density / 100;
  const overlayOpacity = Math.max(0.12, Math.min(0.78, glow * 0.65));
  return `radial-gradient(circle at 16% 18%, ${highlight}${Math.round(overlayOpacity * 255).toString(16).padStart(2, "0")} 0%, transparent ${28 + density * 22}%), radial-gradient(circle at 82% 78%, ${secondary}${Math.round((overlayOpacity + 0.1) * 255).toString(16).padStart(2, "0")} 0%, transparent ${34 + density * 20}%), linear-gradient(135deg, ${primary}cc, #020617f2)`;
}

function resolvePageBackgroundLayer(config: BackgroundStudioConfig) {
  if (config.pageBackground.mode === "upload-image" && config.pageBackground.imageDataUrl) {
    return `url('${config.pageBackground.imageDataUrl}')`;
  }
  if (config.pageBackground.mode === "preset-gradient") {
    const gradients: Record<PageBackgroundGradientId, string> = {
      "deep-night": "linear-gradient(135deg,#020617,#0f172a,#1e293b)",
      "arena-purple": "linear-gradient(135deg,#1e1b4b,#312e81,#4f46e5)",
      "emerald-glow": "linear-gradient(135deg,#022c22,#065f46,#10b981)",
      "sunset-lights": "linear-gradient(135deg,#7c2d12,#c2410c,#fb7185)",
    };
    return gradients[config.pageBackground.gradientId] ?? gradients["deep-night"];
  }
  if (config.pageBackground.mode === "solid-color") return config.pageBackground.solidColor;
  if (config.pageBackground.mode === "auth-default-image") return AUTHVIEW_DEFAULT_BACKGROUND_CSS;
  return "linear-gradient(135deg,#020617,#0f172a,#111827)";
}

export function buildShellBackgroundStyle(config: BackgroundStudioConfig) {
  const pageOverlayOpacity = clampPercent(config.pageBackground.overlayOpacity) / 100;
  const shellOverlayOpacity = clampPercent(config.matchVisual.shellOverlay) / 100;
  const pageLayer = resolvePageBackgroundLayer(config);
  const shellLayer = config.matchVisual.shellBackgroundUrl
    ? `url('${config.matchVisual.shellBackgroundUrl}')`
    : "linear-gradient(145deg, rgba(2,6,23,0.42), rgba(2,6,23,0.2))";
  const fallbackLayer = buildBackgroundImage(config);
  return {
    backgroundColor: config.uiPalette.primary,
    backgroundImage: `linear-gradient(rgba(2, 6, 23, ${pageOverlayOpacity}), rgba(2, 6, 23, ${pageOverlayOpacity})), linear-gradient(rgba(2, 6, 23, ${shellOverlayOpacity}), rgba(2, 6, 23, ${shellOverlayOpacity})), ${pageLayer}, ${shellLayer}, ${fallbackLayer}`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backgroundAttachment: "fixed",
    backgroundBlendMode: "normal",
    boxShadow: `inset 0 0 ${Math.max(0, config.matchVisual.shellGlow)}px ${config.uiPalette.highlight}33`,
  };
}

export function buildMatchVisualOverlay(config: BackgroundStudioConfig) {
  const { shapeLanguage, pattern, motionDirection, density, depth, blurStrength, contrast } = config.matchVisual;
  const highlight = config.uiPalette.highlight;
  const secondary = config.uiPalette.secondary;

  const densityScale = Math.max(0.15, density / 100);
  const depthAlpha = Math.max(0.08, depth / 300);

  const shapeLayerMap: Record<ShapeLanguage, string> = {
    none: "none",
    orb: `radial-gradient(circle at 18% 22%, ${highlight}22 0%, transparent ${24 + densityScale * 18}%)`,
    diamond: `repeating-linear-gradient(45deg, ${highlight}14 0 10px, transparent 10px 26px)`,
    mesh: `repeating-linear-gradient(0deg, ${highlight}10 0 1px, transparent 1px 18px), repeating-linear-gradient(90deg, ${secondary}10 0 1px, transparent 1px 18px)`,
    shards: `linear-gradient(120deg, transparent 0 35%, ${highlight}18 45%, transparent 55%), linear-gradient(300deg, transparent 0 42%, ${secondary}16 52%, transparent 62%)`,
    "court-lines": `repeating-linear-gradient(90deg, transparent 0 54px, ${highlight}20 54px 56px), radial-gradient(circle at 50% 50%, transparent 0 80px, ${highlight}1a 80px 82px, transparent 82px)`,
    "hex-grid": `repeating-linear-gradient(60deg, ${highlight}10 0 2px, transparent 2px 24px), repeating-linear-gradient(-60deg, ${highlight}10 0 2px, transparent 2px 24px), repeating-linear-gradient(0deg, ${secondary}0e 0 2px, transparent 2px 24px)`,
  };

  const patternLayerMap: Record<PatternStyle, string> = {
    smooth: `linear-gradient(135deg, rgba(255,255,255,${depthAlpha * 0.45}), transparent 42%, transparent 100%)`,
    broadcast: `repeating-linear-gradient(-45deg, rgba(255,255,255,${depthAlpha * 0.45}) 0 2px, transparent 2px 16px)`,
    "gradient-wave": `radial-gradient(circle at 0% 50%, ${secondary}18, transparent 35%), radial-gradient(circle at 100% 50%, ${highlight}18, transparent 35%)`,
    "high-contrast": `linear-gradient(135deg, rgba(255,255,255,${depthAlpha * 0.75}), transparent 28%, rgba(0,0,0,${depthAlpha * 0.55}) 72%, transparent 100%)`,
  };

  const motionMap: Record<MotionDirection, string> = {
    none: "center",
    "left-to-right": "0% 50%",
    "right-to-left": "100% 50%",
    "top-down": "50% 0%",
    "center-pulse": "50% 50%",
  };

  const visualLayers = [shapeLayerMap[shapeLanguage], patternLayerMap[pattern]].filter((layer) => layer && layer !== "none").join(", ");
  return {
    backgroundImage: visualLayers || "none",
    backgroundPosition: `${motionMap[motionDirection]}, center`,
    backgroundSize: `${Math.max(140, 260 - density)}px ${Math.max(140, 260 - density)}px, cover`,
    opacity: Math.min(0.5, 0.16 + depth / 260),
    filter: `blur(${Math.max(0, blurStrength / 5)}px) contrast(${contrast}%)`,
    pointerEvents: "none" as const,
    mixBlendMode: "screen" as const,
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

export function normalizeBackgroundStudioConfig(input?: Partial<BackgroundStudioConfig> | null): BackgroundStudioConfig {
  const fallback = createDefaultStudioConfig();

  // backward compatibility with previous flat schema
  const legacy = input as Record<string, unknown> | undefined;
  const presetAliases: Record<string, BackgroundStudioPresetId> = {
    "arena-night": "club-identity",
    "deep-ocean": "club-identity",
    "champions-gold": "reverse-club-identity",
    "auth-default": "authview-default",
  };
  const incomingPresetRaw = (legacy?.preset as string | undefined) ?? (input?.matchVisual?.presetId as string | undefined);
  const resolvedPresetId = (incomingPresetRaw && presetAliases[incomingPresetRaw]) || (incomingPresetRaw as BackgroundStudioPresetId | undefined);
  const preset = getBackgroundStudioPreset(resolvedPresetId ?? fallback.matchVisual.presetId);

  return {
    pageBackground: {
      mode: PAGE_MODES.includes(input?.pageBackground?.mode as PageBackgroundMode)
        ? (input?.pageBackground?.mode as PageBackgroundMode)
        : fallback.pageBackground.mode,
      gradientId: PAGE_GRADIENTS.includes(input?.pageBackground?.gradientId as PageBackgroundGradientId)
        ? (input?.pageBackground?.gradientId as PageBackgroundGradientId)
        : fallback.pageBackground.gradientId,
      solidColor: input?.pageBackground?.solidColor ?? fallback.pageBackground.solidColor,
      imageDataUrl: input?.pageBackground?.imageDataUrl ?? fallback.pageBackground.imageDataUrl,
      overlayOpacity: clampPercent((input?.pageBackground?.overlayOpacity as number | undefined) ?? (legacy?.shellOverlay as number | undefined) ?? fallback.pageBackground.overlayOpacity, 0, 90),
      blur: clampPercent((input?.pageBackground?.blur as number | undefined) ?? 0, 0, 20),
    },
    matchVisual: {
      presetId: preset.id,
      shellBackgroundUrl: input?.matchVisual?.shellBackgroundUrl ?? (legacy?.shellBackgroundUrl as string | null | undefined) ?? fallback.matchVisual.shellBackgroundUrl,
      nextMatchBackgroundUrl: input?.matchVisual?.nextMatchBackgroundUrl ?? (legacy?.nextMatchBackgroundUrl as string | null | undefined) ?? fallback.matchVisual.nextMatchBackgroundUrl,
      shellOverlay: clampPercent(input?.matchVisual?.shellOverlay ?? (legacy?.shellOverlay as number | undefined) ?? preset.shellOverlay, 0, 90),
      nextMatchOverlay: clampPercent(input?.matchVisual?.nextMatchOverlay ?? (legacy?.nextMatchOverlay as number | undefined) ?? preset.nextMatchOverlay, 0, 90),
      shellBlur: clampPercent(input?.matchVisual?.shellBlur ?? (legacy?.shellBlur as number | undefined) ?? preset.shellBlur, 0, 20),
      shellGlow: clampPercent(input?.matchVisual?.shellGlow ?? (legacy?.shellGlow as number | undefined) ?? preset.shellGlow, 0, 120),
      nextMatchBlur: clampPercent(input?.matchVisual?.nextMatchBlur ?? (legacy?.nextMatchBlur as number | undefined) ?? preset.nextMatchBlur, 0, 20),
      nextMatchGlow: clampPercent(input?.matchVisual?.nextMatchGlow ?? (legacy?.nextMatchGlow as number | undefined) ?? preset.nextMatchGlow, 0, 120),
      skinMode: (input?.matchVisual?.skinMode as BackgroundStudioConfig["matchVisual"]["skinMode"] | undefined) ?? ((legacy?.skinMode as BackgroundStudioConfig["matchVisual"]["skinMode"] | undefined) === "scores-metallic-premium" ? "scores-metallic-premium" : preset.skinMode),
      glowIntensity: clampPercent(input?.matchVisual?.glowIntensity ?? (legacy?.glowIntensity as number | undefined) ?? preset.glowIntensity),
      blurStrength: clampPercent(input?.matchVisual?.blurStrength ?? (legacy?.blurStrength as number | undefined) ?? preset.blurStrength, 0, 40),
      density: clampPercent(input?.matchVisual?.density ?? (legacy?.density as number | undefined) ?? preset.density),
      depth: clampPercent(input?.matchVisual?.depth ?? (legacy?.depth as number | undefined) ?? preset.depth),
      textureIntensity: clampPercent(input?.matchVisual?.textureIntensity ?? (legacy?.textureIntensity as number | undefined) ?? preset.textureIntensity),
      glossIntensity: clampPercent(input?.matchVisual?.glossIntensity ?? (legacy?.glossIntensity as number | undefined) ?? preset.glossIntensity),
      borderPolishIntensity: clampPercent(input?.matchVisual?.borderPolishIntensity ?? (legacy?.borderPolishIntensity as number | undefined) ?? preset.borderPolishIntensity),
      shapeLanguage: SHAPES.includes((input?.matchVisual?.shapeLanguage ?? legacy?.shapeLanguage) as ShapeLanguage)
        ? ((input?.matchVisual?.shapeLanguage ?? legacy?.shapeLanguage) as ShapeLanguage)
        : preset.shapeLanguage,
      pattern: PATTERNS.includes((input?.matchVisual?.pattern ?? legacy?.pattern) as PatternStyle)
        ? ((input?.matchVisual?.pattern ?? legacy?.pattern) as PatternStyle)
        : preset.pattern,
      motionDirection: MOTIONS.includes((input?.matchVisual?.motionDirection ?? legacy?.motionDirection) as MotionDirection)
        ? ((input?.matchVisual?.motionDirection ?? legacy?.motionDirection) as MotionDirection)
        : preset.motionDirection,
      contrast: clampPercent(input?.matchVisual?.contrast ?? (legacy?.contrast as number | undefined) ?? preset.contrast, 80, 130),
    },
    uiPalette: {
      useClubColors: input?.uiPalette?.useClubColors ?? (legacy?.palette && typeof legacy.palette === "object" && "useClubColors" in (legacy.palette as object)
        ? Boolean((legacy.palette as Record<string, unknown>).useClubColors)
        : fallback.uiPalette.useClubColors),
      primary: input?.uiPalette?.primary ?? ((legacy?.palette as Record<string, string> | undefined)?.primary ?? preset.primary),
      secondary: input?.uiPalette?.secondary ?? ((legacy?.palette as Record<string, string> | undefined)?.secondary ?? preset.secondary),
      highlight: input?.uiPalette?.highlight ?? ((legacy?.palette as Record<string, string> | undefined)?.highlight ?? preset.highlight),
    },
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
  const imageLayer = params.imageUrl ? `url('${params.imageUrl}')` : params.fallbackGradient;

  return {
    backgroundImage: `linear-gradient(rgba(2, 6, 23, ${overlayOpacity}), rgba(2, 6, 23, ${overlayOpacity})), ${imageLayer}`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    filter: `blur(${Math.max(0, params.blur)}px)`,
    boxShadow: `0 0 ${Math.max(0, params.glow)}px rgba(34, 211, 238, 0.45)`,
  };
}
