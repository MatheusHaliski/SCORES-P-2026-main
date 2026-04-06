import { mockFixtures, mockLeagues, mockTeams, mockUserSaves } from "@/mocks/gameData";
import { UserSave } from "@/types/game";
import { firestoreDb, shouldUseFirebase } from "@/lib/firebase/config";
import { parseNewSaveId } from "@/lib/saveId";

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
    boardReputation: team.reputationBoard,
    fansReputation: team.reputationFans,
  };
};

export class UserSavesRepository {
  async getUserSaves(userId: string): Promise<UserSave[]> {
    if (shouldUseFirebase && firestoreDb) {
      // TODO: query `user_saves` where userId == userId.
    }
    return mockUserSaves.filter((save) => save.userId === userId);
  }

  async getSaveById(saveId: string): Promise<UserSave | undefined> {
    if (shouldUseFirebase && firestoreDb) {
      // TODO: read `user_saves/{saveId}`.
    }

    const staticSave = mockUserSaves.find((save) => save.id === saveId);
    if (staticSave) return staticSave;

    return buildDynamicSave(saveId);
  }
}
