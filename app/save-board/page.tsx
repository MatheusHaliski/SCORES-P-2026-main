import { SaveGameService } from "@/services/SaveGameService";
import { SaveBoardClient } from "@/app/save-board/SaveBoardClient";

export default async function SavingBoardView() {
  const slots = await new SaveGameService().getSaveSlots("u-1");

  return (
    <main className="mx-auto min-h-screen max-w-5xl p-6">
      <h1 className="text-3xl font-black text-white">SavingBoardView</h1>
      <p className="text-slate-300">Gerencie saves da collection user_saves.</p>
      <SaveBoardClient initialSlots={slots} />
    </main>
  );
}
