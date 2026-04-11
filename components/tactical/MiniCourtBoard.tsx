import { formationLayouts, resolveUniformUrl, TacticalPreset } from "@/types/tactical";
import { LineupPlayer } from "@/types/matchSession";
import { ClubUniformAssets } from "@/types/tactical";
import { PlayerPhotoNode } from "@/components/tactical/PlayerPhotoNode";
import { getMatchPanelStyle } from "@/styles/metallicTheme";

function styleToOverlayTone(style: TacticalPreset["style"]) {
  if (style === "offensive_press") return "from-rose-500/35 via-orange-400/20 to-transparent";
  if (style === "defensive_block") return "from-sky-500/20 via-cyan-500/20 to-transparent";
  if (style === "counter_attack") return "from-amber-400/30 via-emerald-500/20 to-transparent";
  if (style === "possession_control") return "from-cyan-400/35 via-blue-500/20 to-transparent";
  if (style === "fast_transition") return "from-fuchsia-500/30 via-violet-400/20 to-transparent";
  if (style === "wing_play") return "from-indigo-500/25 via-cyan-300/18 to-transparent";
  return "from-emerald-500/20 via-cyan-500/20 to-transparent";
}

export function MiniCourtBoard({ lineup, tactic, uniforms }: { lineup: LineupPlayer[]; tactic: TacticalPreset; uniforms: ClubUniformAssets }) {
  const layout = formationLayouts[tactic.formation];
  const uniformUrl = resolveUniformUrl(uniforms);
  const players = Array.from({ length: Math.max(11, lineup.length) }).map((_, idx) => lineup[idx] ?? {
    playerId: `placeholder-${idx}`,
    playerName: `Slot ${idx + 1}`,
    position: "--",
    overall: 0,
    stamina: 0,
    attributes: lineup[0]?.attributes ?? ({} as LineupPlayer["attributes"]),
    macroRatings: lineup[0]?.macroRatings ?? ({} as LineupPlayer["macroRatings"]),
    morale: "Contente" as const,
    injuryStatus: "Disponível" as const,
    playstyles: [],
    isStarter: true,
  });

  return (
    <div className="premium-surface sa-metallic-sheen p-3" style={getMatchPanelStyle()}>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-200">Live Tactical Board</p>
        <p className="text-[11px] text-slate-300">{tactic.formation} • {tactic.style.replaceAll("_", " ")}</p>
      </div>
      <div className="tactical-court relative h-[420px] overflow-hidden rounded-2xl border border-cyan-300/35 bg-slate-950/75">
        <div className={`pointer-events-none absolute inset-0 bg-gradient-to-t ${styleToOverlayTone(tactic.style)} animate-overlay-flow`} />
        <div className="pointer-events-none absolute inset-x-[10%] top-[13%] h-[33%] rounded-full border border-cyan-300/20 animate-pulse opacity-70" />
        <div className="pointer-events-none absolute left-[20%] top-[48%] h-1 w-[58%] bg-gradient-to-r from-transparent via-cyan-300/90 to-transparent animate-lane-blink" />
        <div className="pointer-events-none absolute left-[8%] top-[25%] h-[2px] w-[30%] rotate-[16deg] bg-gradient-to-r from-transparent via-emerald-300 to-transparent" />
        <div className="pointer-events-none absolute right-[10%] top-[30%] h-[2px] w-[30%] -rotate-[16deg] bg-gradient-to-r from-transparent via-emerald-300 to-transparent" />
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20" />
        <div className="pointer-events-none absolute inset-x-[8%] bottom-[8%] top-[8%] rounded-2xl border border-white/15" />

        {layout.map((slot, idx) => (
          <PlayerPhotoNode key={`${players[idx].playerId}-${slot.role}`} player={players[idx]} x={slot.x} y={slot.y} role={slot.role} uniformUrl={uniformUrl} active={idx < 3} />
        ))}

        <div className="pointer-events-none absolute bottom-3 right-3 rounded-lg border border-cyan-300/35 bg-slate-900/85 px-2 py-1 text-[10px] text-cyan-100">
          Compactness {tactic.width} • Line {tactic.defensiveLine}
        </div>
      </div>
    </div>
  );
}
