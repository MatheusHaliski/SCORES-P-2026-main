import { Fixture, Player } from "@/types/game";
import { MatchEvent } from "@/types/liveMatch";

export type MatchPhase =
  | "Q1"
  | "BREAK_Q1"
  | "Q2"
  | "BREAK_Q2"
  | "Q3"
  | "BREAK_Q3"
  | "Q4"
  | "POST_MATCH";

export type TeamTactic =
  | "balanced"
  | "fast_pace"
  | "defensive"
  | "three_point_focus"
  | "paint_attack"
  | "aggressive_press";

export type LineupPlayer = {
  playerId: string;
  playerName: string;
  position: string;
  overall: number;
  stamina: number;
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physical: number;
  isStarter: boolean;
};

export type LiveFixtureState = {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  homeTeamName: string;
  awayTeamName: string;
  homeLogo: string;
  awayLogo: string;
  homeColor: string;
  awayColor: string;
  homeScore: number;
  awayScore: number;
  homeLastScorer?: {
    playerName: string;
    minute: string;
  };
  awayLastScorer?: {
    playerName: string;
    minute: string;
  };
  isUserMatch: boolean;
  status: "scheduled" | "live" | "break" | "finished";
};

export type MatchSession = {
  id: string;
  saveId: string;
  leagueId: string;
  round: number;
  quarter: 1 | 2 | 3 | 4;
  phase: MatchPhase;
  timeRemaining: number;
  quarterDuration: number;
  isFinished: boolean;
  userTeamId: string;
  opponentTeamId: string;
  userTeamTactic: TeamTactic;
  opponentTeamTactic: TeamTactic;
  userLineup: LineupPlayer[];
  userBench: LineupPlayer[];
  opponentLineup: LineupPlayer[];
  opponentBench: LineupPlayer[];
  substitutions: Array<{ outPlayerId: string; inPlayerId: string; quarter: number; at: string }>;
  fixtures: LiveFixtureState[];
  eventFeed: MatchEvent[];
  score: {
    user: number;
    opponent: number;
  };
  createdAt: string;
  updatedAt: string;
};

export type CreateMatchSessionPayload = {
  saveId: string;
  leagueId: string;
  round: number;
  userTeamId: string;
  userFixture: Fixture;
  fixtures: Fixture[];
  players: Player[];
  opponentPlayers: Player[];
  teamsById: Record<string, { shortName: string; logoUrl: string; primaryColor: string }>;
  quarterDuration: number;
};
