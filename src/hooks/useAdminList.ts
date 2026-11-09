import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminFetchList, isAdminFetchError } from "../lib/adminApi";

/** Lista admin com tratamento de auth/erros e refresh ao focar a janela. */
export function useAdminList<T>(url: string) {
  const navigate = useNavigate();
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await adminFetchList<T>(url);
    if (!result.ok) {
      setData([]);
      if (isAdminFetchError(result)) {
        setError(result.error);
        if (result.unauthorized) navigate("/admin/login", { replace: true });
      } else {
        setError("Erro inesperado.");
      }
    } else {
      setData(result.data);
    }
    setLoading(false);
  }, [url, navigate]);

  useEffect(() => {
    load();
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [load]);

  return { data, loading, error, refresh: load };
}
