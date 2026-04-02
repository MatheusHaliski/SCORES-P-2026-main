import { mockTeams } from "@/mocks/gameData";
import { Team } from "@/types/game";

export function getTeamsById(): Record<string, Team> {
  return Object.fromEntries(mockTeams.map((team) => [team.id, team]));
}
