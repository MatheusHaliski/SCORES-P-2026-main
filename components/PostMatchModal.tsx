import Link from "next/link";
import { StandingRow, Team } from "@/types/game";
import { StandingsTable } from "@/components/StandingsTable";
import { useState } from "react";

export function PostMatchModal({ saveId, standings, teamsById }: { saveId: string; standings: StandingRow[]; teamsById: Record<string, Team> }) {
  const [showStandings, setShowStandings] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
      <div className="w-full max-w-3xl rounded-2xl border border-white/20 bg-slate-900 p-5">
        <h2 className="text-2xl font-black text-white">PostMatchModal</h2>
        {!showStandings ? (
          <div className="mt-3 flex gap-2">
            <Link href={`/squad?saveId=${saveId}`} className="rounded bg-emerald-600 px-4 py-2 text-sm font-bold text-white">Continuar</Link>
            <button onClick={() => setShowStandings(true)} className="rounded bg-cyan-500 px-4 py-2 text-sm font-bold text-slate-950">Visualizar classificação do campeonato</button>
          </div>
        ) : (
          <div className="mt-3 space-y-3">
            <StandingsTable rows={standings} teamsById={teamsById} playoffSpots={8} dangerSpots={3} />
            <button onClick={() => setShowStandings(false)} className="rounded bg-slate-700 px-3 py-2 text-xs font-bold text-white">Voltar</button>
          </div>
        )}
      </div>
    </div>
  );
}
