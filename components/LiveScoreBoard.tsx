import { Fixture, Team } from "@/types/game";
import Image from "next/image";

export function LiveScoreBoard({ fixtures, teamsById, highlightTeamId }: { fixtures: Fixture[]; teamsById: Record<string, Team>; highlightTeamId?: string }) {
  return (
    <div className="space-y-3">
      {fixtures.map((fixture) => {
        const home = teamsById[fixture.homeTeamId];
        const away = teamsById[fixture.awayTeamId];
        const highlighted = fixture.homeTeamId === highlightTeamId || fixture.awayTeamId === highlightTeamId;
        return (
          <div key={fixture.id} className={`rounded-2xl border p-3 ${highlighted ? "border-yellow-300/60 bg-yellow-950/30" : "border-white/10 bg-slate-900/80"}`}>
            <div className="grid grid-cols-[40px_1fr_40px] items-center gap-2">
              <div className="relative h-9 w-9 overflow-hidden rounded-full border border-white/25">{home?.logoUrl ? <Image src={home.logoUrl} alt={home.name} fill className="object-cover" /> : null}</div>
              <div className="rounded-lg border border-cyan-300/25 bg-black/70 px-3 py-2 text-center">
                <p className="font-mono text-2xl font-black text-amber-300">{fixture.homeScore} - {fixture.awayScore}</p>
                <p className="text-[10px] uppercase tracking-[.2em] text-emerald-300">Q{fixture.quarter} • {fixture.clock}</p>
              </div>
              <div className="relative h-9 w-9 overflow-hidden rounded-full border border-white/25">{away?.logoUrl ? <Image src={away.logoUrl} alt={away.name} fill className="object-cover" /> : null}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
