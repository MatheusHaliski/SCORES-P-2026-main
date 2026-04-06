import Link from "next/link";

interface PrimaryMenuButtonProps {
  href: string;
  title: string;
  description: string;
}

export function PrimaryMenuButton({ href, title, description }: PrimaryMenuButtonProps) {
  return (
    <Link
      href={href}
      className="group block w-full rounded-2xl border border-slate-300/30 bg-slate-900/70 px-6 py-5 text-left transition hover:-translate-y-1 hover:border-cyan-300/60 hover:bg-slate-800"
    >
      <p className="text-xl font-bold text-white">{title}</p>
      <p className="mt-2 text-sm text-slate-200">{description}</p>
      <p className="mt-4 text-xs uppercase tracking-[0.2em] text-cyan-300 group-hover:text-cyan-200">Entrar</p>
    </Link>
  );
}
