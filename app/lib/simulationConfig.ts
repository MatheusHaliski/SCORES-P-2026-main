export const SIMULATION_SPEED_KEY = "scores:simulation_speed";

export type SimulationSpeedOption = {
  id: "normal" | "fast" | "turbo";
  label: string;
  description: string;
  tickIntervalMs: number;
  simulatedSecondsPerTick: number;
  quarterDuration: number;
};

export type SimulationPaceProfile = {
  tickRateMultiplier: number;
  eventCadenceMultiplier: number;
  scoringCadenceMultiplier: number;
  possessionResolutionMultiplier: number;
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

export const SIMULATION_SPEED_PROFILE: Record<SimulationSpeedOption["id"], SimulationPaceProfile> = {
  normal: {
    tickRateMultiplier: 1,
    eventCadenceMultiplier: 1,
    scoringCadenceMultiplier: 1,
    possessionResolutionMultiplier: 1,
  },
  fast: {
    tickRateMultiplier: 1.6,
    eventCadenceMultiplier: 1.45,
    scoringCadenceMultiplier: 1.4,
    possessionResolutionMultiplier: 1.45,
  },
  turbo: {
    tickRateMultiplier: 2.25,
    eventCadenceMultiplier: 2,
    scoringCadenceMultiplier: 1.9,
    possessionResolutionMultiplier: 2,
  },
};

export const getSimulationSpeedOption = (speedId?: string | null) =>
  SIMULATION_SPEED_OPTIONS.find((option) => option.id === speedId) ?? SIMULATION_SPEED_OPTIONS[0];

export const getSimulationPaceProfile = (speedId?: string | null): SimulationPaceProfile =>
  SIMULATION_SPEED_PROFILE[getSimulationSpeedOption(speedId).id];
