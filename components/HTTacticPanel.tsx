import { TeamTactic } from "@/types/matchSession";

const tactics: Array<{ id: TeamTactic; label: string }> = [
  { id: "balanced", label: "Balanced" },
  { id: "offensive_press", label: "Offensive Press" },
  { id: "defensive_block", label: "Defensive Block" },
  { id: "counter_attack", label: "Counter Attack" },
  { id: "possession_control", label: "Possession Control" },
  { id: "fast_transition", label: "Fast Transition" },
  { id: "wing_play", label: "Wing Play" },
];

export function HTTacticPanel({ selected, onSelect }: { selected: TeamTactic; onSelect: (tactic: TeamTactic) => void }) {
  return (
    <div className="premium-surface p-4">
      <h3 className="text-base font-bold text-white">Tática da equipe</h3>
      <div className="mt-2 grid grid-cols-2 gap-2">
        {tactics.map((tactic) => (
          <button key={tactic.id} onClick={() => onSelect(tactic.id)} className={`premium-control px-2 py-2 text-xs font-bold ${selected === tactic.id ? "bg-cyan-500/70 text-slate-950" : "text-white"}`}>
            {tactic.label}
          </button>
        ))}
      </div>
    </div>
  );
}
