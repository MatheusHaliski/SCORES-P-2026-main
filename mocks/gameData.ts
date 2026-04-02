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
  { id: "lg-nba", name: "North Atlantic Basketball League", country: "USA", format: "Regular Season + Playoffs", teamCount: 8, season: "2026", logoUrl: "🏀" },
  { id: "lg-latam", name: "Liga Continental LATAM", country: "Brazil", format: "Double Round Robin", teamCount: 6, season: "2026", logoUrl: "🌎" },
  { id: "lg-euro", name: "Euro Elite Cup", country: "Spain", format: "Group + Knockout", teamCount: 6, season: "2026", logoUrl: "⭐" },
];

export const mockTeams: Team[] = [
  { id: "t-wolves", leagueId: "lg-nba", name: "Seattle Wolves", shortName: "WOL", logoUrl: "🐺", overall: 84, attackOverall: 83, defenseOverall: 86, physicality: 82, budget: 128000000, stadiumId: "st-wolves", managerDefaultName: "Alex Carter", reputationBoard: 74, reputationFans: 79, currentLeaguePosition: 3, primaryColor: "#1d4ed8", secondaryColor: "#111827", visualId: "v-wolves", uniformIds: ["u-wolves-home", "u-wolves-away"], summary: "Elenco físico, forte no garrafão e defesa agressiva." },
  { id: "t-sharks", leagueId: "lg-nba", name: "San Diego Sharks", shortName: "SHK", logoUrl: "🦈", overall: 81, attackOverall: 84, defenseOverall: 78, physicality: 79, budget: 97000000, stadiumId: "st-sharks", managerDefaultName: "Mia Burton", reputationBoard: 69, reputationFans: 72, currentLeaguePosition: 5, primaryColor: "#0f766e", secondaryColor: "#06202a", visualId: "v-sharks", uniformIds: ["u-sharks-home", "u-sharks-away"], summary: "Time veloz e perigoso no perímetro." },
  { id: "t-falcons", leagueId: "lg-latam", name: "Rio Falcons", shortName: "RFC", logoUrl: "🦅", overall: 79, attackOverall: 80, defenseOverall: 77, physicality: 81, budget: 61000000, stadiumId: "st-falcons", managerDefaultName: "Rafa Souza", reputationBoard: 71, reputationFans: 83, currentLeaguePosition: 2, primaryColor: "#f97316", secondaryColor: "#7c2d12", visualId: "v-falcons", uniformIds: ["u-falcons-home", "u-falcons-away"], summary: "Clube com torcida quente e transição mortal." },
  { id: "t-jaguars", leagueId: "lg-latam", name: "São Paulo Jaguars", shortName: "SPJ", logoUrl: "🐆", overall: 77, attackOverall: 76, defenseOverall: 78, physicality: 80, budget: 55000000, stadiumId: "st-jaguars", managerDefaultName: "Livia Rocha", reputationBoard: 64, reputationFans: 68, currentLeaguePosition: 4, primaryColor: "#22c55e", secondaryColor: "#14532d", visualId: "v-jaguars", uniformIds: ["u-jaguars-home", "u-jaguars-away"], summary: "Equipe equilibrada com foco em rotação profunda." },
  { id: "t-royals", leagueId: "lg-euro", name: "Madrid Royals", shortName: "MDR", logoUrl: "👑", overall: 86, attackOverall: 87, defenseOverall: 84, physicality: 82, budget: 152000000, stadiumId: "st-royals", managerDefaultName: "Daniel Vega", reputationBoard: 88, reputationFans: 91, currentLeaguePosition: 1, primaryColor: "#7c3aed", secondaryColor: "#2e1065", visualId: "v-royals", uniformIds: ["u-royals-home", "u-royals-away"], summary: "Favorito ao título com elenco técnico e profundo." },
  { id: "t-blaze", leagueId: "lg-euro", name: "Berlin Blaze", shortName: "BLZ", logoUrl: "🔥", overall: 80, attackOverall: 79, defenseOverall: 81, physicality: 83, budget: 76000000, stadiumId: "st-blaze", managerDefaultName: "Jonas Kruger", reputationBoard: 73, reputationFans: 76, currentLeaguePosition: 3, primaryColor: "#ef4444", secondaryColor: "#450a0a", visualId: "v-blaze", uniformIds: ["u-blaze-home", "u-blaze-away"], summary: "Defesa intensa e jogo coletivo disciplinado." },
];

