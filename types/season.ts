import { Fixture, FixtureStatus, StandingRow } from "@/types/game";

export type SeasonCalendarEntry = {
  fixtureId: string;
  leagueId: string;
  round: number;
  date: string;
  homeTeamId: string;
  awayTeamId: string;
  status: FixtureStatus;
  homeScore: number;
  awayScore: number;
};

export type SeasonCalendar = {
  saveId: string;
  leagueId: string;
  teamId: string;
  entries: SeasonCalendarEntry[];
  currentEntryIndex: number;
  completedRounds: Record<number, Fixture[]>;
  createdAt: string;
  updatedAt: string;
};

export type SeasonSummary = {
  isFinished: boolean;
  championTeamId: string | null;
  playoffTeamIds: string[];
  playoffSpots: number;
  finalStandings: StandingRow[];
};
