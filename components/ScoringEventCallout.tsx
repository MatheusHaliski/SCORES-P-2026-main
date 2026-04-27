import Image from "next/image";
import { ScoreEvent } from "@/types/matchSession";

const iconByPoints: Record<ScoreEvent["points"], string> = {
  1: "b3.png",
  2: "b2.png",
  3: "b1.png",
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
        <span className="score-icon-wrapper">
          <Image
            src={`/${iconByPoints[event.points]}`}
            alt="score type"
            width={28}
            height={28}
            className="score-icon"
            data-type={String(event.points)}
            onError={(e) => {
              console.error("Score icon failed to load", e);
            }}
          />
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
