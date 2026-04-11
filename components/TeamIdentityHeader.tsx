import { Team } from "@/types/game";
import { BoardReputationStars } from "@/components/BoardReputationStars";
import { FansReputationStars } from "@/components/FansReputationStars";
import { CSSProperties } from "react";

interface TeamIdentityHeaderProps {
  team: Team;
  managerName: string;
  boardReputation: number;
  fansReputation: number;
  boardMoraleLabel: string;
  fansMoraleLabel: string;
  stadiumName: string;
  boardExpectation: string;
  secondaryColor: string;
  onOpenColorEditor: () => void;
  panelStyle?: CSSProperties;
  itemStyle?: CSSProperties;
  buttonStyle?: CSSProperties;
}

export function TeamIdentityHeader({
  team,
  managerName,
  boardReputation,
  fansReputation,
  boardMoraleLabel,
  fansMoraleLabel,
  stadiumName,
  boardExpectation,
  secondaryColor,
  onOpenColorEditor,
  panelStyle,
  itemStyle,
  buttonStyle,
}: TeamIdentityHeaderProps) {
  return (
    <div className="sa-premium-metallic-panel rounded-2xl border border-white/20 bg-slate-950/80 p-4" style={panelStyle}>
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/20 bg-slate-900 text-2xl" style={itemStyle}>{team.logoUrl}</div>
        <div>
          <h2 className="text-lg font-bold text-white" style={{ color: secondaryColor }}>{team.name}</h2>
          <p className="text-xs text-slate-300">Manager: {managerName}</p>
          <p className="text-xs text-slate-300">Stadium: {stadiumName}</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-2 text-xs">
        <div className="sa-premium-gradient-surface-soft rounded border bg-slate-800 p-2 text-slate-100" style={itemStyle}>
          <p>Board morale: <span className="font-bold" style={{ color: secondaryColor }}>{boardMoraleLabel}</span></p>
          <BoardReputationStars stars={boardReputation} />
        </div>
        <div className="sa-premium-gradient-surface-soft rounded border bg-slate-800 p-2 text-slate-100" style={itemStyle}>
          <p>Fans morale: <span className="font-bold" style={{ color: secondaryColor }}>{fansMoraleLabel}</span></p>
          <FansReputationStars stars={fansReputation} />
        </div>
        <p className="sa-premium-gradient-surface-soft rounded border bg-slate-800 p-2 text-slate-100" style={itemStyle}>Posição Liga: #{team.currentLeaguePosition}</p>
        <p className="sa-premium-gradient-surface-soft rounded border bg-slate-800 p-2 text-slate-100" style={itemStyle}>Board expectation: <span className="font-semibold" style={{ color: secondaryColor }}>{boardExpectation}</span></p>
      </div>

      <button onClick={onOpenColorEditor} className="sa-premium-metallic-panel mt-3 w-full rounded border px-2 py-2 text-xs font-semibold text-white hover:bg-slate-600" style={buttonStyle}>
        Editar Cores do Clube
      </button>
    </div>
  );
}
