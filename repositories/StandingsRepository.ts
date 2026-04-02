import { mockChampionsHistory, mockStandings } from "@/mocks/gameData";
import { LeagueChampionHistory, StandingRow } from "@/types/game";

export class StandingsRepository {
  async getStandingsByLeague(leagueId: string): Promise<StandingRow[]> {
    return mockStandings
      .filter((row) => row.leagueId === leagueId)
      .sort((a, b) => a.position - b.position);
  }

  async getChampionsByLeague(leagueId: string): Promise<LeagueChampionHistory[]> {
    return mockChampionsHistory.filter((champion) => champion.leagueId === leagueId);
  }
}
