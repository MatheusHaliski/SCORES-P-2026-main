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

type MetalPalette = {
  primary: string;
  secondary: string;
  highlight: string;
};

const defaultPalette: MetalPalette = {
  primary: "#0f172a",
  secondary: "#1e293b",
  highlight: "#38bdf8",
};

function withAlpha(hexColor: string, alphaHex: string) {
  return `${hexColor}${alphaHex}`;
}

export function getMetalPanelStyle(palette: MetalPalette = defaultPalette): CSSProperties {
  return {
    ...getMetallicStyle(),
    borderRadius: "16px",
    border: `1px solid ${withAlpha(palette.highlight, "4d")}`,
    backgroundImage: `${getMetallicGradient()}, linear-gradient(145deg, ${withAlpha(palette.primary, "bf")}, ${withAlpha(palette.secondary, "8a")}), repeating-linear-gradient(0deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 1px, transparent 1px, transparent 3px)`,
    boxShadow: `inset 0 1px 0 rgba(255,255,255,0.16), inset 0 -20px 30px rgba(2,6,23,0.26), 0 12px 34px rgba(2,6,23,0.48), 0 0 18px ${withAlpha(palette.highlight, "33")}`,
  };
}

export function getMetalListPanelStyle(palette: MetalPalette = defaultPalette): CSSProperties {
  return {
    ...getMetalPanelStyle(palette),
    borderRadius: "14px",
    backgroundImage: `${getMetallicGradient()}, linear-gradient(160deg, ${withAlpha(palette.primary, "cc")}, ${withAlpha(palette.secondary, "73")}), repeating-linear-gradient(90deg, rgba(255,255,255,0.018) 0px, rgba(255,255,255,0.018) 1px, transparent 1px, transparent 5px)`,
    boxShadow: `inset 0 1px 0 rgba(255,255,255,0.14), inset 0 -16px 28px rgba(2,6,23,0.24), 0 10px 28px rgba(2,6,23,0.5), 0 0 18px ${withAlpha(palette.highlight, "29")}`,
  };
}

export function getMetalInfoPanelStyle(palette: MetalPalette = defaultPalette): CSSProperties {
  return {
    ...getMetalPanelStyle(palette),
    borderRadius: "12px",
    backgroundImage: `${getMetallicGradient()}, linear-gradient(136deg, ${withAlpha(palette.primary, "b3")}, ${withAlpha(palette.secondary, "70")})`,
    boxShadow: `inset 0 1px 0 rgba(255,255,255,0.15), inset 0 -10px 24px rgba(2,6,23,0.22), 0 8px 18px rgba(2,6,23,0.42), 0 0 14px ${withAlpha(palette.highlight, "22")}`,
  };
}

export function getClubIdentityPanelStyle(palette: MetalPalette = defaultPalette): CSSProperties {
  return {
    ...getMetalInfoPanelStyle(palette),
    borderRadius: "14px",
    backgroundImage: `${getMetallicGradient()}, linear-gradient(128deg, ${withAlpha(palette.primary, "bf")}, ${withAlpha(palette.secondary, "7d")}), repeating-linear-gradient(-10deg, rgba(255,255,255,0.025) 0px, rgba(255,255,255,0.025) 1px, transparent 1px, transparent 5px)`,
    boxShadow: `inset 0 1px 0 rgba(255,255,255,0.16), inset 0 -12px 24px rgba(2,6,23,0.22), 0 10px 22px rgba(2,6,23,0.44), 0 0 16px ${withAlpha(palette.highlight, "26")}`,
  };
}

export function getMetalPlayerRowStyle(palette: MetalPalette = defaultPalette, selected = false): CSSProperties {
  return {
    ...getMetallicStyle(),
    borderRadius: "10px",
    border: `1px solid ${withAlpha(palette.highlight, selected ? "80" : "52")}`,
    backgroundImage: `${getMetallicGradient()}, linear-gradient(112deg, ${withAlpha(palette.primary, selected ? "d9" : "b8")}, ${withAlpha(palette.secondary, selected ? "99" : "66")}), repeating-linear-gradient(0deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 1px, transparent 1px, transparent 4px)`,
    boxShadow: selected
      ? `inset 0 1px 0 rgba(255,255,255,0.2), 0 0 0 1px ${withAlpha(palette.highlight, "42")}, 0 10px 24px rgba(2,6,23,0.48), 0 0 16px ${withAlpha(palette.highlight, "2e")}`
      : `inset 0 1px 0 rgba(255,255,255,0.14), 0 8px 20px rgba(2,6,23,0.4), 0 0 14px ${withAlpha(palette.highlight, "1f")}`,
    transition: "filter 180ms ease, box-shadow 180ms ease, transform 180ms ease",
  };
}

