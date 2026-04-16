import { MatchSession } from "@/types/matchSession";
import { motionTokens } from "@/lib/motion";

export function QuarterRecapCards({ session }: { session: MatchSession }) {
  const cards = session.quarterRecap?.slice(-4) ?? [];
  if (!cards.length) return null;

  return (
    <section className="mt-3 grid gap-3 md:grid-cols-2">
      {cards.map((card) => {
        const positive = card.delta >= 0;
        return (
          <article
            key={card.id}
            className={`rounded-2xl border p-3 ${positive ? "border-emerald-300/50 bg-emerald-900/20" : "border-rose-300/40 bg-rose-900/20"}`}
            style={{ transition: `all ${motionTokens.duration.panelFast}ms ${motionTokens.easing.easeStatPop}` }}
          >
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-300">Q{card.quarter} Recap</p>
            <p className="mt-1 text-sm font-bold text-white">{card.title}</p>
            <p className="text-xs text-slate-300">{card.description}</p>
            <p className={`mt-2 text-xs font-black ${positive ? "text-emerald-300" : "text-rose-300"}`}>{positive ? "▲" : "▼"} {Math.abs(card.delta)} net impact</p>
          </article>
        );
      })}
    </section>
  );
}
