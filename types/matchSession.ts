import { Fixture, Player } from "@/types/game";
import { MacroRatings, PlayerAttributes } from "@/lib/playerRatings";
import { MatchEvent } from "@/types/liveMatch";
import { ClubUniformAssets, TacticalPreset, TacticalStyle } from "@/types/tactical";

export type MatchPhase =
  | "Q1"
  | "BREAK_Q1"
  | "Q2"
  | "BREAK_Q2"
  | "Q3"
  | "BREAK_Q3"
  | "Q4"
  | "POST_MATCH";

export type TeamTactic = TacticalStyle;

export type LineupPlayer = {
  playerId: string;
  playerName: string;
  photoUrl?: string;
  position: string;
  overall: number;
  stamina: number;
  attributes: PlayerAttributes;
  macroRatings: MacroRatings;
  morale: "Muito Feliz" | "Feliz" | "Contente" | "Insatisfeito" | "Muito Insatisfeito";
  injuryStatus: "Disponível" | "Lesionado";
  playstyles: string[];
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
  venueName: string;
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
  fixtureId: string;
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
  userTacticalPreset: TacticalPreset;
  opponentTacticalPreset: TacticalPreset;
  clubUniformAssets: ClubUniformAssets;
  userLineup: LineupPlayer[];
  userBench: LineupPlayer[];
  opponentLineup: LineupPlayer[];
  opponentBench: LineupPlayer[];
  substitutions: Array<{ outPlayerId: string; inPlayerId: string; quarter: number; at: string }>;
  injuredPlayerIds: string[];
  injuryCooldownTicks: number;
  recentEventTypes: string[];
  runtimeSeed: number;
  pendingInjury: null | {
    outPlayerId: string;
    outPlayerName: string;
    suggestedPosition: string;
    reason: string;
  };
  venueName?: string;
  attendance?: number;
  ticketRevenueEstimate?: number;
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
  fixtureId: string;
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
