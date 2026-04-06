export class PlaystyleInventoryService {
  availableItems(inventory: Record<string, number>) {
    return Object.entries(inventory)
      .filter(([, amount]) => amount > 0)
      .map(([name, amount]) => ({ name, amount }));
  }

  consume(inventory: Record<string, number>, playstyle: string) {
    const current = inventory[playstyle] ?? 0;
    if (current <= 0) return inventory;

    return {
      ...inventory,
      [playstyle]: current - 1,
    };
  }
}
