import { MatchEvent } from "@/types/liveMatch";
import { MatchEventRow } from "@/components/MatchEventRow";

export function MatchEventFeed({ events }: { events: MatchEvent[] }) {
  const visibleEvents = [...events].slice(-14);

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-800/60 p-4">
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Live commentary</p>
      <div className="mt-3 max-h-[360px] space-y-2 overflow-auto pr-1">
        {visibleEvents.length === 0 ? <p className="text-sm text-slate-400">Waiting for first event...</p> : visibleEvents.map((event) => <MatchEventRow key={event.id} event={event} />)}
      </div>
    </div>
  );
}
