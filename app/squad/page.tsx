import Link from "next/link";
import { MiniNextMatchCard } from "@/components/MiniNextMatchCard";
import { PlayerRowCard } from "@/components/PlayerRowCard";
import { SectionCard } from "@/components/SectionCard";
import { TeamIdentityHeader } from "@/components/TeamIdentityHeader";
import { getTeamsById } from "@/lib/gameUtils";
import { SquadHomeService } from "@/services/SquadHomeService";

const topActions = ["Calendário", "Classificações", "Campeões", "Comprar Jogador", "Salvar Jogo", "Sair", "Buscar", "Empréstimo", "Orçamento", "Estádio"];

export default async function SquadHomeView({ searchParams }: { searchParams: Promise<{ saveId?: string }> }) {
  const params = await searchParams;
  const saveId = params.saveId ?? "save-001";
  const payload = await new SquadHomeService().getSquadHomePayload(saveId);
  const teamsById = getTeamsById();

  return (
    <main className="min-h-screen p-6" style={{ backgroundImage: `${payload.visual.shapeCss}, ${payload.visual.gradientCss}` }}>
      <div className="mx-auto max-w-7xl space-y-4">
        <header className="flex flex-wrap gap-2 rounded-2xl border border-white/20 bg-slate-950/70 p-3">
          {topActions.map((action) => (
            <button key={action} className="rounded border border-white/20 bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-100 hover:bg-slate-700">{action}</button>
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
            <MiniNextMatchCard fixture={payload.nextFixture} homeTeam={teamsById[payload.nextFixture.homeTeamId]} awayTeam={teamsById[payload.nextFixture.awayTeamId]} />
            <Link href={`/match-board?saveId=${payload.save.id}`} className="block rounded-xl bg-cyan-500 px-4 py-3 text-center font-bold text-slate-950">Iniciar Jogo</Link>
          </div>

          <SectionCard title="Elenco Principal" subtitle={payload.save.saveName ?? "Hub de gestão do save"} className="lg:col-span-3">
            <div className="space-y-2">
              {payload.players.map((player) => <PlayerRowCard key={player.id} player={player} />)}
            </div>
          </SectionCard>
        </div>
      </div>
    </main>
  );
}
