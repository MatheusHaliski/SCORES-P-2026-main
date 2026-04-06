import { LeaguesRepository } from "@/repositories/LeaguesRepository";
import { TeamsRepository } from "@/repositories/TeamsRepository";
import { UserSavesRepository } from "@/repositories/UserSavesRepository";
import { League, Team, UserSave } from "@/types/game";

export type SaveSlot = {
  save: UserSave;
  team?: Team;
  league?: League;
};

export class SaveGameService {
  constructor(
    private savesRepository = new UserSavesRepository(),
    private teamsRepository = new TeamsRepository(),
    private leaguesRepository = new LeaguesRepository(),
  ) {}

  async getSaveSlots(userId: string) {
    const saves = await this.savesRepository.getUserSaves(userId);

    const decorated: SaveSlot[] = await Promise.all(
      saves.map(async (save) => {
        const [team, league] = await Promise.all([
          this.teamsRepository.getTeamById(save.teamId),
          this.leaguesRepository.getLeagueById(save.leagueId),
        ]);
        return { save, team, league };
      }),
    );

    return decorated;
  }
}
