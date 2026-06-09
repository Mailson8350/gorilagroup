import { getSupabaseAdmin } from "./supabaseClient";
import type { UploadFolder } from "./uploads";
import {
  SITE_CONFIG_DEFAULTS,
  sanitizeText,
} from "./siteConfigApi";

const IMAGE_KEYS = new Set([
  "logo_url",
  "favicon_url",
  "hero_image",
  "about_image",
  "equipa_banner_url",
  "portfolio_banner_url",
  "og_image",
]);

const MAX_LEN: Record<string, number> = {
  site_name: 120,
  slogan: 300,
  footer_text: 2000,
  copyright_text: 300,
  seo_title: 120,
  seo_description: 320,
  seo_keywords: 500,
  og_title: 120,
  og_description: 320,
  contact_email: 200,
  contact_phone: 80,
  contact_whatsapp: 80,
  contact_address: 500,
  contact_maps_url: 2000,
  contact_hours: 300,
  banner_sliders: 50000,
};

export async function seedSiteConfigDefaults(): Promise<void> {
  const supabase = getSupabaseAdmin();
  for (const [chave, valor] of Object.entries(SITE_CONFIG_DEFAULTS)) {
    const { data } = await supabase.from("configuracoes_site").select("chave").eq("chave", chave).maybeSingle();
    if (!data) {
      const { error } = await supabase.from("configuracoes_site").insert({ chave, valor });
      if (error) throw error;
    }
  }
}

export async function readSiteConfigAsync(): Promise<Record<string, string>> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from("configuracoes_site").select("chave, valor");
  if (error) throw error;
  const config = { ...SITE_CONFIG_DEFAULTS };
  (data || []).forEach((r: { chave: string; valor: string }) => {
    config[r.chave] = r.valor ?? "";
  });
  return config;
}

export async function writeSiteConfigAsync(
  body: Record<string, unknown>,
  img: (folder: UploadFolder, input: string | undefined | null, previous?: string | null) => Promise<string>
): Promise<Record<string, string>> {
  const supabase = getSupabaseAdmin();
  const current = await readSiteConfigAsync();
  const out = { ...current };
  const keys = new Set([...Object.keys(SITE_CONFIG_DEFAULTS), ...Object.keys(body)]);
  const upserts: { chave: string; valor: string }[] = [];

  for (const key of keys) {
    if (!(key in SITE_CONFIG_DEFAULTS) && !body[key]) continue;
    if (body[key] === undefined) continue;

    let val: string;
    if (IMAGE_KEYS.has(key)) {
      val = await img("site", sanitizeText(body[key], 2000), current[key]);
    } else if (key === "banner_sliders") {
      const raw = body[key];
      if (typeof raw === "string") {
        try {
          JSON.parse(raw);
          val = raw.slice(0, MAX_LEN.banner_sliders);
        } catch {
          val = current.banner_sliders;
        }
      } else if (Array.isArray(raw)) {
        val = JSON.stringify(raw).slice(0, MAX_LEN.banner_sliders);
      } else continue;
    } else {
      val = sanitizeText(body[key], MAX_LEN[key] ?? 5000);
    }
    upserts.push({ chave: key, valor: val });
    out[key] = val;
  }

  if (upserts.length) {
    const { error } = await supabase.from("configuracoes_site").upsert(upserts, { onConflict: "chave" });
    if (error) throw error;
  }
  return out;
}

export async function ensurePageServicesAsync(): Promise<void> {
  const pages = [
    {
      id: "portfolio",
      nome_pt: "Portfólio",
      nome_en: "Portfolio",
      nome_fr: "Portfolio",
      nome_es: "Portafolio",
      descricao_pt: "Veja os nossos trabalhos e eventos realizados.",
      descricao_en: "See our work and events performed.",
      descricao_fr: "Découvrez nos travaux et événements réalisés.",
      descricao_es: "Vea nuestros trabajos y eventos realizados.",
      cor_paleta: "#EC4899",
      cor_secundaria: "#000000",
      logo_url: "",
      banner_url: "",
      path: "/portfolio",
    },
    {
      id: "equipa",
      nome_pt: "A Equipa",
      nome_en: "The Team",
      nome_fr: "L'Équipe",
      nome_es: "El Equipo",
      descricao_pt: "Conheça as mentes brilhantes por trás da Gorila.",
      descricao_en: "Meet the brilliant minds behind Gorila.",
      descricao_fr: "Rencontrez les esprits brillants derrière Gorila.",
      descricao_es: "Conoce a las mentes brillantes detrás de Gorila.",
      cor_paleta: "#6366F1",
      cor_secundaria: "#000000",
      logo_url: "",
      banner_url: "",
      path: "/equipa",
    },
    {
      id: "sobre",
      nome_pt: "Sobre Nós",
      nome_en: "About Us",
      nome_fr: "À Propos",
      nome_es: "Sobre Nosotros",
      descricao_pt: "A nossa história, missão e valores.",
      descricao_en: "Our history, mission and values.",
      descricao_fr: "Notre histoire, mission et valeurs.",
      descricao_es: "Nuestra historia, misión y valores.",
      cor_paleta: "#14B8A6",
      cor_secundaria: "#000000",
      logo_url: "",
      banner_url: "",
      path: "/sobre",
    },
  ];
  const supabase = getSupabaseAdmin();
  for (const s of pages) {
    const { data } = await supabase.from("servicos").select("id").eq("id", s.id).maybeSingle();
    if (!data) {
      const { error } = await supabase.from("servicos").insert(s);
      if (error) throw error;
    }
  }
}
