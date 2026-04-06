export class PlayerInjuryService {
  estimateRisk(params: {
    baseInjuryRisk: number;
    conditioning: number;
    stamina: number;
    tacticIntensity: "low" | "balanced" | "high";
    contactLevel: number;
  }) {
    const conditioningModifier = params.conditioning >= 85 ? 0.85 : params.conditioning >= 70 ? 1 : params.conditioning >= 55 ? 1.18 : 1.35;
    const fatigueModifier = params.stamina >= 85 ? 0.9 : params.stamina >= 70 ? 1 : params.stamina >= 55 ? 1.15 : 1.3;
    const tacticIntensityModifier = params.tacticIntensity === "high" ? 1.2 : params.tacticIntensity === "low" ? 0.9 : 1;
    const contactModifier = Math.max(0.9, Math.min(1.25, params.contactLevel));

    const injuryRisk = params.baseInjuryRisk * fatigueModifier * conditioningModifier * tacticIntensityModifier * contactModifier;
    return {
      injuryRisk,
      conditioningModifier,
      fatigueModifier,
      tacticIntensityModifier,
      contactModifier,
    };
  }
}
