"use client";

import { Toaster } from "sonner";

import { AppDataProvider } from "@/components/providers/app-data-provider";
import { AuthProvider } from "@/components/providers/auth-provider";
import { I18nProvider } from "@/components/providers/i18n-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <I18nProvider>
        <AuthProvider>
          <AppDataProvider>
            {children}
            <Toaster richColors position="top-right" />
          </AppDataProvider>
        </AuthProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}
