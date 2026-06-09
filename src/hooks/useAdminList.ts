import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminFetchList } from "../lib/adminApi";

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
    if (result.ok) {
      setData(result.data);
    } else {
      setData([]);
      setError(result.error);
      if (result.unauthorized) navigate("/admin/login", { replace: true });
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
