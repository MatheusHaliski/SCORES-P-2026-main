import Image from "next/image";
import type { EnhancedStandingRow } from "@/components/StandingsTable";
import type { Team } from "@/types/game";

const formTone: Record<"W" | "L", string> = {
  W: "border-emerald-300/60 bg-emerald-400/25 text-emerald-100",
  L: "border-rose-300/60 bg-rose-400/20 text-rose-100",
};

export function TeamRow({
  row,
  team,
  isTopZone,
  isDangerZone,
  isHighlightedTeam,
  selected,
  onClick,
}: {
  row: EnhancedStandingRow;
  team?: Team;
  isTopZone: boolean;
  isDangerZone: boolean;
  isHighlightedTeam: boolean;
  selected: boolean;
  onClick: () => void;
}) {
  const zoneTone = isDangerZone
    ? "border-rose-500/45 bg-rose-950/25"
    : isTopZone
      ? "border-cyan-300/45 bg-cyan-900/20"
      : "border-white/10 bg-slate-900/70";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group grid w-full grid-cols-[62px,1.5fr,0.8fr,0.8fr,1fr,0.9fr,0.9fr] items-center gap-2 rounded-2xl border px-2 py-2 text-left text-xs text-slate-100 transition duration-200 hover:scale-[1.01] hover:shadow-[0_0_30px_rgba(56,189,248,0.25)] ${zoneTone} ${isHighlightedTeam || selected ? "ring-2 ring-cyan-300/70" : ""}`}
    >
      <div>
        <p className="text-[10px] uppercase tracking-[0.16em] text-slate-400">Rank</p>
        <p className="text-xl font-black text-white">#{row.position}</p>
      </div>

      <div className="flex min-w-0 items-center gap-2">
        {team?.logoUrl ? (
          <Image src={team.logoUrl} alt={team.name} width={34} height={34} className="rounded-full border border-white/20 bg-slate-800 object-cover" />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-slate-800">🏀</div>
        )}
        <div className="min-w-0">
          <p className="truncate font-bold text-white">{team?.name ?? row.teamId}</p>
          <p className="truncate text-[11px] text-slate-400">{team?.shortName ?? row.teamId}</p>
        </div>
      </div>

      <p className="text-center font-semibold">{row.wins}-{row.losses}</p>
      <p className="text-center font-semibold text-cyan-200">{(row.winPct * 100).toFixed(1)}%</p>

      <div className="flex justify-center gap-1">
        {(row.form.length ? row.form : (["L", "L", "L", "L", "L"] as Array<"W" | "L">)).map((result, index) => (
          <span key={`${row.teamId}-${index}`} className={`inline-flex h-5 w-5 items-center justify-center rounded-md border text-[10px] font-bold ${formTone[result]}`}>
            {result}
          </span>
        ))}
      </div>

      <p className="text-center font-black text-amber-200">{row.streak}</p>
      <p className="text-center text-[11px] text-slate-300">{row.pointsFor}/{row.pointsAgainst}</p>
    </button>
  );
}
