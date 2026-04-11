import { CSSProperties } from "react";

export function getMetallicGradient() {
  return `
    linear-gradient(
      135deg,
      #0f172a 0%,
      #1e293b 15%,
      #334155 30%,
      #94a3b8 45%,
      #e2e8f0 50%,
      #94a3b8 55%,
      #334155 70%,
      #1e293b 85%,
      #0f172a 100%
    )
  `;
}

export function getGreenMetalOverlay() {
  return `
    linear-gradient(
      120deg,
      rgba(34,197,94,0.15),
      rgba(16,185,129,0.25),
      rgba(34,197,94,0.15)
    )
  `;
}

export function getMetallicStyle(): CSSProperties {
  return {
    backgroundImage: `${getMetallicGradient()}, ${getGreenMetalOverlay()}`,
    backgroundBlendMode: "overlay",
    border: "1px solid rgba(255,255,255,0.15)",
    boxShadow: "inset 0 0 18px rgba(255,255,255,0.08), 0 4px 20px rgba(0,0,0,0.4)",
    backdropFilter: "blur(6px)",
  };
}
