import { Player } from "@/types/game";

export function PlayerRowCard({ player }: { player: Player }) {
  return (
    <div className="grid grid-cols-8 gap-2 rounded-xl border border-white/10 bg-slate-800/70 p-2 text-xs text-slate-100">
      <p className="col-span-2 font-semibold">{player.name}</p>
      <p>{player.position}</p>
      <p>OVR {player.overall}</p>
      <p>{player.age} anos</p>
      <p>Cond {player.physicalCondition}%</p>
      <p>${(player.marketValue / 1000000).toFixed(1)}M</p>
      <p className="text-cyan-300">{player.playstyles[0]}</p>
    </div>
  );
}
