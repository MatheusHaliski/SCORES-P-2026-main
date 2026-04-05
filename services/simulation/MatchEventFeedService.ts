import { MatchEvent, MatchEventType } from "@/types/liveMatch";

const PLAYERS = ["Smith", "Johnson", "Carter", "Williams", "Davis", "Brown", "Miller", "Anderson", "Taylor", "Moore"];

const SCORE_EVENT_TYPES: MatchEventType[] = ["2PT_MADE", "3PT_MADE", "FREE_THROW_MADE"];
const NON_SCORE_EVENT_TYPES: MatchEventType[] = ["MISS", "TURNOVER", "FOUL", "STEAL", "TIMEOUT", "SUBSTITUTION", "DEFENSIVE_STOP"];

const pick = <T,>(list: T[], random: () => number): T => list[Math.floor(random() * list.length)];

const buildEventText = (type: MatchEventType, playerName: string) => {
  switch (type) {
    case "2PT_MADE":
      return `2 pts by ${playerName}`;
    case "3PT_MADE":
      return `3PT by ${playerName}`;
    case "FREE_THROW_MADE":
      return `Free throw made by ${playerName}`;
    case "MISS":
      return `Missed shot by ${playerName}`;
    case "TURNOVER":
      return `Turnover by ${playerName}`;
    case "FOUL":
      return `Foul by ${playerName}`;
    case "STEAL":
      return `Steal by ${playerName}`;
    case "TIMEOUT":
      return "Timeout requested";
    case "SUBSTITUTION":
      return "Bench substitution";
    case "DEFENSIVE_STOP":
      return `Defensive stop by ${playerName}`;
    case "INFO":
      return "Quarter in progress";
    default:
      return "Live event";
  }
};

export class MatchEventFeedService {
  buildScoringEvent(params: { fixtureId: string; second: number; teamId: string; isHomeTeam: boolean; random: () => number }): MatchEvent {
    const type = pick(SCORE_EVENT_TYPES, params.random);
    const playerName = pick(PLAYERS, params.random);
    const points = type === "3PT_MADE" ? 3 : type === "2PT_MADE" ? 2 : 1;

    return {
      id: `${params.fixtureId}-${params.second}-${Math.round(params.random() * 100000)}`,
      fixtureId: params.fixtureId,
      second: params.second,
      teamId: params.teamId,
      playerName,
      type,
      text: buildEventText(type, playerName),
      scoreImpact: {
        homeDelta: params.isHomeTeam ? points : 0,
        awayDelta: params.isHomeTeam ? 0 : points,
      },
    };
  }

  buildNonScoringEvent(params: { fixtureId: string; second: number; teamId: string; random: () => number }): MatchEvent {
    const type = pick(NON_SCORE_EVENT_TYPES, params.random);
    const playerName = pick(PLAYERS, params.random);

    return {
      id: `${params.fixtureId}-${params.second}-${Math.round(params.random() * 100000)}`,
      fixtureId: params.fixtureId,
      second: params.second,
      teamId: params.teamId,
      playerName,
      type,
      text: buildEventText(type, playerName),
    };
  }

  buildInfoEvent(params: { fixtureId: string; second: number; text: string }): MatchEvent {
    return {
      id: `${params.fixtureId}-${params.second}-info-${params.text}`,
      fixtureId: params.fixtureId,
      second: params.second,
      type: "INFO",
      text: params.text,
    };
  }
}
