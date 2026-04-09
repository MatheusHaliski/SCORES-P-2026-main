"use client";

import { useEffect, useMemo, useState } from "react";
import { clearAuthSessionProfile, clearAuthSessionToken } from "@/app/lib/authSession";
import { clearServerSession } from "@/app/lib/clientSession";
import { useRouter } from "next/navigation";
import { BackgroundStudioModal } from "@/components/BackgroundStudioModal";
import { BackgroundStudioConfig, buildBackgroundImage, buildPageBackgroundStyle, createDefaultStudioConfig, normalizeBackgroundStudioConfig } from "@/types/backgroundStudio";
import { SHELL_BACKGROUND_CUSTOM_OPTION_ID, SHELL_BACKGROUND_CUSTOM_STYLE_KEY, SHELL_BACKGROUND_KEY } from "@/app/lib/shellBackground";

type UserProfileSidebarProps = {
  userIdentifier?: string;
  activeSaveName?: string;
  saveId?: string;
  clubPrimaryColor?: string;
  clubSecondaryColor?: string;
  initialStudioConfig?: BackgroundStudioConfig;
};

const studioStorageKey = (saveId: string) => `scores:background-studio:${saveId}`;

export function UserProfileSidebar({
  userIdentifier,
  activeSaveName,
  saveId = "save-001",
  clubPrimaryColor = "#1d4ed8",
  clubSecondaryColor = "#22d3ee",
  initialStudioConfig,
}: UserProfileSidebarProps) {
  const router = useRouter();
  const [openStudio, setOpenStudio] = useState(false);
  const [config, setConfig] = useState<BackgroundStudioConfig>(() => {
    const fallback = initialStudioConfig ?? createDefaultStudioConfig(clubPrimaryColor, clubSecondaryColor);
    if (typeof window === "undefined") return fallback;
    const raw = window.localStorage.getItem(studioStorageKey(saveId));
    if (!raw) return normalizeBackgroundStudioConfig(fallback, clubPrimaryColor, clubSecondaryColor);
    try {
      return normalizeBackgroundStudioConfig(JSON.parse(raw) as Partial<BackgroundStudioConfig>, clubPrimaryColor, clubSecondaryColor);
    } catch {
      window.localStorage.removeItem(studioStorageKey(saveId));
      return normalizeBackgroundStudioConfig(fallback, clubPrimaryColor, clubSecondaryColor);
    }
  });

  const resolvedConfig = useMemo(() => {
    if (!config.palette.useClubColors) return config;
    return {
      ...config,
      palette: {
        ...config.palette,
        primary: clubPrimaryColor,
        secondary: clubSecondaryColor,
      },
    };
  }, [clubPrimaryColor, clubSecondaryColor, config]);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.scoresSkin = resolvedConfig.skinMode;
    root.style.setProperty("--scores-bg-image", buildBackgroundImage(resolvedConfig));
    root.style.setProperty("--scores-bg-contrast", `${resolvedConfig.contrast}%`);
    root.style.setProperty("--scores-bg-blur", `${resolvedConfig.blurStrength}px`);
    root.style.setProperty("--scores-bg-highlight", resolvedConfig.palette.highlight);
    root.style.setProperty("--scores-metallic-texture", `${Math.max(0.1, resolvedConfig.textureIntensity / 100)}`);
    root.style.setProperty("--scores-metallic-gloss", `${Math.max(0.1, resolvedConfig.glossIntensity / 100)}`);
    root.style.setProperty("--scores-metallic-polish", `${Math.max(0.1, resolvedConfig.borderPolishIntensity / 100)}`);

    const shellStyle = buildPageBackgroundStyle(resolvedConfig);
    window.localStorage.setItem(SHELL_BACKGROUND_CUSTOM_STYLE_KEY, JSON.stringify(shellStyle));
    window.localStorage.setItem(SHELL_BACKGROUND_KEY, SHELL_BACKGROUND_CUSTOM_OPTION_ID);
    window.dispatchEvent(new Event("scores-shell-background-change"));
    return () => {
      delete root.dataset.scoresSkin;
    };
  }, [resolvedConfig]);

  const handleSaveStudio = async () => {
    window.localStorage.setItem(studioStorageKey(saveId), JSON.stringify(config));
    try {
      await fetch("/api/save/background-studio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ saveId, config }),
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
      <aside className="sa-premium-gradient-surface relative z-20 w-full max-w-xs rounded-3xl border border-white/20 p-5 shadow-2xl">
        <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">Perfil</h2>
        <div className="mt-3 space-y-3 text-sm text-slate-200">
          <div className="sa-premium-gradient-surface-soft rounded-xl border border-white/10 p-3">
            <p className="text-[11px] uppercase tracking-wide text-slate-400">Usuário</p>
            <p className="font-semibold text-white">{userIdentifier || "Usuário autenticado"}</p>
          </div>
          <div className="sa-premium-gradient-surface-soft rounded-xl border border-white/10 p-3">
            <p className="text-[11px] uppercase tracking-wide text-slate-400">Save atual</p>
            <p className="font-semibold text-white">{activeSaveName || "Nenhum save ativo"}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setOpenStudio(true)}
          className="sa-premium-gradient-surface-soft mt-5 w-full rounded-xl border border-cyan-300/40 px-4 py-2 text-sm font-black text-cyan-100 shadow-[0_0_20px_rgba(34,211,238,0.24)] transition hover:scale-[1.01]"
        >
          Abrir Background Studio
        </button>

        <button
          type="button"
          onClick={handleLogout}
          className="sa-premium-gradient-surface-soft mt-3 w-full rounded-xl border border-rose-300/40 px-4 py-2 text-sm font-bold text-white transition hover:border-rose-200/60"
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
        clubPrimary={clubPrimaryColor}
        clubSecondary={clubSecondaryColor}
      />
    </>
  );
}
