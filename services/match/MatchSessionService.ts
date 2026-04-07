import { MatchSessionRepository } from "@/repositories/MatchSessionRepository";
import { MatchProgressEngine } from "@/services/match/MatchProgressEngine";
import { QuarterFlowEngine } from "@/services/match/QuarterFlowEngine";
import { MatchEvent } from "@/types/liveMatch";
import { CreateMatchSessionPayload, LineupPlayer, MatchSession, TeamTactic } from "@/types/matchSession";
import { StadiumRevenueService } from "@/services/StadiumRevenueService";

const toLineupPlayer = (player: { id: string; name: string; position: string; overall: number; physicalCondition: number; pace: number; shooting: number; passing: number; dribbling: number; defending: number; physical: number; isStarter: boolean; morale?: LineupPlayer["morale"]; injuryStatus?: LineupPlayer["injuryStatus"]; playstyles?: string[] }): LineupPlayer => ({
  playerId: player.id,
  playerName: player.name,
  position: player.position,
  overall: player.overall,
  stamina: player.physicalCondition,
  pace: player.pace,
  shooting: player.shooting,
  passing: player.passing,
  dribbling: player.dribbling,
  defending: player.defending,
  physical: player.physical,
  morale: player.morale ?? "Contente",
  injuryStatus: player.injuryStatus ?? "Disponível",
  playstyles: player.playstyles ?? [],
  isStarter: player.isStarter,
});

export class MatchSessionService {
  constructor(
    private repository = new MatchSessionRepository(),
    private progressEngine = new MatchProgressEngine(),
    private stadiumRevenueService = new StadiumRevenueService(),
  ) {}

  async loadOrCreate(payload: CreateMatchSessionPayload): Promise<MatchSession> {
    const existing = await this.repository.getBySaveId(payload.saveId);
    if (existing && existing.round === payload.round) return existing;
    if (existing && existing.round !== payload.round) await this.repository.clear(payload.saveId);

    const now = new Date().toISOString();
    const userIsHome = payload.userFixture.homeTeamId === payload.userTeamId;
    const opponentTeamId = userIsHome ? payload.userFixture.awayTeamId : payload.userFixture.homeTeamId;

    const userLineup = payload.players.filter((player) => player.isStarter).slice(0, 5).map(toLineupPlayer);
    const userBench = payload.players.filter((player) => player.isBench).slice(0, 7).map(toLineupPlayer);
    const opponentLineup = payload.opponentPlayers.filter((player) => player.isStarter).slice(0, 5).map(toLineupPlayer);
    const opponentBench = payload.opponentPlayers.filter((player) => player.isBench).slice(0, 7).map(toLineupPlayer);

    const stadiumCapacity = 19000;
    const ticketPrice = 45;
    const revenueEstimate = this.stadiumRevenueService.estimate({
      capacity: stadiumCapacity,
      ticketPrice,
      baseDemand: 0.92,
      teamMomentum: 1.02,
      reputation: 74,
      rivalry: 1.01,
      matchImportance: payload.round > 10 ? 1.12 : 1.04,
    });

    const session: MatchSession = {
      id: `ms-${payload.saveId}`,
      saveId: payload.saveId,
      leagueId: payload.leagueId,
      round: payload.round,
      quarter: 1,
      phase: "Q1",
      timeRemaining: payload.quarterDuration,
      quarterDuration: payload.quarterDuration,
      isFinished: false,
      userTeamId: payload.userTeamId,
      opponentTeamId,
      userTeamTactic: "balanced",
      opponentTeamTactic: "balanced",
      userLineup,
      userBench,
      opponentLineup,
      opponentBench,
      substitutions: [],
      injuredPlayerIds: [],
      pendingInjury: null,
      venueName: `${payload.teamsById[payload.userTeamId]?.shortName ?? "HOME"} Arena`,
      attendance: revenueEstimate.attendance,
      ticketRevenueEstimate: revenueEstimate.matchRevenue,
      fixtures: payload.fixtures.map((fixture) => ({
        id: fixture.id,
        homeTeamId: fixture.homeTeamId,
        awayTeamId: fixture.awayTeamId,
        homeTeamName: payload.teamsById[fixture.homeTeamId]?.shortName ?? fixture.homeTeamId,
        awayTeamName: payload.teamsById[fixture.awayTeamId]?.shortName ?? fixture.awayTeamId,
        homeLogo: payload.teamsById[fixture.homeTeamId]?.logoUrl ?? "🏀",
        awayLogo: payload.teamsById[fixture.awayTeamId]?.logoUrl ?? "🏀",
        homeColor: payload.teamsById[fixture.homeTeamId]?.primaryColor ?? "#1e293b",
        awayColor: payload.teamsById[fixture.awayTeamId]?.primaryColor ?? "#1e293b",
        venueName: `${payload.teamsById[fixture.homeTeamId]?.shortName ?? "HOME"} Arena`,
        homeScore: fixture.homeScore,
        awayScore: fixture.awayScore,
        homeLastScorer: undefined,
        awayLastScorer: undefined,
        isUserMatch: fixture.id === payload.userFixture.id,
        status: fixture.id === payload.userFixture.id ? "live" : "scheduled",
      })),
      eventFeed: [],
      score: {
        user: userIsHome ? payload.userFixture.homeScore : payload.userFixture.awayScore,
        opponent: userIsHome ? payload.userFixture.awayScore : payload.userFixture.homeScore,
      },
      createdAt: now,
      updatedAt: now,
    };

    await this.repository.upsert(session);
    return session;
  }

