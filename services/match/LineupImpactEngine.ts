import { LineupPlayer } from "@/types/matchSession";

export type LineupImpact = {
  attack: number;
  defense: number;
  pace: number;
  staminaPenalty: number;
  overall: number;
};

const avg = (items: number[]) => (items.length ? items.reduce((sum, value) => sum + value, 0) / items.length : 0);

export class LineupImpactEngine {
  static fromLineup(players: LineupPlayer[]): LineupImpact {
    const overall = avg(players.map((player) => player.overall));
    const shooting = avg(players.map((player) => player.macroRatings.shooting_rating));
    const defending = avg(players.map((player) => player.macroRatings.defending_rating));
    const pace = avg(players.map((player) => player.macroRatings.pace_rating));
    const passing = avg(players.map((player) => player.macroRatings.passing_rating));
    const dribbling = avg(players.map((player) => player.macroRatings.dribbling_rating));
    const stamina = avg(players.map((player) => player.stamina));

    return {
      attack: (overall * 0.34 + shooting * 0.3 + passing * 0.18 + dribbling * 0.18) / 100,
      defense: (overall * 0.25 + defending * 0.75) / 100,
      pace: pace / 100,
      staminaPenalty: 1 - Math.max(0, (80 - stamina) / 200),
      overall,
    };
  }
}
