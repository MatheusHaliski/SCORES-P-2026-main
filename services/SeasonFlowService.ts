import { FixturesRepository } from "@/repositories/FixturesRepository";
import { SeasonCalendarRepository } from "@/repositories/SeasonCalendarRepository";
import { TeamsRepository } from "@/repositories/TeamsRepository";
import { UserSavesRepository } from "@/repositories/UserSavesRepository";
import { Fixture, StandingRow } from "@/types/game";
import { SeasonCalendar, SeasonSummary } from "@/types/season";
import { ManagerCareerService } from "@/services/ManagerCareerService";
import { JobOfferService } from "@/services/JobOfferService";

export class SeasonFlowService {
  constructor(
    private savesRepository = new UserSavesRepository(),
    private fixturesRepository = new FixturesRepository(),
    private teamsRepository = new TeamsRepository(),
    private calendarRepository = new SeasonCalendarRepository(),
    private managerCareerService = new ManagerCareerService(),
    private jobOfferService = new JobOfferService(),
  ) {}

  async getSeasonContext(saveId: string): Promise<{ calendar: SeasonCalendar; nextFixture: Fixture | null; standings: StandingRow[]; summary: SeasonSummary }> {
    const save = await this.savesRepository.getSaveById(saveId);
    if (!save) throw new Error("Save não encontrado");

    const leagueFixtures = await this.fixturesRepository.getLatestFixturesByLeague(save.leagueId);
    const calendar = this.calendarRepository.getOrCreate(save, leagueFixtures);

    const nextEntry = calendar.entries[calendar.currentEntryIndex];
    const nextFixture = nextEntry ? {
      id: nextEntry.fixtureId,
      leagueId: nextEntry.leagueId,
      round: nextEntry.round,
      date: nextEntry.date,
      homeTeamId: nextEntry.homeTeamId,
      awayTeamId: nextEntry.awayTeamId,
      homeScore: nextEntry.homeScore,
      awayScore: nextEntry.awayScore,
      status: nextEntry.status,
      quarter: nextEntry.status === "finished" ? 4 : 0,
      clock: nextEntry.status === "finished" ? "00:00" : "12:00",
    } : null;

    const standings = await this.buildStandings(calendar.leagueId, calendar.completedRounds);
    const isFinished = calendar.currentEntryIndex >= calendar.entries.length;
    const playoffSpots = Math.min(8, Math.max(2, Math.floor(standings.length / 2)));

    const summary: SeasonSummary = {
      isFinished,
      championTeamId: isFinished ? standings[0]?.teamId ?? null : null,
      playoffTeamIds: isFinished ? standings.slice(0, playoffSpots).map((row) => row.teamId) : [],
      playoffSpots,
      finalStandings: standings,
    };

    return { calendar, nextFixture, standings, summary };
  }

