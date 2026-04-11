import { CSSProperties, ReactNode } from "react";

interface SectionCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export function SectionCard({ title, subtitle, children, className = "", style }: SectionCardProps) {
  return (
    <section className={`premium-surface sa-premium-metallic-panel p-4 shadow-xl ${className}`} style={style}>
      <header className="mb-3 border-b border-white/10 pb-3">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        {subtitle ? <p className="text-xs text-slate-300">{subtitle}</p> : null}
      </header>
      {children}
    </section>
  );
}
