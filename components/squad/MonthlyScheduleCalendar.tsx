"use client";

import Image from "next/image";
import { Team } from "@/types/game";
import { SeasonCalendar } from "@/types/season";

type CalendarFixtureBadge = {
  fixtureId: string;
  date: string;
  opponentCode: string;
  opponentLogoUrl?: string;
  homeAway: "home" | "away";
  isNextMatch: boolean;
  round: number;
};

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const toDateOnly = (value: string) => {
  const [yyyy, mm, dd] = value.split("T")[0].split("-");
  return new Date(Number(yyyy), Number(mm) - 1, Number(dd));
};

const formatDateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

export function MonthlyScheduleCalendar({
  calendar,
  teamsById,
  userTeamId,
  currentDate,
  nextFixtureId,
}: {
  calendar: SeasonCalendar;
  teamsById: Record<string, Team>;
  userTeamId: string;
  currentDate: string;
  nextFixtureId?: string | null;
}) {
  const referenceDate = toDateOnly(currentDate);
  const monthStart = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1);
  const monthEnd = new Date(referenceDate.getFullYear(), referenceDate.getMonth() + 1, 0);
  const startOffset = monthStart.getDay();
  const totalCells = Math.ceil((startOffset + monthEnd.getDate()) / 7) * 7;

  const badgesByDay = calendar.entries.reduce<Record<string, CalendarFixtureBadge[]>>((acc, entry) => {
    const isHome = entry.homeTeamId === userTeamId;
    const opponentId = isHome ? entry.awayTeamId : entry.homeTeamId;
    const opponent = teamsById[opponentId];
    const key = entry.date.split("T")[0];
    const badge: CalendarFixtureBadge = {
      fixtureId: entry.fixtureId,
      date: entry.date,
      opponentCode: opponent?.shortName ?? "OPP",
      opponentLogoUrl: opponent?.logoUrl,
      homeAway: isHome ? "home" : "away",
      isNextMatch: entry.fixtureId === nextFixtureId,
      round: entry.round,
    };
    if (!acc[key]) acc[key] = [];
    acc[key].push(badge);
    return acc;
  }, {});

  return (
    <div className="space-y-3">
      <p className="text-sm font-bold text-cyan-200">{monthStart.toLocaleString("en-US", { month: "long", year: "numeric" })}</p>
      <div className="grid grid-cols-7 gap-2 text-center text-[11px] uppercase tracking-wider text-slate-300">
        {weekDays.map((day) => <p key={day}>{day}</p>)}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: totalCells }).map((_, index) => {
          const dayNumber = index - startOffset + 1;
          const inMonth = dayNumber >= 1 && dayNumber <= monthEnd.getDate();
          const date = new Date(monthStart.getFullYear(), monthStart.getMonth(), dayNumber);
          const key = formatDateKey(date);
          const fixtures = inMonth ? (badgesByDay[key] ?? []) : [];
          const isToday = inMonth && key === formatDateKey(referenceDate);
          return (
            <div key={key + index} className={`min-h-24 rounded-xl border p-2 ${inMonth ? "border-white/20 bg-slate-900/60" : "border-white/5 bg-slate-950/30"}`}>
              {inMonth && (
                <>
                  <p className={`text-xs font-bold ${isToday ? "text-amber-200" : "text-slate-200"}`}>{dayNumber}</p>
                  <div className="mt-1 space-y-1">
                    {fixtures.slice(0, 2).map((fixture) => (
                      <div key={fixture.fixtureId} className={`rounded border px-1 py-0.5 text-[10px] ${fixture.isNextMatch ? "border-cyan-300 bg-cyan-500/20 text-cyan-100" : "border-white/15 bg-slate-800/80 text-slate-200"}`}>
                        <div className="flex items-center gap-1">
                          {fixture.opponentLogoUrl ? <Image src={fixture.opponentLogoUrl} alt={fixture.opponentCode} width={12} height={12} className="h-3 w-3 rounded-full object-cover" /> : <span>🏀</span>}
                          <span>{fixture.homeAway === "home" ? "vs" : "@"} {fixture.opponentCode}</span>
                        </div>
                        <p className="text-[9px]">R{fixture.round} {fixture.isNextMatch ? "• NEXT" : ""}</p>
                      </div>
                    ))}
                    {fixtures.length > 2 && <p className="text-[10px] text-slate-400">+{fixtures.length - 2} games</p>}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
