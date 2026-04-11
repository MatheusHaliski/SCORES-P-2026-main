"use client";

import { useMemo } from "react";
import { readHalftimeSnapshot } from "@/hooks/useLiveRoundSimulation";
import { getElectronicScoreDisplayStyle, getElectronicScoreShellStyle, getMatchPanelStyle } from "@/styles/metallicTheme";

export function HTLiveContextCard({ saveId }: { saveId: string }) {
  const snapshot = useMemo(() => readHalftimeSnapshot(saveId), [saveId]);

  if (!snapshot) {
    return (
      <div className="mt-4 rounded-xl border border-white/10 bg-slate-900/50 p-4 text-sm text-slate-300" style={getMatchPanelStyle()}>
        Sem snapshot de quarter salvo para este save.
      </div>
    );
  }

  const userFixture = snapshot.fixtures.find((fixture) => fixture.isUserMatch);

  return (
    <div className="mt-4 rounded-xl border border-cyan-400/40 bg-cyan-500/10 p-4" style={getMatchPanelStyle()}>
      <p className="text-xs font-semibold uppercase tracking-widest text-cyan-200">Quarter summary recebido da MatchView</p>
      {userFixture ? (
        <div className="mt-2 space-y-2">
          <p className="text-sm font-bold text-white">Q{snapshot.quarterFinished} • {userFixture.homeTeamName} x {userFixture.awayTeamName}</p>
          <div className="inline-block p-1" style={getElectronicScoreShellStyle()}>
            <p className="px-3 py-1 text-lg" style={getElectronicScoreDisplayStyle()}>{userFixture.homeScore} - {userFixture.awayScore}</p>
          </div>
        </div>
      ) : null}
      <p className="mt-1 text-xs text-cyan-100">Eventos recentes: {snapshot.recentEvents.length}</p>
    </div>
  );
}
