import { StandingRow, UserSave } from "@/types/game";
import { TeamsRepository } from "@/repositories/TeamsRepository";

export const CRITICAL_REPUTATION_THRESHOLD = 6;
export const MANAGER_DISMISSAL_THRESHOLD_ROUNDS = 5;

const clampStars = (value: number) => Math.max(0, Math.min(10, Math.round(value)));

type CareerRoundEvaluation = {
  savePatch: Partial<UserSave>;
  dismissed: boolean;
  dismissalReason: string | null;
};

export class ManagerCareerService {
  constructor(private teamsRepository = new TeamsRepository()) {}

  async updateAfterRound(save: UserSave, finishedFixtures: { homeTeamId: string; awayTeamId: string; homeScore: number; awayScore: number }[], standings: StandingRow[]): Promise<CareerRoundEvaluation> {
    if (save.employmentStatus !== "employed") {
      return { savePatch: {}, dismissed: false, dismissalReason: null };
    }

    const userTeamId = save.currentClubId ?? save.teamId;
    const fixture = finishedFixtures.find((item) => item.homeTeamId === userTeamId || item.awayTeamId === userTeamId);
    if (!fixture) {
      return { savePatch: {}, dismissed: false, dismissalReason: null };
    }

    const isHome = fixture.homeTeamId === userTeamId;
    const goalsFor = isHome ? fixture.homeScore : fixture.awayScore;
    const goalsAgainst = isHome ? fixture.awayScore : fixture.homeScore;
    const won = goalsFor > goalsAgainst;
    const lost = goalsFor < goalsAgainst;
    const margin = goalsFor - goalsAgainst;

    let boardDelta = won ? 1 : lost ? -1 : 0;
    let fansDelta = won ? 1 : lost ? -1 : 0;

    const standing = standings.find((row) => row.teamId === userTeamId);
    const bottomZoneStart = Math.max(standings.length - 3, 1);
    if (standing) {
      if (standing.position <= 3) {
        boardDelta += 1;
        fansDelta += 1;
      }
      if (standing.position >= bottomZoneStart) {
        boardDelta -= 1;
        fansDelta -= 1;
      }
    }

    if (lost && margin <= -10) {
      boardDelta -= 1;
      fansDelta -= 1;
    }

    const opponentTeamId = isHome ? fixture.awayTeamId : fixture.homeTeamId;
    const [team, opponentTeam] = await Promise.all([
      this.teamsRepository.getTeamById(userTeamId),
      this.teamsRepository.getTeamById(opponentTeamId),
    ]);

    if (team && opponentTeam) {
      const overallGap = team.overall - opponentTeam.overall;
      if (won && overallGap <= -4) {
        fansDelta += 1;
      }
      if (lost && overallGap >= 4) {
        boardDelta -= 1;
      }
    }

    const nextBoard = clampStars(save.boardReputation + boardDelta);
    const nextFans = clampStars(save.fansReputation + fansDelta);

    const roundsUnderCriticalBoard = nextBoard < CRITICAL_REPUTATION_THRESHOLD ? save.roundsUnderCriticalBoard + 1 : 0;
    const roundsUnderCriticalFans = nextFans < CRITICAL_REPUTATION_THRESHOLD ? save.roundsUnderCriticalFans + 1 : 0;
    const roundsUnderCriticalCombined = nextBoard < CRITICAL_REPUTATION_THRESHOLD && nextFans < CRITICAL_REPUTATION_THRESHOLD
      ? save.roundsUnderCriticalCombined + 1
      : 0;

    const shouldDismiss = roundsUnderCriticalCombined >= 4
      || roundsUnderCriticalBoard >= MANAGER_DISMISSAL_THRESHOLD_ROUNDS
      || roundsUnderCriticalFans >= MANAGER_DISMISSAL_THRESHOLD_ROUNDS;

    if (!shouldDismiss) {
      return {
        dismissed: false,
        dismissalReason: null,
        savePatch: {
          boardReputation: nextBoard,
          fansReputation: nextFans,
          roundsUnderCriticalBoard,
          roundsUnderCriticalFans,
          roundsUnderCriticalCombined,
        },
      };
    }

    return {
      dismissed: true,
      dismissalReason: this.buildDismissalReason(roundsUnderCriticalBoard, roundsUnderCriticalFans, roundsUnderCriticalCombined),
      savePatch: {
        boardReputation: nextBoard,
        fansReputation: nextFans,
        roundsUnderCriticalBoard,
        roundsUnderCriticalFans,
        roundsUnderCriticalCombined,
        isEmployed: false,
        employmentStatus: "spectator",
        currentClubId: null,
        dismissalCount: save.dismissalCount + 1,
        lastDismissedClubId: userTeamId,
        lastDismissedAt: new Date().toISOString(),
      },
    };
  }

  private buildDismissalReason(boardRounds: number, fanRounds: number, combinedRounds: number) {
    if (combinedRounds >= 4) return "Diretoria e torcida perderam confiança por várias rodadas.";
    if (boardRounds >= MANAGER_DISMISSAL_THRESHOLD_ROUNDS) return "Pressão direta da diretoria por reputação crítica.";
    if (fanRounds >= MANAGER_DISMISSAL_THRESHOLD_ROUNDS) return "Torcida em ruptura após sequência negativa.";
    return "Desempenho abaixo do esperado.";
  }
}
