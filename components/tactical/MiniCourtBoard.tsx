import { formationLayouts, resolveUniformUrl, TacticalPreset } from "@/types/tactical";
import { LineupPlayer } from "@/types/matchSession";
import { ClubUniformAssets } from "@/types/tactical";
import { PlayerPhotoNode } from "@/components/tactical/PlayerPhotoNode";
import { getMatchPanelStyle } from "@/styles/metallicTheme";

function styleToOverlayTone(style: TacticalPreset["style"]) {
  if (style === "pick_roll_heavy") return "from-rose-500/35 via-orange-400/20 to-transparent";
  if (style === "post_centric") return "from-sky-500/20 via-cyan-500/20 to-transparent";
  if (style === "motion_offense") return "from-amber-400/30 via-emerald-500/20 to-transparent";
  if (style === "five_out") return "from-cyan-400/35 via-blue-500/20 to-transparent";
  if (style === "isolation_heavy") return "from-fuchsia-500/30 via-violet-400/20 to-transparent";
  if (style === "perimeter_creation") return "from-indigo-500/25 via-cyan-300/18 to-transparent";
  return "from-emerald-500/20 via-cyan-500/20 to-transparent";
}

export function MiniCourtBoard({ lineup, tactic, uniforms }: { lineup: LineupPlayer[]; tactic: TacticalPreset; uniforms: ClubUniformAssets }) {
  const layout = formationLayouts[tactic.formation];
  const uniformUrl = resolveUniformUrl(uniforms);
  const players = Array.from({ length: 5 }).map((_, idx) => lineup[idx] ?? {
    playerId: `placeholder-${idx}`,
    playerName: `Slot ${idx + 1}`,
    position: layout[idx]?.role ?? "--",
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
        <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-200">Basketball Tactical Board</p>
        <p className="text-[11px] text-slate-300">{tactic.style.replaceAll("_", " ")} • {tactic.defensiveScheme.replaceAll("_", " ")}</p>
      </div>
      <div className="tactical-court relative h-[420px] overflow-hidden rounded-2xl border border-cyan-300/35 bg-slate-950/75">
        <div className={`pointer-events-none absolute inset-0 bg-gradient-to-t ${styleToOverlayTone(tactic.style)} animate-overlay-flow`} />
        <div className="pointer-events-none absolute inset-x-[8%] bottom-[8%] top-[8%] rounded-2xl border border-white/15" />
        <div className="pointer-events-none absolute left-1/2 top-[78%] h-[72px] w-[160px] -translate-x-1/2 rounded-t-[999px] border border-white/20 border-b-0" />
        <div className="pointer-events-none absolute left-1/2 top-[16%] h-[140px] w-[220px] -translate-x-1/2 rounded-b-[999px] border border-cyan-200/20 border-t-0" />
        <div className="pointer-events-none absolute left-1/2 top-[42%] h-[2px] w-[80%] -translate-x-1/2 bg-white/20" />

        {layout.map((slot, idx) => (
          <PlayerPhotoNode key={`${players[idx].playerId}-${slot.role}`} player={players[idx]} x={slot.x} y={slot.y} role={slot.role} uniformUrl={uniformUrl} active={idx < 2} />
        ))}
      </div>
    </div>
  );
}
