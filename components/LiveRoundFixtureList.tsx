import { FixtureScoreRow } from "@/components/FixtureScoreRow";
import { MatchEvent } from "@/types/liveMatch";
import { LiveFixtureState } from "@/types/matchSession";

const SCORING_TYPES = new Set(["2PT_MADE", "3PT_MADE", "FREE_THROW_MADE"]);

export function LiveRoundFixtureList({
  fixtures,
  events,
  userTeamId,
}: {
  fixtures: LiveFixtureState[];
  events: MatchEvent[];
  userTeamId: string;
}) {
  return (
    <div className="space-y-2">
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
          />
        );
      })}
    </div>
  );
}
