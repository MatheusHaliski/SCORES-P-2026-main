"use client";

import { useMemo } from "react";
import { readHalftimeSnapshot } from "@/hooks/useLiveRoundSimulation";

export function HTLiveContextCard({ saveId }: { saveId: string }) {
  const snapshot = useMemo(() => readHalftimeSnapshot(saveId), [saveId]);

  if (!snapshot) {
    return (
      <div className="mt-4 rounded-xl border border-white/10 bg-slate-900/50 p-4 text-sm text-slate-300">
        Sem snapshot de quarter salvo para este save.
      </div>
    );
  }

  const userFixture = snapshot.fixtures.find((fixture) => fixture.isUserMatch);

  return (
    <div className="mt-4 rounded-xl border border-cyan-400/40 bg-cyan-500/10 p-4">
      <p className="text-xs font-semibold uppercase tracking-widest text-cyan-200">Quarter summary recebido da MatchView</p>
      {userFixture ? (
        <p className="mt-2 text-lg font-bold text-white">
          Q{snapshot.quarterFinished} • {userFixture.homeTeamName} {userFixture.homeScore} - {userFixture.awayScore} {userFixture.awayTeamName}
        </p>
      ) : null}
      <p className="mt-1 text-xs text-cyan-100">Eventos recentes: {snapshot.recentEvents.length}</p>
    </div>
  );
}
