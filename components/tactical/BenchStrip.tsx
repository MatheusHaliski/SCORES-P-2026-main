import { LineupPlayer } from "@/types/matchSession";
import Image from "next/image";
import { getMatchCardStyle, getMatchPanelStyle } from "@/styles/metallicTheme";

export function BenchStrip({
  bench,
  uniformUrl,
  onPick,
}: {
  bench: LineupPlayer[];
  uniformUrl?: string;
  onPick?: (playerId: string) => void;
}) {
  const visible = bench.slice(0, 7);

  return (
    <div className="premium-surface p-3" style={getMatchPanelStyle()}>
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-200">Bench</p>
      <div className="mt-3 grid grid-cols-3 gap-3 md:grid-cols-4 xl:grid-cols-7">
        {visible.length === 0 && Array.from({ length: 7 }).map((_, idx) => (
          <div key={idx} className="h-20 rounded-xl border border-dashed border-white/20 bg-slate-900/50" />
        ))}
        {visible.map((player) => (
          <button key={player.playerId} className="premium-surface p-2 text-left" onClick={() => onPick?.(player.playerId)} style={getMatchCardStyle()}>
            <div className="relative h-12 w-12 overflow-hidden rounded-full border border-cyan-300/50 bg-slate-900">
              {(player as unknown as { photoUrl?: string }).photoUrl ? (
                <Image src={(player as unknown as { photoUrl?: string }).photoUrl ?? ""} alt={player.playerName} fill className="object-cover" />
              ) : uniformUrl ? (
                <Image src={uniformUrl} alt="Uniforme" fill className="object-cover opacity-90" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm font-black text-white">{player.playerName.slice(0, 1)}</div>
              )}
            </div>
            <p className="mt-2 truncate text-[11px] font-semibold text-white">{player.playerName}</p>
            <p className="text-[10px] text-slate-300">OVR {player.overall} • STA {Math.round(player.stamina)}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
