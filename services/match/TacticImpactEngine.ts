export type TacticImpact = {
  possessions: number;
  attack: number;
  defense: number;
  variance: number;
  staminaDrain: number;
};

type CanonicalTactic =
  | "balanced"
  | "offensive_press"
  | "defensive_block"
  | "counter_attack"
  | "possession_control"
  | "fast_transition"
  | "wing_play";

const impacts: Record<CanonicalTactic, TacticImpact> = {
  balanced: { possessions: 1, attack: 1, defense: 1, variance: 1, staminaDrain: 1 },
  offensive_press: { possessions: 1.1, attack: 1.06, defense: 0.96, variance: 1.1, staminaDrain: 1.16 },
  defensive_block: { possessions: 0.9, attack: 0.94, defense: 1.14, variance: 0.9, staminaDrain: 0.92 },
  counter_attack: { possessions: 1.04, attack: 1.04, defense: 1.02, variance: 1.06, staminaDrain: 1.03 },
  possession_control: { possessions: 0.96, attack: 1, defense: 1.05, variance: 0.97, staminaDrain: 0.96 },
  fast_transition: { possessions: 1.14, attack: 1.07, defense: 0.95, variance: 1.12, staminaDrain: 1.2 },
  wing_play: { possessions: 1.03, attack: 1.03, defense: 0.99, variance: 1.04, staminaDrain: 1.04 },
};

const tacticAliases: Record<string, CanonicalTactic> = {
  balanced: "balanced",
  offensive_press: "offensive_press",
  defensive_block: "defensive_block",
  counter_attack: "counter_attack",
  possession_control: "possession_control",
  fast_transition: "fast_transition",
  wing_play: "wing_play",
  fast_pace: "fast_transition",
  paint_attack: "counter_attack",
  defensive: "defensive_block",
  three_point_focus: "wing_play",
  aggressive_press: "offensive_press",
};

export function normalizeTeamTacticId(tactic: string | null | undefined): CanonicalTactic {
  if (!tactic) return "balanced";
  return tacticAliases[tactic.trim().toLowerCase()] ?? "balanced";
}

export class TacticImpactEngine {
  static for(tactic: string): TacticImpact {
    return impacts[normalizeTeamTacticId(tactic)];
  }
}
