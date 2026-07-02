/** Chaves em configuracoes_site (key-value). Valores são strings; JSON onde indicado. */
export type SiteSettings = {
  logo_url: string;
  favicon_url: string;
  hero_image: string;
  site_name: string;
  slogan: string;
  default_language: string;
  footer_text: string;
  copyright_text: string;
  about_title_pt: string;
  about_desc_pt: string;
  about_mission_pt: string;
  about_vision_pt: string;
  about_values_pt: string;
  about_history_pt: string;
  about_image: string;
  about_title_en: string;
  about_desc_en: string;
  about_mission_en: string;
  about_vision_en: string;
  about_values_en: string;
  about_history_en: string;
  contact_phone: string;
  contact_whatsapp: string;
  contact_email: string;
  contact_address: string;
  contact_maps_url: string;
  contact_hours: string;
  social_facebook: string;
  social_instagram: string;
  social_linkedin: string;
  social_tiktok: string;
  social_youtube: string;
  social_twitter: string;
  social_github: string;
  equipa_banner_url: string;
  portfolio_banner_url: string;
  banner_sliders: string;
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
  og_title: string;
  og_description: string;
  og_image: string;
};

export const SITE_CONFIG_KEYS = Object.keys({
  logo_url: "/uploads/site/1778852957422-4760912d24d7.png",
  favicon_url: "",
  hero_image: "",
  site_name: "Gorila",
  slogan: "Ecossistema empresarial na Guiné-Bissau",
  default_language: "pt",
  footer_text: "O ecossistema empresarial líder na Guiné-Bissau, integrando tecnologia, serviços e experiências únicas.",
  copyright_text: `© ${new Date().getFullYear()} Gorila. Todos os direitos reservados.`,
  about_title_pt: "Sobre Nós",
  about_desc_pt: "",
  about_mission_pt: "",
  about_vision_pt: "",
  about_values_pt: "",
  about_history_pt: "",
  about_image: "",
  about_title_en: "About Us",
  about_desc_en: "",
  about_mission_en: "",
  about_vision_en: "",
  about_values_en: "",
  about_history_en: "",
  contact_phone: "+245 95 000 0000",
  contact_whatsapp: "",
  contact_email: "geral@gorila.gw",
  contact_address: "Avenida Amílcar Cabral, Bissau, Guiné-Bissau",
  contact_maps_url: "",
  contact_hours: "Seg–Sex: 09:00–18:00",
  social_facebook: "",
  social_instagram: "",
  social_linkedin: "",
  social_tiktok: "",
  social_youtube: "",
  social_twitter: "",
  social_github: "",
  equipa_banner_url: "",
  portfolio_banner_url: "",
  banner_sliders: "[]",
  seo_title: "Gorila — Ecossistema empresarial",
  seo_description: "",
  seo_keywords: "",
  og_title: "",
  og_description: "",
  og_image: "",
} satisfies SiteSettings) as (keyof SiteSettings)[];

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  logo_url: "/uploads/site/1778852957422-4760912d24d7.png",
  favicon_url: "",
  hero_image: "",
  site_name: "Gorila",
  slogan: "Ecossistema empresarial na Guiné-Bissau",
  default_language: "pt",
  footer_text:
    "O ecossistema empresarial líder na Guiné-Bissau, integrando tecnologia, serviços e experiências únicas.",
  copyright_text: `© ${new Date().getFullYear()} Gorila. Todos os direitos reservados.`,
  about_title_pt: "Sobre Nós",
  about_desc_pt: "",
  about_mission_pt: "",
  about_vision_pt: "",
  about_values_pt: "",
  about_history_pt: "",
  about_image: "",
  about_title_en: "About Us",
  about_desc_en: "",
  about_mission_en: "",
  about_vision_en: "",
  about_values_en: "",
  about_history_en: "",
  contact_phone: "+245 95 000 0000",
  contact_whatsapp: "",
  contact_email: "geral@gorila.gw",
  contact_address: "Avenida Amílcar Cabral, Bissau, Guiné-Bissau",
  contact_maps_url: "",
  contact_hours: "Seg–Sex: 09:00–18:00",
  social_facebook: "",
  social_instagram: "",
  social_linkedin: "",
  social_tiktok: "",
  social_youtube: "",
  social_twitter: "",
  social_github: "",
  equipa_banner_url: "",
  portfolio_banner_url: "",
  banner_sliders: "[]",
  seo_title: "Gorila — Ecossistema empresarial",
  seo_description: "",
  seo_keywords: "",
  og_title: "",
  og_description: "",
  og_image: "",
};

export function mergeSiteSettings(raw: Record<string, string | undefined>): SiteSettings {
  const out = { ...DEFAULT_SITE_SETTINGS };
  for (const key of SITE_CONFIG_KEYS) {
    if (raw[key] !== undefined && raw[key] !== null) {
      (out as Record<string, string>)[key] = String(raw[key]);
    }
  }
  return out;
}
