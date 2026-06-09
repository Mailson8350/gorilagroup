import { getSupabaseAdmin } from "./supabaseClient";

export const TURISMO_TAXA_POR_PESSOA = 1000;

export function parseExistingId(id: unknown): number | null {
  const n = Number(id);
  return Number.isInteger(n) && n > 0 ? n : null;
}

export function countReservationNights(dataInicio: string, dataFim: string): number {
  const start = new Date(`${dataInicio}T12:00:00`);
  const end = new Date(`${dataFim}T12:00:00`);
  return Math.max(0, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
}

export async function isRoomBookedForDates(
  quartoId: number,
  dataInicio: string,
  dataFim: string
): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  const { count, error } = await supabase
    .from("reservas")
    .select("*", { count: "exact", head: true })
    .eq("quarto_id", quartoId)
    .neq("status", "cancelado")
    .lt("data_inicio", dataFim)
    .gt("data_fim", dataInicio);
  if (error) throw error;
  return (count ?? 0) > 0;
}

export async function tableCount(table: string): Promise<number> {
  const supabase = getSupabaseAdmin();
  const { count, error } = await supabase.from(table).select("*", { count: "exact", head: true });
  if (error) throw error;
  return count ?? 0;
}

/** Normaliza boolean do Postgres para compatibilidade com UI antiga (0/1). */
export function normDisponivel(v: unknown): number {
  return v === true || v === 1 || v === "1" ? 1 : 0;
}
