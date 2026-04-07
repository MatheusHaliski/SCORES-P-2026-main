import { PlayerPosition } from "@/types/game";

export type RatingValue = number;
export type MacroAttributeKey = "pace" | "dribbling" | "passing" | "shooting" | "defending" | "physical" | "mental_intangibles";

export type PlayerAttributes = {
  pace: {
    speed: RatingValue;
    acceleration: RatingValue;
    agility: RatingValue;
    reaction_time: RatingValue;
    off_ball_movement: RatingValue;
  };
  dribbling: {
    ball_control: RatingValue;
    handle_creativity: RatingValue;
    tight_dribble: RatingValue;
    change_of_pace_control: RatingValue;
    drive_control: RatingValue;
  };
  passing: {
    passing_accuracy: RatingValue;
    passing_speed: RatingValue;
    court_vision: RatingValue;
    decision_making: RatingValue;
    playmaking_iq: RatingValue;
  };
  shooting: {
    close_shot: RatingValue;
    mid_range_shot: RatingValue;
    three_point_shot: RatingValue;
    free_throw: RatingValue;
    shot_release_timing: RatingValue;
    shot_under_pressure: RatingValue;
  };
  defending: {
    on_ball_defense: RatingValue;
    perimeter_defense: RatingValue;
    interior_defense: RatingValue;
    steal_ability: RatingValue;
    block_ability: RatingValue;
    defensive_awareness: RatingValue;
  };
  physical: {
    strength: RatingValue;
    vertical: RatingValue;
    stamina: RatingValue;
    durability: RatingValue;
    balance: RatingValue;
    body_control: RatingValue;
  };
  mental_intangibles: {
    clutch_factor: RatingValue;
    consistency: RatingValue;
    confidence: RatingValue;
    leadership: RatingValue;
    game_iq: RatingValue;
  };
};

export type MacroRatings = {
  pace_rating: number;
  dribbling_rating: number;
  passing_rating: number;
  shooting_rating: number;
  defending_rating: number;
  physical_rating: number;
  mental_rating: number;
};

export type MacroWeights = Record<MacroAttributeKey, number>;

export const DEFAULT_OVERALL_WEIGHTS: MacroWeights = {
  pace: 0.14,
  dribbling: 0.14,
  passing: 0.14,
  shooting: 0.18,
  defending: 0.16,
  physical: 0.14,
  mental_intangibles: 0.1,
};

export const POSITION_OVERALL_WEIGHT_OVERRIDES: Partial<Record<PlayerPosition, Partial<MacroWeights>>> = {
  PG: { passing: 0.2, dribbling: 0.18, pace: 0.16, mental_intangibles: 0.12, shooting: 0.14, defending: 0.11, physical: 0.09 },
  SG: { shooting: 0.22, dribbling: 0.17, pace: 0.15, passing: 0.12, defending: 0.14, physical: 0.11, mental_intangibles: 0.09 },
  SF: { shooting: 0.18, defending: 0.17, physical: 0.16, pace: 0.13, dribbling: 0.12, passing: 0.12, mental_intangibles: 0.12 },
  PF: { physical: 0.2, defending: 0.2, shooting: 0.14, pace: 0.11, dribbling: 0.1, passing: 0.11, mental_intangibles: 0.14 },
  C: { defending: 0.24, physical: 0.24, pace: 0.08, dribbling: 0.07, passing: 0.1, shooting: 0.13, mental_intangibles: 0.14 },
};

const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(value)));
const avg = (numbers: number[]) => (numbers.length ? numbers.reduce((sum, value) => sum + value, 0) / numbers.length : 0);

