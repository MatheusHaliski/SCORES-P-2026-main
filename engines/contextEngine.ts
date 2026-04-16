import { TeamMatchState } from "@/types/simulation";

export type ContextBreakdown = {
  homeFactor: number;
  seasonFormFactor: number;
  tablePressureFactor: number;
  luckFactor: number;
  fatigueFactor: number;
  disciplineFactor: number;
  moraleFactor: number;
  managerMoraleFactor: number;
  momentumFactor: number;
  historyFactor: number;
  gameStateFactor: number;
  value: number;
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export class ContextEngine {
  evaluate(attacking: TeamMatchState, defending: TeamMatchState, scoreDiff: number, random: () => number): ContextBreakdown {
    const homeFactor = attacking.isHome ? 1.03 : 0.98;
    const seasonFormFactor = 0.92 + (attacking.seasonForm / 100) * 0.16;
    const tablePressureFactor = this.getTablePressureFactor(attacking);
    const luckFactor = 0.95 + random() * 0.1;
    const fatigueFactor = 1 - attacking.fatigue / 220;
    const disciplineFactor = 1 - (attacking.foulTroubleCount * 0.015 + attacking.disqualifiedCount * 0.03);
    const moraleFactor = 0.9 + attacking.morale / 500;
    const managerMorale = attacking.managerMorale ?? attacking.morale;
    const managerMoraleFactor = 0.96 + managerMorale / 1200;
    const momentumFactor = 1 + clamp((attacking.momentum ?? 0) / 1000, -0.08, 0.08);
    const historyFactor = 1 + clamp((attacking.historyEdge ?? 0) / 1200, -0.06, 0.06);

    // Quem está perdendo força o ritmo; quem está ganhando controla mais o jogo.
    let gameStateFactor = 1;
    if (scoreDiff < -8) gameStateFactor += 0.05;
    if (scoreDiff > 8) gameStateFactor -= 0.03;

    // Defesa rival muito cansada concede bônus marginal.
    gameStateFactor += clamp((defending.fatigue - 55) / 500, -0.02, 0.04);

    const value = clamp(
      homeFactor *
        seasonFormFactor *
        tablePressureFactor *
        luckFactor *
        fatigueFactor *
        disciplineFactor *
        moraleFactor *
        managerMoraleFactor *
        momentumFactor *
        historyFactor *
        gameStateFactor,
      0.66,
      1.34,
    );

    return {
      homeFactor,
      seasonFormFactor,
      tablePressureFactor,
      luckFactor,
      fatigueFactor,
      disciplineFactor,
      moraleFactor,
      managerMoraleFactor,
      momentumFactor,
      historyFactor,
      gameStateFactor,
      value,
    };
  }

  private getTablePressureFactor(team: TeamMatchState): number {
    if (!team.seasonPosition || !team.expectedSeasonPosition) return 1;
    const delta = team.expectedSeasonPosition - team.seasonPosition;
    if (delta >= 3) return 1.03;
    if (delta <= -3) return 0.97;
    return 1;
  }
}
