"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SectionCard } from "@/components/SectionCard";
import { useLiveRoundSimulation } from "@/hooks/useLiveRoundSimulation";
import { Fixture, Player, StandingRow, Team } from "@/types/game";
import { QuarterProgressHeader } from "@/components/QuarterProgressHeader";
import { LiveRoundFixtureList } from "@/components/LiveRoundFixtureList";
import { PostMatchModal } from "@/components/PostMatchModal";
import { getLS } from "@/app/lib/SafeStorage";
import { getSimulationSpeedOption, SIMULATION_SPEED_KEY } from "@/app/lib/simulationConfig";
import { SpectatorModeBanner } from "@/components/SpectatorModeBanner";
import { getMatchInfoBarStyle, getMatchPanelStyle } from "@/styles/metallicTheme";
import { BroadcastScoreBug } from "@/components/match/BroadcastScoreBug";
import { QuarterTransitionOverlay } from "@/components/match/PeriodTransitionOverlay";
import { QuarterRecapCards } from "@/components/match/QuarterRecapCards";

export function MatchBoardLiveClient({
  saveId,
  fixtureId,
  forceFresh,
  leagueId,
  round,
  fixtures,
  teamsById,
  userTeamId,
  userPlayers,
  opponentPlayers,
  standings,
  employmentStatus,
}: {
  saveId: string;
  fixtureId?: string;
  forceFresh?: boolean;
  leagueId: string;
  round: number;
  fixtures: Fixture[];
  teamsById: Record<string, Team>;
  userTeamId: string;
  userPlayers: Player[];
  opponentPlayers: Player[];
  standings: StandingRow[];
  employmentStatus: "employed" | "unemployed" | "spectator";
}) {
  const router = useRouter();
  const [simulationSpeedId] = useState(() => {
    const storedSpeed = getLS(SIMULATION_SPEED_KEY);
    return getSimulationSpeedOption(storedSpeed).id;
  });

  const simulationSpeed = getSimulationSpeedOption(simulationSpeedId);

  const { session } = useLiveRoundSimulation({
    saveId,
    fixtureId,
    forceFresh,
    leagueId,
    round,
    fixtures,
    teamsById,
    userTeamId,
    players: userPlayers,
    opponentPlayers,
    quarterDuration: simulationSpeed.quarterDuration,
    tickIntervalMs: simulationSpeed.tickIntervalMs,
    simulatedSecondsPerTick: simulationSpeed.simulatedSecondsPerTick,
    simulationSpeed: simulationSpeed.id,
    enableAutoBreakNavigation: false,
  });
  const [transitionVisible, setTransitionVisible] = useState(false);

  useEffect(() => {
    if (!session) return;
    const isTransitionPhase = session.phase === "BREAK_Q1" || session.phase === "BREAK_Q2" || session.phase === "BREAK_Q3" || session.phase === "POST_MATCH";
    if (!isTransitionPhase) return;
    setTransitionVisible(true);
    const timeout = window.setTimeout(() => setTransitionVisible(false), 2200);
    return () => window.clearTimeout(timeout);
  }, [session]);

  if (!session) {
    return (
      <main
        className="mx-auto min-h-screen max-w-6xl bg-cover bg-center bg-no-repeat p-6 text-white"
        style={{ backgroundImage: "linear-gradient(180deg, rgba(2,6,23,0.72), rgba(2,6,23,0.9)), url('/Captura%20de%20tela%202026-04-16%20114540.jpg')" }}
      >
        Carregando partida...
      </main>
    );
  }

  const sharedClock = `${String(Math.floor(session.timeRemaining / 60)).padStart(2, "0")}:${String(Math.floor(session.timeRemaining % 60)).padStart(2, "0")}`;
  const sharedPeriod = `Q${session.quarter}`;
  const userFixture = session.fixtures.find((fixture) => fixture.isUserMatch);
  const userIsHome = userFixture?.homeTeamId === userTeamId;
  const contextualBanners = session.storyBanners;

  return (
    <main
      className="mx-auto min-h-screen max-w-6xl bg-cover bg-center bg-no-repeat p-6"
      style={{ backgroundImage: "linear-gradient(180deg, rgba(2,6,23,0.7), rgba(2,6,23,0.92)), url('/Captura%20de%20tela%202026-04-16%20114540.jpg')" }}
    >
      <BroadcastScoreBug session={session} userIsHome={!!userIsHome} />
      <QuarterTransitionOverlay phase={session.phase} visible={transitionVisible} />
      {employmentStatus !== "employed" && (
        <div className="mb-3">
          <SpectatorModeBanner />
        </div>
      )}
      <QuarterProgressHeader session={session} />
      {!!contextualBanners.length && (
        <div className="mt-3 grid gap-2 md:grid-cols-3">
          {contextualBanners.map((banner) => (
            <p key={banner} className="rounded-xl border border-cyan-300/30 bg-cyan-900/20 px-3 py-2 text-xs font-semibold text-cyan-100">{banner}</p>
          ))}
        </div>
      )}
      <div className="sa-premium-gradient-surface mt-3 rounded-2xl p-3 text-xs text-slate-100" style={getMatchInfoBarStyle()}>
        <p>Venue: <strong>{session.venueName ?? "Arena principal"}</strong></p>
        <p>Público: <strong>{(session.attendance ?? 0).toLocaleString()}</strong> • Receita estimada: <strong>${(session.ticketRevenueEstimate ?? 0).toLocaleString()}</strong></p>
      </div>
      <div className="mt-3 grid gap-2 md:grid-cols-3">
        <p className="rounded-xl border border-indigo-300/30 bg-indigo-900/20 px-3 py-2 text-xs text-indigo-100">Manager morale: <strong>{Math.round(session.telemetry.managerMorale)}</strong></p>
        <p className="rounded-xl border border-amber-300/30 bg-amber-900/20 px-3 py-2 text-xs text-amber-100">Tactical discipline: <strong>{Math.round(session.telemetry.tacticalDiscipline)}</strong></p>
        <p className="rounded-xl border border-rose-300/30 bg-rose-900/20 px-3 py-2 text-xs text-rose-100">Pressure: <strong>{Math.round(session.telemetry.pressure)}</strong></p>
      </div>
      <QuarterRecapCards session={session} />

      <div className="mt-4">
        <SectionCard title="Rodada completa - placares ao vivo" style={getMatchPanelStyle()}>
          <LiveRoundFixtureList
            fixtures={session.fixtures}
            events={session.eventFeed}
            userTeamId={userTeamId}
            sharedClock={sharedClock}
            sharedPeriod={sharedPeriod}
            onOpenTacticalBoard={() => router.push(`/ht-manager?saveId=${saveId}&fixtureId=${session.fixtureId}`)}
          />
        </SectionCard>
      </div>
      {(session.phase === "BREAK_Q1" || session.phase === "BREAK_Q2" || session.phase === "BREAK_Q3") && (
        <div className="mt-4 flex justify-end">
          <button className="premium-control px-4 py-2 text-xs font-black" onClick={() => router.push(`/ht-manager?saveId=${saveId}&fixtureId=${session.fixtureId}`)}>
            Open Quarter Transition Hub
          </button>
        </div>
      )}

      {session.phase === "POST_MATCH" && <PostMatchModal saveId={saveId} standings={standings} teamsById={teamsById} userTeamId={userTeamId} round={round} fixtures={session.fixtures} leagueId={leagueId} />}
      {session.pendingInjury && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
          <div className="sa-premium-gradient-surface w-full max-w-xl rounded-2xl border-rose-300/50 p-4 text-sm text-slate-100" style={getMatchPanelStyle()}>
            <h3 className="text-lg font-black text-rose-200">InjurySubstitutionModal</h3>
            <p className="mt-2">{session.pendingInjury.outPlayerName} se lesionou. Substituição obrigatória.</p>
            <div className="mt-3 grid gap-2">
              {session.userBench.map((bench) => (
                <button
                  key={bench.playerId}
                  onClick={async () => {
                    const service = new (await import("@/services/match/MatchSessionService")).MatchSessionService();
                    await service.substitute(session, session.pendingInjury?.outPlayerId ?? "", bench.playerId);
                    window.location.reload();
                  }}
                  className="premium-control bg-emerald-600/70 px-3 py-2 text-left text-xs font-bold text-white"
                >
                  Entrar {bench.playerName} ({bench.position})
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
