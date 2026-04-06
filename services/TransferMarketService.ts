import { Player } from "@/types/game";

export class TransferMarketService {
  getOfferAcceptanceScore(params: {
    player: Player;
    offerValue: number;
    sellerBudget: number;
    isTransferListed: boolean;
  }) {
    const valueRatio = params.offerValue / Math.max(1, params.player.marketValue);
    const offerValueFactor = Math.max(-25, Math.min(35, (valueRatio - 1) * 80));
    const transferListedBonus = params.isTransferListed ? 16 : 0;
    const budgetNeedBonus = params.sellerBudget < 20000000 ? 12 : 0;
    const keyPlayerPenalty = params.player.isStarter ? 18 : 5;
    const lowOfferPenalty = valueRatio < 0.9 ? (0.9 - valueRatio) * 80 : 0;
    const ageBonus = params.player.age >= 30 ? 6 : 0;

    const score = offerValueFactor + transferListedBonus + budgetNeedBonus + ageBonus - keyPlayerPenalty - lowOfferPenalty;

    return {
      score,
      accepted: score >= 10,
      counter: score >= 0 && score < 10,
      requestedValue: Math.round(params.player.marketValue * (params.player.isStarter ? 1.22 : 1.08)),
    };
  }
}
