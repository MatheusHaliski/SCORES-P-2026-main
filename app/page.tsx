import Image from "next/image";
import { PrimaryMenuButton } from "@/components/PrimaryMenuButton";
import ContentAccessGate from "@/app/components/shell/ContentAccessGate";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME, verifySessionToken } from "@/app/lib/serverSession";
import { UserProfileSidebar } from "@/components/UserProfileSidebar";

export default async function HomeView() {
  const cookieStore = await cookies();
  const authToken = cookieStore.get(AUTH_COOKIE_NAME)?.value ?? "";
  const session = authToken ? verifySessionToken(authToken) : null;
  const userLabel = session?.email ?? "manager@scores";

  return (
    <main
      className="mx-auto flex min-h-screen max-w-6xl items-center justify-center p-6"
      style={{
        backgroundImage: "linear-gradient(135deg, rgba(2,6,23,.75), rgba(15,23,42,.68), rgba(2,6,23,.8)), url('/ChatGPT Image 9 de abr. de 2026, 13_10_17.png')",
        backgroundPosition: "center",
        backgroundSize: "cover",
      }}
    >
      <ContentAccessGate>
        <section className="grid w-full max-w-5xl gap-4 lg:grid-cols-[280px,1fr]">
          <UserProfileSidebar userIdentifier={userLabel} />
          <div className="w-full rounded-3xl border border-white/20 bg-slate-950/72 p-8 shadow-2xl backdrop-blur-sm">
            <div className="mb-4 h-20 w-52 rounded-2xl border border-cyan-300/30 bg-slate-900/65 p-2 shadow-[0_0_25px_rgba(34,211,238,.22)]">
              <Image
                src="/1968F4FE-A4FF-44BB-944E-08BE533C975E.png"
                alt="Logo oficial do SCORES"
                width={208}
                height={80}
                className="h-full w-full object-contain object-left"
                priority
              />
            </div>
            <h1 className="mt-2 text-4xl font-black text-white">Bem-vindo, {userLabel} ao Scores!</h1>
            <p className="mt-3 text-slate-300">Escolha como deseja continuar sua carreira.</p>
            <div className="mt-8 space-y-3">
              <PrimaryMenuButton href="/select-team" title="Novo Jogo" description="Escolha liga e clube para iniciar um save." />
              <PrimaryMenuButton href="/save-board" title="Jogo Salvo" description="Carregue, gerencie ou remova saves existentes." />
              <PrimaryMenuButton href="/config" title="Preferências" description="Ajuste experiência, idioma, simulação e preferências." />
              <PrimaryMenuButton href="/database-editor" title="Editar Clubes / Ligas / Jogadores" description="Editor global da base do jogo para novos saves." />
            </div>
          </div>
        </section>
      </ContentAccessGate>
    </main>
  );
}
