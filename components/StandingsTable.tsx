"use client";

import { useMemo, useState } from "react";
import type { Player, Stadium, StandingRow, Team } from "@/types/game";
import type { SeasonCalendarEntry } from "@/types/season";
import { LeagueInsightsPanel } from "@/components/standings/LeagueInsightsPanel";
import { LeagueStandingsTable } from "@/components/standings/LeagueStandingsTable";
import { MVPPanel } from "@/components/standings/MVPPanel";
import { MatchRoundsPanel } from "@/components/standings/MatchRoundsPanel";
import { TopPlayersPanel } from "@/components/standings/TopPlayersPanel";

export type TeamFormMap = Record<string, Array<"W" | "L">>;

export type EnhancedStandingRow = StandingRow & {
  winPct: number;
  form: Array<"W" | "L">;
  streak: string;
};

function projectedStats(player: Player) {
  const points = Number((((player.attributes.close_shot + player.attributes.three_point_shot + player.attributes.mid_range_shot) / 3) * 0.34).toFixed(1));
  const assists = Number((((player.attributes.passing_accuracy + player.attributes.court_vision + player.attributes.playmaking_iq) / 3) * 0.12).toFixed(1));
  const rebounds = Number((((player.attributes.vertical + player.attributes.strength + player.attributes.balance) / 3) * 0.1).toFixed(1));
  return { points, assists, rebounds };
}

function buildFormMap(seasonEntries: SeasonCalendarEntry[]): TeamFormMap {
  const finished = seasonEntries
    .filter((entry) => entry.status === "finished")
    .sort((a, b) => (a.round === b.round ? b.date.localeCompare(a.date) : b.round - a.round));

  const formMap: TeamFormMap = {};
  for (const match of finished) {
    if (!formMap[match.homeTeamId]) formMap[match.homeTeamId] = [];
    if (!formMap[match.awayTeamId]) formMap[match.awayTeamId] = [];

    formMap[match.homeTeamId].push(match.homeScore > match.awayScore ? "W" : "L");
    formMap[match.awayTeamId].push(match.awayScore > match.homeScore ? "W" : "L");
  }

  return Object.fromEntries(Object.entries(formMap).map(([teamId, form]) => [teamId, form.slice(0, 5)]));
}

function buildStreak(form: Array<"W" | "L">): string {
  if (!form.length) return "-";
  const head = form[0];
  let count = 0;
  for (const result of form) {
    if (result !== head) break;
    count += 1;
  }
  return `${head}${count}`;
}

function calculateInsights(rows: EnhancedStandingRow[]) {
  if (!rows.length) return [];

  const bestStreak = rows.reduce((acc, row) => {
    const count = Number(row.streak.slice(1) || 0);
    if (row.streak.startsWith("W") && count > acc.count) return { teamId: row.teamId, count };
    return acc;
  }, { teamId: rows[0].teamId, count: 0 });

  const bestAttack = [...rows].sort((a, b) => b.pointsFor - a.pointsFor)[0];
  const worstDefense = [...rows].sort((a, b) => b.pointsAgainst - a.pointsAgainst)[0];

  return [
    { icon: "🔥", key: "streak", message: `Sequência quente: ${bestStreak.teamId} venceu ${bestStreak.count} seguidas.` },
    { icon: "🚀", key: "attack", message: `Melhor ataque: ${bestAttack.teamId} (${bestAttack.pointsFor} PF).` },
    { icon: "🧱", key: "defense", message: `Defesa mais vazada: ${worstDefense.teamId} (${worstDefense.pointsAgainst} PA).` },
  ];
}

