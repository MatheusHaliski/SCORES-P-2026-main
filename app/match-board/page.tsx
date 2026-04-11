import { redirect } from "next/navigation";
import { getTeamsById } from "@/lib/gameUtils";
import { MatchBoardService } from "@/services/MatchBoardService";
import { MatchBoardLiveClient } from "@/app/match-board/MatchBoardLiveClient";

export default async function MatchBoardView({ searchParams }: { searchParams: Promise<{ saveId?: string; fixtureId?: string; fresh?: string }> }) {
  const params = await searchParams;
  const saveId = params.saveId ?? "save-001";
  const forceFresh = params.fresh === "1";
  const board = await new MatchBoardService().getLiveBoard(saveId, params.fixtureId).catch(() => null);

  if (!board) {
    redirect(`/squad?saveId=${saveId}&tab=standings`);
  }

  const teamsById = getTeamsById();

  return (
    <MatchBoardLiveClient
      saveId={saveId}
      fixtureId={params.fixtureId}
      forceFresh={forceFresh}
      leagueId={board.save.leagueId}
      round={board.save.currentRound}
      fixtures={board.fixtures}
      teamsById={teamsById}
      userTeamId={board.activeTeamId}
      userPlayers={board.userPlayers}
      opponentPlayers={board.opponentPlayers}
      standings={board.standings}
      employmentStatus={board.save.employmentStatus}
    />
  );
}
