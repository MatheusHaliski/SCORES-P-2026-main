export const SIMULATION_SPEED_KEY = "scores:simulation_speed";

export type SimulationSpeedOption = {
  id: "normal" | "fast" | "turbo";
  label: string;
  description: string;
  tickIntervalMs: number;
  simulatedSecondsPerTick: number;
  quarterDuration: number;
};

export const SIMULATION_SPEED_OPTIONS: SimulationSpeedOption[] = [
  {
    id: "normal",
    label: "Normal",
    description: "Ritmo padrão da simulação.",
    tickIntervalMs: 500,
    simulatedSecondsPerTick: 3,
    quarterDuration: 180,
  },
  {
    id: "fast",
    label: "Rápido",
    description: "Quarter mais ágil, sem perder leitura do jogo.",
    tickIntervalMs: 350,
    simulatedSecondsPerTick: 4,
    quarterDuration: 150,
  },
  {
    id: "turbo",
    label: "Turbo",
    description: "Máxima fluidez para avançar partidas rapidamente.",
    tickIntervalMs: 250,
    simulatedSecondsPerTick: 6,
    quarterDuration: 120,
  },
];

export const getSimulationSpeedOption = (speedId?: string | null) =>
  SIMULATION_SPEED_OPTIONS.find((option) => option.id === speedId) ?? SIMULATION_SPEED_OPTIONS[0];
