import GameAccessGuard from "@/app/components/session/GameAccessGuard";
import Link from "next/link";
import { LiveScoreBoard } from "@/components/LiveScoreBoard";
import { SectionCard } from "@/components/SectionCard";
import { getTeamsById } from "@/lib/gameUtils";
import { MatchBoardService } from "@/services/MatchBoardService";
import { runQuarterSimulationExample } from "@/services/simulation/SimulationDemoService";

export default async function MatchBoardView({ searchParams }: { searchParams: Promise<{ saveId?: string }> }) {
  const params = await searchParams;
  const saveId = params.saveId ?? "save-001";
  const board = await new MatchBoardService().getLiveBoard(saveId);
  const teamsById = getTeamsById();
  const highlighted = board.fixtures.find((fixture) => fixture.homeTeamId === board.save.teamId || fixture.awayTeamId === board.save.teamId);

  const quarterSample = runQuarterSimulationExample();

  return (
    <><GameAccessGuard /><main className="mx-auto min-h-screen max-w-6xl p-6">
      <header className="rounded-2xl border border-white/15 bg-slate-900/70 p-4">
        <h1 className="text-2xl font-black text-white">MatchBoardView</h1>
        <p className="text-sm text-slate-300">Quarter {highlighted?.quarter ?? 1} • Clock {highlighted?.clock ?? "12:00"}</p>
      </header>
      <SectionCard title="Placar ao vivo da rodada" className="mt-4">
        <LiveScoreBoard fixtures={board.fixtures} teamsById={teamsById} highlightTeamId={board.save.teamId} />
      </SectionCard>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <SectionCard title="Exemplo de 1 quarter simulado (48 ticks)">
          <p className="text-sm text-slate-200">
            Parcial: HOME {quarterSample.quarterPoints.home} x {quarterSample.quarterPoints.away} AWAY • Posses H/A: {quarterSample.possessions.home}/{quarterSample.possessions.away}
          </p>
          <p className="text-xs text-slate-400">
            Eficiência ofensiva (pts por 100 posses): H {quarterSample.efficiency.home} • A {quarterSample.efficiency.away}
          </p>
        </SectionCard>

        <SectionCard title="Logs de pontuação por tick">
          <div className="max-h-52 space-y-1 overflow-auto text-xs text-slate-200">
            {quarterSample.events.slice(-10).map((event) => (
              <p key={`${event.tick}-${event.teamId}-${event.points}`}>
                [{event.clock}] {teamsById[event.teamId]?.shortName}: +{event.points} (Q{event.quarter}, quality {event.shotQuality})
              </p>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="mt-4 flex gap-2">
        <Link href={`/ht-manager?saveId=${saveId}`} className="rounded bg-violet-600 px-4 py-2 text-sm font-semibold text-white">Quarter break</Link>
        <Link href={`/post-match?saveId=${saveId}`} className="rounded bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">Encerrar partida</Link>
      </div>
    </main></>
  );
}
