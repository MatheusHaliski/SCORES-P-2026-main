import { mockLeagues } from "@/mocks/gameData";
import { League } from "@/types/game";
import { firestoreDb, shouldUseFirebase } from "@/lib/firebase/config";

export class LeaguesRepository {
  async getLeagues(): Promise<League[]> {
    if (shouldUseFirebase && firestoreDb) {
      // TODO: replace with Firestore query to `leagues` collection.
      // Keep fallback during initial Firebase setup.
    }
    return mockLeagues;
  }

  async getLeagueById(id: string): Promise<League | undefined> {
    const leagues = await this.getLeagues();
    return leagues.find((league) => league.id === id);
  }
}
