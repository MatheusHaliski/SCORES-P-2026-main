import { MatchSession } from "@/types/matchSession";
import { motionTokens } from "@/app/lib/motionTokens";

type Props = {
  session: MatchSession;
  userIsHome: boolean;
};

const toClock = (seconds: number) => `${Math.floor(seconds / 60).toString().padStart(2, "0")}:${Math.floor(seconds % 60).toString().padStart(2, "0")}`;

export function BroadcastScoreBug({ session, userIsHome }: Props) {
  const fixture = session.fixtures.find((item) => item.isUserMatch);
  if (!fixture) return null;

  const homeTeamState = session.teamRuntime?.home;
  const awayTeamState = session.teamRuntime?.away;
  const homeBonus = homeTeamState ? homeTeamState.foulsThisQuarter >= session.bonusFoulLimit : false;
  const awayBonus = awayTeamState ? awayTeamState.foulsThisQuarter >= session.bonusFoulLimit : false;
  const lowShotClock = (session.shotClockRemaining ?? 24) <= 8;
  const possessionHome = session.possessionTeamId === fixture.homeTeamId;

  return (
    <header className="sa-broadcast-scorebug sticky top-2 z-30 rounded-2xl px-3 py-2 text-white md:px-5">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div className={`rounded-xl px-3 py-2 ${possessionHome ? "bg-emerald-400/20" : "bg-slate-700/35"}`}>
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-300">Home</p>
          <div className="flex items-end justify-between">
            <p className="text-sm font-extrabold md:text-lg">{fixture.homeTeamName}</p>
            <p className="text-2xl font-black tabular-nums md:text-3xl">{fixture.homeScore}</p>
          </div>
          <p className="text-[10px] text-slate-300">Fouls {homeTeamState?.foulsThisQuarter ?? fixture.homeFouls} • TO {homeTeamState?.timeoutsRemaining ?? 0} {homeBonus ? "• BONUS" : ""}</p>
        </div>

        <div className="rounded-xl border border-amber-200/30 bg-black/50 px-3 py-2 text-center">
          <p className="text-[10px] uppercase tracking-[0.22em] text-amber-300">Q{session.quarter}</p>
          <p className="font-mono text-xl font-black text-emerald-200 md:text-2xl">{toClock(session.timeRemaining)}</p>
          <div className="mt-1 flex items-center gap-2 text-[10px]">
            <span className={`rounded px-2 py-0.5 font-bold ${lowShotClock ? "bg-rose-500/30 text-rose-100 animate-pulse" : "bg-slate-700/60 text-slate-100"}`} style={{ transition: `all ${motionTokens.duration.micro}ms ${motionTokens.easing.easePremiumInOut}` }}>
              SC {Math.ceil(session.shotClockRemaining ?? 24)}
            </span>
            <span className="rounded bg-cyan-500/20 px-2 py-0.5 font-semibold text-cyan-100">POS {session.possessionTeamId === fixture.homeTeamId ? fixture.homeTeamName : fixture.awayTeamName}</span>
          </div>
        </div>

        <div className={`rounded-xl px-3 py-2 ${!possessionHome ? "bg-emerald-400/20" : "bg-slate-700/35"}`}>
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-300">Away</p>
          <div className="flex items-end justify-between">
            <p className="text-sm font-extrabold md:text-lg">{fixture.awayTeamName}</p>
            <p className="text-2xl font-black tabular-nums md:text-3xl">{fixture.awayScore}</p>
          </div>
          <p className="text-[10px] text-slate-300">Fouls {awayTeamState?.foulsThisQuarter ?? fixture.awayFouls} • TO {awayTeamState?.timeoutsRemaining ?? 0} {awayBonus ? "• BONUS" : ""}</p>
        </div>
      </div>

      <div className="mt-2 grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-[10px]">
        <p className={`text-right ${userIsHome ? "text-emerald-300" : "text-slate-400"}`}>{session.momentum.value >= 0 ? `Momentum +${Math.round(session.momentum.value)}` : ""}</p>
        <div className="h-2 w-36 overflow-hidden rounded-full bg-slate-800/70">
          <div className="h-full bg-gradient-to-r from-rose-500 to-emerald-400" style={{ width: `${Math.min(100, Math.max(0, 50 + session.momentum.value / 2))}%`, transition: `width ${motionTokens.duration.microSlow}ms ${motionTokens.easing.easeStatPop}` }} />
        </div>
        <p className={`text-left ${!userIsHome ? "text-emerald-300" : "text-slate-400"}`}>{session.momentum.value < 0 ? `Momentum +${Math.abs(Math.round(session.momentum.value))}` : ""}</p>
      </div>

      <div className="mt-1 flex items-center justify-between text-[10px] text-slate-300">
        <span>Crowd</span>
        <span>{Math.round(session.crowd.intensity)}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800/70">
        <div className="h-full bg-gradient-to-r from-slate-400 via-amber-300 to-orange-400" style={{ width: `${session.crowd.intensity}%`, transition: `width ${motionTokens.duration.microSlow}ms ${motionTokens.easing.easePremiumInOut}` }} />
      </div>
    </header>
  );
}
