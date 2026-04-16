import { MatchEventType } from "@/types/liveMatch";
import { FeedbackBuildParams, FeedbackSnapshot, FeedbackState, GameEvent, PlayerFX } from "@/types/feedback";
import { LineupPlayer } from "@/types/matchSession";

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const normalizeSigned = (value: number) => clamp(value / 100, -1, 1);
const normalize = (value: number) => clamp(value / 100, 0, 1);

const hashSeed = (value: string) => value.split("").reduce((sum, char, idx) => sum + char.charCodeAt(0) * (idx + 1), 0);

export const mapMatchEventToGameEvent = (eventType: MatchEventType): GameEvent | null => {
  if (eventType === "TURNOVER" || eventType === "STEAL") return "turnover";
  if (eventType === "TIMEOUT") return "timeout";
  if (eventType === "BLOCK") return "block";
  if (eventType === "FOUL" || eventType === "SHOOTING_FOUL") return "foul";
  if (eventType === "2PT_MADE" || eventType === "3PT_MADE" || eventType === "FREE_THROW_MADE") return "score_run";
  return null;
};

export function buildFeedbackSnapshot(params: FeedbackBuildParams): FeedbackSnapshot {
  const { session, userTeamId } = params;
  const fixture = session.fixtures.find((item) => item.isUserMatch);
  const scoreDiff = fixture ? Math.abs(fixture.homeScore - fixture.awayScore) : Math.abs(session.score.user - session.score.opponent);
  const userIsHome = fixture ? fixture.homeTeamId === userTeamId : true;
  const lateSeason = session.round >= 10 ? 0.14 : 0.04;
  const closeGameWeight = scoreDiff <= 5 ? 0.18 : scoreDiff <= 10 ? 0.1 : 0.04;
  const runPressure = Math.abs(session.momentum.currentRun.points) >= 8 ? 0.09 : 0.02;

  const rivalrySeed = (hashSeed(`${fixture?.homeTeamId ?? "home"}:${fixture?.awayTeamId ?? "away"}`) % 100) / 100;
  const rivalryIntensity = clamp(0.18 + rivalrySeed * 0.55 + (session.round > 8 ? 0.1 : 0) + closeGameWeight * 0.2, 0, 1);
  const homeAdvantage = clamp((userIsHome ? 0.55 : 0.35) + normalize(session.emotion.crowdIntensity) * 0.25, 0, 1);

  const basePressure = normalize(session.telemetry.pressure);
  const pressure = clamp(basePressure * 0.62 + lateSeason + closeGameWeight + runPressure + (userIsHome ? 0 : 0.06), 0, 1);
  const morale = clamp(normalize(session.telemetry.managerMorale) + normalizeSigned(session.emotion.momentum) * 0.2, 0, 1);
  const crowdIntensity = clamp(normalize(session.emotion.crowdIntensity) + rivalryIntensity * 0.12 + (scoreDiff <= 6 ? 0.08 : 0), 0, 1);
  const momentum = clamp(normalizeSigned(session.emotion.momentum) * (1 + rivalryIntensity * 0.15), -1, 1);

  const state: FeedbackState = {
    momentum,
    crowdIntensity,
    pressure,
    morale,
    rivalryIntensity,
    homeAdvantage,
  };

  const crowdState = crowdIntensity > 0.86 ? "explosive" : crowdIntensity > 0.62 ? "engaged" : pressure > 0.7 ? "tense" : "calm";
  const benchState = morale > 0.76 ? "hyped" : morale > 0.55 ? "supportive" : pressure > 0.72 ? "frustrated" : "neutral";
  const arenaProfile = {
    lightingIntensity: clamp(0.65 + crowdIntensity * 0.35, 0, 1),
    crowdHostility: clamp((userIsHome ? 0.25 : 0.55) + rivalryIntensity * 0.35, 0, 1),
    refereeBias: clamp((userIsHome ? 0.58 : 0.42) + (homeAdvantage - 0.5) * 0.2, 0, 1),
  };

  const tacticConfig = params.tactics ?? session.userTeamConfig;
  const offenseSpacing = tacticConfig.pace === "fast" ? "wide" : tacticConfig.offenseFocus === "paint" ? "tight" : tacticConfig.offenseFocus === "three" ? "arc" : "balanced";
  const defenseOverlay = tacticConfig.defenseType === "zone" ? "zone-shapes" : "man-lines";

  const mappedEvents = (params.recentEvents ?? []).map((event) => mapMatchEventToGameEvent(event.type as MatchEventType)).filter(Boolean) as GameEvent[];
  const clutchEvent = (params.recentEvents ?? []).some((event) => (event.type === "2PT_MADE" || event.type === "3PT_MADE") && session.quarter === 4 && session.timeRemaining <= 90);
  const audioCues = [
    crowdState === "explosive" ? "crowd_roar_up" : crowdState === "tense" ? "crowd_anxiety_loop" : "crowd_bedroom_mix",
    pressure > 0.76 ? "heartbeat_subtle" : "no_heartbeat",
    mappedEvents.includes("turnover") ? "turnover_sting" : "neutral_tick",
  ];

  const eventCallouts = [
    rivalryIntensity > 0.72 ? "Rivalry Game" : "",
    pressure > 0.7 ? "High Stakes Match" : "",
    clutchEvent ? "Clutch Possession" : "",
  ].filter(Boolean);

  return {
    state,
    crowdState,
    benchState,
    arenaProfile,
    tacticalOverlay: {
      offenseSpacing,
      defenseOverlay,
      animationIntensity: clamp(0.4 + Math.abs(momentum) * 0.5 + crowdIntensity * 0.2, 0, 1),
    },
    hudPulse: clamp(0.4 + pressure * 0.35 + Math.abs(momentum) * 0.3, 0, 1),
    cameraShake: clamp(Math.abs(momentum) * 0.45 + (clutchEvent ? 0.15 : 0), 0, 0.6),
    transitionSpeedMultiplier: clamp(0.85 + Math.max(0, momentum) * 0.35 + crowdIntensity * 0.2, 0.75, 1.5),
    anxietyTint: clamp(pressure * 0.65, 0, 0.85),
    audioCues,
    eventCallouts,
  };
}

export function resolvePlayerFX(player: LineupPlayer, snapshot: FeedbackSnapshot, playerRecentEvents: Array<{ type: string }>): PlayerFX {
  const shootingRating = player.macroRatings?.shooting_rating ?? 50;
  const isStar = player.overall >= 84;
  const hotEvents = playerRecentEvents.filter((event) => event.type === "2PT_MADE" || event.type === "3PT_MADE" || event.type === "FREE_THROW_MADE").length;
  const coldEvents = playerRecentEvents.filter((event) => event.type === "TURNOVER" || event.type === "2PT_ATTEMPT_MISS" || event.type === "3PT_ATTEMPT_MISS").length;
  const hotStreak = hotEvents >= 2;
  const coldStreak = coldEvents >= 2;

  return {
    glowIntensity: clamp((shootingRating / 100) * 0.35 + (isStar ? 0.35 : 0.16) + Math.max(0, snapshot.state.momentum) * 0.2, 0.1, 1),
    pulseSpeed: hotStreak ? 1.45 : snapshot.state.pressure > 0.75 ? 1.15 : 0.85,
    highlightColor: coldStreak ? "#94a3b8" : isStar ? "#facc15" : shootingRating >= 75 ? "#22d3ee" : "#a5b4fc",
    desaturation: coldStreak ? 0.55 : 0,
  };
}
