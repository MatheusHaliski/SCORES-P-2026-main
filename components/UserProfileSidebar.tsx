"use client";

import { clearAuthSessionProfile, clearAuthSessionToken } from "@/app/lib/authSession";
import { clearServerSession } from "@/app/lib/clientSession";
import { useRouter } from "next/navigation";

type UserProfileSidebarProps = {
  userIdentifier?: string;
  activeSaveName?: string;
};

export function UserProfileSidebar({ userIdentifier, activeSaveName }: UserProfileSidebarProps) {
  const router = useRouter();

  const handleLogout = async () => {
    clearAuthSessionToken();
    clearAuthSessionProfile();
    await clearServerSession().catch(() => undefined);
    router.replace("/authview");
  };

  return (
    <aside className="w-full max-w-xs rounded-3xl border border-white/20 bg-slate-950/80 p-5 shadow-2xl">
      <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">Perfil</h2>
      <div className="mt-3 space-y-3 text-sm text-slate-200">
        <div className="rounded-xl border border-white/10 bg-slate-900/80 p-3">
          <p className="text-[11px] uppercase tracking-wide text-slate-400">Usuário</p>
          <p className="font-semibold text-white">{userIdentifier || "Usuário autenticado"}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-slate-900/80 p-3">
          <p className="text-[11px] uppercase tracking-wide text-slate-400">Save atual</p>
          <p className="font-semibold text-white">{activeSaveName || "Nenhum save ativo"}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={handleLogout}
        className="mt-5 w-full rounded-xl bg-rose-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-rose-500"
      >
        Logout
      </button>
    </aside>
  );
}
