import { MatchSession, TeamTactics } from "@/types/matchSession";

export type FeedbackState = {
  momentum: number; // -1 to +1
  crowdIntensity: number; // 0 to 1
  pressure: number; // 0 to 1
  morale: number; // 0 to 1
  rivalryIntensity: number; // 0 to 1
  homeAdvantage: number; // 0 to 1
};

export type PlayerFX = {
  glowIntensity: number;
  pulseSpeed: number;
  highlightColor: string;
  desaturation: number;
};

export type CrowdState = "calm" | "engaged" | "tense" | "explosive";
export type BenchState = "neutral" | "supportive" | "frustrated" | "hyped";

export type ArenaProfile = {
  lightingIntensity: number;
  crowdHostility: number;
  refereeBias: number;
};

export type GameEvent = "score_run" | "turnover" | "clutch_shot" | "block" | "foul" | "timeout";

export type TacticalOverlayState = {
  offenseSpacing: "wide" | "tight" | "arc" | "balanced";
  defenseOverlay: "man-lines" | "zone-shapes";
  animationIntensity: number;
};

export type FeedbackSnapshot = {
  state: FeedbackState;
  crowdState: CrowdState;
  benchState: BenchState;
  arenaProfile: ArenaProfile;
  tacticalOverlay: TacticalOverlayState;
  hudPulse: number;
  cameraShake: number;
  transitionSpeedMultiplier: number;
  anxietyTint: number;
  audioCues: string[];
  eventCallouts: string[];
};

export type FeedbackBuildParams = {
  session: MatchSession;
  userTeamId: string;
  recentEvents?: Array<{ type: string; teamId?: string }>;
  previous?: FeedbackState;
  tactics?: TeamTactics;
};
