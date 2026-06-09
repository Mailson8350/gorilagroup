export const PLACEHOLDER = "/uploads/site/placeholder.svg";

/** Normaliza caminhos locais para `/uploads/pasta/ficheiro`. */
export function normalizeMediaPath(url: string): string {
  const trimmed = url.trim();
  if (!trimmed || trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("data:")) {
    return trimmed;
  }
  const relative = trimmed.replace(/^\/+/, "").replace(/^uploads\/?/, "");
  return `/uploads/${relative}`;
}

export function mediaUrl(url?: string | null): string {
  if (!url || !url.trim()) return PLACEHOLDER;
  const trimmed = url.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("data:")) {
    return trimmed;
  }
  if (trimmed.startsWith("/")) return trimmed;
  return normalizeMediaPath(trimmed);
}
