import { MatchEvent } from "@/types/liveMatch";

export class QuarterRecapEngine {
  static generate(params: {
    quarter: number;
    userNetRun: number;
    events: MatchEvent[];
    prior: Array<{ id: string; quarter: number; title: string; description: string; delta: number }>;
  }) {
    const turnovers = params.events.filter((event) => event.type === "TURNOVER").length;
    const offBoards = params.events.filter((event) => event.type === "OFF_REBOUND").length;
    const threes = params.events.filter((event) => event.type === "3PT_MADE").length;

    return [
      ...params.prior,
      {
        id: `recap-run-q${params.quarter}-${Date.now()}`,
        quarter: params.quarter,
        title: params.userNetRun >= 0 ? "Run generated" : "Opponent run warning",
        description: params.userNetRun >= 0
          ? `Team posted +${Math.max(1, params.userNetRun)} scoring swing in the period.`
          : `Team conceded ${Math.abs(params.userNetRun)} points in net run pressure.`,
        delta: params.userNetRun,
      },
      {
        id: `recap-pos-q${params.quarter}-${Date.now() + 1}`,
        quarter: params.quarter,
        title: "Possession quality",
        description: `${turnovers} turnovers, ${offBoards} second-chance boards, ${threes} made threes in quarter flow.`,
        delta: offBoards - turnovers,
      },
    ];
  }
}
