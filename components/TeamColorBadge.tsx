export function TeamColorBadge({
  name,
  color,
  logo,
  side = "home",
}: {
  name: string;
  color: string;
  logo: string;
  side?: "home" | "away";
}) {
  const isAway = side === "away";

  return (
    <div
      className={`flex w-full items-center gap-2 rounded-lg border border-white/20 px-3 py-2 text-xs font-black text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] ${
        isAway ? "justify-end" : "justify-start"
      }`}
      style={{ backgroundColor: color }}
    >
      {!isAway && <span aria-hidden className="text-base leading-none">{logo}</span>}
      <span className="truncate tracking-[0.12em]">{name}</span>
      {isAway && <span aria-hidden className="text-base leading-none">{logo}</span>}
    </div>
  );
}
