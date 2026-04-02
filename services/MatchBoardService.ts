import { FixturesRepository } from "@/repositories/FixturesRepository";
import { TeamsRepository } from "@/repositories/TeamsRepository";
import { UserSavesRepository } from "@/repositories/UserSavesRepository";

export class MatchBoardService {
  constructor(
    private savesRepository = new UserSavesRepository(),
    private fixturesRepository = new FixturesRepository(),
    private teamsRepository = new TeamsRepository(),
  ) {}

  async getLiveBoard(saveId: string) {
    const save = await this.savesRepository.getSaveById(saveId);
    if (!save) throw new Error("Save não encontrado");

    const fixtures = await this.fixturesRepository.getFixturesByLeagueAndRound(save.leagueId, save.currentRound);
    const userTeam = await this.teamsRepository.getTeamById(save.teamId);

    return { save, fixtures, userTeam };
  }
}
