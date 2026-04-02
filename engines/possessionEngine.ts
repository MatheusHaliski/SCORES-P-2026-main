import { MatchState } from "@/types/simulation";

export type PossessionTickResult = {
  attackingSide: "home" | "away";
  attempts: number;
  possessionFactor: number;
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

/**
 * Engine de posses: define quem ataca no tick e quantas oportunidades ocorrem.
 */
export class PossessionEngine {
  getTickPossession(state: MatchState, random: () => number): PossessionTickResult {
    const homeControl = state.homeTeam.possessionControl;
    const awayControl = state.awayTeam.possessionControl;
    const totalControl = homeControl + awayControl;

    const homeProbability = homeControl / totalControl;
    const attackingSide: "home" | "away" = random() < homeProbability ? "home" : "away";

    const attacking = attackingSide === "home" ? state.homeTeam : state.awayTeam;
    const defending = attackingSide === "home" ? state.awayTeam : state.homeTeam;

    const basePace = (attacking.playersOnCourt.reduce((sum, p) => sum + p.pace, 0) / attacking.playersOnCourt.length +
      defending.playersOnCourt.reduce((sum, p) => sum + p.pace, 0) / defending.playersOnCourt.length) / 2;

    const paceFactor = clamp(basePace / 100 + (attacking.tactics.paceModifier + defending.tactics.paceModifier) / 100, 0.75, 1.35);

    // 1 posse por tick quase sempre; pace alto cria chance de posse extra no mesmo tick.
    const extraAttemptChance = Math.max(0, (paceFactor - 1) * 0.55);
    const attempts = 1 + (random() < extraAttemptChance ? 1 : 0);

    const possessionFactor = attacking.possessionControl / totalControl;

    return { attackingSide, attempts, possessionFactor };
  }
}
