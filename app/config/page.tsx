"use client";

import { useMemo, useState } from "react";
import { SectionCard } from "@/components/SectionCard";
import { getLS, setLS } from "@/app/lib/SafeStorage";
import { getSimulationSpeedOption, SIMULATION_SPEED_KEY, SIMULATION_SPEED_OPTIONS } from "@/app/lib/simulationConfig";
import { getShellBackgroundOption, SHELL_BACKGROUND_KEY, SHELL_BACKGROUND_OPTIONS } from "@/app/lib/shellBackground";

export default function ConfigView() {
  const [simulationSpeed, setSimulationSpeed] = useState(() => {
    const storedSpeed = getLS(SIMULATION_SPEED_KEY);
    return getSimulationSpeedOption(storedSpeed).id;
  });

  const [shellBackground, setShellBackground] = useState(() => {
    const storedBackground = getLS(SHELL_BACKGROUND_KEY);
    return getShellBackgroundOption(storedBackground).id;
  });

  const selectedSimulationSpeed = useMemo(
    () => getSimulationSpeedOption(simulationSpeed),
    [simulationSpeed],
  );

  const selectedShellBackground = useMemo(
    () => getShellBackgroundOption(shellBackground),
    [shellBackground],
  );

  const configFields = [
    { label: "Volume", value: "80%" },
    { label: "Idioma", value: "Português (BR)" },
    { label: "Dificuldade", value: "Pro Manager" },
    { label: "Preferência visual", value: "Cores do clube" },
    { label: "Resolução/base layout", value: "1920x1080" },
    { label: "Animações", value: "Ligado" },
  ];

  const handleSimulationSpeedChange = (nextSpeed: string) => {
    const safeSpeed = getSimulationSpeedOption(nextSpeed).id;
    setSimulationSpeed(safeSpeed);
    setLS(SIMULATION_SPEED_KEY, safeSpeed);
  };


  const handleShellBackgroundChange = (nextBackground: string) => {
    const safeBackground = getShellBackgroundOption(nextBackground).id;
    setShellBackground(safeBackground);
    setLS(SHELL_BACKGROUND_KEY, safeBackground);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('scores-shell-background-change'));
    }
  };

  return (
    <main className="mx-auto min-h-screen max-w-4xl p-6">
      <SectionCard title="ConfigView" subtitle="Ajuste a velocidade do quarter para partidas mais fluidas">
        <div className="mb-4 rounded-lg border border-cyan-400/30 bg-slate-800/80 p-4">
          <p className="text-xs text-cyan-300">Velocidade do tempo por quarter</p>
          <p className="mt-1 text-sm text-slate-200">{selectedSimulationSpeed.description}</p>
          <div className="mt-3 grid gap-2 md:grid-cols-3">
            {SIMULATION_SPEED_OPTIONS.map((option) => {
              const isSelected = option.id === simulationSpeed;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleSimulationSpeedChange(option.id)}
                  className={`rounded-lg border px-3 py-2 text-left transition ${isSelected ? "border-cyan-300 bg-cyan-500/20 text-white" : "border-white/10 bg-slate-900/60 text-slate-300 hover:border-cyan-400/50"}`}
                >
                  <p className="text-sm font-bold">{option.label}</p>
                  <p className="text-[11px] opacity-80">
                    tick {option.tickIntervalMs}ms • +{option.simulatedSecondsPerTick}s
                  </p>
                </button>
              );
            })}
          </div>
        </div>
        <div className="mb-4 rounded-lg border border-fuchsia-400/30 bg-slate-800/80 p-4">
          <p className="text-xs text-fuchsia-300">Background Studio da Shell</p>
          <p className="mt-1 text-sm text-slate-200">{selectedShellBackground.description}</p>
          <div className="mt-3 grid gap-2 md:grid-cols-3">
            {SHELL_BACKGROUND_OPTIONS.map((option) => {
              const isSelected = option.id === shellBackground;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleShellBackgroundChange(option.id)}
                  className={`rounded-lg border px-3 py-2 text-left transition ${isSelected ? "border-fuchsia-300 bg-fuchsia-500/20 text-white" : "border-white/10 bg-slate-900/60 text-slate-300 hover:border-fuchsia-400/50"}`}
                >
                  <p className="text-sm font-bold">{option.label}</p>
                  <p className="text-[11px] opacity-80">{option.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-2 md:grid-cols-2">
          {configFields.map((field) => (
            <div key={field.label} className="rounded-lg border border-white/10 bg-slate-800/70 p-3">
              <p className="text-xs text-slate-400">{field.label}</p>
              <p className="text-sm font-semibold text-white">{field.value}</p>
            </div>
          ))}
        </div>
      </SectionCard>
    </main>
  );
}
