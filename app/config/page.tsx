import { SectionCard } from "@/components/SectionCard";

const configFields = [
  { label: "Volume", value: "80%" },
  { label: "Idioma", value: "Português (BR)" },
  { label: "Velocidade da simulação", value: "Normal" },
  { label: "Dificuldade", value: "Pro Manager" },
  { label: "Preferência visual", value: "Cores do clube" },
  { label: "Resolução/base layout", value: "1920x1080" },
  { label: "Animações", value: "Ligado" },
];

export default function ConfigView() {
  return (
    <main className="mx-auto min-h-screen max-w-4xl p-6">
      <SectionCard title="ConfigView" subtitle="Estrutura pronta para persistência futura">
        <div className="grid gap-2 md:grid-cols-2">
          {configFields.map((field) => (
            <div key={field.label} className="rounded-lg border border-white/10 bg-slate-800/70 p-3">
              <p className="text-xs text-slate-400">{field.label}</p>
              <p className="text-sm font-semibold text-white">{field.value}</p>
            </div>
          ))}
        </div>
      </SectionCard>
    </main>
  );
}
