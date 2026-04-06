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
      className={`flex min-w-[110px] items-center gap-2 rounded-md px-2 py-1 text-xs font-black text-white ${isAway ? "justify-end" : "justify-start"}`}
      style={{ backgroundColor: color }}
    >
      {!isAway && <span aria-hidden>{logo}</span>}
      <span className="tracking-wide">{name}</span>
      {isAway && <span aria-hidden>{logo}</span>}
    </div>
  );
}
