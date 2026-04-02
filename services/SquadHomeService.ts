import { FixturesRepository } from "@/repositories/FixturesRepository";
import { LeaguesRepository } from "@/repositories/LeaguesRepository";
import { PlayersRepository } from "@/repositories/PlayersRepository";
import { StandingsRepository } from "@/repositories/StandingsRepository";
import { TeamsRepository } from "@/repositories/TeamsRepository";
import { UserSavesRepository } from "@/repositories/UserSavesRepository";
import { SquadHomePayload } from "@/types/game";

export class SquadHomeService {
  constructor(
    private savesRepository = new UserSavesRepository(),
    private leaguesRepository = new LeaguesRepository(),
    private teamsRepository = new TeamsRepository(),
    private playersRepository = new PlayersRepository(),
    private fixturesRepository = new FixturesRepository(),
    private standingsRepository = new StandingsRepository(),
  ) {}

  async getSquadHomePayload(saveId: string): Promise<SquadHomePayload> {
    const save = await this.savesRepository.getSaveById(saveId);
    if (!save) throw new Error("Save não encontrado");

    const [league, team, players, nextFixture, standings, visual, uniforms] = await Promise.all([
      this.leaguesRepository.getLeagueById(save.leagueId),
      this.teamsRepository.getTeamById(save.teamId),
      this.playersRepository.getPlayersByTeam(save.teamId),
      this.fixturesRepository.getFixtureById(save.nextFixtureId),
      this.standingsRepository.getStandingsByLeague(save.leagueId),
      this.teamsRepository.getVisualByTeamId(save.teamId),
      this.teamsRepository.getUniformsByTeamId(save.teamId),
    ]);

    if (!league || !team || !nextFixture || !visual) {
      throw new Error("Dados incompletos para carregar o SquadHomeView");
    }

    return { save, league, team, players, nextFixture, standings, visual, uniforms };
  }
}
