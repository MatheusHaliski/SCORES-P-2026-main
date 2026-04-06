import { QuarterStatusBadge } from "@/components/QuarterStatusBadge";

type MatchProgressState = {
  quarter: number;
  elapsedSeconds: number;
  totalSeconds: number;
  progressPercent: number;
};

const toClock = (totalSeconds: number, elapsedSeconds: number) => {
  const remaining = Math.max(totalSeconds - elapsedSeconds, 0);
  const minutes = Math.floor(remaining / 60).toString().padStart(2, "0");
  const seconds = Math.floor(remaining % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
};

export function MatchTopProgressBar({ progress }: { progress: MatchProgressState }) {
  return (
    <header className="rounded-2xl border border-white/15 bg-slate-900/70 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-white">Live Round Panel</h1>
          <p className="text-sm text-slate-300">Q{progress.quarter} • Quarter in progress</p>
        </div>
        <div className="flex items-center gap-2">
          <QuarterStatusBadge label="Live" />
          <QuarterStatusBadge label="Quarter in progress" />
        </div>
      </div>

      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between text-xs text-slate-300">
          <span>Tempo restante: {toClock(progress.totalSeconds, progress.elapsedSeconds)}</span>
          <span>{Math.floor(progress.progressPercent)}%</span>
        </div>
        <div className="h-3 rounded-full bg-slate-700/70">
          <div className="h-3 rounded-full bg-gradient-to-r from-cyan-400 to-violet-500 transition-all duration-500 ease-linear" style={{ width: `${Math.min(progress.progressPercent, 100)}%` }} />
        </div>
      </div>
    </header>
  );
}
