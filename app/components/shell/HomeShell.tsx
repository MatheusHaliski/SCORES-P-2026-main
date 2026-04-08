'use client';

import { useEffect, useState } from 'react';
import SidebarNav from './SidebarNav';
import TopBar from './TopBar';
import ContentRouter from './ContentRouter';
import { AppRoute, ROUTE_TITLES } from '@/app/lib/scores-shell';
import { ensureSharedAccessToken } from '@/app/lib/accessTokenShare';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { getAuthSessionToken } from '@/app/lib/authSession';
import { getShellBackgroundOption, SHELL_BACKGROUND_KEY } from '@/app/lib/shellBackground';
import { getLS } from '@/app/lib/SafeStorage';

export default function HomeShell() {
  const [activeRoute, setActiveRoute] = useState<AppRoute>('home');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [shellBackground, setShellBackground] = useState(() => getShellBackgroundOption(getLS(SHELL_BACKGROUND_KEY)));
  const router = useRouter();
  const hasAccess = Boolean(ensureSharedAccessToken());

  useEffect(() => {
    const token = getAuthSessionToken();
    if (!token) {
      router.replace('/authview');
    } else {
      console.log('Token is:', token);
    }
  }, [hasAccess, router]);

  useEffect(() => {
    const applyBackgroundFromStorage = () => {
      setShellBackground(getShellBackgroundOption(getLS(SHELL_BACKGROUND_KEY)));
    };

    applyBackgroundFromStorage();
    window.addEventListener('storage', applyBackgroundFromStorage);
    window.addEventListener('scores-shell-background-change', applyBackgroundFromStorage);

    return () => {
      window.removeEventListener('storage', applyBackgroundFromStorage);
      window.removeEventListener('scores-shell-background-change', applyBackgroundFromStorage);
    };
  }, []);

  const token1 = getAuthSessionToken();
  if (!token1) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm font-semibold uppercase tracking-[0.2em] text-white/80">
        Checking access...
      </div>
    );
  }

  return (
    <div className="sa-home-shell flex min-h-screen text-white" style={shellBackground.style}>
      <SidebarNav
        activeRoute={activeRoute}
        onRouteChange={setActiveRoute}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <main className="flex min-w-0 min-h-[600px] flex-1 flex-col p-2">
        <div className="sticky top-0 z-30 flex w-full items-stretch gap-2">
          <div className="flex h-full w-24 shrink-0 items-center justify-center rounded-2xl border-8 border-orange-500 bg-white p-2 shadow-[0_18px_60px_rgba(0,0,0,0.25)] sm:w-28 lg:w-32">
            <Image src="/81002908-DEEB-4A44-AD5F-F5FA637A495C_1_105_c.jpeg" alt="SCORES" width={160} height={72} className="h-full w-full object-contain" priority />
          </div>

          <div className="min-w-0 flex-1">
            <TopBar
              pageTitle={ROUTE_TITLES[activeRoute]}
              navOpen={mobileOpen}
              onToggleNav={() => setMobileOpen((prev) => !prev)}
            />
          </div>
        </div>

        <section className="flex-1 overflow-y-auto p-4 lg:p-6">
          <ContentRouter route={activeRoute} />
        </section>
      </main>
    </div>
  );
}