const createPlayers = (teamId: string, prefix: string): Player[] => [
  { id: `${teamId}-p1`, teamId, name: `${prefix} Grant`, age: 24, position: "PG", overall: 80, marketValue: 11000000, physicalCondition: 92, pace: 85, shooting: 79, passing: 88, dribbling: 86, defending: 74, physical: 72, playstyles: ["Floor General", "Clutch Passer"], isStarter: true, isBench: false },
  { id: `${teamId}-p2`, teamId, name: `${prefix} Reed`, age: 26, position: "SG", overall: 82, marketValue: 14000000, physicalCondition: 89, pace: 84, shooting: 86, passing: 77, dribbling: 83, defending: 75, physical: 74, playstyles: ["Catch & Shoot"], isStarter: true, isBench: false },
  { id: `${teamId}-p3`, teamId, name: `${prefix} Miles`, age: 27, position: "SF", overall: 84, marketValue: 17000000, physicalCondition: 88, pace: 82, shooting: 81, passing: 78, dribbling: 80, defending: 84, physical: 83, playstyles: ["Two-way Wing"], isStarter: true, isBench: false },
  { id: `${teamId}-p4`, teamId, name: `${prefix} Coleman`, age: 29, position: "PF", overall: 83, marketValue: 16000000, physicalCondition: 86, pace: 75, shooting: 78, passing: 76, dribbling: 72, defending: 85, physical: 86, playstyles: ["Post Defender"], isStarter: true, isBench: false },
  { id: `${teamId}-p5`, teamId, name: `${prefix} Stone`, age: 30, position: "C", overall: 85, marketValue: 18000000, physicalCondition: 87, pace: 71, shooting: 74, passing: 70, dribbling: 65, defending: 88, physical: 90, playstyles: ["Rim Protector"], isStarter: true, isBench: false },
  { id: `${teamId}-p6`, teamId, name: `${prefix} Young`, age: 22, position: "PG", overall: 75, marketValue: 6000000, physicalCondition: 94, pace: 88, shooting: 71, passing: 79, dribbling: 84, defending: 68, physical: 67, playstyles: ["Spark Plug"], isStarter: false, isBench: true },
  { id: `${teamId}-p7`, teamId, name: `${prefix} Brooks`, age: 25, position: "SG", overall: 74, marketValue: 5200000, physicalCondition: 91, pace: 80, shooting: 75, passing: 70, dribbling: 74, defending: 71, physical: 70, playstyles: ["Microwave Scorer"], isStarter: false, isBench: true },
  { id: `${teamId}-p8`, teamId, name: `${prefix} Silva`, age: 23, position: "SF", overall: 73, marketValue: 4800000, physicalCondition: 93, pace: 79, shooting: 72, passing: 68, dribbling: 71, defending: 74, physical: 76, playstyles: ["Hustle"], isStarter: false, isBench: true },
];

export const mockPlayers: Player[] = [
  ...createPlayers("t-wolves", "Noah"),
  ...createPlayers("t-sharks", "Kai"),
  ...createPlayers("t-falcons", "Bruno"),
  ...createPlayers("t-jaguars", "Igor"),
  ...createPlayers("t-royals", "Luca"),
  ...createPlayers("t-blaze", "Erik"),
];

export const mockUsers: User[] = [{ id: "u-1", displayName: "Coach Demo", email: "coach@scores.gg", createdAt: "2026-01-10T10:00:00.000Z" }];

export const mockUserSaves: UserSave[] = [
  { id: "save-001", userId: "u-1", leagueId: "lg-nba", teamId: "t-wolves", managerName: "Coach Demo", currentRound: 7, currentSeason: "2026", createdAt: "2026-01-12T09:00:00.000Z", updatedAt: "2026-03-30T20:45:00.000Z", nextFixtureId: "fx-3", budgetSnapshot: 121000000, boardReputation: 76, fansReputation: 81 },
  { id: "save-002", userId: "u-1", leagueId: "lg-latam", teamId: "t-falcons", managerName: "Rafa Manager", currentRound: 11, currentSeason: "2026", createdAt: "2026-02-10T12:00:00.000Z", updatedAt: "2026-04-01T13:20:00.000Z", nextFixtureId: "fx-6", budgetSnapshot: 58700000, boardReputation: 69, fansReputation: 86 },
  { id: "save-003", userId: "u-1", leagueId: "lg-euro", teamId: "t-royals", managerName: "Dynasty Boss", currentRound: 4, currentSeason: "2026", createdAt: "2026-03-11T10:45:00.000Z", updatedAt: "2026-03-31T22:15:00.000Z", nextFixtureId: "fx-9", budgetSnapshot: 149000000, boardReputation: 90, fansReputation: 93 },
];

export const mockUniforms: Uniform[] = mockTeams.flatMap((team) => [
  { id: `u-${team.id}-home`, teamId: team.id, type: "home", primaryColor: team.primaryColor, secondaryColor: team.secondaryColor, imageUrl: "🏀 Home" },
  { id: `u-${team.id}-away`, teamId: team.id, type: "away", primaryColor: "#f8fafc", secondaryColor: team.primaryColor, imageUrl: "🛫 Away" },
]);

