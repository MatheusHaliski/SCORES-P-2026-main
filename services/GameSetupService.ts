import { LeaguesRepository } from "@/repositories/LeaguesRepository";
import { TeamsRepository } from "@/repositories/TeamsRepository";

export class GameSetupService {
  constructor(
    private leaguesRepository = new LeaguesRepository(),
    private teamsRepository = new TeamsRepository(),
  ) {}

  async getSetupData(selectedLeagueId?: string) {
    const leagues = await this.leaguesRepository.getLeagues();
    const activeLeagueId = selectedLeagueId ?? leagues[0]?.id;
    const teams = activeLeagueId ? await this.teamsRepository.getTeamsByLeague(activeLeagueId) : [];
    const selectedLeague = leagues.find((league) => league.id === activeLeagueId);

    return { leagues, selectedLeague, teams };
  }
}
