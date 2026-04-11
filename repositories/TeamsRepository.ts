import { mockClubVisuals, mockStadiums, mockUniforms } from "@/mocks/gameData";
import { ClubVisual, Stadium, Team, Uniform } from "@/types/game";
import { firestoreDb, shouldUseFirebase } from "@/lib/firebase/config";
import { readGlobalDb, writeGlobalDb } from "@/lib/globalDb";

export class TeamsRepository {
  async getTeamsByLeague(leagueId: string): Promise<Team[]> {
    if (shouldUseFirebase && firestoreDb) {
      // TODO: query `teams` by leagueId.
    }
    return readGlobalDb().teams.filter((team) => team.leagueId === leagueId);
  }

  async getTeamById(id: string): Promise<Team | undefined> {
    if (shouldUseFirebase && firestoreDb) {
      // TODO: query one document from `teams`.
    }
    return readGlobalDb().teams.find((team) => team.id === id);
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

  async updateTeamColors(teamId: string, primaryColor: string, secondaryColor: string): Promise<void> {
    if (shouldUseFirebase && firestoreDb) {
      // TODO: update document in `teams` and `clubVisuals`.
    }

    const globalDb = readGlobalDb();
    const team = globalDb.teams.find((entry) => entry.id === teamId);
    if (team) {
      team.primaryColor = primaryColor;
      team.secondaryColor = secondaryColor;
    }

    const visual = mockClubVisuals.find((entry) => entry.teamId === teamId);
    if (visual) {
      visual.primaryColor = primaryColor;
      visual.secondaryColor = secondaryColor;
      visual.shapeCss = `radial-gradient(circle at 20% 20%, ${secondaryColor}88 0%, transparent 55%), radial-gradient(circle at 85% 70%, ${primaryColor}99 0%, transparent 50%)`;
      visual.gradientCss = `linear-gradient(135deg, ${secondaryColor}, ${primaryColor})`;
    }

    writeGlobalDb({ ...globalDb, version: new Date().toISOString() });
  }
}
