import {
  ClubVisual,
  Fixture,
  League,
  LeagueChampionHistory,
  Player,
  Stadium,
  StandingRow,
  Team,
  Uniform,
  User,
  UserSave,
} from "@/types/game";
import { calculateMacroRatings, calculateOverallRating, PlayerAttributes } from "@/lib/playerRatings";

export const mockLeagues: League[] = [
  { id: "lg-nba", name: "North Atlantic Basketball League", country: "USA", format: "Regular Season + Playoffs", teamCount: 20, season: "2026", logoUrl: "🏀" },
  { id: "lg-latam", name: "Liga Continental LATAM", country: "Brazil", format: "Double Round Robin", teamCount: 6, season: "2026", logoUrl: "🌎" },
  { id: "lg-euro", name: "Euro Elite Cup", country: "Spain", format: "Group + Knockout", teamCount: 6, season: "2026", logoUrl: "⭐" },
];

const nbaConfigs = [
  ["t-wolves", "Seattle Wolves", "WOL", "🐺", "#1d4ed8", "#111827", 84],
  ["t-sharks", "San Diego Sharks", "SHK", "🦈", "#0f766e", "#06202a", 81],
  ["t-ravens", "Austin Ravens", "RAV", "🦅", "#7c3aed", "#312e81", 80],
  ["t-titans", "Chicago Titans", "TTN", "🛡️", "#ef4444", "#450a0a", 82],
  ["t-hawks", "Atlanta Hawksmen", "HWK", "🦉", "#ea580c", "#7c2d12", 79],
  ["t-pythons", "Miami Pythons", "PYT", "🐍", "#16a34a", "#14532d", 78],
  ["t-kings", "Sacramento Kingsmen", "KNG", "👑", "#6d28d9", "#2e1065", 83],
  ["t-riders", "Denver Riders", "RDR", "🐎", "#0284c7", "#082f49", 80],
  ["t-comets", "Houston Comets", "CMT", "☄️", "#dc2626", "#7f1d1d", 81],
  ["t-giants", "New York Giants Hoops", "GNT", "🗽", "#2563eb", "#0f172a", 82],
  ["t-bulls", "Dallas Bulls", "BUL", "🐂", "#b91c1c", "#450a0a", 79],
  ["t-knights", "Detroit Knights", "KNI", "🛡️", "#4f46e5", "#1e1b4b", 78],
  ["t-foxes", "Portland Foxes", "FOX", "🦊", "#f97316", "#7c2d12", 77],
  ["t-storm", "Orlando Storm", "STM", "⛈️", "#0ea5e9", "#0c4a6e", 80],
  ["t-vipers", "Phoenix Vipers", "VIP", "🐉", "#059669", "#064e3b", 81],
  ["t-trail", "Utah Trailblaze", "TRL", "🏔️", "#0891b2", "#164e63", 76],
  ["t-horizon", "LA Horizon", "HRZ", "🌅", "#c026d3", "#701a75", 82],
  ["t-guard", "Boston Guardians", "GRD", "🛡️", "#1e40af", "#172554", 83],
  ["t-rhythm", "Memphis Rhythm", "RHY", "🎵", "#9333ea", "#3b0764", 77],
  ["t-flames", "Cleveland Flames", "FLM", "🔥", "#dc2626", "#450a0a", 78],
] as const;

const toTeam = (row: (typeof nbaConfigs)[number]): Team => ({
  id: row[0], leagueId: "lg-nba", name: row[1], shortName: row[2], logoUrl: row[3], overall: row[6], attackOverall: row[6], defenseOverall: row[6] - 1,
  physicality: row[6] - 2, budget: 95000000, stadiumId: `st-${row[0]}`, managerDefaultName: "AI Coach", reputationBoard: 70, reputationFans: 70, currentLeaguePosition: 10,
  primaryColor: row[4], secondaryColor: row[5], visualId: `v-${row[0]}`, uniformIds: [`u-${row[0]}-home`, `u-${row[0]}-away`], summary: "Equipe competitiva com rotação sólida.",
});

