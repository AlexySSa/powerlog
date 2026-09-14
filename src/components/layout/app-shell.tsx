"use client";

import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuth } from "@/components/providers/auth-provider";
import { useI18n } from "@/components/providers/i18n-provider";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const { t } = useI18n();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth");
    }
  }, [loading, router, user]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--background)] px-6">
        <div className="rounded-[3px] border border-[var(--border)] bg-[var(--card)] px-8 py-10 text-center">
          <LoaderCircle className="mx-auto size-8 animate-spin text-[var(--accent)]" />
          <p className="mt-4 text-sm text-[var(--foreground-muted)]">{t("loading")}...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="mx-auto flex max-w-[1600px]">
        <Sidebar />

        <main className="min-w-0 flex-1 px-5 pb-28 sm:px-8 lg:px-10 lg:pb-12">
          <Topbar />

          <div className="mx-auto mt-8 max-w-[1160px] lg:mt-10">{children}</div>
        </main>
      </div>
    </div>
  );
}
