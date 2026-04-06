"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
import { League, LeagueChampionHistory, Player, PlayerMorale, SquadHomePayload, Stadium, StandingRow, Team, TransferStatus } from "@/types/game";
import { SectionCard } from "@/components/SectionCard";
import { TeamIdentityHeader } from "@/components/TeamIdentityHeader";
import { MiniNextMatchCard } from "@/components/MiniNextMatchCard";
import { SpectatorModeBanner } from "@/components/SpectatorModeBanner";
import Link from "next/link";
import Image from "next/image";
import { PlayerMoraleService } from "@/services/PlayerMoraleService";
import { PlayerInjuryService } from "@/services/PlayerInjuryService";
import { PlaystyleInventoryService } from "@/services/PlaystyleInventoryService";
import { TransferMarketService } from "@/services/TransferMarketService";
import { GlobalSearchService } from "@/services/GlobalSearchService";
import { FinanceService } from "@/services/FinanceService";
import { StadiumRevenueService } from "@/services/StadiumRevenueService";
import { ClubVisualService } from "@/services/ClubVisualService";

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
  signedPlayers: Player[];
  inbox: InboxMessage[];
  financeLog: Array<{ id: string; type: string; amount: number; note: string; round: number }>;
  pendingActions: PendingAction[];
  teamColors: {
    primaryColor: string;
    secondaryColor: string;
  };
};

const STORAGE_PREFIX = "scores:career-state:";

const topActions = ["Calendário", "Classificações", "Campeões", "Comprar Jogador", "Salvar Jogo", "Sair", "Buscar", "Empréstimo", "Orçamento", "Estádio", "Email", "Consumíveis", "Identidade do Clube"] as const;
const moraleService = new PlayerMoraleService();
const injuryService = new PlayerInjuryService();
const playstyleInventoryService = new PlaystyleInventoryService();
const transferService = new TransferMarketService();
const globalSearchService = new GlobalSearchService();
const financeService = new FinanceService();
const stadiumRevenueService = new StadiumRevenueService();
const clubVisualService = new ClubVisualService();

const nowIso = () => new Date().toISOString();

const playstyleImpactMap: Record<string, number> = {
  "Quick Step": 1.03,
  Anchor: 1.03,
  "Sharp Shooter": 1.04,
  "Lockdown Defender": 1.04,
};

const playerEffectiveScore = (player: Player) => {
  const moraleFactor = moraleService.getModifier(player.morale);
  const conditionFactor = Math.max(0.75, (player.physicalCondition ?? 80) / 100);
  const injuredPenalty = player.injuryStatus === "Lesionado" ? 0.45 : 1;
  const playstyleFactor = player.playstyles.reduce((acc, style) => acc * (playstyleImpactMap[style] ?? 1.012), 1);
  return Math.round(player.overall * moraleFactor * conditionFactor * injuredPenalty * playstyleFactor);
};

function modalShell(title: string, onClose: () => void, content: ReactNode) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
      <div className="max-h-[92vh] w-full max-w-6xl overflow-auto rounded-2xl border border-white/20 bg-slate-900 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xl font-black text-white">{title}</h2>
          <button className="rounded bg-slate-700 px-3 py-1 text-xs text-white" onClick={onClose}>Fechar</button>
        </div>
        {content}
      </div>
    </div>
  );
}

const PlayerFace = ({ player }: { player: Player }) => (
  <div className="relative h-24 w-24 overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-br from-cyan-500/30 to-indigo-600/30">
    <div className="absolute inset-0 flex items-center justify-center text-3xl font-black text-white">{player.name.slice(0, 1)}</div>
    <div className="absolute inset-x-0 bottom-0 h-8 bg-slate-950/60" />
  </div>
);

const OverallBadge = ({ value, impact }: { value: number; impact: number }) => (
  <div className="rounded-2xl border border-cyan-300/60 bg-slate-800 p-4 text-center shadow-[0_0_40px_rgba(34,211,238,0.25)]">
    <p className="text-[11px] uppercase tracking-widest text-cyan-300">Overall</p>
    <p className="text-5xl font-black text-white">{value}</p>
    <p className="text-xs text-slate-300">Impact Score: <span className="font-bold text-cyan-200">{impact}</span></p>
  </div>
);

const AttributeSectionGauge = ({ label, value }: { label: string; value: number }) => {
  const degrees = Math.min(180, Math.max(10, Math.round((value / 99) * 180)));
  return (
    <div className="rounded-xl border border-white/10 bg-slate-800/80 p-3">
      <div className="mb-2 flex items-center justify-between text-xs">
        <span className="font-semibold text-white">{label}</span>
        <span className="font-black text-cyan-300">{value}</span>
      </div>
      <div className="relative h-12">
        <div className="absolute inset-x-0 bottom-0 h-10 rounded-t-full border border-white/10" />
        <div className="absolute left-1/2 bottom-1 h-8 w-[2px] origin-bottom bg-cyan-300" style={{ transform: `translateX(-50%) rotate(${degrees - 90}deg)` }} />
      </div>
    </div>
  );
};

