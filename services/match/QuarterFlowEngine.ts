import { MatchPhase, MatchPhaseState } from "@/types/matchSession";

const quarterByPhase: Record<MatchPhase, 1 | 2 | 3 | 4> = {
  Q1: 1,
  BREAK_Q1: 1,
  Q2: 2,
  BREAK_Q2: 2,
  Q3: 3,
  BREAK_Q3: 3,
  Q4: 4,
  POST_MATCH: 4,
};

export class QuarterFlowEngine {
  static toQuarter(phase: MatchPhase): 1 | 2 | 3 | 4 {
    return quarterByPhase[phase];
  }

  static nextPhaseAfterQuarter(phase: MatchPhase): MatchPhase {
    switch (phase) {
      case "Q1":
        return "BREAK_Q1";
      case "Q2":
        return "BREAK_Q2";
      case "Q3":
        return "BREAK_Q3";
      case "Q4":
        return "POST_MATCH";
      default:
        return phase;
    }
  }

  static continueFromBreak(phase: MatchPhase): MatchPhase {
    switch (phase) {
      case "BREAK_Q1":
        return "Q2";
      case "BREAK_Q2":
        return "Q3";
      case "BREAK_Q3":
        return "Q4";
      default:
        return phase;
    }
  }

  static isLivePhase(phase: MatchPhase) {
    return phase === "Q1" || phase === "Q2" || phase === "Q3" || phase === "Q4";
  }

  static isBreakPhase(phase: MatchPhase) {
    return phase === "BREAK_Q1" || phase === "BREAK_Q2" || phase === "BREAK_Q3";
  }

  static toPhaseState(phase: MatchPhase): MatchPhaseState {
    if (phase === "POST_MATCH") return "final";
    if (phase === "BREAK_Q2") return "halftime";
    if (this.isBreakPhase(phase)) return "quarter-break";
    return "live-quarter";
  }
}
