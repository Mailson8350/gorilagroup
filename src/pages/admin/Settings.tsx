import { useState, useEffect, FormEvent } from "react";
import {
  Save,
  Globe,
  Users,
  Phone,
  Share2,
  Image as ImageIcon,
  Search,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import ImageField from "../../components/admin/ImageField";
import { useSettings } from "../../contexts/SettingsContext";
import { DEFAULT_SITE_SETTINGS, mergeSiteSettings, type SiteSettings } from "../../lib/siteConfigDefaults";

type TabId = "geral" | "sobre" | "contactos" | "redes" | "banners" | "seo";

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: "geral", label: "Geral", icon: <Globe size={18} /> },
  { id: "sobre", label: "Sobre Nós", icon: <Users size={18} /> },
  { id: "contactos", label: "Contactos", icon: <Phone size={18} /> },
  { id: "redes", label: "Redes Sociais", icon: <Share2 size={18} /> },
  { id: "banners", label: "Banners", icon: <ImageIcon size={18} /> },
  { id: "seo", label: "SEO", icon: <Search size={18} /> },
];

function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{label}</label>
      {children}
      {hint && <p className="text-xs text-zinc-400">{hint}</p>}
    </div>
  );
}

const inputClass =
  "w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500";

export default function AdminSettings() {
  const { refreshSiteConfig } = useSettings();
  const [tab, setTab] = useState<TabId>("geral");
  const [form, setForm] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle");
  const [aboutLang, setAboutLang] = useState<"pt" | "en">("pt");
  const [sliderDraft, setSliderDraft] = useState("");

  useEffect(() => {
    fetch("/api/site-config", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => setForm(mergeSiteSettings(data)))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const set = (key: keyof SiteSettings, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatus("idle");
    const token = localStorage.getItem("adminToken");
    try {
      const res = await fetch("/api/admin/site-config", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const data = await res.json();
        setForm(mergeSiteSettings(data));
        await refreshSiteConfig();
        setStatus("ok");
        setTimeout(() => setStatus("idle"), 3000);
      } else {
        const err = await res.json();
        console.error(err);
        setStatus("error");
      }
    } catch {
      setStatus("error");
    } finally {
      setSaving(false);
    }
  };

  const addSlider = () => {
    if (!sliderDraft.trim()) return;
    try {
      const list = JSON.parse(form.banner_sliders || "[]") as { url: string; title?: string }[];
      list.push({ url: sliderDraft.trim(), title: "" });
      set("banner_sliders", JSON.stringify(list));
      setSliderDraft("");
    } catch {
      set("banner_sliders", JSON.stringify([{ url: sliderDraft.trim(), title: "" }]));
      setSliderDraft("");
    }
  };

  const removeSlider = (index: number) => {
    try {
      const list = JSON.parse(form.banner_sliders || "[]") as { url: string }[];
      list.splice(index, 1);
      set("banner_sliders", JSON.stringify(list));
    } catch {
      set("banner_sliders", "[]");
    }
  };

  let sliders: { url: string; title?: string }[] = [];
  try {
    sliders = JSON.parse(form.banner_sliders || "[]");
  } catch {
    sliders = [];
  }

  if (loading) {
    return <p className="text-zinc-400 p-8">A carregar configurações...</p>;
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase italic tracking-tighter text-zinc-900">Configurações</h1>
          <p className="text-zinc-500 font-medium">Central de gestão do website — reflete no portal público.</p>
        </div>
        {status === "ok" && (
          <span className="flex items-center gap-2 text-emerald-600 text-sm font-bold">
            <CheckCircle2 size={18} /> Guardado com sucesso
          </span>
        )}
        {status === "error" && (
          <span className="flex items-center gap-2 text-red-600 text-sm font-bold">
            <AlertCircle size={18} /> Erro ao guardar
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2 border-b border-zinc-100 pb-4">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
              tab === t.id ? "bg-black text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-[2rem] p-8 border border-zinc-100 shadow-sm space-y-6">
        {tab === "geral" && (
          <div className="space-y-5">
            <Field label="Nome do site">
              <input className={inputClass} value={form.site_name} onChange={(e) => set("site_name", e.target.value)} />
            </Field>
            <Field label="Slogan">
              <input className={inputClass} value={form.slogan} onChange={(e) => set("slogan", e.target.value)} />
            </Field>
            <ImageField label="Logo" value={form.logo_url} onChange={(v) => set("logo_url", v)} folder="site" />
            <ImageField label="Favicon" value={form.favicon_url} onChange={(v) => set("favicon_url", v)} folder="site" />
            <Field label="Idioma predefinido">
              <select
                className={inputClass}
                value={form.default_language}
                onChange={(e) => set("default_language", e.target.value)}
              >
                <option value="pt">Português</option>
                <option value="en">English</option>
                <option value="fr">Français</option>
                <option value="es">Español</option>
              </select>
            </Field>
            <Field label="Texto do rodapé">
              <textarea
                rows={3}
                className={inputClass}
                value={form.footer_text}
                onChange={(e) => set("footer_text", e.target.value)}
              />
            </Field>
            <Field label="Copyright">
              <input
                className={inputClass}
                value={form.copyright_text}
                onChange={(e) => set("copyright_text", e.target.value)}
              />
            </Field>
          </div>
        )}

        {tab === "sobre" && (
          <div className="space-y-5">
            <div className="flex gap-2">
              {(["pt", "en"] as const).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setAboutLang(l)}
                  className={`px-4 py-2 rounded-lg text-xs font-black uppercase ${
                    aboutLang === l ? "bg-emerald-500 text-black" : "bg-zinc-100"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
            {aboutLang === "pt" ? (
              <>
                <Field label="Título (PT)">
                  <input className={inputClass} value={form.about_title_pt} onChange={(e) => set("about_title_pt", e.target.value)} />
                </Field>
                <Field label="Descrição (PT)">
                  <textarea rows={3} className={inputClass} value={form.about_desc_pt} onChange={(e) => set("about_desc_pt", e.target.value)} />
                </Field>
                <Field label="Missão (PT)">
                  <textarea rows={2} className={inputClass} value={form.about_mission_pt} onChange={(e) => set("about_mission_pt", e.target.value)} />
                </Field>
                <Field label="Visão (PT)">
                  <textarea rows={2} className={inputClass} value={form.about_vision_pt} onChange={(e) => set("about_vision_pt", e.target.value)} />
                </Field>
                <Field label="Valores (PT)">
                  <textarea rows={2} className={inputClass} value={form.about_values_pt} onChange={(e) => set("about_values_pt", e.target.value)} />
                </Field>
                <Field label="História (PT)">
                  <textarea rows={4} className={inputClass} value={form.about_history_pt} onChange={(e) => set("about_history_pt", e.target.value)} />
                </Field>
              </>
            ) : (
              <>
                <Field label="Title (EN)">
                  <input className={inputClass} value={form.about_title_en} onChange={(e) => set("about_title_en", e.target.value)} />
                </Field>
                <Field label="Description (EN)">
                  <textarea rows={3} className={inputClass} value={form.about_desc_en} onChange={(e) => set("about_desc_en", e.target.value)} />
                </Field>
                <Field label="Mission (EN)">
                  <textarea rows={2} className={inputClass} value={form.about_mission_en} onChange={(e) => set("about_mission_en", e.target.value)} />
                </Field>
                <Field label="Vision (EN)">
                  <textarea rows={2} className={inputClass} value={form.about_vision_en} onChange={(e) => set("about_vision_en", e.target.value)} />
                </Field>
                <Field label="Values (EN)">
                  <textarea rows={2} className={inputClass} value={form.about_values_en} onChange={(e) => set("about_values_en", e.target.value)} />
                </Field>
                <Field label="History (EN)">
                  <textarea rows={4} className={inputClass} value={form.about_history_en} onChange={(e) => set("about_history_en", e.target.value)} />
                </Field>
              </>
            )}
            <ImageField label="Imagem institucional" value={form.about_image} onChange={(v) => set("about_image", v)} folder="site" />
          </div>
        )}

        {tab === "contactos" && (
          <div className="space-y-5">
            <Field label="Telefone">
              <input className={inputClass} value={form.contact_phone} onChange={(e) => set("contact_phone", e.target.value)} />
            </Field>
            <Field label="WhatsApp">
              <input className={inputClass} value={form.contact_whatsapp} onChange={(e) => set("contact_whatsapp", e.target.value)} />
            </Field>
            <Field label="E-mail">
              <input type="email" className={inputClass} value={form.contact_email} onChange={(e) => set("contact_email", e.target.value)} />
            </Field>
            <Field label="Endereço">
              <textarea rows={2} className={inputClass} value={form.contact_address} onChange={(e) => set("contact_address", e.target.value)} />
            </Field>
            <Field label="URL Google Maps" hint="Link embed ou partilha do mapa">
              <input className={inputClass} value={form.contact_maps_url} onChange={(e) => set("contact_maps_url", e.target.value)} />
            </Field>
            <Field label="Horário">
              <input className={inputClass} value={form.contact_hours} onChange={(e) => set("contact_hours", e.target.value)} />
            </Field>
          </div>
        )}

        {tab === "redes" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {(
              [
                ["social_facebook", "Facebook"],
                ["social_instagram", "Instagram"],
                ["social_linkedin", "LinkedIn"],
                ["social_tiktok", "TikTok"],
                ["social_youtube", "YouTube"],
                ["social_twitter", "X / Twitter"],
                ["social_github", "GitHub"],
              ] as [keyof SiteSettings, string][]
            ).map(([key, label]) => (
              <Field key={key} label={label}>
                <input className={inputClass} value={form[key]} onChange={(e) => set(key, e.target.value)} placeholder="https://..." />
              </Field>
            ))}
          </div>
        )}

        {tab === "banners" && (
          <div className="space-y-6">
            <ImageField
              label="Banner principal (home)"
              value={form.hero_image}
              onChange={(v) => set("hero_image", v)}
              folder="site"
              previewClassName="w-full h-48 rounded-xl object-cover bg-zinc-100"
            />
            <ImageField label="Banner página Equipa" value={form.equipa_banner_url} onChange={(v) => set("equipa_banner_url", v)} folder="site" />
            <ImageField label="Banner página Portfólio" value={form.portfolio_banner_url} onChange={(v) => set("portfolio_banner_url", v)} folder="site" />
            <div className="border-t border-zinc-100 pt-6 space-y-3">
              <p className="text-sm font-bold">Slider (URLs de imagens)</p>
              <div className="flex gap-2">
                <input
                  className={inputClass}
                  placeholder="URL da imagem do slide"
                  value={sliderDraft}
                  onChange={(e) => setSliderDraft(e.target.value)}
                />
                <button type="button" onClick={addSlider} className="px-4 py-2 bg-zinc-900 text-white rounded-xl text-sm font-bold shrink-0">
                  Adicionar
                </button>
              </div>
              <ul className="space-y-2">
                {sliders.map((s, i) => (
                  <li key={i} className="flex items-center justify-between bg-zinc-50 rounded-lg px-3 py-2 text-xs">
                    <span className="truncate flex-1">{s.url}</span>
                    <button type="button" onClick={() => removeSlider(i)} className="text-red-500 font-bold ml-2">
                      Remover
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {tab === "seo" && (
          <div className="space-y-5">
            <Field label="Meta title">
              <input className={inputClass} value={form.seo_title} onChange={(e) => set("seo_title", e.target.value)} />
            </Field>
            <Field label="Meta description">
              <textarea rows={2} className={inputClass} value={form.seo_description} onChange={(e) => set("seo_description", e.target.value)} />
            </Field>
            <Field label="Keywords">
              <input className={inputClass} value={form.seo_keywords} onChange={(e) => set("seo_keywords", e.target.value)} />
            </Field>
            <Field label="Open Graph — título">
              <input className={inputClass} value={form.og_title} onChange={(e) => set("og_title", e.target.value)} />
            </Field>
            <Field label="Open Graph — descrição">
              <textarea rows={2} className={inputClass} value={form.og_description} onChange={(e) => set("og_description", e.target.value)} />
            </Field>
            <ImageField label="Open Graph — imagem" value={form.og_image} onChange={(v) => set("og_image", v)} folder="site" />
          </div>
        )}

        <div className="pt-4 border-t border-zinc-100 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-black text-white px-8 py-3 rounded-xl font-black uppercase tracking-widest flex items-center gap-2 hover:bg-emerald-500 hover:text-black transition-all disabled:opacity-50"
          >
            <Save size={20} />
            {saving ? "A guardar..." : "Guardar configurações"}
          </button>
        </div>
      </form>
    </div>
  );
}
