import { motionTokens } from "@/app/lib/motionTokens";

export function PeriodTransitionOverlay({
  phase,
  visible,
}: {
  phase: string;
  visible: boolean;
}) {
  if (!visible) return null;

  const label = phase === "BREAK_Q1" ? "End of 1st Quarter" : phase === "BREAK_Q2" ? "Halftime" : phase === "BREAK_Q3" ? "End of 3rd Quarter" : "Final";

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/80 p-6">
      <div
        className="sa-premium-gradient-surface w-full max-w-xl rounded-3xl border border-amber-200/40 px-8 py-12 text-center"
        style={{
          transition: `transform ${motionTokens.duration.panel}ms ${motionTokens.easing.easeBroadcastSlide}`,
        }}
      >
        <p className="text-xs uppercase tracking-[0.35em] text-amber-200">SCORES Broadcast</p>
        <h3 className="mt-3 text-4xl font-black text-white">{label}</h3>
        <p className="mt-2 text-sm text-slate-200">Adjusting rotations, tactics, and momentum for the next stage.</p>
      </div>
    </div>
  );
}