  async getSession(saveId: string): Promise<MatchSession | null> {
    return this.repository.getBySaveId(saveId);
  }

  async tick(session: MatchSession, simulatedSecondsPerTick: number, random: () => number): Promise<MatchSession> {
    const next = this.progressEngine.tick(session, simulatedSecondsPerTick, random);
    await this.repository.upsert(next);
    return next;
  }

  async continueFromBreak(session: MatchSession): Promise<MatchSession> {
    const phase = QuarterFlowEngine.continueFromBreak(session.phase);
    const next: MatchSession = {
      ...session,
      phase,
      quarter: QuarterFlowEngine.toQuarter(phase),
      timeRemaining: session.quarterDuration,
      fixtures: session.fixtures.map((fixture) => ({
        ...fixture,
        status: fixture.status === "finished" ? "finished" : "live",
      })),
      updatedAt: new Date().toISOString(),
    };
    await this.repository.upsert(next);
    return next;
  }

  async applyTactic(session: MatchSession, tactic: TeamTactic): Promise<MatchSession> {
    const next = { ...session, userTeamTactic: tactic, updatedAt: new Date().toISOString() };
    await this.repository.upsert(next);
    return next;
  }

  async substitute(session: MatchSession, outPlayerId: string, inPlayerId: string): Promise<MatchSession> {
    const outPlayer = session.userLineup.find((player) => player.playerId === outPlayerId);
    const inPlayer = session.userBench.find((player) => player.playerId === inPlayerId);
    if (!outPlayer || !inPlayer) return session;

    const nextLineup = session.userLineup.map((player) => (player.playerId === outPlayerId ? { ...inPlayer, isStarter: true } : player));
    const nextBench = session.userBench.map((player) => (player.playerId === inPlayerId ? { ...outPlayer, isStarter: false } : player));

    const subEvent: MatchEvent = {
      id: `ev-sub-${Date.now()}`,
      fixtureId: session.fixtures.find((fixture) => fixture.isUserMatch)?.id ?? "fixture-user",
      second: 0,
      type: "SUBSTITUTION",
      teamId: session.userTeamId,
      text: `Substituição: sai ${outPlayer.playerName}, entra ${inPlayer.playerName}`,
    };

    const next: MatchSession = {
      ...session,
      userLineup: nextLineup,
      userBench: nextBench,
      substitutions: [...session.substitutions, { outPlayerId, inPlayerId, quarter: session.quarter, at: new Date().toISOString() }],
      eventFeed: [...session.eventFeed, subEvent].slice(-60),
      pendingInjury: session.pendingInjury?.outPlayerId === outPlayerId ? null : session.pendingInjury,
      updatedAt: new Date().toISOString(),
    };

    await this.repository.upsert(next);
    return next;
  }
}
