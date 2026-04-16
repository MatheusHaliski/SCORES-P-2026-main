import { MatchSession, ScoreBreakdown } from "@/types/matchSession";

const Row = ({ label, home, away }: { label: string; home: number; away: number }) => (
  <div className="grid grid-cols-[1fr_auto_auto] gap-3 text-xs">
    <span className="text-slate-300">{label}</span>
    <b className="text-cyan-100">{home}</b>
    <b className="text-fuchsia-100">{away}</b>
  </div>
);

const value = (key: keyof ScoreBreakdown, session: MatchSession) => ({ home: session.homeBreakdown[key], away: session.awayBreakdown[key] });

export function ScoreBreakdownPanel({ session }: { session: MatchSession }) {
  const onePt = value("onePointMade", session);
  const twoPt = value("twoPointMade", session);
  const threePt = value("threePointMade", session);
  const paint = value("paintPoints", session);
  const fastBreak = value("fastBreakPoints", session);
  const secondChance = value("secondChancePoints", session);
  const bench = value("benchPoints", session);

  return (
    <section className="rounded-2xl border border-white/20 bg-slate-950/65 p-3">
      <p className="mb-2 text-xs font-black uppercase tracking-[0.2em] text-cyan-200">Score Breakdown</p>
      <div className="space-y-1.5">
        <Row label="FT Made" home={onePt.home} away={onePt.away} />
        <Row label="2PT Made" home={twoPt.home} away={twoPt.away} />
        <Row label="3PT Made" home={threePt.home} away={threePt.away} />
        <Row label="Paint Points" home={paint.home} away={paint.away} />
        <Row label="Fast Break" home={fastBreak.home} away={fastBreak.away} />
        <Row label="2nd Chance" home={secondChance.home} away={secondChance.away} />
        <Row label="Bench Points" home={bench.home} away={bench.away} />
      </div>
    </section>
  );
}
