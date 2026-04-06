import { TeamTactic } from "@/types/matchSession";

const tactics: Array<{ id: TeamTactic; label: string }> = [
  { id: "balanced", label: "balanced" },
  { id: "fast_pace", label: "fast pace" },
  { id: "defensive", label: "defensive" },
  { id: "three_point_focus", label: "three point focus" },
  { id: "paint_attack", label: "paint attack" },
  { id: "aggressive_press", label: "aggressive press" },
];

export function HTTacticPanel({ selected, onSelect }: { selected: TeamTactic; onSelect: (tactic: TeamTactic) => void }) {
  return (
    <div className="rounded-xl border border-white/15 bg-slate-900/70 p-4">
      <h3 className="text-base font-bold text-white">Tática da equipe</h3>
      <div className="mt-2 grid grid-cols-2 gap-2">
        {tactics.map((tactic) => (
          <button key={tactic.id} onClick={() => onSelect(tactic.id)} className={`rounded px-2 py-2 text-xs font-bold ${selected === tactic.id ? "bg-cyan-500 text-slate-950" : "bg-slate-800 text-white"}`}>
            {tactic.label}
          </button>
        ))}
      </div>
    </div>
  );
}
