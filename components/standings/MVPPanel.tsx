import Image from "next/image";
import type { Player, Team } from "@/types/game";

type ProjectedPlayer = Player & { projected: { points: number; assists: number; rebounds: number } };

const leaderCard = (title: string, player: ProjectedPlayer | null, value: string, teamsById: Record<string, Team>) => (
  <div className="rounded-xl border border-indigo-300/30 bg-indigo-500/10 p-2">
    <p className="text-[10px] uppercase tracking-[0.18em] text-indigo-200">{title}</p>
    <p className="truncate text-sm font-bold text-white">{player?.name ?? "N/A"}</p>
    <p className="truncate text-xs text-slate-300">{player ? teamsById[player.teamId]?.shortName ?? player.teamId : "—"}</p>
    <p className="text-sm font-black text-cyan-200">{value}</p>
  </div>
);

export function MVPPanel({ mvp, leaders, teamsById }: { mvp: ProjectedPlayer | null; leaders: { byPoints: ProjectedPlayer | null; byAssists: ProjectedPlayer | null; byRebounds: ProjectedPlayer | null }; teamsById: Record<string, Team> }) {
  return (
    <div className="rounded-2xl border border-violet-300/25 bg-gradient-to-b from-violet-900/30 to-slate-950/80 p-4 shadow-[0_0_35px_rgba(167,139,250,0.2)]">
      <p className="text-[11px] uppercase tracking-[0.22em] text-violet-200">MVPs & Destaques</p>
      <p className="mb-3 text-lg font-black text-white">Spotlight da Liga</p>

      {mvp ? (
        <div className="mb-3 rounded-xl border border-cyan-300/35 bg-cyan-500/10 p-3">
          <div className="flex items-center gap-3">
            {mvp.photoUrl ? <Image src={mvp.photoUrl} alt={mvp.name} width={52} height={52} className="rounded-xl border border-white/20 object-cover" /> : <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/20 bg-slate-800 text-lg font-black">{mvp.name.slice(0, 1)}</div>}
            <div>
              <p className="text-[11px] uppercase tracking-[0.16em] text-cyan-200">MVP da Liga</p>
              <p className="text-base font-black text-white">{mvp.name}</p>
              <p className="text-xs text-slate-300">{teamsById[mvp.teamId]?.name ?? mvp.teamId} • OVR {mvp.overall}</p>
            </div>
          </div>
          <p className="mt-2 text-xs text-slate-200">PTS {mvp.projected.points} • AST {mvp.projected.assists} • REB {mvp.projected.rebounds}</p>
        </div>
      ) : (
        <p className="text-sm text-slate-400">Sem dados de jogadores para calcular destaques.</p>
      )}

      <div className="grid gap-2 md:grid-cols-3">
        {leaderCard("Top Scorer", leaders.byPoints, `${leaders.byPoints?.projected.points ?? "-"} PTS`, teamsById)}
        {leaderCard("Assist Leader", leaders.byAssists, `${leaders.byAssists?.projected.assists ?? "-"} AST`, teamsById)}
        {leaderCard("Rebound Leader", leaders.byRebounds, `${leaders.byRebounds?.projected.rebounds ?? "-"} REB`, teamsById)}
      </div>
    </div>
  );
}
