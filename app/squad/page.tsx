import { getTeamsById } from "@/lib/gameUtils";
import { SquadHomeService } from "@/services/SquadHomeService";
import { TeamsRepository } from "@/repositories/TeamsRepository";
import { StandingsRepository } from "@/repositories/StandingsRepository";
import { LeaguesRepository } from "@/repositories/LeaguesRepository";
import { PlayersRepository } from "@/repositories/PlayersRepository";
import { SquadHomeClient } from "@/components/squad/SquadHomeClient";

export default async function SquadHomeView({ searchParams }: { searchParams: Promise<{ saveId?: string }> }) {
  const params = await searchParams;
  const saveId = params.saveId ?? "save-001";

  const payload = await new SquadHomeService().getSquadHomePayload(saveId);
  const teamsById = getTeamsById();

  const [standings, champions, leagues, allTeams, allPlayers, stadium] = await Promise.all([
    new StandingsRepository().getStandingsByLeague(payload.league.id, saveId),
    new StandingsRepository().getChampionsByLeague(payload.league.id),
    new LeaguesRepository().getLeagues(),
    new TeamsRepository().getTeamsByLeague(payload.league.id),
    new PlayersRepository().getPlayersByTeam(payload.team.id).then((teamPlayers) => Promise.all([
      Promise.resolve(teamPlayers),
      ...Object.keys(teamsById).filter((teamId) => teamId !== payload.team.id).slice(0, 12).map((teamId) => new PlayersRepository().getPlayersByTeam(teamId)),
    ])).then((chunks) => chunks.flat()),
    new TeamsRepository().getStadiumByTeamId(payload.team.id),
  ]);

  return (
    <SquadHomeClient
      payload={payload}
      teamsById={teamsById}
      standings={standings}
      champions={champions}
      leagues={leagues}
      allTeams={allTeams}
      allPlayers={allPlayers}
      stadium={stadium ?? null}
    />
  );
}
