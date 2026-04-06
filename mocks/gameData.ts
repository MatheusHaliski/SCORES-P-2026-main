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
  ["t-flames", "Cleveland Flames", "FLM", "🔥", "#ea580c", "#431407", 78],
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

const createPlayers = (teamId: string, prefix: string): Player[] => [
  { id: `${teamId}-p1`, teamId, name: `${prefix} Grant`, age: 24, position: "PG", overall: 80, marketValue: 11000000, physicalCondition: 92, pace: 85, shooting: 79, passing: 88, dribbling: 86, defending: 74, physical: 72, playstyles: ["Floor General"], isStarter: true, isBench: false },
  { id: `${teamId}-p2`, teamId, name: `${prefix} Reed`, age: 26, position: "SG", overall: 82, marketValue: 14000000, physicalCondition: 89, pace: 84, shooting: 86, passing: 77, dribbling: 83, defending: 75, physical: 74, playstyles: ["Catch & Shoot"], isStarter: true, isBench: false },
  { id: `${teamId}-p3`, teamId, name: `${prefix} Miles`, age: 27, position: "SF", overall: 84, marketValue: 17000000, physicalCondition: 88, pace: 82, shooting: 81, passing: 78, dribbling: 80, defending: 84, physical: 83, playstyles: ["Two-way Wing"], isStarter: true, isBench: false },
  { id: `${teamId}-p4`, teamId, name: `${prefix} Coleman`, age: 29, position: "PF", overall: 83, marketValue: 16000000, physicalCondition: 86, pace: 75, shooting: 78, passing: 76, dribbling: 72, defending: 85, physical: 86, playstyles: ["Post Defender"], isStarter: true, isBench: false },
  { id: `${teamId}-p5`, teamId, name: `${prefix} Stone`, age: 30, position: "C", overall: 85, marketValue: 18000000, physicalCondition: 87, pace: 71, shooting: 74, passing: 70, dribbling: 65, defending: 88, physical: 90, playstyles: ["Rim Protector"], isStarter: true, isBench: false },
  { id: `${teamId}-p6`, teamId, name: `${prefix} Young`, age: 22, position: "PG", overall: 75, marketValue: 6000000, physicalCondition: 94, pace: 88, shooting: 71, passing: 79, dribbling: 84, defending: 68, physical: 67, playstyles: ["Spark Plug"], isStarter: false, isBench: true },
  { id: `${teamId}-p7`, teamId, name: `${prefix} Brooks`, age: 25, position: "SG", overall: 74, marketValue: 5200000, physicalCondition: 91, pace: 80, shooting: 75, passing: 70, dribbling: 74, defending: 71, physical: 70, playstyles: ["Microwave Scorer"], isStarter: false, isBench: true },
  { id: `${teamId}-p8`, teamId, name: `${prefix} Silva`, age: 23, position: "SF", overall: 73, marketValue: 4800000, physicalCondition: 93, pace: 79, shooting: 72, passing: 68, dribbling: 71, defending: 74, physical: 76, playstyles: ["Hustle"], isStarter: false, isBench: true },
];

export const mockPlayers: Player[] = mockTeams.flatMap((team) => createPlayers(team.id, team.shortName));

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
