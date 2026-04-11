"use client";

import { useMemo, useState } from "react";
import { mockLeagues, mockTeams, enrichedMockPlayers } from "@/mocks/gameData";

type GlobalDb = {
  version: string;
  leagues: typeof mockLeagues;
  teams: typeof mockTeams;
  players: typeof enrichedMockPlayers;
};

const GLOBAL_DB_KEY = "scores:global-db:v1";

function readDb(): GlobalDb {
  if (typeof window === "undefined") {
    return { version: new Date().toISOString(), leagues: mockLeagues, teams: mockTeams, players: enrichedMockPlayers };
  }
  const raw = window.localStorage.getItem(GLOBAL_DB_KEY);
  if (!raw) return { version: new Date().toISOString(), leagues: mockLeagues, teams: mockTeams, players: enrichedMockPlayers };
  try {
    return JSON.parse(raw) as GlobalDb;
  } catch {
    return { version: new Date().toISOString(), leagues: mockLeagues, teams: mockTeams, players: enrichedMockPlayers };
  }
}

export default function DatabaseEditorPage() {
  const [db, setDb] = useState<GlobalDb>(() => readDb());
  const totals = useMemo(() => ({ leagues: db.leagues.length, teams: db.teams.length, players: db.players.length }), [db]);

  const save = () => {
    const next = { ...db, version: new Date().toISOString() };
    setDb(next);
    window.localStorage.setItem(GLOBAL_DB_KEY, JSON.stringify(next));
    alert("Base global salva. Novos saves usarão essa base; saves existentes mantêm o snapshot já carregado.");
  };

  return (
    <main className="mx-auto min-h-screen max-w-5xl p-6 text-white">
      <h1 className="text-3xl font-black">Editar Clubes / Ligas / Jogadores</h1>
      <p className="mt-2 text-sm text-slate-300">Este editor é global. Alterações aqui passam a valer para novos saves criados após {new Date(db.version).toLocaleString()}.</p>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <div className="rounded-xl border border-white/20 bg-slate-900/70 p-4"><p className="text-xs text-slate-300">Ligas</p><p className="text-3xl font-black">{totals.leagues}</p></div>
        <div className="rounded-xl border border-white/20 bg-slate-900/70 p-4"><p className="text-xs text-slate-300">Clubes</p><p className="text-3xl font-black">{totals.teams}</p></div>
        <div className="rounded-xl border border-white/20 bg-slate-900/70 p-4"><p className="text-xs text-slate-300">Jogadores</p><p className="text-3xl font-black">{totals.players}</p></div>
      </div>

      <div className="mt-6 rounded-2xl border border-white/15 bg-slate-950/70 p-4">
        <p className="text-xs uppercase tracking-[.2em] text-cyan-200">Configuração rápida</p>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <label className="rounded-lg border border-white/15 bg-slate-900/60 p-3 text-sm">Nome da primeira liga
            <input className="mt-2 w-full rounded border border-white/20 bg-slate-800 px-2 py-1" value={db.leagues[0]?.name ?? ""} onChange={(e) => setDb((prev) => ({ ...prev, leagues: prev.leagues.map((l, i) => i === 0 ? { ...l, name: e.target.value } : l) }))} />
          </label>
          <label className="rounded-lg border border-white/15 bg-slate-900/60 p-3 text-sm">Nome do primeiro clube
            <input className="mt-2 w-full rounded border border-white/20 bg-slate-800 px-2 py-1" value={db.teams[0]?.name ?? ""} onChange={(e) => setDb((prev) => ({ ...prev, teams: prev.teams.map((t, i) => i === 0 ? { ...t, name: e.target.value } : t) }))} />
          </label>
        </div>
      </div>

      <button onClick={save} className="mt-6 rounded-lg border border-emerald-300/50 bg-emerald-500/20 px-4 py-2 text-sm font-bold">Salvar base global</button>
    </main>
  );
}
