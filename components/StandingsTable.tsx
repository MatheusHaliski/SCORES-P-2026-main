import { StandingRow, Team } from "@/types/game";

export function StandingsTable({ rows, teamsById, playoffSpots = 8, dangerSpots = 3 }: { rows: StandingRow[]; teamsById: Record<string, Team>; playoffSpots?: number; dangerSpots?: number }) {
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
          return (
            <tr key={row.teamId} className={`border-t border-white/10 ${isPlayoff ? "bg-emerald-500/15" : ""} ${isDanger ? "bg-red-500/15" : ""}`}>
              <td>{row.position}</td><td>{teamsById[row.teamId]?.shortName}</td><td>{row.played}</td><td>{row.wins}</td><td>{row.losses}</td><td>{row.pointsFor}</td><td>{row.pointsAgainst}</td><td>{row.leaguePoints}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
