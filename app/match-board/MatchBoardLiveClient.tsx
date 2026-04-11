"use client";

import { useState } from "react";
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
  });

  if (!session) {
    return <main className="mx-auto min-h-screen max-w-6xl p-6 text-white">Carregando partida...</main>;
  }

  return (
    <main className="mx-auto min-h-screen max-w-6xl p-6">
      {employmentStatus !== "employed" && (
        <div className="mb-3">
          <SpectatorModeBanner />
        </div>
      )}
      <QuarterProgressHeader session={session} />
      <div className="sa-premium-gradient-surface mt-3 rounded-2xl p-3 text-xs text-slate-100">
        <p>Venue: <strong>{session.venueName ?? "Arena principal"}</strong></p>
        <p>Público: <strong>{(session.attendance ?? 0).toLocaleString()}</strong> • Receita estimada: <strong>${(session.ticketRevenueEstimate ?? 0).toLocaleString()}</strong></p>
      </div>

      <div className="mt-4">
        <SectionCard title="Rodada completa - placares ao vivo">
          <LiveRoundFixtureList
            fixtures={session.fixtures}
            events={session.eventFeed}
            userTeamId={userTeamId}
            onOpenTacticalBoard={() => router.push(`/ht-manager?saveId=${saveId}&fixtureId=${session.fixtureId}`)}
          />
        </SectionCard>
      </div>

      {session.phase === "POST_MATCH" && <PostMatchModal saveId={saveId} standings={standings} teamsById={teamsById} userTeamId={userTeamId} round={round} fixtures={session.fixtures} leagueId={leagueId} />}
      {session.pendingInjury && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
          <div className="sa-premium-gradient-surface w-full max-w-xl rounded-2xl border-rose-300/50 p-4 text-sm text-slate-100">
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
