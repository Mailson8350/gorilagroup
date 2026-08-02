import { createContext, ReactNode, useContext } from "react";
import { AdminStats, useAdminStats } from "../hooks/useAdminStats";

export type AdminStatsContextValue = {
  stats: AdminStats | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
};

const AdminStatsContext = createContext<AdminStatsContextValue | undefined>(undefined);

export function AdminStatsProvider({ children }: { children: ReactNode }) {
  const { stats, loading, error, refresh } = useAdminStats();

  return (
    <AdminStatsContext.Provider value={{ stats, loading, error, refresh }}>
      {children}
    </AdminStatsContext.Provider>
  );
}

export function useAdminStatsContext() {
  const context = useContext(AdminStatsContext);
  if (!context) {
    throw new Error("useAdminStatsContext must be used within AdminStatsProvider");
  }
  return context;
}
