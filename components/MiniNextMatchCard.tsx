import { Fixture, Team } from "@/types/game";

function formatDate(dateRaw: string) {
  const date = new Date(dateRaw);
  if (Number.isNaN(date.getTime())) return dateRaw;
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

export function MiniNextMatchCard({
  fixture,
  userTeam,
  homeTeam,
  awayTeam,
  venue,
  primaryColor,
  secondaryColor,
}: {
  fixture: Fixture;
  userTeam: Team;
  homeTeam?: Team;
  awayTeam?: Team;
  venue: string;
  primaryColor: string;
  secondaryColor: string;
}) {
  const isHome = fixture.homeTeamId === userTeam.id;
  const opponent = isHome ? awayTeam : homeTeam;

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-white/30 p-4 text-sm"
      style={{
        backgroundImage: `linear-gradient(140deg, ${primaryColor}cc, #0f172acc), radial-gradient(circle at 20% 10%, ${secondaryColor}55 0%, transparent 40%), repeating-linear-gradient(45deg, transparent 0 10px, rgba(255,255,255,0.05) 10px 20px)`,
      }}
    >
      <div className="absolute -right-8 -top-8 h-24 w-24 rotate-45 border border-white/10" />
      <div className="absolute -bottom-8 left-8 h-20 w-20 rotate-12 border border-white/10" />

      <div className="relative flex items-center justify-between">
        <p className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: secondaryColor }}>NEXT MATCH</p>
        <span className="rounded-full bg-slate-950/70 px-2 py-1 text-[10px] font-bold text-white">{isHome ? "HOME" : "AWAY"}</span>
      </div>

      <div className="relative mt-3 flex items-center justify-between">
        <div>
          <p className="text-lg font-black text-white">{userTeam.shortName} vs {opponent?.shortName ?? "OPP"}</p>
          <p className="text-xs text-slate-100">Rodada {fixture.round} • {formatDate(fixture.date)}</p>
          <p className="mt-2 text-xs text-slate-100">Venue: <span className="font-semibold" style={{ color: secondaryColor }}>{venue}</span></p>
          <p className="text-xs text-slate-200">{isHome ? "Mando do seu clube" : "Partida fora de casa"}</p>
        </div>
        <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-white/30 bg-slate-900/60 text-3xl">
          {opponent?.logoUrl ?? "🏀"}
        </div>
      </div>
    </div>
  );
}
