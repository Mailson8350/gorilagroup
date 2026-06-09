import { useCallback, useEffect, useState } from "react";

/** Lista pública com refetch no focus da janela (sincronização admin → público). */
export function usePublicList<T>(url: string) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchList = useCallback(async () => {
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(`${res.status}`);
      const json = await res.json();
      setData(Array.isArray(json) ? json : []);
      setError(null);
    } catch (e) {
      console.error(`usePublicList ${url}:`, e);
      setError("Não foi possível carregar os dados.");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    setLoading(true);
    fetchList();
    const onFocus = () => fetchList();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [fetchList]);

  return { data, loading, error, refresh: fetchList };
}
