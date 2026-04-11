import { MatchEvent } from "@/types/liveMatch";
import { MatchSession } from "@/types/matchSession";
import { LineupImpactEngine } from "@/services/match/LineupImpactEngine";
import { TacticImpactEngine } from "@/services/match/TacticImpactEngine";
import { QuarterFlowEngine } from "@/services/match/QuarterFlowEngine";
import { getSimulationPaceProfile, SimulationSpeedOption } from "@/app/lib/simulationConfig";

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const avg = (values: number[]) => (values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0);

const lineupSkill = (lineup: MatchSession["userLineup"]) => {
  const offenseCreation = avg(lineup.map((p) => (p.attributes.pace.acceleration * 0.35 + p.attributes.pace.off_ball_movement * 0.2 + p.attributes.dribbling.change_of_pace_control * 0.25 + p.attributes.dribbling.drive_control * 0.2) / 100));
  const passingControl = avg(lineup.map((p) => (p.attributes.passing.court_vision * 0.35 + p.attributes.passing.decision_making * 0.35 + p.attributes.passing.passing_accuracy * 0.3) / 100));
  const contestShooting = avg(lineup.map((p) => (p.attributes.shooting.shot_under_pressure * 0.45 + p.attributes.shooting.shot_release_timing * 0.25 + p.attributes.mental_intangibles.clutch_factor * 0.3) / 100));
  const defensivePressure = avg(lineup.map((p) => (p.attributes.defending.on_ball_defense * 0.3 + p.attributes.defending.perimeter_defense * 0.2 + p.attributes.defending.interior_defense * 0.2 + p.attributes.defending.defensive_awareness * 0.2 + p.attributes.defending.steal_ability * 0.1) / 100));
  const transitionPace = avg(lineup.map((p) => (p.attributes.pace.speed * 0.25 + p.attributes.pace.acceleration * 0.35 + p.attributes.pace.off_ball_movement * 0.2 + p.attributes.physical.stamina * 0.2) / 100));
  const clutchAndIq = avg(lineup.map((p) => (p.attributes.mental_intangibles.game_iq * 0.5 + p.attributes.mental_intangibles.clutch_factor * 0.3 + p.attributes.mental_intangibles.consistency * 0.2) / 100));
  return { offenseCreation, passingControl, contestShooting, defensivePressure, transitionPace, clutchAndIq };
};

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
  tick(
    session: MatchSession,
    simulatedSecondsPerTick: number,
    random: () => number,
    simulationSpeed: SimulationSpeedOption["id"] = "normal",
  ): MatchSession {
    if (!QuarterFlowEngine.isLivePhase(session.phase)) return session;
    if (session.pendingInjury) return session;

    const userFixture = session.fixtures.find((fixture) => fixture.isUserMatch);
    if (!userFixture) return session;

    const nextTimeRemaining = clamp(session.timeRemaining - simulatedSecondsPerTick, 0, session.quarterDuration);
    const elapsed = session.quarterDuration - nextTimeRemaining;

    const moraleFactor = (morale: MatchSession["userLineup"][number]["morale"]) => (
      morale === "Muito Feliz" ? 1.05 : morale === "Feliz" ? 1.02 : morale === "Contente" ? 1 : morale === "Insatisfeito" ? 0.96 : 0.9
    );
    const styleBonus = (playstyles: string[]) => 1 + Math.min(0.08, playstyles.length * 0.015);
    const lineupAdjusted = <T extends MatchSession["userLineup"]>(lineup: T) =>
      lineup.map((player) => ({
        ...player,
        overall: Math.round(player.overall * moraleFactor(player.morale) * Math.max(0.8, player.stamina / 100) * styleBonus(player.playstyles)),
      })) as T;

    const adjustedUserLineup = lineupAdjusted(session.userLineup);
    const adjustedOppLineup = lineupAdjusted(session.opponentLineup);
    const userLineupImpact = LineupImpactEngine.fromLineup(adjustedUserLineup);
    const oppLineupImpact = LineupImpactEngine.fromLineup(adjustedOppLineup);
    const userSkill = lineupSkill(adjustedUserLineup);
    const oppSkill = lineupSkill(adjustedOppLineup);
    const userTacticImpact = TacticImpactEngine.for(session.userTeamTactic);
    const oppTacticImpact = TacticImpactEngine.for(session.opponentTeamTactic);

    const paceProfile = getSimulationPaceProfile(simulationSpeed);
    const quarterPulse = 0.92 + (session.quarter * 0.04) + random() * 0.08;
    const basePossessions = 0.2 * ((userTacticImpact.possessions + oppTacticImpact.possessions) / 2) * quarterPulse;
    const paceFactor = (userSkill.transitionPace + oppSkill.transitionPace) / 2;
    const possessionRoll = basePossessions * paceFactor * paceProfile.eventCadenceMultiplier;
    const paceLoopBudget = paceProfile.possessionResolutionMultiplier;
    const possessionWindows = Math.max(1, Math.floor(paceLoopBudget));
    const extraWindowChance = paceLoopBudget - possessionWindows;

    let homeDelta = 0;
    let awayDelta = 0;
    const newEvents: MatchEvent[] = [];
    const userFixtureScore = session.fixtures.find((fixture) => fixture.id === userFixture.id);
    const userIsHomeForExpectation = userFixture.homeTeamId === session.userTeamId;
    let currentUserPoints = userIsHomeForExpectation ? (userFixtureScore?.homeScore ?? session.score.user) : (userFixtureScore?.awayScore ?? session.score.user);
    let currentOppPoints = userIsHomeForExpectation ? (userFixtureScore?.awayScore ?? session.score.opponent) : (userFixtureScore?.homeScore ?? session.score.opponent);
    const paceWeight = (userTacticImpact.possessions + oppTacticImpact.possessions) / 2;
    const tacticalWindowScale = clamp(0.9 + (paceWeight - 1) * 0.45, 0.82, 1.22);
    const fatigueWindowScale = clamp((userLineupImpact.staminaPenalty + oppLineupImpact.staminaPenalty) / 2, 0.8, 1.05);
    const offenseDefenseBalance = clamp((userLineupImpact.attack / Math.max(0.1, oppLineupImpact.defense) + oppLineupImpact.attack / Math.max(0.1, userLineupImpact.defense)) / 2, 0.82, 1.2);
    const quarterProgress = clamp((session.quarterDuration - nextTimeRemaining) / Math.max(1, session.quarterDuration), 0, 1);
    const expectedQuarterPointsPerTeam = 20.5 * tacticalWindowScale * fatigueWindowScale * offenseDefenseBalance;
    const teamQuarterExpectation = {
      minPoints: Math.max(12, Math.round(expectedQuarterPointsPerTeam - 5)),
      expectedPoints: Math.round(expectedQuarterPointsPerTeam),
      maxPoints: Math.min(39, Math.round(expectedQuarterPointsPerTeam + 7)),
    };
    const targetPointsNow = teamQuarterExpectation.expectedPoints * quarterProgress;
    const totalWindows = possessionWindows + (random() < extraWindowChance ? 1 : 0);

    for (let possessionWindow = 0; possessionWindow < totalWindows; possessionWindow += 1) {
      if (random() >= possessionRoll) continue;
      const userIsHome = userFixture.homeTeamId === session.userTeamId;
      const attackStrength = userLineupImpact.attack * userTacticImpact.attack * userLineupImpact.staminaPenalty * (0.45 + userSkill.offenseCreation * 0.3 + userSkill.passingControl * 0.25);
      const defenseResistance = oppLineupImpact.defense * oppTacticImpact.defense * oppLineupImpact.staminaPenalty * (0.55 + oppSkill.defensivePressure * 0.45);
      const clutchWindow = nextTimeRemaining < 180 ? (userSkill.clutchAndIq - oppSkill.clutchAndIq) * 0.08 : 0;
      const momentumNoise = (random() - 0.5) * 0.08;
      const userWindowDelta = targetPointsNow - currentUserPoints;
      const oppWindowDelta = targetPointsNow - currentOppPoints;
      const scoringWindowBalance = clamp((userWindowDelta - oppWindowDelta) * 0.005, -0.05, 0.05);
      const userChanceToScore = clamp(0.37 + (attackStrength - defenseResistance) * 0.78 + clutchWindow + momentumNoise + scoringWindowBalance, 0.2, 0.78);

      const scoringTeamIsUser = random() < userChanceToScore;
      const scoringTactic = scoringTeamIsUser ? session.userTeamTactic : session.opponentTeamTactic;
      const variance = scoringTeamIsUser ? userTacticImpact.variance : oppTacticImpact.variance;
      const scoringLineup = scoringTeamIsUser ? session.userLineup : session.opponentLineup;
      const scorer = scoringLineup[Math.floor(random() * scoringLineup.length)];

      const shootingLineupSkill = scoringTeamIsUser ? userSkill : oppSkill;
      const defendingLineupSkill = scoringTeamIsUser ? oppSkill : userSkill;
      const shot3Chance = (scoringTactic === "five_out" ? 0.5 : scoringTactic === "perimeter_creation" ? 0.42 : 0.3) + (shootingLineupSkill.contestShooting - 0.5) * 0.18;
      const paint2Chance = (scoringTactic === "post_centric" ? 0.74 : scoringTactic === "pick_roll_heavy" ? 0.67 : 0.56) + (shootingLineupSkill.offenseCreation - defendingLineupSkill.defensivePressure) * 0.2;

      const isThreeAttempt = random() < shot3Chance;
      const isLateClock = nextTimeRemaining < 24 || random() < 0.12;
      const madeChance = clamp(
        (isThreeAttempt ? 0.34 : 0.49)
          + (shootingLineupSkill.contestShooting - 0.5) * 0.2
          - (defendingLineupSkill.defensivePressure - 0.5) * 0.18
          + (isLateClock ? -0.06 : 0)
          + (paceProfile.scoringCadenceMultiplier - 1) * 0.04,
        0.2,
        0.78,
      );
      const isMade = random() < madeChance;
      let points: 0 | 2 | 3 = isThreeAttempt ? 3 : 2;
      if (!isMade) points = 0;
      if (!isThreeAttempt && random() > paint2Chance) points = 0;
      if (random() < 0.05 * variance && points > 0) points = 2;
      const previousEvent = session.recentEventTypes.at(-1);
      if (previousEvent === "3PT_MADE" && points === 3 && random() < 0.45) points = 2;

      if (points > 0 && scoringTeamIsUser) {
        if (userIsHome) homeDelta += points;
        else awayDelta += points;
        currentUserPoints += points;
      } else if (points > 0 && userIsHome) awayDelta += points;
      else if (points > 0) homeDelta += points;
      if (points > 0 && !scoringTeamIsUser) currentOppPoints += points;

      const isShootingFoul = random() < (0.08 + Math.max(0, (1 - defendingLineupSkill.defensivePressure) * 0.06));
      const andOne = points === 2 && isShootingFoul && random() < 0.22;
      const freeThrowSkill = (scorer?.attributes?.shooting?.free_throw ?? 70) / 100;
      const pressureMod = nextTimeRemaining < 120 && session.quarter === 4 ? -0.07 : 0;
      const ftMakeChance = clamp(0.62 + freeThrowSkill * 0.28 + pressureMod, 0.45, 0.92);
      let ftPoints = 0;
      let ftText = "";
      if (isShootingFoul && (points === 0 || andOne)) {
        const attempts = andOne ? 1 : (isThreeAttempt ? 3 : 2);
        for (let i = 0; i < attempts; i += 1) {
          if (random() < ftMakeChance) ftPoints += 1;
        }
        if (scoringTeamIsUser) {
          if (userIsHome) homeDelta += ftPoints;
          else awayDelta += ftPoints;
          currentUserPoints += ftPoints;
        } else if (userIsHome) awayDelta += ftPoints;
        else homeDelta += ftPoints;
        if (!scoringTeamIsUser) currentOppPoints += ftPoints;
        ftText = attempts === 1 ? "converte o and-one da linha." : (ftPoints === attempts ? "acerta todos os lances livres." : ftPoints === 0 ? "erra todos da linha." : "divide os lances livres.");
      }

      newEvents.push({
        id: `ev-${Date.now()}-${Math.floor(random() * 99999)}`,
        fixtureId: userFixture.id,
        second: elapsed,
        teamId: scoringTeamIsUser ? session.userTeamId : session.opponentTeamId,
        playerName: scorer?.playerName ?? (scoringTeamIsUser ? "Seu time" : "Adversário"),
        type: points === 3 ? (isMade ? "3PT_MADE" : "3PT_ATTEMPT_MISS") : points === 2 ? (isMade ? "2PT_MADE" : "2PT_ATTEMPT_MISS") : "MISS",
        text: points > 0
          ? `${scoringTeamIsUser ? "Seu time" : "Adversário"}: ${scorer?.playerName ?? "Jogador"} converte ${points} pts ${isLateClock ? "no estouro do relógio" : ""}.`
          : `${scorer?.playerName ?? "Jogador"} força arremesso ${isThreeAttempt ? "de 3" : "de 2"} e erra.`,
      });
      if (isShootingFoul && (points === 0 || andOne)) {
        newEvents.push({
          id: `ev-ft-${Date.now()}-${Math.floor(random() * 99999)}`,
          fixtureId: userFixture.id,
          second: elapsed,
          teamId: scoringTeamIsUser ? session.userTeamId : session.opponentTeamId,
          playerName: scorer?.playerName ?? "Jogador",
          type: andOne ? "AND_ONE" : "SHOOTING_FOUL",
          text: `${scorer?.playerName ?? "Jogador"} sofre falta de arremesso, vai para a linha e ${ftText}`,
        });
      }
    }

    const canTriggerInjury = session.injuryCooldownTicks <= 0;
    if (canTriggerInjury && random() < (0.008 * paceProfile.eventCadenceMultiplier)) {
      const candidates = session.userLineup.filter((player) => player.injuryStatus !== "Lesionado");
      const risky = [...candidates].sort((a, b) => (a.stamina + a.attributes.physical.durability * 0.25) - (b.stamina + b.attributes.physical.durability * 0.25));
      const victim = risky[0];
      if (victim && (victim.stamina < 58 || random() < 0.2)) {
        newEvents.push({
          id: `ev-injury-${Date.now()}-${Math.floor(random() * 99999)}`,
          fixtureId: userFixture.id,
          second: elapsed,
          teamId: session.userTeamId,
          playerName: victim.playerName,
          type: "INJURY",
          text: `${victim.playerName} sentiu lesão e precisa ser substituído.`,
        });
      }
    }

    const quarterEnded = nextTimeRemaining === 0;
    const nextPhase = quarterEnded ? QuarterFlowEngine.nextPhaseAfterQuarter(session.phase) : session.phase;
    const nextQuarter = QuarterFlowEngine.toQuarter(nextPhase);

    const updatedFixtures = session.fixtures.map((fixture) => {
      let nextFixture = fixture;
      if (fixture.id === userFixture.id) {
        const latestScoreEvent = newEvents[newEvents.length - 1];
        const scorerData = latestScoreEvent
          ? { playerName: latestScoreEvent.playerName ?? "Unknown Player", minute: formatClock(nextTimeRemaining) }
          : undefined;

        nextFixture = {
          ...fixture,
          homeScore: fixture.homeScore + homeDelta,
          awayScore: fixture.awayScore + awayDelta,
          homeLastScorer: homeDelta > 0 ? scorerData : fixture.homeLastScorer,
          awayLastScorer: awayDelta > 0 ? scorerData : fixture.awayLastScorer,
        };
      } else if (fixture.status !== "finished") {
        const randomSwing = random();
        if (randomSwing < 0.2) {
          nextFixture = {
            ...fixture,
            homeScore: fixture.homeScore + 2,
            homeLastScorer: { playerName: `${fixture.homeTeamName} #11`, minute: formatClock(nextTimeRemaining) },
          };
        } else if (randomSwing < 0.4) {
          nextFixture = {
            ...fixture,
            awayScore: fixture.awayScore + 2,
            awayLastScorer: { playerName: `${fixture.awayTeamName} #9`, minute: formatClock(nextTimeRemaining) },
          };
        }
      }

      const status: "live" | "break" | "finished" = quarterEnded
        ? nextPhase === "POST_MATCH"
          ? "finished"
          : "break"
        : "live";
      const homeFoulDelta = random() < 0.13 ? 1 : 0;
      const awayFoulDelta = random() < 0.13 ? 1 : 0;
      return { ...nextFixture, status, homeFouls: Math.min(9, (nextFixture.homeFouls ?? 0) + homeFoulDelta), awayFouls: Math.min(9, (nextFixture.awayFouls ?? 0) + awayFoulDelta) };
    });

    const userFixtureAfter = updatedFixtures.find((fixture) => fixture.isUserMatch);
    const userIsHome = userFixture.homeTeamId === session.userTeamId;

    const drainedUserLineup = session.userLineup.map((player) => ({
      ...player,
      stamina: clamp(player.stamina - simulatedSecondsPerTick * 0.045 * userTacticImpact.staminaDrain, 48, 100),
    }));
    const drainedOpponentLineup = session.opponentLineup.map((player) => ({
      ...player,
      stamina: clamp(player.stamina - simulatedSecondsPerTick * 0.04 * oppTacticImpact.staminaDrain, 48, 100),
    }));

    const injuryEvent = newEvents.find((event) => event.type === "INJURY");
    const pendingInjury = injuryEvent?.playerName
      ? {
          outPlayerId: drainedUserLineup.find((player) => player.playerName === injuryEvent.playerName)?.playerId ?? "",
          outPlayerName: injuryEvent.playerName,
          suggestedPosition: drainedUserLineup.find((player) => player.playerName === injuryEvent.playerName)?.position ?? "SG",
          reason: "Evento de lesão durante a partida",
        }
      : null;
    const injuryPlayerId = pendingInjury?.outPlayerId;
    const phaseState = QuarterFlowEngine.toPhaseState(nextPhase);
    const recommendedActions = [
      "Revisar fadiga dos titulares e planejar rotação.",
      "Ajustar intensidade defensiva para o próximo período.",
      "Priorizar jogadas para seu melhor criador no clutch.",
    ];
    const quarterBreakSnapshot = quarterEnded && nextPhase !== "POST_MATCH"
      ? {
          sessionId: session.id,
          fixtureId: userFixture.id,
          quarterJustEnded: session.quarter,
          homeScore: userFixtureAfter?.homeScore ?? userFixture.homeScore,
          awayScore: userFixtureAfter?.awayScore ?? userFixture.awayScore,
          remainingRotations: Math.max(0, 4 - session.substitutions.length),
          recommendedActions,
          playerStates: drainedUserLineup.map((player) => ({
            playerId: player.playerId,
            playerName: player.playerName,
            stamina: player.stamina,
            injuryStatus: player.injuryStatus,
            morale: player.morale,
          })),
          tacticalState: session.userTacticalPreset,
          generatedAt: new Date().toISOString(),
        }
      : session.quarterBreakSnapshot ?? null;

    return {
      ...session,
      quarter: nextQuarter,
      phase: nextPhase,
      phaseState,
      timeRemaining: quarterEnded && nextPhase !== "POST_MATCH" ? session.quarterDuration : nextTimeRemaining,
      isFinished: nextPhase === "POST_MATCH",
      fixtures: updatedFixtures,
      userLineup: drainedUserLineup.map((player) => injuryPlayerId && player.playerId === injuryPlayerId ? { ...player, injuryStatus: "Lesionado" } : player),
      opponentLineup: drainedOpponentLineup,
      injuredPlayerIds: injuryPlayerId ? [...new Set([...session.injuredPlayerIds, injuryPlayerId])] : session.injuredPlayerIds,
      injuryCooldownTicks: injuryPlayerId ? 28 : Math.max(0, session.injuryCooldownTicks - 1),
      recentEventTypes: [...session.recentEventTypes, ...newEvents.map((event) => event.type)].slice(-8),
      pendingInjury: pendingInjury ?? session.pendingInjury,
      score: {
        user: userIsHome ? userFixtureAfter?.homeScore ?? session.score.user : userFixtureAfter?.awayScore ?? session.score.user,
        opponent: userIsHome ? userFixtureAfter?.awayScore ?? session.score.opponent : userFixtureAfter?.homeScore ?? session.score.opponent,
      },
      quarterBreakSnapshot,
      eventFeed: [...session.eventFeed, ...newEvents].slice(-60),
      updatedAt: new Date().toISOString(),
    };
  }
}
