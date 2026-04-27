import { MatchSession } from "@/types/matchSession";
import { motionTokens } from "@/lib/motion";
import { buildTeamPlaceholderAsset } from "@/lib/assets";
import { FeedbackSnapshot } from "@/types/feedback";
import { ScoringEventCallout } from "@/components/ScoringEventCallout";

type Props = {
  session: MatchSession;
  userIsHome: boolean;
  feedback?: FeedbackSnapshot | null;
  showShotType?: boolean;
  showScoreEventBadge?: boolean;
};

const toClock = (seconds: number) => `${Math.floor(seconds / 60).toString().padStart(2, "0")}:${Math.floor(seconds % 60).toString().padStart(2, "0")}`;

function ShotClock({ remaining }: { remaining: number }) {
  const urgent = remaining <= 8;
  return (
    <span className={`rounded px-2 py-0.5 font-bold ${urgent ? "bg-rose-500/30 text-rose-100 animate-pulse" : "bg-slate-700/60 text-slate-100"}`} style={{ transition: `all ${motionTokens.duration.micro}ms ${motionTokens.easing.easePremiumInOut}` }}>
      SC {Math.ceil(remaining)}
    </span>
  );
}

function PossessionIndicator({ teamName }: { teamName: string }) {
  return <span className="rounded bg-cyan-500/20 px-2 py-0.5 font-semibold text-cyan-100">POS {teamName}</span>;
}

function MomentumBar({ momentum, userIsHome }: { momentum: number; userIsHome: boolean }) {
  return (
    <div className="mt-2 grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-[10px]">
      <p className={`text-right ${userIsHome ? "text-emerald-300" : "text-slate-400"}`}>{momentum >= 0 ? `Momentum +${Math.round(momentum)}` : ""}</p>
      <div className="h-2 w-36 overflow-hidden rounded-full bg-slate-800/70">
        <div className="h-full bg-gradient-to-r from-rose-500 to-emerald-400" style={{ width: `${Math.min(100, Math.max(0, 50 + momentum / 2))}%`, transition: `width ${motionTokens.duration.microSlow}ms ${motionTokens.easing.easeStatPop}` }} />
      </div>
      <p className={`text-left ${!userIsHome ? "text-emerald-300" : "text-slate-400"}`}>{momentum < 0 ? `Momentum +${Math.abs(Math.round(momentum))}` : ""}</p>
    </div>
  );
}

function CrowdIntensityMeter({ intensity }: { intensity: number }) {
  return (
    <>
      <div className="mt-1 flex items-center justify-between text-[10px] text-slate-300">
        <span>Crowd</span>
        <span>{Math.round(intensity)}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800/70">
        <div className="h-full bg-gradient-to-r from-slate-400 via-amber-300 to-orange-400" style={{ width: `${intensity}%`, transition: `width ${motionTokens.duration.microSlow}ms ${motionTokens.easing.easePremiumInOut}` }} />
      </div>
    </>
  );
}

