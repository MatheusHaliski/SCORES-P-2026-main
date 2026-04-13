"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Team } from "@/types/game";
import { SeasonCalendar } from "@/types/season";

type CalendarFixtureBadge = {
  fixtureId: string;
  date: string;
  homeTeamCode: string;
  awayTeamCode: string;
  homeTeamLogoUrl?: string;
  awayTeamLogoUrl?: string;
  isNextMatch: boolean;
  round: number;
  status: "scheduled" | "live" | "halftime" | "finished";
  homeScore: number;
  awayScore: number;
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
  currentDate,
  nextFixtureId,
}: {
  calendar: SeasonCalendar;
  teamsById: Record<string, Team>;
  currentDate: string;
  nextFixtureId?: string | null;
}) {
  const referenceDate = toDateOnly(currentDate);
  const [monthCursor, setMonthCursor] = useState(() => new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1));
  const monthStart = new Date(monthCursor.getFullYear(), monthCursor.getMonth(), 1);
  const monthEnd = new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 0);
  const startOffset = monthStart.getDay();
  const totalCells = Math.ceil((startOffset + monthEnd.getDate()) / 7) * 7;

  const badgesByDay = useMemo(() => (
    calendar.entries.reduce<Record<string, CalendarFixtureBadge[]>>((acc, entry) => {
      const homeTeam = teamsById[entry.homeTeamId];
      const awayTeam = teamsById[entry.awayTeamId];
      const key = entry.date.split("T")[0];
      const badge: CalendarFixtureBadge = {
        fixtureId: entry.fixtureId,
        date: entry.date,
        homeTeamCode: homeTeam?.shortName ?? "HOME",
        awayTeamCode: awayTeam?.shortName ?? "AWAY",
        homeTeamLogoUrl: homeTeam?.logoUrl,
        awayTeamLogoUrl: awayTeam?.logoUrl,
        isNextMatch: entry.fixtureId === nextFixtureId,
        round: entry.round,
        status: entry.status,
        homeScore: entry.homeScore,
        awayScore: entry.awayScore,
      };
      if (!acc[key]) acc[key] = [];
      acc[key].push(badge);
      return acc;
    }, {})
  ), [calendar.entries, nextFixtureId, teamsById]);

  const goToPreviousMonth = () => {
    setMonthCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setMonthCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <button type="button" onClick={goToPreviousMonth} className="rounded border border-white/20 px-2 py-1 text-xs font-bold text-slate-100 hover:bg-white/10">← Prev</button>
        <p className="text-sm font-bold text-cyan-200">{monthStart.toLocaleString("en-US", { month: "long", year: "numeric" })}</p>
        <button type="button" onClick={goToNextMonth} className="rounded border border-white/20 px-2 py-1 text-xs font-bold text-slate-100 hover:bg-white/10">Next →</button>
      </div>
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
                    {fixtures.map((fixture) => (
                      <div key={fixture.fixtureId} className={`rounded border px-1 py-0.5 text-[10px] ${fixture.isNextMatch ? "border-cyan-300 bg-cyan-500/20 text-cyan-100" : fixture.status === "finished" ? "border-emerald-300/40 bg-emerald-500/15 text-emerald-100" : "border-white/15 bg-slate-800/80 text-slate-200"}`}>
                        <div className="flex items-center justify-between gap-1">
                          <span className="flex items-center gap-1">
                            {fixture.homeTeamLogoUrl ? <Image src={fixture.homeTeamLogoUrl} alt={fixture.homeTeamCode} width={12} height={12} className="h-3 w-3 rounded-full object-cover" /> : <span>🏀</span>}
                            <span>{fixture.homeTeamCode}</span>
                          </span>
                          <span className="text-[9px] text-slate-300">vs</span>
                          <span className="flex items-center gap-1">
                            <span>{fixture.awayTeamCode}</span>
                            {fixture.awayTeamLogoUrl ? <Image src={fixture.awayTeamLogoUrl} alt={fixture.awayTeamCode} width={12} height={12} className="h-3 w-3 rounded-full object-cover" /> : <span>🏀</span>}
                          </span>
                        </div>
                        <p className="text-[9px]">
                          R{fixture.round}
                          {fixture.status === "finished"
                            ? ` • ${fixture.homeScore}-${fixture.awayScore}`
                            : fixture.isNextMatch
                              ? " • NEXT"
                              : ""}
                        </p>
                      </div>
                    ))}
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
