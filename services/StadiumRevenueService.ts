export class StadiumRevenueService {
  estimate(params: {
    capacity: number;
    ticketPrice: number;
    baseDemand: number;
    teamMomentum: number;
    reputation: number;
    rivalry: number;
    matchImportance: number;
  }) {
    const ticketPriceModifier = params.ticketPrice <= 30
      ? 1.08
      : params.ticketPrice <= 55
        ? 1
        : params.ticketPrice <= 75
          ? 0.93
          : 0.84;

    const teamMomentumModifier = Math.max(0.88, Math.min(1.14, params.teamMomentum));
    const reputationModifier = 0.9 + Math.max(0, Math.min(0.18, params.reputation / 100));
    const rivalryModifier = Math.max(0.94, Math.min(1.12, params.rivalry));
    const matchImportanceModifier = Math.max(0.92, Math.min(1.2, params.matchImportance));

    const attendanceRate = Math.max(
      0.35,
      Math.min(
        1,
        params.baseDemand
        * ticketPriceModifier
        * teamMomentumModifier
        * reputationModifier
        * rivalryModifier
        * matchImportanceModifier,
      ),
    );

    const attendance = Math.floor(params.capacity * attendanceRate);
    const matchRevenue = attendance * params.ticketPrice;

    return {
      attendance,
      matchRevenue,
      attendanceRate,
      modifiers: {
        ticketPriceModifier,
        teamMomentumModifier,
        reputationModifier,
        rivalryModifier,
        matchImportanceModifier,
      },
    };
  }
}