export function BroadcastScoreBug({ session, userIsHome, feedback, showShotType = true, showScoreEventBadge = true }: Props) {
  const fixture = session.fixtures.find((item) => item.isUserMatch);
  if (!fixture) return null;

  const homeTeamState = session.teamRuntime?.home;
  const awayTeamState = session.teamRuntime?.away;
  const homeBonus = homeTeamState ? homeTeamState.foulsThisQuarter >= session.bonusFoulLimit : false;
  const awayBonus = awayTeamState ? awayTeamState.foulsThisQuarter >= session.bonusFoulLimit : false;
  const possessionHome = session.possessionTeamId === fixture.homeTeamId;
  const homeAsset = buildTeamPlaceholderAsset(fixture.homeTeamName);
  const awayAsset = buildTeamPlaceholderAsset(fixture.awayTeamName);

  const pressurePercent = Math.round((feedback?.state.pressure ?? 0) * 100);
  const rivalryPercent = Math.round((feedback?.state.rivalryIntensity ?? 0) * 100);
  const latestScoreEvent = session.scoreEvents?.at(-1);
  const homePulse = latestScoreEvent?.teamId === fixture.homeTeamId;
  const awayPulse = latestScoreEvent?.teamId === fixture.awayTeamId;

  return (
    <header
      className="sa-broadcast-scorebug sticky top-2 z-30 rounded-2xl bg-gradient-to-r from-slate-900/95 via-slate-900/90 to-slate-950/95 px-3 py-2 text-white md:px-5"
      style={{ boxShadow: `0 0 0 1px rgba(248,113,113,${(feedback?.anxietyTint ?? 0) * 0.35}), inset 0 0 28px rgba(248,113,113,${(feedback?.anxietyTint ?? 0) * 0.18})` }}
    >
      <div className="hud-top-row">
        <div className="scoreboard flex-1">
        <div className={`rounded-xl px-3 py-2 ${possessionHome ? "bg-emerald-400/20" : "bg-slate-700/35"}`}>
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-300">Home</p>
          <div className="flex items-end justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400/70 to-indigo-400/70 text-[10px] font-black">{homeAsset.fallback}</span>
              <p className="text-sm font-extrabold md:text-lg">{fixture.homeTeamName}</p>
            </div>
            <p className={`text-2xl font-black tabular-nums md:text-3xl ${homePulse ? "animate-pulse text-amber-200" : ""}`}>{fixture.homeScore}</p>
          </div>
          <p className="text-[10px] text-slate-300">Fouls {homeTeamState?.foulsThisQuarter ?? fixture.homeFouls} • TO {homeTeamState?.timeoutsRemaining ?? 0} {homeBonus ? "• BONUS" : ""}</p>
        </div>

        <div className="rounded-xl border border-amber-200/30 bg-black/50 px-3 py-2 text-center">
          <p className="text-[10px] uppercase tracking-[0.22em] text-amber-300">Q{session.quarter}</p>
          <p className="font-mono text-xl font-black text-emerald-200 md:text-2xl">{toClock(session.timeRemaining)}</p>
          <div className="mt-1 flex items-center gap-2 text-[10px]">
            <ShotClock remaining={session.shotClockRemaining ?? 24} />
            <PossessionIndicator teamName={session.possessionTeamId === fixture.homeTeamId ? fixture.homeTeamName : fixture.awayTeamName} />
          </div>
        </div>

        <div className={`rounded-xl px-3 py-2 ${!possessionHome ? "bg-emerald-400/20" : "bg-slate-700/35"}`}>
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-300">Away</p>
          <div className="flex items-end justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-400/70 to-rose-400/70 text-[10px] font-black">{awayAsset.fallback}</span>
              <p className="text-sm font-extrabold md:text-lg">{fixture.awayTeamName}</p>
            </div>
            <p className={`text-2xl font-black tabular-nums md:text-3xl ${awayPulse ? "animate-pulse text-amber-200" : ""}`}>{fixture.awayScore}</p>
          </div>
          <p className="text-[10px] text-slate-300">Fouls {awayTeamState?.foulsThisQuarter ?? fixture.awayFouls} • TO {awayTeamState?.timeoutsRemaining ?? 0} {awayBonus ? "• BONUS" : ""}</p>
        </div>
        </div>

        <ScoringEventCallout
          event={session.scoreEvents?.at(-1) ?? null}
          showShotType={showShotType}
          showAssetBadge={showScoreEventBadge}
          className="score-event--inline"
        />
      </div>

      <MomentumBar momentum={session.emotion.momentum} userIsHome={userIsHome} />
      <CrowdIntensityMeter intensity={session.emotion.crowdIntensity} />
      <div className="mt-1 grid grid-cols-2 gap-2 text-[10px]">
        <div>
          <div className="mb-0.5 flex items-center justify-between text-rose-200">
            <span>Pressure</span>
            <span>{pressurePercent}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-rose-950/45">
            <div className="h-full bg-gradient-to-r from-rose-400 to-red-500" style={{ width: `${pressurePercent}%` }} />
          </div>
        </div>
        <div className="flex items-end justify-end gap-2 text-fuchsia-100">
          {rivalryPercent >= 70 && <span className="rounded-full border border-fuchsia-300/40 bg-fuchsia-500/20 px-2 py-0.5 font-bold uppercase tracking-[0.12em]">Rivalry</span>}
          <span className="rounded bg-slate-800/70 px-2 py-0.5">Audio: {(feedback?.audioCues?.[0] ?? "crowd_bed")}</span>
        </div>
      </div>
    </header>
  );
}
