import { ClubUniformAssets, defaultTacticalPreset, defaultUniformAssets, TacticalPreset } from "@/types/tactical";

const uniformKey = (saveId: string) => `scores:club_uniforms:${saveId}`;
const preMatchTacticKey = (saveId: string) => `scores:pre_match_tactic:${saveId}`;

export function readClubUniforms(saveId: string): ClubUniformAssets {
  if (typeof window === "undefined") return defaultUniformAssets;
  const raw = window.localStorage.getItem(uniformKey(saveId));
  if (!raw) return defaultUniformAssets;
  try {
    const parsed = JSON.parse(raw) as Partial<ClubUniformAssets>;
    return {
      ...defaultUniformAssets,
      ...parsed,
    };
  } catch {
    return defaultUniformAssets;
  }
}

export function writeClubUniforms(saveId: string, uniforms: ClubUniformAssets) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(uniformKey(saveId), JSON.stringify(uniforms));
}

export function readPreMatchTactic(saveId: string): TacticalPreset {
  if (typeof window === "undefined") return defaultTacticalPreset;
  const raw = window.localStorage.getItem(preMatchTacticKey(saveId));
  if (!raw) return defaultTacticalPreset;
  try {
    return { ...defaultTacticalPreset, ...(JSON.parse(raw) as Partial<TacticalPreset>) };
  } catch {
    return defaultTacticalPreset;
  }
}

export function writePreMatchTactic(saveId: string, tactic: TacticalPreset) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(preMatchTacticKey(saveId), JSON.stringify(tactic));
}
