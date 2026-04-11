import { firestoreDb, shouldUseFirebase } from "@/lib/firebase/config";
import { MatchSession } from "@/types/matchSession";
import { normalizeTeamTacticId } from "@/services/match/TacticImpactEngine";
import { doc, getDoc, setDoc } from "firebase/firestore";

const COLLECTION = "matches_live_state";

const localKey = (saveId: string, fixtureId: string) => `scores:match_session:${saveId}:${fixtureId}`;
const legacyLocalKey = (saveId: string) => `scores:match_session:${saveId}`;


const normalizeSessionTactics = (session: MatchSession): MatchSession => ({
  ...session,
  userTeamTactic: normalizeTeamTacticId(session.userTeamTactic),
  opponentTeamTactic: normalizeTeamTacticId(session.opponentTeamTactic),
  userTacticalPreset: {
    ...session.userTacticalPreset,
    style: normalizeTeamTacticId(session.userTacticalPreset?.style),
  },
  opponentTacticalPreset: {
    ...session.opponentTacticalPreset,
    style: normalizeTeamTacticId(session.opponentTacticalPreset?.style),
  },
});

export class MatchSessionRepository {
  async getBySaveId(saveId: string, fixtureId?: string): Promise<MatchSession | null> {
    if (shouldUseFirebase && firestoreDb) {
      try {
        const ref = doc(firestoreDb, COLLECTION, fixtureId ? `${saveId}:${fixtureId}` : saveId);
        const snap = await getDoc(ref);
        if (snap.exists()) return normalizeSessionTactics(snap.data() as MatchSession);
      } catch {
        // Fallback para localStorage em caso de indisponibilidade de rede/permissão.
      }
    }

    if (typeof window === "undefined") return null;
    const raw = fixtureId
      ? window.localStorage.getItem(localKey(saveId, fixtureId))
      : window.localStorage.getItem(legacyLocalKey(saveId));
    const prefixedKey = !raw
      ? Object.keys(window.localStorage)
        .find((key) => key.startsWith(`scores:match_session:${saveId}:`))
      : null;
    const fallbackRaw = !raw
      ? (fixtureId ? window.localStorage.getItem(legacyLocalKey(saveId)) : (prefixedKey ? window.localStorage.getItem(prefixedKey) : null))
      : null;
    if (!raw && !fallbackRaw) return null;
    try {
      return normalizeSessionTactics(JSON.parse(raw ?? fallbackRaw ?? "") as MatchSession);
    } catch {
      return null;
    }
  }

  async upsert(session: MatchSession): Promise<void> {
    if (shouldUseFirebase && firestoreDb) {
      const ref = doc(firestoreDb, COLLECTION, `${session.saveId}:${session.fixtureId}`);
      await setDoc(ref, session, { merge: true });
    }

    if (typeof window !== "undefined") {
      window.localStorage.setItem(localKey(session.saveId, session.fixtureId), JSON.stringify(session));
    }
  }

  async clear(saveId: string, fixtureId?: string) {
    if (typeof window !== "undefined") {
      if (fixtureId) {
        window.localStorage.removeItem(localKey(saveId, fixtureId));
      }
      window.localStorage.removeItem(legacyLocalKey(saveId));
    }
  }
}
