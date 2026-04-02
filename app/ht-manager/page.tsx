import GameAccessGuard from "@/app/components/session/GameAccessGuard";
import Link from "next/link";
import { BenchPlayerCard } from "@/components/BenchPlayerCard";
import { PlayerRowCard } from "@/components/PlayerRowCard";
import { SectionCard } from "@/components/SectionCard";
import { TacticSwitcherPanel } from "@/components/TacticSwitcherPanel";
import { SquadHomeService } from "@/services/SquadHomeService";

export default async function HTManagerBoardView({ searchParams }: { searchParams: Promise<{ saveId?: string }> }) {
  const params = await searchParams;
  const saveId = params.saveId ?? "save-001";
  const payload = await new SquadHomeService().getSquadHomePayload(saveId);
  const starters = payload.players.filter((player) => player.isStarter);
  const bench = payload.players.filter((player) => player.isBench);

  return (
    <><GameAccessGuard /><main className="mx-auto min-h-screen max-w-7xl p-6">
      <h1 className="text-3xl font-black text-white">HTManagerBoardView</h1>
      <p className="text-slate-300">Painel de decisão rápida durante intervalo de quarter.</p>
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <SectionCard title="Titulares em quadra" className="lg:col-span-2">
          <div className="space-y-2">{starters.map((player) => <PlayerRowCard key={player.id} player={player} />)}</div>
        </SectionCard>
        <TacticSwitcherPanel />
      </div>
      <SectionCard title="Banco de reservas" className="mt-4">
        <div className="grid gap-2 md:grid-cols-3">{bench.map((player) => <BenchPlayerCard key={player.id} player={player} />)}</div>
      </SectionCard>
      <Link href={`/match-board?saveId=${saveId}`} className="mt-4 inline-block rounded bg-emerald-600 px-4 py-2 text-sm font-bold text-white">Retornar ao jogo</Link>
    </main></>
  );
}