export const mockTeams: Team[] = [
  ...nbaConfigs.map(toTeam),
  { id: "t-falcons", leagueId: "lg-latam", name: "Rio Falcons", shortName: "RFC", logoUrl: "🦅", overall: 79, attackOverall: 80, defenseOverall: 77, physicality: 81, budget: 61000000, stadiumId: "st-falcons", managerDefaultName: "Rafa Souza", reputationBoard: 71, reputationFans: 83, currentLeaguePosition: 2, primaryColor: "#f97316", secondaryColor: "#7c2d12", visualId: "v-falcons", uniformIds: ["u-falcons-home", "u-falcons-away"], summary: "Clube com torcida quente e transição mortal." },
  { id: "t-jaguars", leagueId: "lg-latam", name: "São Paulo Jaguars", shortName: "SPJ", logoUrl: "🐆", overall: 77, attackOverall: 76, defenseOverall: 78, physicality: 80, budget: 55000000, stadiumId: "st-jaguars", managerDefaultName: "Livia Rocha", reputationBoard: 64, reputationFans: 68, currentLeaguePosition: 4, primaryColor: "#22c55e", secondaryColor: "#14532d", visualId: "v-jaguars", uniformIds: ["u-jaguars-home", "u-jaguars-away"], summary: "Equipe equilibrada com foco em rotação profunda." },
  { id: "t-royals", leagueId: "lg-euro", name: "Madrid Royals", shortName: "MDR", logoUrl: "👑", overall: 86, attackOverall: 87, defenseOverall: 84, physicality: 82, budget: 152000000, stadiumId: "st-royals", managerDefaultName: "Daniel Vega", reputationBoard: 88, reputationFans: 91, currentLeaguePosition: 1, primaryColor: "#7c3aed", secondaryColor: "#2e1065", visualId: "v-royals", uniformIds: ["u-royals-home", "u-royals-away"], summary: "Favorito ao título com elenco técnico e profundo." },
  { id: "t-blaze", leagueId: "lg-euro", name: "Berlin Blaze", shortName: "BLZ", logoUrl: "🔥", overall: 80, attackOverall: 79, defenseOverall: 81, physicality: 83, budget: 76000000, stadiumId: "st-blaze", managerDefaultName: "Jonas Kruger", reputationBoard: 73, reputationFans: 76, currentLeaguePosition: 3, primaryColor: "#ef4444", secondaryColor: "#450a0a", visualId: "v-blaze", uniformIds: ["u-blaze-home", "u-blaze-away"], summary: "Defesa intensa e jogo coletivo disciplinado." },
];

