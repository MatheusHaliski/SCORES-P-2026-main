import Link from "next/link";
import { SectionCard } from "@/components/SectionCard";
import { GameSetupService } from "@/services/GameSetupService";

export default async function SelectTeamView({ searchParams }: { searchParams: Promise<{ leagueId?: string; teamId?: string }> }) {
  const params = await searchParams;
  const service = new GameSetupService();
  const data = await service.getSetupData(params.leagueId);
  const selectedTeam = data.teams.find((team) => team.id === params.teamId) ?? data.teams[0];

  const defaultManagerName = selectedTeam?.managerDefaultName ?? "SCORES Manager";
  const defaultSaveName = selectedTeam ? `Carreira ${selectedTeam.shortName}` : "Meu Save";

  return (
    <main className="mx-auto min-h-screen max-w-7xl p-6">
      <h1 className="text-3xl font-black text-white">SelectTeamView</h1>
      <p className="text-slate-200">Escolha liga e time para iniciar o modo carreira.</p>
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <SectionCard title="Ligas" className="lg:col-span-1">
          <div className="space-y-2">
            {data.leagues.map((league) => (
              <Link key={league.id} href={`/select-team?leagueId=${league.id}`} className={`block rounded-lg border p-3 ${data.selectedLeague?.id === league.id ? "border-cyan-300 bg-cyan-900/30" : "border-white/10"}`}>
                <p className="font-semibold text-white">{league.logoUrl} {league.name}</p>
                <p className="text-xs text-slate-300">{league.country} • {league.format} • {league.teamCount} times</p>
              </Link>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Times da liga" subtitle={data.selectedLeague?.name} className="lg:col-span-2">
          <div className="grid gap-3 md:grid-cols-2">
            {data.teams.map((team) => (
              <Link key={team.id} href={`/select-team?leagueId=${team.leagueId}&teamId=${team.id}`} className={`rounded-lg border p-3 ${selectedTeam?.id === team.id ? "border-emerald-300 bg-emerald-950/30" : "border-white/10"}`}>
                <p className="font-semibold text-white">{team.logoUrl} {team.name}</p>
                <p className="text-xs text-slate-300">OVR {team.overall} • Budget ${team.budget.toLocaleString()}</p>
                <p className="mt-1 text-xs text-slate-400">{team.summary}</p>
              </Link>
            ))}
          </div>
          {selectedTeam ? (
            <form action="/new-save" method="GET" className="mt-4 space-y-3 rounded-lg border border-white/15 bg-slate-950/40 p-4">
              <input type="hidden" name="leagueId" value={selectedTeam.leagueId} />
              <input type="hidden" name="teamId" value={selectedTeam.id} />
              <div>
                <label htmlFor="managerName" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-200">Nome do Manager</label>
                <input
                  id="managerName"
                  name="managerName"
                  defaultValue={defaultManagerName}
                  maxLength={40}
                  className="w-full rounded-md border border-white/20 bg-slate-900 px-3 py-2 text-sm text-white outline-none ring-cyan-400 placeholder:text-slate-500 focus:ring"
                  placeholder="Ex.: Rafa Manager"
                />
              </div>
              <div>
                <label htmlFor="saveName" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-200">Nome do Save</label>
                <input
                  id="saveName"
                  name="saveName"
                  defaultValue={defaultSaveName}
                  maxLength={60}
                  className="w-full rounded-md border border-white/20 bg-slate-900 px-3 py-2 text-sm text-white outline-none ring-cyan-400 placeholder:text-slate-500 focus:ring"
                  placeholder="Ex.: Projeto Campeão 2026"
                />
              </div>
              <button
                type="submit"
                className="inline-block rounded bg-cyan-600 px-4 py-2 text-sm font-bold text-white"
              >
                Confirmar {selectedTeam.shortName}
              </button>
            </form>
          ) : null}
        </SectionCard>
      </div>
    </main>
  );
}
