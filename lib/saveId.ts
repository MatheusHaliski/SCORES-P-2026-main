const NEW_SAVE_PREFIX = "newsave";

export const createNewSaveId = ({ leagueId, teamId, seed }: { leagueId: string; teamId: string; seed?: string | number }) => {
  const safeSeed = String(seed ?? Date.now());
  return `${NEW_SAVE_PREFIX}__${leagueId}__${teamId}__${safeSeed}`;
};

export const parseNewSaveId = (saveId: string) => {
  if (!saveId.startsWith(`${NEW_SAVE_PREFIX}__`)) return null;
  const [, leagueId, teamId, seed] = saveId.split("__");
  if (!leagueId || !teamId || !seed) return null;
  return { leagueId, teamId, seed };
};
