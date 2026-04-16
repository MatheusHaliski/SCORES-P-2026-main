import { InterruptionControl, InterruptionEvent, MatchSession } from "@/types/matchSession";

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const frequencyProfiles: Record<"low" | "balanced" | "realistic", {
  foulBaseRate: number;
  maxQuarterFreeThrows: number;
  stopSensitivity: number;
}> = {
  low: { foulBaseRate: 0.05, maxQuarterFreeThrows: 8, stopSensitivity: 1.2 },
  balanced: { foulBaseRate: 0.075, maxQuarterFreeThrows: 10, stopSensitivity: 1 },
  realistic: { foulBaseRate: 0.09, maxQuarterFreeThrows: 13, stopSensitivity: 0.85 },
};

export const makeInitialInterruptionControl = (): InterruptionControl => ({
  recentFouls: 0,
  recentStops: 0,
  lastInterruptionTime: 0,
  flowState: "fluid",
});

export const getInterruptionProfile = (session: MatchSession) => (
  frequencyProfiles[session.scoringSettings?.interruptionFrequency ?? "balanced"]
);

export const evolveInterruptionControl = (
  control: InterruptionControl,
  elapsedSeconds: number,
): InterruptionControl => {
  const foulDecay = Math.max(0, control.recentFouls - elapsedSeconds / 35);
  const stopDecay = Math.max(0, control.recentStops - elapsedSeconds / 28);
  const flowState = stopDecay >= 4.8 ? "stop_heavy" : stopDecay >= 2.2 ? "moderate" : "fluid";
  return {
    recentFouls: foulDecay,
    recentStops: stopDecay,
    lastInterruptionTime: control.lastInterruptionTime,
    flowState,
  };
};

export const registerInterruption = (
  control: InterruptionControl,
  timestamp: number,
  foulRelated: boolean,
): InterruptionControl => {
  const recentFouls = clamp(control.recentFouls + (foulRelated ? 1 : 0), 0, 12);
  const recentStops = clamp(control.recentStops + 1, 0, 12);
  const flowState = recentStops >= 5 ? "stop_heavy" : recentStops >= 2.5 ? "moderate" : "fluid";
  return {
    recentFouls,
    recentStops,
    lastInterruptionTime: timestamp,
    flowState,
  };
};

export const flowReducer = (control: InterruptionControl, session: MatchSession) => {
  const profile = getInterruptionProfile(session);
  const stoppagePressure = clamp(control.recentStops / (5 * profile.stopSensitivity), 0, 1.2);
  const recencyBonus = control.lastInterruptionTime > 0
    ? clamp((18 - (session.quarterDuration - session.timeRemaining - control.lastInterruptionTime)) / 26, 0, 0.25)
    : 0;
  return clamp(1 - stoppagePressure - recencyBonus + (control.flowState === "fluid" ? 0.07 : 0), 0.42, 1.08);
};

export const shouldTriggerFoul = (params: {
  random: () => number;
  baseRate: number;
  defensivePressure: number;
  defenderSkill: number;
  offensiveAggression: number;
  fatigueFactor: number;
  momentumFactor: number;
  clutchFactor: number;
  flowReducer: number;
}) => {
  const probability = clamp(
    params.baseRate
    * params.defensivePressure
    * params.fatigueFactor
    * params.offensiveAggression
    * params.momentumFactor
    * params.clutchFactor
    * params.flowReducer
    * (1 + (0.58 - params.defenderSkill) * 0.22),
    0.015,
    0.34,
  );
  return { probability, committed: params.random() < probability };
};

export const canIssueFreeThrows = (
  quarterAttempts: number,
  session: MatchSession,
): boolean => quarterAttempts < getInterruptionProfile(session).maxQuarterFreeThrows;

export const interruptionAlertText = (event: InterruptionEvent) => {
  if (event.message) return event.message;
  if (event.type === "foul") return "Foul — Defensive reach-in";
  if (event.type === "free_throw") return "Shooting foul — Free Throws";
  if (event.type === "violation") return "Violation — Shot clock";
  if (event.type === "ejection") return "Player Ejected";
  return "Timeout";
};
