import { StandingRow, Team } from "@/types/game";

export function StandingsTable({
  rows,
  teamsById,
  playoffSpots = 8,
  dangerSpots = 3,
  highlightTeamId,
}: {
  rows: StandingRow[];
  teamsById: Record<string, Team>;
  playoffSpots?: number;
  dangerSpots?: number;
  highlightTeamId?: string;
}) {
  const total = rows.length;

  return (
    <table className="w-full text-xs text-slate-100">
      <thead>
        <tr className="text-left text-slate-300">
          <th>Pos</th><th>Time</th><th>J</th><th>W</th><th>L</th><th>PF</th><th>PA</th><th>Pts</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => {
          const isPlayoff = row.position <= playoffSpots;
          const isDanger = row.position > total - dangerSpots;
          const isCutoffRow = row.position === playoffSpots || row.position === total - dangerSpots;
          const isHighlightedTeam = row.teamId === highlightTeamId;
          const baseZoneClass = isDanger
            ? "bg-red-500/35"
            : isPlayoff
              ? "bg-green-500/35"
              : isCutoffRow
                ? "bg-yellow-400/30"
                : "";
          return (
            <tr
              key={row.teamId}
              className={`border-t border-white/10 ${baseZoneClass} ${isHighlightedTeam ? "bg-yellow-300/40 font-extrabold text-white ring-1 ring-inset ring-yellow-300" : ""}`}
            >
              <td>{row.position}</td>
              <td>
                <span className="inline-flex items-center gap-2">
                  <span>{teamsById[row.teamId]?.logoUrl ?? "🏀"}</span>
                  <span>{teamsById[row.teamId]?.shortName}</span>
                </span>
              </td>
              <td>{row.played}</td>
              <td>{row.wins}</td>
              <td>{row.losses}</td>
              <td>{row.pointsFor}</td>
              <td>{row.pointsAgainst}</td>
              <td>{row.leaguePoints}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
