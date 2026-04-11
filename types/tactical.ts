export type UniformSlot = "home" | "away" | "alternate";

export type ClubUniformAssets = {
  home_uniform_2d_url: string;
  away_uniform_2d_url: string;
  alternate_uniform_2d_url?: string;
  active_uniform_slot: UniformSlot;
};

export type FormationId =
  | "balanced"
  | "pace_space"
  | "five_out"
  | "pick_roll_heavy"
  | "post_centric"
  | "motion_offense"
  | "isolation_heavy"
  | "perimeter_creation";

export type DefensiveScheme =
  | "man_to_man"
  | "zone_2_3"
  | "zone_3_2"
  | "zone_1_3_1"
  | "full_court_press"
  | "half_court_pressure"
  | "drop_coverage"
  | "switch_everything";

export type TacticalStyle = FormationId;

export type TacticalPreset = {
  formation: FormationId;
  style: TacticalStyle;
  defensiveScheme: DefensiveScheme;
  tempo: "controlled" | "balanced" | "high";
  shotSelection: "rim_and_kickout" | "balanced" | "shot_hunting";
  threePointFrequency: "low" | "balanced" | "high";
  paintAttackFrequency: "low" | "balanced" | "high";
  defensivePressure: "low" | "balanced" | "high";
  reboundingEmphasis: "guard_balance" | "balanced" | "crash_glass";
  transitionAggression: "low" | "balanced" | "high";
  rotationDepth: "tight_8" | "balanced_10" | "deep_12";
};

export type TacticalRolePosition = {
  role: "PG" | "SG" | "SF" | "PF" | "C";
  x: number;
  y: number;
};

export const defaultTacticalPreset: TacticalPreset = {
  formation: "balanced",
  style: "balanced",
  defensiveScheme: "man_to_man",
  tempo: "balanced",
  shotSelection: "balanced",
  threePointFrequency: "balanced",
  paintAttackFrequency: "balanced",
  defensivePressure: "balanced",
  reboundingEmphasis: "balanced",
  transitionAggression: "balanced",
  rotationDepth: "balanced_10",
};

export const defaultUniformAssets: ClubUniformAssets = {
  home_uniform_2d_url: "",
  away_uniform_2d_url: "",
  alternate_uniform_2d_url: "",
  active_uniform_slot: "home",
};

export const formationLayouts: Record<FormationId, TacticalRolePosition[]> = {
  balanced: [
    { role: "PG", x: 50, y: 74 },
    { role: "SG", x: 28, y: 60 },
    { role: "SF", x: 72, y: 60 },
    { role: "PF", x: 36, y: 42 },
    { role: "C", x: 64, y: 36 },
  ],
  pace_space: [
    { role: "PG", x: 50, y: 76 },
    { role: "SG", x: 20, y: 57 },
    { role: "SF", x: 80, y: 57 },
    { role: "PF", x: 32, y: 34 },
    { role: "C", x: 68, y: 34 },
  ],
  five_out: [
    { role: "PG", x: 50, y: 72 },
    { role: "SG", x: 18, y: 56 },
    { role: "SF", x: 82, y: 56 },
    { role: "PF", x: 30, y: 30 },
    { role: "C", x: 70, y: 30 },
  ],
  pick_roll_heavy: [
    { role: "PG", x: 48, y: 70 },
    { role: "SG", x: 20, y: 56 },
    { role: "SF", x: 78, y: 56 },
    { role: "PF", x: 56, y: 50 },
    { role: "C", x: 50, y: 40 },
  ],
  post_centric: [
    { role: "PG", x: 52, y: 76 },
    { role: "SG", x: 24, y: 57 },
    { role: "SF", x: 78, y: 57 },
    { role: "PF", x: 38, y: 44 },
    { role: "C", x: 52, y: 33 },
  ],
  motion_offense: [
    { role: "PG", x: 50, y: 74 },
    { role: "SG", x: 24, y: 54 },
    { role: "SF", x: 76, y: 54 },
    { role: "PF", x: 34, y: 40 },
    { role: "C", x: 66, y: 40 },
  ],
  isolation_heavy: [
    { role: "PG", x: 50, y: 68 },
    { role: "SG", x: 22, y: 56 },
    { role: "SF", x: 80, y: 56 },
    { role: "PF", x: 34, y: 36 },
    { role: "C", x: 66, y: 36 },
  ],
  perimeter_creation: [
    { role: "PG", x: 48, y: 76 },
    { role: "SG", x: 18, y: 58 },
    { role: "SF", x: 82, y: 58 },
    { role: "PF", x: 30, y: 38 },
    { role: "C", x: 70, y: 38 },
  ],
};

export function resolveUniformUrl(uniforms: ClubUniformAssets): string {
  if (uniforms.active_uniform_slot === "away") return uniforms.away_uniform_2d_url || uniforms.home_uniform_2d_url;
  if (uniforms.active_uniform_slot === "alternate") return uniforms.alternate_uniform_2d_url || uniforms.home_uniform_2d_url;
  return uniforms.home_uniform_2d_url || uniforms.away_uniform_2d_url || uniforms.alternate_uniform_2d_url || "";
}
