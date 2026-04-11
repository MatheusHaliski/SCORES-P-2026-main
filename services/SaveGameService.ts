import { LeaguesRepository } from "@/repositories/LeaguesRepository";
import { TeamsRepository } from "@/repositories/TeamsRepository";
import { UserSavesRepository } from "@/repositories/UserSavesRepository";
import { League, Team, UserSave } from "@/types/game";
import { BackgroundStudioConfig } from "@/types/backgroundStudio";
import { TacticalPreset } from "@/types/tactical";
import { ClubIdentityTheme } from "@/types/clubIdentityTheme";

export type SaveSlot = {
  save: UserSave;
  team?: Team;
  league?: League;
};

export type FullSavePayload = {
  savePatch: Partial<UserSave>;
  seasonState?: Record<string, unknown>;
  squadState?: Record<string, unknown>;
  tacticalState?: TacticalPreset;
  uiState?: {
    clubIdentityTheme?: ClubIdentityTheme;
    teamColors?: { primaryColor: string; secondaryColor: string };
    customizations?: Record<string, unknown>;
  };
  backgroundStudioConfig?: BackgroundStudioConfig;
};

export type SaveResult = {
  ok: boolean;
  savedAt?: string;
  message: string;
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

  async saveFullGameState(saveId: string, payload: FullSavePayload): Promise<SaveResult> {
    try {
      const now = new Date().toISOString();
      const completePatch: Partial<UserSave> = {
        ...payload.savePatch,
        backgroundStudioConfig: payload.backgroundStudioConfig ?? payload.savePatch.backgroundStudioConfig,
        updatedAt: now,
      };
      this.savesRepository.upsertSaveProgress(saveId, completePatch);

      if (typeof window !== "undefined") {
        window.localStorage.setItem(`scores:save_meta:${saveId}`, JSON.stringify({
          savedAt: now,
          seasonState: payload.seasonState ?? {},
          squadState: payload.squadState ?? {},
          tacticalState: payload.tacticalState ?? {},
          uiState: payload.uiState ?? {},
        }));
      }

      return { ok: true, savedAt: now, message: "Save concluído com sucesso." };
    } catch (error) {
      return { ok: false, message: `Falha ao salvar: ${String(error)}` };
    }
  }
}
