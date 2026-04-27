export type ScoreType = "3PT" | "2PT" | "1PT";

interface ScoreTypeIconProps {
  type: ScoreType;
  size?: number;
}

const THEME: Record<ScoreType, { fill: string; stroke: string; glow: string }> = {
  "3PT": {
    fill: "#7C4DFF",
    stroke: "#B388FF",
    glow: "rgba(124, 77, 255, 0.75)",
  },
  "2PT": {
    fill: "#FF8F00",
    stroke: "#FFD54F",
    glow: "rgba(255, 143, 0, 0.75)",
  },
  "1PT": {
    fill: "#ECEFF1",
    stroke: "#90A4AE",
    glow: "rgba(236, 239, 241, 0.65)",
  },
};

export function ScoreTypeIcon({ type, size = 28 }: ScoreTypeIconProps) {
  const theme = THEME[type];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      aria-label={`${type} score icon`}
      className="score-type-icon"
      style={{
        filter: `drop-shadow(0 0 7px ${theme.glow})`,
        flexShrink: 0,
      }}
    >
      <circle cx="16" cy="16" r="13" fill={theme.fill} stroke={theme.stroke} strokeWidth="2" />
      <path d="M16 3 C13 8,13 24,16 29" stroke="#1B1B1B" strokeWidth="1.6" fill="none" opacity="0.75" />
      <path d="M16 3 C19 8,19 24,16 29" stroke="#1B1B1B" strokeWidth="1.6" fill="none" opacity="0.75" />
      <path d="M4 16 H28" stroke="#1B1B1B" strokeWidth="1.6" fill="none" opacity="0.75" />
      <path d="M7 8 C12 12,20 12,25 8" stroke="#1B1B1B" strokeWidth="1.4" fill="none" opacity="0.65" />
      <path d="M7 24 C12 20,20 20,25 24" stroke="#1B1B1B" strokeWidth="1.4" fill="none" opacity="0.65" />
    </svg>
  );
}
