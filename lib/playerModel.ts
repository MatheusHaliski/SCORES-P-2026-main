import { calculateMacroRatings, calculateOverallRating, EMPTY_PLAYER_ATTRIBUTES, mapLegacyAttributesToNewModel, PlayerAttributes } from "@/lib/playerRatings";
import { Player } from "@/types/game";

type LegacyCompatiblePlayer = Partial<Player> & {
  [key: string]: unknown;
};

const pickNumber = (value: unknown, fallback: number) => (typeof value === "number" ? value : fallback);

export function toModernPlayerModel(player: LegacyCompatiblePlayer): Player {
  const legacyAttributes = (player.attributes && typeof player.attributes === "object" ? player.attributes : {}) as Record<string, number>;

  const hasNewModel = !!legacyAttributes.pace && !!legacyAttributes.dribbling && !!legacyAttributes.passing;
  const attributes: PlayerAttributes = hasNewModel
    ? (legacyAttributes as unknown as PlayerAttributes)
    : mapLegacyAttributesToNewModel({
        ...legacyAttributes,
        pace: pickNumber(player.pace, 50),
        shooting: pickNumber(player.shooting, 50),
        passing: pickNumber(player.passing, 50),
        dribbling: pickNumber(player.dribbling, 50),
        defending: pickNumber(player.defending, 50),
        physical: pickNumber(player.physical, 50),
      });

  const macroRatings = player.macroRatings ?? calculateMacroRatings(attributes);

  return {
    id: String(player.id ?? "unknown-player"),
    teamId: String(player.teamId ?? "unknown-team"),
    name: String(player.name ?? "Unknown Player"),
    age: pickNumber(player.age, 22),
    position: (player.position as Player["position"]) ?? "SG",
    marketValue: pickNumber(player.marketValue, 1000000),
    physicalCondition: pickNumber(player.physicalCondition, attributes.physical.stamina),
    attributes: attributes ?? EMPTY_PLAYER_ATTRIBUTES,
    macroRatings,
    overall: pickNumber(player.overall, calculateOverallRating(attributes, player.position as Player["position"])),
    playstyles: Array.isArray(player.playstyles) ? player.playstyles.map((value) => String(value)) : [],
    salary: typeof player.salary === "number" ? player.salary : undefined,
    morale: player.morale as Player["morale"],
    injuryStatus: player.injuryStatus as Player["injuryStatus"],
    injuryRecoveryRounds: typeof player.injuryRecoveryRounds === "number" ? player.injuryRecoveryRounds : undefined,
    transferStatus: player.transferStatus as Player["transferStatus"],
    isTransferListed: typeof player.isTransferListed === "boolean" ? player.isTransferListed : undefined,
    isStarter: !!player.isStarter,
    isBench: !!player.isBench,
  };
}
