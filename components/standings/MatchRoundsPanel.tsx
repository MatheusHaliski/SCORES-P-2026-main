import Image from "next/image";
import type { Stadium, Team } from "@/types/game";
import type { SeasonCalendarEntry } from "@/types/season";

export function MatchRoundsPanel({
  games,
  teamsById,
  stadiumsByTeamId,
}: {
  games: SeasonCalendarEntry[];
  teamsById: Record<string, Team>;
  stadiumsByTeamId: Record<string, Stadium | null>;
}) {
  const topGame = games.reduce<SeasonCalendarEntry | null>((best, game) => {
    if (!best) return game;
    const margin = Math.abs(game.homeScore - game.awayScore);
    const bestMargin = Math.abs(best.homeScore - best.awayScore);
    return margin < bestMargin ? game : best;
  }, null);

  return (
    <div className="rounded-2xl border border-fuchsia-300/25 bg-slate-900/80 p-4">
      <p className="text-[11px] uppercase tracking-[0.2em] text-fuchsia-200">Última Rodada</p>
      <p className="mb-3 text-lg font-black text-white">Confrontos Recentes</p>
      <div className="space-y-2">
        {games.length ? games.map((game) => {
          const home = teamsById[game.homeTeamId];
          const away = teamsById[game.awayTeamId];
          const stadium = stadiumsByTeamId[game.homeTeamId]?.name ?? "Arena não informada";
          const relevant = topGame?.fixtureId === game.fixtureId;
          return (
            <div key={game.fixtureId} className={`rounded-xl border p-2 ${relevant ? "border-cyan-300/50 bg-cyan-500/10" : "border-white/10 bg-slate-800/80"}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {home?.logoUrl ? <Image src={home.logoUrl} alt={home.name} width={22} height={22} className="rounded-full" /> : <span>🏠</span>}
                  <p className="font-semibold text-white">{home?.shortName ?? game.homeTeamId}</p>
                  <span className="text-slate-500">vs</span>
                  {away?.logoUrl ? <Image src={away.logoUrl} alt={away.name} width={22} height={22} className="rounded-full" /> : <span>✈️</span>}
                  <p className="font-semibold text-white">{away?.shortName ?? game.awayTeamId}</p>
                </div>
                <p className="font-black text-cyan-200">{game.homeScore} - {game.awayScore}</p>
              </div>
              <p className="mt-1 text-xs text-slate-400">🏟️ {stadium} • 🏠 Home / ✈️ Away</p>
            </div>
          );
        }) : <p className="text-sm text-slate-400">Nenhum jogo finalizado ainda.</p>}
      </div>
    </div>
  );
}
