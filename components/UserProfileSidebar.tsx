"use client";

import { useEffect, useMemo, useState } from "react";
import { clearAuthSessionProfile, clearAuthSessionToken } from "@/app/lib/authSession";
import { clearServerSession } from "@/app/lib/clientSession";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { BackgroundStudioModal } from "@/components/BackgroundStudioModal";
import { BackgroundStudioChangeDetail, BackgroundStudioConfig, buildBackgroundImage, buildShellBackgroundStyle, createDefaultStudioConfig, normalizeBackgroundStudioConfig } from "@/types/backgroundStudio";
import { SHELL_BACKGROUND_CUSTOM_OPTION_ID, SHELL_BACKGROUND_CUSTOM_STYLE_KEY, SHELL_BACKGROUND_KEY } from "@/app/lib/shellBackground";
import { getMetallicGradient, getMetallicStyle } from "@/styles/metallicTheme";

type UserProfileSidebarProps = {
  userIdentifier?: string;
  activeSaveName?: string;
  saveId?: string;
  initialStudioConfig?: BackgroundStudioConfig;
  clubPrimaryColor?: string;
  clubSecondaryColor?: string;
};

const studioStorageKey = (saveId: string) => `scores:background-studio:${saveId}`;

export function UserProfileSidebar({
  userIdentifier,
  activeSaveName,
  saveId = "save-001",
  initialStudioConfig,
  clubPrimaryColor,
  clubSecondaryColor,
}: UserProfileSidebarProps) {
  const router = useRouter();
  const [openStudio, setOpenStudio] = useState(false);
  const [config, setConfig] = useState<BackgroundStudioConfig>(() => {
    const fallback = initialStudioConfig ?? createDefaultStudioConfig();
    if (typeof window === "undefined") return fallback;
    const raw = window.localStorage.getItem(studioStorageKey(saveId));
    if (!raw) return normalizeBackgroundStudioConfig(fallback);
    try {
      return normalizeBackgroundStudioConfig(JSON.parse(raw) as Partial<BackgroundStudioConfig>);
    } catch {
      window.localStorage.removeItem(studioStorageKey(saveId));
      return normalizeBackgroundStudioConfig(fallback);
    }
  });

  const resolvedConfig = useMemo(() => normalizeBackgroundStudioConfig(config), [config]);
  const clubPrimary = clubPrimaryColor ?? initialStudioConfig?.uiPalette.primary ?? createDefaultStudioConfig().uiPalette.primary;
  const clubSecondary = clubSecondaryColor ?? initialStudioConfig?.uiPalette.secondary ?? createDefaultStudioConfig().uiPalette.secondary;
  const sidebarStyle = useMemo(
    () => ({
      ...getMetallicStyle(),
      borderColor: `${resolvedConfig.uiPalette.highlight}66`,
      backgroundImage: `${getMetallicGradient()}, linear-gradient(to bottom, rgba(255,255,255,0.08), transparent), linear-gradient(132deg, ${resolvedConfig.uiPalette.primary}99, ${resolvedConfig.uiPalette.secondary}88)`,
      borderRight: "1px solid rgba(255,255,255,0.12)",
      boxShadow: `0 18px 45px rgba(0,0,0,0.35), inset 0 0 0 1px ${resolvedConfig.uiPalette.highlight}33`,
      color: "#ffffff",
    }),
    [resolvedConfig.uiPalette.highlight, resolvedConfig.uiPalette.primary, resolvedConfig.uiPalette.secondary],
  );
  const panelStyle = useMemo(
    () => ({
      borderColor: `${resolvedConfig.uiPalette.highlight}55`,
      backgroundColor: `${resolvedConfig.uiPalette.primary}88`,
    }),
    [resolvedConfig.uiPalette.highlight, resolvedConfig.uiPalette.primary],
  );
  const primaryButtonStyle = useMemo(
    () => ({
      ...getMetallicStyle(),
      borderColor: `${resolvedConfig.uiPalette.highlight}88`,
      backgroundImage: `${getMetallicGradient()}, linear-gradient(136deg, ${resolvedConfig.uiPalette.secondary}aa, ${resolvedConfig.uiPalette.primary}c8)`,
      color: "#ecfeff",
      borderRadius: "10px",
      padding: "8px 14px",
    }),
    [resolvedConfig.uiPalette.highlight, resolvedConfig.uiPalette.primary, resolvedConfig.uiPalette.secondary],
  );
  const secondaryButtonStyle = useMemo(
    () => ({
      ...getMetallicStyle(),
      borderColor: `${resolvedConfig.uiPalette.highlight}55`,
      backgroundImage: `${getMetallicGradient()}, linear-gradient(136deg, ${resolvedConfig.uiPalette.primary}88, ${resolvedConfig.uiPalette.secondary}66)`,
      color: "#ffffff",
      borderRadius: "10px",
      padding: "8px 14px",
    }),
    [resolvedConfig.uiPalette.highlight, resolvedConfig.uiPalette.primary, resolvedConfig.uiPalette.secondary],
  );

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.scoresSkin = resolvedConfig.matchVisual.skinMode;
    root.style.setProperty("--scores-bg-image", buildBackgroundImage(resolvedConfig));
    root.style.setProperty("--scores-bg-contrast", `${resolvedConfig.matchVisual.contrast}%`);
    root.style.setProperty("--scores-bg-blur", `${resolvedConfig.matchVisual.blurStrength}px`);
    root.style.setProperty("--scores-bg-highlight", resolvedConfig.uiPalette.highlight);
    root.style.setProperty("--scores-metallic-texture", `${Math.max(0.1, resolvedConfig.matchVisual.textureIntensity / 100)}`);
    root.style.setProperty("--scores-metallic-gloss", `${Math.max(0.1, resolvedConfig.matchVisual.glossIntensity / 100)}`);
    root.style.setProperty("--scores-metallic-polish", `${Math.max(0.1, resolvedConfig.matchVisual.borderPolishIntensity / 100)}`);

    const shellStyle = buildShellBackgroundStyle(resolvedConfig);
    window.localStorage.setItem(studioStorageKey(saveId), JSON.stringify(resolvedConfig));
    window.localStorage.setItem(SHELL_BACKGROUND_CUSTOM_STYLE_KEY, JSON.stringify(shellStyle));
    window.localStorage.setItem(SHELL_BACKGROUND_KEY, SHELL_BACKGROUND_CUSTOM_OPTION_ID);
    window.dispatchEvent(
      new CustomEvent<BackgroundStudioChangeDetail>("scores-shell-background-change", {
        detail: { saveId, config: resolvedConfig },
      }),
    );
    return () => {
      delete root.dataset.scoresSkin;
    };
  }, [resolvedConfig, saveId]);

  const handleSaveStudio = async () => {
    window.localStorage.setItem(studioStorageKey(saveId), JSON.stringify(resolvedConfig));
    try {
      await fetch("/api/save/background-studio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ saveId, config: resolvedConfig }),
      });
    } catch {
      // fallback no local storage já aplicado.
    }
    setOpenStudio(false);
  };

  const handleLogout = async () => {
    clearAuthSessionToken();
    clearAuthSessionProfile();
    await clearServerSession().catch(() => undefined);
    router.replace("/authview");
  };

  return (
    <>
      <aside className="sa-premium-gradient-surface relative z-20 w-full max-w-xs rounded-3xl border p-5 shadow-2xl" style={sidebarStyle}>
        <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">Perfil</h2>
        <div className="mt-3 rounded-2xl border border-cyan-300/40 bg-slate-900/60 p-2 shadow-[inset_0_0_18px_rgba(56,189,248,.2)]">
          <div className="h-16 w-full overflow-hidden rounded-xl bg-slate-950/70 p-1">
            <Image src="/1968F4FE-A4FF-44BB-944E-08BE533C975E.png" alt="SCORES" width={220} height={64} className="h-full w-full object-contain" />
          </div>
        </div>

        <div className="mt-3 space-y-3 text-sm text-slate-200">
          <div className="sa-premium-gradient-surface-soft rounded-xl border p-3" style={panelStyle}>
            <p className="text-[11px] uppercase tracking-wide text-slate-400">Usuário</p>
            <p className="font-semibold text-white">{userIdentifier || "Usuário autenticado"}</p>
          </div>
          <div className="sa-premium-gradient-surface-soft rounded-xl border p-3" style={panelStyle}>
            <p className="text-[11px] uppercase tracking-wide text-slate-400">Save atual</p>
            <p className="font-semibold text-white">{activeSaveName || "Nenhum save ativo"}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setOpenStudio(true)}
          className="sa-premium-gradient-surface-soft mt-5 w-full rounded-xl border px-4 py-2 text-sm font-black transition-all duration-200 hover:scale-[1.03] hover:shadow-[0_0_25px_rgba(34,197,94,0.35)]"
          style={primaryButtonStyle}
        >
          Abrir Background Studio
        </button>

        <button
          type="button"
          onClick={handleLogout}
          className="sa-premium-gradient-surface-soft mt-3 w-full rounded-xl border px-4 py-2 text-sm font-bold transition-all duration-200 hover:scale-[1.03] hover:shadow-[0_0_25px_rgba(34,197,94,0.35)]"
          style={secondaryButtonStyle}
        >
          Logout
        </button>
      </aside>

      <BackgroundStudioModal
        open={openStudio}
        onClose={() => setOpenStudio(false)}
        config={resolvedConfig}
        onChange={setConfig}
        onSave={handleSaveStudio}
        clubPrimary={clubPrimary}
        clubSecondary={clubSecondary}
      />
    </>
  );
}
