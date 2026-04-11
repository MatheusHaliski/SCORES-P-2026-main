export type LiveFixtureStatus = "not_started" | "live" | "halftime" | "finished";

export type LiveFixtureState = {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  homeTeamName: string;
  awayTeamName: string;
  homeScore: number;
  awayScore: number;
  isUserMatch: boolean;
  status: LiveFixtureStatus;
};

export type MatchProgressState = {
  quarter: number;
  elapsedSeconds: number;
  totalSeconds: number;
  progressPercent: number;
};

export type MatchEventType =
  | "2PT_ATTEMPT_MISS"
  | "2PT_MADE"
  | "3PT_ATTEMPT_MISS"
  | "3PT_MADE"
  | "FREE_THROW_MADE"
  | "FREE_THROW_SPLIT"
  | "FREE_THROW_MISS"
  | "SHOOTING_FOUL"
  | "AND_ONE"
  | "MISS"
  | "TURNOVER"
  | "FOUL"
  | "STEAL"
  | "BLOCK"
  | "OFF_REBOUND"
  | "DEF_REBOUND"
  | "FAST_BREAK"
  | "BENCH_SPARK"
  | "LATE_CLOCK"
  | "TIMEOUT"
  | "SUBSTITUTION"
  | "INJURY"
  | "DEFENSIVE_STOP"
  | "INFO";

export type MatchEvent = {
  id: string;
  fixtureId: string;
  second: number;
  teamId?: string;
  playerName?: string;
  type: MatchEventType;
  text: string;
  scoreImpact?: {
    homeDelta: number;
    awayDelta: number;
  };
};

export type LiveRoundState = {
  fixtures: LiveFixtureState[];
  progress: MatchProgressState;
  events: MatchEvent[];
  isFinished: boolean;
};

export type HalftimeSnapshot = {
  saveId: string;
  quarterFinished: number;
  savedAt: string;
  fixtures: LiveFixtureState[];
  recentEvents: MatchEvent[];
  progress: MatchProgressState;
};
