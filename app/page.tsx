import Image from "next/image";
import { PrimaryMenuButton } from "@/components/PrimaryMenuButton";
import ContentAccessGate from "@/app/components/shell/ContentAccessGate";

export default function HomeView() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl items-center justify-center p-6">
      <ContentAccessGate>
        <section className="w-full max-w-2xl rounded-3xl border border-white/20 bg-slate-950/70 p-8 shadow-2xl">
          <div className="mb-4 h-14 w-40">
            <Image
              src="/81002908-DEEB-4A44-AD5F-F5FA637A495C_1_105_c.jpeg"
              alt="Logo do Scores"
              width={160}
              height={56}
              className="h-full w-full object-contain object-left"
              priority
            />
          </div>
          <h1 className="mt-2 text-4xl font-black text-white">Bem Vindo ao Scores!</h1>
          <p className="mt-3 text-slate-300">Escolha como deseja continuar sua carreira.</p>
          <div className="mt-8 space-y-3">
            <PrimaryMenuButton href="/select-team" title="Novo Jogo" description="Escolha liga e clube para iniciar um save." />
            <PrimaryMenuButton href="/save-board" title="Jogo Salvo" description="Carregue, gerencie ou remova saves existentes." />
            <PrimaryMenuButton href="/config" title="Configurações" description="Ajuste experiência, idioma, simulação e preferências." />
          </div>
        </section>
      </ContentAccessGate>
    </main>
  );
}
