import { LiveFixtureState } from "@/types/matchSession";
import { TeamColorBadge } from "@/components/TeamColorBadge";

export function FixtureScoreRow({ fixture }: { fixture: LiveFixtureState }) {
  return (
    <div className={`rounded-xl border p-3 ${fixture.isUserMatch ? "border-yellow-300 bg-yellow-500/10" : "border-white/10 bg-slate-900/70"}`}>
      <div className="flex items-center justify-between gap-2">
        <TeamColorBadge name={fixture.homeTeamName} color={fixture.homeColor} logo={fixture.homeLogo} />
        <p className="text-lg font-black text-white">{fixture.homeScore} x {fixture.awayScore}</p>
        <TeamColorBadge name={fixture.awayTeamName} color={fixture.awayColor} logo={fixture.awayLogo} />
      </div>
      <p className="mt-2 text-center text-[11px] uppercase tracking-wider text-slate-300">{fixture.status}</p>
    </div>
  );
}
