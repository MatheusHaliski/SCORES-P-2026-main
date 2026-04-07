import Image from "next/image";
import { StandingRow, Team } from "@/types/game";

export function StandingsTable({
  rows,
  teamsById,
  playoffSpots = 8,
  dangerSpots = 3,
  highlightTeamId,
  leagueName,
  leagueLogo,
}: {
  rows: StandingRow[];
  teamsById: Record<string, Team>;
  playoffSpots?: number;
  dangerSpots?: number;
  highlightTeamId?: string;
  leagueName?: string;
  leagueLogo?: string;
}) {
  const total = rows.length;
  const renderLogo = (logo: string, label: string, size = 26) => {
    const isImage = logo.startsWith("/") || logo.startsWith("http") || logo.startsWith("data:");
    if (isImage) return <Image src={logo} alt={label} width={size} height={size} className="rounded-md" />;
    return <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-slate-800 text-base">{logo}</span>;
  };

  return (
    <div className="space-y-3">
      {(leagueName || leagueLogo) && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-300/25 bg-gradient-to-r from-emerald-600/20 to-cyan-500/5 p-3">
          {leagueLogo ? renderLogo(leagueLogo, leagueName ?? "Liga", 34) : null}
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-emerald-200">Classificação</p>
            <p className="text-base font-black text-white">{leagueName ?? "Liga atual"}</p>
          </div>
        </div>
      )}
      <div className="grid gap-2">
        {rows.map((row) => {
          const team = teamsById[row.teamId];
          const isPlayoff = row.position <= playoffSpots;
          const isDanger = row.position > total - dangerSpots;
          const isCutoffRow = row.position === playoffSpots || row.position === total - dangerSpots;
          const isHighlightedTeam = row.teamId === highlightTeamId;
          const zoneClass = isDanger
            ? "border-rose-400/45 bg-rose-500/20"
            : isPlayoff
              ? "border-emerald-400/45 bg-emerald-500/20"
              : "border-white/15 bg-slate-900/70";
          const cutoffClass = isCutoffRow ? "ring-1 ring-amber-300/70" : "";

          return (
            <div key={row.teamId} className={`grid grid-cols-[56px,1.6fr,repeat(6,minmax(38px,1fr))] items-center gap-2 rounded-xl border p-2 text-xs text-slate-100 ${zoneClass} ${cutoffClass} ${isHighlightedTeam ? "ring-2 ring-yellow-300/80" : ""}`}>
              <div className="text-center">
                <p className="text-[10px] uppercase tracking-wide text-slate-300">Pos</p>
                <p className="text-xl font-black text-white">#{row.position}</p>
              </div>
              <div className="flex items-center gap-2">
                {renderLogo(team?.logoUrl ?? "🏀", team?.name ?? row.teamId)}
                <div className="min-w-0">
                  <p className="truncate font-bold text-white">{team?.name ?? row.teamId}</p>
                  <p className="text-[11px] text-slate-300">{team?.shortName ?? row.teamId}</p>
                </div>
              </div>
              <p className="text-center"><span className="block text-[10px] text-slate-400">J</span>{row.played}</p>
              <p className="text-center"><span className="block text-[10px] text-slate-400">W</span>{row.wins}</p>
              <p className="text-center"><span className="block text-[10px] text-slate-400">L</span>{row.losses}</p>
              <p className="text-center"><span className="block text-[10px] text-slate-400">PF</span>{row.pointsFor}</p>
              <p className="text-center"><span className="block text-[10px] text-slate-400">PA</span>{row.pointsAgainst}</p>
              <p className="text-center font-black text-cyan-200"><span className="block text-[10px] text-slate-400">Pts</span>{row.leaguePoints}</p>
            </div>
          );
        })}
      </div>
      <div className="grid gap-2 text-[11px] text-slate-200 sm:grid-cols-3">
        <div className="rounded-lg border border-emerald-400/40 bg-emerald-500/20 px-2 py-1">Playoffs (Top {playoffSpots})</div>
        <div className="rounded-lg border border-amber-300/50 bg-amber-400/15 px-2 py-1">Linha de corte</div>
        <div className="rounded-lg border border-rose-400/40 bg-rose-500/20 px-2 py-1">Zona de risco (Bottom {dangerSpots})</div>
      </div>
    </div>
  );
}
