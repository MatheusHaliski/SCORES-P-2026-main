import { LiveFixtureState } from "@/types/matchSession";
import { MatchEvent } from "@/types/liveMatch";
import Image from "next/image";

const isImageLogo = (logo: string) => logo.startsWith("/") || logo.startsWith("http") || logo.startsWith("data:");

const SCORING_TYPES = new Set(["2PT_MADE", "3PT_MADE", "FREE_THROW_MADE"]);

const badgeByEventType: Partial<Record<MatchEvent["type"], string>> = {
  FREE_THROW_MADE: "/b3.png",
  "2PT_MADE": "/b2.png",
  "3PT_MADE": "/b1.png",
};

export function FixtureScoreRow({
  fixture,
  latestScoreEvent,
  userTeamId,
  sharedClock,
  sharedPeriod,
  onOpenTacticalBoard,
}: {
  fixture: LiveFixtureState;
  latestScoreEvent?: MatchEvent;
  userTeamId: string;
  sharedClock: string;
  sharedPeriod: string;
  onOpenTacticalBoard?: (fixtureId: string) => void;
}) {
  const scoredByUserClub = latestScoreEvent?.teamId === userTeamId;
  const hasScoreInfo = !!latestScoreEvent && SCORING_TYPES.has(latestScoreEvent.type);
  const scoringBadge = latestScoreEvent ? badgeByEventType[latestScoreEvent.type] : undefined;
  const homeColor = fixture.homeColor || "#fcd34d";
  const awayColor = fixture.awayColor || "#fcd34d";

  return (
    <button
      type="button"
      onClick={() => onOpenTacticalBoard?.(fixture.id)}
      className="w-full rounded-2xl border border-slate-300/40 p-4 text-left shadow-[inset_0_0_30px_rgba(148,163,184,.15),0_8px_24px_rgba(0,0,0,.45)] transition hover:-translate-y-0.5"
      style={{
        backgroundImage: `linear-gradient(90deg, ${homeColor} 0%, ${homeColor} 50%, ${awayColor} 50%, ${awayColor} 100%)`,
      }}
    >
      <div className="grid grid-cols-[70px_1fr_70px] items-center gap-3">
        <div className="flex justify-center">
          <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-white/30 bg-slate-900/80">
            {isImageLogo(fixture.homeLogo) ? <Image src={fixture.homeLogo || "/sai.png"} alt={fixture.homeTeamName} fill className="object-cover" /> : <span className="text-xl">{fixture.homeLogo || "🏀"}</span>}
          </div>
        </div>

        <div className="rounded-xl border border-amber-200/25 bg-slate-900/90 px-3 py-2">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-center">
            <div
              className="text-xl font-black [text-shadow:0_0_10px_rgba(255,255,255,.35)]"
              style={{ color: homeColor }}
            >
              {fixture.homeScore}
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-[0.2em] text-cyan-200">{sharedPeriod}</p>
              <p className="font-mono text-lg font-black text-emerald-300 [text-shadow:0_0_12px_rgba(110,231,183,.5)]">{sharedClock}</p>
            </div>
            <div
              className="text-xl font-black [text-shadow:0_0_10px_rgba(255,255,255,.35)]"
              style={{ color: awayColor }}
            >
              {fixture.awayScore}
            </div>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2 text-center text-[10px] uppercase tracking-widest text-slate-300">
            <p>Fouls: <span className="font-black text-rose-300">{fixture.homeFouls}</span></p>
            <p>Fouls: <span className="font-black text-rose-300">{fixture.awayFouls}</span></p>
          </div>
        </div>

        <div className="flex justify-center">
          <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-white/30 bg-slate-900/80">
            {isImageLogo(fixture.awayLogo) ? <Image src={fixture.awayLogo || "/sai.png"} alt={fixture.awayTeamName} fill className="object-cover" /> : <span className="text-xl">{fixture.awayLogo || "🏀"}</span>}
          </div>
        </div>
      </div>

      <div className={`mt-2 rounded-lg px-3 py-1.5 text-xs font-semibold ${hasScoreInfo && scoredByUserClub ? "bg-yellow-300/20 text-yellow-100" : "bg-white/5 text-slate-200"}`}>
        {hasScoreInfo ? (
          <div className="flex items-center justify-center gap-2">
            {scoringBadge ? (
              <Image src={scoringBadge} alt="Tipo da cesta" width={22} height={22} className="score-icon" onError={(e) => { console.error("Score icon failed to load", e); }} />
            ) : null}
            <span>{`${latestScoreEvent?.playerName ?? "Jogador"} marcou agora`}</span>
          </div>
        ) : (
          <p className="text-center">Rodada sincronizada ao vivo</p>
        )}
      </div>
    </button>
  );
}
