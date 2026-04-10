"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
import { League, LeagueChampionHistory, Player, PlayerMorale, SquadHomePayload, Stadium, StandingRow, Team, TransferStatus } from "@/types/game";
import { SectionCard } from "@/components/SectionCard";
import { TeamIdentityHeader } from "@/components/TeamIdentityHeader";
import { MiniNextMatchCard } from "@/components/MiniNextMatchCard";
import { SpectatorModeBanner } from "@/components/SpectatorModeBanner";
import { StandingsTable } from "@/components/StandingsTable";
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
import { ClubUniformAssets, defaultTacticalPreset, defaultUniformAssets, resolveUniformUrl, TacticalPreset, UniformSlot } from "@/types/tactical";
import { writeClubUniforms, writePreMatchTactic } from "@/lib/tacticalState";
import { ClubIdentityTheme, createDefaultClubIdentityTheme, normalizeClubIdentityTheme } from "@/types/clubIdentityTheme";
import { BackgroundStudioConfig, buildShellBackgroundStyle, createDefaultStudioConfig, normalizeBackgroundStudioConfig } from "@/types/backgroundStudio";

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
  clubIdentityTheme: ClubIdentityTheme;
  uniformAssets: ClubUniformAssets;
  preMatchTactic: TacticalPreset;
};

const STORAGE_PREFIX = "scores:career-state:";

const topActions = ["Calendário", "Classificações", "Campeões", "Comprar Jogador", "Salvar Jogo", "Sair", "Buscar", "Empréstimo", "Orçamento", "Estádio", "Email", "Consumíveis", "Identidade do Clube", "Editar Clubes/Ligas/Jogadores"] as const;
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
      <div className="premium-surface max-h-[92vh] w-full max-w-6xl overflow-auto p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xl font-black text-white">{title}</h2>
          <button className="premium-control px-3 py-1 text-xs" onClick={onClose}>Fechar</button>
        </div>
        {content}
      </div>
    </div>
  );
}

const PlayerFace = ({ player }: { player: Player }) => (
  <div className="relative h-24 w-24 overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-br from-cyan-500/30 to-indigo-600/30">
    {player.photoUrl ? (
      <Image src={player.photoUrl} alt={player.name} fill className="object-cover" />
    ) : (
      <div className="absolute inset-0 flex items-center justify-center text-3xl font-black text-white">{player.name.slice(0, 1)}</div>
    )}
    <div className="absolute inset-x-0 bottom-0 h-8 bg-slate-950/60" />
  </div>
);

const scoreTone = (value: number) => {
  if (value >= 85) return "text-emerald-300 border-emerald-400/50";
  if (value >= 75) return "text-cyan-300 border-cyan-400/40";
  if (value >= 65) return "text-amber-300 border-amber-400/40";
  return "text-rose-300 border-rose-400/40";
};

const moraleVisualMap: Record<PlayerMorale, { icon: string; tone: string }> = {
  "Muito Feliz": { icon: "😄", tone: "text-emerald-300" },
  Feliz: { icon: "🙂", tone: "text-cyan-300" },
  Contente: { icon: "😐", tone: "text-slate-200" },
  Insatisfeito: { icon: "🙁", tone: "text-amber-300" },
  "Muito Insatisfeito": { icon: "😠", tone: "text-rose-300" },
};

const statIconMap: Record<string, string> = {
  speed: "⚡",
  acceleration: "🚀",
  agility: "🤸",
  reaction_time: "🧠",
  off_ball_movement: "🧭",
  ball_control: "🪄",
  handle_creativity: "🎨",
  tight_dribble: "🧷",
  change_of_pace_control: "⏱️",
  drive_control: "🛞",
  passing_accuracy: "🎯",
  passing_speed: "📨",
  court_vision: "👁️",
  decision_making: "🧩",
  playmaking_iq: "♟️",
  close_shot: "🥅",
  mid_range_shot: "📍",
  three_point_shot: "🎯",
  free_throw: "🎫",
  shot_release_timing: "⏲️",
  shot_under_pressure: "🔥",
  on_ball_defense: "🛡️",
  perimeter_defense: "🧱",
  interior_defense: "🏰",
  steal_ability: "🕵️",
  block_ability: "🖐️",
  defensive_awareness: "👀",
  strength: "🏋️",
  vertical: "🦘",
  stamina: "🔋",
  durability: "🩺",
  balance: "⚖️",
  body_control: "🌀",
  clutch_factor: "⏰",
  consistency: "📈",
  confidence: "😤",
  leadership: "🗣️",
  game_iq: "🎓",
};

const statLabelMap: Record<string, string> = {
  reaction_time: "Reaction",
  off_ball_movement: "Off Ball",
  handle_creativity: "Creativity",
  tight_dribble: "Tight Drib",
  change_of_pace_control: "Pace Ctrl",
  drive_control: "Drive Ctrl",
  passing_accuracy: "Pass Acc",
  passing_speed: "Pass Spd",
  court_vision: "Vision",
  decision_making: "Decision",
  playmaking_iq: "Play IQ",
  close_shot: "Close",
  mid_range_shot: "Mid",
  three_point_shot: "3PT",
  free_throw: "FT",
  shot_release_timing: "Release",
  shot_under_pressure: "Pressure",
  on_ball_defense: "On-Ball",
  perimeter_defense: "Perimeter",
  interior_defense: "Interior",
  steal_ability: "Steal",
  block_ability: "Block",
  defensive_awareness: "Awareness",
  clutch_factor: "Clutch",
  game_iq: "IQ",
};

const OverallScoreBadge = ({ value, impact }: { value: number; impact: number }) => (
  <div className="rounded-3xl border border-cyan-300/60 bg-gradient-to-b from-slate-700 to-slate-900 p-4 text-center shadow-[0_0_45px_rgba(34,211,238,0.32)]">
    <p className="text-[11px] uppercase tracking-[0.25em] text-cyan-200">Overall</p>
    <div className="mx-auto mt-2 flex h-24 w-24 items-center justify-center rounded-full border-4 border-cyan-300/60 bg-slate-950/80 text-5xl font-black text-white">
      {value}
    </div>
    <p className="mt-3 text-xs text-slate-300">Impact Score</p>
    <p className="text-2xl font-black text-cyan-200">{impact}</p>
  </div>
);

const MoraleIconBadge = ({ morale }: { morale: PlayerMorale }) => {
  const visual = moraleVisualMap[morale];
  return <span className={`inline-flex items-center gap-1 font-semibold ${visual.tone}`}><span>{visual.icon}</span>{morale}</span>;
};

const InjuryStatusBadge = ({ injuryStatus }: { injuryStatus: Player["injuryStatus"] }) => {
  const injured = injuryStatus === "Lesionado";
  return <span className={`inline-flex items-center gap-1 font-semibold ${injured ? "text-rose-300" : "text-emerald-300"}`}>{injured ? "🩹" : "✅"}{injured ? "Lesionado" : "Disponível"}</span>;
};

const PlayerStatusIconRow = ({ player }: { player: Player }) => (
  <div className="grid gap-2 text-xs text-slate-100 sm:grid-cols-2 lg:grid-cols-3">
    <div className="rounded-lg border border-white/10 bg-slate-900/70 p-2">📅 Idade: <b>{player.age} anos</b></div>
    <div className="rounded-lg border border-white/10 bg-slate-900/70 p-2">📍 Posição: <b>{player.position}</b></div>
    <div className="rounded-lg border border-white/10 bg-slate-900/70 p-2">💰 Salário: <b>${(player.salary ?? 0).toLocaleString()}</b></div>
    <div className="rounded-lg border border-white/10 bg-slate-900/70 p-2">🏷️ Mercado: <b>{player.isTransferListed ? "Listado" : "Não listado"}</b></div>
    <div className="rounded-lg border border-white/10 bg-slate-900/70 p-2">💎 Valor: <b>${(player.marketValue / 1000000).toFixed(2)}M</b></div>
    <div className="rounded-lg border border-white/10 bg-slate-900/70 p-2">⚙️ Playstyles: <b>{player.playstyles.join(", ") || "Nenhum"}</b></div>
    <div className="rounded-lg border border-white/10 bg-slate-900/70 p-2">🫀 Condição: <b>{player.physicalCondition}%</b></div>
    <div className="rounded-lg border border-white/10 bg-slate-900/70 p-2">🩺 Lesão: <InjuryStatusBadge injuryStatus={player.injuryStatus} /></div>
    <div className="rounded-lg border border-white/10 bg-slate-900/70 p-2">😊 Moral: <MoraleIconBadge morale={player.morale ?? "Contente"} /></div>
  </div>
);

