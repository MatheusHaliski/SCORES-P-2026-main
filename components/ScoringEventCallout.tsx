import { ScoreEvent } from "@/types/matchSession";
import { ScoreType, ScoreTypeIcon } from "@/components/ScoreTypeIcon";

const scoreTypeByPoints: Record<ScoreEvent["points"], ScoreType> = {
  1: "1PT",
  2: "2PT",
  3: "3PT",
};

export function ScoringEventCallout({
  event,
  showShotType = true,
  showAssetBadge = true,
  className,
}: {
  event: ScoreEvent | null;
  showShotType?: boolean;
  showAssetBadge?: boolean;
  className?: string;
}) {
  if (!event) return null;

  return (
    <div className={`score-event ${className ?? ""}`.trim()}>
      {showAssetBadge && (
        <span className="score-icon-wrapper" aria-hidden="true">
          <ScoreTypeIcon type={scoreTypeByPoints[event.points]} size={28} />
        </span>
      )}

      <div className="score-text">
        <span className="player-name">{event.playerName}</span>
        <span className="points">{event.points} PTS</span>
        {showShotType && <span className="play-type">{event.shotType.replaceAll("_", " ")}</span>}
      </div>
    </div>
  );
}
