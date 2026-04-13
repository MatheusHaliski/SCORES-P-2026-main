import { DefensiveScheme, FormationId, TacticalPreset, TacticalStyle } from "@/types/tactical";
import { getMatchPanelStyle } from "@/styles/metallicTheme";

const formations: Array<{ id: FormationId; label: string }> = [
  { id: "balanced", label: "Balanced" },
  { id: "pace_space", label: "Pace & Space" },
  { id: "five_out", label: "5-Out" },
  { id: "pick_roll_heavy", label: "Pick-and-Roll Heavy" },
  { id: "post_centric", label: "Post-Centric" },
  { id: "motion_offense", label: "Motion Offense" },
  { id: "isolation_heavy", label: "Isolation Heavy" },
  { id: "perimeter_creation", label: "Perimeter Creation" },
];

const styles: Array<{ id: TacticalStyle; label: string }> = formations;
const defenses: Array<{ id: DefensiveScheme; label: string }> = [
  { id: "man_to_man", label: "Man-to-Man" },
  { id: "zone_2_3", label: "2-3 Zone" },
  { id: "zone_3_2", label: "3-2 Zone" },
  { id: "zone_1_3_1", label: "1-3-1 Zone" },
  { id: "full_court_press", label: "Full Court Press" },
  { id: "half_court_pressure", label: "Half Court Pressure" },
  { id: "drop_coverage", label: "Drop Coverage" },
  { id: "switch_everything", label: "Switch Everything" },
];

function SelectLine<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: readonly T[];
  onChange: (next: T) => void;
}) {
  return <select value={value} onChange={(event) => onChange(event.target.value as T)} className="w-full rounded-lg border border-cyan-300/35 bg-slate-900/70 px-2 py-1 text-xs text-white">{options.map((option) => <option key={option} value={option}>{option.replaceAll("_", " ")}</option>)}</select>;
}

export function TacticSelector({ value, onChange }: { value: TacticalPreset; onChange: (next: TacticalPreset) => void }) {
  return (
    <div className="premium-surface space-y-3 p-4" style={getMatchPanelStyle()}>
      <h3 className="text-sm font-black uppercase tracking-[0.16em] text-cyan-200">Basketball Tactical Center</h3>
      <div className="grid gap-2 md:grid-cols-2">
        <label className="space-y-1"><span className="premium-label">Offensive archetype</span><div className="grid grid-cols-2 gap-1">{styles.map((s) => <button key={s.id} onClick={() => onChange({ ...value, style: s.id, formation: s.id })} className={`rounded-xl border px-2 py-1.5 text-xs font-bold ${value.style === s.id ? "border-fuchsia-300 bg-fuchsia-500/25 text-fuchsia-100" : "border-white/15 bg-slate-900/60 text-slate-200"}`}>{s.label}</button>)}</div></label>
        <label className="space-y-1"><span className="premium-label">Defensive archetype</span><div className="grid grid-cols-2 gap-1">{defenses.map((d) => <button key={d.id} onClick={() => onChange({ ...value, defensiveScheme: d.id })} className={`rounded-xl border px-2 py-1.5 text-xs font-bold ${value.defensiveScheme === d.id ? "border-emerald-300 bg-emerald-500/25 text-emerald-100" : "border-white/15 bg-slate-900/60 text-slate-200"}`}>{d.label}</button>)}</div></label>
      </div>
      <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
        <div><p className="premium-label mb-1">Tempo</p><SelectLine value={value.tempo} options={["controlled", "balanced", "high"]} onChange={(tempo) => onChange({ ...value, tempo })} /></div>
        <div><p className="premium-label mb-1">Shot Selection</p><SelectLine value={value.shotSelection} options={["rim_and_kickout", "balanced", "shot_hunting"]} onChange={(shotSelection) => onChange({ ...value, shotSelection })} /></div>
        <div><p className="premium-label mb-1">3PT Frequency</p><SelectLine value={value.threePointFrequency} options={["low", "balanced", "high"]} onChange={(threePointFrequency) => onChange({ ...value, threePointFrequency })} /></div>
        <div><p className="premium-label mb-1">Paint Attack</p><SelectLine value={value.paintAttackFrequency} options={["low", "balanced", "high"]} onChange={(paintAttackFrequency) => onChange({ ...value, paintAttackFrequency })} /></div>
        <div><p className="premium-label mb-1">Defensive Pressure</p><SelectLine value={value.defensivePressure} options={["low", "balanced", "high"]} onChange={(defensivePressure) => onChange({ ...value, defensivePressure })} /></div>
        <div><p className="premium-label mb-1">Rebounding</p><SelectLine value={value.reboundingEmphasis} options={["guard_balance", "balanced", "crash_glass"]} onChange={(reboundingEmphasis) => onChange({ ...value, reboundingEmphasis })} /></div>
        <div><p className="premium-label mb-1">Transition</p><SelectLine value={value.transitionAggression} options={["low", "balanced", "high"]} onChange={(transitionAggression) => onChange({ ...value, transitionAggression })} /></div>
        <div><p className="premium-label mb-1">Rotation Depth</p><SelectLine value={value.rotationDepth} options={["tight_8", "balanced_10", "deep_12"]} onChange={(rotationDepth) => onChange({ ...value, rotationDepth })} /></div>
      </div>
    </div>
  );
}
