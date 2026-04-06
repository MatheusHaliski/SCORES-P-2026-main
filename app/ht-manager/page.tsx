import { HTManagerClient } from "@/app/ht-manager/HTManagerClient";

export default async function HTManagerBoardView({ searchParams }: { searchParams: Promise<{ saveId?: string }> }) {
  const params = await searchParams;
  const saveId = params.saveId ?? "save-001";

  return (
    <main className="mx-auto min-h-screen max-w-7xl p-6">
      <h1 className="text-3xl font-black text-white">HTManagerBoardView</h1>
      <p className="text-slate-300">Intervalo do quarter: substituições reais + troca tática com impacto no placar.</p>
      <div className="mt-4">
        <HTManagerClient saveId={saveId} />
      </div>
    </main>
  );
}
