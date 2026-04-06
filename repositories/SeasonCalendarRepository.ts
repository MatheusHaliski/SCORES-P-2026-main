import { Fixture, UserSave } from "@/types/game";
import { SeasonCalendar, SeasonCalendarEntry } from "@/types/season";

const calendars = new Map<string, SeasonCalendar>();

const toEntry = (fixture: Fixture): SeasonCalendarEntry => ({
  fixtureId: fixture.id,
  leagueId: fixture.leagueId,
  round: fixture.round,
  date: fixture.date,
  homeTeamId: fixture.homeTeamId,
  awayTeamId: fixture.awayTeamId,
  status: fixture.status,
  homeScore: fixture.homeScore,
  awayScore: fixture.awayScore,
});

export class SeasonCalendarRepository {
  getBySaveId(saveId: string): SeasonCalendar | null {
    return calendars.get(saveId) ?? null;
  }

  upsert(calendar: SeasonCalendar): SeasonCalendar {
    calendars.set(calendar.saveId, calendar);
    return calendar;
  }

  getOrCreate(save: UserSave, leagueFixtures: Fixture[]): SeasonCalendar {
    const existing = this.getBySaveId(save.id);
    if (existing) return existing;

    const entries = leagueFixtures
      .filter((fixture) => fixture.homeTeamId === save.teamId || fixture.awayTeamId === save.teamId)
      .sort((a, b) => (a.round - b.round) || a.date.localeCompare(b.date))
      .map(toEntry);

    const firstScheduledIndex = entries.findIndex((entry) => entry.status !== "finished");
    const now = new Date().toISOString();

    const calendar: SeasonCalendar = {
      saveId: save.id,
      leagueId: save.leagueId,
      teamId: save.teamId,
      entries,
      currentEntryIndex: firstScheduledIndex >= 0 ? firstScheduledIndex : entries.length,
      completedRounds: {},
      createdAt: now,
      updatedAt: now,
    };

    calendars.set(save.id, calendar);
    return calendar;
  }
}
