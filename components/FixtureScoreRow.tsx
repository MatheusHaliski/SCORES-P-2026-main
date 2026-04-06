import { TeamColorBadge } from "@/components/TeamColorBadge";
import { LiveFixtureState } from "@/types/matchSession";
import { MatchEvent } from "@/types/liveMatch";

const SCORING_TYPES = new Set(["2PT_MADE", "3PT_MADE", "FREE_THROW_MADE"]);

const formatMinute = (seconds: number) => `${Math.max(1, Math.floor(seconds / 60))}'`;

export function FixtureScoreRow({
  fixture,
  latestScoreEvent,
  userTeamId,
}: {
  fixture: LiveFixtureState;
  latestScoreEvent?: MatchEvent;
  userTeamId: string;
}) {
  const scoredByUserClub = latestScoreEvent?.teamId === userTeamId;
  const hasScoreInfo = !!latestScoreEvent && SCORING_TYPES.has(latestScoreEvent.type);

  return (
    <div className={`rounded-xl border p-3 ${fixture.isUserMatch ? "border-yellow-300 bg-yellow-500/10" : "border-white/10 bg-slate-900/70"}`}>
      <div className="grid grid-cols-[auto_1fr_auto_1fr_auto] items-center gap-2">
        <TeamColorBadge name={fixture.homeTeamName} color={fixture.homeColor} logo={fixture.homeLogo} side="home" />
        <p className="truncate text-right text-[11px] font-semibold uppercase tracking-wide text-slate-300">{fixture.homeScore} pts</p>
        <p className="text-lg font-black text-white">{fixture.homeScore} x {fixture.awayScore}</p>
        <p className="truncate text-left text-[11px] font-semibold uppercase tracking-wide text-slate-300">{fixture.awayScore} pts</p>
        <TeamColorBadge name={fixture.awayTeamName} color={fixture.awayColor} logo={fixture.awayLogo} side="away" />
      </div>

      <div
        className={`mt-2 flex min-h-9 items-center justify-center rounded-lg px-3 text-sm font-semibold text-white ${
          hasScoreInfo && scoredByUserClub ? "bg-yellow-300/25" : "bg-white/5"
        }`}
      >
        {hasScoreInfo ? (
          <p className="w-full truncate text-center whitespace-nowrap">
            <span className="mr-2" aria-hidden>
              🏀
            </span>
            <span>{latestScoreEvent.playerName ?? "Jogador"}</span>
            <span className="ml-2">{formatMinute(latestScoreEvent.second)}</span>
          </p>
        ) : (
          <p className="w-full truncate text-center whitespace-nowrap">Sem ponto registrado</p>
        )}
      </div>

      <p className="mt-2 text-center text-[11px] uppercase tracking-wider text-slate-300">{fixture.status}</p>
    </div>
  );
}
