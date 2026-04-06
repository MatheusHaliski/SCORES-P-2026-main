import { LiveFixtureState } from "@/types/matchSession";
import { TeamColorBadge } from "@/components/TeamColorBadge";

export function FixtureScoreRow({ fixture }: { fixture: LiveFixtureState }) {
  return (
    <div className={`rounded-xl border p-3 ${fixture.isUserMatch ? "border-yellow-300 bg-yellow-500/10" : "border-white/10 bg-slate-900/70"}`}>
      <div className="grid grid-cols-[minmax(130px,1fr)_120px_90px_120px_minmax(130px,1fr)] items-center gap-2">
        <TeamColorBadge name={fixture.homeTeamName} color={fixture.homeColor} logo={fixture.homeLogo} />
        <div className="min-h-[42px] text-center text-[11px] text-amber-100">
          {fixture.homeLastScorer ? (
            <>
              <p className="font-semibold">🏀 {fixture.homeLastScorer.playerName}</p>
              <p className="text-[10px] opacity-85">{fixture.homeLastScorer.minute}</p>
            </>
          ) : (
            <p className="opacity-55">—</p>
          )}
        </div>
        <p className="text-lg font-black text-white">{fixture.homeScore} x {fixture.awayScore}</p>
        <div className="min-h-[42px] text-center text-[11px] text-amber-100">
          {fixture.awayLastScorer ? (
            <>
              <p className="font-semibold">🏀 {fixture.awayLastScorer.playerName}</p>
              <p className="text-[10px] opacity-85">{fixture.awayLastScorer.minute}</p>
            </>
          ) : (
            <p className="opacity-55">—</p>
          )}
        </div>
        <TeamColorBadge name={fixture.awayTeamName} color={fixture.awayColor} logo={fixture.awayLogo} />
      </div>
      <p className="mt-2 text-center text-[11px] uppercase tracking-wider text-slate-300">{fixture.status}</p>
    </div>
  );
}
