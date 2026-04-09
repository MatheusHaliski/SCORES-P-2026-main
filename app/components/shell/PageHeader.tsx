interface PageHeaderProps {
  title: string;
  subtitle: string;
}

export default function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
      <div className="sa-surface-header mt-0 w-full rounded-2xl border px-4 py-3 shadow-lg transition duration-300 hover:brightness-110">
          <h2 className="text-2xl font-semibold text-white">{title}</h2>
          <p className="text-sm text-white/70">{subtitle}</p>
      </div>
  );
}
