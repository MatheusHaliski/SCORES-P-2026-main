"use client";

import AuthShell from "../components/AuthShell";
import SignupForm from "./SignupForm";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { getDevSessionToken } from "@/app/lib/devSession";
import { clearSharedAccessToken, ensureSharedAccessToken } from '@/app/lib/accessTokenShare';
import { clearAuthSessionToken } from "@/app/lib/authSession";

export default function SignupViewPage() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const token = getDevSessionToken();
    if (!token) {
      router.replace("/devauthgate");
      return;
    }

    ensureSharedAccessToken();
  }, [router]);

  useEffect(() => {
    if (pathname !== "/signupview") return;
    clearAuthSessionToken();
    clearSharedAccessToken();
  }, [pathname]);

  return (
    <AuthShell
      title="Create your SCORES account"
      subtitle="Build your manager profile in minutes"
    >
      <div
        className={[
          "space-y-4",
          "rounded-3xl",
          "rounded-2xl border-8 border-orange-500",
          "bg-white/45",
          "fe-glass-panel",
          "p-6 sm:p-8",
          "shadow-[0_20px_50px_rgba(0,0,0,0.35)]",
        ].join(" ")}
      >
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-orange-600">
          Create your SCORES account
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-orange-600">
          Start managing your club
        </h1>
        <SignupForm />
      </div>
    </AuthShell>
  );
}