export const EMPTY_PLAYER_ATTRIBUTES: PlayerAttributes = {
  pace: { speed: 50, acceleration: 50, agility: 50, reaction_time: 50, off_ball_movement: 50 },
  dribbling: { ball_control: 50, handle_creativity: 50, tight_dribble: 50, change_of_pace_control: 50, drive_control: 50 },
  passing: { passing_accuracy: 50, passing_speed: 50, court_vision: 50, decision_making: 50, playmaking_iq: 50 },
  shooting: { close_shot: 50, mid_range_shot: 50, three_point_shot: 50, free_throw: 50, shot_release_timing: 50, shot_under_pressure: 50 },
  defending: { on_ball_defense: 50, perimeter_defense: 50, interior_defense: 50, steal_ability: 50, block_ability: 50, defensive_awareness: 50 },
  physical: { strength: 50, vertical: 50, stamina: 50, durability: 50, balance: 50, body_control: 50 },
  mental_intangibles: { clutch_factor: 50, consistency: 50, confidence: 50, leadership: 50, game_iq: 50 },
};

export function validateAndNormalizeAttributes(input: PlayerAttributes): PlayerAttributes {
  return {
    pace: Object.fromEntries(Object.entries(input.pace).map(([k, v]) => [k, clamp(v)])) as PlayerAttributes["pace"],
    dribbling: Object.fromEntries(Object.entries(input.dribbling).map(([k, v]) => [k, clamp(v)])) as PlayerAttributes["dribbling"],
    passing: Object.fromEntries(Object.entries(input.passing).map(([k, v]) => [k, clamp(v)])) as PlayerAttributes["passing"],
    shooting: Object.fromEntries(Object.entries(input.shooting).map(([k, v]) => [k, clamp(v)])) as PlayerAttributes["shooting"],
    defending: Object.fromEntries(Object.entries(input.defending).map(([k, v]) => [k, clamp(v)])) as PlayerAttributes["defending"],
    physical: Object.fromEntries(Object.entries(input.physical).map(([k, v]) => [k, clamp(v)])) as PlayerAttributes["physical"],
    mental_intangibles: Object.fromEntries(Object.entries(input.mental_intangibles).map(([k, v]) => [k, clamp(v)])) as PlayerAttributes["mental_intangibles"],
  };
}

export function calculateMacroRatings(attributes: PlayerAttributes): MacroRatings {
  const normalized = validateAndNormalizeAttributes(attributes);
  return {
    pace_rating: clamp(avg(Object.values(normalized.pace))),
    dribbling_rating: clamp(avg(Object.values(normalized.dribbling))),
    passing_rating: clamp(avg(Object.values(normalized.passing))),
    shooting_rating: clamp(avg(Object.values(normalized.shooting))),
    defending_rating: clamp(avg(Object.values(normalized.defending))),
    physical_rating: clamp(avg(Object.values(normalized.physical))),
    mental_rating: clamp(avg(Object.values(normalized.mental_intangibles))),
  };
}

export function resolveOverallWeights(position?: PlayerPosition, baseWeights: MacroWeights = DEFAULT_OVERALL_WEIGHTS): MacroWeights {
  const override = (position && POSITION_OVERALL_WEIGHT_OVERRIDES[position]) || {};
  const merged: MacroWeights = {
    pace: override.pace ?? baseWeights.pace,
    dribbling: override.dribbling ?? baseWeights.dribbling,
    passing: override.passing ?? baseWeights.passing,
    shooting: override.shooting ?? baseWeights.shooting,
    defending: override.defending ?? baseWeights.defending,
    physical: override.physical ?? baseWeights.physical,
    mental_intangibles: override.mental_intangibles ?? baseWeights.mental_intangibles,
  };
  const total = Object.values(merged).reduce((sum, value) => sum + value, 0);
  return Object.fromEntries(Object.entries(merged).map(([k, v]) => [k, v / total])) as MacroWeights;
}

export function calculateOverallRating(attributes: PlayerAttributes, position?: PlayerPosition, baseWeights: MacroWeights = DEFAULT_OVERALL_WEIGHTS): number {
  const macro = calculateMacroRatings(attributes);
  const weights = resolveOverallWeights(position, baseWeights);
  return clamp(
    macro.pace_rating * weights.pace +
    macro.dribbling_rating * weights.dribbling +
    macro.passing_rating * weights.passing +
    macro.shooting_rating * weights.shooting +
    macro.defending_rating * weights.defending +
    macro.physical_rating * weights.physical +
    macro.mental_rating * weights.mental_intangibles,
  );
}

export type LegacyAttributes = Partial<Record<string, number>>;

