import { firestoreDb, shouldUseFirebase } from "@/lib/firebase/config";
import { MatchSession } from "@/types/matchSession";
import { doc, getDoc, setDoc } from "firebase/firestore";

const COLLECTION = "matches_live_state";

const localKey = (saveId: string) => `scores:match_session:${saveId}`;

export class MatchSessionRepository {
  async getBySaveId(saveId: string): Promise<MatchSession | null> {
    if (shouldUseFirebase && firestoreDb) {
      const ref = doc(firestoreDb, COLLECTION, saveId);
      const snap = await getDoc(ref);
      if (snap.exists()) return snap.data() as MatchSession;
    }

    if (typeof window === "undefined") return null;
    const raw = window.localStorage.getItem(localKey(saveId));
    if (!raw) return null;
    try {
      return JSON.parse(raw) as MatchSession;
    } catch {
      return null;
    }
  }

  async upsert(session: MatchSession): Promise<void> {
    if (shouldUseFirebase && firestoreDb) {
      const ref = doc(firestoreDb, COLLECTION, session.saveId);
      await setDoc(ref, session, { merge: true });
    }

    if (typeof window !== "undefined") {
      window.localStorage.setItem(localKey(session.saveId), JSON.stringify(session));
    }
  }

  async clear(saveId: string) {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(localKey(saveId));
    }
  }
}
