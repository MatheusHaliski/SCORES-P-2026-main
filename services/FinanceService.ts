export class FinanceService {
  canAfford(currentBudget: number, cost: number) {
    return currentBudget >= cost;
  }

  applyExpense(currentBudget: number, expense: number) {
    return currentBudget - Math.max(0, expense);
  }

  applyIncome(currentBudget: number, income: number) {
    return currentBudget + Math.max(0, income);
  }
}
