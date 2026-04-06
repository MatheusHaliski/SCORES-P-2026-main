import { League, Player, Team } from "@/types/game";

export class GlobalSearchService {
  filterLeagues(leagues: League[], query: string) {
    const q = query.trim().toLowerCase();
    if (!q) return leagues;
    return leagues.filter((league) => `${league.name} ${league.country} ${league.format}`.toLowerCase().includes(q));
  }

  filterClubs(teams: Team[], query: string) {
    const q = query.trim().toLowerCase();
    if (!q) return teams;
    return teams.filter((team) => `${team.name} ${team.shortName}`.toLowerCase().includes(q));
  }

  filterPlayers(players: Player[], query: string, filters: { position?: string; minOverall?: number; listedOnly?: boolean }) {
    const q = query.trim().toLowerCase();
    return players.filter((player) => {
      const byQuery = !q || `${player.name} ${player.position}`.toLowerCase().includes(q);
      const byPosition = !filters.position || player.position === filters.position;
      const byOverall = !filters.minOverall || player.overall >= filters.minOverall;
      const byListed = !filters.listedOnly || !!player.isTransferListed;
      return byQuery && byPosition && byOverall && byListed;
    });
  }
}
