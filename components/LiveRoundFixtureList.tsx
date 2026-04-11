import { FixtureScoreRow } from "@/components/FixtureScoreRow";
import { MatchEvent } from "@/types/liveMatch";
import { LiveFixtureState } from "@/types/matchSession";

const SCORING_TYPES = new Set(["2PT_MADE", "3PT_MADE", "FREE_THROW_MADE"]);

export function LiveRoundFixtureList({
  fixtures,
  events,
  userTeamId,
  onOpenTacticalBoard,
}: {
  fixtures: LiveFixtureState[];
  events: MatchEvent[];
  userTeamId: string;
  onOpenTacticalBoard?: (fixtureId: string) => void;
}) {
  return (
    <div className="sa-premium-gradient-surface space-y-2 rounded-2xl border border-white/20 p-3">
      {fixtures.map((fixture) => {
        const latestScoreEvent = [...events]
          .reverse()
          .find((event) => event.fixtureId === fixture.id && SCORING_TYPES.has(event.type));

        return (
          <FixtureScoreRow
            key={fixture.id}
            fixture={fixture}
            latestScoreEvent={latestScoreEvent}
            userTeamId={userTeamId}
            onOpenTacticalBoard={onOpenTacticalBoard}
          />
        );
      })}
    </div>
  );
}
