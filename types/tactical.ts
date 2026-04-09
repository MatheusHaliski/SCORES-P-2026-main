export type UniformSlot = "home" | "away" | "alternate";

export type ClubUniformAssets = {
  home_uniform_2d_url: string;
  away_uniform_2d_url: string;
  alternate_uniform_2d_url?: string;
  active_uniform_slot: UniformSlot;
};

export type FormationId = "4-4-2" | "4-3-3" | "3-5-2" | "5-3-2" | "4-2-3-1" | "4-1-4-1";

export type TacticalStyle =
  | "balanced"
  | "offensive_press"
  | "defensive_block"
  | "counter_attack"
  | "possession_control"
  | "fast_transition"
  | "wing_play";

export type TacticalPreset = {
  formation: FormationId;
  style: TacticalStyle;
  pressure: "low" | "medium" | "high";
  buildUp: "direct" | "mixed" | "possession";
  defensiveLine: "deep" | "standard" | "high";
  transitionSpeed: "slow" | "balanced" | "quick";
  width: "narrow" | "balanced" | "wide";
  tempo: "calm" | "normal" | "high";
};

export type TacticalRolePosition = {
  role: string;
  x: number;
  y: number;
};

export const defaultTacticalPreset: TacticalPreset = {
  formation: "4-3-3",
  style: "balanced",
  pressure: "medium",
  buildUp: "mixed",
  defensiveLine: "standard",
  transitionSpeed: "balanced",
  width: "balanced",
  tempo: "normal",
};

export const defaultUniformAssets: ClubUniformAssets = {
  home_uniform_2d_url: "",
  away_uniform_2d_url: "",
  alternate_uniform_2d_url: "",
  active_uniform_slot: "home",
};

export const formationLayouts: Record<FormationId, TacticalRolePosition[]> = {
  "4-4-2": [
    { role: "GK", x: 50, y: 92 },
    { role: "LB", x: 16, y: 74 },
    { role: "CB", x: 38, y: 76 },
    { role: "CB", x: 62, y: 76 },
    { role: "RB", x: 84, y: 74 },
    { role: "LM", x: 14, y: 56 },
    { role: "CM", x: 38, y: 58 },
    { role: "CM", x: 62, y: 58 },
    { role: "RM", x: 86, y: 56 },
    { role: "ST", x: 42, y: 30 },
    { role: "ST", x: 58, y: 28 },
  ],
  "4-3-3": [
    { role: "GK", x: 50, y: 92 },
    { role: "LB", x: 16, y: 74 },
    { role: "CB", x: 38, y: 76 },
    { role: "CB", x: 62, y: 76 },
    { role: "RB", x: 84, y: 74 },
    { role: "CM", x: 30, y: 56 },
    { role: "DM", x: 50, y: 60 },
    { role: "CM", x: 70, y: 56 },
    { role: "LW", x: 18, y: 30 },
    { role: "ST", x: 50, y: 24 },
    { role: "RW", x: 82, y: 30 },
  ],
  "3-5-2": [
    { role: "GK", x: 50, y: 92 },
    { role: "LCB", x: 28, y: 74 },
    { role: "CB", x: 50, y: 76 },
    { role: "RCB", x: 72, y: 74 },
    { role: "LWB", x: 12, y: 56 },
    { role: "CM", x: 34, y: 56 },
    { role: "DM", x: 50, y: 60 },
    { role: "CM", x: 66, y: 56 },
    { role: "RWB", x: 88, y: 56 },
    { role: "ST", x: 42, y: 30 },
    { role: "ST", x: 58, y: 28 },
  ],
  "5-3-2": [
    { role: "GK", x: 50, y: 92 },
    { role: "LWB", x: 10, y: 74 },
    { role: "LCB", x: 30, y: 78 },
    { role: "CB", x: 50, y: 80 },
    { role: "RCB", x: 70, y: 78 },
    { role: "RWB", x: 90, y: 74 },
    { role: "CM", x: 34, y: 56 },
    { role: "CM", x: 50, y: 60 },
    { role: "CM", x: 66, y: 56 },
    { role: "ST", x: 42, y: 30 },
    { role: "ST", x: 58, y: 28 },
  ],
  "4-2-3-1": [
    { role: "GK", x: 50, y: 92 },
    { role: "LB", x: 16, y: 74 },
    { role: "CB", x: 38, y: 76 },
    { role: "CB", x: 62, y: 76 },
    { role: "RB", x: 84, y: 74 },
    { role: "DM", x: 40, y: 60 },
    { role: "DM", x: 60, y: 60 },
    { role: "LAM", x: 20, y: 44 },
    { role: "CAM", x: 50, y: 44 },
    { role: "RAM", x: 80, y: 44 },
    { role: "ST", x: 50, y: 24 },
  ],
  "4-1-4-1": [
    { role: "GK", x: 50, y: 92 },
    { role: "LB", x: 16, y: 74 },
    { role: "CB", x: 38, y: 76 },
    { role: "CB", x: 62, y: 76 },
    { role: "RB", x: 84, y: 74 },
    { role: "DM", x: 50, y: 62 },
    { role: "LM", x: 18, y: 48 },
    { role: "CM", x: 38, y: 50 },
    { role: "CM", x: 62, y: 50 },
    { role: "RM", x: 82, y: 48 },
    { role: "ST", x: 50, y: 24 },
  ],
};

export function resolveUniformUrl(uniforms: ClubUniformAssets): string {
  if (uniforms.active_uniform_slot === "away") return uniforms.away_uniform_2d_url || uniforms.home_uniform_2d_url;
  if (uniforms.active_uniform_slot === "alternate") return uniforms.alternate_uniform_2d_url || uniforms.home_uniform_2d_url;
  return uniforms.home_uniform_2d_url || uniforms.away_uniform_2d_url || uniforms.alternate_uniform_2d_url || "";
}
