import Image from "next/image";
import { LineupPlayer } from "@/types/matchSession";

export function PlayerPhotoNode({
  player,
  x,
  y,
  role,
  uniformUrl,
  active,
}: {
  player: LineupPlayer;
  x: number;
  y: number;
  role: string;
  uniformUrl?: string;
  active?: boolean;
}) {
  const stamina = Math.max(0, Math.min(100, Math.round(player.stamina)));
  const alertTone = player.injuryStatus === "Lesionado" ? "border-rose-400" : stamina < 35 ? "border-amber-400" : "border-cyan-300";
  const photoUrl = (player as unknown as { photoUrl?: string }).photoUrl;

  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-500"
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      <div className={`relative h-14 w-14 rounded-full border-2 ${alertTone} bg-slate-950/85 p-0.5 shadow-[0_0_25px_rgba(56,189,248,0.35)] ${active ? "ring-2 ring-cyan-300/60" : ""}`}>
        <div className="relative h-full w-full overflow-hidden rounded-full">
          {photoUrl ? (
            <Image src={photoUrl} alt={player.playerName} fill className="object-cover" />
          ) : uniformUrl ? (
            <Image src={uniformUrl} alt="Uniforme" fill className="object-cover opacity-90" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-cyan-500/50 to-indigo-600/50 text-lg font-black text-white">
              {player.playerName.slice(0, 1)}
            </div>
          )}
        </div>
        <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 rounded-full bg-slate-900/95 px-1.5 py-0.5 text-[9px] font-bold text-cyan-100">{role}</span>
      </div>
      <div className="mt-1 h-1.5 w-14 overflow-hidden rounded-full bg-slate-700/80">
        <div className="h-full bg-gradient-to-r from-emerald-400 via-cyan-300 to-sky-400" style={{ width: `${stamina}%` }} />
      </div>
    </div>
  );
}
