export interface ClubIdentityTheme {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  textColor: string;
  borderColor: string;
  glowColor: string;
  modalSurfaceStyle: "glass" | "solid";
  cardSurfaceStyle: "gradient" | "solid";
  buttonStyle: "pill" | "sharp";
  dividerStyle: "glow" | "line";
  themePreset: "club-default" | "neon" | "classic";
}

export function createDefaultClubIdentityTheme(primaryColor: string, secondaryColor: string): ClubIdentityTheme {
  return {
    primaryColor,
    secondaryColor,
    accentColor: secondaryColor,
    textColor: "#e2e8f0",
    borderColor: "rgba(148, 163, 184, 0.35)",
    glowColor: secondaryColor,
    modalSurfaceStyle: "glass",
    cardSurfaceStyle: "gradient",
    buttonStyle: "pill",
    dividerStyle: "glow",
    themePreset: "club-default",
  };
}

export function normalizeClubIdentityTheme(candidate: Partial<ClubIdentityTheme> | null | undefined, primaryColor: string, secondaryColor: string): ClubIdentityTheme {
  const base = createDefaultClubIdentityTheme(primaryColor, secondaryColor);
  if (!candidate) return base;
  return { ...base, ...candidate };
}
