export type TacticImpact = {
  possessions: number;
  attack: number;
  defense: number;
  variance: number;
  staminaDrain: number;
};

type CanonicalTactic =
  | "balanced"
  | "pace_space"
  | "five_out"
  | "pick_roll_heavy"
  | "post_centric"
  | "motion_offense"
  | "isolation_heavy"
  | "perimeter_creation";

const impacts: Record<CanonicalTactic, TacticImpact> = {
  balanced: { possessions: 1, attack: 1, defense: 1, variance: 1, staminaDrain: 1 },
  pace_space: { possessions: 1.1, attack: 1.05, defense: 0.96, variance: 1.08, staminaDrain: 1.12 },
  five_out: { possessions: 1.07, attack: 1.06, defense: 0.95, variance: 1.1, staminaDrain: 1.08 },
  pick_roll_heavy: { possessions: 1.04, attack: 1.08, defense: 0.97, variance: 1.06, staminaDrain: 1.06 },
  post_centric: { possessions: 0.93, attack: 1.04, defense: 1.03, variance: 0.95, staminaDrain: 0.94 },
  motion_offense: { possessions: 1.02, attack: 1.05, defense: 1.01, variance: 1.02, staminaDrain: 1.02 },
  isolation_heavy: { possessions: 0.98, attack: 1.07, defense: 0.94, variance: 1.14, staminaDrain: 1.1 },
  perimeter_creation: { possessions: 1.03, attack: 1.05, defense: 0.98, variance: 1.06, staminaDrain: 1.04 },
};

const tacticAliases: Record<string, CanonicalTactic> = {
  balanced: "balanced",
  pace_space: "pace_space",
  five_out: "five_out",
  pick_roll_heavy: "pick_roll_heavy",
  post_centric: "post_centric",
  motion_offense: "motion_offense",
  isolation_heavy: "isolation_heavy",
  perimeter_creation: "perimeter_creation",
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