const CategoryGaugeCard = ({ label, value, icon }: { label: string; value: number; icon: string }) => {
  const progress = Math.round((Math.max(0, Math.min(99, value)) / 99) * 100);
  return (
    <div className={`rounded-2xl border bg-slate-900/80 p-3 ${scoreTone(value)}`}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-white">{icon} {label}</p>
        <p className="text-xl font-black">{value}</p>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <div className="relative h-14 w-14 rounded-full" style={{ background: `conic-gradient(rgb(34 211 238) ${progress}%, rgba(148,163,184,0.15) 0)` }}>
          <div className="absolute inset-[6px] flex items-center justify-center rounded-full bg-slate-950 text-[10px] font-bold text-slate-200">{progress}%</div>
        </div>
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-700/70">
          <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-sky-400 to-emerald-300" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  );
};

const VerticalStatBar = ({ name, value }: { name: string; value: number }) => {
  const label = statLabelMap[name] ?? name;
  return (
    <div className="rounded-xl border border-white/10 bg-slate-950/80 p-2 text-center">
      <div className="mb-1 text-base">{statIconMap[name] ?? "📊"}</div>
      <div className="mx-auto mb-2 flex h-28 w-7 items-end rounded-md border border-white/10 bg-slate-800 p-[2px]">
        <div className="w-full rounded-sm bg-gradient-to-t from-indigo-500 via-cyan-400 to-emerald-300" style={{ height: `${Math.max(8, Math.min(100, value))}%` }} />
      </div>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-300">{label}</p>
      <p className="text-xs font-black text-white">{value}</p>
    </div>
  );
};

const PlayerHeaderHero = ({ player, teamName }: { player: Player; teamName: string }) => (
  <div className="rounded-2xl border border-cyan-400/30 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-4 shadow-[0_0_40px_rgba(14,165,233,0.2)]">
    <div className="grid gap-3 lg:grid-cols-[1.5fr,220px]">
      <div className="space-y-3">
        <div className="flex flex-wrap items-start gap-4">
          <PlayerFace player={player} />
          <div>
            <p className="text-3xl font-black text-white">{player.name}</p>
            <p className="text-sm text-cyan-200">🏟️ {teamName} • 🎽 {player.position}</p>
          </div>
        </div>
        <PlayerStatusIconRow player={player} />
      </div>
      <OverallScoreBadge value={player.overall} impact={playerEffectiveScore(player)} />
    </div>
  </div>
);

const PlaystyleSelectionModal = ({
  availablePlaystyles,
  playstyleTargetPlayerId,
  mergedPlayers,
  applyPlaystyle,
}: {
  availablePlaystyles: ReturnType<PlaystyleInventoryService["availableItems"]>;
  playstyleTargetPlayerId: string;
  mergedPlayers: Player[];
  applyPlaystyle: (player: Player, playstyle: string) => void;
}) => (
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
            <p className="font-bold text-cyan-200">✨ {item.name}</p>
            <p className="text-xs text-slate-300">Disponível: {item.amount}</p>
          </button>
        ))}
      </div>
    )}
  </div>
);

const LogoMark = ({ logo, label, size = 24 }: { logo: string; label: string; size?: number }) => {
  const isImage = logo.startsWith("/") || logo.startsWith("http") || logo.startsWith("data:");
  if (isImage) return <Image src={logo} alt={label} width={size} height={size} className="rounded" />;
  return <span className="inline-flex items-center justify-center rounded bg-slate-800 px-2 py-1 text-lg">{logo}</span>;
};

const TeamPremiumTile = ({
  team,
  onClick,
  isActive = false,
}: {
  team: Team;
  onClick: () => void;
  isActive?: boolean;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`w-full rounded-xl border p-3 text-left transition hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(16,185,129,0.25)] ${isActive ? "border-emerald-300/80" : "border-emerald-300/30"}`}
    style={{
      backgroundImage: `linear-gradient(135deg, rgba(16,185,129,0.28), rgba(5,150,105,0.1)), radial-gradient(circle at 16% 20%, ${team.primaryColor}80 0%, transparent 40%)`,
    }}
  >
    <div className="flex items-center gap-3">
      <div className="rounded-lg border border-white/25 bg-slate-900/70 p-1.5">
        <LogoMark logo={team.logoUrl} label={team.name} size={30} />
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-black text-white">{team.name}</p>
        <p className="text-xs text-emerald-100/90">{team.shortName}</p>
      </div>
    </div>
  </button>
);

type EditableTab = "Ligas" | "Clubes" | "Jogadores" | "Novo Time";

