export function EjectionAlert({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="fixed left-1/2 top-5 z-[99] w-[min(92vw,620px)] -translate-x-1/2 rounded-xl border border-rose-300/60 bg-rose-950/90 px-4 py-3 text-sm font-black text-rose-100 shadow-2xl shadow-rose-950/60">
      {message}
    </div>
  );
}
