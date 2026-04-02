import { Player } from "@/types/game";

export function BenchPlayerCard({ player }: { player: Player }) {
  return (
    <div className="rounded-lg border border-white/15 bg-slate-800/60 p-2 text-xs text-slate-100">
      <p className="font-semibold">{player.name}</p>
      <p>{player.position} • OVR {player.overall} • Cond {player.physicalCondition}%</p>
      <button className="mt-2 rounded bg-indigo-600 px-2 py-1 text-[11px] font-semibold text-white">Substituir</button>
    </div>
  );
}
