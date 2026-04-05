import { LiveFixtureState } from "@/types/liveMatch";

export function UserMatchHighlightCard({ fixture }: { fixture: LiveFixtureState }) {
  return (
    <div className="rounded-2xl border border-yellow-300/70 bg-gradient-to-br from-yellow-400/15 via-slate-900/70 to-violet-500/20 p-5 shadow-[0_0_40px_rgba(250,204,21,0.2)]">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-yellow-300">Your match</p>
      <p className="mt-2 text-3xl font-black text-white">
        {fixture.homeTeamName} {fixture.homeScore} - {fixture.awayScore} {fixture.awayTeamName}
      </p>
      <p className="mt-1 text-sm text-slate-300">Status: {fixture.status}</p>
    </div>
  );
}
