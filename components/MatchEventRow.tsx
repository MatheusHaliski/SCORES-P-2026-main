import { MatchEvent } from "@/types/liveMatch";

const importantTypes = new Set(["2PT_MADE", "3PT_MADE", "FREE_THROW_MADE", "INFO"]);

export function MatchEventRow({ event }: { event: MatchEvent }) {
  const important = importantTypes.has(event.type);

  return (
    <div className={`rounded-lg border p-2 text-xs ${important ? "border-cyan-400/60 bg-cyan-500/10 text-cyan-100" : "border-white/10 bg-slate-900/60 text-slate-200"}`}>
      <p className="font-semibold">{event.text}</p>
      <p className="mt-1 text-[10px] uppercase tracking-wide text-slate-400">t+{event.second}s • {event.type}</p>
    </div>
  );
}
