import { ManagerJobOffer } from "@/types/game";

interface JobOfferCardProps {
  offer: ManagerJobOffer;
  onAccept: () => void;
  onReject: () => void;
  busy?: boolean;
}

export function JobOfferCard({ offer, onAccept, onReject, busy }: JobOfferCardProps) {
  return (
    <div className="rounded-xl border border-cyan-400/40 bg-cyan-500/10 p-3 text-sm text-cyan-50">
      <p className="text-xs uppercase tracking-[0.16em] text-cyan-300">Proposta de trabalho</p>
      <p className="mt-1 font-bold">{offer.clubName}</p>
      <p>Posição atual: #{offer.currentLeaguePosition}</p>
      <p>Salário: ${offer.offeredSalary.toLocaleString()}/mês</p>
      <div className="mt-3 flex gap-2">
        <button onClick={onAccept} disabled={busy} className="rounded bg-emerald-600 px-3 py-1 text-xs font-bold text-white disabled:opacity-50">Aceitar</button>
        <button onClick={onReject} disabled={busy} className="rounded bg-slate-700 px-3 py-1 text-xs font-bold text-white disabled:opacity-50">Recusar</button>
      </div>
    </div>
  );
}
