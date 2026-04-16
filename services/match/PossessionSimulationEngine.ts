import { MatchEvent } from "@/types/liveMatch";
import { LineupPlayer, MatchSession, PendingFreeThrow, ScoreEvent, TeamTactics } from "@/types/matchSession";

type PossessionAction = "pick-and-roll" | "isolation" | "drive" | "catch-and-shoot" | "post-up" | "turnover" | "foul";

export type PossessionResult = {
  timeConsumed: number;
  pointsScored: number;
  scoringTeamId?: string;
  nextPossessionTeamId: string;
  shotClockRemaining: number;
  action: PossessionAction;
  offensiveRebound: boolean;
  turnover: boolean;
  foulCommitted: boolean;
  events: MatchEvent[];
  scoreEvents: ScoreEvent[];
  pendingFreeThrow?: PendingFreeThrow | null;
  updatedOffense: LineupPlayer[];
  updatedDefense: LineupPlayer[];
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const avg = (values: number[]) => (values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0);

const pickRandom = <T>(list: T[], random: () => number) => list[Math.floor(random() * list.length)] ?? list[0];

const offensiveAction = (tactics: TeamTactics, random: () => number): PossessionAction => {
  const table: Array<{ action: PossessionAction; weight: number }> = [
    { action: "pick-and-roll", weight: tactics.offenseFocus === "balanced" ? 0.22 : 0.18 },
    { action: "isolation", weight: tactics.offenseFocus === "mid" ? 0.24 : 0.16 },
    { action: "drive", weight: tactics.offenseFocus === "paint" ? 0.3 : 0.18 },
    { action: "catch-and-shoot", weight: tactics.offenseFocus === "three" ? 0.3 : 0.17 },
    { action: "post-up", weight: tactics.offenseFocus === "paint" ? 0.22 : 0.14 },
    { action: "turnover", weight: 0.08 + tactics.pressure * 0.05 },
    { action: "foul", weight: 0.06 },
  ];
  const total = table.reduce((sum, item) => sum + item.weight, 0);
  const roll = random() * total;
  let cursor = 0;
  for (const item of table) {
    cursor += item.weight;
    if (roll <= cursor) return item.action;
  }
  return "pick-and-roll";
};

const teamSkill = (lineup: LineupPlayer[]) => ({
  shooting: avg(lineup.map((p) => p.macroRatings.shooting_rating)),
  finishing: avg(lineup.map((p) => p.attributes.shooting.close_shot + p.attributes.physical.body_control)) / 2,
  passing: avg(lineup.map((p) => p.macroRatings.passing_rating)),
  defense: avg(lineup.map((p) => p.macroRatings.defending_rating)),
  rebounding: avg(lineup.map((p) => p.attributes.physical.vertical + p.attributes.physical.strength + p.attributes.defending.defensive_awareness)) / 3,
  fatiguePenalty: clamp(1 - avg(lineup.map((p) => p.stamina)) / 140, 0.2, 0.55),
});

export const runPossession = (params: {
  session: MatchSession;
  offensiveTeamId: string;
  offenseLineup: LineupPlayer[];
  defenseLineup: LineupPlayer[];
  offenseTactics: TeamTactics;
  defenseTactics: TeamTactics;
  random: () => number;
  elapsedSeconds: number;
  quarterClock: number;
}): PossessionResult => {
  const { session, offensiveTeamId, random } = params;
  const defensiveTeamId = offensiveTeamId === session.userTeamId ? session.opponentTeamId : session.userTeamId;
  const action = offensiveAction(params.offenseTactics, random);
  const offense = teamSkill(params.offenseLineup);
  const defense = teamSkill(params.defenseLineup);
  const scorer = pickRandom(params.offenseLineup, random);

  const paceScale = params.offenseTactics.pace === "fast" ? 0.85 : params.offenseTactics.pace === "slow" ? 1.15 : 1;
  const timeConsumed = clamp((8 + random() * 10) * paceScale, 5, 24);
  const clutchBoost = session.quarter === 4 && params.quarterClock <= 120 ? 0.04 : 0;
  const momentumBoost = clamp((session.emotion.momentum / 100) * (offensiveTeamId === session.userTeamId ? 1 : -1), -0.07, 0.07);
  const pressureLoad = clamp(session.telemetry.pressure / 100 + (session.quarter === 4 && params.quarterClock <= 90 ? 0.12 : 0), 0, 1);

  const contestPenalty = (params.defenseTactics.defenseType === "zone" ? 0.02 : 0) + params.defenseTactics.pressure * 0.03;
  const turnoverRisk = clamp(0.09 + (defense.defense - offense.passing) / 300 + params.defenseTactics.pressure * 0.08 + pressureLoad * 0.07, 0.05, 0.34);
  const foulRisk = clamp(0.08 + params.defenseTactics.pressure * 0.04, 0.04, 0.18);

  let pointsScored = 0;
  let turnover = false;
  let foulCommitted = false;
  let offensiveRebound = false;
  const events: MatchEvent[] = [];
  const scoreEvents: ScoreEvent[] = [];
  let pendingFreeThrow: PendingFreeThrow | null = null;

  const pickAssister = () => {
    const options = params.offenseLineup.filter((player) => player.playerId !== scorer.playerId);
    return options.length ? pickRandom(options, random) : null;
  };

  if (action === "turnover" || random() < turnoverRisk) {
    turnover = true;
    events.push({ id: `ev-tov-${Date.now()}-${Math.floor(random() * 99999)}`, fixtureId: session.fixtureId, second: params.elapsedSeconds, teamId: offensiveTeamId, playerName: scorer.playerName, type: "TURNOVER", text: `${scorer.playerName} turns it over under pressure.` });
  } else {
    const shotType = action === "catch-and-shoot" ? 3 : (action === "isolation" && random() < 0.35 ? 3 : 2);
    const baseMake = shotType === 3 ? 0.33 : 0.5;
    const skillMod = ((shotType === 3 ? offense.shooting : offense.finishing) - defense.defense) / 220;
    const fatigueMod = -offense.fatiguePenalty * 0.15;
    const forgivenessCompression = pressureLoad * 0.06;
    const makeChance = clamp(baseMake + skillMod + fatigueMod - contestPenalty + clutchBoost + momentumBoost - forgivenessCompression, 0.2, 0.78);
    const made = random() < makeChance;

    if (made) {
      pointsScored = shotType;
      const assisted = random() > 0.42;
      const assister = assisted ? pickAssister() : null;
      const shotTypeLabel: ScoreEvent["shotType"] = shotType === 3
        ? "three_pointer"
        : action === "post-up"
          ? "putback"
          : action === "drive"
            ? "layup"
            : "midrange";
      events.push({ id: `ev-made-${Date.now()}-${Math.floor(random() * 99999)}`, fixtureId: session.fixtureId, second: params.elapsedSeconds, teamId: offensiveTeamId, playerName: scorer.playerName, type: shotType === 3 ? "3PT_MADE" : "2PT_MADE", text: `${scorer.playerName} scores on ${action}.` });
      scoreEvents.push({
        id: `score-${Date.now()}-${Math.floor(random() * 99999)}`,
        teamId: offensiveTeamId,
        playerId: scorer.playerId,
        playerName: scorer.playerName,
        points: shotType as 2 | 3,
        shotType: shotTypeLabel,
        assisted,
        assisterPlayerId: assister?.playerId,
        assisterPlayerName: assister?.playerName,
        foulDrawn: false,
        clock: Math.round(params.quarterClock),
        quarter: session.quarter,
        momentumDelta: shotType === 3 ? 5 : 3,
        tacticTag: params.offenseTactics.offenseFocus,
        possessionContext: action === "drive" ? "fast-break" : offensiveRebound ? "second-chance" : "half-court",
      });
    } else {
      events.push({ id: `ev-miss-${Date.now()}-${Math.floor(random() * 99999)}`, fixtureId: session.fixtureId, second: params.elapsedSeconds, teamId: offensiveTeamId, playerName: scorer.playerName, type: shotType === 3 ? "3PT_ATTEMPT_MISS" : "2PT_ATTEMPT_MISS", text: `${scorer.playerName} misses a ${shotType === 3 ? "three" : "two"}.` });
      const reboundChance = clamp(0.22 + (offense.rebounding - defense.rebounding) / 300 + params.offenseTactics.reboundingFocus * 0.08, 0.12, 0.42);
      offensiveRebound = random() < reboundChance;
      events.push({
        id: `ev-reb-${Date.now()}-${Math.floor(random() * 99999)}`,
        fixtureId: session.fixtureId,
        second: params.elapsedSeconds,
        teamId: offensiveRebound ? offensiveTeamId : defensiveTeamId,
        type: offensiveRebound ? "OFF_REBOUND" : "DEF_REBOUND",
        text: offensiveRebound ? "Offensive board keeps the possession alive." : "Defensive rebound ends the possession.",
      });
    }

    if (action === "foul" || random() < foulRisk) {
      foulCommitted = true;
      const defender = pickRandom(params.defenseLineup, random);
      defender.fouls += 1;
      events.push({ id: `ev-foul-${Date.now()}-${Math.floor(random() * 99999)}`, fixtureId: session.fixtureId, second: params.elapsedSeconds, teamId: defensiveTeamId, playerName: defender.playerName, type: "FOUL", text: `${defender.playerName} commits a defensive foul.` });
      if (!pointsScored) {
        const attempts: 1 | 2 | 3 = action === "catch-and-shoot" ? 3 : 2;
        pendingFreeThrow = { teamId: offensiveTeamId, attempts, foulType: "shooting", drawnByPlayerId: scorer.playerId };
      } else if (pointsScored === 2 && random() < 0.32) {
        pendingFreeThrow = { teamId: offensiveTeamId, attempts: 1, foulType: "and_one", drawnByPlayerId: scorer.playerId };
      }
    }
  }

  const nextPossessionTeamId = pointsScored > 0 || turnover || !offensiveRebound ? defensiveTeamId : offensiveTeamId;
  const shotClockRemaining = offensiveRebound ? 14 : 24;

  return {
    timeConsumed,
    pointsScored,
    scoringTeamId: pointsScored > 0 ? offensiveTeamId : undefined,
    nextPossessionTeamId,
    shotClockRemaining,
    action,
    offensiveRebound,
    turnover,
    foulCommitted,
    events,
    scoreEvents,
    pendingFreeThrow,
    updatedOffense: params.offenseLineup.map((player) => ({ ...player, stamina: clamp(player.stamina - timeConsumed * 0.11, 42, 100) })),
    updatedDefense: params.defenseLineup.map((player) => ({ ...player, stamina: clamp(player.stamina - timeConsumed * 0.09, 42, 100) })),
  };
};