const archetypeAttributes: Record<string, PlayerAttributes> = {
  elite_point_guard_playmaker: {
    pace: { speed: 88, acceleration: 91, agility: 90, reaction_time: 88, off_ball_movement: 84 },
    dribbling: { ball_control: 92, handle_creativity: 91, tight_dribble: 90, change_of_pace_control: 93, drive_control: 86 },
    passing: { passing_accuracy: 93, passing_speed: 90, court_vision: 95, decision_making: 91, playmaking_iq: 94 },
    shooting: { close_shot: 76, mid_range_shot: 80, three_point_shot: 78, free_throw: 84, shot_release_timing: 82, shot_under_pressure: 79 },
    defending: { on_ball_defense: 76, perimeter_defense: 78, interior_defense: 55, steal_ability: 81, block_ability: 42, defensive_awareness: 80 },
    physical: { strength: 62, vertical: 73, stamina: 90, durability: 82, balance: 84, body_control: 86 },
    mental_intangibles: { clutch_factor: 84, consistency: 86, confidence: 88, leadership: 90, game_iq: 93 },
  },
  scoring_shooting_guard: {
    pace: { speed: 85, acceleration: 87, agility: 86, reaction_time: 83, off_ball_movement: 88 },
    dribbling: { ball_control: 87, handle_creativity: 85, tight_dribble: 84, change_of_pace_control: 86, drive_control: 85 },
    passing: { passing_accuracy: 74, passing_speed: 75, court_vision: 73, decision_making: 76, playmaking_iq: 74 },
    shooting: { close_shot: 84, mid_range_shot: 90, three_point_shot: 89, free_throw: 88, shot_release_timing: 91, shot_under_pressure: 88 },
    defending: { on_ball_defense: 71, perimeter_defense: 74, interior_defense: 52, steal_ability: 72, block_ability: 40, defensive_awareness: 70 },
    physical: { strength: 68, vertical: 78, stamina: 86, durability: 80, balance: 79, body_control: 84 },
    mental_intangibles: { clutch_factor: 89, consistency: 84, confidence: 90, leadership: 74, game_iq: 82 },
  },
  three_and_d_wing: {
    pace: { speed: 82, acceleration: 80, agility: 81, reaction_time: 82, off_ball_movement: 84 },
    dribbling: { ball_control: 74, handle_creativity: 68, tight_dribble: 73, change_of_pace_control: 72, drive_control: 74 },
    passing: { passing_accuracy: 76, passing_speed: 75, court_vision: 74, decision_making: 80, playmaking_iq: 78 },
    shooting: { close_shot: 75, mid_range_shot: 79, three_point_shot: 87, free_throw: 82, shot_release_timing: 85, shot_under_pressure: 82 },
    defending: { on_ball_defense: 87, perimeter_defense: 90, interior_defense: 74, steal_ability: 83, block_ability: 71, defensive_awareness: 88 },
    physical: { strength: 82, vertical: 80, stamina: 88, durability: 85, balance: 83, body_control: 82 },
    mental_intangibles: { clutch_factor: 79, consistency: 88, confidence: 81, leadership: 77, game_iq: 86 },
  },
  rim_protecting_center: {
    pace: { speed: 66, acceleration: 69, agility: 64, reaction_time: 76, off_ball_movement: 70 },
    dribbling: { ball_control: 58, handle_creativity: 45, tight_dribble: 56, change_of_pace_control: 52, drive_control: 60 },
    passing: { passing_accuracy: 70, passing_speed: 66, court_vision: 72, decision_making: 76, playmaking_iq: 74 },
    shooting: { close_shot: 86, mid_range_shot: 68, three_point_shot: 44, free_throw: 67, shot_release_timing: 70, shot_under_pressure: 76 },
    defending: { on_ball_defense: 78, perimeter_defense: 67, interior_defense: 92, steal_ability: 65, block_ability: 94, defensive_awareness: 89 },
    physical: { strength: 92, vertical: 88, stamina: 82, durability: 88, balance: 86, body_control: 84 },
    mental_intangibles: { clutch_factor: 80, consistency: 86, confidence: 78, leadership: 82, game_iq: 85 },
  },
  athletic_slasher_forward: {
    pace: { speed: 87, acceleration: 89, agility: 84, reaction_time: 80, off_ball_movement: 83 },
    dribbling: { ball_control: 80, handle_creativity: 79, tight_dribble: 78, change_of_pace_control: 85, drive_control: 89 },
    passing: { passing_accuracy: 73, passing_speed: 74, court_vision: 72, decision_making: 74, playmaking_iq: 73 },
    shooting: { close_shot: 88, mid_range_shot: 75, three_point_shot: 69, free_throw: 72, shot_release_timing: 74, shot_under_pressure: 78 },
    defending: { on_ball_defense: 79, perimeter_defense: 78, interior_defense: 76, steal_ability: 77, block_ability: 80, defensive_awareness: 79 },
    physical: { strength: 84, vertical: 92, stamina: 86, durability: 82, balance: 81, body_control: 86 },
    mental_intangibles: { clutch_factor: 77, consistency: 74, confidence: 84, leadership: 73, game_iq: 78 },
  },
  balanced_all_around: {
    pace: { speed: 80, acceleration: 80, agility: 79, reaction_time: 81, off_ball_movement: 80 },
    dribbling: { ball_control: 78, handle_creativity: 76, tight_dribble: 77, change_of_pace_control: 78, drive_control: 77 },
    passing: { passing_accuracy: 80, passing_speed: 78, court_vision: 81, decision_making: 82, playmaking_iq: 82 },
    shooting: { close_shot: 80, mid_range_shot: 80, three_point_shot: 78, free_throw: 79, shot_release_timing: 79, shot_under_pressure: 80 },
    defending: { on_ball_defense: 80, perimeter_defense: 80, interior_defense: 79, steal_ability: 79, block_ability: 76, defensive_awareness: 82 },
    physical: { strength: 80, vertical: 80, stamina: 82, durability: 82, balance: 81, body_control: 82 },
    mental_intangibles: { clutch_factor: 80, consistency: 83, confidence: 81, leadership: 81, game_iq: 84 },
  },
};

const makePlayer = (base: Omit<Player, "overall" | "macroRatings" | "attributes"> & { attributes: PlayerAttributes }): Player => {
  const macroRatings = calculateMacroRatings(base.attributes);
  return {
    ...base,
    macroRatings,
    overall: calculateOverallRating(base.attributes, base.position),
  };
};

