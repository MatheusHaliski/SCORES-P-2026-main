import Image from "next/image";
import type { Player, Team } from "@/types/game";

type ProjectedPlayer = Player & { projected: { points: number; assists: number; rebounds: number } };

export function TopPlayersPanel({ players, teamsById, selectedTeamId }: { players: ProjectedPlayer[]; teamsById: Record<string, Team>; selectedTeamId: string | null }) {
  return (
    <div className="rounded-2xl border border-cyan-300/25 bg-slate-900/80 p-4">
      <p className="text-[11px] uppercase tracking-[0.22em] text-cyan-200">Top 5 Jogadores</p>
      <p className="mb-3 text-lg font-black text-white">Mini Dashboard</p>
      <div className="space-y-2">
        {players.length ? players.map((player, index) => (
          <div key={player.id} className={`grid grid-cols-[34px,1fr,auto] items-center gap-2 rounded-xl border p-2 ${player.teamId === selectedTeamId ? "border-amber-300/50 bg-amber-400/10" : "border-white/10 bg-slate-800/80"}`}>
            <p className="text-lg font-black text-cyan-200">{index + 1}</p>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                {player.photoUrl ? <Image src={player.photoUrl} alt={player.name} width={22} height={22} className="rounded-full object-cover" /> : <span className="text-xs">🏀</span>}
                <p className="truncate font-semibold text-white">{player.name}</p>
              </div>
              <p className="text-xs text-slate-400">{teamsById[player.teamId]?.name ?? player.teamId}</p>
            </div>
            <p className="text-right text-xs text-slate-200">{player.projected.points}/{player.projected.assists}/{player.projected.rebounds}</p>
          </div>
        )) : <p className="text-sm text-slate-400">Sem dados de jogadores nesta liga.</p>}
      </div>
    </div>
  );
}
