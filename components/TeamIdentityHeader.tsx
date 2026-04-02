import { Team, Uniform } from "@/types/game";

interface TeamIdentityHeaderProps {
  team: Team;
  managerName: string;
  uniforms: Uniform[];
  boardReputation: number;
  fansReputation: number;
}

export function TeamIdentityHeader({ team, managerName, uniforms, boardReputation, fansReputation }: TeamIdentityHeaderProps) {
  return (
    <div className="rounded-2xl border border-white/20 bg-slate-950/80 p-4">
      <div className="flex items-center gap-3">
        <div className="text-3xl">{team.logoUrl}</div>
        <div>
          <h2 className="text-lg font-bold text-white">{team.name}</h2>
          <p className="text-xs text-slate-300">Manager: {managerName}</p>
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        {uniforms.slice(0, 2).map((uniform) => (
          <div key={uniform.id} className="flex-1 rounded-xl border border-white/20 p-2 text-center">
            <p className="text-[10px] uppercase text-slate-300">{uniform.type}</p>
            <p className="text-xs font-semibold text-white">{uniform.imageUrl}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
        <p className="rounded bg-slate-800 p-2 text-slate-100">Posição Liga: #{team.currentLeaguePosition}</p>
        <p className="rounded bg-slate-800 p-2 text-slate-100">Board: {boardReputation}</p>
        <p className="rounded bg-slate-800 p-2 text-slate-100">Torcida: {fansReputation}</p>
        <p className="rounded bg-slate-800 p-2 text-slate-100">Budget: ${team.budget.toLocaleString()}</p>
      </div>
    </div>
  );
}
