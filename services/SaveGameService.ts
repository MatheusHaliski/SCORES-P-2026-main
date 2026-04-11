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

  async listSaves(userId: string) {
    return this.getSaveSlots(userId);
  }

  static registerLocalSaveSlot(save: UserSave) {
    if (typeof window === "undefined") return;
    const key = "scores:save_slots:index";
    const raw = window.localStorage.getItem(key);
    const existing = raw ? (JSON.parse(raw) as UserSave[]) : [];
    const merged = [...existing.filter((item) => item.id !== save.id), save];
    window.localStorage.setItem(key, JSON.stringify(merged));
  }

  async saveFullGameState(saveId: string, payload: FullSavePayload): Promise<SaveResult> {
    try {
      const now = new Date().toISOString();
      const currentSave = await this.savesRepository.getSaveById(saveId);
      const completePatch: Partial<UserSave> = {
        ...payload.savePatch,
        backgroundStudioConfig: payload.backgroundStudioConfig ?? payload.savePatch.backgroundStudioConfig,
        updatedAt: now,
      };
      this.savesRepository.upsertSaveProgress(saveId, completePatch);

      if (typeof window !== "undefined") {
        if (currentSave) {
          SaveGameService.registerLocalSaveSlot({ ...currentSave, ...completePatch } as UserSave);
        }
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