/**
 * Legacy mapper: old saves had mixed fields (pace/shooting/pass/vision/athleticism/etc).
 * We conservatively map to the new schema and fallback to neutral values to avoid runtime breaks.
 */
export function mapLegacyAttributesToNewModel(legacy: LegacyAttributes = {}): PlayerAttributes {
  const paceBase = legacy.pace ?? legacy.speed ?? 50;
  const shootBase = legacy.shooting ?? legacy.finishing ?? 50;
  const passBase = legacy.passing ?? legacy.vision ?? 50;
  const dribbleBase = legacy.dribbling ?? legacy.ballControl ?? 50;
  const defendBase = legacy.defending ?? legacy.defense ?? legacy.defensiveAwareness ?? 50;
  const physicalBase = legacy.physical ?? legacy.athleticism ?? legacy.strength ?? 50;
  const iqBase = legacy.game_iq ?? legacy.iq ?? legacy.composure ?? 50;

  return validateAndNormalizeAttributes({
    pace: {
      speed: legacy.speed ?? legacy.sprintSpeed ?? paceBase,
      acceleration: legacy.acceleration ?? legacy.quickness ?? paceBase,
      agility: legacy.agility ?? legacy.quickness ?? paceBase,
      reaction_time: legacy.reaction_time ?? legacy.reaction ?? iqBase,
      off_ball_movement: legacy.off_ball_movement ?? legacy.positioning ?? paceBase,
    },
    dribbling: {
      ball_control: legacy.ballControl ?? dribbleBase,
      handle_creativity: legacy.handle_creativity ?? dribbleBase,
      tight_dribble: legacy.tight_dribble ?? dribbleBase,
      change_of_pace_control: legacy.change_of_pace_control ?? legacy.quickness ?? paceBase,
      drive_control: legacy.drive_control ?? legacy.finishing ?? dribbleBase,
    },
    passing: {
      passing_accuracy: legacy.passing_accuracy ?? legacy.shortPass ?? passBase,
      passing_speed: legacy.passing_speed ?? legacy.longPass ?? passBase,
      court_vision: legacy.court_vision ?? legacy.vision ?? passBase,
      decision_making: legacy.decision_making ?? iqBase,
      playmaking_iq: legacy.playmaking_iq ?? legacy.iq ?? iqBase,
    },
    shooting: {
      close_shot: legacy.close_shot ?? legacy.finishing ?? shootBase,
      mid_range_shot: legacy.mid_range_shot ?? legacy.shotPower ?? shootBase,
      three_point_shot: legacy.three_point_shot ?? legacy.three ?? legacy.longShots ?? shootBase,
      free_throw: legacy.free_throw ?? shootBase,
      shot_release_timing: legacy.shot_release_timing ?? iqBase,
      shot_under_pressure: legacy.shot_under_pressure ?? legacy.composure ?? iqBase,
    },
    defending: {
      on_ball_defense: legacy.on_ball_defense ?? defendBase,
      perimeter_defense: legacy.perimeter_defense ?? defendBase,
      interior_defense: legacy.interior_defense ?? defendBase,
      steal_ability: legacy.steal_ability ?? legacy.interceptions ?? defendBase,
      block_ability: legacy.block_ability ?? defendBase,
      defensive_awareness: legacy.defensive_awareness ?? legacy.defensiveAwareness ?? defendBase,
    },
    physical: {
      strength: legacy.strength ?? physicalBase,
      vertical: legacy.vertical ?? legacy.athleticism ?? physicalBase,
      stamina: legacy.stamina ?? physicalBase,
      durability: legacy.durability ?? physicalBase,
      balance: legacy.balance ?? legacy.agility ?? physicalBase,
      body_control: legacy.body_control ?? legacy.athleticism ?? physicalBase,
    },
    mental_intangibles: {
      clutch_factor: legacy.clutch_factor ?? iqBase,
      consistency: legacy.consistency ?? iqBase,
      confidence: legacy.confidence ?? iqBase,
      leadership: legacy.leadership ?? iqBase,
      game_iq: legacy.game_iq ?? legacy.iq ?? iqBase,
    },
  });
}
