import GameAccessGuard from "@/app/components/session/GameAccessGuard";
import { PrimaryMenuButton } from "@/components/PrimaryMenuButton";

export default function HomeView() {
  return (
    <><GameAccessGuard /><main className="mx-auto flex min-h-screen max-w-5xl items-center justify-center p-6">
      <section className="w-full max-w-2xl rounded-3xl border border-white/20 bg-slate-950/70 p-8 shadow-2xl">
        <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">SCORES</p>
        <h1 className="mt-2 text-4xl font-black text-white">Basketball Manager Prototype</h1>
        <p className="mt-3 text-slate-300">Escolha como deseja continuar sua carreira.</p>
        <div className="mt-8 space-y-3">
          <PrimaryMenuButton href="/select-team" title="Novo Jogo" description="Escolha liga e clube para iniciar um save." />
          <PrimaryMenuButton href="/save-board" title="Jogo Salvo" description="Carregue, gerencie ou remova saves existentes." />
          <PrimaryMenuButton href="/config" title="Configurações" description="Ajuste experiência, idioma, simulação e preferências." />
        </div>
      </section>
    </main></>
  );
}
