import { useCallback, useEffect, useState } from "react";
import { adminFetchJson, isAdminFetchError } from "../lib/adminApi";

export type AdminStats = {
  produtos: number;
  reservas: number;
  mensagens: number;
  solicitacoes: number;
  pedidos: number;
  equipa: number;
  portfolio: number;
};

export function useAdminStats() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    const result = await adminFetchJson<AdminStats>("/api/admin/stats");
    if (!result.ok) {
      setStats(null);
      setError(isAdminFetchError(result) ? result.error : "Erro ao carregar estatísticas do painel.");
    } else {
      setStats(result.data);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
    const onFocus = () => refresh();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refresh]);

  return { stats, loading, error, refresh };
}
