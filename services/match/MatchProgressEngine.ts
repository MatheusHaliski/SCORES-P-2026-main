import { MatchEvent } from "@/types/liveMatch";
import { MatchSession } from "@/types/matchSession";
import { LineupImpactEngine } from "@/services/match/LineupImpactEngine";
import { TacticImpactEngine } from "@/services/match/TacticImpactEngine";
import { QuarterFlowEngine } from "@/services/match/QuarterFlowEngine";

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const formatClock = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const secs = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${mins}:${secs}`;
};

export class MatchProgressEngine {
  tick(session: MatchSession, simulatedSecondsPerTick: number, random: () => number): MatchSession {
    if (!QuarterFlowEngine.isLivePhase(session.phase)) return session;

    const userFixture = session.fixtures.find((fixture) => fixture.isUserMatch);
    if (!userFixture) return session;

    const nextTimeRemaining = clamp(session.timeRemaining - simulatedSecondsPerTick, 0, session.quarterDuration);
    const elapsed = session.quarterDuration - nextTimeRemaining;

    const userLineupImpact = LineupImpactEngine.fromLineup(session.userLineup);
    const oppLineupImpact = LineupImpactEngine.fromLineup(session.opponentLineup);
    const userTacticImpact = TacticImpactEngine.for(session.userTeamTactic);
    const oppTacticImpact = TacticImpactEngine.for(session.opponentTeamTactic);

    const basePossessions = 0.23 * ((userTacticImpact.possessions + oppTacticImpact.possessions) / 2);
    const paceFactor = (userLineupImpact.pace + oppLineupImpact.pace) / 2;
    const possessionRoll = basePossessions * paceFactor;

    let homeDelta = 0;
    let awayDelta = 0;
    const newEvents: MatchEvent[] = [];

    if (random() < possessionRoll) {
      const userIsHome = userFixture.homeTeamId === session.userTeamId;
      const attackStrength = userLineupImpact.attack * userTacticImpact.attack * userLineupImpact.staminaPenalty;
      const defenseResistance = oppLineupImpact.defense * oppTacticImpact.defense * oppLineupImpact.staminaPenalty;
      const userChanceToScore = clamp(0.38 + (attackStrength - defenseResistance) * 0.8, 0.2, 0.75);

      const scoringTeamIsUser = random() < userChanceToScore;
      const scoringTactic = scoringTeamIsUser ? session.userTeamTactic : session.opponentTeamTactic;
      const variance = scoringTeamIsUser ? userTacticImpact.variance : oppTacticImpact.variance;

      const shot3Chance = scoringTactic === "three_point_focus" ? 0.54 : 0.34;
      const paint2Chance = scoringTactic === "paint_attack" ? 0.78 : 0.6;

      let points: 2 | 3 = random() < shot3Chance ? 3 : 2;
      if (points === 2 && random() > paint2Chance) points = 3;
      if (random() < 0.05 * variance) points = 2;

      if (scoringTeamIsUser) {
        if (userIsHome) homeDelta += points;
        else awayDelta += points;
      } else if (userIsHome) awayDelta += points;
      else homeDelta += points;

      newEvents.push({
        id: `ev-${Date.now()}-${Math.floor(random() * 99999)}`,
        fixtureId: userFixture.id,
        second: elapsed,
        teamId: scoringTeamIsUser ? session.userTeamId : session.opponentTeamId,
        type: points === 3 ? "3PT_MADE" : "2PT_MADE",
        text: `${scoringTeamIsUser ? "Seu time" : "Adversário"} converte ${points} pts (${formatClock(nextTimeRemaining)}).`,
      });
    }

    const quarterEnded = nextTimeRemaining === 0;
    const nextPhase = quarterEnded ? QuarterFlowEngine.nextPhaseAfterQuarter(session.phase) : session.phase;
    const nextQuarter = QuarterFlowEngine.toQuarter(nextPhase);

    const updatedFixtures = session.fixtures.map((fixture) => {
      let nextFixture = fixture;
      if (fixture.id === userFixture.id) {
        nextFixture = {
          ...fixture,
          homeScore: fixture.homeScore + homeDelta,
          awayScore: fixture.awayScore + awayDelta,
        };
      } else if (fixture.status !== "finished") {
        const randomSwing = random();
        if (randomSwing < 0.2) nextFixture = { ...fixture, homeScore: fixture.homeScore + 2 };
        else if (randomSwing < 0.4) nextFixture = { ...fixture, awayScore: fixture.awayScore + 2 };
      }

      const status: "live" | "break" | "finished" = quarterEnded
        ? nextPhase === "POST_MATCH"
          ? "finished"
          : "break"
        : "live";
      return { ...nextFixture, status };
    });

    const userFixtureAfter = updatedFixtures.find((fixture) => fixture.isUserMatch);
    const userIsHome = userFixture.homeTeamId === session.userTeamId;

    const drainedUserLineup = session.userLineup.map((player) => ({
      ...player,
      stamina: clamp(player.stamina - simulatedSecondsPerTick * 0.06 * userTacticImpact.staminaDrain, 45, 100),
    }));
    const drainedOpponentLineup = session.opponentLineup.map((player) => ({
      ...player,
      stamina: clamp(player.stamina - simulatedSecondsPerTick * 0.05 * oppTacticImpact.staminaDrain, 45, 100),
    }));

    return {
      ...session,
      quarter: nextQuarter,
      phase: nextPhase,
      timeRemaining: quarterEnded && nextPhase !== "POST_MATCH" ? session.quarterDuration : nextTimeRemaining,
      isFinished: nextPhase === "POST_MATCH",
      fixtures: updatedFixtures,
      userLineup: drainedUserLineup,
      opponentLineup: drainedOpponentLineup,
      score: {
        user: userIsHome ? userFixtureAfter?.homeScore ?? session.score.user : userFixtureAfter?.awayScore ?? session.score.user,
        opponent: userIsHome ? userFixtureAfter?.awayScore ?? session.score.opponent : userFixtureAfter?.homeScore ?? session.score.opponent,
      },
      eventFeed: [...session.eventFeed, ...newEvents].slice(-60),
      updatedAt: new Date().toISOString(),
    };
  }
}
