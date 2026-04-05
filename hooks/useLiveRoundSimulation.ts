"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Fixture, Team } from "@/types/game";
import { HalftimeSnapshot, LiveRoundState } from "@/types/liveMatch";
import { LiveRoundSimulationService } from "@/services/simulation/LiveRoundSimulationService";

type UseLiveRoundSimulationParams = {
  saveId: string;
  fixtures: Fixture[];
  teamsById: Record<string, Team>;
  userTeamId: string;
  quarter?: number;
  totalQuarterSeconds?: number;
  tickIntervalMs?: number;
  simulatedSecondsPerTick?: number;
};

const halftimeStorageKey = (saveId: string) => `scores:halftime:${saveId}`;

export function useLiveRoundSimulation(params: UseLiveRoundSimulationParams) {
  const router = useRouter();
  const simulationService = useMemo(() => new LiveRoundSimulationService(), []);
  const [state, setState] = useState<LiveRoundState>(() =>
    simulationService.createInitialState({
      fixtures: params.fixtures,
      teamsById: params.teamsById,
      userTeamId: params.userTeamId,
      quarter: params.quarter ?? 1,
      totalQuarterSeconds: params.totalQuarterSeconds ?? 180,
    }),
  );

  const didNavigateRef = useRef(false);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setState((currentState) =>
        simulationService.tickRound({
          state: currentState,
          simulatedSecondsPerTick: params.simulatedSecondsPerTick ?? 3,
          random: Math.random,
        }),
      );
    }, params.tickIntervalMs ?? 500);

    return () => window.clearInterval(interval);
  }, [params.simulatedSecondsPerTick, params.tickIntervalMs, simulationService]);

  useEffect(() => {
    if (!state.isFinished || didNavigateRef.current) return;
    didNavigateRef.current = true;

    const snapshot: HalftimeSnapshot = {
      saveId: params.saveId,
      quarterFinished: state.progress.quarter,
      savedAt: new Date().toISOString(),
      fixtures: state.fixtures,
      recentEvents: state.events.slice(-15),
      progress: state.progress,
    };

    window.localStorage.setItem(halftimeStorageKey(params.saveId), JSON.stringify(snapshot));
    router.push(`/ht-manager?saveId=${params.saveId}`);
  }, [params.saveId, router, state]);

  return {
    state,
    userFixture: state.fixtures.find((fixture) => fixture.isUserMatch),
    halftimeStorageKey: halftimeStorageKey(params.saveId),
  };
}

export function readHalftimeSnapshot(saveId: string): HalftimeSnapshot | null {
  if (typeof window === "undefined") return null;
  const payload = window.localStorage.getItem(halftimeStorageKey(saveId));
  if (!payload) return null;

  try {
    return JSON.parse(payload) as HalftimeSnapshot;
  } catch {
    return null;
  }
}
