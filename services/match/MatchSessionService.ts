import { MatchSessionRepository } from "@/repositories/MatchSessionRepository";
import { MatchProgressEngine } from "@/services/match/MatchProgressEngine";
import { QuarterFlowEngine } from "@/services/match/QuarterFlowEngine";
import { MatchEvent } from "@/types/liveMatch";
import { CreateMatchSessionPayload, LineupPlayer, MatchSession, TeamTactic } from "@/types/matchSession";
import { StadiumRevenueService } from "@/services/StadiumRevenueService";
import { defaultTacticalPreset, defaultUniformAssets, TacticalPreset } from "@/types/tactical";
import { readClubUniforms, readPreMatchTactic } from "@/lib/tacticalState";

const toLineupPlayer = (player: {
  id: string;
  name: string;
  position: string;
  overall: number;
  physicalCondition: number;
  attributes: LineupPlayer["attributes"];
  macroRatings: LineupPlayer["macroRatings"];
  isStarter: boolean;
  morale?: LineupPlayer["morale"];
  injuryStatus?: LineupPlayer["injuryStatus"];
  playstyles?: string[];
}): LineupPlayer => ({
  playerId: player.id,
  playerName: player.name,
  photoUrl: (player as { photoUrl?: string }).photoUrl,
  position: player.position,
  overall: player.overall,
  stamina: player.physicalCondition,
  attributes: player.attributes,
  macroRatings: player.macroRatings,
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
    const existing = await this.repository.getBySaveId(payload.saveId, payload.fixtureId);
    if (existing && existing.round === payload.round) return existing;
    if (existing && existing.round !== payload.round) await this.repository.clear(payload.saveId, payload.fixtureId);
    return this.createFreshSession(payload);
  }

  async startFreshSession(payload: CreateMatchSessionPayload): Promise<MatchSession> {
    await this.repository.clear(payload.saveId, payload.fixtureId);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(`scores:halftime_snapshot:${payload.saveId}:${payload.fixtureId}`);
      window.localStorage.removeItem(`scores:match_board_temp:${payload.saveId}:${payload.fixtureId}`);
      window.localStorage.removeItem(`scores:pending_injury_prompt:${payload.saveId}:${payload.fixtureId}`);
    }
    return this.createFreshSession(payload);
  }

  private async createFreshSession(payload: CreateMatchSessionPayload): Promise<MatchSession> {
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
      id: `ms-${payload.saveId}-${payload.fixtureId}`,
      saveId: payload.saveId,
      fixtureId: payload.fixtureId,
      leagueId: payload.leagueId,
      round: payload.round,
      quarter: 1,
      phase: "Q1",
      phaseState: "pre-game",
      timeRemaining: payload.quarterDuration,
      quarterDuration: payload.quarterDuration,
      isFinished: false,
      userTeamId: payload.userTeamId,
      opponentTeamId,
      userTeamTactic: "balanced",
      opponentTeamTactic: "balanced",
      userTacticalPreset: typeof window !== "undefined" ? readPreMatchTactic(payload.saveId) : defaultTacticalPreset,
      opponentTacticalPreset: defaultTacticalPreset,
      clubUniformAssets: typeof window !== "undefined" ? readClubUniforms(payload.saveId) : defaultUniformAssets,
      userLineup,
      userBench,
      opponentLineup,
      opponentBench,
      substitutions: [],
      injuredPlayerIds: [],
      injuryCooldownTicks: 0,
      recentEventTypes: [],
      runtimeSeed: Math.floor(Math.random() * 1_000_000_000),
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
      quarterBreakSnapshot: null,
      createdAt: now,
      updatedAt: now,
    };

    await this.repository.upsert(session);
    return session;
  }

  async getSession(saveId: string, fixtureId: string): Promise<MatchSession | null> {
    return this.repository.getBySaveId(saveId, fixtureId);
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
      phaseState: QuarterFlowEngine.toPhaseState(phase),
      quarter: QuarterFlowEngine.toQuarter(phase),
      timeRemaining: session.quarterDuration,
      fixtures: session.fixtures.map((fixture) => ({
        ...fixture,
        status: fixture.status === "finished" ? "finished" : "live",
      })),
      quarterBreakSnapshot: null,
      updatedAt: new Date().toISOString(),
    };
    await this.repository.upsert(next);
    return next;
  }

  async applyTactic(session: MatchSession, tactic: TeamTactic, preset?: TacticalPreset): Promise<MatchSession> {
    const next = {
      ...session,
      userTeamTactic: tactic,
      userTacticalPreset: preset ? { ...session.userTacticalPreset, ...preset, style: tactic } : { ...session.userTacticalPreset, style: tactic },
      clubUniformAssets: typeof window !== "undefined" ? readClubUniforms(session.saveId) : session.clubUniformAssets,
      updatedAt: new Date().toISOString(),
    };
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
