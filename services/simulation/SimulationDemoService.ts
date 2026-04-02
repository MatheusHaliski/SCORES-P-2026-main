import { GameSimulationEngine } from "@/engines/gameSimulationEngine";
import { mockPlayers, mockTeams } from "@/mocks/gameData";
import { TeamMatchState } from "@/types/simulation";

const toTeamMatchState = (teamId: string, isHome: boolean): TeamMatchState => {
  const team = mockTeams.find((item) => item.id === teamId);
  if (!team) throw new Error(`Team ${teamId} not found`);

  const players = mockPlayers.filter((player) => player.teamId === teamId);
  const starters = players.filter((player) => player.isStarter).slice(0, 5);
  const bench = players.filter((player) => player.isBench).slice(0, 5);

  return {
    teamId,
    team,
    playersOnCourt: starters,
    benchPlayers: bench,
    fatigue: 18,
    morale: 74,
    possessionControl: isHome ? 52 : 48,
    seasonForm: isHome ? 77 : 71,
    foulTroubleCount: 0,
    disqualifiedCount: 0,
    isHome,
    tactics: {
      offense: isHome ? "balanced" : "perimeter",
      defense: isHome ? "man" : "zone",
      offenseRating: isHome ? 78 : 75,
      defenseRating: isHome ? 80 : 76,
      paceModifier: isHome ? 2 : 4,
      threePointTendency: isHome ? 35 : 44,
    },
  };
};

/**
 * Exemplo solicitado: simulação de um quarter completo com eventos de pontuação.
 */
export function runQuarterSimulationExample(seed = 20260402) {
  const home = toTeamMatchState("t-wolves", true);
  const away = toTeamMatchState("t-sharks", false);

  const engine = new GameSimulationEngine(seed);
  const state = engine.createInitialState(home, away);

  // Executa 1 quarter completo (48 ticks de 15s).
  state.quarter = 1;
  const afterQuarter = engine.simulateQuarter(state);

  return {
    score: afterQuarter.score,
    quarterPoints: {
      home: afterQuarter.quarterPoints.home[0],
      away: afterQuarter.quarterPoints.away[0],
    },
    possessions: afterQuarter.possessions,
    efficiency: {
      home: Number(((afterQuarter.quarterPoints.home[0] / Math.max(1, afterQuarter.possessions.home)) * 100).toFixed(2)),
      away: Number(((afterQuarter.quarterPoints.away[0] / Math.max(1, afterQuarter.possessions.away)) * 100).toFixed(2)),
    },
    events: afterQuarter.events,
  };
}

export function runFullMatchSimulationExample(seed = 20260402) {
  const home = toTeamMatchState("t-wolves", true);
  const away = toTeamMatchState("t-sharks", false);
  const engine = new GameSimulationEngine(seed);
  return engine.simulateMatch(home, away);
}
