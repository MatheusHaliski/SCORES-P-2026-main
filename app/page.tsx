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
    <main className="mx-auto flex min-h-screen max-w-6xl items-center justify-center p-6">
      <ContentAccessGate>
        <section className="grid w-full max-w-5xl gap-4 lg:grid-cols-[280px,1fr]">
          <UserProfileSidebar userIdentifier={userLabel} />
          <div className="w-full rounded-3xl border border-white/20 bg-slate-950/70 p-8 shadow-2xl">
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
            <h1 className="mt-2 text-4xl font-black text-white">Bem-vindo, {userLabel} ao Scores!</h1>
            <p className="mt-3 text-slate-300">Escolha como deseja continuar sua carreira.</p>
            <div className="mt-8 space-y-3">
              <PrimaryMenuButton href="/select-team" title="Novo Jogo" description="Escolha liga e clube para iniciar um save." />
              <PrimaryMenuButton href="/save-board" title="Jogo Salvo" description="Carregue, gerencie ou remova saves existentes." />
              <PrimaryMenuButton href="/config" title="Configurações" description="Ajuste experiência, idioma, simulação e preferências." />
            </div>
          </div>
        </section>
      </ContentAccessGate>
    </main>
  );
}
