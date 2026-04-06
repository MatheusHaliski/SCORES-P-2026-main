import { LiveFixtureState } from "@/types/matchSession";
import { FixtureScoreRow } from "@/components/FixtureScoreRow";

export function LiveRoundFixtureList({ fixtures }: { fixtures: LiveFixtureState[] }) {
  return (
    <div className="space-y-2">
      {fixtures.map((fixture) => (
        <FixtureScoreRow key={fixture.id} fixture={fixture} />
      ))}
    </div>
  );
}