const AttributeVerticalBars = ({ values }: { values: Array<{ name: string; value: number }> }) => (
  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
    {values.map((item) => (
      <div key={item.name} className="rounded-lg border border-white/10 bg-slate-900/80 p-2 text-center">
        <div className="mx-auto mb-1 flex h-24 w-6 items-end rounded bg-slate-700">
          <div className="w-full rounded bg-gradient-to-t from-cyan-500 to-emerald-300" style={{ height: `${Math.max(8, Math.min(100, item.value))}%` }} />
        </div>
        <p className="text-[10px] text-slate-300">{item.name}</p>
        <p className="text-xs font-bold text-white">{item.value}</p>
      </div>
    ))}
  </div>
);

const LogoMark = ({ logo, label, size = 24 }: { logo: string; label: string; size?: number }) => {
  const isImage = logo.startsWith("/") || logo.startsWith("http") || logo.startsWith("data:");
  if (isImage) return <Image src={logo} alt={label} width={size} height={size} className="rounded" />;
  return <span className="inline-flex items-center justify-center rounded bg-slate-800 px-2 py-1 text-lg">{logo}</span>;
};

export function SquadHomeClient({
  payload,
  teamsById,
  standings,
  champions,
  leagues,
  allTeams,
  allPlayers,
  stadium,
  stadiumsByTeamId,
}: {
  payload: SquadHomePayload;
  teamsById: Record<string, Team>;
  standings: StandingRow[];
  champions: LeagueChampionHistory[];
  leagues: League[];
  allTeams: Team[];
  allPlayers: Player[];
  stadium: Stadium | null;
  stadiumsByTeamId: Record<string, Stadium | null>;
}) {
  const [openModal, setOpenModal] = useState<(typeof topActions)[number] | null>(null);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [playstyleTargetPlayerId, setPlaystyleTargetPlayerId] = useState<string | null>(null);
  const [searchTab, setSearchTab] = useState<"Ligas" | "Clubes" | "Jogadores">("Ligas");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLeagueId, setSelectedLeagueId] = useState<string | null>(null);
  const [selectedClubId, setSelectedClubId] = useState<string | null>(null);
  const [selectedGlobalPlayerId, setSelectedGlobalPlayerId] = useState<string | null>(null);
  const [colorDraft, setColorDraft] = useState({ primaryColor: payload.team.primaryColor, secondaryColor: payload.team.secondaryColor });
  const [playerFilters, setPlayerFilters] = useState<{ position: string; minOverall: number; listedOnly: boolean }>({
    position: "",
    minOverall: 70,
    listedOnly: false,
  });

  const [state, setState] = useState<CareerState>(() => {
    const initial: CareerState = {
      budget: payload.save.budgetSnapshot,
      ticketPrice: 45,
      stadiumCapacity: stadium?.capacity ?? 19000,
      stadiumLevel: stadium?.level ?? 1,
      loans: [],
      inventory: {},
      playerOverrides: {},
      signedPlayers: [],
      inbox: [],
      pendingActions: [],
      teamColors: {
        primaryColor: payload.team.primaryColor,
        secondaryColor: payload.team.secondaryColor,
      },
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

  const mergedPlayers = useMemo(() => {
    const base = [...payload.players, ...state.signedPlayers.filter((player) => !payload.players.find((p) => p.id === player.id))];
    return base.map((player) => ({ ...player, ...state.playerOverrides[player.id] }));
  }, [payload.players, state.playerOverrides, state.signedPlayers]);

  const processPending = () => {
    const due = state.pendingActions.filter((action) => action.dueRound <= payload.save.currentRound);
    if (!due.length) return;

    const next = {
      ...state,
      pendingActions: state.pendingActions.filter((action) => action.dueRound > payload.save.currentRound),
      inbox: [...state.inbox],
      playerOverrides: { ...state.playerOverrides },
      signedPlayers: [...state.signedPlayers],
      budget: state.budget,
    };

    due.forEach((action) => {
      if (action.type === "buy_offer") {
        const playerId = String(action.payload.playerId);
        const offerValue = Number(action.payload.offerValue);
        const player = allPlayers.find((entry) => entry.id === playerId);
        if (!player) return;

        const outcome = transferService.getOfferAcceptanceScore({
          player,
          offerValue,
          isTransferListed: !!player.isTransferListed,
          sellerBudget: teamsById[player.teamId]?.budget ?? 30000000,
        });

        if (outcome.accepted && financeService.canAfford(next.budget, offerValue)) {
          next.budget = financeService.applyExpense(next.budget, offerValue);
          next.signedPlayers.push({ ...player, teamId: payload.team.id, transferStatus: "not_listed", isTransferListed: false });
          next.inbox.unshift({
            id: `${action.id}-mail`,
            type: "transfer",
            subject: "Oferta aceita",
            body: `${player.name} aceitou o projeto e chega por $${offerValue.toLocaleString()}.`,
            round: payload.save.currentRound,
            createdAt: nowIso(),
            read: false,
          });
          next.financeLog.unshift({ id: `buy-${Date.now()}`, type: "transfer", amount: -offerValue, note: `Compra de ${player.name}`, round: payload.save.currentRound });
        } else if (outcome.counter) {
          next.inbox.unshift({
            id: `${action.id}-mail`,
            type: "transfer_counter",
            subject: "Contraproposta do clube",
            body: `O clube quer $${outcome.requestedValue.toLocaleString()} por ${player.name}.`,
            round: payload.save.currentRound,
            createdAt: nowIso(),
            read: false,
          });
        } else {
          next.inbox.unshift({
            id: `${action.id}-mail`,
            type: "transfer_refused",
            subject: "Oferta recusada",
            body: `A proposta por ${player.name} foi recusada por valor baixo/importância no elenco.`,
            round: payload.save.currentRound,
            createdAt: nowIso(),
            read: false,
          });
        }
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
  const listedPlayers = mergedPlayers.filter((player) => player.isTransferListed);
  const payroll = mergedPlayers.reduce((sum, player) => sum + (player.salary ?? 0), 0);

  const updateState = (updater: (prev: CareerState) => CareerState) => setState((prev) => (prev ? updater(prev) : prev));

  const addFinance = (type: string, amount: number, note: string) => {
    updateState((prev) => ({
      ...prev,
      financeLog: [{ id: `${type}-${Date.now()}`, type, amount, note, round: payload.save.currentRound }, ...prev.financeLog].slice(0, 40),
    }));
  };

  const selectedPlayer = mergedPlayers.find((player) => player.id === selectedPlayerId) ?? null;

  const onListPlayer = (player: Player) => {
    updateState((prev) => ({
      ...prev,
      playerOverrides: {
        ...prev.playerOverrides,
        [player.id]: {
          isTransferListed: true,
          transferStatus: "listed" as TransferStatus,
          morale: moraleService.nextMorale({ current: player.morale, transferListed: true }),
        },
      },
      pendingActions: [
        ...prev.pendingActions,
        {
          id: `incoming-${player.id}-${Date.now()}`,
          dueRound: payload.save.currentRound + (Math.random() > 0.55 ? 1 : 2),
          type: "incoming_offer",
          payload: { playerId: player.id, playerName: player.name, offerValue: Math.round(player.marketValue * (0.9 + Math.random() * 0.35)) },
        },
      ],
    }));
  };

  const onUnlistPlayer = (player: Player) => {
    updateState((prev) => ({
      ...prev,
      playerOverrides: {
        ...prev.playerOverrides,
        [player.id]: { isTransferListed: false, transferStatus: "not_listed" as TransferStatus },
      },
      pendingActions: prev.pendingActions.filter((action) => !(action.type === "incoming_offer" && String(action.payload.playerId) === player.id)),
    }));
  };

  const onSalaryChange = (player: Player, nextSalary: number) => {
    const salaryDelta = (nextSalary - (player.salary ?? 0)) / Math.max(1, player.salary ?? 1);
    const morale: PlayerMorale = moraleService.nextMorale({ current: player.morale, salaryChangePct: salaryDelta });
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
      inventory: playstyleInventoryService.consume(prev.inventory, style),
      playerOverrides: {
        ...prev.playerOverrides,
        [player.id]: { playstyles: [...new Set([...(player.playstyles ?? []), style])] },
      },
      inbox: [{
        id: `playstyle-${player.id}-${Date.now()}`,
        type: "playstyle",
        subject: "Playstyle aplicado",
        body: `${style} foi aplicado em ${player.name} e consumido do inventário.`,
        round: payload.save.currentRound,
        createdAt: nowIso(),
        read: false,
      }, ...prev.inbox],
    }));
    setPlaystyleTargetPlayerId(null);
  };

  const buyConsumable = (item: "Quick Step" | "Anchor" | "Sharp Shooter" | "Lockdown Defender" | "kit médico", cost: number) => {
    if (!financeService.canAfford(state.budget, cost)) return;
    updateState((prev) => ({
      ...prev,
      budget: financeService.applyExpense(prev.budget, cost),
      inventory: { ...prev.inventory, [item]: (prev.inventory[item] ?? 0) + 1 },
    }));
    addFinance("consumable", -cost, `Compra de ${item}`);
  };

  const saveTeamColors = async () => {
    const nextColors = {
      primaryColor: colorDraft.primaryColor,
      secondaryColor: colorDraft.secondaryColor,
    };

    updateState((prev) => ({ ...prev, teamColors: nextColors }));
    try {
      await fetch("/api/team/colors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamId: payload.team.id,
          primaryColor: nextColors.primaryColor,
          secondaryColor: nextColors.secondaryColor,
        }),
      });
    } catch {
      // fallback já persistido no save local.
    }
    setOpenModal(null);
  };

  const attributeSections = (player: Player) => {
    const attrs = player.attributes ?? {
      acceleration: player.pace,
      sprintSpeed: player.pace,
      positioning: player.shooting,
      finishing: player.shooting,
      shotPower: player.shooting,
      longShots: player.shooting,
      vision: player.passing,
      shortPass: player.passing,
      longPass: player.passing,
      curve: player.passing,
      ballControl: player.dribbling,
      agility: player.dribbling,
      composure: player.dribbling,
      interceptions: player.defending,
      defensiveAwareness: player.defending,
      strength: player.physical,
      stamina: player.physical,
      aggression: player.physical,
    };

    return [
      { label: "Pace", overall: player.pace, values: [{ name: "acceleration", value: attrs.acceleration }, { name: "sprintSpeed", value: attrs.sprintSpeed }] },
      { label: "Shooting", overall: player.shooting, values: [{ name: "positioning", value: attrs.positioning }, { name: "finishing", value: attrs.finishing }, { name: "shotPower", value: attrs.shotPower }, { name: "longShots", value: attrs.longShots }] },
      { label: "Passing", overall: player.passing, values: [{ name: "vision", value: attrs.vision }, { name: "shortPass", value: attrs.shortPass }, { name: "longPass", value: attrs.longPass }, { name: "curve", value: attrs.curve }] },
      { label: "Dribbling", overall: player.dribbling, values: [{ name: "ballControl", value: attrs.ballControl }, { name: "agility", value: attrs.agility }, { name: "composure", value: attrs.composure }] },
      { label: "Defending", overall: player.defending, values: [{ name: "interceptions", value: attrs.interceptions }, { name: "defensiveAwareness", value: attrs.defensiveAwareness }] },
      { label: "Physical", overall: player.physical, values: [{ name: "strength", value: attrs.strength }, { name: "stamina", value: attrs.stamina }, { name: "aggression", value: attrs.aggression }] },
    ];
  };

  const marketPool = allPlayers.filter((player) => player.teamId !== payload.team.id);
  const filteredLeagues = globalSearchService.filterLeagues(leagues, searchQuery);
  const filteredClubs = globalSearchService.filterClubs(allTeams, searchQuery);
  const filteredPlayers = globalSearchService.filterPlayers(marketPool, searchQuery, playerFilters);

  const selectedLeague = leagues.find((league) => league.id === selectedLeagueId) ?? null;
  const selectedClub = allTeams.find((club) => club.id === selectedClubId) ?? null;
  const selectedGlobalPlayer = marketPool.find((player) => player.id === selectedGlobalPlayerId) ?? null;
  const availablePlaystyles = playstyleInventoryService.availableItems(state.inventory);
  const primaryColor = state.teamColors?.primaryColor ?? payload.team.primaryColor;
  const secondaryColor = clubVisualService.ensureReadableAccent(state.teamColors?.secondaryColor ?? payload.team.secondaryColor);
  const boardMoraleLabel = clubVisualService.reputationToLabel(payload.save.boardReputation);
  const fansMoraleLabel = clubVisualService.reputationToLabel(payload.save.fansReputation);
  const boardExpectation = clubVisualService.boardExpectation({
    teamPosition: payload.team.currentLeaguePosition,
    boardReputation: payload.save.boardReputation,
  });
  const isHomeNextMatch = payload.nextFixture ? payload.nextFixture.homeTeamId === payload.team.id : false;
  const nextVenue = payload.nextFixture
    ? isHomeNextMatch
      ? stadium?.name ?? `${payload.team.shortName} Arena`
      : stadiumsByTeamId[payload.nextFixture.awayTeamId === payload.team.id ? payload.nextFixture.homeTeamId : payload.nextFixture.awayTeamId]?.name ?? `${teamsById[payload.nextFixture.awayTeamId === payload.team.id ? payload.nextFixture.homeTeamId : payload.nextFixture.awayTeamId]?.shortName ?? "Arena"} Arena`
    : "";

  const stadiumProjection = stadiumRevenueService.estimate({
    capacity: state.stadiumCapacity,
    ticketPrice: state.ticketPrice,
    baseDemand: 0.82,
    teamMomentum: 1 + (payload.save.fansReputation - 5) / 70,
    reputation: payload.save.fansReputation * 10,
    rivalry: payload.nextFixture ? 1.05 : 0.98,
    matchImportance: payload.nextFixture ? 1.08 : 0.95,
  });

  return (
    <main
      className="min-h-screen p-6"
      style={{
        backgroundImage: `radial-gradient(circle at 15% 15%, ${secondaryColor}40 0%, transparent 30%), radial-gradient(circle at 85% 75%, ${primaryColor}55 0%, transparent 35%), linear-gradient(135deg, ${primaryColor}f2, #020617)`,
      }}
    >
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
            <TeamIdentityHeader
              team={payload.team}
              managerName={payload.save.managerName}
              boardReputation={payload.save.boardReputation}
              fansReputation={payload.save.fansReputation}
              boardMoraleLabel={boardMoraleLabel}
              fansMoraleLabel={fansMoraleLabel}
              stadiumName={stadium?.name ?? `${payload.team.shortName} Arena`}
              boardExpectation={boardExpectation}
              secondaryColor={secondaryColor}
              onOpenColorEditor={() => {
                setColorDraft({ primaryColor, secondaryColor: state.teamColors?.secondaryColor ?? payload.team.secondaryColor });
                setOpenModal("Identidade do Clube");
              }}
            />
            {payload.nextFixture ? (
              <MiniNextMatchCard
                fixture={payload.nextFixture}
                userTeam={payload.team}
                homeTeam={teamsById[payload.nextFixture.homeTeamId]}
                awayTeam={teamsById[payload.nextFixture.awayTeamId]}
                venue={nextVenue}
                primaryColor={primaryColor}
                secondaryColor={secondaryColor}
              />
            ) : null}
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
              {mergedPlayers.map((player) => (
                <button key={player.id} onClick={() => setSelectedPlayerId(player.id)} className="grid w-full grid-cols-8 gap-2 rounded-xl border border-white/10 bg-slate-800/70 p-2 text-left text-xs text-slate-100 hover:border-cyan-300/60">
                  <p className="col-span-2 font-semibold" style={{ color: secondaryColor }}>{player.name}</p>
                  <p>{player.position}</p>
                  <p>OVR {player.overall}</p>
                  <p>{player.age} anos</p>
                  <p>Cond {player.physicalCondition}%</p>
                  <p>${(player.marketValue / 1000000).toFixed(1)}M</p>
                  <p className="text-cyan-300">{player.playstyles[0] ?? "-"}</p>
                </button>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>

      {selectedPlayer && modalShell("Player Detail Modal V2", () => setSelectedPlayerId(null), (
        <div className="space-y-4 text-sm text-slate-100">
          <div className="grid gap-3 lg:grid-cols-[2fr,1fr]">
            <div className="rounded-2xl border border-white/20 bg-slate-800/70 p-4">
              <div className="flex flex-wrap items-start gap-4">
                <PlayerFace player={selectedPlayer} />
                <div className="space-y-1">
                  <p className="text-2xl font-black text-white">{selectedPlayer.name}</p>
                  <p className="text-sm text-cyan-200">{selectedPlayer.position} • {selectedPlayer.age} anos • {payload.team.name}</p>
                  <div className="grid gap-1 text-xs text-slate-200 sm:grid-cols-2">
                    <p>Moral: <b>{selectedPlayer.morale ?? "Contente"}</b></p>
                    <p>Condição: <b>{selectedPlayer.physicalCondition}%</b></p>
                    <p>Lesão: <b>{selectedPlayer.injuryStatus ?? "Disponível"}</b></p>
                    <p>Salário: <b>${(selectedPlayer.salary ?? 0).toLocaleString()}</b></p>
                    <p>Mercado: <b>{selectedPlayer.isTransferListed ? "Listado" : "Não listado"}</b></p>
                    <p>Valor: <b>${(selectedPlayer.marketValue / 1000000).toFixed(2)}M</b></p>
                  </div>
                </div>
              </div>
            </div>
            <OverallBadge value={selectedPlayer.overall} impact={playerEffectiveScore(selectedPlayer)} />
          </div>

          <div className="rounded-xl border border-white/20 p-3">
            <p className="font-semibold text-cyan-300">Ações de gestão</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {!selectedPlayer.isTransferListed ? (
                <button onClick={() => onListPlayer(selectedPlayer)} className="rounded bg-amber-500 px-2 py-1 text-xs font-bold text-slate-950">Listar no mercado</button>
              ) : (
                <button onClick={() => onUnlistPlayer(selectedPlayer)} className="rounded bg-slate-600 px-2 py-1 text-xs font-bold text-white">Desmarcar listar para venda</button>
              )}
              <button onClick={() => onSalaryChange(selectedPlayer, Math.round((selectedPlayer.salary ?? 100000) * 1.1))} className="rounded bg-emerald-500 px-2 py-1 text-xs font-bold text-slate-950">Aumentar salário</button>
              <button onClick={() => onSalaryChange(selectedPlayer, Math.round((selectedPlayer.salary ?? 100000) * 0.9))} className="rounded bg-rose-500 px-2 py-1 text-xs font-bold text-white">Diminuir salário</button>
              <button onClick={() => setPlaystyleTargetPlayerId(selectedPlayer.id)} className="rounded bg-cyan-500 px-2 py-1 text-xs font-bold text-slate-950">Inserir Playstyle</button>
            </div>
          </div>

          <div className="space-y-3">
            {attributeSections(selectedPlayer).map((section) => (
              <div key={section.label} className="rounded-xl border border-white/20 p-3">
                <AttributeSectionGauge label={section.label} value={section.overall} />
                <AttributeVerticalBars values={section.values} />
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-white/20 bg-slate-900/80 p-3 text-xs">
            {(() => {
              const risk = injuryService.estimateRisk({
                baseInjuryRisk: 0.04,
                conditioning: selectedPlayer.physicalCondition,
                stamina: selectedPlayer.attributes?.stamina ?? selectedPlayer.physical,
                tacticIntensity: "balanced",
                contactLevel: 1,
              });
              return <p>Risco de lesão estimado: <b>{(risk.injuryRisk * 100).toFixed(2)}%</b> (fatiga {risk.fatigueModifier.toFixed(2)}x / conditioning {risk.conditioningModifier.toFixed(2)}x)</p>;
            })()}
          </div>
        </div>
      ))}

      {playstyleTargetPlayerId && modalShell("Playstyle Selection Modal", () => setPlaystyleTargetPlayerId(null), (
        <div className="space-y-3 text-sm text-slate-100">
          <p>Selecione um playstyle disponível no inventário do clube.</p>
          {availablePlaystyles.length === 0 ? <p className="text-slate-300">Nenhum playstyle disponível.</p> : (
            <div className="grid gap-2 sm:grid-cols-2">
              {availablePlaystyles.map((item) => (
                <button
                  key={item.name}
                  onClick={() => {
                    const player = mergedPlayers.find((entry) => entry.id === playstyleTargetPlayerId);
                    if (!player) return;
                    applyPlaystyle(player, item.name);
                  }}
                  className="rounded-xl border border-white/20 bg-slate-800 p-3 text-left hover:border-cyan-300"
                >
                  <p className="font-bold text-cyan-200">{item.name}</p>
                  <p className="text-xs text-slate-300">Disponível: {item.amount}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      ))}

      {openModal === "Email" && modalShell("Inbox Modal", () => {
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
            <button onClick={() => buyConsumable("Sharp Shooter", 1400000)} className="rounded bg-cyan-500 px-3 py-1 font-bold text-slate-950">Comprar Sharp Shooter ($1.4M)</button>
            <button onClick={() => buyConsumable("Lockdown Defender", 1300000)} className="rounded bg-cyan-500 px-3 py-1 font-bold text-slate-950">Comprar Lockdown Defender ($1.3M)</button>
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
              updateState((prev) => ({ ...prev, budget: financeService.applyIncome(prev.budget, amount), loans: [...prev.loans, { amount, interest: 0.08, roundsLeft: 8 }] }));
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
          <p>Público projetado: {stadiumProjection.attendance.toLocaleString()} ({(stadiumProjection.attendanceRate * 100).toFixed(1)}%)</p>
          <p>Receita projetada: ${stadiumProjection.matchRevenue.toLocaleString()}</p>
          <div className="flex gap-2">
            <button onClick={() => updateState((prev) => ({ ...prev, ticketPrice: Math.max(10, prev.ticketPrice - 5) }))} className="rounded bg-slate-700 px-2 py-1">-5</button>
            <button onClick={() => updateState((prev) => ({ ...prev, ticketPrice: prev.ticketPrice + 5 }))} className="rounded bg-slate-700 px-2 py-1">+5</button>
            <button onClick={() => {
              const cost = 3500000;
              if (!financeService.canAfford(state.budget, cost)) return;
              updateState((prev) => ({ ...prev, budget: financeService.applyExpense(prev.budget, cost), stadiumCapacity: prev.stadiumCapacity + 1500, stadiumLevel: prev.stadiumLevel + 1 }));
              addFinance("stadium", -cost, "Ampliação do estádio");
            }} className="rounded bg-cyan-500 px-2 py-1 font-bold text-slate-950">Ampliar (+1500)</button>
          </div>
        </div>
      ))}

      {openModal === "Comprar Jogador" && modalShell("Transfer Market Modal", () => setOpenModal(null), (
        <div className="space-y-2 text-sm text-slate-100">
          {marketPool.slice(0, 30).map((player) => (
            <div key={player.id} className="flex items-center justify-between rounded border border-white/10 p-2">
              <p>{player.name} • {player.position} • OVR {player.overall} • {teamsById[player.teamId]?.shortName}</p>
              <button
                onClick={() => {
                  const offerValue = Math.round(player.marketValue * 0.95);
                  updateState((prev) => ({
                    ...prev,
                    pendingActions: [...prev.pendingActions, { id: `buy-${player.id}-${Date.now()}`, dueRound: payload.save.currentRound + (Math.random() > 0.5 ? 1 : 2), type: "buy_offer", payload: { playerId: player.id, offerValue } }],
                  }));
                }}
                className="rounded bg-emerald-500 px-2 py-1 text-xs font-bold text-slate-950"
              >Fazer oferta</button>
            </div>
          ))}
        </div>
      ))}

      {openModal === "Buscar" && modalShell("Global Search Modal V2", () => setOpenModal(null), (
        <div className="grid gap-3 text-sm text-slate-100 lg:grid-cols-[1fr,1.6fr]">
          <div className="space-y-3 rounded-xl border border-white/20 p-3">
            <div className="flex gap-2">
              {(["Ligas", "Clubes", "Jogadores"] as const).map((tab) => (
                <button key={tab} onClick={() => setSearchTab(tab)} className={`rounded px-2 py-1 text-xs ${searchTab === tab ? "bg-cyan-500 font-bold text-slate-950" : "bg-slate-700"}`}>{tab}</button>
              ))}
            </div>
            <input className="w-full rounded border border-white/20 bg-slate-800 px-2 py-1 text-sm" placeholder="Buscar por nome" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} />

            {searchTab === "Ligas" && <div className="max-h-[60vh] space-y-1 overflow-auto">{filteredLeagues.map((league) => <button key={league.id} onClick={() => setSelectedLeagueId(league.id)} className="flex w-full items-center gap-2 rounded border border-white/10 p-2 text-left"><LogoMark logo={league.logoUrl} label={league.name} size={24} /><span>{league.name}</span></button>)}</div>}
            {searchTab === "Clubes" && <div className="max-h-[60vh] space-y-1 overflow-auto">{filteredClubs.map((club) => <button key={club.id} onClick={() => setSelectedClubId(club.id)} className="flex w-full items-center gap-2 rounded border border-white/10 p-2 text-left"><LogoMark logo={club.logoUrl} label={club.name} size={24} /><span>{club.name}</span></button>)}</div>}
            {searchTab === "Jogadores" && (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <input value={playerFilters.position} onChange={(event) => setPlayerFilters((prev) => ({ ...prev, position: event.target.value.toUpperCase() }))} placeholder="Posição (PG)" className="rounded border border-white/20 bg-slate-800 px-2 py-1 text-xs" />
                  <input type="number" value={playerFilters.minOverall} onChange={(event) => setPlayerFilters((prev) => ({ ...prev, minOverall: Number(event.target.value) }))} placeholder="OVR mín" className="rounded border border-white/20 bg-slate-800 px-2 py-1 text-xs" />
                </div>
                <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={playerFilters.listedOnly} onChange={(event) => setPlayerFilters((prev) => ({ ...prev, listedOnly: event.target.checked }))} />Somente listados no mercado</label>
                <div className="max-h-[45vh] space-y-1 overflow-auto">{filteredPlayers.map((player) => <button key={player.id} onClick={() => setSelectedGlobalPlayerId(player.id)} className="w-full rounded border border-white/10 p-2 text-left"><p className="font-semibold">{player.name}</p><p className="text-xs text-slate-300">{player.position} • OVR {player.overall} • {teamsById[player.teamId]?.shortName}</p></button>)}</div>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-white/20 p-3">
            {searchTab === "Ligas" && selectedLeague && (
              <div className="space-y-2">
                <div className="flex items-center gap-3"><LogoMark logo={selectedLeague.logoUrl} label={selectedLeague.name} size={48} /><div><p className="text-lg font-black">{selectedLeague.name}</p><p>{selectedLeague.country} • {selectedLeague.format}</p></div></div>
                <p>Times: {selectedLeague.teamCount}</p>
                <p>Classificação (top 8):</p>
                {standings.slice(0, 8).map((row) => <p key={row.teamId}>#{row.position} {teamsById[row.teamId]?.name} ({row.wins}-{row.losses})</p>)}
                <p className="font-semibold">Clubes participantes</p>
                <div className="grid grid-cols-2 gap-2">{allTeams.filter((team) => team.leagueId === selectedLeague.id).map((team) => <div key={team.id} className="rounded border border-white/10 p-2"><p>{team.shortName}</p></div>)}</div>
              </div>
            )}

            {searchTab === "Clubes" && selectedClub && (
              <div className="space-y-2">
                <div className="flex items-center gap-3"><LogoMark logo={selectedClub.logoUrl} label={selectedClub.name} size={48} /><div><p className="text-lg font-black">{selectedClub.name}</p><p>{leagues.find((league) => league.id === selectedClub.leagueId)?.name}</p></div></div>
                <p>Orçamento: ${selectedClub.budget.toLocaleString()} • Overall: {selectedClub.overall}</p>
                <p>Posição liga: {selectedClub.currentLeaguePosition} • Reputação: {selectedClub.reputationFans}/10</p>
                <p className="font-semibold text-cyan-300">Elenco do clube</p>
                <div className="max-h-[42vh] space-y-2 overflow-auto">{allPlayers.filter((player) => player.teamId === selectedClub.id).map((player) => (
                  <button key={player.id} onClick={() => setSelectedPlayerId(player.id)} className="flex w-full items-center justify-between rounded border border-white/10 p-2 text-left">
                    <div>
                      <p className="font-semibold">{player.name}</p>
                      <p className="text-xs text-slate-300">{player.position} • {player.age} anos • OVR {player.overall}</p>
                    </div>
                    <p className="text-xs">${(player.marketValue / 1000000).toFixed(1)}M</p>
                  </button>
                ))}</div>
              </div>
            )}

            {searchTab === "Jogadores" && selectedGlobalPlayer && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <PlayerFace player={selectedGlobalPlayer} />
                  <div>
                    <p className="text-lg font-black">{selectedGlobalPlayer.name}</p>
                    <p>{selectedGlobalPlayer.position} • OVR {selectedGlobalPlayer.overall} • {teamsById[selectedGlobalPlayer.teamId]?.name}</p>
                    <p>Valor: ${(selectedGlobalPlayer.marketValue / 1000000).toFixed(2)}M • Salário: ${(selectedGlobalPlayer.salary ?? 0).toLocaleString()}</p>
                    <p>Moral: {selectedGlobalPlayer.morale ?? "Contente"} • Mercado: {selectedGlobalPlayer.isTransferListed ? "Listado" : "Não listado"}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    const offerValue = Math.round(selectedGlobalPlayer.marketValue * 0.98);
                    updateState((prev) => ({ ...prev, pendingActions: [...prev.pendingActions, { id: `buy-${selectedGlobalPlayer.id}-${Date.now()}`, dueRound: payload.save.currentRound + (Math.random() > 0.5 ? 1 : 2), type: "buy_offer", payload: { playerId: selectedGlobalPlayer.id, offerValue } }] }));
                    setOpenModal("Email");
                  }}
                  className="rounded bg-emerald-500 px-3 py-1 text-xs font-bold text-slate-950"
                >Fazer oferta por este jogador</button>
              </div>
            )}

            {!selectedLeague && searchTab === "Ligas" && <p>Selecione uma liga para ver detalhes.</p>}
            {!selectedClub && searchTab === "Clubes" && <p>Selecione um clube para ver detalhes e elenco.</p>}
            {!selectedGlobalPlayer && searchTab === "Jogadores" && <p>Selecione um jogador para abrir detalhes globais.</p>}
          </div>
        </div>
      ))}

      {openModal === "Identidade do Clube" && modalShell("ClubColorEditorModal", () => setOpenModal(null), (
        <div className="space-y-4 text-sm text-slate-100">
          <p>Editor visual de identidade do clube com preview em tempo real.</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="rounded border border-white/20 p-3">
              <p className="mb-2 text-xs uppercase text-slate-300">Primary Color</p>
              <input type="color" value={colorDraft.primaryColor} onChange={(event) => setColorDraft((prev) => ({ ...prev, primaryColor: event.target.value }))} className="h-10 w-full cursor-pointer rounded" />
            </label>
            <label className="rounded border border-white/20 p-3">
              <p className="mb-2 text-xs uppercase text-slate-300">Secondary Color</p>
              <input type="color" value={colorDraft.secondaryColor} onChange={(event) => setColorDraft((prev) => ({ ...prev, secondaryColor: event.target.value }))} className="h-10 w-full cursor-pointer rounded" />
            </label>
          </div>

          <div
            className="rounded-2xl border border-white/20 p-4"
            style={{
              backgroundImage: `linear-gradient(135deg, ${colorDraft.primaryColor}cc, #0f172acc), radial-gradient(circle at 20% 30%, ${colorDraft.secondaryColor}66 0%, transparent 35%)`,
            }}
          >
            <p className="text-xs uppercase tracking-widest text-slate-100">ClubThemePreviewCard</p>
            <p className="text-lg font-black" style={{ color: clubVisualService.ensureReadableAccent(colorDraft.secondaryColor) }}>{payload.team.name}</p>
            <p className="text-xs text-slate-200">Manager: {payload.save.managerName}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button onClick={() => setColorDraft({ primaryColor: payload.team.primaryColor, secondaryColor: payload.team.secondaryColor })} className="rounded bg-slate-700 px-3 py-1 text-xs font-semibold">Restaurar padrão</button>
            <button onClick={() => setOpenModal(null)} className="rounded bg-slate-700 px-3 py-1 text-xs font-semibold">Cancelar</button>
            <button onClick={saveTeamColors} className="rounded bg-emerald-500 px-3 py-1 text-xs font-bold text-slate-950">Salvar cores</button>
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
