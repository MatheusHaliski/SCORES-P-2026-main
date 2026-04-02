import { mockFixtures } from "@/mocks/gameData";
import { Fixture } from "@/types/game";
import { firestoreDb, shouldUseFirebase } from "@/lib/firebase/config";

export class FixturesRepository {
  async getFixturesByLeagueAndRound(leagueId: string, round: number): Promise<Fixture[]> {
    if (shouldUseFirebase && firestoreDb) {
      // TODO: query `fixtures` by leagueId and round.
    }
    return mockFixtures.filter((fixture) => fixture.leagueId === leagueId && fixture.round === round);
  }

  async getFixtureById(id: string): Promise<Fixture | undefined> {
    return mockFixtures.find((fixture) => fixture.id === id);
  }

  async getLatestFixturesByLeague(leagueId: string): Promise<Fixture[]> {
    return mockFixtures.filter((fixture) => fixture.leagueId === leagueId);
  }
}
