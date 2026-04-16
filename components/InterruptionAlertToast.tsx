export function InterruptionAlertToast({ text }: { text: string | null }) {
  if (!text) return null;
  return (
    <div className="fixed bottom-5 left-1/2 z-[97] -translate-x-1/2 rounded-full border border-cyan-300/40 bg-slate-950/90 px-4 py-2 text-xs font-semibold tracking-wide text-cyan-100 shadow-lg">
      {text}
    </div>
  );
}