export function StandingsTable({
  rows,
  teamsById,
  playoffSpots = 8,
  dangerSpots = 3,
  highlightTeamId,
  leagueName,
  leagueLogo,
  players = [],
  seasonEntries = [],
  stadiumsByTeamId = {},
}: {
  rows: StandingRow[];
  teamsById: Record<string, Team>;
  playoffSpots?: number;
  dangerSpots?: number;
  highlightTeamId?: string;
  leagueName?: string;
  leagueLogo?: string;
  players?: Player[];
  seasonEntries?: SeasonCalendarEntry[];
  stadiumsByTeamId?: Record<string, Stadium | null>;
}) {
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(highlightTeamId ?? rows[0]?.teamId ?? null);

  const formMap = useMemo(() => buildFormMap(seasonEntries), [seasonEntries]);

  const enrichedRows = useMemo<EnhancedStandingRow[]>(() => rows.map((row) => {
    const form = formMap[row.teamId] ?? [];
    return {
      ...row,
      winPct: row.played ? row.wins / row.played : 0,
      form,
      streak: buildStreak(form),
    };
  }), [formMap, rows]);

  const projectedPlayers = useMemo(() => players.map((player) => ({
    ...player,
    projected: projectedStats(player),
  })), [players]);

  const mvp = useMemo(() => {
    if (!projectedPlayers.length) return null;
    return projectedPlayers.reduce((best, candidate) => {
      const bestScore = best.overall * 2 + best.projected.points * 1.4 + best.projected.assists + best.projected.rebounds;
      const candidateScore = candidate.overall * 2 + candidate.projected.points * 1.4 + candidate.projected.assists + candidate.projected.rebounds;
      return candidateScore > bestScore ? candidate : best;
    });
  }, [projectedPlayers]);

  const leaders = useMemo(() => {
    const byPoints = [...projectedPlayers].sort((a, b) => b.projected.points - a.projected.points)[0] ?? null;
    const byAssists = [...projectedPlayers].sort((a, b) => b.projected.assists - a.projected.assists)[0] ?? null;
    const byRebounds = [...projectedPlayers].sort((a, b) => b.projected.rebounds - a.projected.rebounds)[0] ?? null;
    return { byPoints, byAssists, byRebounds };
  }, [projectedPlayers]);

  const topPlayers = useMemo(() => [...projectedPlayers].sort((a, b) => b.overall - a.overall).slice(0, 5), [projectedPlayers]);

  const latestRoundGames = useMemo(() => {
    const finished = seasonEntries.filter((entry) => entry.status === "finished");
    const latestRound = finished.reduce((maxRound, entry) => Math.max(maxRound, entry.round), 0);
    return finished.filter((entry) => entry.round === latestRound);
  }, [seasonEntries]);

  const insights = useMemo(() => {
    const teamAware = calculateInsights(enrichedRows).map((item) => ({
      ...item,
      message: item.message.replace(/([a-z]{2,}-\d{3})/gi, (teamId) => teamsById[teamId]?.name ?? teamId),
    }));
    return teamAware;
  }, [enrichedRows, teamsById]);

  const selectedTeam = selectedTeamId ? teamsById[selectedTeamId] : null;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-[1.8fr,1fr]">
        <LeagueStandingsTable
          rows={enrichedRows}
          teamsById={teamsById}
          playoffSpots={playoffSpots}
          dangerSpots={dangerSpots}
          highlightTeamId={highlightTeamId}
          leagueName={leagueName}
          leagueLogo={leagueLogo}
          onSelectTeam={setSelectedTeamId}
          selectedTeamId={selectedTeamId}
        />
        <div className="space-y-4">
          <MVPPanel mvp={mvp} leaders={leaders} teamsById={teamsById} />
          <LeagueInsightsPanel insights={insights} />
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr,1fr]">
        <TopPlayersPanel players={topPlayers} teamsById={teamsById} selectedTeamId={selectedTeamId} />
        <MatchRoundsPanel games={latestRoundGames} teamsById={teamsById} stadiumsByTeamId={stadiumsByTeamId} />
      </div>

      {selectedTeam && (
        <div className="rounded-2xl border border-cyan-300/30 bg-slate-900/70 p-3 text-sm shadow-[0_0_35px_rgba(34,211,238,0.2)]">
          <p className="text-[11px] uppercase tracking-[0.24em] text-cyan-200">Time Selecionado</p>
          <p className="text-lg font-black text-white">{selectedTeam.name}</p>
          <p className="text-slate-300">Overall {selectedTeam.overall} • Ataque {selectedTeam.attackOverall} • Defesa {selectedTeam.defenseOverall}</p>
        </div>
      )}
    </div>
  );
}
