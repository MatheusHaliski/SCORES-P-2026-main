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
    const shooting = avg(players.map((player) => player.shooting));
    const defending = avg(players.map((player) => player.defending));
    const pace = avg(players.map((player) => player.pace));
    const stamina = avg(players.map((player) => player.stamina));

    return {
      attack: (overall * 0.5 + shooting * 0.5) / 100,
      defense: (overall * 0.45 + defending * 0.55) / 100,
      pace: pace / 100,
      staminaPenalty: 1 - Math.max(0, (80 - stamina) / 200),
      overall,
    };
  }
}
