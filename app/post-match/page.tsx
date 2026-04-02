import GameAccessGuard from "@/app/components/session/GameAccessGuard";
import { LiveScoreBoard } from "@/components/LiveScoreBoard";
import { SectionCard } from "@/components/SectionCard";
import { StandingsTable } from "@/components/StandingsTable";
import { getTeamsById } from "@/lib/gameUtils";
import { mockFixtures } from "@/mocks/gameData";
import { MatchBoardService } from "@/services/MatchBoardService";
import { StandingsRepository } from "@/repositories/StandingsRepository";

export default async function PostMatchBoardView({ searchParams }: { searchParams: Promise<{ saveId?: string }> }) {
  const params = await searchParams;
  const saveId = params.saveId ?? "save-001";
  const board = await new MatchBoardService().getLiveBoard(saveId);
  const standings = await new StandingsRepository().getStandingsByLeague(board.save.leagueId);
  const teamsById = getTeamsById();
  const finalFixtures = mockFixtures.filter((fixture) => fixture.leagueId === board.save.leagueId && fixture.status === "finished");

  return (
    <><GameAccessGuard /><main className="mx-auto min-h-screen max-w-7xl p-6">
      <h1 className="text-3xl font-black text-white">PostMatchBoardView</h1>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <SectionCard title="Resultados finais da rodada" subtitle="Time do usuário em destaque">
          <LiveScoreBoard fixtures={finalFixtures.length ? finalFixtures : board.fixtures} teamsById={teamsById} highlightTeamId={board.save.teamId} />
        </SectionCard>
        <SectionCard title="Classificação atualizada" subtitle="Impacto imediato da rodada">
          <StandingsTable rows={standings} teamsById={teamsById} />
          <p className="mt-3 text-xs text-slate-300">MVP da partida: {teamsById[board.save.teamId]?.shortName} - Armador com 24pts/11ast.</p>
        </SectionCard>
      </div>
    </main></>
  );
}
