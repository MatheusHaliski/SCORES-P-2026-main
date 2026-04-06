export class ClubVisualService {
  reputationToLabel(value: number) {
    if (value >= 9) return "Excelente";
    if (value >= 7) return "Boa";
    if (value >= 6) return "Estável";
    if (value >= 4) return "Em risco";
    return "Crítica";
  }

  boardExpectation(params: { teamPosition: number; boardReputation: number }) {
    if (params.teamPosition <= 2) return "Ser campeão da liga";
    if (params.teamPosition <= 4) return "Chegar às finais";
    if (params.teamPosition <= 8 && params.boardReputation >= 7) return "Classificar para os playoffs";
    if (params.teamPosition <= 10) return "Terminar no top 4";
    return "Evitar últimas posições";
  }

  ensureReadableAccent(hex: string) {
    const normalized = hex.startsWith("#") ? hex.slice(1) : hex;
    if (normalized.length !== 6) return "#f8fafc";
    const r = parseInt(normalized.slice(0, 2), 16);
    const g = parseInt(normalized.slice(2, 4), 16);
    const b = parseInt(normalized.slice(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance < 0.2 ? "#e2e8f0" : hex;
  }
}
