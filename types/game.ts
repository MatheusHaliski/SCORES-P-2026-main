export type PlayerPosition = "PG" | "SG" | "SF" | "PF" | "C";
export type UniformType = "home" | "away" | "alternate";
export type FixtureStatus = "scheduled" | "live" | "halftime" | "finished";

export interface League {
  id: string;
  name: string;
  country: string;
  format: string;
  teamCount: number;
  season: string;
  logoUrl: string;
}

export interface Team {
  id: string;
  leagueId: string;
  name: string;
  shortName: string;
  logoUrl: string;
  overall: number;
  attackOverall: number;
  defenseOverall: number;
  physicality: number;
  budget: number;
  stadiumId: string;
  managerDefaultName: string;
  reputationBoard: number;
  reputationFans: number;
  currentLeaguePosition: number;
  primaryColor: string;
  secondaryColor: string;
  visualId: string;
  uniformIds: string[];
  summary: string;
}

export interface Player {
  id: string;
  teamId: string;
  name: string;
  age: number;
  position: PlayerPosition;
  overall: number;
  marketValue: number;
  physicalCondition: number;
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physical: number;
  playstyles: string[];
  isStarter: boolean;
  isBench: boolean;
}

export interface User {
  id: string;
  displayName: string;
  email: string;
  createdAt: string;
}

export interface UserSave {
  id: string;
  saveName?: string;
  userId: string;
  leagueId: string;
  teamId: string;
  managerName: string;
  currentRound: number;
  currentSeason: string;
  createdAt: string;
  updatedAt: string;
  nextFixtureId: string;
  budgetSnapshot: number;
  boardReputation: number;
  fansReputation: number;
}

export interface Uniform {
  id: string;
  teamId: string;
  type: UniformType;
  primaryColor: string;
  secondaryColor: string;
  imageUrl: string;
}

export interface Stadium {
  id: string;
  teamId: string;
  name: string;
  capacity: number;
  level: number;
  value: number;
}

export interface ClubVisual {
  id: string;
  teamId: string;
  backgroundType: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  shapeCss: string;
  gradientCss: string;
  textureUrl?: string;
}

export interface Fixture {
  id: string;
  leagueId: string;
  round: number;
  date: string;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number;
  awayScore: number;
  status: FixtureStatus;
  quarter: number;
  clock: string;
}

export interface StandingRow {
  teamId: string;
  leagueId: string;
  played: number;
  wins: number;
  losses: number;
  pointsFor: number;
  pointsAgainst: number;
  leaguePoints: number;
  position: number;
}

export interface LeagueChampionHistory {
  id: string;
  leagueId: string;
  season: string;
  championTeamId: string;
}

export interface SquadHomePayload {
  save: UserSave;
  league: League;
  team: Team;
  visual: ClubVisual;
  uniforms: Uniform[];
  players: Player[];
  nextFixture: Fixture;
  standings: StandingRow[];
}
