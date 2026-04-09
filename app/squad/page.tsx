import { getTeamsById } from "@/lib/gameUtils";
import { SquadHomeService } from "@/services/SquadHomeService";
import { TeamsRepository } from "@/repositories/TeamsRepository";
import { StandingsRepository } from "@/repositories/StandingsRepository";
import { LeaguesRepository } from "@/repositories/LeaguesRepository";
import { PlayersRepository } from "@/repositories/PlayersRepository";
import { SquadHomeClient } from "@/components/squad/SquadHomeClient";
import { UserProfileSidebar } from "@/components/UserProfileSidebar";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME, verifySessionToken } from "@/app/lib/serverSession";

export default async function SquadHomeView({ searchParams }: { searchParams: Promise<{ saveId?: string }> }) {
  const params = await searchParams;
  const saveId = params.saveId ?? "save-001";

  const payload = await new SquadHomeService().getSquadHomePayload(saveId);
  const teamsById = getTeamsById();

  const cookieStore = await cookies();
  const authToken = cookieStore.get(AUTH_COOKIE_NAME)?.value ?? "";
  const session = authToken ? verifySessionToken(authToken) : null;

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


  const stadiumsByTeamId = Object.fromEntries(
    (await Promise.all(allTeams.map(async (team) => [team.id, await new TeamsRepository().getStadiumByTeamId(team.id)] as const))).map(([teamId, teamStadium]) => [teamId, teamStadium ?? null]),
  );

  return (
    <div className="mx-auto grid min-h-screen max-w-[1500px] gap-4 p-4 lg:grid-cols-[280px,1fr]">
      <UserProfileSidebar
        userIdentifier={session?.email ?? payload.save.managerName}
        activeSaveName={payload.save.saveName ?? payload.save.id}
        saveId={payload.save.id}
        initialStudioConfig={payload.save.backgroundStudioConfig}
      />
      <SquadHomeClient
        payload={payload}
        standings={standings}
        champions={champions}
        leagues={leagues}
        allTeams={allTeams}
        allPlayers={allPlayers}
        stadium={stadium ?? null}
        stadiumsByTeamId={stadiumsByTeamId}
      />
    </div>
  );
}
