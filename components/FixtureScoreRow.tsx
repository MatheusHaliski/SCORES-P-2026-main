import { LiveFixtureState } from "@/types/matchSession";
import { TeamColorBadge } from "@/components/TeamColorBadge";

export function FixtureScoreRow({ fixture }: { fixture: LiveFixtureState }) {
  return (
    <div className={`rounded-xl border p-3 ${fixture.isUserMatch ? "border-yellow-300 bg-yellow-500/10" : "border-white/10 bg-slate-900/70"}`}>
      <div className="grid grid-cols-[auto_1fr_auto_1fr_auto] items-center gap-2">
        <TeamColorBadge name={fixture.homeTeamName} color={fixture.homeColor} logo={fixture.homeLogo} side="home" />
        <p className="truncate text-right text-[11px] font-semibold uppercase tracking-wide text-slate-300">{fixture.homeScore} pts</p>
        <p className="text-lg font-black text-white">{fixture.homeScore} x {fixture.awayScore}</p>
        <p className="truncate text-left text-[11px] font-semibold uppercase tracking-wide text-slate-300">{fixture.awayScore} pts</p>
        <TeamColorBadge name={fixture.awayTeamName} color={fixture.awayColor} logo={fixture.awayLogo} side="away" />
      </div>
      <p className="mt-2 text-center text-[11px] uppercase tracking-wider text-slate-300">{fixture.status}</p>
    </div>
  );
}