const createId = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 10)}`;

export function SquadHomeClient({
  payload,
  standings,
  champions,
  leagues,
  allTeams,
  allPlayers,
  stadium,
  stadiumsByTeamId,
}: {
  payload: SquadHomePayload;
  standings: StandingRow[];
  champions: LeagueChampionHistory[];
  leagues: League[];
  allTeams: Team[];
  allPlayers: Player[];
  stadium: Stadium | null;
  stadiumsByTeamId: Record<string, Stadium | null>;
}) {
  const [openModal, setOpenModal] = useState<string | null>(null);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [playstyleTargetPlayerId, setPlaystyleTargetPlayerId] = useState<string | null>(null);
  const [searchTab, setSearchTab] = useState<"Ligas" | "Clubes" | "Jogadores">("Ligas");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLeagueId, setSelectedLeagueId] = useState<string | null>(null);
  const [selectedClubId, setSelectedClubId] = useState<string | null>(null);
  const [selectedGlobalPlayerId, setSelectedGlobalPlayerId] = useState<string | null>(null);
  const [transferLeagueId, setTransferLeagueId] = useState<string | null>(null);
  const [transferClubId, setTransferClubId] = useState<string | null>(null);
  const [transferOfferPlayerId, setTransferOfferPlayerId] = useState<string | null>(null);
  const [transferOfferValue, setTransferOfferValue] = useState<string>("");
  const [colorDraft, setColorDraft] = useState({ primaryColor: payload.team.primaryColor, secondaryColor: payload.team.secondaryColor });
  const [playerFilters, setPlayerFilters] = useState<{ position: string; minOverall: number; listedOnly: boolean }>({
    position: "",
    minOverall: 70,
    listedOnly: false,
  });
  const [editableLeagues, setEditableLeagues] = useState<League[]>(leagues);
  const [editableTeams, setEditableTeams] = useState<Team[]>(allTeams);
  const [editablePlayers, setEditablePlayers] = useState<Player[]>(allPlayers);
  const [editorTab, setEditorTab] = useState<EditableTab>("Ligas");
  const [newTeamDraft, setNewTeamDraft] = useState({
    leagueId: leagues[0]?.id ?? payload.team.leagueId,
    name: "",
    shortName: "",
    venueName: "",
    primaryColor: "#5B21B6",
    secondaryColor: "#22D3EE",
    players: Array.from({ length: 8 }).map((_, idx) => ({ name: `Novo Jogador ${idx + 1}`, position: (["PG", "SG", "SF", "PF", "C", "PG", "SG", "SF"] as const)[idx], overall: 72 })),
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
      clubIdentityTheme: createDefaultClubIdentityTheme(payload.team.primaryColor, payload.team.secondaryColor),
      uniformAssets: defaultUniformAssets,
      preMatchTactic: defaultTacticalPreset,
      financeLog: [{ id: "init", type: "setup", amount: payload.save.budgetSnapshot, note: "Saldo inicial", round: payload.save.currentRound }],
    };

    if (typeof window === "undefined") return initial;
    const raw = window.localStorage.getItem(`${STORAGE_PREFIX}${payload.save.id}`);
    if (!raw) return initial;
    try {
      const parsed = JSON.parse(raw) as Partial<CareerState> | null;
      if (!parsed || typeof parsed !== "object") return initial;

      return {
        ...initial,
        ...parsed,
        loans: Array.isArray(parsed.loans) ? parsed.loans : initial.loans,
        inventory: parsed.inventory && typeof parsed.inventory === "object" ? parsed.inventory : initial.inventory,
        playerOverrides: parsed.playerOverrides && typeof parsed.playerOverrides === "object" ? parsed.playerOverrides : initial.playerOverrides,
        signedPlayers: Array.isArray(parsed.signedPlayers) ? parsed.signedPlayers : initial.signedPlayers,
        inbox: Array.isArray(parsed.inbox) ? parsed.inbox : initial.inbox,
        financeLog: Array.isArray(parsed.financeLog) ? parsed.financeLog : initial.financeLog,
        pendingActions: Array.isArray(parsed.pendingActions) ? parsed.pendingActions : initial.pendingActions,
        teamColors: parsed.teamColors && typeof parsed.teamColors === "object"
          ? {
            primaryColor: parsed.teamColors.primaryColor ?? initial.teamColors.primaryColor,
            secondaryColor: parsed.teamColors.secondaryColor ?? initial.teamColors.secondaryColor,
          }
          : initial.teamColors,
        clubIdentityTheme: normalizeClubIdentityTheme(
          parsed.clubIdentityTheme && typeof parsed.clubIdentityTheme === "object" ? parsed.clubIdentityTheme : null,
          parsed.teamColors?.primaryColor ?? initial.teamColors.primaryColor,
          parsed.teamColors?.secondaryColor ?? initial.teamColors.secondaryColor,
        ),
        uniformAssets: parsed.uniformAssets && typeof parsed.uniformAssets === "object" ? { ...initial.uniformAssets, ...parsed.uniformAssets } : initial.uniformAssets,
        preMatchTactic: parsed.preMatchTactic && typeof parsed.preMatchTactic === "object" ? { ...initial.preMatchTactic, ...parsed.preMatchTactic } : initial.preMatchTactic,
      };
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    window.localStorage.setItem(`${STORAGE_PREFIX}${payload.save.id}`, JSON.stringify(state));
  }, [payload.save.id, state]);

  const [backgroundStudio, setBackgroundStudio] = useState<BackgroundStudioConfig>(() => {
    if (typeof window === "undefined") return createDefaultStudioConfig();
    const raw = window.localStorage.getItem(`scores:background-studio:${payload.save.id}`);
    if (!raw) return createDefaultStudioConfig();
    try {
      return normalizeBackgroundStudioConfig(JSON.parse(raw) as Partial<BackgroundStudioConfig>);
    } catch {
      return createDefaultStudioConfig();
    }
  });

  useEffect(() => {
    const syncBackgroundStudio = () => {
      const raw = window.localStorage.getItem(`scores:background-studio:${payload.save.id}`);
      if (!raw) {
        setBackgroundStudio(createDefaultStudioConfig());
        return;
      }
      try {
        setBackgroundStudio(normalizeBackgroundStudioConfig(JSON.parse(raw) as Partial<BackgroundStudioConfig>));
      } catch {
        setBackgroundStudio(createDefaultStudioConfig());
      }
    };

    syncBackgroundStudio();
    window.addEventListener("storage", syncBackgroundStudio);
    window.addEventListener("scores-shell-background-change", syncBackgroundStudio);
    return () => {
      window.removeEventListener("storage", syncBackgroundStudio);
      window.removeEventListener("scores-shell-background-change", syncBackgroundStudio);
    };
  }, [payload.save.id]);

  const teamsMap = useMemo(
    () => Object.fromEntries(editableTeams.map((team) => [team.id, team])) as Record<string, Team>,
    [editableTeams],
  );
  const leaguesMap = useMemo(
    () => Object.fromEntries(editableLeagues.map((league) => [league.id, league])) as Record<string, League>,
    [editableLeagues],
  );

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
        const player = editablePlayers.find((entry) => entry.id === playerId);
        if (!player) return;

        const outcome = transferService.getOfferAcceptanceScore({
          player,
          offerValue,
          isTransferListed: !!player.isTransferListed,
          sellerBudget: teamsMap[player.teamId]?.budget ?? 30000000,
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

  const sendTransferOffer = (player: Player, offerValue: number) => {
    const sellerClub = teamsMap[player.teamId];
    updateState((prev) => ({
      ...prev,
      pendingActions: [
        ...prev.pendingActions,
        {
          id: `buy-${player.id}-${Date.now()}`,
          dueRound: payload.save.currentRound + (Math.random() > 0.5 ? 1 : 2),
          type: "buy_offer",
          payload: { playerId: player.id, offerValue },
        },
      ],
      inbox: [
        {
          id: `offer-sent-${player.id}-${Date.now()}`,
          type: "transfer_offer_sent",
          subject: "Oferta enviada",
          body: `Oferta de $${offerValue.toLocaleString()} enviada para ${sellerClub?.name ?? "clube vendedor"} por ${player.name}.`,
          round: payload.save.currentRound,
          createdAt: nowIso(),
          read: false,
        },
        ...prev.inbox,
      ],
    }));
    setTransferOfferPlayerId(null);
    setTransferOfferValue("");
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

    updateState((prev) => ({
      ...prev,
      teamColors: nextColors,
      clubIdentityTheme: {
        ...prev.clubIdentityTheme,
        primaryColor: nextColors.primaryColor,
        secondaryColor: nextColors.secondaryColor,
        accentColor: nextColors.secondaryColor,
        glowColor: nextColors.secondaryColor,
      },
    }));
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

  const setUniformSlot = (slot: UniformSlot) => {
    updateState((prev) => {
      const next = { ...prev, uniformAssets: { ...prev.uniformAssets, active_uniform_slot: slot } };
      writeClubUniforms(payload.save.id, next.uniformAssets);
      return next;
    });
  };

  const setUniformAsset = (slot: UniformSlot, url: string) => {
    updateState((prev) => {
      const nextUniforms: ClubUniformAssets = {
        ...prev.uniformAssets,
        home_uniform_2d_url: slot === "home" ? url : prev.uniformAssets.home_uniform_2d_url,
        away_uniform_2d_url: slot === "away" ? url : prev.uniformAssets.away_uniform_2d_url,
        alternate_uniform_2d_url: slot === "alternate" ? url : prev.uniformAssets.alternate_uniform_2d_url,
      };
      writeClubUniforms(payload.save.id, nextUniforms);
      return { ...prev, uniformAssets: nextUniforms };
    });
  };

  const addCustomTeam = () => {
    if (!newTeamDraft.name.trim() || !newTeamDraft.shortName.trim()) return;
    const teamId = createId("team");
    const stadiumId = createId("stadium");
    const newTeam: Team = {
      id: teamId,
      leagueId: newTeamDraft.leagueId,
      name: newTeamDraft.name.trim(),
      shortName: newTeamDraft.shortName.trim(),
      logoUrl: "🛡️",
      overall: Math.round(newTeamDraft.players.reduce((sum, p) => sum + p.overall, 0) / Math.max(1, newTeamDraft.players.length)),
      attackOverall: 74,
      defenseOverall: 74,
      physicality: 74,
      budget: 25000000,
      stadiumId,
      managerDefaultName: "Manager Custom",
      reputationBoard: 5,
      reputationFans: 5,
      currentLeaguePosition: editableTeams.filter((team) => team.leagueId === newTeamDraft.leagueId).length + 1,
      primaryColor: newTeamDraft.primaryColor,
      secondaryColor: newTeamDraft.secondaryColor,
      visualId: createId("visual"),
      uniformIds: [],
      summary: "Equipe customizada criada no editor.",
    };
    const customPlayers: Player[] = newTeamDraft.players.map((entry, idx) => ({
      id: createId(`player${idx + 1}`),
      teamId: teamId,
      name: entry.name.trim() || `Jogador ${idx + 1}`,
      position: entry.position,
      overall: entry.overall,
      age: 24,
      marketValue: entry.overall * 110000,
      physicalCondition: 92,
      attributes: payload.players[0].attributes,
      macroRatings: payload.players[0].macroRatings,
      playstyles: [],
      isStarter: idx < 5,
      isBench: idx >= 5,
      morale: "Contente",
      injuryStatus: "Disponível",
      salary: 500000,
    }));
    setEditableTeams((prev) => [...prev, newTeam]);
    setEditablePlayers((prev) => [...prev, ...customPlayers]);
    setNewTeamDraft((prev) => ({ ...prev, name: "", shortName: "", venueName: "" }));
    setEditorTab("Clubes");
  };

  const attributeSections = (player: Player) => {
    const attrs = player.attributes;
    return [
      { label: "PACE", overall: player.macroRatings.pace_rating, values: Object.entries(attrs.pace).map(([name, value]) => ({ name, value })) },
      { label: "DRIBBLING", overall: player.macroRatings.dribbling_rating, values: Object.entries(attrs.dribbling).map(([name, value]) => ({ name, value })) },
      { label: "PASSING", overall: player.macroRatings.passing_rating, values: Object.entries(attrs.passing).map(([name, value]) => ({ name, value })) },
      { label: "SHOOTING", overall: player.macroRatings.shooting_rating, values: Object.entries(attrs.shooting).map(([name, value]) => ({ name, value })) },
      { label: "DEFENDING", overall: player.macroRatings.defending_rating, values: Object.entries(attrs.defending).map(([name, value]) => ({ name, value })) },
      { label: "PHYSICAL", overall: player.macroRatings.physical_rating, values: Object.entries(attrs.physical).map(([name, value]) => ({ name, value })) },
      { label: "MENTAL", overall: player.macroRatings.mental_rating, values: Object.entries(attrs.mental_intangibles).map(([name, value]) => ({ name, value })) },
    ];
  };

  const marketPool = editablePlayers.filter((player) => player.teamId !== payload.team.id);
  const transferMarketClubs = editableTeams.filter((team) => team.id !== payload.team.id);
  const transferMarketLeagues = editableLeagues.filter((league) => transferMarketClubs.some((team) => team.leagueId === league.id));
  const transferClubsByLeague = transferLeagueId ? transferMarketClubs.filter((team) => team.leagueId === transferLeagueId) : [];
  const transferPlayersByClub = transferClubId ? editablePlayers.filter((player) => player.teamId === transferClubId) : [];
  const transferOfferTarget = transferOfferPlayerId ? editablePlayers.find((player) => player.id === transferOfferPlayerId) ?? null : null;
  const filteredLeagues = globalSearchService.filterLeagues(editableLeagues, searchQuery);
  const filteredClubs = globalSearchService.filterClubs(editableTeams, searchQuery);
  const filteredPlayers = globalSearchService.filterPlayers(marketPool, searchQuery, playerFilters);

  const selectedLeague = editableLeagues.find((league) => league.id === selectedLeagueId) ?? null;
  const selectedClub = editableTeams.find((club) => club.id === selectedClubId) ?? null;
  const selectedGlobalPlayer = marketPool.find((player) => player.id === selectedGlobalPlayerId) ?? null;
  const currentLeague = editableLeagues.find((league) => league.id === payload.team.leagueId) ?? null;
  const availablePlaystyles = playstyleInventoryService.availableItems(state.inventory);
  const primaryColor = state.teamColors?.primaryColor ?? payload.team.primaryColor;
  const secondaryColor = clubVisualService.ensureReadableAccent(state.teamColors?.secondaryColor ?? payload.team.secondaryColor);
  const identityTheme = normalizeClubIdentityTheme(state.clubIdentityTheme, primaryColor, secondaryColor);
  const activeUniformUrl = resolveUniformUrl(state.uniformAssets ?? defaultUniformAssets);
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
      : stadiumsByTeamId[payload.nextFixture.awayTeamId === payload.team.id ? payload.nextFixture.homeTeamId : payload.nextFixture.awayTeamId]?.name ?? `${teamsMap[payload.nextFixture.awayTeamId === payload.team.id ? payload.nextFixture.homeTeamId : payload.nextFixture.awayTeamId]?.shortName ?? "Arena"} Arena`
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
  const shellBackgroundStyle = buildShellBackgroundStyle(backgroundStudio);

  return (
    <main
      className="min-h-screen p-6"
      style={{
        ...shellBackgroundStyle,
        color: identityTheme.textColor,
      }}
    >
      <div className="mx-auto max-w-7xl space-y-4">
        <header className="premium-surface flex flex-wrap gap-2 p-3" style={{ borderColor: identityTheme.borderColor, boxShadow: `0 0 30px ${identityTheme.glowColor}40` }}>
          {topActions.map((action) => (
            <button key={action} onClick={() => setOpenModal(action)} className="premium-control px-3 py-1 text-xs font-semibold" style={{ borderColor: identityTheme.borderColor, color: identityTheme.textColor }}>
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
                homeTeam={teamsMap[payload.nextFixture.homeTeamId]}
                awayTeam={teamsMap[payload.nextFixture.awayTeamId]}
                venue={nextVenue}
                identityTheme={identityTheme}
                nextMatchBackground={{
                  nextMatchBackgroundUrl: backgroundStudio.nextMatchBackgroundUrl,
                  nextMatchOverlay: backgroundStudio.nextMatchOverlay,
                  nextMatchBlur: backgroundStudio.nextMatchBlur,
                  nextMatchGlow: backgroundStudio.nextMatchGlow,
                }}
              />
            ) : null}
            {payload.save.employmentStatus !== "employed" && <SpectatorModeBanner />}
            <div className="rounded-xl border border-emerald-400/50 bg-emerald-500/10 p-3 text-xs text-emerald-100">
              <p>Caixa: ${state.budget.toLocaleString()}</p>
              <p>Folha salarial: ${payroll.toLocaleString()}/rodada</p>
              <p>Atletas listados: {listedPlayers.length}</p>
            </div>
            {payload.nextFixture && (
              <button onClick={() => setOpenModal("Next Match Setup")} className="block w-full rounded-xl border border-cyan-300/60 bg-cyan-500/20 px-4 py-3 text-center text-sm font-bold text-cyan-100 transition hover:-translate-y-0.5 hover:shadow-[0_0_22px_rgba(34,211,238,.42)]">
                {payload.save.employmentStatus === "employed" ? "Configurar tática e iniciar jogo" : "Configurar e acompanhar rodada"}
              </button>
            )}
          </div>

          <SectionCard title="Elenco Principal" subtitle="Hub de gestão do save" className="lg:col-span-3">
            <div className="premium-surface mb-3 grid gap-3 p-3 md:grid-cols-[120px,1fr]">
              <div className="relative h-24 overflow-hidden rounded-2xl border border-cyan-300/45 bg-slate-900/70">
                {activeUniformUrl ? <Image src={activeUniformUrl} alt="Uniforme ativo" fill className="object-cover" /> : <div className="flex h-full items-center justify-center text-[11px] font-bold uppercase tracking-[0.18em] text-slate-300">No Uniform</div>}
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-cyan-200">Club Squad Identity</p>
                <p className="text-sm text-slate-300">Uniforme ativo: <span className="font-bold text-white">{state.uniformAssets.active_uniform_slot.toUpperCase()}</span></p>
                <div className="mt-2 flex gap-2">
                  {(["home", "away", "alternate"] as UniformSlot[]).map((slot) => (
                    <button key={slot} onClick={() => setUniformSlot(slot)} className={`rounded-lg border px-2 py-1 text-[11px] font-bold uppercase ${state.uniformAssets.active_uniform_slot === slot ? "border-cyan-300 bg-cyan-500/30 text-cyan-100" : "border-white/20 bg-slate-900/70 text-slate-300"}`}>{slot}</button>
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-2">
              {mergedPlayers.map((player) => (
                <button key={player.id} onClick={() => setSelectedPlayerId(player.id)} className="premium-surface grid w-full grid-cols-[auto,2fr,repeat(6,minmax(0,1fr))] gap-2 p-2 text-left text-xs text-slate-100 hover:border-cyan-300/60">
                  <div className="relative h-8 w-8 overflow-hidden rounded-full border border-white/20">
                    {player.photoUrl ? <Image src={player.photoUrl} alt={player.name} fill className="object-cover" /> : <span className="flex h-full w-full items-center justify-center bg-slate-800 text-[11px] font-black">{player.name.slice(0, 1)}</span>}
                  </div>
                  <p className="font-semibold" style={{ color: secondaryColor }}>{player.name}</p>
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

      {selectedPlayer && modalShell("Player Detail Modal V3", () => setSelectedPlayerId(null), (
        <div className="space-y-4 text-sm text-slate-100">
          <PlayerHeaderHero player={selectedPlayer} teamName={payload.team.name} />

          <div className="grid gap-3 lg:grid-cols-[1fr,280px]">
            <div className="grid gap-3 lg:grid-cols-2">
              {attributeSections(selectedPlayer).map((section) => (
                <div key={section.label} className="rounded-2xl border border-white/20 bg-slate-900/70 p-3">
                  <CategoryGaugeCard label={section.label} value={section.overall} icon={statIconMap[section.values[0]?.name] ?? "📊"} />
                  <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {section.values.map((item) => <VerticalStatBar key={item.name} name={item.name} value={item.value} />)}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <div className="rounded-2xl border border-white/20 bg-slate-900/80 p-3">
                <p className="font-semibold text-cyan-300">⚙️ Ações de gestão</p>
                <div className="mt-2 flex flex-col gap-2">
                  {!selectedPlayer.isTransferListed ? (
                    <button onClick={() => onListPlayer(selectedPlayer)} className="rounded bg-amber-500 px-2 py-2 text-xs font-bold text-slate-950">Listar no mercado</button>
                  ) : (
                    <button onClick={() => onUnlistPlayer(selectedPlayer)} className="rounded bg-slate-600 px-2 py-2 text-xs font-bold text-white">Deslistar do mercado</button>
                  )}
                  <button onClick={() => onSalaryChange(selectedPlayer, Math.round((selectedPlayer.salary ?? 100000) * 1.1))} className="rounded bg-emerald-500 px-2 py-2 text-xs font-bold text-slate-950">Aumentar salário</button>
                  <button onClick={() => onSalaryChange(selectedPlayer, Math.round((selectedPlayer.salary ?? 100000) * 0.9))} className="rounded bg-rose-500 px-2 py-2 text-xs font-bold text-white">Diminuir salário</button>
                  <button onClick={() => setPlaystyleTargetPlayerId(selectedPlayer.id)} className="rounded bg-cyan-500 px-2 py-2 text-xs font-bold text-slate-950">Inserir Playstyle</button>
                </div>
              </div>

              <div className="rounded-xl border border-white/20 bg-slate-900/80 p-3 text-xs">
                {(() => {
                  const risk = injuryService.estimateRisk({
                    baseInjuryRisk: 0.04,
                    conditioning: selectedPlayer.physicalCondition,
                    stamina: selectedPlayer.attributes.physical.stamina,
                    tacticIntensity: "balanced",
                    contactLevel: 1,
                  });
                  return <p>🧪 Risco de lesão: <b>{(risk.injuryRisk * 100).toFixed(2)}%</b> (fatiga {risk.fatigueModifier.toFixed(2)}x / conditioning {risk.conditioningModifier.toFixed(2)}x)</p>;
                })()}
              </div>
            </div>
          </div>

        </div>
      ))}

      {playstyleTargetPlayerId && modalShell("Playstyle Selection Modal", () => setPlaystyleTargetPlayerId(null), (
        <PlaystyleSelectionModal
          availablePlaystyles={availablePlaystyles}
          playstyleTargetPlayerId={playstyleTargetPlayerId}
          mergedPlayers={mergedPlayers}
          applyPlaystyle={applyPlaystyle}
        />
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

      {openModal === "Comprar Jogador" && modalShell("Transfer Market Modal", () => {
        setOpenModal(null);
        setTransferLeagueId(null);
        setTransferClubId(null);
        setTransferOfferPlayerId(null);
        setTransferOfferValue("");
      }, (
        <div className="space-y-3 text-sm text-slate-100">
          <p className="text-xs text-slate-300">1) Escolha uma liga • 2) Escolha um clube • 3) Envie oferta para um jogador.</p>
          <div className="grid gap-3 lg:grid-cols-[1fr,1fr,1.4fr]">
            <div className="rounded-xl border border-white/15 p-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-cyan-300">Ligas</p>
              <div className="max-h-[55vh] space-y-1 overflow-auto">
                {transferMarketLeagues.map((league) => (
                  <button
                    key={league.id}
                    onClick={() => {
                      setTransferLeagueId(league.id);
                      setTransferClubId(null);
                    }}
                    className={`flex w-full items-center gap-2 rounded border px-2 py-2 text-left ${transferLeagueId === league.id ? "border-cyan-300 bg-cyan-500/15" : "border-white/10 bg-slate-900/40"}`}
                  >
                    <LogoMark logo={league.logoUrl} label={league.name} size={22} />
                    <span>{league.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-white/15 p-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-cyan-300">Clubes</p>
              {!transferLeagueId ? <p className="text-xs text-slate-400">Selecione uma liga.</p> : (
                <div className="max-h-[55vh] space-y-1 overflow-auto">
                  {transferClubsByLeague.map((club) => (
                    <button
                      key={club.id}
                      onClick={() => setTransferClubId(club.id)}
                      className={`flex w-full items-center gap-2 rounded border px-2 py-2 text-left ${transferClubId === club.id ? "border-cyan-300 bg-cyan-500/15" : "border-white/10 bg-slate-900/40"}`}
                    >
                      <LogoMark logo={club.logoUrl} label={club.name} size={22} />
                      <span>{club.shortName}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-xl border border-white/15 p-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-cyan-300">Jogadores do clube</p>
              {!transferClubId ? <p className="text-xs text-slate-400">Selecione um clube para listar jogadores.</p> : (
                <div className="max-h-[55vh] space-y-2 overflow-auto">
                  {transferPlayersByClub.map((player) => (
                    <div key={player.id} className="flex items-center justify-between rounded border border-white/10 p-2">
                      <p>{player.name} • {player.position} • OVR {player.overall}</p>
                      <button
                        onClick={() => {
                          setTransferOfferPlayerId(player.id);
                          setTransferOfferValue(String(Math.round(player.marketValue * 0.95)));
                        }}
                        className="rounded bg-emerald-500 px-2 py-1 text-xs font-bold text-slate-950"
                      >Fazer oferta</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {transferOfferTarget && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/70 p-4">
              <div className="w-full max-w-md rounded-xl border border-white/20 bg-slate-900 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-lg font-black">Fazer oferta por {transferOfferTarget.name}</p>
                  <button className="rounded bg-slate-700 px-2 py-1 text-xs" onClick={() => setTransferOfferPlayerId(null)}>Fechar</button>
                </div>
                <p className="mb-2 text-xs text-slate-300">Clube dono: {teamsMap[transferOfferTarget.teamId]?.name}</p>
                <p className="mb-3 text-xs text-slate-300">Valor de mercado: ${transferOfferTarget.marketValue.toLocaleString()}</p>
                <label className="mb-3 block text-xs">
                  Valor da proposta
                  <input
                    type="number"
                    min={1}
                    value={transferOfferValue}
                    onChange={(event) => setTransferOfferValue(event.target.value)}
                    className="premium-control mt-1 w-full px-3 py-2 text-sm"
                  />
                </label>
                <button
                  onClick={() => {
                    const value = Number(transferOfferValue);
                    if (!Number.isFinite(value) || value <= 0) return;
                    sendTransferOffer(transferOfferTarget, Math.round(value));
                  }}
                  className="w-full rounded bg-emerald-500 px-3 py-2 text-xs font-bold text-slate-950"
                >
                  Enviar proposta ao clube
                </button>
              </div>
            </div>
          )}
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
            <input className="premium-control w-full px-3 py-2 text-sm" placeholder="Buscar por nome" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} />

            {searchTab === "Ligas" && <div className="max-h-[60vh] space-y-1 overflow-auto">{filteredLeagues.map((league) => <button key={league.id} onClick={() => setSelectedLeagueId(league.id)} className="flex w-full items-center gap-2 rounded border border-white/10 p-2 text-left"><LogoMark logo={league.logoUrl} label={league.name} size={24} /><span>{league.name}</span></button>)}</div>}
            {searchTab === "Clubes" && (
              <div className="max-h-[60vh] space-y-2 overflow-auto">
                {filteredClubs.map((club) => (
                  <TeamPremiumTile key={club.id} team={club} isActive={selectedClubId === club.id} onClick={() => setSelectedClubId(club.id)} />
                ))}
              </div>
            )}
            {searchTab === "Jogadores" && (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <input value={playerFilters.position} onChange={(event) => setPlayerFilters((prev) => ({ ...prev, position: event.target.value.toUpperCase() }))} placeholder="Posição (PG)" className="premium-control px-3 py-2 text-xs" />
                  <input type="number" value={playerFilters.minOverall} onChange={(event) => setPlayerFilters((prev) => ({ ...prev, minOverall: Number(event.target.value) }))} placeholder="OVR mín" className="premium-control px-3 py-2 text-xs" />
                </div>
                <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={playerFilters.listedOnly} onChange={(event) => setPlayerFilters((prev) => ({ ...prev, listedOnly: event.target.checked }))} />Somente listados no mercado</label>
                <div className="max-h-[45vh] space-y-1 overflow-auto">{filteredPlayers.map((player) => <button key={player.id} onClick={() => setSelectedGlobalPlayerId(player.id)} className="premium-surface w-full p-2 text-left"><p className="font-semibold">{player.name}</p><p className="text-xs text-slate-300">{player.position} • OVR {player.overall} • {teamsMap[player.teamId]?.shortName}</p></button>)}</div>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-white/20 p-3">
            {searchTab === "Ligas" && selectedLeague && (
              <div className="space-y-2">
                <div className="flex items-center gap-3"><LogoMark logo={selectedLeague.logoUrl} label={selectedLeague.name} size={48} /><div><p className="text-lg font-black">{selectedLeague.name}</p><p>{selectedLeague.country} • {selectedLeague.format}</p></div></div>
                <p>Times: {selectedLeague.teamCount}</p>
                <p>Classificação (top 8):</p>
                {standings.slice(0, 8).map((row) => <p key={row.teamId}>#{row.position} {teamsMap[row.teamId]?.name} ({row.wins}-{row.losses})</p>)}
                <p className="font-semibold">Clubes participantes</p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {editableTeams.filter((team) => team.leagueId === selectedLeague.id).map((team) => (
                    <TeamPremiumTile
                      key={team.id}
                      team={team}
                      onClick={() => {
                        setSearchTab("Clubes");
                        setSelectedClubId(team.id);
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {searchTab === "Clubes" && selectedClub && (
              <div className="space-y-2">
                <div className="flex items-center gap-3"><LogoMark logo={selectedClub.logoUrl} label={selectedClub.name} size={48} /><div><p className="text-lg font-black">{selectedClub.name}</p><p>{leaguesMap[selectedClub.leagueId]?.name}</p></div></div>
                <p>Orçamento: ${selectedClub.budget.toLocaleString()} • Overall: {selectedClub.overall}</p>
                <p>Posição liga: {selectedClub.currentLeaguePosition} • Reputação: {selectedClub.reputationFans}/10</p>
                <p className="font-semibold text-cyan-300">Elenco do clube</p>
                <div className="max-h-[42vh] space-y-2 overflow-auto">{editablePlayers.filter((player) => player.teamId === selectedClub.id).map((player) => (
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
                    <p>{selectedGlobalPlayer.position} • OVR {selectedGlobalPlayer.overall} • {teamsMap[selectedGlobalPlayer.teamId]?.name}</p>
                    <p>Valor: ${(selectedGlobalPlayer.marketValue / 1000000).toFixed(2)}M • Salário: ${(selectedGlobalPlayer.salary ?? 0).toLocaleString()}</p>
                    <p>Moral: {selectedGlobalPlayer.morale ?? "Contente"} • Mercado: {selectedGlobalPlayer.isTransferListed ? "Listado" : "Não listado"}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    const offerValue = Math.round(selectedGlobalPlayer.marketValue * 0.98);
                    sendTransferOffer(selectedGlobalPlayer, offerValue);
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

      {openModal === "Editar Clubes/Ligas/Jogadores" && modalShell("Editor Mestre de Dados", () => setOpenModal(null), (
        <div className="space-y-4 text-sm text-slate-100">
          <div className="flex flex-wrap gap-2">
            {(["Ligas", "Clubes", "Jogadores", "Novo Time"] as const).map((tab) => (
              <button key={tab} onClick={() => setEditorTab(tab)} className={`premium-control px-3 py-1 text-xs ${editorTab === tab ? "border-fuchsia-400 bg-fuchsia-600/40" : ""}`}>{tab}</button>
            ))}
          </div>

          {editorTab === "Ligas" && (
            <div className="space-y-2">
              {editableLeagues.map((league) => (
                <div key={league.id} className="premium-surface grid gap-2 p-3 md:grid-cols-4">
                  <input className="premium-control px-3 py-2 text-xs" value={league.name} onChange={(event) => setEditableLeagues((prev) => prev.map((item) => item.id === league.id ? { ...item, name: event.target.value } : item))} />
                  <input className="premium-control px-3 py-2 text-xs" value={league.country} onChange={(event) => setEditableLeagues((prev) => prev.map((item) => item.id === league.id ? { ...item, country: event.target.value } : item))} />
                  <input className="premium-control px-3 py-2 text-xs" value={league.format} onChange={(event) => setEditableLeagues((prev) => prev.map((item) => item.id === league.id ? { ...item, format: event.target.value } : item))} />
                  <input className="premium-control px-3 py-2 text-xs" type="number" value={league.teamCount} onChange={(event) => setEditableLeagues((prev) => prev.map((item) => item.id === league.id ? { ...item, teamCount: Number(event.target.value) } : item))} />
                </div>
              ))}
            </div>
          )}

          {editorTab === "Clubes" && (
            <div className="space-y-2">
              {editableTeams.map((team) => (
                <div key={team.id} className="premium-surface grid gap-2 p-3 md:grid-cols-5">
                  <input className="premium-control px-3 py-2 text-xs" value={team.name} onChange={(event) => setEditableTeams((prev) => prev.map((item) => item.id === team.id ? { ...item, name: event.target.value } : item))} />
                  <input className="premium-control px-3 py-2 text-xs" value={team.shortName} onChange={(event) => setEditableTeams((prev) => prev.map((item) => item.id === team.id ? { ...item, shortName: event.target.value } : item))} />
                  <input className="premium-control px-3 py-2 text-xs" type="number" value={team.overall} onChange={(event) => setEditableTeams((prev) => prev.map((item) => item.id === team.id ? { ...item, overall: Number(event.target.value) } : item))} />
                  <input className="premium-control h-9 px-2 py-1 text-xs" type="color" value={team.primaryColor} onChange={(event) => setEditableTeams((prev) => prev.map((item) => item.id === team.id ? { ...item, primaryColor: event.target.value } : item))} />
                  <input className="premium-control h-9 px-2 py-1 text-xs" type="color" value={team.secondaryColor} onChange={(event) => setEditableTeams((prev) => prev.map((item) => item.id === team.id ? { ...item, secondaryColor: event.target.value } : item))} />
                </div>
              ))}
            </div>
          )}

          {editorTab === "Jogadores" && (
            <div className="space-y-2">
              {editablePlayers.slice(0, 60).map((player) => (
                <div key={player.id} className="premium-surface grid gap-2 p-3 md:grid-cols-6">
                  <input className="premium-control px-3 py-2 text-xs" value={player.name} onChange={(event) => setEditablePlayers((prev) => prev.map((item) => item.id === player.id ? { ...item, name: event.target.value } : item))} />
                  <input className="premium-control px-3 py-2 text-xs" value={player.photoUrl ?? ""} placeholder="URL da foto" onChange={(event) => setEditablePlayers((prev) => prev.map((item) => item.id === player.id ? { ...item, photoUrl: event.target.value } : item))} />
                  <select className="premium-control px-3 py-2 text-xs" value={player.position} onChange={(event) => setEditablePlayers((prev) => prev.map((item) => item.id === player.id ? { ...item, position: event.target.value as Player["position"] } : item))}>
                    {(["PG", "SG", "SF", "PF", "C"] as const).map((position) => <option key={position} value={position}>{position}</option>)}
                  </select>
                  <input className="premium-control px-3 py-2 text-xs" type="number" value={player.overall} onChange={(event) => setEditablePlayers((prev) => prev.map((item) => item.id === player.id ? { ...item, overall: Number(event.target.value) } : item))} />
                  <input className="premium-control px-3 py-2 text-xs" type="number" value={player.age} onChange={(event) => setEditablePlayers((prev) => prev.map((item) => item.id === player.id ? { ...item, age: Number(event.target.value) } : item))} />
                  <input className="premium-control px-3 py-2 text-xs" type="number" value={player.marketValue} onChange={(event) => setEditablePlayers((prev) => prev.map((item) => item.id === player.id ? { ...item, marketValue: Number(event.target.value) } : item))} />
                </div>
              ))}
            </div>
          )}

          {editorTab === "Novo Time" && (
            <div className="premium-surface space-y-3 p-3">
              <p className="font-semibold text-cyan-300">Adicionar novo time customizado</p>
              <div className="grid gap-2 md:grid-cols-3">
                <select className="premium-control px-3 py-2 text-xs" value={newTeamDraft.leagueId} onChange={(event) => setNewTeamDraft((prev) => ({ ...prev, leagueId: event.target.value }))}>
                  {editableLeagues.map((league) => <option key={league.id} value={league.id}>{league.name}</option>)}
                </select>
                <input className="premium-control px-3 py-2 text-xs" placeholder="Nome do time" value={newTeamDraft.name} onChange={(event) => setNewTeamDraft((prev) => ({ ...prev, name: event.target.value }))} />
                <input className="premium-control px-3 py-2 text-xs" placeholder="Sigla" value={newTeamDraft.shortName} onChange={(event) => setNewTeamDraft((prev) => ({ ...prev, shortName: event.target.value }))} />
              </div>
              <div className="grid gap-2 md:grid-cols-2">
                <label className="premium-label">Cor primária<input className="premium-control ml-2 h-9 w-full px-2 py-1" type="color" value={newTeamDraft.primaryColor} onChange={(event) => setNewTeamDraft((prev) => ({ ...prev, primaryColor: event.target.value }))} /></label>
                <label className="premium-label">Cor secundária<input className="premium-control ml-2 h-9 w-full px-2 py-1" type="color" value={newTeamDraft.secondaryColor} onChange={(event) => setNewTeamDraft((prev) => ({ ...prev, secondaryColor: event.target.value }))} /></label>
              </div>
              <div className="space-y-2">
                {newTeamDraft.players.map((player, idx) => (
                  <div key={`${idx}-${player.position}`} className="grid gap-2 md:grid-cols-3">
                    <input className="premium-control px-3 py-2 text-xs" value={player.name} onChange={(event) => setNewTeamDraft((prev) => ({ ...prev, players: prev.players.map((entry, entryIdx) => entryIdx === idx ? { ...entry, name: event.target.value } : entry) }))} />
                    <select className="premium-control px-3 py-2 text-xs" value={player.position} onChange={(event) => setNewTeamDraft((prev) => ({ ...prev, players: prev.players.map((entry, entryIdx) => entryIdx === idx ? { ...entry, position: event.target.value as Player["position"] } : entry) }))}>
                      {(["PG", "SG", "SF", "PF", "C"] as const).map((position) => <option key={position} value={position}>{position}</option>)}
                    </select>
                    <input className="premium-control px-3 py-2 text-xs" type="number" value={player.overall} onChange={(event) => setNewTeamDraft((prev) => ({ ...prev, players: prev.players.map((entry, entryIdx) => entryIdx === idx ? { ...entry, overall: Number(event.target.value) } : entry) }))} />
                  </div>
                ))}
              </div>
              <button onClick={addCustomTeam} className="premium-control bg-cyan-500/40 px-4 py-2 text-xs font-bold">Adicionar time</button>
            </div>
          )}
        </div>
      ))}

      {openModal === "Identidade do Clube" && modalShell("Identidade do Clube • Tema interno da UI", () => setOpenModal(null), (
        <div className="space-y-4 text-sm text-slate-100">
          <div className="rounded-xl border border-cyan-300/35 bg-cyan-500/10 p-3">
            <p className="text-xs uppercase tracking-[0.18em] text-cyan-200">Identidade do Clube</p>
            <p className="mt-1 text-sm text-cyan-100">Este editor altera o tema interno: textos, bordas, cards, modais, botões e acentos glow.</p>
            <p className="text-xs text-cyan-100/80">Não altera wallpaper da página. O fundo da view e do Next Match é editado apenas no Background Studio.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="premium-surface p-3">
              <p className="mb-2 text-xs uppercase text-slate-300">Primary Color</p>
              <input type="color" value={colorDraft.primaryColor} onChange={(event) => setColorDraft((prev) => ({ ...prev, primaryColor: event.target.value }))} className="premium-control h-10 w-full cursor-pointer rounded" />
            </label>
            <label className="premium-surface p-3">
              <p className="mb-2 text-xs uppercase text-slate-300">Secondary Color</p>
              <input type="color" value={colorDraft.secondaryColor} onChange={(event) => setColorDraft((prev) => ({ ...prev, secondaryColor: event.target.value }))} className="premium-control h-10 w-full cursor-pointer rounded" />
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="premium-surface p-3">
              <p className="mb-2 text-xs uppercase text-slate-300">Text Color</p>
              <input type="color" value={state.clubIdentityTheme.textColor} onChange={(event) => updateState((prev) => ({ ...prev, clubIdentityTheme: { ...prev.clubIdentityTheme, textColor: event.target.value } }))} className="premium-control h-10 w-full cursor-pointer rounded" />
            </label>
            <label className="premium-surface p-3">
              <p className="mb-2 text-xs uppercase text-slate-300">Border/Glow Accent</p>
              <input type="color" value={state.clubIdentityTheme.glowColor} onChange={(event) => updateState((prev) => ({ ...prev, clubIdentityTheme: { ...prev.clubIdentityTheme, glowColor: event.target.value, borderColor: `${event.target.value}66` } }))} className="premium-control h-10 w-full cursor-pointer rounded" />
            </label>
          </div>

          <div className="premium-surface space-y-3 p-3">
            <p className="text-xs uppercase tracking-[0.18em] text-cyan-200">Uniform manager 2D</p>
            <div className="grid gap-2 sm:grid-cols-3">
              {(["home", "away", "alternate"] as UniformSlot[]).map((slot) => {
                const slotUrl = slot === "home" ? state.uniformAssets.home_uniform_2d_url : slot === "away" ? state.uniformAssets.away_uniform_2d_url : state.uniformAssets.alternate_uniform_2d_url;
                return (
                  <button key={slot} onClick={() => setUniformSlot(slot)} className={`rounded-2xl border p-2 text-left transition ${state.uniformAssets.active_uniform_slot === slot ? "border-cyan-300 bg-cyan-500/20 shadow-[0_0_26px_rgba(34,211,238,.28)]" : "border-white/15 bg-slate-900/60"}`}>
                    <p className="text-[11px] font-black uppercase tracking-[0.15em] text-cyan-100">{slot}</p>
                    <div className="relative mt-2 h-24 overflow-hidden rounded-xl border border-white/10 bg-slate-900/70">
                      {slotUrl ? <Image src={slotUrl} alt={`${slot} uniform`} fill className="object-cover" /> : <div className="flex h-full items-center justify-center text-[10px] uppercase text-slate-400">fallback kit</div>}
                    </div>
                  </button>
                );
              })}
            </div>
            <label className="block">
              <span className="premium-label">Upload para slot ativo</span>
              <input
                type="file"
                accept="image/*"
                className="mt-1 w-full rounded-xl border border-cyan-300/35 bg-slate-900/70 p-2 text-xs"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () => setUniformAsset(state.uniformAssets.active_uniform_slot, String(reader.result ?? ""));
                  reader.readAsDataURL(file);
                }}
              />
            </label>
          </div>

          <div className="rounded-2xl border p-4" style={{ borderColor: identityTheme.borderColor, backgroundImage: `linear-gradient(135deg, ${colorDraft.primaryColor}dd, #0f172acc)` }}>
            <p className="text-xs uppercase tracking-widest text-slate-100">Club Identity Preview</p>
            <p className="text-lg font-black" style={{ color: clubVisualService.ensureReadableAccent(colorDraft.secondaryColor) }}>Sample Title • {payload.team.name}</p>
            <div className="mt-2 rounded-xl border p-3" style={{ borderColor: identityTheme.borderColor, backgroundColor: "rgba(15,23,42,0.72)" }}>
              <p className="text-xs text-slate-200">Sample Card Surface + Border</p>
              <button className="mt-2 rounded-lg border px-3 py-1 text-xs font-bold" style={{ borderColor: identityTheme.borderColor, color: identityTheme.textColor, boxShadow: `0 0 20px ${identityTheme.glowColor}55` }}>Sample Button</button>
            </div>
            <div className="mt-2 rounded-xl border p-3" style={{ borderColor: identityTheme.borderColor, backgroundColor: "rgba(2,6,23,0.88)" }}>
              <p className="text-xs text-slate-300">Sample Modal/Internal Surface</p>
              <div className="mt-2 border-t pt-2 text-xs text-slate-300" style={{ borderColor: identityTheme.borderColor }}>Sample table/list row accent line</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button onClick={() => setColorDraft({ primaryColor: payload.team.primaryColor, secondaryColor: payload.team.secondaryColor })} className="rounded bg-slate-700 px-3 py-1 text-xs font-semibold">Restaurar padrão</button>
            <button onClick={() => setOpenModal(null)} className="rounded bg-slate-700 px-3 py-1 text-xs font-semibold">Cancelar</button>
            <button onClick={saveTeamColors} className="rounded bg-emerald-500 px-3 py-1 text-xs font-bold text-slate-950">Salvar cores</button>
          </div>
        </div>
      ))}

      {openModal === "Next Match Setup" && payload.nextFixture && modalShell("Next Match Tactical Setup", () => setOpenModal(null), (
        <div className="space-y-4 text-sm text-slate-100">
          <p className="text-slate-300">Defina o plano tático antes do início do jogo. Este preset guiará o posicionamento no mini-campo.</p>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="space-y-1">
              <span className="premium-label">Formação</span>
              <select value={state.preMatchTactic.formation} onChange={(event) => updateState((prev) => ({ ...prev, preMatchTactic: { ...prev.preMatchTactic, formation: event.target.value as TacticalPreset["formation"] } }))} className="w-full rounded-xl border border-cyan-300/30 bg-slate-900/70 px-3 py-2">
                {(["4-4-2", "4-3-3", "3-5-2", "5-3-2", "4-2-3-1", "4-1-4-1"] as const).map((formation) => <option key={formation} value={formation}>{formation}</option>)}
              </select>
            </label>
            <label className="space-y-1">
              <span className="premium-label">Estilo tático</span>
              <select value={state.preMatchTactic.style} onChange={(event) => updateState((prev) => ({ ...prev, preMatchTactic: { ...prev.preMatchTactic, style: event.target.value as TacticalPreset["style"] } }))} className="w-full rounded-xl border border-cyan-300/30 bg-slate-900/70 px-3 py-2">
                {(["balanced", "offensive_press", "defensive_block", "counter_attack", "possession_control", "fast_transition", "wing_play"] as const).map((style) => <option key={style} value={style}>{style.replaceAll("_", " ")}</option>)}
              </select>
            </label>
          </div>
          <div className="grid gap-2 md:grid-cols-3">
            {[
              { key: "pressure", values: ["low", "medium", "high"] },
              { key: "buildUp", values: ["direct", "mixed", "possession"] },
              { key: "defensiveLine", values: ["deep", "standard", "high"] },
              { key: "transitionSpeed", values: ["slow", "balanced", "quick"] },
              { key: "width", values: ["narrow", "balanced", "wide"] },
              { key: "tempo", values: ["calm", "normal", "high"] },
            ].map((entry) => (
              <label key={entry.key} className="space-y-1">
                <span className="premium-label">{entry.key}</span>
                <select
                  value={state.preMatchTactic[entry.key as keyof TacticalPreset] as string}
                  onChange={(event) => updateState((prev) => ({ ...prev, preMatchTactic: { ...prev.preMatchTactic, [entry.key]: event.target.value } as TacticalPreset }))}
                  className="w-full rounded-xl border border-cyan-300/30 bg-slate-900/70 px-3 py-2"
                >
                  {entry.values.map((value) => <option key={value} value={value}>{value}</option>)}
                </select>
              </label>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              className="rounded-xl border border-cyan-300/50 bg-cyan-500/25 px-4 py-2 text-xs font-bold text-cyan-100"
              onClick={() => {
                writePreMatchTactic(payload.save.id, state.preMatchTactic);
                writeClubUniforms(payload.save.id, state.uniformAssets);
                window.location.href = `/match-board?saveId=${payload.save.id}`;
              }}
            >
              Salvar plano e iniciar partida
            </button>
            <button onClick={() => setOpenModal(null)} className="rounded-xl border border-white/20 bg-slate-800 px-4 py-2 text-xs">Cancelar</button>
          </div>
        </div>
      ))}

      {openModal === "Campeões" && modalShell("Champions History Modal", () => setOpenModal(null), (
        <div className="space-y-2 text-sm text-slate-100">
          {champions.map((ch) => <p key={ch.id}>Temporada {ch.season}: {teamsMap[ch.championTeamId]?.name ?? ch.championTeamId}</p>)}
        </div>
      ))}

      {openModal === "Classificações" && modalShell("Classificações", () => setOpenModal(null), (
        <StandingsTable
          rows={standings}
          teamsById={teamsMap}
          playoffSpots={8}
          dangerSpots={3}
          highlightTeamId={payload.team.id}
          leagueName={currentLeague?.name}
          leagueLogo={currentLeague?.logoUrl}
          players={allPlayers}
          seasonEntries={payload.seasonCalendar?.entries ?? []}
          stadiumsByTeamId={stadiumsByTeamId}
        />
      ))}

      {openModal === "Calendário" && modalShell("Calendário", () => setOpenModal(null), (
        <div className="space-y-1 text-sm text-slate-100">{(payload.seasonCalendar?.entries ?? []).map((entry) => <p key={entry.fixtureId}>R{entry.round} • {teamsMap[entry.homeTeamId]?.shortName} vs {teamsMap[entry.awayTeamId]?.shortName}</p>)}</div>
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
