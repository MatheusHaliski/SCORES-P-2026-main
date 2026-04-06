export class StadiumRevenueService {
  estimate(params: {
    capacity: number;
    ticketPrice: number;
    demand: number;
    teamForm: number;
    reputation: number;
    roundImportance: number;
  }) {
    const normalizedDemand = Math.max(0.55, Math.min(1.12, params.demand));
    const formBoost = 0.9 + Math.max(0, Math.min(0.25, params.teamForm));
    const reputationBoost = 0.85 + Math.max(0, Math.min(0.3, params.reputation / 100));
    const importanceBoost = 0.92 + Math.max(0, Math.min(0.22, params.roundImportance));
    const pricePenalty = params.ticketPrice > 70 ? Math.max(0.72, 1 - (params.ticketPrice - 70) / 180) : 1;

    const attendanceRatio = Math.max(0.4, Math.min(1, normalizedDemand * formBoost * reputationBoost * importanceBoost * pricePenalty));
    const attendance = Math.round(params.capacity * attendanceRatio);
    const revenue = attendance * params.ticketPrice;
    return { attendance, revenue, attendanceRatio };
  }
}
