import { TeamMatchState } from "@/types/simulation";

const OFFENSIVE_PLAYSTYLES = ["Sniper", "First Step", "Floor General", "Clutch Shooter", "Catch & Shoot", "Microwave Scorer"];
const DEFENSIVE_PLAYSTYLES = ["Lockdown Defender", "Post Defender", "Rim Protector", "Bruiser", "Hustle"];

export type PlaystyleImpact = {
  offenseSynergy: number;
  defenseImpact: number;
  threePointBonus: number;
  clutchBonus: number;
  notes: string[];
};

/**
 * Traduz playstyles em modificadores condicionais.
 * Mantém a lógica isolada para expansão futura (traits raras, chemistry, etc.).
 */
export class PlaystyleEngine {
  evaluate(attackingTeam: TeamMatchState, defendingTeam: TeamMatchState, quarter: number, timeRemaining: number): PlaystyleImpact {
    const offenseStyles = attackingTeam.playersOnCourt.flatMap((player) => player.playstyles);
    const defenseStyles = defendingTeam.playersOnCourt.flatMap((player) => player.playstyles);

    const offenseCount = offenseStyles.filter((style) => OFFENSIVE_PLAYSTYLES.includes(style)).length;
    const defenseCount = defenseStyles.filter((style) => DEFENSIVE_PLAYSTYLES.includes(style)).length;

    let threePointBonus = offenseStyles.includes("Sniper") ? 0.06 : 0;
    let offenseSynergy = Math.min(0.12, offenseCount * 0.015);
    const defenseImpact = Math.min(0.14, defenseCount * 0.018);

    // Floor General melhora criação coletiva.
    if (offenseStyles.includes("Floor General")) {
      offenseSynergy += 0.025;
    }

    // Lockdown reduz eficiência do melhor jogador rival.
    if (defenseStyles.includes("Lockdown Defender")) {
      offenseSynergy -= 0.02;
    }

    // Bruiser aumenta impacto físico defensivo.
    if (defenseStyles.includes("Bruiser")) {
      threePointBonus -= 0.01;
    }

    let clutchBonus = 0;
    const inClutchWindow = timeRemaining <= 120;
    if (inClutchWindow && offenseStyles.includes("Clutch Shooter")) {
      clutchBonus = 0.05;
      threePointBonus += 0.03;
    }

    if (attackingTeam.tactics.offense === "perimeter") {
      threePointBonus += 0.04;
    }

    if (quarter === 4 && inClutchWindow) {
      offenseSynergy += 0.01;
    }

    return {
      offenseSynergy,
      defenseImpact,
      threePointBonus: Math.max(0, threePointBonus),
      clutchBonus,
      notes: [
        `offStyles=${offenseCount}`,
        `defStyles=${defenseCount}`,
      ],
    };
  }
}
