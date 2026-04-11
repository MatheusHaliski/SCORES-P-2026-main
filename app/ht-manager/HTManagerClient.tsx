"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { SectionCard } from "@/components/SectionCard";
import { MatchSessionService } from "@/services/match/MatchSessionService";
import { MatchSession } from "@/types/matchSession";
import { MiniCourtBoard } from "@/components/tactical/MiniCourtBoard";
import { TacticSelector } from "@/components/tactical/TacticSelector";
import { BenchStrip } from "@/components/tactical/BenchStrip";
import { defaultTacticalPreset, defaultUniformAssets, TacticalPreset } from "@/types/tactical";
import { getElectronicScoreDisplayStyle, getElectronicScoreShellStyle, getHalftimeBoardStyle, getMatchInfoBarStyle, getMatchPanelStyle } from "@/styles/metallicTheme";

export function HTManagerClient({ saveId, fixtureId }: { saveId: string; fixtureId: string }) {
  const router = useRouter();
  const service = useMemo(() => new MatchSessionService(), []);
  const [session, setSession] = useState<MatchSession | null | undefined>(undefined);
  const [selectedOutPlayerId, setSelectedOutPlayerId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const byFixture = fixtureId ? await service.getSession(saveId, fixtureId) : null;
        const fallback = byFixture ?? await service.getSession(saveId, "");
        setSession(fallback);
      } catch {
        setSession(null);
      }
    };
    void load();
  }, [fixtureId, saveId, service]);

  if (session === undefined) return <p className="text-slate-300">Carregando sessão...</p>;
  if (!session) return <p className="text-rose-200">Sessão de intervalo não encontrada. Retorne ao Match Board para iniciar/retomar a partida.</p>;

  const tacticPreset: TacticalPreset = session.userTacticalPreset ?? { ...defaultTacticalPreset, style: session.userTeamTactic ?? "balanced" };
  const uniforms = session.clubUniformAssets ?? defaultUniformAssets;

  return (
    <div className="space-y-4">
      <SectionCard title={`HTManagerBoardView • ${session.phase}`} style={getHalftimeBoardStyle()}>
        {session.quarterBreakSnapshot && (
          <div className="mb-3 rounded-xl border border-cyan-300/35 bg-cyan-500/10 p-3 text-xs text-cyan-100">
            <p className="font-bold uppercase tracking-[0.16em]">Quarter Break Snapshot • Q{session.quarterBreakSnapshot.quarterJustEnded}</p>
            <p className="mt-1">Score: {session.quarterBreakSnapshot.homeScore} - {session.quarterBreakSnapshot.awayScore} • Rotações restantes: {session.quarterBreakSnapshot.remainingRotations}</p>
          </div>
        )}
        <div className="grid gap-4 lg:grid-cols-[1.5fr,1fr]">
          <MiniCourtBoard lineup={session.userLineup} tactic={tacticPreset} uniforms={uniforms} />
          <div className="space-y-3">
            <div className="sa-premium-gradient-surface rounded-2xl p-3 text-xs text-slate-100" style={getMatchInfoBarStyle()}>
              <p>Público: <strong>{(session.attendance ?? 0).toLocaleString()}</strong></p>
              <p>Receita de bilheteria estimada: <strong>${(session.ticketRevenueEstimate ?? 0).toLocaleString()}</strong></p>
              <p>Substituições: <strong>{session.substitutions.length}</strong></p>
            </div>
            <div className="premium-surface p-3" style={getMatchPanelStyle()}>
              <div className="mb-3 p-1" style={getElectronicScoreShellStyle()}>
                <p className="text-center text-xl" style={getElectronicScoreDisplayStyle()}>{session.score.user} - {session.score.opponent}</p>
              </div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-200">Lineup Swap</p>
              <div className="mt-2 space-y-2">
                {session.userLineup.map((starter) => (
                  <button key={starter.playerId} onClick={() => setSelectedOutPlayerId(starter.playerId)} className={`w-full rounded-xl border px-2 py-2 text-left text-xs ${selectedOutPlayerId === starter.playerId ? "border-amber-300 bg-amber-500/20" : "border-white/15 bg-slate-900/70"}`}>
                    {starter.playerName} • {starter.position} • STA {Math.round(starter.stamina)}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-[11px] text-slate-400">Selecione um titular e depois um reserva para substituir.</p>
            </div>
          </div>
        </div>
      </SectionCard>

      <TacticSelector
        value={tacticPreset}
        onChange={(next) => {
          service.applyTactic(session, next.style, next).then(setSession);
        }}
      />

      <BenchStrip
        bench={session.userBench}
        uniformUrl={uniforms.active_uniform_slot === "away" ? uniforms.away_uniform_2d_url : uniforms.home_uniform_2d_url}
        onPick={(inPlayerId) => {
          if (!selectedOutPlayerId) return;
          service.substitute(session, selectedOutPlayerId, inPlayerId).then((next) => {
            setSession(next);
            setSelectedOutPlayerId(null);
          });
        }}
      />

      <button
        onClick={async () => {
          if (session.phase === "BREAK_Q1" || session.phase === "BREAK_Q2" || session.phase === "BREAK_Q3") {
            const next = await service.continueFromBreak(session);
            setSession(next);
          }
          router.push(`/match-board?saveId=${saveId}&fixtureId=${fixtureId}`);
        }}
        className="premium-control w-full border border-cyan-300/50 bg-cyan-500/20 px-4 py-3 text-sm font-bold text-cyan-100"
        style={getMatchPanelStyle()}
      >
        {session.phase === "BREAK_Q1" || session.phase === "BREAK_Q2" || session.phase === "BREAK_Q3"
          ? `Confirmar ajustes e continuar para Q${session.quarter + 1}`
          : "Voltar para Match Board sem resetar o relógio"}
      </button>
    </div>
  );
}
