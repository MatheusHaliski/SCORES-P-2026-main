"use client";

import { MatchTopProgressBar } from "@/components/MatchTopProgressBar";
import { MatchEventFeed } from "@/components/MatchEventFeed";
import { LiveRoundScoreBoard } from "@/components/LiveRoundScoreBoard";
import { UserMatchHighlightCard } from "@/components/UserMatchHighlightCard";
import { SectionCard } from "@/components/SectionCard";
import { useLiveRoundSimulation } from "@/hooks/useLiveRoundSimulation";
import { Fixture, Team } from "@/types/game";

export function MatchBoardLiveClient({
  saveId,
  fixtures,
  teamsById,
  userTeamId,
}: {
  saveId: string;
  fixtures: Fixture[];
  teamsById: Record<string, Team>;
  userTeamId: string;
}) {
  const { state, userFixture } = useLiveRoundSimulation({
    saveId,
    fixtures,
    teamsById,
    userTeamId,
    quarter: 1,
    totalQuarterSeconds: 180,
    tickIntervalMs: 500,
    simulatedSecondsPerTick: 3,
  });

  return (
    <main className="mx-auto min-h-screen max-w-6xl p-6">
      <MatchTopProgressBar progress={state.progress} />

      <div className="mt-4 grid gap-4 lg:grid-cols-[2fr_1fr]">
        <SectionCard title="Jogo do usuário em destaque">
          {userFixture ? <UserMatchHighlightCard fixture={userFixture} /> : <p className="text-sm text-slate-300">Não foi possível localizar o confronto do usuário.</p>}
        </SectionCard>
        <SectionCard title="Feed textual de eventos">
          <MatchEventFeed events={state.events} />
        </SectionCard>
      </div>

      <SectionCard title="Placar ao vivo da rodada" className="mt-4">
        <LiveRoundScoreBoard fixtures={state.fixtures} />
      </SectionCard>
    </main>
  );
}
