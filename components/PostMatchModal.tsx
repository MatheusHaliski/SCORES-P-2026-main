"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { StandingRow, Team } from "@/types/game";
import { StandingsTable } from "@/components/StandingsTable";
import { LiveFixtureState } from "@/types/matchSession";
import { MatchSessionRepository } from "@/repositories/MatchSessionRepository";
import { ManagerDismissalModal } from "@/components/ManagerDismissalModal";
import { JobOfferCard } from "@/components/JobOfferCard";
import { ManagerJobOffer } from "@/types/game";

type CompletionResponse = {
  seasonFinished: boolean;
  standings: StandingRow[];
  championTeamId: string | null;
  playoffTeamIds: string[];
  playoffSpots: number;
  career: {
    dismissed: boolean;
    dismissalReason: string | null;
    employmentStatus: "employed" | "unemployed" | "spectator";
    currentClubId: string | null;
    boardStars: number;
    fansStars: number;
  };
  pendingJobOffer: ManagerJobOffer | null;
};

export function PostMatchModal({
  saveId,
  standings,
  teamsById,
  userTeamId,
  round,
  fixtures,
  leagueId,
}: {
  saveId: string;
  standings: StandingRow[];
  teamsById: Record<string, Team>;
  userTeamId: string;
  round: number;
  fixtures: LiveFixtureState[];
  leagueId: string;
}) {
  const router = useRouter();
  const [showStandings, setShowStandings] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [completion, setCompletion] = useState<CompletionResponse | null>(null);
  const [pendingOffer, setPendingOffer] = useState<ManagerJobOffer | null>(null);
  const [isHandlingOffer, setIsHandlingOffer] = useState(false);
  const [showDismissalModal, setShowDismissalModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const finalizeAndContinue = async () => {
    if (isFinishing) return;
    setIsFinishing(true);
    setError(null);

    try {
      const response = await fetch("/api/match/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          saveId,
          round,
          fixtures: fixtures.map((fixture) => ({
            id: fixture.id,
            leagueId,
            round,
            date: new Date().toISOString().slice(0, 10),
            homeTeamId: fixture.homeTeamId,
            awayTeamId: fixture.awayTeamId,
            homeScore: fixture.homeScore,
            awayScore: fixture.awayScore,
            status: "finished",
            quarter: 4,
            clock: "00:00",
          })),
        }),
      });

      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.error ?? "Falha ao concluir rodada");
      }

      const payload = await response.json() as CompletionResponse;
      setCompletion(payload);
      setPendingOffer(payload.pendingJobOffer);
      setShowStandings(true);
      setShowDismissalModal(payload.career.dismissed);
      await new MatchSessionRepository().clear(saveId);

      if (!payload.seasonFinished) {
        router.push(`/squad?saveId=${saveId}`);
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Erro desconhecido ao concluir partida");
    } finally {
      setIsFinishing(false);
    }
  };

  const rows = completion?.standings ?? standings;
  const dismissedClubName = completion?.career.currentClubId ? teamsById[completion.career.currentClubId]?.name ?? completion.career.currentClubId : teamsById[userTeamId]?.name ?? "Seu clube";

  const respondToOffer = async (action: "accept" | "reject") => {
    if (!pendingOffer || isHandlingOffer) return;
    setIsHandlingOffer(true);
    setError(null);
    try {
      const response = await fetch("/api/manager/job-offer/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ saveId, offerId: pendingOffer.id, action }),
      });

      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.error ?? "Falha ao responder proposta");
      }

      if (action === "accept") {
        router.push(`/squad?saveId=${saveId}`);
      } else {
        setPendingOffer(null);
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Erro ao responder proposta");
    } finally {
      setIsHandlingOffer(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
      <div className="premium-surface w-full max-w-3xl p-5">
        <h2 className="text-2xl font-black text-white">Pós-jogo</h2>
        {!showStandings ? (
          <div className="mt-3 flex gap-2">
            <button onClick={finalizeAndContinue} disabled={isFinishing} className="premium-control bg-emerald-600/70 px-4 py-2 text-sm font-bold text-white disabled:opacity-60">{isFinishing ? "Processando..." : "Continuar"}</button>
            <button onClick={() => setShowStandings(true)} className="premium-control bg-cyan-500/70 px-4 py-2 text-sm font-bold text-slate-950">Visualizar classificação do campeonato</button>
          </div>
        ) : (
          <div className="mt-3 space-y-3">
            {completion?.seasonFinished && (
              <div className="rounded-lg border border-amber-400/50 bg-amber-500/10 p-3 text-sm text-amber-100">
                <p className="font-bold">Temporada encerrada!</p>
                <p>Campeão: <strong>{completion.championTeamId ? teamsById[completion.championTeamId]?.name ?? completion.championTeamId : "N/A"}</strong></p>
                <p>Classificados para playoffs ({completion.playoffSpots}): {completion.playoffTeamIds.map((teamId) => teamsById[teamId]?.shortName ?? teamId).join(", ")}</p>
              </div>
            )}
            <StandingsTable rows={rows} teamsById={teamsById} playoffSpots={completion?.playoffSpots ?? 8} dangerSpots={3} highlightTeamId={userTeamId} />
            {pendingOffer && (
              <JobOfferCard
                offer={pendingOffer}
                busy={isHandlingOffer}
                onAccept={() => respondToOffer("accept")}
                onReject={() => respondToOffer("reject")}
              />
            )}
            <div className="flex gap-2">
              <button onClick={() => setShowStandings(false)} className="premium-control px-3 py-2 text-xs font-bold text-white">Voltar</button>
              {completion?.seasonFinished && <button onClick={() => router.push(`/squad?saveId=${saveId}`)} className="premium-control bg-emerald-600/70 px-3 py-2 text-xs font-bold text-white">Ir ao Squad</button>}
            </div>
          </div>
        )}
        {error && <p className="mt-3 text-sm text-rose-300">{error}</p>}
      </div>
      {showDismissalModal && completion?.career.dismissed && (
        <ManagerDismissalModal
          clubName={dismissedClubName}
          reason={completion.career.dismissalReason ?? "Baixa reputação e sequência ruim."}
          onContinue={() => setShowDismissalModal(false)}
        />
      )}
    </div>
  );
}
