/** Helpers para pedidos autenticados do painel admin. */

export function getAdminToken(): string | null {
  return localStorage.getItem("adminToken");
}

export function clearAdminSession() {
  localStorage.removeItem("adminToken");
  localStorage.removeItem("adminUser");
}

export async function adminFetch(url: string, init: RequestInit = {}): Promise<Response> {
  const token = getAdminToken();
  const headers = new Headers(init.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  return fetch(url, { ...init, headers, cache: "no-store" });
}

export type AdminFetchResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; error: string; unauthorized: boolean };

export async function adminFetchJson<T = unknown>(url: string, init?: RequestInit): Promise<AdminFetchResult<T>> {
  try {
    const res = await adminFetch(url, init);
    let payload: unknown = null;
    const text = await res.text();
    if (text) {
      try {
        payload = JSON.parse(text);
      } catch {
        return {
          ok: false,
          status: res.status,
          error: "Resposta inválida do servidor. Use http://localhost:3000 com npm run dev.",
          unauthorized: false,
        };
      }
    }

    if (res.status === 401) {
      clearAdminSession();
      return {
        ok: false,
        status: 401,
        error: "Sessão expirada. Inicie sessão novamente.",
        unauthorized: true,
      };
    }

    if (!res.ok) {
      const err =
        payload && typeof payload === "object" && "error" in payload
          ? String((payload as { error: string }).error)
          : `Erro ${res.status}`;
      return { ok: false, status: res.status, error: err, unauthorized: false };
    }

    return { ok: true, data: payload as T };
  } catch (e) {
    console.error("adminFetchJson:", url, e);
    return {
      ok: false,
      status: 0,
      error: "Não foi possível ligar ao servidor. Confirme que executou npm run dev na porta 3000.",
      unauthorized: false,
    };
  }
}

export async function adminFetchList<T>(url: string): Promise<AdminFetchResult<T[]>> {
  const result = await adminFetchJson<T[] | { error?: string }>(url);
  if (!result.ok) return result;
  if (!Array.isArray(result.data)) {
    return {
      ok: false,
      status: 200,
      error: "Formato de dados inesperado na resposta da API.",
      unauthorized: false,
    };
  }
  return { ok: true, data: result.data };
}
