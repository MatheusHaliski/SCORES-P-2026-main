import { LeaguesRepository } from "@/repositories/LeaguesRepository";
import { PlayersRepository } from "@/repositories/PlayersRepository";
import { TeamsRepository } from "@/repositories/TeamsRepository";
import { UserSavesRepository } from "@/repositories/UserSavesRepository";
import { SquadHomePayload } from "@/types/game";
import { SeasonFlowService } from "@/services/SeasonFlowService";

export class SquadHomeService {
  constructor(
    private savesRepository = new UserSavesRepository(),
    private leaguesRepository = new LeaguesRepository(),
    private teamsRepository = new TeamsRepository(),
    private playersRepository = new PlayersRepository(),
    private seasonFlowService = new SeasonFlowService(),
  ) {}

  async getSquadHomePayload(saveId: string): Promise<SquadHomePayload> {
    const save = await this.savesRepository.getSaveById(saveId);
    if (!save) throw new Error("Save não encontrado");

    const [league, team, players, seasonContext, visual, uniforms] = await Promise.all([
      this.leaguesRepository.getLeagueById(save.leagueId),
      this.teamsRepository.getTeamById(save.teamId),
      this.playersRepository.getPlayersByTeam(save.teamId),
      this.seasonFlowService.getSeasonContext(saveId),
      this.teamsRepository.getVisualByTeamId(save.teamId),
      this.teamsRepository.getUniformsByTeamId(save.teamId),
    ]);

    if (!league || !team || !visual) {
      throw new Error("Dados incompletos para carregar o SquadHomeView");
    }

    return {
      save,
      league,
      team,
      players,
      nextFixture: seasonContext.nextFixture,
      standings: seasonContext.standings,
      seasonCalendar: seasonContext.calendar,
      seasonSummary: seasonContext.summary,
      visual,
      uniforms,
    };
  }
}
