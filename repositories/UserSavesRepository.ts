import { mockFixtures, mockLeagues, mockTeams, mockUserSaves } from "@/mocks/gameData";
import { UserSave } from "@/types/game";
import { BackgroundStudioConfig } from "@/types/backgroundStudio";
import { firestoreDb, shouldUseFirebase } from "@/lib/firebase/config";
import { parseNewSaveId } from "@/lib/saveId";

const saveProgressOverrides = new Map<string, Partial<UserSave>>();
const persistedSaveStateKey = (saveId: string) => `scores:save:${saveId}`;
const saveSlotIndexKey = "scores:save_slots:index";

const clampStars = (value: number) => Math.max(0, Math.min(10, Math.round(value)));

const normalizeSave = (save: UserSave): UserSave => {
  const boardStars = save.boardReputation > 10 ? save.boardReputation / 10 : save.boardReputation;
  const fansStars = save.fansReputation > 10 ? save.fansReputation / 10 : save.fansReputation;
  const currentClubId = save.currentClubId ?? save.teamId;
  const employmentStatus = save.employmentStatus ?? "employed";
  return {
    ...save,
    boardReputation: clampStars(boardStars),
    fansReputation: clampStars(fansStars),
    roundsUnderCriticalBoard: save.roundsUnderCriticalBoard ?? 0,
    roundsUnderCriticalFans: save.roundsUnderCriticalFans ?? 0,
    roundsUnderCriticalCombined: save.roundsUnderCriticalCombined ?? 0,
    isEmployed: save.isEmployed ?? employmentStatus === "employed",
    employmentStatus,
    currentClubId,
    dismissalCount: save.dismissalCount ?? 0,
    lastDismissedClubId: save.lastDismissedClubId ?? null,
    lastDismissedAt: save.lastDismissedAt ?? null,
  };
};

const buildDynamicSave = (saveId: string): UserSave | undefined => {
  const parsedSave = parseNewSaveId(saveId);
  if (!parsedSave) return undefined;
  const { leagueId, teamId, managerName, saveName } = parsedSave;

  const team = mockTeams.find((item) => item.id === teamId && item.leagueId === leagueId);
  const league = mockLeagues.find((item) => item.id === leagueId);
  if (!team || !league) return undefined;

  const nextFixture = mockFixtures.find((fixture) => fixture.leagueId === leagueId && fixture.status === "scheduled" && (fixture.homeTeamId === teamId || fixture.awayTeamId === teamId))
    ?? mockFixtures.find((fixture) => fixture.leagueId === leagueId && (fixture.homeTeamId === teamId || fixture.awayTeamId === teamId));

  if (!nextFixture) return undefined;

  const now = new Date().toISOString();

  return {
    id: saveId,
    saveName: saveName?.trim() || `Carreira ${team.shortName}`,
    userId: "u-1",
    leagueId,
    teamId,
    managerName: managerName?.trim() || team.managerDefaultName,
    currentRound: nextFixture.round,
    currentSeason: league.season,
    createdAt: now,
    updatedAt: now,
    nextFixtureId: nextFixture.id,
    budgetSnapshot: team.budget,
    boardReputation: clampStars(team.reputationBoard / 10),
    fansReputation: clampStars(team.reputationFans / 10),
    roundsUnderCriticalBoard: 0,
    roundsUnderCriticalFans: 0,
    roundsUnderCriticalCombined: 0,
    isEmployed: true,
    employmentStatus: "employed",
    currentClubId: team.id,
    dismissalCount: 0,
    lastDismissedClubId: null,
    lastDismissedAt: null,
  };
};

export class UserSavesRepository {
  private readPersistedSaveSlots(): UserSave[] {
    if (typeof window === "undefined") return [];
    const raw = window.localStorage.getItem(saveSlotIndexKey);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw) as UserSave[];
      return Array.isArray(parsed) ? parsed.filter((item) => item && typeof item.id === "string") : [];
    } catch {
      return [];
    }
  }

  private persistSaveSlot(save: UserSave) {
    if (typeof window === "undefined") return;
    const current = this.readPersistedSaveSlots();
    const merged = [...current.filter((item) => item.id !== save.id), save];
    window.localStorage.setItem(saveSlotIndexKey, JSON.stringify(merged));
  }

  private readPersistedSaveState(saveId: string): Partial<UserSave> {
    if (typeof window === "undefined") return {};
    const raw = window.localStorage.getItem(persistedSaveStateKey(saveId));
    if (!raw) return {};
    try {
      const parsed = JSON.parse(raw) as Partial<UserSave>;
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return {};
    }
  }

  private persistSaveState(saveId: string, patch: Partial<UserSave>) {
    if (typeof window === "undefined") return;
    const current = this.readPersistedSaveState(saveId);
    window.localStorage.setItem(
      persistedSaveStateKey(saveId),
      JSON.stringify({ ...current, ...patch, id: saveId, updatedAt: new Date().toISOString() }),
    );
  }

  upsertBackgroundStudioConfig(saveId: string, config: BackgroundStudioConfig) {
    this.upsertSaveProgress(saveId, { backgroundStudioConfig: config });
  }

  upsertSaveProgress(saveId: string, patch: Partial<UserSave>) {
    const current = saveProgressOverrides.get(saveId) ?? {};
    const merged = { ...current, ...patch };
    saveProgressOverrides.set(saveId, merged);
    this.persistSaveState(saveId, merged);
  }

  async getUserSaves(userId: string): Promise<UserSave[]> {
    if (shouldUseFirebase && firestoreDb) {
      // TODO: query `user_saves` where userId == userId.
    }
    const mockSource = mockUserSaves.filter((save) => save.userId === userId);
    const baseline = mockSource.length > 0 ? mockSource : mockUserSaves;
    const indexed = this.readPersistedSaveSlots();
    const dynamicFromIndex = indexed.map((save) => normalizeSave(save));
    const combined = [...baseline.map(normalizeSave), ...dynamicFromIndex];
    const deduped = new Map<string, UserSave>();
    combined.forEach((save) => {
      const runtimeOverrides = saveProgressOverrides.get(save.id) ?? {};
      const persistedOverrides = this.readPersistedSaveState(save.id);
      deduped.set(save.id, normalizeSave({ ...save, ...persistedOverrides, ...runtimeOverrides } as UserSave));
    });
    return Array.from(deduped.values()).sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));
  }

  async getSaveById(saveId: string): Promise<UserSave | undefined> {
    if (shouldUseFirebase && firestoreDb) {
      // TODO: read `user_saves/{saveId}`.
    }

    const runtimeOverrides = saveProgressOverrides.get(saveId) ?? {};
    const persistedOverrides = this.readPersistedSaveState(saveId);

    const staticSave = mockUserSaves.find((save) => save.id === saveId);
    if (staticSave) return normalizeSave({ ...staticSave, ...persistedOverrides, ...runtimeOverrides } as UserSave);

    const dynamic = buildDynamicSave(saveId);
    if (!dynamic) return undefined;
    const resolved = normalizeSave({ ...dynamic, ...persistedOverrides, ...runtimeOverrides } as UserSave);
    this.persistSaveSlot(resolved);
    return resolved;
  }
}
