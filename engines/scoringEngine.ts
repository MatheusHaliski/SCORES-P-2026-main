import { PlaystyleImpact } from "@/engines/playstyleEngine";
import {
  RatingBreakdown,
  SimulationWeights,
  TeamDerivedMetrics,
  TeamMatchState,
} from "@/types/simulation";

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export const defaultSimulationWeights: SimulationWeights = {
  attack: {
    teamOverall: 0.18,
    avgPlayerOverallOnCourt: 0.15,
    shooting: 0.18,
    passing: 0.1,
    dribbling: 0.08,
    pace: 0.07,
    physicality: 0.06,
    teamTacticsOffense: 0.06,
    playstyleSynergy: 0.05,
    starPower: 0.07,
  },
  defense: {
    opponentTeamOverall: 0.2,
    opponentAvgPlayerOverall: 0.15,
    opponentDefending: 0.22,
    opponentPhysicality: 0.12,
    opponentTeamTacticsDefense: 0.1,
    opponentPlaystyleDefense: 0.06,
  },
  scoring: {
    baseRate: 0.62,
  },
};

export class ScoringEngine {
  constructor(private readonly weights: SimulationWeights = defaultSimulationWeights) {}

  getDerivedMetrics(team: TeamMatchState): TeamDerivedMetrics {
    const roster = team.playersOnCourt;
    const avg = (selector: (value: TeamMatchState["playersOnCourt"][number]) => number) =>
      roster.reduce((sum, player) => sum + selector(player), 0) / roster.length;

    const sorted = [...roster].sort((a, b) => b.overall - a.overall);
    const starPower = (sorted[0].overall + sorted[1].overall) / 2;

    return {
      avgOverallOnCourt: avg((player) => player.overall),
      shooting: avg((player) => player.macroRatings.shooting_rating),
      passing: avg((player) => player.macroRatings.passing_rating),
      dribbling: avg((player) => player.macroRatings.dribbling_rating),
      defending: avg((player) => player.macroRatings.defending_rating),
      pace: avg((player) => player.macroRatings.pace_rating),
      physicality: avg((player) => player.macroRatings.physical_rating),
      mental: avg((player) => player.macroRatings.mental_rating),
      starPower,
    };
  }

  getRatingBreakdown(params: {
    attacking: TeamMatchState;
    defending: TeamMatchState;
    possessionFactor: number;
    contextFactor: number;
    playstyle: PlaystyleImpact;
  }): RatingBreakdown {
    const attackMetrics = this.getDerivedMetrics(params.attacking);
    const defenseMetrics = this.getDerivedMetrics(params.defending);

    const attackRating =
      this.weights.attack.teamOverall * params.attacking.team.overall +
      this.weights.attack.avgPlayerOverallOnCourt * attackMetrics.avgOverallOnCourt +
      this.weights.attack.shooting * attackMetrics.shooting +
      this.weights.attack.passing * attackMetrics.passing +
      this.weights.attack.dribbling * attackMetrics.dribbling +
      this.weights.attack.pace * attackMetrics.pace +
      this.weights.attack.physicality * attackMetrics.physicality +
      this.weights.attack.teamTacticsOffense * params.attacking.tactics.offenseRating +
      this.weights.attack.playstyleSynergy * (100 * params.playstyle.offenseSynergy) +
      this.weights.attack.starPower * attackMetrics.starPower;

    const defenseResistance =
      this.weights.defense.opponentTeamOverall * params.defending.team.overall +
      this.weights.defense.opponentAvgPlayerOverall * defenseMetrics.avgOverallOnCourt +
      this.weights.defense.opponentDefending * defenseMetrics.defending +
      this.weights.defense.opponentPhysicality * defenseMetrics.physicality +
      this.weights.defense.opponentTeamTacticsDefense * params.defending.tactics.defenseRating +
      this.weights.defense.opponentPlaystyleDefense * (100 * params.playstyle.defenseImpact);

    const chanceToScore = attackRating / (attackRating + defenseResistance);
    const scoreRate =
      this.weights.scoring.baseRate *
      params.possessionFactor *
      (attackRating / Math.max(1, defenseResistance)) *
      params.contextFactor;

    return {
      attackRating,
      defenseResistance,
      chanceToScore: clamp(chanceToScore, 0.2, 0.78),
      scoreRate: clamp(scoreRate, 0.2, 1.35),
      contextFactor: params.contextFactor,
    };
  }

  resolvePoints(shotQuality: number, threePointBonus: number, random: () => number): 1 | 2 | 3 {
    const foulChance = clamp(0.06 + (0.45 - shotQuality) * 0.08, 0.03, 0.13);
    if (random() < foulChance) return 1;

    const baseThreeChance = shotQuality > 0.64 ? 0.26 : shotQuality > 0.52 ? 0.18 : 0.1;
    if (random() < clamp(baseThreeChance + threePointBonus, 0.05, 0.48)) return 3;

    return 2;
  }

  getShotQuality(attacking: TeamMatchState, playstyle: PlaystyleImpact): number {
    const metrics = this.getDerivedMetrics(attacking);
    const raw =
      0.38 * (metrics.shooting / 100) +
      0.24 * (metrics.passing / 100) +
      0.18 * (metrics.dribbling / 100) +
      0.08 * (attacking.tactics.offenseRating / 100) +
      0.08 * playstyle.offenseSynergy +
      0.06 * (metrics.mental / 100) +
      playstyle.clutchBonus;

    return clamp(raw, 0.32, 0.92);
  }
}