  async completeCurrentRound(saveId: string, round: number, finishedFixtures: Fixture[]) {
    const save = await this.savesRepository.getSaveById(saveId);
    if (!save) throw new Error("Save não encontrado");

    const leagueFixtures = await this.fixturesRepository.getLatestFixturesByLeague(save.leagueId);
    const calendar = this.calendarRepository.getOrCreate(save, leagueFixtures);
    const currentEntry = calendar.entries[calendar.currentEntryIndex];
    if (!currentEntry) throw new Error("Temporada já finalizada");

    calendar.completedRounds[round] = finishedFixtures.map((fixture) => ({ ...fixture, status: "finished", quarter: 4, clock: "00:00" }));

    calendar.entries = calendar.entries.map((entry, index) => {
      if (index !== calendar.currentEntryIndex) return entry;
      const played = finishedFixtures.find((fixture) => fixture.id === entry.fixtureId);
      if (!played) return { ...entry, status: "finished" };
      return { ...entry, status: "finished", homeScore: played.homeScore, awayScore: played.awayScore };
    });

    calendar.currentEntryIndex = Math.min(calendar.currentEntryIndex + 1, calendar.entries.length);
    calendar.updatedAt = new Date().toISOString();
    this.calendarRepository.upsert(calendar);

    const nextEntry = calendar.entries[calendar.currentEntryIndex];
    const savePatch = {
      currentRound: nextEntry?.round ?? save.currentRound,
      nextFixtureId: nextEntry?.fixtureId ?? save.nextFixtureId,
      updatedAt: new Date().toISOString(),
    };
    this.savesRepository.upsertSaveProgress(saveId, savePatch);

    const standings = await this.buildStandings(save.leagueId, calendar.completedRounds);
    const career = await this.managerCareerService.updateAfterRound(save, finishedFixtures, standings);
    if (Object.keys(career.savePatch).length > 0) {
      this.savesRepository.upsertSaveProgress(saveId, career.savePatch);
    }
    const refreshedSave = await this.savesRepository.getSaveById(saveId);
    const pendingJobOffer = refreshedSave
      ? await this.jobOfferService.generateJobOfferForRound(refreshedSave, round, standings)
      : null;
    const isFinished = calendar.currentEntryIndex >= calendar.entries.length;
    const playoffSpots = Math.min(8, Math.max(2, Math.floor(standings.length / 2)));

    return {
      seasonFinished: isFinished,
      standings,
      championTeamId: isFinished ? standings[0]?.teamId ?? null : null,
      playoffTeamIds: isFinished ? standings.slice(0, playoffSpots).map((row) => row.teamId) : [],
      playoffSpots,
      nextRound: nextEntry?.round ?? null,
      career: {
        dismissed: career.dismissed,
        dismissalReason: career.dismissalReason,
        employmentStatus: refreshedSave?.employmentStatus ?? save.employmentStatus,
        currentClubId: refreshedSave?.currentClubId ?? save.currentClubId,
        boardStars: refreshedSave?.boardReputation ?? save.boardReputation,
        fansStars: refreshedSave?.fansReputation ?? save.fansReputation,
      },
      pendingJobOffer,
    };
  }

  async getPendingJobOffer(saveId: string) {
    return this.jobOfferService.getPendingJobOffer(saveId);
  }

  async acceptJobOffer(saveId: string, offerId: string) {
    return this.jobOfferService.acceptJobOffer(saveId, offerId);
  }

  async rejectJobOffer(saveId: string, offerId: string) {
    return this.jobOfferService.rejectJobOffer(saveId, offerId);
  }

  private async buildStandings(leagueId: string, completedRounds: Record<number, Fixture[]>): Promise<StandingRow[]> {
    const teams = (await this.teamsRepository.getTeamsByLeague(leagueId)).sort((a, b) => b.overall - a.overall);
    const byTeam = new Map<string, StandingRow>(
      teams.map((team, index) => [
        team.id,
        {
          teamId: team.id,
          leagueId,
          played: 0,
          wins: 0,
          losses: 0,
          pointsFor: 0,
          pointsAgainst: 0,
          leaguePoints: 0,
          position: index + 1,
        },
      ]),
    );

    Object.values(completedRounds)
      .flat()
      .forEach((fixture) => {
        const home = byTeam.get(fixture.homeTeamId);
        const away = byTeam.get(fixture.awayTeamId);
        if (!home || !away) return;

        home.played += 1;
        away.played += 1;
        home.pointsFor += fixture.homeScore;
        home.pointsAgainst += fixture.awayScore;
        away.pointsFor += fixture.awayScore;
        away.pointsAgainst += fixture.homeScore;

        if (fixture.homeScore >= fixture.awayScore) {
          home.wins += 1;
          away.losses += 1;
        } else {
          away.wins += 1;
          home.losses += 1;
        }

        home.leaguePoints = home.wins * 2;
        away.leaguePoints = away.wins * 2;
      });

    return Array.from(byTeam.values())
      .sort((a, b) => {
        if (b.leaguePoints !== a.leaguePoints) return b.leaguePoints - a.leaguePoints;
        const aDiff = a.pointsFor - a.pointsAgainst;
        const bDiff = b.pointsFor - b.pointsAgainst;
        if (bDiff !== aDiff) return bDiff - aDiff;
        return b.pointsFor - a.pointsFor;
      })
      .map((row, index) => ({ ...row, position: index + 1 }));
  }
}
