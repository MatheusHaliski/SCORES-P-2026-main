export function TeamColorBadge({ name, color, logo }: { name: string; color: string; logo: string }) {
  return (
    <div className="flex min-w-[140px] items-center gap-2 rounded-md px-2 py-1 text-xs font-bold text-white" style={{ backgroundColor: color }}>
      <span className="text-2xl leading-none">{logo}</span>
      <span>{name}</span>
    </div>
  );
}
