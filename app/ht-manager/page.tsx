import { HTManagerClient } from "@/app/ht-manager/HTManagerClient";
import { UserSavesRepository } from "@/repositories/UserSavesRepository";
import { redirect } from "next/navigation";
import { getHalftimeBoardStyle, getMatchInfoBarStyle } from "@/styles/metallicTheme";

export default async function HTManagerBoardView({ searchParams }: { searchParams: Promise<{ saveId?: string; fixtureId?: string }> }) {
  const params = await searchParams;
  const saveId = params.saveId ?? "save-001";
  const fixtureId = params.fixtureId ?? "";
  const save = await new UserSavesRepository().getSaveById(saveId);

  if (!save || save.employmentStatus !== "employed") {
    redirect(`/squad?saveId=${saveId}&tab=standings`);
  }

  return (
    <main className="mx-auto min-h-screen max-w-7xl p-6">
      <div className="rounded-2xl p-4" style={getMatchInfoBarStyle()}>
        <h1 className="text-3xl font-black text-white">HTManagerBoardView</h1>
        <p className="text-slate-300">Intervalo do quarter: substituições reais + troca tática com impacto no placar.</p>
      </div>
      <div className="sa-premium-gradient-surface sa-metallic-sheen mt-4 rounded-3xl p-4" style={getHalftimeBoardStyle()}>
        <HTManagerClient saveId={saveId} fixtureId={fixtureId} />
      </div>
    </main>
  );
}