const createPlayers = (teamId: string, prefix: string): Player[] => [
  makePlayer({ id: `${teamId}-p1`, teamId, name: `${prefix} Grant`, age: 24, position: "PG", marketValue: 11000000, physicalCondition: 92, attributes: archetypeAttributes.elite_point_guard_playmaker, playstyles: ["Floor General"], isStarter: true, isBench: false }),
  makePlayer({ id: `${teamId}-p2`, teamId, name: `${prefix} Reed`, age: 26, position: "SG", marketValue: 14000000, physicalCondition: 89, attributes: archetypeAttributes.scoring_shooting_guard, playstyles: ["Catch & Shoot"], isStarter: true, isBench: false }),
  makePlayer({ id: `${teamId}-p3`, teamId, name: `${prefix} Miles`, age: 27, position: "SF", marketValue: 17000000, physicalCondition: 88, attributes: archetypeAttributes.three_and_d_wing, playstyles: ["Two-way Wing"], isStarter: true, isBench: false }),
  makePlayer({ id: `${teamId}-p4`, teamId, name: `${prefix} Coleman`, age: 29, position: "PF", marketValue: 16000000, physicalCondition: 86, attributes: archetypeAttributes.athletic_slasher_forward, playstyles: ["Post Defender"], isStarter: true, isBench: false }),
  makePlayer({ id: `${teamId}-p5`, teamId, name: `${prefix} Stone`, age: 30, position: "C", marketValue: 18000000, physicalCondition: 87, attributes: archetypeAttributes.rim_protecting_center, playstyles: ["Rim Protector"], isStarter: true, isBench: false }),
  makePlayer({ id: `${teamId}-p6`, teamId, name: `${prefix} Young`, age: 22, position: "PG", marketValue: 6000000, physicalCondition: 94, attributes: archetypeAttributes.elite_point_guard_playmaker, playstyles: ["Spark Plug"], isStarter: false, isBench: true }),
  makePlayer({ id: `${teamId}-p7`, teamId, name: `${prefix} Brooks`, age: 25, position: "SG", marketValue: 5200000, physicalCondition: 91, attributes: archetypeAttributes.scoring_shooting_guard, playstyles: ["Microwave Scorer"], isStarter: false, isBench: true }),
  makePlayer({ id: `${teamId}-p8`, teamId, name: `${prefix} Silva`, age: 23, position: "SF", marketValue: 4800000, physicalCondition: 93, attributes: archetypeAttributes.balanced_all_around, playstyles: ["Hustle"], isStarter: false, isBench: true }),
];

export const mockPlayers: Player[] = mockTeams.flatMap((team) => createPlayers(team.id, team.shortName));
export const enrichedMockPlayers: Player[] = mockPlayers.map((player) => ({
  ...player,
  salary: Math.round(player.marketValue * 0.0065),
  morale: "Contente",
  injuryStatus: "Disponível",
  injuryRecoveryRounds: 0,
  transferStatus: "not_listed",
  isTransferListed: false,
}));

export const mockUsers: User[] = [{ id: "u-1", displayName: "Coach Demo", email: "coach@scores.gg", createdAt: "2026-01-10T10:00:00.000Z" }];

export const mockUserSaves: UserSave[] = [
  { id: "save-001", saveName: "Dinastia Wolves", userId: "u-1", leagueId: "lg-nba", teamId: "t-wolves", managerName: "Coach Demo", currentRound: 8, currentSeason: "2026", createdAt: "2026-01-12T09:00:00.000Z", updatedAt: "2026-03-30T20:45:00.000Z", nextFixtureId: "fx-3", budgetSnapshot: 121000000, boardReputation: 8, fansReputation: 8, roundsUnderCriticalBoard: 0, roundsUnderCriticalFans: 0, roundsUnderCriticalCombined: 0, isEmployed: true, employmentStatus: "employed", currentClubId: "t-wolves", dismissalCount: 0 },
  { id: "save-002", saveName: "Rumo ao Título LATAM", userId: "u-1", leagueId: "lg-latam", teamId: "t-falcons", managerName: "Rafa Manager", currentRound: 12, currentSeason: "2026", createdAt: "2026-02-10T12:00:00.000Z", updatedAt: "2026-04-01T13:20:00.000Z", nextFixtureId: "fx-2", budgetSnapshot: 58700000, boardReputation: 7, fansReputation: 9, roundsUnderCriticalBoard: 0, roundsUnderCriticalFans: 0, roundsUnderCriticalCombined: 0, isEmployed: true, employmentStatus: "employed", currentClubId: "t-falcons", dismissalCount: 0 },
  { id: "save-003", saveName: "Euro Royal Project", userId: "u-1", leagueId: "lg-euro", teamId: "t-royals", managerName: "Dynasty Boss", currentRound: 5, currentSeason: "2026", createdAt: "2026-03-11T10:45:00.000Z", updatedAt: "2026-03-31T22:15:00.000Z", nextFixtureId: "fx-23", budgetSnapshot: 149000000, boardReputation: 9, fansReputation: 9, roundsUnderCriticalBoard: 0, roundsUnderCriticalFans: 0, roundsUnderCriticalCombined: 0, isEmployed: true, employmentStatus: "employed", currentClubId: "t-royals", dismissalCount: 0 },
];

