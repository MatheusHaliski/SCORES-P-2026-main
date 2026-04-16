import { LineupPlayer, MatchSession } from "@/types/matchSession";

const confidence = (session: MatchSession, player: LineupPlayer) => Math.round(
  player.attributes.shooting.free_throw * 0.55
  + player.stamina * 0.25
  + session.telemetry.managerMorale * 0.2,
);

export function FreeThrowShooterModal({
  open,
  session,
  candidates,
  attempts,
  onSelect,
}: {
  open: boolean;
  session: MatchSession;
  candidates: LineupPlayer[];
  attempts: number;
  onSelect: (playerId: string) => void;
}) {
  if (!open) return null;
  const suggested = [...candidates].sort((a, b) => confidence(session, b) - confidence(session, a))[0];

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center bg-slate-950/80 p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-cyan-300/35 bg-slate-900 p-4 text-white">
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Free Throw Sequence</p>
        <h3 className="text-xl font-black">Escolha o cobrador • {attempts} lance(s)</h3>
        <div className="mt-3 space-y-2">
          {candidates.map((player) => (
            <button key={player.playerId} onClick={() => onSelect(player.playerId)} className="flex w-full items-center justify-between rounded-xl border border-white/15 bg-slate-800/85 px-3 py-2 text-left hover:border-cyan-300/55">
              <div>
                <p className="font-bold">{player.playerName}{suggested?.playerId === player.playerId ? " • Sugestão" : ""}</p>
                <p className="text-[11px] text-slate-300">FT {player.attributes.shooting.free_throw} • Fadiga {Math.round(player.stamina)} • Confiança {confidence(session, player)}</p>
              </div>
              <span className="rounded bg-cyan-500/20 px-2 py-1 text-xs">Selecionar</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
