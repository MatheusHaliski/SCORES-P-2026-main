import { enrichedMockPlayers, mockLeagues, mockTeams } from "@/mocks/gameData";

export const GLOBAL_DB_KEY = "scores:global-db:v1";

export type GlobalDb = {
  version: string;
  leagues: typeof mockLeagues;
  teams: typeof mockTeams;
  players: typeof enrichedMockPlayers;
};

export const createDefaultGlobalDb = (): GlobalDb => ({
  version: new Date().toISOString(),
  leagues: mockLeagues,
  teams: mockTeams,
  players: enrichedMockPlayers,
});

export const readGlobalDb = (): GlobalDb => {
  if (typeof window === "undefined") return createDefaultGlobalDb();
  const raw = window.localStorage.getItem(GLOBAL_DB_KEY);
  if (!raw) return createDefaultGlobalDb();
  try {
    const parsed = JSON.parse(raw) as GlobalDb;
    return parsed && Array.isArray(parsed.leagues) && Array.isArray(parsed.teams) && Array.isArray(parsed.players)
      ? parsed
      : createDefaultGlobalDb();
  } catch {
    return createDefaultGlobalDb();
  }
};

export const writeGlobalDb = (db: GlobalDb): void => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(GLOBAL_DB_KEY, JSON.stringify(db));
};