export const mockStadiums: Stadium[] = [
  { id: "st-wolves", teamId: "t-wolves", name: "Moon Arena", capacity: 22000, level: 4, value: 89000000 },
  { id: "st-sharks", teamId: "t-sharks", name: "Pacific Dome", capacity: 19800, level: 3, value: 62000000 },
  { id: "st-falcons", teamId: "t-falcons", name: "Carioca Center", capacity: 17500, level: 3, value: 45000000 },
  { id: "st-jaguars", teamId: "t-jaguars", name: "Paulista Pavilion", capacity: 18300, level: 3, value: 47000000 },
  { id: "st-royals", teamId: "t-royals", name: "Crown Palace Arena", capacity: 24000, level: 5, value: 110000000 },
  { id: "st-blaze", teamId: "t-blaze", name: "Tempelhof Court", capacity: 20600, level: 4, value: 69000000 },
];

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

export const mockFixtures: Fixture[] = [
  { id: "fx-1", leagueId: "lg-nba", round: 7, date: "2026-04-03", homeTeamId: "t-wolves", awayTeamId: "t-sharks", homeScore: 61, awayScore: 59, status: "live", quarter: 3, clock: "06:32" },
  { id: "fx-2", leagueId: "lg-nba", round: 7, date: "2026-04-03", homeTeamId: "t-sharks", awayTeamId: "t-wolves", homeScore: 0, awayScore: 0, status: "scheduled", quarter: 0, clock: "12:00" },
  { id: "fx-3", leagueId: "lg-nba", round: 8, date: "2026-04-06", homeTeamId: "t-wolves", awayTeamId: "t-sharks", homeScore: 0, awayScore: 0, status: "scheduled", quarter: 0, clock: "12:00" },
  { id: "fx-4", leagueId: "lg-latam", round: 11, date: "2026-04-03", homeTeamId: "t-falcons", awayTeamId: "t-jaguars", homeScore: 88, awayScore: 84, status: "finished", quarter: 4, clock: "00:00" },
  { id: "fx-5", leagueId: "lg-latam", round: 11, date: "2026-04-03", homeTeamId: "t-jaguars", awayTeamId: "t-falcons", homeScore: 77, awayScore: 79, status: "finished", quarter: 4, clock: "00:00" },
  { id: "fx-6", leagueId: "lg-latam", round: 12, date: "2026-04-07", homeTeamId: "t-falcons", awayTeamId: "t-jaguars", homeScore: 0, awayScore: 0, status: "scheduled", quarter: 0, clock: "12:00" },
  { id: "fx-7", leagueId: "lg-euro", round: 4, date: "2026-04-02", homeTeamId: "t-royals", awayTeamId: "t-blaze", homeScore: 72, awayScore: 67, status: "halftime", quarter: 3, clock: "12:00" },
  { id: "fx-8", leagueId: "lg-euro", round: 4, date: "2026-04-02", homeTeamId: "t-blaze", awayTeamId: "t-royals", homeScore: 65, awayScore: 69, status: "live", quarter: 4, clock: "08:12" },
  { id: "fx-9", leagueId: "lg-euro", round: 5, date: "2026-04-08", homeTeamId: "t-royals", awayTeamId: "t-blaze", homeScore: 0, awayScore: 0, status: "scheduled", quarter: 0, clock: "12:00" },
];

export const mockStandings: StandingRow[] = [
  { teamId: "t-wolves", leagueId: "lg-nba", played: 7, wins: 5, losses: 2, pointsFor: 760, pointsAgainst: 710, leaguePoints: 12, position: 2 },
  { teamId: "t-sharks", leagueId: "lg-nba", played: 7, wins: 3, losses: 4, pointsFor: 711, pointsAgainst: 726, leaguePoints: 10, position: 5 },
  { teamId: "t-falcons", leagueId: "lg-latam", played: 11, wins: 8, losses: 3, pointsFor: 901, pointsAgainst: 810, leaguePoints: 19, position: 1 },
  { teamId: "t-jaguars", leagueId: "lg-latam", played: 11, wins: 6, losses: 5, pointsFor: 842, pointsAgainst: 831, leaguePoints: 17, position: 3 },
  { teamId: "t-royals", leagueId: "lg-euro", played: 4, wins: 4, losses: 0, pointsFor: 388, pointsAgainst: 340, leaguePoints: 12, position: 1 },
  { teamId: "t-blaze", leagueId: "lg-euro", played: 4, wins: 2, losses: 2, pointsFor: 360, pointsAgainst: 357, leaguePoints: 8, position: 3 },
];

export const mockChampionsHistory: LeagueChampionHistory[] = [
  { id: "ch-1", leagueId: "lg-nba", season: "2025", championTeamId: "t-wolves" },
  { id: "ch-2", leagueId: "lg-nba", season: "2024", championTeamId: "t-sharks" },
  { id: "ch-3", leagueId: "lg-latam", season: "2025", championTeamId: "t-falcons" },
  { id: "ch-4", leagueId: "lg-euro", season: "2025", championTeamId: "t-royals" },
];
