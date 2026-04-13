import { readGlobalDb } from "@/lib/globalDb";
import { Team } from "@/types/game";

export function getTeamsById(): Record<string, Team> {
  return Object.fromEntries(readGlobalDb().teams.map((team) => [team.id, team]));
}
