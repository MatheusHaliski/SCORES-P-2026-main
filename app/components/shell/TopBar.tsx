import SearchInput from '../shared/SearchInput';
import IconButton from '../shared/IconButton';

interface TopBarProps {
  pageTitle: string;
  onToggleNav: () => void;
  navOpen: boolean;
}

const BellIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5" />
    <path d="M10 19a2 2 0 0 0 4 0" />
  </svg>
);

const MailIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m4 7 8 6 8-6" />
  </svg>
);

const UserIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="8" r="3.2" />
    <path d="M5 19a7 7 0 0 1 14 0" />
  </svg>
);

export default function TopBar({ pageTitle, onToggleNav, navOpen }: TopBarProps) {
  return (
      <header className="sa-surface-topbar h-full w-full rounded-2xl border-8 border-orange-500 px-4 py-3 backdrop-blur-md lg:px-6">
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-semibold text-white">{pageTitle}</p>
        </div>

        <div className="hidden w-full max-w-xl lg:block">
          <SearchInput placeholder="Search players, clubs, leagues, or tactics" />
        </div>

        <div className="flex items-center gap-2">
          <IconButton label="Notifications" icon={<BellIcon />} />
          <IconButton label="Messages" icon={<MailIcon />} />
          <button
            type="button"
            onClick={onToggleNav}
            aria-label={navOpen ? 'Close navigation' : 'Open navigation'}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/30 bg-white/10 text-white transition hover:bg-white/20"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
          <button className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-sm font-semibold text-white transition hover:bg-white/20">
            <UserIcon />
          </button>
        </div>
      </div>

      <div className="mt-3 lg:hidden">
        <SearchInput placeholder="Search players, clubs, leagues, or tactics" />
      </div>
    </header>
  );
}
