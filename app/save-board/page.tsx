import { SaveGameService } from "@/services/SaveGameService";
import { SaveBoardClient } from "@/app/save-board/SaveBoardClient";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME, verifySessionToken } from "@/app/lib/serverSession";

export default async function SavingBoardView() {
  const cookieStore = await cookies();
  const authToken = cookieStore.get(AUTH_COOKIE_NAME)?.value ?? "";
  const session = authToken ? verifySessionToken(authToken) : null;
  const slots = session?.sub
    ? await new SaveGameService().getSaveSlots(session.sub)
    : [];

  return (
    <main className="mx-auto min-h-screen max-w-5xl p-6">
      <h1 className="text-3xl font-black text-white">SavingBoardView</h1>
      <p className="text-slate-300">Gerencie saves da collection user_saves.</p>
      <SaveBoardClient initialSlots={slots} />
    </main>
  );
}
