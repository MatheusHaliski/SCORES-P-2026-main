import Link from "next/link";
import { League, Team, UserSave } from "@/types/game";

export function SaveSlotCard({ save, team, league }: { save: UserSave; team?: Team; league?: League }) {
  return (
    <div className="rounded-2xl border border-white/15 bg-slate-900/70 p-4">
      <p className="text-sm font-bold text-white">Save: {save.id}</p>
      <p className="text-sm text-slate-200">{team?.logoUrl} {team?.name} • {league?.name}</p>
      <p className="text-xs text-slate-400">Temp {save.currentSeason} • Rodada {save.currentRound} • Atualizado {new Date(save.updatedAt).toLocaleString()}</p>
      <div className="mt-3 flex gap-2">
        <Link href={`/squad?saveId=${save.id}`} className="rounded bg-cyan-600 px-3 py-1 text-xs font-semibold text-white">Carregar</Link>
        <button className="rounded bg-rose-700 px-3 py-1 text-xs font-semibold text-white">Deletar</button>
      </div>
    </div>
  );
}
