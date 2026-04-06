"use client";

import { ReactNode, useEffect, useState } from "react";
import { League, LeagueChampionHistory, Player, PlayerMorale, SquadHomePayload, Stadium, StandingRow, Team, TransferStatus } from "@/types/game";
import { SectionCard } from "@/components/SectionCard";
import { TeamIdentityHeader } from "@/components/TeamIdentityHeader";
import { MiniNextMatchCard } from "@/components/MiniNextMatchCard";
import { SpectatorModeBanner } from "@/components/SpectatorModeBanner";
import Link from "next/link";

type InboxMessage = {
  id: string;
  type: string;
  subject: string;
  body: string;
  round: number;
  createdAt: string;
  read: boolean;
};

type PendingAction = {
  id: string;
  dueRound: number;
  type: "buy_offer" | "salary_change" | "incoming_offer";
  payload: Record<string, string | number | boolean>;
};

type CareerState = {
  budget: number;
  ticketPrice: number;
  stadiumCapacity: number;
  stadiumLevel: number;
  loans: Array<{ amount: number; interest: number; roundsLeft: number }>;
  inventory: Record<string, number>;
  playerOverrides: Record<string, Partial<Player>>;
  inbox: InboxMessage[];
  financeLog: Array<{ id: string; type: string; amount: number; note: string; round: number }>;
  pendingActions: PendingAction[];
};

const STORAGE_PREFIX = "scores:career-state:";

const topActions = ["Calendário", "Classificações", "Campeões", "Comprar Jogador", "Salvar Jogo", "Sair", "Buscar", "Empréstimo", "Orçamento", "Estádio", "Email", "Consumíveis"] as const;

const moraleFactor: Record<PlayerMorale, number> = {
  "Muito Feliz": 1.06,
  "Feliz": 1.03,
  "Contente": 1,
  "Insatisfeito": 0.96,
  "Muito Insatisfeito": 0.9,
};

const nowIso = () => new Date().toISOString();

const playerEffectiveScore = (player: Player) => {
  const morale = player.morale ?? "Contente";
  const conditionFactor = Math.max(0.75, (player.physicalCondition ?? 80) / 100);
  const injuredPenalty = player.injuryStatus === "Lesionado" ? 0.5 : 1;
  const playstyleBonus = 1 + Math.min(0.08, player.playstyles.length * 0.015);
  return Math.round(player.overall * moraleFactor[morale] * conditionFactor * injuredPenalty * playstyleBonus);
};

function modalShell(title: string, onClose: () => void, content: ReactNode) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
      <div className="max-h-[90vh] w-full max-w-5xl overflow-auto rounded-2xl border border-white/20 bg-slate-900 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xl font-black text-white">{title}</h2>
          <button className="rounded bg-slate-700 px-3 py-1 text-xs text-white" onClick={onClose}>Fechar</button>
        </div>
        {content}
      </div>
    </div>
  );
}