export const mockUniforms: Uniform[] = mockTeams.flatMap((team) => [
  { id: `u-${team.id}-home`, teamId: team.id, type: "home", primaryColor: team.primaryColor, secondaryColor: team.secondaryColor, imageUrl: "🏀 Home" },
  { id: `u-${team.id}-away`, teamId: team.id, type: "away", primaryColor: "#f8fafc", secondaryColor: team.primaryColor, imageUrl: "🛫 Away" },
]);

export const mockStadiums: Stadium[] = mockTeams.map((team) => ({ id: `st-${team.id}`, teamId: team.id, name: `${team.shortName} Arena`, capacity: 19000, level: 3, value: 60000000 }));

export const mockClubVisuals: ClubVisual[] = mockTeams.map((team) => ({
  id: `visual-${team.id}`,
  teamId: team.id,
  backgroundType: "gradient-shape",
  primaryColor: team.primaryColor,
  secondaryColor: team.secondaryColor,
  accentColor: "#f8fafc",
  shapeCss: `radial-gradient(circle at 20% 20%, ${team.secondaryColor}88 0%, transparent 55%), radial-gradient(circle at 85% 70%, ${team.primaryColor}99 0%, transparent 50%)`,
  gradientCss: `linear-gradient(135deg, ${team.secondaryColor}, ${team.primaryColor})`,
  textureUrl: "",
}));

const nbaRound8Pairs = [
  ["t-wolves", "t-sharks"], ["t-ravens", "t-titans"], ["t-hawks", "t-pythons"], ["t-kings", "t-riders"], ["t-comets", "t-giants"],
  ["t-bulls", "t-knights"], ["t-foxes", "t-storm"], ["t-vipers", "t-trail"], ["t-horizon", "t-guard"], ["t-rhythm", "t-flames"],
] as const;

export const mockFixtures: Fixture[] = [
  ...nbaRound8Pairs.map((pair, i) => ({ id: `fx-${i + 3}`, leagueId: "lg-nba", round: 8, date: "2026-04-06", homeTeamId: pair[0], awayTeamId: pair[1], homeScore: 0, awayScore: 0, status: "scheduled" as const, quarter: 0, clock: "12:00" })),
  { id: "fx-1", leagueId: "lg-latam", round: 11, date: "2026-04-03", homeTeamId: "t-falcons", awayTeamId: "t-jaguars", homeScore: 88, awayScore: 84, status: "finished", quarter: 4, clock: "00:00" },
  { id: "fx-2", leagueId: "lg-latam", round: 12, date: "2026-04-07", homeTeamId: "t-falcons", awayTeamId: "t-jaguars", homeScore: 0, awayScore: 0, status: "scheduled", quarter: 0, clock: "12:00" },
  { id: "fx-23", leagueId: "lg-euro", round: 5, date: "2026-04-08", homeTeamId: "t-royals", awayTeamId: "t-blaze", homeScore: 0, awayScore: 0, status: "scheduled", quarter: 0, clock: "12:00" },
];

const nbaStandings: StandingRow[] = nbaConfigs.map((row, index) => ({
  teamId: row[0],
  leagueId: "lg-nba",
  played: 7,
  wins: Math.max(1, 14 - index),
  losses: Math.max(0, index - 1),
  pointsFor: 720 + (20 - index) * 9,
  pointsAgainst: 700 + index * 7,
  leaguePoints: 8 + Math.max(1, 14 - index),
  position: index + 1,
}));

export const mockStandings: StandingRow[] = [
  ...nbaStandings,
  { teamId: "t-falcons", leagueId: "lg-latam", played: 11, wins: 8, losses: 3, pointsFor: 901, pointsAgainst: 810, leaguePoints: 19, position: 1 },
  { teamId: "t-jaguars", leagueId: "lg-latam", played: 11, wins: 6, losses: 5, pointsFor: 842, pointsAgainst: 831, leaguePoints: 17, position: 2 },
  { teamId: "t-royals", leagueId: "lg-euro", played: 4, wins: 4, losses: 0, pointsFor: 388, pointsAgainst: 340, leaguePoints: 12, position: 1 },
  { teamId: "t-blaze", leagueId: "lg-euro", played: 4, wins: 2, losses: 2, pointsFor: 360, pointsAgainst: 357, leaguePoints: 8, position: 2 },
];

export const mockChampionsHistory: LeagueChampionHistory[] = [
  { id: "ch-1", leagueId: "lg-nba", season: "2025", championTeamId: "t-wolves" },
  { id: "ch-3", leagueId: "lg-latam", season: "2025", championTeamId: "t-falcons" },
  { id: "ch-4", leagueId: "lg-euro", season: "2025", championTeamId: "t-royals" },
];
