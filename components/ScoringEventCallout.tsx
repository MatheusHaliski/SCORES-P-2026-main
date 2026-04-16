import Image from "next/image";
import { ScoreEvent } from "@/types/matchSession";

const badgeByPoints: Record<ScoreEvent["points"], string> = {
  1: "/b3.png",
  2: "/b2.png",
  3: "/b1.png",
};

export function ScoringEventCallout({
  event,
  showShotType = true,
  showAssetBadge = true,
}: {
  event: ScoreEvent | null;
  showShotType?: boolean;
  showAssetBadge?: boolean;
}) {
  if (!event) return null;

  return (
    <div className="pointer-events-none fixed right-4 top-20 z-[90] animate-[fadeIn_.2s_ease-out] rounded-2xl border border-cyan-300/35 bg-slate-950/90 p-3 text-white shadow-[0_12px_40px_rgba(2,6,23,.55)]">
      <div className="flex items-center gap-3">
        {showAssetBadge && <Image src={badgeByPoints[event.points]} alt={`${event.points} points`} width={42} height={42} className="rounded-lg border border-white/15 bg-slate-900/60 object-cover" />}
        <div>
          <p className="text-sm font-black text-cyan-100">{event.playerName}</p>
          <p className="text-lg font-black text-amber-300">{event.points} PTS</p>
          {showShotType && <p className="text-[11px] uppercase tracking-[0.12em] text-slate-300">{event.shotType.replaceAll("_", " ")}</p>}
        </div>
      </div>
    </div>
  );
}
