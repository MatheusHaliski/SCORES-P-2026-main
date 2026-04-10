import { TeamTactic } from "@/types/matchSession";

export type TacticImpact = {
  possessions: number;
  attack: number;
  defense: number;
  variance: number;
  staminaDrain: number;
};

const impacts: Record<TeamTactic, TacticImpact> = {
  balanced: { possessions: 1, attack: 1, defense: 1, variance: 1, staminaDrain: 1 },
  fast_pace: { possessions: 1.2, attack: 1.08, defense: 0.95, variance: 1.1, staminaDrain: 1.2 },
  defensive: { possessions: 0.88, attack: 0.93, defense: 1.18, variance: 0.92, staminaDrain: 0.95 },
  three_point_focus: { possessions: 1.02, attack: 1.05, defense: 0.97, variance: 1.2, staminaDrain: 1.02 },
  paint_attack: { possessions: 1, attack: 1.07, defense: 1.01, variance: 1.05, staminaDrain: 1.08 },
  aggressive_press: { possessions: 1.08, attack: 1.03, defense: 1.07, variance: 1.12, staminaDrain: 1.25 },
  offensive_press: { possessions: 1.1, attack: 1.06, defense: 0.96, variance: 1.1, staminaDrain: 1.16 },
  defensive_block: { possessions: 0.9, attack: 0.94, defense: 1.14, variance: 0.9, staminaDrain: 0.92 },
  counter_attack: { possessions: 1.04, attack: 1.04, defense: 1.02, variance: 1.06, staminaDrain: 1.03 },
  possession_control: { possessions: 0.96, attack: 1, defense: 1.05, variance: 0.97, staminaDrain: 0.96 },
  fast_transition: { possessions: 1.14, attack: 1.07, defense: 0.95, variance: 1.12, staminaDrain: 1.2 },
  wing_play: { possessions: 1.03, attack: 1.03, defense: 0.99, variance: 1.04, staminaDrain: 1.04 },
};

export class TacticImpactEngine {
  static for(tactic: TeamTactic): TacticImpact {
    return impacts[tactic];
  }
}
