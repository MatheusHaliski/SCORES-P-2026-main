import { AppRoute } from '@/app/lib/scores-shell';
import HomeView from '@/app/views/HomeView';
import DiscoverView from '@/app/views/DiscoverView';
import CreateSchemeView from '@/app/views/CreateSchemeView';
import MarketView from '@/app/views/MarketView';
import ProfileView from '@/app/views/ProfileView';

interface ContentRouterProps {
  route: AppRoute;
}

export default function ContentRouter({ route }: ContentRouterProps) {
  if (route === 'discover') return <DiscoverView />;
  if (route === 'create') return <CreateSchemeView />;
  if (route === 'market') return <MarketView />;
  if (route === 'profile') return <ProfileView />;
  return <HomeView />;
}
