"use client";

interface ManagerDismissalModalProps {
  clubName: string;
  reason: string;
  onContinue: () => void;
}

export function ManagerDismissalModal({ clubName, reason, onContinue }: ManagerDismissalModalProps) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-4">
      <div className="w-full max-w-xl rounded-2xl border border-rose-400/50 bg-slate-950 p-6">
        <h3 className="text-2xl font-black text-rose-300">Você foi demitido</h3>
        <p className="mt-3 text-sm text-slate-100">Fim da passagem no clube <strong>{clubName}</strong>.</p>
        <p className="mt-2 text-sm text-slate-300">Motivo: {reason}</p>
        <button onClick={onContinue} className="mt-5 rounded bg-rose-600 px-4 py-2 text-sm font-bold text-white">Continuar</button>
      </div>
    </div>
  );
}
