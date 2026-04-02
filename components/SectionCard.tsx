import { ReactNode } from "react";

interface SectionCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}

export function SectionCard({ title, subtitle, children, className = "" }: SectionCardProps) {
  return (
    <section className={`rounded-2xl border border-white/15 bg-slate-900/70 p-4 shadow-xl ${className}`}>
      <header className="mb-3 border-b border-white/10 pb-3">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        {subtitle ? <p className="text-xs text-slate-300">{subtitle}</p> : null}
      </header>
      {children}
    </section>
  );
}
