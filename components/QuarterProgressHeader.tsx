import { MatchSession } from "@/types/matchSession";

const toClock = (seconds: number) => `${Math.floor(seconds / 60).toString().padStart(2, "0")}:${Math.floor(seconds % 60).toString().padStart(2, "0")}`;

export function QuarterProgressHeader({ session }: { session: MatchSession }) {
  const progress = ((session.quarterDuration - session.timeRemaining) / session.quarterDuration) * 100;

  return (
    <header className="premium-surface p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-white">Live Round Panel</h1>
          <p className="text-sm text-slate-300">{session.phase} • Q{session.quarter}</p>
        </div>
        <p className="rounded-md bg-slate-800 px-3 py-1 text-xs font-bold text-cyan-300">{session.phase.includes("BREAK") ? "BREAK" : session.phase === "POST_MATCH" ? "FT" : "LIVE"}</p>
      </div>
      <div className="mt-3">
        <div className="mb-1 flex justify-between text-xs text-slate-300">
          <span>Tempo do quarter: {toClock(session.timeRemaining)}</span>
          <span>{Math.max(0, Math.floor(progress))}%</span>
        </div>
        <div className="h-3 rounded-full bg-slate-700">
          <div className="h-3 rounded-full bg-gradient-to-r from-cyan-400 to-violet-500" style={{ width: `${Math.min(progress, 100)}%` }} />
        </div>
      </div>
    </header>
  );
}
