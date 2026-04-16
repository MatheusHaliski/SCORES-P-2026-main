import { MatchEvent } from "@/types/liveMatch";
import { InterruptionEvent, LineupPlayer, MatchSession, PendingFreeThrow, ScoreBreakdown, ScoreEvent } from "@/types/matchSession";
import { QuarterFlowEngine } from "@/services/match/QuarterFlowEngine";
import { getSimulationPaceProfile, SimulationSpeedOption } from "@/app/lib/simulationConfig";
import { QuarterRecapEngine } from "@/services/match/QuarterRecapEngine";
import { runPossession } from "@/services/match/PossessionSimulationEngine";
import { evolveInterruptionControl, interruptionAlertText, registerInterruption } from "@/services/match/InterruptionEngine";

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const formatClock = (seconds: number) => {
  const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
  const secs = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${mins}:${secs}`;
};

const applyScoreBreakdown = (
  base: ScoreBreakdown,
  scoreEvent: ScoreEvent,
  lineup: LineupPlayer[],
) => {
  const scoringPlayer = lineup.find((player) => player.playerId === scoreEvent.playerId);
  return {
    ...base,
    onePointMade: base.onePointMade + (scoreEvent.points === 1 ? 1 : 0),
    twoPointMade: base.twoPointMade + (scoreEvent.points === 2 ? 1 : 0),
    threePointMade: base.threePointMade + (scoreEvent.points === 3 ? 1 : 0),
    paintPoints: base.paintPoints + (scoreEvent.shotType === "layup" || scoreEvent.shotType === "dunk" || scoreEvent.shotType === "putback" ? scoreEvent.points : 0),
    fastBreakPoints: base.fastBreakPoints + (scoreEvent.possessionContext === "fast-break" ? scoreEvent.points : 0),
    secondChancePoints: base.secondChancePoints + (scoreEvent.possessionContext === "second-chance" ? scoreEvent.points : 0),
    benchPoints: base.benchPoints + (scoringPlayer && !scoringPlayer.isStarter ? scoreEvent.points : 0),
  };
};

const resolvePendingFreeThrows = (
  session: MatchSession,
  pending: PendingFreeThrow,
  random: () => number,
) => {
  const isUserTeam = pending.teamId === session.userTeamId;
  const lineup = isUserTeam ? session.userLineup : session.opponentLineup;
  const drawnBy = lineup.find((player) => player.playerId === pending.drawnByPlayerId);
  const selected = lineup.find((player) => player.playerId === pending.selectedShooterPlayerId);
  const bestShooter = [...lineup].sort((a, b) => (b.attributes.shooting.free_throw + b.stamina * 0.2) - (a.attributes.shooting.free_throw + a.stamina * 0.2))[0];
  const shooter = selected ?? drawnBy ?? bestShooter ?? lineup[0];
  if (!shooter) return { points: 0, scoreEvents: [] as ScoreEvent[], events: [] as MatchEvent[] };

  const scoreEvents: ScoreEvent[] = [];
  const events: MatchEvent[] = [];
  let points = 0;
  for (let attempt = 0; attempt < pending.attempts; attempt += 1) {
    const makeChance = clamp(0.58 + (shooter.attributes.shooting.free_throw - 50) / 180 + (shooter.stamina - 60) / 600, 0.45, 0.94);
    const made = random() < makeChance;
    events.push({
      id: `ev-ft-${Date.now()}-${attempt}`,
      fixtureId: session.fixtureId,
      second: session.quarterDuration - session.timeRemaining,
      teamId: pending.teamId,
      playerName: shooter.playerName,
      type: made ? "FREE_THROW_MADE" : "FREE_THROW_MISS",
      text: made ? `${shooter.playerName} knocks down the free throw.` : `${shooter.playerName} misses the free throw.`,
    });
    if (!made) continue;
    points += 1;
    scoreEvents.push({
      id: `score-ft-${Date.now()}-${attempt}`,
      teamId: pending.teamId,
      playerId: shooter.playerId,
      playerName: shooter.playerName,
      points: 1,
      shotType: "free_throw",
      assisted: false,
      foulDrawn: true,
      clock: session.timeRemaining,
      quarter: session.quarter,
      momentumDelta: 1,
      tacticTag: "free_throw_sequence",
      possessionContext: "half-court",
    });
  }
  return { points, scoreEvents, events };
};

const withAutoSubstitutions = (lineup: LineupPlayer[], bench: LineupPlayer[], quarter: number, ejectedPlayerIds: string[]) => {
  const nextLineup = [...lineup];
  const nextBench = [...bench];
  const substitutionEvents: MatchEvent[] = [];

  nextLineup.forEach((starter, index) => {
    const shouldSub = starter.stamina < 56 || starter.fouls >= 5 || (quarter >= 4 && starter.stamina < 62);
    if (!shouldSub) return;
    const replacementIndex = nextBench.findIndex((candidate) => candidate.injuryStatus !== "Lesionado" && candidate.stamina > starter.stamina + 8 && candidate.fouls < 5 && !ejectedPlayerIds.includes(candidate.playerId));
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

const forceSubstitutionForEjection = (
  lineup: LineupPlayer[],
  bench: LineupPlayer[],
  ejectedPlayerId: string,
): { lineup: LineupPlayer[]; bench: LineupPlayer[]; replacementName?: string; ejectedName?: string } => {
  const ejected = lineup.find((player) => player.playerId === ejectedPlayerId);
  if (!ejected) return { lineup, bench };
  const replacementIndex = bench.findIndex((candidate) => candidate.injuryStatus !== "Lesionado" && candidate.fouls < 6);
  if (replacementIndex < 0) return {
    lineup: lineup.filter((player) => player.playerId !== ejectedPlayerId),
    bench,
    ejectedName: ejected.playerName,
  };
  const replacement = { ...bench[replacementIndex], isStarter: true };
  const nextLineup = lineup.map((player) => (player.playerId === ejectedPlayerId ? replacement : player));
  const nextBench = bench.map((player, index) => (index === replacementIndex ? { ...ejected, isStarter: false } : player));
  return { lineup: nextLineup, bench: nextBench, replacementName: replacement.playerName, ejectedName: ejected.playerName };
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
    let interruptionControl = evolveInterruptionControl(session.interruptionControl, simulatedSecondsPerTick);
    let interruptionQueue: InterruptionEvent[] = [...session.interruptionQueue];
    let gameFlowState = session.gameFlowState;
    const ejectedPlayerIds = [...session.ejectedPlayerIds];
    const newEvents: MatchEvent[] = [];
    const scoreEvents: ScoreEvent[] = [];
    let pendingFreeThrow: PendingFreeThrow | null = session.pendingFreeThrow ?? null;
    let freeThrowState = { ...session.freeThrowState };
    const priorScoreEvents = session.scoreEvents ?? [];
    const priorHomeBreakdown = session.homeBreakdown ?? { onePointMade: 0, twoPointMade: 0, threePointMade: 0, paintPoints: 0, fastBreakPoints: 0, secondChancePoints: 0, benchPoints: 0 };
    const priorAwayBreakdown = session.awayBreakdown ?? { onePointMade: 0, twoPointMade: 0, threePointMade: 0, paintPoints: 0, fastBreakPoints: 0, secondChancePoints: 0, benchPoints: 0 };

    const freeThrowMode = session.scoringSettings?.freeThrowShooterMode ?? "auto";
    if (interruptionQueue.length > 0 && !pendingFreeThrow) {
      const current = interruptionQueue[0];
      if (current.type !== "free_throw") {
        return {
          ...session,
          interruptionControl,
          interruptionQueue: interruptionQueue.slice(1),
          gameFlowState: "interruption",
          updatedAt: new Date().toISOString(),
        };
      }
    }
    if (pendingFreeThrow) {
      gameFlowState = "free_throw";
    }
    if (pendingFreeThrow && (freeThrowMode === "auto" || pendingFreeThrow.selectedShooterPlayerId)) {
      const resolved = resolvePendingFreeThrows(session, pendingFreeThrow, random);
      newEvents.push(...resolved.events);
      scoreEvents.push(...resolved.scoreEvents);
      freeThrowState = {
        attempts: pendingFreeThrow.attempts,
        shooterPlayerId: pendingFreeThrow.selectedShooterPlayerId ?? pendingFreeThrow.drawnByPlayerId,
        isActive: false,
        quarterAttempts: freeThrowState.quarterAttempts + pendingFreeThrow.attempts,
      };
      interruptionControl = registerInterruption(interruptionControl, session.quarterDuration - timeRemaining, true);
      interruptionQueue = interruptionQueue.filter((item) => item.type !== "free_throw");
      if (resolved.points > 0) {
        const userIsHomeFt = userFixture.homeTeamId === session.userTeamId;
        const pointsForUser = pendingFreeThrow.teamId === session.userTeamId;
        if (pointsForUser) {
          if (userIsHomeFt) homeDelta += resolved.points;
          else awayDelta += resolved.points;
        } else if (userIsHomeFt) awayDelta += resolved.points;
        else homeDelta += resolved.points;
      }
      pendingFreeThrow = null;
      gameFlowState = "live";
    } else if (pendingFreeThrow) {
      freeThrowState = {
        attempts: pendingFreeThrow.attempts,
        shooterPlayerId: pendingFreeThrow.selectedShooterPlayerId,
        isActive: true,
        quarterAttempts: freeThrowState.quarterAttempts,
      };
      return {
        ...session,
        interruptionControl,
        interruptionQueue,
        gameFlowState,
        freeThrowState,
        updatedAt: new Date().toISOString(),
      };
    }

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
        quarterFreeThrowAttempts: freeThrowState.quarterAttempts,
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

      if (result.scoreEvents.length) {
        const userIsHome = userFixture.homeTeamId === session.userTeamId;
        const userPoints = result.scoreEvents.filter((event) => event.teamId === session.userTeamId).reduce((sum, event) => sum + event.points, 0);
        const opponentPoints = result.scoreEvents.reduce((sum, event) => sum + event.points, 0) - userPoints;
        if (userIsHome) {
          homeDelta += userPoints;
          awayDelta += opponentPoints;
        } else {
          awayDelta += userPoints;
          homeDelta += opponentPoints;
        }
      }

      newEvents.push(...result.events);
      scoreEvents.push(...result.scoreEvents);
      if (result.interruptionEvents.length) {
        result.interruptionEvents.forEach((item) => {
          interruptionQueue.push(item);
          interruptionControl = registerInterruption(interruptionControl, item.timestamp, item.type === "foul" || item.type === "free_throw");
          newEvents.push({
            id: `ev-int-${Date.now()}-${Math.floor(random() * 9999)}`,
            fixtureId: session.fixtureId,
            second: session.quarterDuration - timeRemaining,
            teamId: item.teamId,
            type: item.type === "timeout" ? "TIMEOUT" : item.type === "violation" ? "VIOLATION" : item.type === "ejection" ? "EJECTION" : "FOUL",
            text: interruptionAlertText(item),
          });
        });
        gameFlowState = result.interruptionEvents.some((event) => event.type === "free_throw") ? "free_throw" : "interruption";
      }
      if (!pendingFreeThrow && result.pendingFreeThrow) pendingFreeThrow = result.pendingFreeThrow;
      if (result.pendingFreeThrow) {
        freeThrowState = {
          ...freeThrowState,
          attempts: result.pendingFreeThrow.attempts,
          shooterPlayerId: result.pendingFreeThrow.selectedShooterPlayerId,
          isActive: true,
        };
      }
      possessionTeamId = result.nextPossessionTeamId;
      shotClockRemaining = result.shotClockRemaining;
      if (result.interruptionEvents.length) break;
    }

    const detectEjections = (teamId: string, lineup: LineupPlayer[], bench: LineupPlayer[]) => {
      let nextLineup = lineup;
      let nextBench = bench;
      for (const player of lineup) {
        if (player.fouls < 6 || ejectedPlayerIds.includes(player.playerId)) continue;
        ejectedPlayerIds.push(player.playerId);
        const forced = forceSubstitutionForEjection(nextLineup, nextBench, player.playerId);
        nextLineup = forced.lineup;
        nextBench = forced.bench;
        interruptionQueue.push({
          type: "ejection",
          playerId: player.playerId,
          teamId,
          severity: 1,
          timestamp: session.quarterDuration - timeRemaining,
          message: `⚠️ Player Ejected — ${forced.ejectedName ?? player.playerName} has fouled out`,
        });
        newEvents.push({
          id: `ev-eject-${Date.now()}-${player.playerId}`,
          fixtureId: session.fixtureId,
          second: session.quarterDuration - timeRemaining,
          teamId,
          playerName: player.playerName,
          type: "EJECTION",
          text: `⚠️ Player Ejected — ${forced.ejectedName ?? player.playerName} has fouled out${forced.replacementName ? `. ${forced.replacementName} enters the game.` : ""}`,
        });
        interruptionControl = registerInterruption(interruptionControl, session.quarterDuration - timeRemaining, true);
        gameFlowState = "interruption";
      }
      return { nextLineup, nextBench };
    };

    const userEjectionApplied = detectEjections(session.userTeamId, userLineup, userBench);
    userLineup = userEjectionApplied.nextLineup;
    userBench = userEjectionApplied.nextBench;
    const oppEjectionApplied = detectEjections(session.opponentTeamId, oppLineup, oppBench);
    oppLineup = oppEjectionApplied.nextLineup;
    oppBench = oppEjectionApplied.nextBench;

    const userSubs = withAutoSubstitutions(userLineup, userBench, session.quarter, ejectedPlayerIds);
    const oppSubs = withAutoSubstitutions(oppLineup, oppBench, session.quarter, ejectedPlayerIds);
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
    const userMargin = userFixtureAfter ? (userIsHome ? userFixtureAfter.homeScore - userFixtureAfter.awayScore : userFixtureAfter.awayScore - userFixtureAfter.homeScore) : 0;
    const closeGamePressure = Math.abs(userMargin) <= 5 ? 12 : Math.abs(userMargin) <= 10 ? 6 : 2;
    const seasonPressure = session.round >= 10 ? 8 : 3;
    const underPerformancePressure = userMargin < 0 ? Math.min(14, Math.abs(userMargin) * 1.2) : 0;
    const turnoverStress = Math.min(8, newEvents.filter((event) => event.type === "TURNOVER" && event.teamId === session.userTeamId).length * 3);
    const pressureMeter = clamp(
      ((session.userTeamConfig.pressure + session.opponentTeamConfig.pressure) / 2) * 100
      + closeGamePressure
      + seasonPressure
      + underPerformancePressure
      + turnoverStress,
      0,
      100,
    );

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

    if (!pendingFreeThrow && interruptionQueue.length === 0 && QuarterFlowEngine.isLivePhase(nextPhase)) {
      gameFlowState = "live";
    }

    const homeBreakdown = scoreEvents
      .filter((event) => event.teamId === userFixture.homeTeamId)
      .reduce((acc, event) => applyScoreBreakdown(acc, event, event.teamId === session.userTeamId ? userLineup : oppLineup), priorHomeBreakdown);
    const awayBreakdown = scoreEvents
      .filter((event) => event.teamId === userFixture.awayTeamId)
      .reduce((acc, event) => applyScoreBreakdown(acc, event, event.teamId === session.userTeamId ? userLineup : oppLineup), priorAwayBreakdown);

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
      scoreEvents: [...priorScoreEvents, ...scoreEvents].slice(-120),
      pendingFreeThrow,
      freeThrowState: {
        ...freeThrowState,
        isActive: !!pendingFreeThrow,
        quarterAttempts: quarterEnded ? 0 : freeThrowState.quarterAttempts,
      },
      interruptionControl,
      interruptionQueue: interruptionQueue.slice(-12),
      gameFlowState: pendingFreeThrow ? "free_throw" : gameFlowState,
      ejectedPlayerIds,
      homeBreakdown,
      awayBreakdown,
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
        pressure: pressureMeter,
      },
      storyBanners: storyBanners.slice(0, 3),
      recentEventTypes: [...session.recentEventTypes, ...newEvents.map((event) => event.type)].slice(-12),
      quarterRecap,
      eventFeed: [...session.eventFeed, ...newEvents].slice(-80),
      updatedAt: new Date().toISOString(),
    };
  }
}
