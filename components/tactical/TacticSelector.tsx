import { FormationId, TacticalPreset, TacticalStyle } from "@/types/tactical";

const formations: FormationId[] = ["4-4-2", "4-3-3", "3-5-2", "5-3-2", "4-2-3-1", "4-1-4-1"];
const styles: Array<{ id: TacticalStyle; label: string }> = [
  { id: "balanced", label: "Balanced" },
  { id: "offensive_press", label: "Offensive Press" },
  { id: "defensive_block", label: "Defensive Block" },
  { id: "counter_attack", label: "Counter Attack" },
  { id: "possession_control", label: "Possession Control" },
  { id: "fast_transition", label: "Fast Transition" },
  { id: "wing_play", label: "Wing Play" },
];

const simple3 = ["low", "medium", "high"] as const;
const buildUps = ["direct", "mixed", "possession"] as const;
const lines = ["deep", "standard", "high"] as const;
const speeds = ["slow", "balanced", "quick"] as const;
const widths = ["narrow", "balanced", "wide"] as const;
const tempos = ["calm", "normal", "high"] as const;

function Segmented<T extends string>({ value, options, onChange }: { value: T; options: readonly T[]; onChange: (next: T) => void }) {
  return (
    <div className="grid grid-cols-3 gap-1 rounded-xl border border-cyan-300/30 bg-slate-900/70 p-1">
      {options.map((option) => (
        <button key={option} className={`rounded-lg px-2 py-1 text-[11px] font-bold uppercase transition ${option === value ? "bg-cyan-400/90 text-slate-950 shadow-[0_0_18px_rgba(34,211,238,.5)]" : "text-slate-200 hover:bg-white/10"}`} onClick={() => onChange(option)}>
          {option}
        </button>
      ))}
    </div>
  );
}

export function TacticSelector({ value, onChange }: { value: TacticalPreset; onChange: (next: TacticalPreset) => void }) {
  return (
    <div className="premium-surface space-y-3 p-4">
      <h3 className="text-sm font-black uppercase tracking-[0.16em] text-cyan-200">Tactical Control Center</h3>
      <div className="grid gap-2 md:grid-cols-2">
        <label className="space-y-1">
          <span className="premium-label">Formation</span>
          <div className="grid grid-cols-3 gap-1">
            {formations.map((f) => <button key={f} onClick={() => onChange({ ...value, formation: f })} className={`rounded-xl border px-2 py-1.5 text-xs font-bold ${value.formation === f ? "border-cyan-300 bg-cyan-500/25 text-cyan-100" : "border-white/15 bg-slate-900/60 text-slate-200"}`}>{f}</button>)}
          </div>
        </label>
        <label className="space-y-1">
          <span className="premium-label">Style</span>
          <div className="grid grid-cols-2 gap-1">
            {styles.map((s) => <button key={s.id} onClick={() => onChange({ ...value, style: s.id })} className={`rounded-xl border px-2 py-1.5 text-xs font-bold ${value.style === s.id ? "border-fuchsia-300 bg-fuchsia-500/25 text-fuchsia-100" : "border-white/15 bg-slate-900/60 text-slate-200"}`}>{s.label}</button>)}
          </div>
        </label>
      </div>
      <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
        <div><p className="premium-label mb-1">Pressure</p><Segmented value={value.pressure} options={simple3} onChange={(pressure) => onChange({ ...value, pressure })} /></div>
        <div><p className="premium-label mb-1">Build Up</p><Segmented value={value.buildUp} options={buildUps} onChange={(buildUp) => onChange({ ...value, buildUp })} /></div>
        <div><p className="premium-label mb-1">Defensive line</p><Segmented value={value.defensiveLine} options={lines} onChange={(defensiveLine) => onChange({ ...value, defensiveLine })} /></div>
        <div><p className="premium-label mb-1">Transition</p><Segmented value={value.transitionSpeed} options={speeds} onChange={(transitionSpeed) => onChange({ ...value, transitionSpeed })} /></div>
        <div><p className="premium-label mb-1">Width</p><Segmented value={value.width} options={widths} onChange={(width) => onChange({ ...value, width })} /></div>
        <div><p className="premium-label mb-1">Tempo</p><Segmented value={value.tempo} options={tempos} onChange={(tempo) => onChange({ ...value, tempo })} /></div>
      </div>
    </div>
  );
}
