import { Fixture, Team } from "@/types/game";

export function MiniNextMatchCard({ fixture, homeTeam, awayTeam }: { fixture: Fixture; homeTeam?: Team; awayTeam?: Team }) {
  return (
    <div className="rounded-2xl border border-emerald-300/40 bg-emerald-950/60 p-4 text-sm">
      <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">Próxima partida</p>
      <p className="mt-2 text-lg font-bold text-white">
        {homeTeam?.shortName ?? "HOME"} vs {awayTeam?.shortName ?? "AWAY"}
      </p>
      <p className="text-slate-200">Rodada {fixture.round} • {fixture.date}</p>
      <p className="mt-2 text-xs text-slate-300">{fixture.homeTeamId === homeTeam?.id ? "Em casa" : "Fora de casa"}</p>
    </div>
  );
}
