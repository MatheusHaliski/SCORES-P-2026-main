import GameAccessGuard from "@/app/components/session/GameAccessGuard";
import Link from "next/link";
import { SaveSlotCard } from "@/components/SaveSlotCard";
import { SaveGameService } from "@/services/SaveGameService";

export default async function SavingBoardView() {
  const slots = await new SaveGameService().getSaveSlots("u-1");

  return (
    <><GameAccessGuard /><main className="mx-auto min-h-screen max-w-5xl p-6">
      <h1 className="text-3xl font-black text-white">SavingBoardView</h1>
      <p className="text-slate-300">Gerencie saves da collection user_saves.</p>
      <div className="mt-5 space-y-3">
        {slots.map((slot) => (
          <SaveSlotCard key={slot.save.id} save={slot.save} team={slot.team} league={slot.league} />
        ))}
      </div>
      <Link href="/select-team" className="mt-4 inline-block rounded bg-cyan-600 px-4 py-2 text-sm font-semibold text-white">
        Criar novo save
      </Link>
    </main></>
  );
}
