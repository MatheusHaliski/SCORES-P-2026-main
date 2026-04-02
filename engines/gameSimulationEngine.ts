import { ContextEngine } from "@/engines/contextEngine";
import { PlaystyleEngine } from "@/engines/playstyleEngine";
import { PossessionEngine } from "@/engines/possessionEngine";
import { ScoringEngine, defaultSimulationWeights } from "@/engines/scoringEngine";
import {
  MatchSimulationResult,
  MatchState,
  SimulationWeights,
  TeamMatchState,
  TickScoringEvent,
} from "@/types/simulation";

const TICK_SECONDS = 15;
const TICKS_PER_QUARTER = 48;
const TOTAL_QUARTERS = 4;

const mulberry32 = (seed: number) => {
  let t = seed;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), t | 1);
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
};

const toClock = (timeRemaining: number) => {
  const minutes = Math.floor(timeRemaining / 60).toString().padStart(2, "0");
  const seconds = Math.floor(timeRemaining % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
};

export class GameSimulationEngine {
  private readonly random: () => number;
  private readonly playstyleEngine = new PlaystyleEngine();
  private readonly contextEngine = new ContextEngine();
  private readonly possessionEngine = new PossessionEngine();
  private readonly scoringEngine: ScoringEngine;

  constructor(seed = Date.now(), weights: SimulationWeights = defaultSimulationWeights) {
    this.random = mulberry32(seed);
    this.scoringEngine = new ScoringEngine(weights);
  }

  createInitialState(homeTeam: TeamMatchState, awayTeam: TeamMatchState): MatchState {
    return {
      homeTeam,
      awayTeam,
      quarter: 1,
      tick: 0,
      timeRemaining: 12 * 60,
      score: { home: 0, away: 0 },
      quarterPoints: { home: [0, 0, 0, 0], away: [0, 0, 0, 0] },
      possessions: { home: 0, away: 0 },
      events: [],
    };
  }

  simulateQuarter(state: MatchState): MatchState {
    state.timeRemaining = 12 * 60;

    for (let tick = 1; tick <= TICKS_PER_QUARTER; tick += 1) {
      state.tick = tick;
      this.runTick(state);
      state.timeRemaining = Math.max(0, state.timeRemaining - TICK_SECONDS);
    }

    return state;
  }

  simulateMatch(homeTeam: TeamMatchState, awayTeam: TeamMatchState): MatchSimulationResult {
    const state = this.createInitialState(homeTeam, awayTeam);

    for (let quarter = 1; quarter <= TOTAL_QUARTERS; quarter += 1) {
      state.quarter = quarter;
      this.simulateQuarter(state);
    }

    return {
      finalScore: state.score,
      totalPossessions: state.possessions,
      pointsPerQuarter: state.quarterPoints,
      events: state.events,
      offensiveEfficiency: {
        home: Number(((state.score.home / Math.max(1, state.possessions.home)) * 100).toFixed(2)),
        away: Number(((state.score.away / Math.max(1, state.possessions.away)) * 100).toFixed(2)),
      },
    };
  }

  private runTick(state: MatchState) {
    const possession = this.possessionEngine.getTickPossession(state, this.random);

    for (let attempt = 0; attempt < possession.attempts; attempt += 1) {
      const attackingSide = attempt === 0 ? possession.attackingSide : possession.attackingSide === "home" ? "away" : "home";
      const attacking = attackingSide === "home" ? state.homeTeam : state.awayTeam;
      const defending = attackingSide === "home" ? state.awayTeam : state.homeTeam;
      const scoreDiff = attackingSide === "home" ? state.score.home - state.score.away : state.score.away - state.score.home;

      const playstyle = this.playstyleEngine.evaluate(attacking, defending, state.quarter, state.timeRemaining);
      const context = this.contextEngine.evaluate(attacking, defending, scoreDiff, this.random);
      const ratings = this.scoringEngine.getRatingBreakdown({
        attacking,
        defending,
        possessionFactor: possession.possessionFactor,
        contextFactor: context.value,
        playstyle,
      });

      const chanceWithRate = Math.min(0.9, ratings.chanceToScore * ratings.scoreRate);
      if (this.random() < chanceWithRate) {
        const shotQuality = this.scoringEngine.getShotQuality(attacking, playstyle);
        const points = this.scoringEngine.resolvePoints(shotQuality, playstyle.threePointBonus, this.random);
        this.applyScore(state, attackingSide, points);

        const event: TickScoringEvent = {
          tick: state.tick,
          quarter: state.quarter,
          clock: toClock(state.timeRemaining),
          teamId: attacking.teamId,
          points,
          shotQuality: Number(shotQuality.toFixed(3)),
          chanceToScore: Number(ratings.chanceToScore.toFixed(3)),
          scoreRate: Number(ratings.scoreRate.toFixed(3)),
          description: `${attacking.team.shortName} +${points}pts | q${state.quarter} ${toClock(state.timeRemaining)} | style=${attacking.tactics.offense}`,
        };
        state.events.push(event);
      }

      if (attackingSide === "home") state.possessions.home += 1;
      else state.possessions.away += 1;

      this.applyFatigueTick(attacking, defending);
    }
  }

  private applyScore(state: MatchState, side: "home" | "away", points: 1 | 2 | 3) {
    const qIdx = state.quarter - 1;
    if (side === "home") {
      state.score.home += points;
      state.quarterPoints.home[qIdx] += points;
    } else {
      state.score.away += points;
      state.quarterPoints.away[qIdx] += points;
    }
  }

  private applyFatigueTick(attacking: TeamMatchState, defending: TeamMatchState) {
    attacking.fatigue = Math.min(100, attacking.fatigue + 0.35);
    defending.fatigue = Math.min(100, defending.fatigue + 0.22);
  }
}
