import { PlayerMorale } from "@/types/game";

export const MORALE_MODIFIERS: Record<PlayerMorale, number> = {
  "Muito Feliz": 1.06,
  "Feliz": 1.03,
  "Contente": 1,
  "Insatisfeito": 0.96,
  "Muito Insatisfeito": 0.91,
};

export class PlayerMoraleService {
  getModifier(morale: PlayerMorale | undefined) {
    return MORALE_MODIFIERS[morale ?? "Contente"];
  }

  nextMorale(params: {
    current: PlayerMorale | undefined;
    won?: boolean;
    salaryChangePct?: number;
    injuryStatus?: "Disponível" | "Lesionado";
    transferListed?: boolean;
    proposalRejected?: boolean;
  }): PlayerMorale {
    const ladder: PlayerMorale[] = ["Muito Insatisfeito", "Insatisfeito", "Contente", "Feliz", "Muito Feliz"];
    let idx = ladder.indexOf(params.current ?? "Contente");

    if (params.won) idx += 1;
    if (params.salaryChangePct && params.salaryChangePct > 0) idx += 1;
    if (params.salaryChangePct && params.salaryChangePct < 0) idx -= 1;
    if (params.injuryStatus === "Lesionado") idx -= 1;
    if (params.transferListed) idx -= 1;
    if (params.proposalRejected) idx -= 1;

    return ladder[Math.max(0, Math.min(ladder.length - 1, idx))];
  }
}
