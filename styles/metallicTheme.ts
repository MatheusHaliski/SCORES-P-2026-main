import { CSSProperties } from "react";
import { ClubIdentityTheme } from "@/types/clubIdentityTheme";

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

export function getClubIdentityPanelStyle(identityTheme: ClubIdentityTheme): CSSProperties {
  return {
    ...getMetallicStyle(),
    borderRadius: "14px",
    border: `1px solid ${identityTheme.borderColor || `${identityTheme.glowColor}66`}`,
    backgroundImage: `${getMetallicGradient()}, linear-gradient(138deg, ${identityTheme.primaryColor}c9, ${identityTheme.secondaryColor}87), repeating-linear-gradient(0deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 1px, transparent 1px, transparent 4px)`,
    boxShadow: `inset 0 1px 0 rgba(255,255,255,0.16), inset 0 -12px 24px rgba(2,6,23,0.26), 0 10px 28px rgba(2,6,23,0.46), 0 0 16px ${identityTheme.glowColor}2e`,
    color: identityTheme.textColor,
  };
}
