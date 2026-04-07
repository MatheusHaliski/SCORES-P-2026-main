import { Player, Team } from "@/types/game";

export type OffenseTactic = "balanced" | "run-and-gun" | "inside" | "perimeter";
export type DefenseTactic = "man" | "zone" | "press" | "drop";

export type TeamTactics = {
  offense: OffenseTactic;
  defense: DefenseTactic;
  offenseRating: number; // 0-100
  defenseRating: number; // 0-100
  paceModifier: number; // -10..+10
  threePointTendency: number; // 0-100
};

export type TeamMatchState = {
  teamId: string;
  team: Team;
  playersOnCourt: Player[];
  benchPlayers: Player[];
  fatigue: number; // 0-100 (quanto maior, mais cansado)
  morale: number; // 0-100
  possessionControl: number; // 0-100
  seasonForm: number; // 0-100
  foulTroubleCount: number; // titulares em risco
  disqualifiedCount: number; // jogadores fora por faltas
  tactics: TeamTactics;
  isHome: boolean;
};

export type MatchScore = {
  home: number;
  away: number;
};

export type QuarterStats = {
  home: number[];
  away: number[];
};

export type TeamDerivedMetrics = {
  avgOverallOnCourt: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  pace: number;
  physicality: number;
  mental: number;
  starPower: number;
};

export type TickScoringEvent = {
  tick: number;
  quarter: number;
  clock: string;
  teamId: string;
  points: 1 | 2 | 3;
  shotQuality: number;
  chanceToScore: number;
  scoreRate: number;
  description: string;
};

export type MatchState = {
  homeTeam: TeamMatchState;
  awayTeam: TeamMatchState;
  quarter: number;
  tick: number;
  timeRemaining: number;
  score: MatchScore;
  quarterPoints: QuarterStats;
  possessions: { home: number; away: number };
  events: TickScoringEvent[];
};

export type SimulationWeights = {
  attack: {
    teamOverall: number;
    avgPlayerOverallOnCourt: number;
    shooting: number;
    passing: number;
    dribbling: number;
    pace: number;
    physicality: number;
    teamTacticsOffense: number;
    playstyleSynergy: number;
    starPower: number;
  };
  defense: {
    opponentTeamOverall: number;
    opponentAvgPlayerOverall: number;
    opponentDefending: number;
    opponentPhysicality: number;
    opponentTeamTacticsDefense: number;
    opponentPlaystyleDefense: number;
  };
  scoring: {
    baseRate: number;
  };
};

export type RatingBreakdown = {
  attackRating: number;
  defenseResistance: number;
  chanceToScore: number;
  scoreRate: number;
  contextFactor: number;
};

export type MatchSimulationResult = {
  finalScore: MatchScore;
  totalPossessions: { home: number; away: number };
  pointsPerQuarter: QuarterStats;
  events: TickScoringEvent[];
  offensiveEfficiency: {
    home: number;
    away: number;
  };
};
