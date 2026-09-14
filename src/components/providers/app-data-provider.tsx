"use client";

import {
  createContext,
  startTransition,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";

import { useAuth } from "@/components/providers/auth-provider";
import { useI18n } from "@/components/providers/i18n-provider";
import {
  getBodyweightChart,
  getDashboardSnapshot,
  getLiftProgressChart,
  getRecentWorkouts,
  getRecoveryStatus,
  getWeeklyRecoveryChart,
  getWeeklyVolumeChart,
} from "@/lib/metrics";
import { requestJson } from "@/lib/request";
import { addLocalCycle, addLocalPR, addLocalRecovery, addLocalReview, addLocalWorkout, LOCAL_DATA_KEY, mutateLocalDataset, readLocalDataset, setLocalPreferences } from "@/lib/local-data";
import {
  AppDataset,
  CycleFormValues,
  DashboardSnapshot,
  PRFormValues,
  RecoveryFormValues,
  SettingsFormValues,
  WeeklyReviewFormValues,
  Workout,
  WorkoutFormValues,
} from "@/lib/types";

interface AppDataContextValue {
  data: AppDataset;
  loading: boolean;
  dashboard: DashboardSnapshot;
  recentWorkouts: Workout[];
  bodyweightChart: ReturnType<typeof getBodyweightChart>;
  liftChart: ReturnType<typeof getLiftProgressChart>;
  weeklyVolumeChart: ReturnType<typeof getWeeklyVolumeChart>;
  weeklySleepChart: ReturnType<typeof getWeeklyRecoveryChart>;
  weeklyLowBackChart: ReturnType<typeof getWeeklyRecoveryChart>;
  recoveryStatus: ReturnType<typeof getRecoveryStatus>;
  refresh: () => Promise<void>;
  createCycle: (values: CycleFormValues) => Promise<void>;
  createWorkout: (values: WorkoutFormValues) => Promise<void>;
  createRecoveryLog: (values: RecoveryFormValues) => Promise<void>;
  createPR: (values: PRFormValues) => Promise<void>;
  createWeeklyReview: (values: WeeklyReviewFormValues) => Promise<void>;
  updatePreferences: (values: SettingsFormValues) => Promise<void>;
}

const emptyDataset: AppDataset = {
  profile: null,
  cycles: [],
  workouts: [],
  recoveryLogs: [],
  prs: [],
  weeklyReviews: [],
};

const AppDataContext = createContext<AppDataContextValue | undefined>(undefined);

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const { user, isLocal, loading: authLoading, refreshSession } = useAuth();
  const { setLocale } = useI18n();
  const [data, setData] = useState<AppDataset>(emptyDataset);
  const [loading, setLoading] = useState(true);
  const refreshId = useRef(0);

  const refresh = useCallback(async () => {
    const currentRefresh = ++refreshId.current;
    if (authLoading) {
      return;
    }

    if (!user) {
      setData(emptyDataset);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const nextData = isLocal ? readLocalDataset() : await requestJson<AppDataset>("/api/app-data", {
        method: "GET",
        cache: "no-store",
      });
      if (currentRefresh !== refreshId.current) return;
      if (!nextData) throw new Error("No se encontraron los datos locales. Vuelve a entrar desde la pantalla de acceso.");
      startTransition(() => {
        setData(nextData);
      });
    } catch (error) {
      if (currentRefresh !== refreshId.current) return;
      setData(emptyDataset);
      toast.error(error instanceof Error ? error.message : "No se pudieron cargar los datos.");
    } finally {
      if (currentRefresh === refreshId.current) setLoading(false);
    }
  }, [authLoading, isLocal, user]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void refresh();
    }, 0);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [refresh]);

  useEffect(() => {
    if (!isLocal) return;
    const onStorage = (event: StorageEvent) => {
      if (event.key === LOCAL_DATA_KEY || event.key === null) void refresh();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [isLocal, refresh]);

  const persistLocal = useCallback((update: (current: AppDataset) => AppDataset) => {
    try {
      const next = mutateLocalDataset(update);
      setData(next);
      return next;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo guardar el registro local.");
      throw error;
    }
  }, []);

  const createCycle = useCallback(
    async (values: CycleFormValues) => {
      if (isLocal) {
        persistLocal((current) => addLocalCycle(current, values));
        toast.success("Ciclo guardado en este navegador.");
        return;
      }
      await requestJson<{ ok: boolean }>("/api/cycles", {
        method: "POST",
        body: JSON.stringify(values),
      });

      toast.success("Ciclo creado.");
      await refresh();
    },
    [isLocal, persistLocal, refresh],
  );

  const createWorkout = useCallback(
    async (values: WorkoutFormValues) => {
      if (isLocal) {
        persistLocal((current) => addLocalWorkout(current, values));
        toast.success("Entreno guardado en este navegador.");
        return;
      }
      await requestJson<{ ok: boolean }>("/api/workouts", {
        method: "POST",
        body: JSON.stringify(values),
      });

      toast.success("Entreno registrado.");
      await refresh();
    },
    [isLocal, persistLocal, refresh],
  );

  const createRecoveryLog = useCallback(
    async (values: RecoveryFormValues) => {
      if (isLocal) {
        persistLocal((current) => addLocalRecovery(current, values));
        toast.success("Recuperación guardada en este navegador.");
        return;
      }
      await requestJson<{ ok: boolean }>("/api/recovery-logs", {
        method: "POST",
        body: JSON.stringify(values),
      });

      toast.success("Recuperacion registrada.");
      await refresh();
    },
    [isLocal, persistLocal, refresh],
  );

  const createPR = useCallback(
    async (values: PRFormValues) => {
      if (isLocal) {
        persistLocal((current) => addLocalPR(current, values));
        toast.success("PR guardado en este navegador.");
        return;
      }
      await requestJson<{ ok: boolean }>("/api/prs", {
        method: "POST",
        body: JSON.stringify(values),
      });

      toast.success("Registro de PR actualizado.");
      await refresh();
    },
    [isLocal, persistLocal, refresh],
  );

  const createWeeklyReview = useCallback(
    async (values: WeeklyReviewFormValues) => {
      if (isLocal) {
        persistLocal((current) => addLocalReview(current, values));
        toast.success("Evaluación guardada en este navegador.");
        return;
      }
      await requestJson<{ ok: boolean }>("/api/weekly-reviews", {
        method: "POST",
        body: JSON.stringify(values),
      });

      toast.success("Evaluacion semanal registrada.");
      await refresh();
    },
    [isLocal, persistLocal, refresh],
  );

  const updatePreferences = useCallback(
    async (values: SettingsFormValues) => {
      if (isLocal) {
        persistLocal((current) => setLocalPreferences(current, values));
        setLocale(values.preferred_language);
        await refreshSession();
        toast.success("Preferencias guardadas en este navegador.");
        return;
      }
      const payload = await requestJson<{ profile: AppDataset["profile"] }>("/api/settings", {
        method: "PATCH",
        body: JSON.stringify(values),
      });

      startTransition(() => {
        setData((current) => ({
          ...current,
          profile: payload.profile,
        }));
      });

      setLocale(values.preferred_language);
      await refreshSession();
      toast.success("Ajustes guardados.");
    },
    [isLocal, persistLocal, refreshSession, setLocale],
  );

  const dashboard = useMemo(() => getDashboardSnapshot(data), [data]);
  const recentWorkouts = useMemo(() => getRecentWorkouts(data.workouts), [data.workouts]);
  const bodyweightChart = useMemo(
    () => getBodyweightChart(data.recoveryLogs),
    [data.recoveryLogs],
  );
  const liftChart = useMemo(
    () => getLiftProgressChart(data.workouts, data.prs),
    [data.prs, data.workouts],
  );
  const weeklyVolumeChart = useMemo(
    () => getWeeklyVolumeChart(data.workouts),
    [data.workouts],
  );
  const weeklySleepChart = useMemo(
    () => getWeeklyRecoveryChart(data.recoveryLogs, "sleep"),
    [data.recoveryLogs],
  );
  const weeklyLowBackChart = useMemo(
    () => getWeeklyRecoveryChart(data.recoveryLogs, "lowBackPain"),
    [data.recoveryLogs],
  );
  const recoveryStatus = useMemo(
    () => getRecoveryStatus(data.recoveryLogs),
    [data.recoveryLogs],
  );

  const value = useMemo<AppDataContextValue>(
    () => ({
      data,
      loading,
      dashboard,
      recentWorkouts,
      bodyweightChart,
      liftChart,
      weeklyVolumeChart,
      weeklySleepChart,
      weeklyLowBackChart,
      recoveryStatus,
      refresh,
      createCycle,
      createWorkout,
      createRecoveryLog,
      createPR,
      createWeeklyReview,
      updatePreferences,
    }),
    [
      bodyweightChart,
      createCycle,
      createPR,
      createRecoveryLog,
      createWeeklyReview,
      createWorkout,
      dashboard,
      data,
      liftChart,
      loading,
      recentWorkouts,
      recoveryStatus,
      refresh,
      updatePreferences,
      weeklyLowBackChart,
      weeklySleepChart,
      weeklyVolumeChart,
    ],
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const context = useContext(AppDataContext);

  if (!context) {
    throw new Error("useAppData must be used inside AppDataProvider.");
  }

  return context;
}
