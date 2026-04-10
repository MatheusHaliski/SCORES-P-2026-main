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
  offensive_press: { possessions: 1.08, attack: 1.03, defense: 1.07, variance: 1.12, staminaDrain: 1.25 },
  defensive_block: { possessions: 0.88, attack: 0.93, defense: 1.18, variance: 0.92, staminaDrain: 0.95 },
  counter_attack: { possessions: 1, attack: 1.07, defense: 1.01, variance: 1.05, staminaDrain: 1.08 },
  possession_control: { possessions: 0.94, attack: 1.01, defense: 1.04, variance: 0.95, staminaDrain: 0.92 },
  fast_transition: { possessions: 1.2, attack: 1.08, defense: 0.95, variance: 1.1, staminaDrain: 1.2 },
  wing_play: { possessions: 1.02, attack: 1.05, defense: 0.97, variance: 1.2, staminaDrain: 1.02 },
};

export class TacticImpactEngine {
  static for(tactic: TeamTactic): TacticImpact {
    return impacts[tactic];
  }
}
