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

const normalizeDate = (value: string) => value.includes("T") ? value : `${value}T00:00:00.000Z`;

const addDays = (isoDate: string, days: number) => {
  const date = new Date(normalizeDate(isoDate));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString();
};

const buildFallbackSeasonFixtures = (save: UserSave, leagueFixtures: Fixture[]): Fixture[] => {
  const teamFixtures = leagueFixtures.filter((fixture) => fixture.homeTeamId === save.teamId || fixture.awayTeamId === save.teamId);
  if (teamFixtures.length >= 6) return teamFixtures;

  const opponents = Array.from(new Set(
    leagueFixtures.flatMap((fixture) => [fixture.homeTeamId, fixture.awayTeamId]).filter((teamId) => teamId !== save.teamId),
  ));
  if (opponents.length === 0) return teamFixtures;

  const seededByOpponent = new Map<string, Fixture>();
  teamFixtures.forEach((fixture) => {
    const opponentId = fixture.homeTeamId === save.teamId ? fixture.awayTeamId : fixture.homeTeamId;
    if (!seededByOpponent.has(opponentId)) seededByOpponent.set(opponentId, fixture);
  });

  const baseRound = Math.min(...leagueFixtures.map((fixture) => fixture.round), save.currentRound || 1);
  const baseDate = teamFixtures[0]?.date ?? leagueFixtures[0]?.date ?? new Date().toISOString();
  let nextRound = Math.max(...teamFixtures.map((fixture) => fixture.round), baseRound - 1) + 1;
  let cursorDate = teamFixtures.length > 0 ? teamFixtures[teamFixtures.length - 1].date : baseDate;
  const syntheticFixtures: Fixture[] = [];

  opponents.forEach((opponentId, index) => {
    if (seededByOpponent.has(opponentId)) return;
    cursorDate = addDays(cursorDate, index === 0 ? 0 : 3);
    syntheticFixtures.push({
      id: `fx-${save.id}-${nextRound}-${opponentId}`,
      leagueId: save.leagueId,
      round: nextRound,
      date: cursorDate,
      homeTeamId: index % 2 === 0 ? save.teamId : opponentId,
      awayTeamId: index % 2 === 0 ? opponentId : save.teamId,
      homeScore: 0,
      awayScore: 0,
      status: "scheduled",
      quarter: 0,
      clock: "12:00",
    });
    nextRound += 1;
  });

  return [...teamFixtures, ...syntheticFixtures];
};

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

    const seasonFixtures = buildFallbackSeasonFixtures(save, leagueFixtures);
    const entries = seasonFixtures
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
      currentDate: entries[firstScheduledIndex >= 0 ? firstScheduledIndex : Math.max(0, entries.length - 1)]?.date ?? now.slice(0, 10),
      activeFixtureId: entries[firstScheduledIndex >= 0 ? firstScheduledIndex : entries.length]?.fixtureId ?? null,
      completedRounds: {},
      createdAt: now,
      updatedAt: now,
    };

    calendars.set(save.id, calendar);
    return calendar;
  }
}
