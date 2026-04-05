import { getTeamsById } from "@/lib/gameUtils";
import { MatchBoardService } from "@/services/MatchBoardService";
import { MatchBoardLiveClient } from "@/app/match-board/MatchBoardLiveClient";

export default async function MatchBoardView({ searchParams }: { searchParams: Promise<{ saveId?: string }> }) {
  const params = await searchParams;
  const saveId = params.saveId ?? "save-001";
  const board = await new MatchBoardService().getLiveBoard(saveId);
  const teamsById = getTeamsById();

  return <MatchBoardLiveClient saveId={saveId} fixtures={board.fixtures} teamsById={teamsById} userTeamId={board.save.teamId} />;
}
