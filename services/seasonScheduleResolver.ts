import { Fixture } from "@/types/game";
import { SeasonCalendar, SeasonCalendarEntry } from "@/types/season";

export type LeagueProgressState = {
  currentDate: string;
  completedFixtureIds: string[];
  activeFixtureId?: string | null;
};

const toDateKey = (value: string) => value.split("T")[0];

export const sortFixturesChronologically = <T extends { date: string; round: number }>(fixtures: T[]) =>
  [...fixtures].sort((a, b) => toDateKey(a.date).localeCompare(toDateKey(b.date)) || a.round - b.round);

export function resolveNextScheduledFixture(fixtures: Fixture[], progress: LeagueProgressState): Fixture | null {
  const completed = new Set(progress.completedFixtureIds);
  const sorted = sortFixturesChronologically(fixtures);
  const onOrAfterDate = sorted.find((fixture) => !completed.has(fixture.id) && toDateKey(fixture.date) >= toDateKey(progress.currentDate));
  if (onOrAfterDate) return onOrAfterDate;
  return sorted.find((fixture) => !completed.has(fixture.id)) ?? null;
}

export function resolveNextCalendarEntry(entries: SeasonCalendarEntry[], progress: LeagueProgressState): SeasonCalendarEntry | null {
  const completed = new Set(progress.completedFixtureIds);
  const sorted = sortFixturesChronologically(entries);
  const onOrAfterDate = sorted.find((entry) => !completed.has(entry.fixtureId) && toDateKey(entry.date) >= toDateKey(progress.currentDate));
  if (onOrAfterDate) return onOrAfterDate;
  return sorted.find((entry) => !completed.has(entry.fixtureId)) ?? null;
}

export function buildLeagueProgressState(calendar: SeasonCalendar): LeagueProgressState {
  return {
    currentDate: calendar.currentDate,
    completedFixtureIds: calendar.entries.filter((entry) => entry.status === "finished").map((entry) => entry.fixtureId),
    activeFixtureId: calendar.activeFixtureId,
  };
}
