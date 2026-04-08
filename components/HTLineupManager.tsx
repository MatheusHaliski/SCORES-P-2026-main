import { LineupPlayer } from "@/types/matchSession";

export function HTLineupManager({ lineup, bench, onSub }: { lineup: LineupPlayer[]; bench: LineupPlayer[]; onSub: (outPlayerId: string, inPlayerId: string) => void }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div>
        <p className="mb-2 text-sm font-bold text-white">Titulares</p>
        <div className="space-y-2">
          {lineup.map((player) => (
            <div key={player.playerId} className="premium-surface p-2 text-xs text-slate-100">
              {player.playerName} ({player.position}) • OVR {player.overall} • STA {Math.floor(player.stamina)}
            </div>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-2 text-sm font-bold text-white">Reservas e substituições</p>
        <div className="space-y-2">
          {bench.map((benchPlayer) => (
            <div key={benchPlayer.playerId} className="premium-surface p-2 text-xs text-slate-100">
              <p>{benchPlayer.playerName} ({benchPlayer.position}) • OVR {benchPlayer.overall}</p>
              <div className="mt-1 flex flex-wrap gap-1">
                {lineup.map((starter) => (
                  <button key={starter.playerId} onClick={() => onSub(starter.playerId, benchPlayer.playerId)} className="premium-control bg-emerald-600/70 px-2 py-1 text-[10px] font-bold text-white">
                    Entrar no lugar de {starter.playerName.split(" ")[0]}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
