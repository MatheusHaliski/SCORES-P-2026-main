interface ManagerReputationStarsProps {
  label: string;
  stars: number;
}

const filledColor = (stars: number) => {
  if (stars < 6) return "bg-rose-500";
  if (stars < 8) return "bg-amber-400";
  return "bg-emerald-700";
};

export function ManagerReputationStars({ label, stars }: ManagerReputationStarsProps) {
  const safeStars = Math.max(0, Math.min(10, stars));

  return (
    <div className="space-y-1 rounded bg-slate-800 p-2 text-slate-100">
      <p className="text-[10px] uppercase tracking-[0.12em] text-slate-300">{label}</p>
      <div className="flex items-center gap-1">
        {Array.from({ length: 10 }, (_, index) => {
          const isFilled = index < safeStars;
          return (
            <span
              key={`${label}-${index}`}
              className={`inline-block h-3 w-3 rotate-45 rounded-[2px] ${isFilled ? filledColor(safeStars) : "bg-slate-600"}`}
              aria-hidden
            />
          );
        })}
      </div>
      <p className="text-[11px] text-slate-300">{safeStars}/10</p>
    </div>
  );
}
