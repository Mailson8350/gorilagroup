export const SITE_CONFIG_DEFAULTS: Record<string, string> = {
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

export function sanitizeText(value: unknown, max = 5000): string {
  if (value == null) return "";
  let s = String(value).trim();
  s = s.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  s = s.replace(/[<>]/g, "");
  return s.slice(0, max);
}
