"use client";

import { SectionCard } from "@/components/SectionCard";
import { useLiveRoundSimulation } from "@/hooks/useLiveRoundSimulation";
import { Fixture, Player, StandingRow, Team } from "@/types/game";
import { QuarterProgressHeader } from "@/components/QuarterProgressHeader";
import { LiveRoundFixtureList } from "@/components/LiveRoundFixtureList";
import { PostMatchModal } from "@/components/PostMatchModal";

export function MatchBoardLiveClient({
  saveId,
  leagueId,
  round,
  fixtures,
  teamsById,
  userTeamId,
  userPlayers,
  opponentPlayers,
  standings,
}: {
  saveId: string;
  leagueId: string;
  round: number;
  fixtures: Fixture[];
  teamsById: Record<string, Team>;
  userTeamId: string;
  userPlayers: Player[];
  opponentPlayers: Player[];
  standings: StandingRow[];
}) {
  const { session } = useLiveRoundSimulation({
    saveId,
    leagueId,
    round,
    fixtures,
    teamsById,
    userTeamId,
    players: userPlayers,
    opponentPlayers,
    quarterDuration: 180,
    tickIntervalMs: 500,
    simulatedSecondsPerTick: 3,
  });

  if (!session) {
    return <main className="mx-auto min-h-screen max-w-6xl p-6 text-white">Carregando partida...</main>;
  }

  return (
    <main className="mx-auto min-h-screen max-w-6xl p-6">
      <QuarterProgressHeader session={session} />

      <div className="mt-4">
        <SectionCard title="Rodada completa - placares ao vivo">
          <LiveRoundFixtureList fixtures={session.fixtures} events={session.eventFeed} userTeamId={userTeamId} />
        </SectionCard>
      </div>

      {session.phase === "POST_MATCH" && <PostMatchModal saveId={saveId} standings={standings} teamsById={teamsById} userTeamId={userTeamId} round={round} fixtures={session.fixtures} leagueId={leagueId} />}
    </main>
  );
}
