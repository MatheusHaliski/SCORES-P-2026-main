import { StandingRow } from "@/types/game";

export class StandingsService {
  constructor(private playoffSpots = 8, private dangerSpots = 3) {}

  getVisualRules(rows: StandingRow[]) {
    return {
      playoffSpots: Math.min(this.playoffSpots, rows.length),
      dangerSpots: Math.min(this.dangerSpots, rows.length),
    };
  }
}
