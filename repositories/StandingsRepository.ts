import { mockChampionsHistory, mockStandings } from "@/mocks/gameData";
import { LeagueChampionHistory, StandingRow } from "@/types/game";
import { parseNewSaveId } from "@/lib/saveId";
import { mockTeams } from "@/mocks/gameData";

export class StandingsRepository {
  async getStandingsByLeague(leagueId: string, saveId?: string): Promise<StandingRow[]> {
    if (saveId && parseNewSaveId(saveId)) {
      return mockTeams
        .filter((team) => team.leagueId === leagueId)
        .sort((a, b) => b.overall - a.overall)
        .map((team, index) => ({
          teamId: team.id,
          leagueId,
          played: 0,
          wins: 0,
          losses: 0,
          pointsFor: 0,
          pointsAgainst: 0,
          leaguePoints: 0,
          position: index + 1,
        }));
    }

    return mockStandings
      .filter((row) => row.leagueId === leagueId)
      .sort((a, b) => a.position - b.position);
  }

  async getChampionsByLeague(leagueId: string): Promise<LeagueChampionHistory[]> {
    return mockChampionsHistory.filter((champion) => champion.leagueId === leagueId);
  }
}