const scoresMatchPalette: MetalPalette = {
  primary: "#0f3b32",
  secondary: "#132c28",
  highlight: "#d8ba72",
};

export function getMatchPanelStyle(): CSSProperties {
  return {
    ...getMetalPanelStyle(scoresMatchPalette),
    border: "1px solid rgba(228, 201, 138, 0.45)",
    backgroundImage: `
      linear-gradient(152deg, rgba(12, 54, 44, 0.96), rgba(11, 33, 30, 0.95)),
      linear-gradient(118deg, rgba(230, 199, 120, 0.12), transparent 34%, transparent 68%, rgba(210, 219, 229, 0.1)),
      repeating-linear-gradient(-13deg, rgba(220, 190, 118, 0.08) 0 2px, rgba(82, 64, 35, 0.08) 2px 4px)
    `,
  };
}

export function getMatchCardStyle(isHighlighted = false): CSSProperties {
  return {
    ...getMatchPanelStyle(),
    borderRadius: "14px",
    border: `1px solid ${isHighlighted ? "rgba(242, 216, 150, 0.8)" : "rgba(226, 196, 126, 0.4)"}`,
    boxShadow: isHighlighted
      ? "inset 0 1px 0 rgba(255,255,255,.24), 0 10px 28px rgba(2,6,23,.5), 0 0 20px rgba(228,199,120,.28)"
      : "inset 0 1px 0 rgba(255,255,255,.18), 0 8px 20px rgba(2,6,23,.44)",
  };
}

export function getMatchInfoBarStyle(): CSSProperties {
  return {
    ...getMetalInfoPanelStyle(scoresMatchPalette),
    border: "1px solid rgba(232, 208, 149, 0.5)",
    backgroundImage: `
      linear-gradient(136deg, rgba(20, 73, 61, 0.95), rgba(17, 51, 44, 0.9)),
      repeating-linear-gradient(-20deg, rgba(226, 198, 128, 0.1) 0 3px, rgba(72, 58, 34, 0.12) 3px 6px)
    `,
  };
}

export function getHalftimeBoardStyle(): CSSProperties {
  return {
    ...getMatchPanelStyle(),
    borderRadius: "20px",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,.22), inset 0 -20px 40px rgba(0,0,0,.26), 0 18px 44px rgba(0,0,0,.42), 0 0 24px rgba(216,186,114,.18)",
  };
}

export function getElectronicScoreShellStyle(): CSSProperties {
  return {
    backgroundImage: `
      linear-gradient(180deg, #dfe5ea 0%, #a8b2b8 20%, #7b8790 50%, #a8b2b8 80%, #e7edf2 100%),
      repeating-linear-gradient(180deg, rgba(255,255,255,0.06) 0px, rgba(255,255,255,0.06) 1px, rgba(0,0,0,0.03) 2px, transparent 3px, transparent 4px)
    `,
    backgroundBlendMode: "overlay",
    border: "1px solid rgba(255,255,255,0.2)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -1px 0 rgba(0,0,0,0.18), 0 6px 20px rgba(0,0,0,0.38)",
    borderRadius: "16px",
    position: "relative",
  };
}

export function getElectronicScoreDisplayStyle(): CSSProperties {
  return {
    background: "linear-gradient(180deg, #182028 0%, #0f1419 100%)",
    border: "1px solid rgba(255,255,255,0.16)",
    boxShadow: "inset 0 0 18px rgba(255,255,255,0.05), inset 0 0 2px rgba(255,255,255,0.18), 0 0 12px rgba(125,211,252,0.08)",
    borderRadius: "10px",
    color: "#f3fbff",
    textShadow: "0 0 8px rgba(240,248,255,0.5), 0 0 16px rgba(148,163,184,0.25)",
    letterSpacing: "0.1em",
    fontVariantNumeric: "tabular-nums",
    fontWeight: 800,
    fontFamily: "var(--font-tech), ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  };
}
