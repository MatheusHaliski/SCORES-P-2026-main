import Image from "next/image";
import type { EnhancedStandingRow } from "@/components/StandingsTable";
import type { Team } from "@/types/game";
import { TeamRow } from "@/components/standings/TeamRow";

export function LeagueStandingsTable({
  rows,
  teamsById,
  playoffSpots,
  dangerSpots,
  highlightTeamId,
  leagueName,
  leagueLogo,
  selectedTeamId,
  onSelectTeam,
}: {
  rows: EnhancedStandingRow[];
  teamsById: Record<string, Team>;
  playoffSpots: number;
  dangerSpots: number;
  highlightTeamId?: string;
  leagueName?: string;
  leagueLogo?: string;
  selectedTeamId: string | null;
  onSelectTeam: (teamId: string) => void;
}) {
  if (!rows.length) {
    return (
      <div className="rounded-2xl border border-cyan-300/20 bg-slate-900/80 p-4">
        <div className="mb-3 h-6 w-44 animate-pulse rounded bg-slate-700/60" />
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="h-12 animate-pulse rounded-xl bg-slate-800/80" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-cyan-300/25 bg-gradient-to-b from-slate-900/95 to-slate-950/90 p-4 shadow-[0_0_45px_rgba(59,130,246,0.2)]">
      <div className="mb-3 flex items-center justify-between gap-2 border-b border-cyan-300/20 pb-3">
        <div className="flex items-center gap-3">
          {leagueLogo ? <Image src={leagueLogo} alt={leagueName ?? "Liga"} width={34} height={34} className="rounded-full border border-white/20" /> : null}
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-cyan-200">League Dashboard</p>
            <p className="text-lg font-black text-white">{leagueName ?? "Classificações"}</p>
          </div>
        </div>
        <p className="text-xs text-slate-300">Top {playoffSpots} em destaque</p>
      </div>

      <div className="mb-2 grid grid-cols-[62px,1.5fr,0.8fr,0.8fr,1fr,0.9fr,0.9fr] gap-2 px-2 text-[10px] uppercase tracking-[0.2em] text-slate-400">
        <p>Pos</p><p>Equipe</p><p className="text-center">W-L</p><p className="text-center">Win%</p><p className="text-center">Last 5</p><p className="text-center">Streak</p><p className="text-center">PF/PA</p>
      </div>

      <div className="space-y-2">
        {rows.map((row) => {
          const total = rows.length;
          return (
            <TeamRow
              key={row.teamId}
              row={row}
              team={teamsById[row.teamId]}
              isTopZone={row.position <= Math.min(4, playoffSpots)}
              isDangerZone={row.position > total - dangerSpots}
              isHighlightedTeam={row.teamId === highlightTeamId}
              selected={row.teamId === selectedTeamId}
              onClick={() => onSelectTeam(row.teamId)}
            />
          );
        })}
      </div>
    </div>
  );
}
