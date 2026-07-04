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

/**
 * Build a simple srcset using width query parameters. This is best-effort and
 * assumes the hosting infra can honor `?w=` or similar params. Returns undefined when not applicable.
 */
export function buildSrcSet(url?: string | null): string | undefined {
  const u = mediaUrl(url);
  if (!u || u === PLACEHOLDER) return undefined;
  // Only build srcset for HTTP(s) or same-origin URLs
  if (!(u.startsWith("/") || u.startsWith("http://") || u.startsWith("https://"))) return undefined;

  const sizes = [400, 800, 1200];
  const entries = sizes.map((w) => `${u}${u.includes("?") ? "&" : "?"}w=${w} ${w}w`);
  return entries.join(", ");
}
