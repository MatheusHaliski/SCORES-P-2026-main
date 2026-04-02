import { mockUserSaves } from "@/mocks/gameData";
import { UserSave } from "@/types/game";
import { firestoreDb, shouldUseFirebase } from "@/lib/firebase/config";

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
    return mockUserSaves.find((save) => save.id === saveId);
  }
}
