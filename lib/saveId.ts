const NEW_SAVE_PREFIX = "newsave";

const encodeSegment = (value: string) => encodeURIComponent(value.trim()).replace(/__/g, "_");
const decodeSegment = (value: string) => decodeURIComponent(value);

export const createNewSaveId = ({
  leagueId,
  teamId,
  seed,
  managerName,
  saveName,
}: {
  leagueId: string;
  teamId: string;
  seed?: string | number;
  managerName?: string;
  saveName?: string;
}) => {
  const safeSeed = String(seed ?? Date.now());
  const pieces = [`${NEW_SAVE_PREFIX}`, leagueId, teamId, safeSeed];

  if (managerName?.trim()) {
    pieces.push(`m:${encodeSegment(managerName)}`);
  }

  if (saveName?.trim()) {
    pieces.push(`s:${encodeSegment(saveName)}`);
  }

  return pieces.join("__");
};

export const parseNewSaveId = (saveId: string) => {
  if (!saveId.startsWith(`${NEW_SAVE_PREFIX}__`)) return null;
  const [, leagueId, teamId, seed, ...extraSegments] = saveId.split("__");
  if (!leagueId || !teamId || !seed) return null;

  const extras = extraSegments.reduce<{ managerName?: string; saveName?: string }>((acc, segment) => {
    if (segment.startsWith("m:")) {
      acc.managerName = decodeSegment(segment.slice(2));
      return acc;
    }

    if (segment.startsWith("s:")) {
      acc.saveName = decodeSegment(segment.slice(2));
      return acc;
    }

    return acc;
  }, {});

  return { leagueId, teamId, seed, ...extras };
};
