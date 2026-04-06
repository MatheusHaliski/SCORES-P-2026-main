import { LiveFixtureState } from "@/types/matchSession";

export function LiveFixtureCard({ fixture }: { fixture: LiveFixtureState }) {
  return (
    <div className="rounded-xl border border-white/10 bg-slate-800/70 p-3">
      <p className="text-[11px] uppercase tracking-wider text-slate-400">{fixture.status}</p>
      <p className="mt-1 text-base font-bold text-white">
        {fixture.homeTeamName} {fixture.homeScore} - {fixture.awayScore} {fixture.awayTeamName}
      </p>
    </div>
  );
}
