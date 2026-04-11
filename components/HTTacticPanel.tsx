import { TeamTactic } from "@/types/matchSession";

const tactics: Array<{ id: TeamTactic; label: string }> = [
  { id: "balanced", label: "Balanced" },
  { id: "pace_space", label: "Pace & Space" },
  { id: "five_out", label: "5-Out" },
  { id: "pick_roll_heavy", label: "Pick-and-Roll Heavy" },
  { id: "post_centric", label: "Post-Centric" },
  { id: "motion_offense", label: "Motion Offense" },
  { id: "isolation_heavy", label: "Isolation Heavy" },
  { id: "perimeter_creation", label: "Perimeter Creation" },
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
