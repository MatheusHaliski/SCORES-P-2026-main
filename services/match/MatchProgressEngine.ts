import { MatchEvent } from "@/types/liveMatch";
import { LineupPlayer, MatchSession } from "@/types/matchSession";
import { QuarterFlowEngine } from "@/services/match/QuarterFlowEngine";
import { getSimulationPaceProfile, SimulationSpeedOption } from "@/app/lib/simulationConfig";
import { QuarterRecapEngine } from "@/services/match/QuarterRecapEngine";
import { runPossession } from "@/services/match/PossessionSimulationEngine";

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const formatClock = (seconds: number) => {
  const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
  const secs = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${mins}:${secs}`;
};

const withAutoSubstitutions = (lineup: LineupPlayer[], bench: LineupPlayer[], quarter: number) => {
  const nextLineup = [...lineup];
  const nextBench = [...bench];
  const substitutionEvents: MatchEvent[] = [];

  nextLineup.forEach((starter, index) => {
    const shouldSub = starter.stamina < 56 || starter.fouls >= 5 || (quarter >= 4 && starter.stamina < 62);
    if (!shouldSub) return;
    const replacementIndex = nextBench.findIndex((candidate) => candidate.injuryStatus !== "Lesionado" && candidate.stamina > starter.stamina + 8 && candidate.fouls < 5);
    if (replacementIndex < 0) return;

    const replacement = { ...nextBench[replacementIndex], isStarter: true };
    nextBench[replacementIndex] = { ...starter, isStarter: false };
    nextLineup[index] = replacement;
    substitutionEvents.push({
      id: `ev-auto-sub-${Date.now()}-${starter.playerId}`,
      fixtureId: "fixture-user",
      second: 0,
      teamId: "",
      type: "SUBSTITUTION",
      text: `Auto-sub: ${starter.playerName} out, ${replacement.playerName} in.`,
    });
  });

  return { lineup: nextLineup, bench: nextBench, substitutionEvents };
};

export class MatchProgressEngine {
  tick(
    session: MatchSession,
    simulatedSecondsPerTick: number,
    random: () => number,
    simulationSpeed: SimulationSpeedOption["id"] = "normal",
  ): MatchSession {
    if (!QuarterFlowEngine.isLivePhase(session.phase)) return session;

    const userFixture = session.fixtures.find((fixture) => fixture.isUserMatch);
    if (!userFixture) return session;

    const pace = getSimulationPaceProfile(simulationSpeed);
    let timeRemaining = session.timeRemaining;
    let possessionTeamId = session.possessionTeamId;
    let shotClockRemaining = session.shotClockRemaining;
    let userLineup = [...session.userLineup];
    let oppLineup = [...session.opponentLineup];
    let userBench = [...session.userBench];
    let oppBench = [...session.opponentBench];
    let homeDelta = 0;
    let awayDelta = 0;
    let homeQuarterFouls = session.teamRuntime.home.foulsThisQuarter;
    let awayQuarterFouls = session.teamRuntime.away.foulsThisQuarter;
    const newEvents: MatchEvent[] = [];

    const possessionBudget = Math.max(1, Math.round((simulatedSecondsPerTick / 3) * pace.possessionResolutionMultiplier));

    for (let i = 0; i < possessionBudget; i += 1) {
      if (timeRemaining <= 0) break;

      const offenseIsUser = possessionTeamId === session.userTeamId;
      const result = runPossession({
        session,
        offensiveTeamId: possessionTeamId,
        offenseLineup: offenseIsUser ? userLineup : oppLineup,
        defenseLineup: offenseIsUser ? oppLineup : userLineup,
        offenseTactics: offenseIsUser ? session.userTeamConfig : session.opponentTeamConfig,
        defenseTactics: offenseIsUser ? session.opponentTeamConfig : session.userTeamConfig,
        random,
        elapsedSeconds: session.quarterDuration - timeRemaining,
        quarterClock: timeRemaining,
      });

      timeRemaining = clamp(timeRemaining - result.timeConsumed, 0, session.quarterDuration);
      shotClockRemaining = Math.max(0, shotClockRemaining - result.timeConsumed);

      if (offenseIsUser) {
        userLineup = result.updatedOffense;
        oppLineup = result.updatedDefense;
      } else {
        oppLineup = result.updatedOffense;
        userLineup = result.updatedDefense;
      }

      if (result.foulCommitted) {
        if (offenseIsUser) awayQuarterFouls += 1;
        else homeQuarterFouls += 1;
      }

      if (result.pointsScored > 0 && result.scoringTeamId) {
        const userIsHome = userFixture.homeTeamId === session.userTeamId;
        const scorerIsUser = result.scoringTeamId === session.userTeamId;
        if (scorerIsUser) {
          if (userIsHome) homeDelta += result.pointsScored;
          else awayDelta += result.pointsScored;
        } else if (userIsHome) awayDelta += result.pointsScored;
        else homeDelta += result.pointsScored;
      }

      newEvents.push(...result.events);
      possessionTeamId = result.nextPossessionTeamId;
      shotClockRemaining = result.shotClockRemaining;
    }

    const userSubs = withAutoSubstitutions(userLineup, userBench, session.quarter);
    const oppSubs = withAutoSubstitutions(oppLineup, oppBench, session.quarter);
    userLineup = userSubs.lineup;
    userBench = userSubs.bench;
    oppLineup = oppSubs.lineup;
    oppBench = oppSubs.bench;

    newEvents.push(...userSubs.substitutionEvents.map((event) => ({ ...event, fixtureId: session.fixtureId, teamId: session.userTeamId })));
    newEvents.push(...oppSubs.substitutionEvents.map((event) => ({ ...event, fixtureId: session.fixtureId, teamId: session.opponentTeamId })));

    const quarterEnded = timeRemaining <= 0;
    const nextPhase = quarterEnded ? QuarterFlowEngine.nextPhaseAfterQuarter(session.phase) : session.phase;
    const nextQuarter = QuarterFlowEngine.toQuarter(nextPhase);

    const updatedFixtures = session.fixtures.map((fixture) => {
      if (fixture.id !== userFixture.id) return fixture;
      const status: "live" | "break" | "finished" = quarterEnded ? (nextPhase === "POST_MATCH" ? "finished" : "break") : "live";
      return {
        ...fixture,
        homeScore: fixture.homeScore + homeDelta,
        awayScore: fixture.awayScore + awayDelta,
        status,
        homeFouls: quarterEnded ? 0 : clamp(homeQuarterFouls, 0, 12),
        awayFouls: quarterEnded ? 0 : clamp(awayQuarterFouls, 0, 12),
        homeLastScorer: homeDelta > 0 ? { playerName: "Team offense", minute: formatClock(timeRemaining) } : fixture.homeLastScorer,
        awayLastScorer: awayDelta > 0 ? { playerName: "Team offense", minute: formatClock(timeRemaining) } : fixture.awayLastScorer,
      };
    });

    const userFixtureAfter = updatedFixtures.find((fixture) => fixture.isUserMatch);
    const userIsHome = userFixture.homeTeamId === session.userTeamId;
    const userRunDelta = userIsHome ? homeDelta - awayDelta : awayDelta - homeDelta;
    const forcedStops = newEvents.filter((event) => event.type === "TURNOVER" && event.teamId === session.opponentTeamId).length;
    const clutchPlays = newEvents.filter((event) => (event.type === "3PT_MADE" || event.type === "2PT_MADE") && timeRemaining <= 120 && session.quarter === 4).length;

    const nextMomentum = clamp(session.emotion.momentum * 0.78 + userRunDelta * 8 + forcedStops * 4 + clutchPlays * 5, -100, 100);
    const homeEdge = userIsHome ? 5 : -3;
    const nextCrowd = clamp(session.emotion.crowdIntensity * 0.82 + Math.abs(userRunDelta) * 4 + clutchPlays * 6 + homeEdge, 20, 100);
    const tacticalDiscipline = clamp(62 + Math.round((session.userTeamConfig.pressure + session.userTeamConfig.reboundingFocus) * 12), 40, 99);
    const managerMorale = clamp(50 + Math.round((nextMomentum + (userFixtureAfter ? (userIsHome ? userFixtureAfter.homeScore - userFixtureAfter.awayScore : userFixtureAfter.awayScore - userFixtureAfter.homeScore) : 0)) * 0.4), 20, 98);

    const storyBanners: string[] = [];
    if (Math.abs(userRunDelta) >= 8) storyBanners.push(`${Math.abs(userRunDelta)}-0 run`);
    if (newEvents.filter((event) => event.type === "TURNOVER").length >= 2) storyBanners.push("Turnover streak");
    if (newEvents.filter((event) => event.type === "3PT_MADE").length >= 2) storyBanners.push("Hot hand");
    if (forcedStops >= 2) storyBanners.push("Defense locked in");

    const quarterRecap = quarterEnded
      ? QuarterRecapEngine.generate({
          quarter: session.quarter,
          userNetRun: userRunDelta,
          events: newEvents,
          prior: session.quarterRecap ?? [],
        })
      : session.quarterRecap ?? [];

    return {
      ...session,
      quarter: nextQuarter,
      phase: nextPhase,
      phaseState: QuarterFlowEngine.toPhaseState(nextPhase),
      timeRemaining: quarterEnded && nextPhase !== "POST_MATCH" ? session.quarterDuration : timeRemaining,
      isFinished: nextPhase === "POST_MATCH",
      fixtures: updatedFixtures,
      score: {
        user: userIsHome ? (userFixtureAfter?.homeScore ?? session.score.user) : (userFixtureAfter?.awayScore ?? session.score.user),
        opponent: userIsHome ? (userFixtureAfter?.awayScore ?? session.score.opponent) : (userFixtureAfter?.homeScore ?? session.score.opponent),
      },
      userLineup,
      userBench,
      opponentLineup: oppLineup,
      opponentBench: oppBench,
      possessionTeamId,
      shotClockRemaining: quarterEnded && nextPhase !== "POST_MATCH" ? 24 : shotClockRemaining,
      teamRuntime: {
        home: { ...session.teamRuntime.home, foulsThisQuarter: quarterEnded ? 0 : clamp(homeQuarterFouls, 0, 12) },
        away: { ...session.teamRuntime.away, foulsThisQuarter: quarterEnded ? 0 : clamp(awayQuarterFouls, 0, 12) },
      },
      emotion: {
        momentum: nextMomentum,
        crowdIntensity: nextCrowd,
      },
      momentum: {
        value: nextMomentum,
        currentRun: { teamId: userRunDelta >= 0 ? session.userTeamId : session.opponentTeamId, points: Math.abs(userRunDelta) },
      },
      crowd: {
        intensity: nextCrowd,
      },
      telemetry: {
        momentum: nextMomentum,
        crowdIntensity: nextCrowd,
        managerMorale,
        tacticalDiscipline,
        pressure: clamp((session.userTeamConfig.pressure + session.opponentTeamConfig.pressure) / 2 * 100, 0, 100),
      },
      storyBanners: storyBanners.slice(0, 3),
      recentEventTypes: [...session.recentEventTypes, ...newEvents.map((event) => event.type)].slice(-12),
      quarterRecap,
      eventFeed: [...session.eventFeed, ...newEvents].slice(-80),
      updatedAt: new Date().toISOString(),
    };
  }
}