export function SquadHomeClient({
  payload,
  teamsById,
  standings,
  champions,
  leagues,
  allTeams,
  allPlayers,
  stadium,
}: {
  payload: SquadHomePayload;
  teamsById: Record<string, Team>;
  standings: StandingRow[];
  champions: LeagueChampionHistory[];
  leagues: League[];
  allTeams: Team[];
  allPlayers: Player[];
  stadium: Stadium | null;
}) {
  const [openModal, setOpenModal] = useState<(typeof topActions)[number] | null>(null);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [state, setState] = useState<CareerState>(() => {
    const initial: CareerState = {
      budget: payload.save.budgetSnapshot,
      ticketPrice: 45,
      stadiumCapacity: stadium?.capacity ?? 19000,
      stadiumLevel: stadium?.level ?? 1,
      loans: [],
      inventory: {},
      playerOverrides: {},
      inbox: [],
      pendingActions: [],
      financeLog: [{ id: "init", type: "setup", amount: payload.save.budgetSnapshot, note: "Saldo inicial", round: payload.save.currentRound }],
    };

    if (typeof window === "undefined") return initial;
    const raw = window.localStorage.getItem(`${STORAGE_PREFIX}${payload.save.id}`);
    if (!raw) return initial;
    try {
      return JSON.parse(raw) as CareerState;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    window.localStorage.setItem(`${STORAGE_PREFIX}${payload.save.id}`, JSON.stringify(state));
  }, [payload.save.id, state]);

  const players = payload.players.map((p) => ({ ...p, ...state.playerOverrides[p.id] }));

  const processPending = () => {
    const due = state.pendingActions.filter((action) => action.dueRound <= payload.save.currentRound);
    if (!due.length) return;

    const next = { ...state, pendingActions: state.pendingActions.filter((action) => action.dueRound > payload.save.currentRound), inbox: [...state.inbox] };
    due.forEach((action) => {
      if (action.type === "buy_offer") {
        const accepted = Math.random() > 0.45;
        next.inbox.unshift({
          id: `${action.id}-mail`,
          type: "transfer",
          subject: accepted ? "Oferta aceita" : "Oferta recusada",
          body: accepted ? "O clube aceitou a oferta. Jogador transferido para seu clube." : "O clube rejeitou a proposta inicial e encerrou negociação.",
          round: payload.save.currentRound,
          createdAt: nowIso(),
          read: false,
        });
      }
      if (action.type === "incoming_offer") {
        next.inbox.unshift({
          id: `${action.id}-mail`,
          type: "incoming_offer",
          subject: "Proposta recebida por atleta listado",
          body: `Chegou proposta de $${Number(action.payload.offerValue).toLocaleString()} por ${action.payload.playerName}.`,
          round: payload.save.currentRound,
          createdAt: nowIso(),
          read: false,
        });
      }
      if (action.type === "salary_change") {
        next.inbox.unshift({
          id: `${action.id}-mail`,
          type: "salary",
          subject: "Resposta de ajuste salarial",
          body: String(action.payload.feedback),
          round: payload.save.currentRound,
          createdAt: nowIso(),
          read: false,
        });
      }
    });
    setState(next);
  };

  const unreadCount = state.inbox.filter((item) => !item.read).length;
  const listedPlayers = players.filter((p) => p.isTransferListed);
  const payroll = players.reduce((sum, p) => sum + (p.salary ?? 0), 0);

  const updateState = (updater: (prev: CareerState) => CareerState) => setState((prev) => (prev ? updater(prev) : prev));

  const addFinance = (type: string, amount: number, note: string) => {
    updateState((prev) => ({
      ...prev,
      financeLog: [{ id: `${type}-${Date.now()}`, type, amount, note, round: payload.save.currentRound }, ...prev.financeLog].slice(0, 40),
    }));
  };

  const selectedPlayer = players.find((p) => p.id === selectedPlayerId) ?? null;

  const onListPlayer = (player: Player) => {
    updateState((prev) => ({
      ...prev,
      playerOverrides: {
        ...prev.playerOverrides,
        [player.id]: { isTransferListed: true, transferStatus: "listed" as TransferStatus },
      },
      pendingActions: [
        ...prev.pendingActions,
        {
          id: `incoming-${player.id}-${Date.now()}`,
          dueRound: payload.save.currentRound + (Math.random() > 0.5 ? 1 : 2),
          type: "incoming_offer",
          payload: { playerId: player.id, playerName: player.name, offerValue: Math.round(player.marketValue * (0.85 + Math.random() * 0.35)) },
        },
      ],
    }));
  };

  const onSalaryChange = (player: Player, nextSalary: number) => {
    const morale: PlayerMorale = nextSalary > (player.salary ?? 0) ? "Muito Feliz" : "Insatisfeito";
    updateState((prev) => ({
      ...prev,
      pendingActions: [
        ...prev.pendingActions,
        {
          id: `salary-${player.id}-${Date.now()}`,
          dueRound: payload.save.currentRound + 1,
          type: "salary_change",
          payload: {
            feedback: nextSalary > (player.salary ?? 0)
              ? `${player.name} aceitou feliz o novo salário de $${nextSalary.toLocaleString()}.`
              : `${player.name} aceitou com ressalvas a redução salarial e ficou ${morale}.`,
          },
        },
      ],
      playerOverrides: {
        ...prev.playerOverrides,
        [player.id]: { salary: nextSalary, morale },
      },
    }));
  };

  const applyPlaystyle = (player: Player, style: string) => {
    if ((state.inventory[style] ?? 0) <= 0) return;
    updateState((prev) => ({
      ...prev,
      inventory: { ...prev.inventory, [style]: Math.max(0, (prev.inventory[style] ?? 0) - 1) },
      playerOverrides: {
        ...prev.playerOverrides,
        [player.id]: { playstyles: [...player.playstyles, style] },
      },
    }));
  };

  const buyConsumable = (item: "Quick Step" | "Anchor" | "kit médico", cost: number) => {
    if (state.budget < cost) return;
    updateState((prev) => ({ ...prev, budget: prev.budget - cost, inventory: { ...prev.inventory, [item]: (prev.inventory[item] ?? 0) + 1 } }));
    addFinance("consumable", -cost, `Compra de ${item}`);
  };

  return (
    <main className="min-h-screen p-6" style={{ backgroundImage: `${payload.visual.shapeCss}, ${payload.visual.gradientCss}` }}>
      <div className="mx-auto max-w-7xl space-y-4">
        <header className="flex flex-wrap gap-2 rounded-2xl border border-white/20 bg-slate-950/70 p-3">
          {topActions.map((action) => (
            <button key={action} onClick={() => setOpenModal(action)} className="rounded border border-white/20 bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-100 hover:bg-slate-700">
              {action} {action === "Email" && unreadCount > 0 && <span className="ml-1 rounded-full bg-red-500 px-1.5 py-0.5 text-[10px]">{unreadCount}</span>}
            </button>
          ))}
        </header>

        <div className="grid gap-4 lg:grid-cols-4">
          <div className="space-y-4 lg:col-span-1">
            <TeamIdentityHeader team={payload.team} managerName={payload.save.managerName} uniforms={payload.uniforms} boardReputation={payload.save.boardReputation} fansReputation={payload.save.fansReputation} />
            {payload.nextFixture ? <MiniNextMatchCard fixture={payload.nextFixture} homeTeam={teamsById[payload.nextFixture.homeTeamId]} awayTeam={teamsById[payload.nextFixture.awayTeamId]} /> : null}
            {payload.save.employmentStatus !== "employed" && <SpectatorModeBanner />}
            <div className="rounded-xl border border-emerald-400/50 bg-emerald-500/10 p-3 text-xs text-emerald-100">
              <p>Caixa: ${state.budget.toLocaleString()}</p>
              <p>Folha salarial: ${payroll.toLocaleString()}/rodada</p>
              <p>Atletas listados: {listedPlayers.length}</p>
            </div>
            {payload.nextFixture && <Link href={`/match-board?saveId=${payload.save.id}`} className="block rounded-xl bg-cyan-500 px-4 py-3 text-center font-bold text-slate-950">{payload.save.employmentStatus === "employed" ? "Iniciar Jogo" : "Acompanhar Rodada"}</Link>}
          </div>

          <SectionCard title="Elenco Principal" subtitle="Hub de gestão do save" className="lg:col-span-3">
            <div className="space-y-2">
              {players.map((player) => (
                <button key={player.id} onClick={() => setSelectedPlayerId(player.id)} className="grid w-full grid-cols-8 gap-2 rounded-xl border border-white/10 bg-slate-800/70 p-2 text-left text-xs text-slate-100 hover:border-cyan-300/60">
                  <p className="col-span-2 font-semibold">{player.name}</p>
                  <p>{player.position}</p>
                  <p>OVR {player.overall}</p>
                  <p>{player.age} anos</p>
                  <p>Cond {player.physicalCondition}%</p>
                  <p>${(player.marketValue / 1000000).toFixed(1)}M</p>
                  <p className="text-cyan-300">{player.playstyles[0]}</p>
                </button>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>

      {selectedPlayer && modalShell("Player Detail Modal", () => setSelectedPlayerId(null), (
        <div className="space-y-4 text-sm text-slate-100">
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="rounded border border-white/20 p-3">
              <p className="font-bold">{selectedPlayer.name} • {selectedPlayer.position}</p>
              <p>Overall: {selectedPlayer.overall} (impacto score: {playerEffectiveScore(selectedPlayer)})</p>
              <p>Idade: {selectedPlayer.age}</p>
              <p>Moral: {selectedPlayer.morale ?? "Contente"}</p>
              <p>Condição: {selectedPlayer.physicalCondition}%</p>
              <p>Lesão: {selectedPlayer.injuryStatus ?? "Disponível"}</p>
              <p>Salário: ${(selectedPlayer.salary ?? 0).toLocaleString()}</p>
              <p>Status de mercado: {selectedPlayer.transferStatus ?? "not_listed"}</p>
              <p>Playstyles: {selectedPlayer.playstyles.join(", ")}</p>
            </div>
            <div className="rounded border border-white/20 p-3">
              <p className="font-semibold text-cyan-300">Ações</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <button onClick={() => onListPlayer(selectedPlayer)} className="rounded bg-amber-500 px-2 py-1 text-xs font-bold text-slate-950">Listar no mercado</button>
                <button onClick={() => onSalaryChange(selectedPlayer, Math.round((selectedPlayer.salary ?? 100000) * 1.1))} className="rounded bg-emerald-500 px-2 py-1 text-xs font-bold text-slate-950">Aumentar salário</button>
                <button onClick={() => onSalaryChange(selectedPlayer, Math.round((selectedPlayer.salary ?? 100000) * 0.9))} className="rounded bg-rose-500 px-2 py-1 text-xs font-bold text-white">Diminuir salário</button>
                <button onClick={() => applyPlaystyle(selectedPlayer, "Quick Step")} className="rounded bg-cyan-500 px-2 py-1 text-xs font-bold text-slate-950">Inserir Quick Step</button>
              </div>
            </div>
          </div>

          <div className="rounded border border-white/20 p-3">
            <p className="mb-2 font-semibold">Atributos detalhados</p>
            <div className="grid gap-2 sm:grid-cols-3">
              {Object.entries(selectedPlayer.attributes ?? {}).map(([key, value]) => (
                <div key={key} className="rounded bg-slate-800 px-2 py-1 text-xs"><span className="text-slate-400">{key}</span>: <strong>{value}</strong></div>
              ))}
            </div>
          </div>
        </div>
      ))}

      {openModal === "Email" && modalShell("Email Center", () => {
        updateState((prev) => ({ ...prev, inbox: prev.inbox.map((mail) => ({ ...mail, read: true })) }));
        setOpenModal(null);
      }, (
        <div className="space-y-2 text-sm text-slate-100">
          <button onClick={processPending} className="rounded bg-cyan-500 px-3 py-1 text-xs font-bold text-slate-950">Processar mensagens pendentes da rodada</button>
          {state.inbox.length === 0 ? <p>Nenhuma mensagem.</p> : state.inbox.map((mail) => <div key={mail.id} className="rounded border border-white/15 p-2"><p className="font-bold">{mail.subject}</p><p>{mail.body}</p><p className="text-xs text-slate-400">Rodada {mail.round}</p></div>)}
        </div>
      ))}

      {openModal === "Consumíveis" && modalShell("Mercado de Consumíveis", () => setOpenModal(null), (
        <div className="space-y-3 text-sm text-slate-100">
          <p>Inventário do clube: {Object.entries(state.inventory).map(([k, v]) => `${k} (${v})`).join(", ") || "vazio"}</p>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => buyConsumable("Quick Step", 1200000)} className="rounded bg-cyan-500 px-3 py-1 font-bold text-slate-950">Comprar Quick Step ($1.2M)</button>
            <button onClick={() => buyConsumable("Anchor", 1000000)} className="rounded bg-cyan-500 px-3 py-1 font-bold text-slate-950">Comprar Anchor ($1.0M)</button>
            <button onClick={() => buyConsumable("kit médico", 750000)} className="rounded bg-emerald-500 px-3 py-1 font-bold text-slate-950">Comprar kit médico ($0.75M)</button>
          </div>
        </div>
      ))}

      {openModal === "Orçamento" && modalShell("Budget Modal", () => setOpenModal(null), (
        <div className="space-y-2 text-sm text-slate-100">
          <p>Caixa atual: ${state.budget.toLocaleString()}</p>
          <p>Folha salarial total: ${payroll.toLocaleString()}/rodada</p>
          <p>Dívida/Empréstimos: ${state.loans.reduce((s, l) => s + l.amount, 0).toLocaleString()}</p>
          {state.financeLog.map((entry) => <p key={entry.id} className="rounded bg-slate-800 px-2 py-1">[{entry.type}] {entry.note}: {entry.amount > 0 ? "+" : ""}{entry.amount.toLocaleString()}</p>)}
        </div>
      ))}

      {openModal === "Empréstimo" && modalShell("Loan Modal", () => setOpenModal(null), (
        <div className="space-y-2 text-sm text-slate-100">
          <p>Taxa padrão: 8% em 8 rodadas.</p>
          <button
            onClick={() => {
              const amount = 5000000;
              updateState((prev) => ({ ...prev, budget: prev.budget + amount, loans: [...prev.loans, { amount, interest: 0.08, roundsLeft: 8 }] }));
              addFinance("loan", amount, "Empréstimo bancário contratado");
            }}
            className="rounded bg-amber-500 px-3 py-1 font-bold text-slate-950"
          >
            Contratar $5.000.000
          </button>
        </div>
      ))}

      {openModal === "Estádio" && modalShell("Stadium Modal", () => setOpenModal(null), (
        <div className="space-y-2 text-sm text-slate-100">
          <p>Estádio: {stadium?.name ?? `${payload.team.shortName} Arena`}</p>
          <p>Capacidade: {state.stadiumCapacity.toLocaleString()}</p>
          <p>Preço ingresso: ${state.ticketPrice}</p>
          <div className="flex gap-2">
            <button onClick={() => updateState((prev) => ({ ...prev, ticketPrice: Math.max(10, prev.ticketPrice - 5) }))} className="rounded bg-slate-700 px-2 py-1">-5</button>
            <button onClick={() => updateState((prev) => ({ ...prev, ticketPrice: prev.ticketPrice + 5 }))} className="rounded bg-slate-700 px-2 py-1">+5</button>
            <button onClick={() => {
              const cost = 3500000;
              if (state.budget < cost) return;
              updateState((prev) => ({ ...prev, budget: prev.budget - cost, stadiumCapacity: prev.stadiumCapacity + 1500, stadiumLevel: prev.stadiumLevel + 1 }));
              addFinance("stadium", -cost, "Ampliação do estádio");
            }} className="rounded bg-cyan-500 px-2 py-1 font-bold text-slate-950">Ampliar (+1500)</button>
          </div>
        </div>
      ))}

      {openModal === "Comprar Jogador" && modalShell("Transfer Market Modal", () => setOpenModal(null), (
        <div className="space-y-2 text-sm text-slate-100">
          {allPlayers.filter((p) => p.teamId !== payload.team.id).slice(0, 30).map((p) => (
            <div key={p.id} className="flex items-center justify-between rounded border border-white/10 p-2">
              <p>{p.name} • {p.position} • OVR {p.overall} • {teamsById[p.teamId]?.shortName}</p>
              <button
                onClick={() => {
                  if (state.budget < p.marketValue) return;
                  updateState((prev) => ({
                    ...prev,
                    pendingActions: [...prev.pendingActions, { id: `buy-${p.id}-${Date.now()}`, dueRound: payload.save.currentRound + (Math.random() > 0.5 ? 1 : 2), type: "buy_offer", payload: { playerId: p.id } }],
                  }));
                }}
                className="rounded bg-emerald-500 px-2 py-1 text-xs font-bold text-slate-950"
              >Fazer oferta</button>
            </div>
          ))}
        </div>
      ))}

      {openModal === "Buscar" && modalShell("Global Search Modal", () => setOpenModal(null), (
        <div className="grid gap-3 text-sm text-slate-100 md:grid-cols-2">
          <div className="rounded border border-white/20 p-2">
            <p className="font-semibold">Ligas</p>
            {leagues.map((league) => <p key={league.id}>{league.name} ({league.country})</p>)}
          </div>
          <div className="rounded border border-white/20 p-2">
            <p className="font-semibold">Clubes</p>
            {allTeams.slice(0, 20).map((team) => <p key={team.id}>{team.name} • orçamento ${team.budget.toLocaleString()} • overall {team.overall}</p>)}
          </div>
        </div>
      ))}

      {openModal === "Campeões" && modalShell("Champions History Modal", () => setOpenModal(null), (
        <div className="space-y-2 text-sm text-slate-100">
          {champions.map((ch) => <p key={ch.id}>Temporada {ch.season}: {teamsById[ch.championTeamId]?.name ?? ch.championTeamId}</p>)}
        </div>
      ))}

      {openModal === "Classificações" && modalShell("Classificações", () => setOpenModal(null), (
        <div className="space-y-1 text-sm text-slate-100">{standings.map((row) => <p key={row.teamId}>#{row.position} {teamsById[row.teamId]?.name} • {row.wins}-{row.losses}</p>)}</div>
      ))}

      {openModal === "Calendário" && modalShell("Calendário", () => setOpenModal(null), (
        <div className="space-y-1 text-sm text-slate-100">{(payload.seasonCalendar?.entries ?? []).map((entry) => <p key={entry.fixtureId}>R{entry.round} • {teamsById[entry.homeTeamId]?.shortName} vs {teamsById[entry.awayTeamId]?.shortName}</p>)}</div>
      ))}

      {openModal === "Salvar Jogo" && modalShell("Salvar Jogo", () => setOpenModal(null), (
        <div className="space-y-2 text-sm text-slate-100">
          <p>Estado atual persistido localmente para este save.</p>
          <button onClick={() => window.localStorage.setItem(`${STORAGE_PREFIX}${payload.save.id}`, JSON.stringify(state))} className="rounded bg-emerald-500 px-3 py-1 font-bold text-slate-950">Salvar agora</button>
        </div>
      ))}

      {openModal === "Sair" && modalShell("Sair", () => setOpenModal(null), (
        <div className="space-y-2 text-sm text-slate-100"><p>Deseja sair para o menu principal?</p><Link className="inline-block rounded bg-rose-500 px-3 py-1 font-bold text-white" href="/home">Confirmar saída</Link></div>
      ))}
    </main>
  );
}
