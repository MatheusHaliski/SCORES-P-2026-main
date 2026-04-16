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

export type MatchPhaseState =
  | "pre-game"
  | "live-quarter"
  | "quarter-break"
  | "halftime"
  | "final";

export type TeamTactics = {
  pace: "slow" | "balanced" | "fast";
  offenseFocus: "paint" | "mid" | "three" | "balanced";
  defenseType: "man" | "zone";
  pressure: number;
  reboundingFocus: number;
};

export type GameEmotionState = {
  momentum: number;
  crowdIntensity: number;
};

export type GameTickPayload = {
  momentum: number;
  crowdIntensity: number;
  managerMorale: number;
  tacticalDiscipline: number;
  pressure: number;
};

export type PlayerMatchState = {
  playerId: string;
  playerName: string;
  stamina: number;
  injuryStatus: "Disponível" | "Lesionado";
  morale: "Muito Feliz" | "Feliz" | "Contente" | "Insatisfeito" | "Muito Insatisfeito";
};

export type QuarterBreakSnapshot = {
  sessionId: string;
  fixtureId: string;
  quarterJustEnded: number;
  homeScore: number;
  awayScore: number;
  remainingRotations: number;
  recommendedActions: string[];
  playerStates: PlayerMatchState[];
  tacticalState: TacticalPreset;
  generatedAt: string;
};

export type TeamTactic = TacticalStyle;
export type ShotType = "free_throw" | "layup" | "dunk" | "midrange" | "three_pointer" | "putback" | "and_one";

export type ScoreEvent = {
  id: string;
  teamId: string;
  playerId: string;
  playerName: string;
  points: 1 | 2 | 3;
  shotType: ShotType;
  assisted: boolean;
  assisterPlayerId?: string;
  assisterPlayerName?: string;
  foulDrawn: boolean;
  clock: number;
  quarter: number;
  momentumDelta: number;
  tacticTag?: string;
  possessionContext?: "half-court" | "fast-break" | "second-chance";
};

export type ScoreBreakdown = {
  onePointMade: number;
  twoPointMade: number;
  threePointMade: number;
  paintPoints: number;
  fastBreakPoints: number;
  secondChancePoints: number;
  benchPoints: number;
};

export type PendingFreeThrow = {
  teamId: string;
  attempts: 1 | 2 | 3;
  foulType: "shooting" | "and_one" | "technical";
  selectedShooterPlayerId?: string;
  drawnByPlayerId?: string;
};

export type ScoringPresentationSettings = {
  freeThrowShooterMode: "auto" | "manual";
  scoringEventCallouts: boolean;
  detailedScoreBreakdown: boolean;
  showShotTypeLabels: boolean;
  showScorerAssetBadge: boolean;
};

export type LineupPlayer = {
  playerId: string;
  playerName: string;
  photoUrl?: string;
  position: string;
  overall: number;
  stamina: number;
  fouls: number;
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
  homeFouls: number;
  awayFouls: number;
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
  phaseState: MatchPhaseState;
  timeRemaining: number;
  quarterDuration: number;
  isFinished: boolean;
  userTeamId: string;
  opponentTeamId: string;
  userTeamTactic: TeamTactic;
  opponentTeamTactic: TeamTactic;
  userTeamConfig: TeamTactics;
  opponentTeamConfig: TeamTactics;
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
  scoreEvents: ScoreEvent[];
  pendingFreeThrow?: PendingFreeThrow | null;
  homeBreakdown: ScoreBreakdown;
  awayBreakdown: ScoreBreakdown;
  scoringSettings: ScoringPresentationSettings;
  possessionTeamId: string;
  shotClockRemaining: number;
  bonusFoulLimit: number;
  teamRuntime: {
    home: { timeoutsRemaining: number; foulsThisQuarter: number };
    away: { timeoutsRemaining: number; foulsThisQuarter: number };
  };
  emotion: GameEmotionState;
  momentum: {
    value: number;
    currentRun: { teamId: string; points: number };
  };
  crowd: {
    intensity: number;
  };
  telemetry: GameTickPayload;
  storyBanners: string[];
  quarterRecap?: Array<{
    id: string;
    quarter: number;
    title: string;
    description: string;
    delta: number;
  }>;
  quarterBreakSnapshot?: QuarterBreakSnapshot | null;
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
