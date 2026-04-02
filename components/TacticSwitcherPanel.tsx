const tactics = ["Balanced", "Run & Gun", "Zone Defense", "Post Focus"];

export function TacticSwitcherPanel() {
  return (
    <div className="rounded-2xl border border-white/15 bg-slate-900/70 p-4">
      <h3 className="text-base font-bold text-white">Tática Atual</h3>
      <p className="text-sm text-cyan-300">Balanced 4-out 1-in</p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {tactics.map((tactic) => (
          <button key={tactic} className="rounded border border-white/15 bg-slate-800 px-2 py-2 text-xs text-slate-100 hover:bg-slate-700">
            {tactic}
          </button>
        ))}
      </div>
    </div>
  );
}
