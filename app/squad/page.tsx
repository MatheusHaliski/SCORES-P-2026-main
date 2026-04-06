import Link from "next/link";
import { MiniNextMatchCard } from "@/components/MiniNextMatchCard";
import { PlayerRowCard } from "@/components/PlayerRowCard";
import { SectionCard } from "@/components/SectionCard";
import { TeamIdentityHeader } from "@/components/TeamIdentityHeader";
import { getTeamsById } from "@/lib/gameUtils";
import { SquadHomeService } from "@/services/SquadHomeService";

const topActions = [
  { label: "Calendário", tab: "calendar" },
  { label: "Classificações", tab: "standings" },
  { label: "Campeões" },
  { label: "Comprar Jogador" },
  { label: "Salvar Jogo" },
  { label: "Sair" },
  { label: "Buscar" },
  { label: "Empréstimo" },
  { label: "Orçamento" },
  { label: "Estádio" },
];

export default async function SquadHomeView({ searchParams }: { searchParams: Promise<{ saveId?: string; tab?: string }> }) {
  const params = await searchParams;
  const saveId = params.saveId ?? "save-001";
  const selectedTab = params.tab ?? "";
  const payload = await new SquadHomeService().getSquadHomePayload(saveId);
  const teamsById = getTeamsById();
  const seasonFinished = payload.seasonSummary?.isFinished ?? false;

  return (
    <main className="min-h-screen p-6" style={{ backgroundImage: `${payload.visual.shapeCss}, ${payload.visual.gradientCss}` }}>
      <div className="mx-auto max-w-7xl space-y-4">
        <header className="flex flex-wrap gap-2 rounded-2xl border border-white/20 bg-slate-950/70 p-3">
          {topActions.map((action) => (
            action.tab ? (
              <Link key={action.label} href={`/squad?saveId=${saveId}&tab=${action.tab}`} className="rounded border border-white/20 bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-100 hover:bg-slate-700">{action.label}</Link>
            ) : (
              <button key={action.label} className="rounded border border-white/20 bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-100 hover:bg-slate-700">{action.label}</button>
            )
          ))}
        </header>

        <div className="grid gap-4 lg:grid-cols-4">
          <div className="space-y-4 lg:col-span-1">
            <TeamIdentityHeader
              team={payload.team}
              managerName={payload.save.managerName}
              uniforms={payload.uniforms}
              boardReputation={payload.save.boardReputation}
              fansReputation={payload.save.fansReputation}
            />

            {payload.nextFixture ? (
              <MiniNextMatchCard fixture={payload.nextFixture} homeTeam={teamsById[payload.nextFixture.homeTeamId]} awayTeam={teamsById[payload.nextFixture.awayTeamId]} />
            ) : (
              <div className="rounded-2xl border border-amber-300/40 bg-amber-950/60 p-4 text-sm text-amber-100">
                <p className="text-xs uppercase tracking-[0.2em] text-amber-300">Temporada finalizada</p>
                <p className="mt-2 font-bold">Sem jogos pendentes no calendário.</p>
              </div>
            )}

            {!seasonFinished && payload.nextFixture && (
              <Link href={`/match-board?saveId=${payload.save.id}`} className="block rounded-xl bg-cyan-500 px-4 py-3 text-center font-bold text-slate-950">Iniciar Jogo</Link>
            )}
          </div>

          <SectionCard title="Elenco Principal" subtitle="Hub de gestão do save" className="lg:col-span-3">
            {selectedTab === "calendar" && (
              <div className="mb-4 rounded-lg border border-white/20 bg-slate-900/60 p-3 text-sm text-slate-100">
                <p className="text-xs uppercase tracking-[0.16em] text-cyan-300">Calendário da equipe</p>
                <ul className="mt-2 space-y-1">
                  {(payload.seasonCalendar?.entries ?? []).map((entry) => (
                    <li key={entry.fixtureId} className="flex justify-between gap-2 rounded bg-slate-800/70 px-2 py-1">
                      <span>R{entry.round} • {teamsById[entry.homeTeamId]?.shortName ?? entry.homeTeamId} vs {teamsById[entry.awayTeamId]?.shortName ?? entry.awayTeamId}</span>
                      <span>{entry.status === "finished" ? `${entry.homeScore} x ${entry.awayScore}` : "Agendada"}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {seasonFinished && payload.seasonSummary && (
              <div className="mb-4 rounded-lg border border-emerald-400/40 bg-emerald-500/10 p-3 text-sm text-emerald-100">
                <p className="font-bold">Classificação final da temporada</p>
                <p>Campeão: {payload.seasonSummary.championTeamId ? teamsById[payload.seasonSummary.championTeamId]?.name ?? payload.seasonSummary.championTeamId : "N/A"}</p>
                <p>Classificados para playoffs ({payload.seasonSummary.playoffSpots}): {payload.seasonSummary.playoffTeamIds.map((teamId) => teamsById[teamId]?.shortName ?? teamId).join(", ")}</p>
              </div>
            )}

            <div className="space-y-2">
              {payload.players.map((player) => <PlayerRowCard key={player.id} player={player} />)}
            </div>
          </SectionCard>
        </div>
      </div>
    </main>
  );
}
