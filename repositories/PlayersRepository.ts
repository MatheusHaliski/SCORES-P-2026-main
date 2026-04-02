import { mockPlayers } from "@/mocks/gameData";
import { Player } from "@/types/game";
import { firestoreDb, shouldUseFirebase } from "@/lib/firebase/config";

export class PlayersRepository {
  async getPlayersByTeam(teamId: string): Promise<Player[]> {
    if (shouldUseFirebase && firestoreDb) {
      // TODO: query `players` where teamId == teamId.
    }
    return mockPlayers.filter((player) => player.teamId === teamId);
  }
}
