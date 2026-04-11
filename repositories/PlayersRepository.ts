import { Player } from "@/types/game";
import { firestoreDb, shouldUseFirebase } from "@/lib/firebase/config";
import { toModernPlayerModel } from "@/lib/playerModel";
import { readGlobalDb } from "@/lib/globalDb";

export class PlayersRepository {
  async getPlayersByTeam(teamId: string): Promise<Player[]> {
    if (shouldUseFirebase && firestoreDb) {
      // TODO: query `players` where teamId == teamId.
    }
    return readGlobalDb().players.filter((player) => player.teamId === teamId).map((player) => toModernPlayerModel({ ...player }));
  }
}
