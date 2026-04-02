import { Fixture, Team } from "@/types/game";

export function LiveScoreBoard({ fixtures, teamsById, highlightTeamId }: { fixtures: Fixture[]; teamsById: Record<string, Team>; highlightTeamId?: string }) {
  return (
    <div className="space-y-3">
      {fixtures.map((fixture) => {
        const home = teamsById[fixture.homeTeamId];
        const away = teamsById[fixture.awayTeamId];
        const highlighted = fixture.homeTeamId === highlightTeamId || fixture.awayTeamId === highlightTeamId;
        return (
          <div key={fixture.id} className={`rounded-xl border p-3 ${highlighted ? "border-yellow-300 bg-yellow-950/30" : "border-white/10 bg-slate-800/70"}`}>
            <p className="text-xs text-slate-300">Q{fixture.quarter} • {fixture.clock} • {fixture.status}</p>
            <p className="mt-1 text-lg font-bold text-white">
              {home?.shortName} {fixture.homeScore} - {fixture.awayScore} {away?.shortName}
            </p>
          </div>
        );
      })}
    </div>
  );
}
