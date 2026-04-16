"use client";

import { useEffect, useMemo, useState } from "react";
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
import { FreeThrowShooterModal } from "@/components/FreeThrowShooterModal";
import { ScoringEventCallout } from "@/components/ScoringEventCallout";
import { ScoreBreakdownPanel } from "@/components/ScoreBreakdownPanel";
import { MatchSessionService } from "@/services/match/MatchSessionService";
import { EjectionAlert } from "@/components/EjectionAlert";
import { InterruptionAlertToast } from "@/components/InterruptionAlertToast";
import { interruptionAlertText } from "@/services/match/InterruptionEngine";

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

  const { session, feedback, setSession } = useLiveRoundSimulation({
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
  const [calloutIndex, setCalloutIndex] = useState(0);
  const [interruptionAlert, setInterruptionAlert] = useState<string | null>(null);
  const [ejectionAlert, setEjectionAlert] = useState<string | null>(null);
  const matchSessionService = useMemo(() => new MatchSessionService(), []);

  useEffect(() => {
    if (!session) return;
    const isTransitionPhase = session.phase === "BREAK_Q1" || session.phase === "BREAK_Q2" || session.phase === "BREAK_Q3" || session.phase === "POST_MATCH";
    if (!isTransitionPhase) return;
    setTransitionVisible(true);
    const timeout = window.setTimeout(() => setTransitionVisible(false), 2200);
    return () => window.clearTimeout(timeout);
  }, [session]);

  useEffect(() => {
    if (!session?.scoringSettings.scoringEventCallouts) return;
    if (!session.scoreEvents.length) return;
    const timer = window.setTimeout(() => {
      setCalloutIndex((prev) => (prev + 1) % Math.max(1, session.scoreEvents.length));
    }, 1400);
    return () => window.clearTimeout(timer);
  }, [session?.scoreEvents, session?.scoringSettings.scoringEventCallouts]);

  useEffect(() => {
    if (!session?.scoringSettings.showInterruptionAlerts) return;
    const topInterruption = session.interruptionQueue[0];
    if (!topInterruption) return;
    const message = interruptionAlertText(topInterruption);
    if (topInterruption.type === "ejection") {
      setEjectionAlert(message);
      const timer = window.setTimeout(() => setEjectionAlert(null), 1800);
      return () => window.clearTimeout(timer);
    }
    setInterruptionAlert(message);
    const timer = window.setTimeout(() => setInterruptionAlert(null), 1300);
    return () => window.clearTimeout(timer);
  }, [session?.interruptionQueue, session?.scoringSettings.showInterruptionAlerts]);

  if (!session) {
    return (
      <main
        className="min-h-screen w-full bg-cover bg-center bg-no-repeat p-6 text-white"
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
  const activeCallout = session.scoreEvents.length ? session.scoreEvents[Math.min(calloutIndex, session.scoreEvents.length - 1)] : null;
  const pendingFTForUser = session.pendingFreeThrow?.teamId === session.userTeamId ? session.pendingFreeThrow : null;
  const scoringSettings = session.scoringSettings ?? {
    freeThrowShooterMode: "auto" as const,
    interruptionFrequency: "balanced" as const,
    showInterruptionAlerts: true,
    scoringEventCallouts: true,
    detailedScoreBreakdown: true,
    showShotTypeLabels: true,
    showScorerAssetBadge: true,
  };

  return (
    <main
      className="min-h-screen w-full bg-cover bg-center bg-no-repeat p-6"
      style={{
        backgroundImage: "linear-gradient(180deg, rgba(2,6,23,0), rgba(2,6,23,0)), url('/Captura%20de%20tela%202026-04-16%20114540.jpg')",
        transform: `translateY(${(feedback?.cameraShake ?? 0) * -0.5}px)`,
        transitionDuration: `${Math.max(120, Math.round(300 / (feedback?.transitionSpeedMultiplier ?? 1)))}ms`,
      }}
    >
      <EjectionAlert message={ejectionAlert} />
      <InterruptionAlertToast text={interruptionAlert} />
      <BroadcastScoreBug session={session} userIsHome={!!userIsHome} feedback={feedback} />
      <ScoringEventCallout event={scoringSettings.scoringEventCallouts ? activeCallout : null} showAssetBadge={scoringSettings.showScorerAssetBadge} showShotType={scoringSettings.showShotTypeLabels} />
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
      {!!feedback?.eventCallouts.length && (
        <div className="mt-2 flex flex-wrap gap-2">
          {feedback.eventCallouts.map((callout) => (
            <span key={callout} className="rounded-full border border-fuchsia-300/45 bg-fuchsia-500/20 px-2 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-fuchsia-100">{callout}</span>
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
      <section className="mt-3 rounded-2xl border border-cyan-300/30 bg-slate-900/70 p-3">
        <p className="mb-2 text-xs font-black uppercase tracking-[0.2em] text-cyan-100">NextMatchView • Scoring Controls</p>
        <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-6">
          <label className="text-xs">FT Shooter Mode
            <select className="mt-1 w-full rounded-lg border border-white/15 bg-slate-800 p-2" value={scoringSettings.freeThrowShooterMode} onChange={(event) => {
              matchSessionService.updateScoringSettings(session, { freeThrowShooterMode: event.target.value as "auto" | "manual" }).then(setSession);
            }}>
              <option value="auto">Auto</option>
              <option value="manual">Manual</option>
            </select>
          </label>
          <label className="text-xs">Interruption Frequency
            <select className="mt-1 w-full rounded-lg border border-white/15 bg-slate-800 p-2" value={scoringSettings.interruptionFrequency} onChange={(event) => {
              matchSessionService.updateScoringSettings(session, { interruptionFrequency: event.target.value as "low" | "balanced" | "realistic" }).then(setSession);
            }}>
              <option value="low">Low</option>
              <option value="balanced">Balanced</option>
              <option value="realistic">Realistic</option>
            </select>
          </label>
          {[
            { label: "Show Alerts", key: "showInterruptionAlerts" as const },
            { label: "Scoring Callouts", key: "scoringEventCallouts" as const },
            { label: "Detailed Breakdown", key: "detailedScoreBreakdown" as const },
            { label: "Shot Type Labels", key: "showShotTypeLabels" as const },
            { label: "Scorer Asset Badge", key: "showScorerAssetBadge" as const },
          ].map((item) => (
            <label key={item.key} className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-slate-800/70 px-2 py-1 text-xs">
              <input type="checkbox" checked={scoringSettings[item.key]} onChange={(event) => {
                matchSessionService.updateScoringSettings(session, { [item.key]: event.target.checked }).then(setSession);
              }} />
              {item.label}
            </label>
          ))}
        </div>
      </section>
      {scoringSettings.detailedScoreBreakdown && <div className="mt-3"><ScoreBreakdownPanel session={session} /></div>}
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
      <FreeThrowShooterModal
        open={!!pendingFTForUser && scoringSettings.freeThrowShooterMode === "manual" && !pendingFTForUser.selectedShooterPlayerId && !session.pendingInjury}
        session={session}
        attempts={pendingFTForUser?.attempts ?? 1}
        candidates={session.userLineup}
        onSelect={async (playerId) => {
          const next = await matchSessionService.selectFreeThrowShooter(session, playerId);
          setSession(next);
        }}
      />
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
