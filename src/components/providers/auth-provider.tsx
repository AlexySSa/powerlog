"use client";

import { useTheme } from "next-themes";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";

import { useI18n } from "@/components/providers/i18n-provider";
import { requestJson } from "@/lib/request";
import { createLocalDataset, LocalSetupValues, readLocalDataset, readLocalMode, setLocalMode, writeLocalDataset } from "@/lib/local-data";
import { Locale, ThemeMode } from "@/lib/types";

type AppUser = {
  id: string;
  email: string;
  full_name: string;
  preferred_language: Locale;
  preferred_theme: ThemeMode;
};

interface AuthContextValue {
  user: AppUser | null;
  loading: boolean;
  isLocal: boolean;
  startLocal: (values?: LocalSetupValues) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function applyPreferences(
  user: AppUser | null,
  setLocale: (locale: Locale) => void,
  setTheme: (theme: ThemeMode) => void,
) {
  if (!user) {
    return;
  }

  setLocale(user.preferred_language);
  setTheme(user.preferred_theme);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLocal, setIsLocal] = useState(false);
  const sessionRevision = useRef(0);
  const { setLocale } = useI18n();
  const { setTheme } = useTheme();

  const refreshSession = useCallback(async () => {
    const revision = ++sessionRevision.current;
    try {
      if (readLocalMode()) {
        const local = readLocalDataset();
        if (!local?.profile) throw new Error("No se encontró el perfil local. Vuelve a configurar tu acceso local.");
        setIsLocal(true);
        setUser(local.profile);
        applyPreferences(local.profile, setLocale, setTheme);
        return;
      }
      const payload = await requestJson<{ user: AppUser | null }>("/api/auth/session", {
        method: "GET",
        cache: "no-store",
      });
      if (revision !== sessionRevision.current) return;
      setUser(payload.user);
      setIsLocal(false);
      applyPreferences(payload.user, setLocale, setTheme);
    } catch (error) {
      if (revision !== sessionRevision.current) return;
      setUser(null);
      toast.error(error instanceof Error ? error.message : "No se pudo validar la sesion.");
    } finally {
      if (revision === sessionRevision.current) setLoading(false);
    }
  }, [setLocale, setTheme]);

  const startLocal = useCallback(async (values?: LocalSetupValues) => {
    const existing = readLocalDataset();
    // A returning athlete always resumes the saved profile; onboarding cannot overwrite it.
    const local = existing ?? (values ? createLocalDataset(values) : null);
    if (!local?.profile) throw new Error("Completa tu perfil para comenzar en modo local.");
    writeLocalDataset(local);
    setLocalMode(true);
    ++sessionRevision.current;
    setIsLocal(true);
    setUser(local.profile);
    setLoading(false);
    applyPreferences(local.profile, setLocale, setTheme);
    toast.success(existing ? "Tus datos locales están listos." : "Perfil guardado en este navegador.");
  }, [setLocale, setTheme]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void refreshSession();
    }, 0);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [refreshSession]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const payload = await requestJson<{ user: AppUser }>("/api/auth/sign-in", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      setLocalMode(false);
      ++sessionRevision.current;
      setUser(payload.user);
      setIsLocal(false);
      setLoading(false);
      applyPreferences(payload.user, setLocale, setTheme);
      toast.success("Bienvenido de nuevo.");
    },
    [setLocale, setTheme],
  );

  const signUp = useCallback(
    async (email: string, password: string, fullName: string) => {
      const payload = await requestJson<{ user: AppUser }>("/api/auth/sign-up", {
        method: "POST",
        body: JSON.stringify({ email, password, fullName }),
      });

      setLocalMode(false);
      ++sessionRevision.current;
      setUser(payload.user);
      setIsLocal(false);
      setLoading(false);
      applyPreferences(payload.user, setLocale, setTheme);
      toast.success("Cuenta creada.");
    },
    [setLocale, setTheme],
  );

  const signOut = useCallback(async () => {
    try {
      if (isLocal) setLocalMode(false);
      else await requestJson<{ ok: boolean }>("/api/auth/sign-out", { method: "POST" });
      ++sessionRevision.current;
      setUser(null);
      setIsLocal(false);
      toast.success(isLocal ? "Saliste del modo local. Tus registros siguen guardados." : "Sesión cerrada.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo cerrar la sesión.");
    }
  }, [isLocal]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isLocal,
      startLocal,
      signIn,
      signUp,
      signOut,
      refreshSession,
    }),
    [isLocal, loading, refreshSession, signIn, signOut, signUp, startLocal, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}
