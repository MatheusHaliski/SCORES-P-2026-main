import { LiveFixtureState } from "@/types/matchSession";
import { LiveFixtureCard } from "@/components/LiveFixtureCard";

export function LiveRoundScoreBoard({ fixtures }: { fixtures: LiveFixtureState[] }) {
  const parallelFixtures = fixtures.filter((fixture) => !fixture.isUserMatch);

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Jogos paralelos</p>
      <div className="space-y-2">
        {parallelFixtures.map((fixture) => (
          <LiveFixtureCard key={fixture.id} fixture={fixture} />
        ))}
      </div>
    </div>
  );
}
