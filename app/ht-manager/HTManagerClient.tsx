"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { SectionCard } from "@/components/SectionCard";
import { HTLineupManager } from "@/components/HTLineupManager";
import { HTTacticPanel } from "@/components/HTTacticPanel";
import { MatchSessionService } from "@/services/match/MatchSessionService";
import { MatchSession } from "@/types/matchSession";

export function HTManagerClient({ saveId }: { saveId: string }) {
  const router = useRouter();
  const service = useMemo(() => new MatchSessionService(), []);
  const [session, setSession] = useState<MatchSession | null>(null);

  useEffect(() => {
    service.getSession(saveId).then(setSession);
  }, [saveId, service]);

  if (!session) return <p className="text-slate-300">Carregando sessão...</p>;

  return (
    <div className="space-y-4">
      <SectionCard title={`HTManagerBoardView • ${session.phase}`}>
        <div className="premium-surface mb-3 p-2 text-xs text-slate-200">
          <p>Público: <strong>{(session.attendance ?? 0).toLocaleString()}</strong></p>
          <p>Receita de bilheteria estimada (IA): <strong>${(session.ticketRevenueEstimate ?? 0).toLocaleString()}</strong></p>
        </div>
        <HTLineupManager
          lineup={session.userLineup}
          bench={session.userBench}
          onSub={(outPlayerId, inPlayerId) => {
            service.substitute(session, outPlayerId, inPlayerId).then(setSession);
          }}
        />
      </SectionCard>

      <HTTacticPanel
        selected={session.userTeamTactic}
        onSelect={(tactic) => {
          service.applyTactic(session, tactic).then(setSession);
        }}
      />

      <button
        onClick={async () => {
          const next = await service.continueFromBreak(session);
          setSession(next);
          router.push(`/match-board?saveId=${saveId}`);
        }}
        className="premium-control bg-emerald-600/70 px-4 py-2 text-sm font-bold text-white"
      >
        Confirmar ajustes e continuar para Q{session.quarter + 1}
      </button>
    </div>
  );
}
