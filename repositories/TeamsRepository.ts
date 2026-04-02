import { mockClubVisuals, mockStadiums, mockTeams, mockUniforms } from "@/mocks/gameData";
import { ClubVisual, Stadium, Team, Uniform } from "@/types/game";
import { firestoreDb, shouldUseFirebase } from "@/lib/firebase/config";

export class TeamsRepository {
  async getTeamsByLeague(leagueId: string): Promise<Team[]> {
    if (shouldUseFirebase && firestoreDb) {
      // TODO: query `teams` by leagueId.
    }
    return mockTeams.filter((team) => team.leagueId === leagueId);
  }

  async getTeamById(id: string): Promise<Team | undefined> {
    if (shouldUseFirebase && firestoreDb) {
      // TODO: query one document from `teams`.
    }
    return mockTeams.find((team) => team.id === id);
  }

  async getVisualByTeamId(teamId: string): Promise<ClubVisual | undefined> {
    return mockClubVisuals.find((visual) => visual.teamId === teamId);
  }

  async getUniformsByTeamId(teamId: string): Promise<Uniform[]> {
    return mockUniforms.filter((uniform) => uniform.teamId === teamId);
  }

  async getStadiumByTeamId(teamId: string): Promise<Stadium | undefined> {
    return mockStadiums.find((stadium) => stadium.teamId === teamId);
  }
}
