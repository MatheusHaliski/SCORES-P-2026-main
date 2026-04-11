import { TeamColorBadge } from "@/components/TeamColorBadge";
import { LiveFixtureState } from "@/types/matchSession";
import { MatchEvent } from "@/types/liveMatch";
import { getElectronicScoreDisplayStyle, getElectronicScoreShellStyle, getMatchCardStyle } from "@/styles/metallicTheme";

const SCORING_TYPES = new Set(["2PT_MADE", "3PT_MADE", "FREE_THROW_MADE"]);

const formatMinute = (seconds: number) => `${Math.max(1, Math.floor(seconds / 60))}'`;
const formatStatusLabel = (status: LiveFixtureState["status"]) => {
  if (status === "break") return "BREAK";
  return status.toUpperCase();
};

export function FixtureScoreRow({
  fixture,
  latestScoreEvent,
  userTeamId,
  onOpenTacticalBoard,
}: {
  fixture: LiveFixtureState;
  latestScoreEvent?: MatchEvent;
  userTeamId: string;
  onOpenTacticalBoard?: (fixtureId: string) => void;
}) {
  const scoredByUserClub = latestScoreEvent?.teamId === userTeamId;
  const hasScoreInfo = !!latestScoreEvent && SCORING_TYPES.has(latestScoreEvent.type);

  return (
    <button
      type="button"
      onClick={() => onOpenTacticalBoard?.(fixture.id)}
      className={`w-full rounded-xl border p-3 text-left transition hover:-translate-y-0.5 ${fixture.isUserMatch ? "hover:shadow-[0_0_30px_rgba(232,208,149,0.35)]" : "hover:shadow-[0_0_24px_rgba(210,218,227,0.2)]"}`}
      style={getMatchCardStyle(fixture.isUserMatch)}
    >
      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3">
        <TeamColorBadge name={fixture.homeTeamName} color={fixture.homeColor} logo={fixture.homeLogo} side="home" />
        <div className="p-1" style={getElectronicScoreShellStyle()}>
          <p className="whitespace-nowrap px-4 py-1 text-lg sm:text-xl" style={getElectronicScoreDisplayStyle()}>
            {fixture.homeScore} - {fixture.awayScore}
          </p>
        </div>
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

      <p className="mt-2 text-center text-[11px] uppercase tracking-wider text-slate-300">{formatStatusLabel(fixture.status)} • {fixture.venueName}</p>
    </button>
  );
}
