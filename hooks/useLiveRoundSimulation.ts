"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MatchSessionService } from "@/services/match/MatchSessionService";
import { MatchSession } from "@/types/matchSession";
import { QuarterFlowEngine } from "@/services/match/QuarterFlowEngine";
import { Fixture, Player, Team } from "@/types/game";
import { HalftimeSnapshot } from "@/types/liveMatch";

type Params = {
  saveId: string;
  leagueId: string;
  round: number;
  fixtures: Fixture[];
  players: Player[];
  opponentPlayers: Player[];
  teamsById: Record<string, Team>;
  userTeamId: string;
  tickIntervalMs?: number;
  simulatedSecondsPerTick?: number;
  quarterDuration?: number;
};

export function useLiveRoundSimulation(params: Params) {
  const router = useRouter();
  const service = useMemo(() => new MatchSessionService(), []);
  const [session, setSession] = useState<MatchSession | null>(null);
  const navigatingRef = useRef(false);

  useEffect(() => {
    const userFixture = params.fixtures.find((fixture) => fixture.homeTeamId === params.userTeamId || fixture.awayTeamId === params.userTeamId);
    if (!userFixture) return;

    service
      .loadOrCreate({
        saveId: params.saveId,
        leagueId: params.leagueId,
        round: params.round,
        userTeamId: params.userTeamId,
        userFixture,
        fixtures: params.fixtures,
        players: params.players,
        opponentPlayers: params.opponentPlayers,
        teamsById: params.teamsById,
        quarterDuration: params.quarterDuration ?? 180,
      })
      .then(setSession);
  }, [params, service]);

  useEffect(() => {
    if (!session || !QuarterFlowEngine.isLivePhase(session.phase)) return;

    const interval = window.setInterval(async () => {
      setSession((current) => {
        if (!current || !QuarterFlowEngine.isLivePhase(current.phase)) return current;
        service.tick(current, params.simulatedSecondsPerTick ?? 3, Math.random).then(setSession);
        return current;
      });
    }, params.tickIntervalMs ?? 500);

    return () => window.clearInterval(interval);
  }, [params.simulatedSecondsPerTick, params.tickIntervalMs, service, session]);

  useEffect(() => {
    if (!session || navigatingRef.current) return;

    if (QuarterFlowEngine.isBreakPhase(session.phase)) {
      navigatingRef.current = true;
      router.push(`/ht-manager?saveId=${params.saveId}`);
      return;
    }

  }, [params.saveId, router, session]);

  return { session, setSession };
}


export function readHalftimeSnapshot(saveId: string): HalftimeSnapshot | null {
  if (typeof window === "undefined") return null;

  const rawSession = window.localStorage.getItem(`scores:match_session:${saveId}`);
  if (!rawSession) return null;

  try {
    const session = JSON.parse(rawSession) as MatchSession;
    if (!session) return null;

    const quarterFinished =
      session.phase === "BREAK_Q1"
        ? 1
        : session.phase === "BREAK_Q2"
          ? 2
          : session.phase === "BREAK_Q3"
            ? 3
            : session.phase === "POST_MATCH"
              ? 4
              : null;

    if (!quarterFinished) return null;

    return {
      saveId,
      quarterFinished,
      savedAt: session.updatedAt,
      fixtures: session.fixtures.map((fixture) => ({
        id: fixture.id,
        homeTeamId: fixture.homeTeamId,
        awayTeamId: fixture.awayTeamId,
        homeTeamName: fixture.homeTeamName,
        awayTeamName: fixture.awayTeamName,
        homeScore: fixture.homeScore,
        awayScore: fixture.awayScore,
        isUserMatch: fixture.isUserMatch,
        status: fixture.status === "break" ? "halftime" : fixture.status === "finished" ? "finished" : "live",
      })),
      recentEvents: session.eventFeed.slice(-15),
      progress: {
        quarter: session.quarter,
        elapsedSeconds: session.quarterDuration - session.timeRemaining,
        totalSeconds: session.quarterDuration,
        progressPercent: ((session.quarterDuration - session.timeRemaining) / session.quarterDuration) * 100,
      },
    };
  } catch {
    return null;
  }
}
