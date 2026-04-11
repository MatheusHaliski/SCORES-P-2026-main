import { MatchSession } from "@/types/matchSession";
import { getElectronicScoreDisplayStyle, getElectronicScoreShellStyle, getMatchPanelStyle } from "@/styles/metallicTheme";

const toClock = (seconds: number) => `${Math.floor(seconds / 60).toString().padStart(2, "0")}:${Math.floor(seconds % 60).toString().padStart(2, "0")}`;

export function QuarterProgressHeader({ session }: { session: MatchSession }) {
  const progress = ((session.quarterDuration - session.timeRemaining) / session.quarterDuration) * 100;

  return (
    <header className="premium-surface sa-premium-gradient-surface sa-metallic-sheen p-4" style={getMatchPanelStyle()}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-white">Live Round Panel</h1>
          <p className="text-sm text-slate-300">{session.phase} • Q{session.quarter}</p>
        </div>
        <div className="rounded-xl p-1" style={getElectronicScoreShellStyle()}>
          <p className="px-3 py-1 text-xs" style={getElectronicScoreDisplayStyle()}>{session.phase.includes("BREAK") ? "BREAK" : session.phase === "POST_MATCH" ? "FT" : "LIVE"}</p>
        </div>
      </div>
      <div className="mt-3">
        <div className="mb-1 flex justify-between text-xs text-slate-300">
          <span>Tempo do quarter: {toClock(session.timeRemaining)}</span>
          <span>{Math.max(0, Math.floor(progress))}%</span>
        </div>
        <div className="h-3 rounded-full border border-white/20 bg-slate-950/70 p-[1px] shadow-inner shadow-black/60">
          <div
            className="h-full rounded-full transition-all duration-500 ease-linear"
            style={{
              width: `${Math.min(progress, 100)}%`,
              background: "linear-gradient(90deg, rgba(218,186,114,.9) 0%, rgba(120,220,197,.95) 65%, rgba(218,234,248,.95) 100%)",
              boxShadow: "0 0 10px rgba(122, 211, 252, 0.45), inset 0 1px 0 rgba(255,255,255,.35)",
            }}
          />
        </div>
      </div>
    </header>
  );
}
