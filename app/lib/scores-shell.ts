export type AppRoute = 'home' | 'discover' | 'create' | 'market' | 'profile';

export interface NavItem {
  route: AppRoute;
  label: string;
  helperText: string;
  icon: string;
}

export const NAV_ITEMS: NavItem[] = [
  { route: 'home', label: 'Home', helperText: 'Live match pulse', icon: '⌂' },
  { route: 'discover', label: 'Discover', helperText: 'League analytics hub', icon: '◈' },
  { route: 'create', label: 'Create', helperText: 'Plan game tactics', icon: '✦' },
  { route: 'market', label: 'Market', helperText: 'Transfer market targets', icon: '◍' },
  { route: 'profile', label: 'Profile', helperText: 'Manager profile', icon: '◉' },
];

export const ROUTE_TITLES: Record<AppRoute, string> = {
  home: 'Home',
  discover: 'Discover',
  create: 'Tactics Board',
  market: 'Market',
  profile: 'Profile',
};
