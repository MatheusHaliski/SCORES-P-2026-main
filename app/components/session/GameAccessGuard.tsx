"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ensureSharedAccessToken } from "@/app/lib/accessTokenShare";
import { getAuthSessionToken } from "@/app/lib/authSession";
import { getDevSessionToken } from "@/app/lib/devSession";

export default function GameAccessGuard() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const shared = ensureSharedAccessToken();
    const authToken = getAuthSessionToken();
    const devToken = getDevSessionToken();

    if (!shared && !authToken && !devToken) {
      router.replace("/authview");
    }
  }, [router, pathname]);

  return null;
}
