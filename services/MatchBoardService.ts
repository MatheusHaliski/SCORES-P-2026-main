import { FixturesRepository } from "@/repositories/FixturesRepository";
import { TeamsRepository } from "@/repositories/TeamsRepository";
import { UserSavesRepository } from "@/repositories/UserSavesRepository";
import { PlayersRepository } from "@/repositories/PlayersRepository";
import { SeasonFlowService } from "@/services/SeasonFlowService";

export class MatchBoardService {
  constructor(
    private savesRepository = new UserSavesRepository(),
    private fixturesRepository = new FixturesRepository(),
    private teamsRepository = new TeamsRepository(),
    private playersRepository = new PlayersRepository(),
    private seasonFlowService = new SeasonFlowService(),
  ) {}

  async getLiveBoard(saveId: string) {
    const save = await this.savesRepository.getSaveById(saveId);
    if (!save) throw new Error("Save não encontrado");

    const seasonContext = await this.seasonFlowService.getSeasonContext(saveId);
    if (!seasonContext.nextFixture) {
      throw new Error("Temporada finalizada. Não há partidas pendentes no calendário.");
    }

    const fixtures = await this.fixturesRepository.getFixturesByLeagueAndRound(save.leagueId, seasonContext.nextFixture.round);
    const userFixture = fixtures.find((fixture) => fixture.homeTeamId === save.teamId || fixture.awayTeamId === save.teamId);
    if (!userFixture) throw new Error("Confronto do usuário não encontrado na rodada");

    const opponentTeamId = userFixture.homeTeamId === save.teamId ? userFixture.awayTeamId : userFixture.homeTeamId;

    const [userTeam, userPlayers, opponentPlayers] = await Promise.all([
      this.teamsRepository.getTeamById(save.teamId),
      this.playersRepository.getPlayersByTeam(save.teamId),
      this.playersRepository.getPlayersByTeam(opponentTeamId),
    ]);

    return { save, fixtures, userTeam, userPlayers, opponentPlayers, standings: seasonContext.standings, seasonSummary: seasonContext.summary };
  }
}
