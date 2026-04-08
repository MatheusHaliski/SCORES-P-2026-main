export function LeagueInsightsPanel({ insights }: { insights: Array<{ icon: string; key: string; message: string }> }) {
  return (
    <div className="rounded-2xl border border-emerald-300/25 bg-slate-900/80 p-4">
      <p className="text-[11px] uppercase tracking-[0.2em] text-emerald-200">Insights Automáticos</p>
      <div className="mt-2 space-y-2">
        {insights.length ? insights.map((insight) => (
          <div key={insight.key} className="rounded-xl border border-emerald-300/30 bg-emerald-500/10 p-2 text-sm text-emerald-100">
            <p>{insight.icon} {insight.message}</p>
          </div>
        )) : <p className="text-sm text-slate-400">Ainda não há insights suficientes.</p>}
      </div>
    </div>
  );
}
