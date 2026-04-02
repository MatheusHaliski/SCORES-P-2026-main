import { TeamMatchState } from "@/types/simulation";

export type ContextBreakdown = {
  homeFactor: number;
  seasonFormFactor: number;
  luckFactor: number;
  fatigueFactor: number;
  disciplineFactor: number;
  moraleFactor: number;
  gameStateFactor: number;
  value: number;
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export class ContextEngine {
  evaluate(attacking: TeamMatchState, defending: TeamMatchState, scoreDiff: number, random: () => number): ContextBreakdown {
    const homeFactor = attacking.isHome ? 1.03 : 0.98;
    const seasonFormFactor = 0.92 + (attacking.seasonForm / 100) * 0.16;
    const luckFactor = 0.95 + random() * 0.1;
    const fatigueFactor = 1 - attacking.fatigue / 220;
    const disciplineFactor = 1 - (attacking.foulTroubleCount * 0.015 + attacking.disqualifiedCount * 0.03);
    const moraleFactor = 0.9 + attacking.morale / 500;

    // Quem está perdendo força o ritmo; quem está ganhando controla mais o jogo.
    let gameStateFactor = 1;
    if (scoreDiff < -8) gameStateFactor += 0.05;
    if (scoreDiff > 8) gameStateFactor -= 0.03;

    // Defesa rival muito cansada concede bônus marginal.
    gameStateFactor += clamp((defending.fatigue - 55) / 500, -0.02, 0.04);

    const value = clamp(
      homeFactor * seasonFormFactor * luckFactor * fatigueFactor * disciplineFactor * moraleFactor * gameStateFactor,
      0.7,
      1.3,
    );

    return {
      homeFactor,
      seasonFormFactor,
      luckFactor,
      fatigueFactor,
      disciplineFactor,
      moraleFactor,
      gameStateFactor,
      value,
    };
  }
}
