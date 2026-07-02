import { Link, useParams } from "react-router-dom";
import { useSettings } from "../contexts/SettingsContext";
import { motion } from "motion/react";
import { useState, useEffect, FormEvent, useMemo } from "react";
import { ArrowRight, MessageSquare, X, Sparkles, Target, Compass, Heart, BookOpen, ShoppingBag } from "lucide-react";
import MediaImage from "../components/MediaImage";
import type { SiteSettings } from "../lib/siteConfigDefaults";

/** Página /sobre usa o registo `servicos.id = sobre`; BDs antigas podem não tê-lo — evita spinner infinito. */
function fallbackSobreFromSiteConfig(site: SiteSettings) {
  return {
    id: "sobre",
    nome_pt: site.about_title_pt || "Sobre Nós",
    nome_en: site.about_title_en || "About Us",
    nome_fr: "À Propos",
    nome_es: "Sobre Nosotros",
    descricao_pt: site.about_desc_pt || "",
    descricao_en: site.about_desc_en || "",
    descricao_fr: site.about_desc_pt || "",
    descricao_es: site.about_desc_pt || "",
    cor_paleta: "#14B8A6",
    cor_secundaria: "#000000",
    logo_url: site.logo_url || "",
    banner_url: site.about_image || site.hero_image || "",
    path: "/sobre",
  };
}

interface Opcao {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  imagem: string;
}

export default function GenericServicePage({ serviceId: propServiceId }: { serviceId?: string }) {
  const { serviceId: paramServiceId } = useParams();
  const serviceId = propServiceId || paramServiceId;
  const { services, language, formatPrice, siteConfig, t } = useSettings();
  const service = useMemo(() => {
    const fromDb = services.find((s) => s.id === serviceId);
    if (fromDb) return fromDb;
    if (serviceId === "sobre") return fallbackSobreFromSiteConfig(siteConfig);
    return undefined;
  }, [services, serviceId, siteConfig]);
  const [items, setItems] = useState<Opcao[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestOpcao, setRequestOpcao] = useState<Opcao | null>(null);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [submitStatus, setSubmitStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [submitError, setSubmitError] = useState("");

  const loadOpcoes = () => {
    if (!serviceId || serviceId === "hostel" || serviceId === "sobre") return;
    setLoadingItems(true);
    fetch(`/api/servicos/${encodeURIComponent(serviceId)}/opcoes`, { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch(() => setItems([]))
      .finally(() => setLoadingItems(false));
  };

  useEffect(() => {
    loadOpcoes();
    const onFocus = () => loadOpcoes();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [serviceId]);

  const openRequest = (opcao: Opcao | null) => {
    setRequestOpcao(opcao);
    setShowRequestModal(true);
    setSubmitStatus("idle");
    setSubmitError("");
  };

  const handleSolicitar = async (e: FormEvent) => {
    e.preventDefault();
    if (!serviceId) return;
    setSubmitStatus("loading");
    setSubmitError("");
    try {
      const res = await fetch("/api/solicitacoes-servico", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          servico_id: serviceId,
          opcao_id: requestOpcao?.id || null,
          nome_cliente: nome,
          email_cliente: email,
          telefone,
          mensagem,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSubmitStatus("ok");
        setNome("");
        setEmail("");
        setTelefone("");
        setMensagem("");
        setTimeout(() => {
          setShowRequestModal(false);
          setRequestOpcao(null);
          setSubmitStatus("idle");
        }, 2000);
      } else {
        setSubmitStatus("error");
        setSubmitError(data.error || "Erro ao enviar solicitação.");
      }
    } catch {
      setSubmitStatus("error");
      setSubmitError("Falha de rede. Tente novamente.");
    }
  };

  if (!service) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <motion.div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black mb-4" />
        <p className="font-bold text-zinc-400">{t("generic_loading_service")}</p>
      </div>
    );
  }

  const isAbout = serviceId === "sobre";
  const langSuffix = language === "en" ? "_en" : language === "fr" ? "_fr" : language === "es" ? "_es" : "_pt";
  const serviceNome =
    (isAbout && siteConfig[`about_title${langSuffix}` as keyof typeof siteConfig]) ||
    (service as Record<string, string>)[`nome_${language}`] ||
    service.nome_pt;
  const descricao =
    (isAbout && siteConfig[`about_desc${langSuffix}` as keyof typeof siteConfig]) ||
    (service as Record<string, string>)[`descricao_${language}`] ||
    service.descricao_pt;

  const aboutMission = isAbout ? String(siteConfig[`about_mission${langSuffix}` as keyof SiteSettings] || "").trim() : "";
  const aboutVision = isAbout ? String(siteConfig[`about_vision${langSuffix}` as keyof SiteSettings] || "").trim() : "";
  const aboutValues = isAbout ? String(siteConfig[`about_values${langSuffix}` as keyof SiteSettings] || "").trim() : "";
  const aboutHistory = isAbout ? String(siteConfig[`about_history${langSuffix}` as keyof SiteSettings] || "").trim() : "";

  const heroBanner =
    isAbout ? siteConfig.about_image || siteConfig.hero_image || service.banner_url : service.banner_url;
  const heroLogo = isAbout ? siteConfig.logo_url || service.logo_url : service.logo_url;

  /** Página institucional: layout e hierarquia de conteúdo distintos dos serviços (sem repetir intro no herói). */
  if (isAbout) {
    const slogan = siteConfig.slogan?.trim();
    const accent = service.cor_paleta || "#14B8A6";
    /** Fundo do herói: prioriza hero/banner para não repetir a mesma foto institucional no corpo. */
    const aboutHeroBg =
      siteConfig.hero_image?.trim() ||
      (service.banner_url || "").trim() ||
      siteConfig.about_image?.trim() ||
      "";
    const institutionalImg = (siteConfig.about_image || "").trim();
    const showInstitutionalImage = institutionalImg.length > 0 && institutionalImg !== aboutHeroBg;
    const L =
      language === "en"
        ? {
            mission: "Mission",
            vision: "Vision",
            values: "Values",
            history: "Our story",
            intro: "Who we are",
            contact: "Contact",
            cta: "Send a message",
            ctaHint: "Partnerships, press or general questions.",
            linkContact: "Full contacts & location",
          }
        : language === "fr"
        ? {
            mission: "Mission",
            vision: "Vision",
            values: "Valeurs",
            history: "Notre histoire",
            intro: "Qui nous sommes",
            contact: "Contact",
            cta: "Envoyer un message",
            ctaHint: "Partenariats, presse ou questions générales.",
            linkContact: "Contacts complets et localisation",
          }
        : language === "es"
        ? {
            mission: "Misión",
            vision: "Visión",
            values: "Valores",
            history: "Nuestra historia",
            intro: "Quiénes somos",
            contact: "Contacto",
            cta: "Enviar mensaje",
            ctaHint: "Colaboraciones, prensa o consultas generales.",
            linkContact: "Contactos completos y ubicación",
          }
        : {
            mission: "Missão",
            vision: "Visão",
            values: "Valores",
            history: "História",
            intro: "Quem somos",
            contact: "Contacto",
            cta: "Enviar mensagem",
            ctaHint: "Parcerias, imprensa ou questões gerais.",
            linkContact: "Contactos completos e localização",
          };

    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100">
        <section className="relative min-h-[52vh] flex flex-col justify-end pb-16 md:pb-24 px-4 overflow-hidden">
          <div className="absolute inset-0 opacity-[0.35]">
            {aboutHeroBg ? (
              <MediaImage src={aboutHeroBg} alt="" className="w-full h-full object-cover" />
            ) : null}
          </div>
          <div
            className="absolute inset-0 opacity-90"
            style={{
              background: `linear-gradient(165deg, ${accent}22 0%, rgb(9 9 11) 45%, rgb(9 9 11) 100%)`,
            }}
          />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(255,255,255,0.12),transparent)]" />
          <div className="relative z-10 max-w-4xl mx-auto w-full">
            <div className="flex items-center gap-4 mb-10">
              <div
                className="h-14 w-14 md:h-16 md:w-16 rounded-2xl p-2 flex items-center justify-center ring-1 ring-white/15 bg-white/5 backdrop-blur-sm"
                style={{ boxShadow: `0 0 40px ${accent}44` }}
              >
                <MediaImage src={heroLogo} alt="" className="max-h-full max-w-full object-contain" />
              </div>
              <div className="h-px flex-1 max-w-[120px] bg-gradient-to-r from-white/30 to-transparent" />
              <Sparkles className="text-white/40 shrink-0" size={20} />
            </div>
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl sm:text-6xl md:text-7xl font-black uppercase italic tracking-tighter text-white leading-[0.95]"
            >
              {String(serviceNome)}
            </motion.h1>
            {slogan ? (
              <p className="mt-6 text-lg md:text-xl text-zinc-400 font-medium max-w-2xl leading-snug">{slogan}</p>
            ) : null}
          </div>
        </section>

        <div className="relative z-10 -mt-10 md:-mt-14 px-4 pb-24">
          <div className="max-w-5xl mx-auto rounded-[2.5rem] bg-stone-100 text-zinc-900 shadow-2xl shadow-black/40 ring-1 ring-black/5 overflow-hidden">
            <div className="p-8 md:p-14 lg:p-16 space-y-14 md:space-y-16">
              {descricao.trim() ? (
                <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-start">
                  <div className="lg:col-span-5 space-y-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-teal-700/80">{L.intro}</p>
                    <div className="h-1 w-12 rounded-full" style={{ backgroundColor: accent }} />
                  </div>
                  <div className="lg:col-span-7">
                    <p className="text-lg md:text-xl leading-relaxed text-zinc-700 whitespace-pre-wrap font-medium">
                      {descricao}
                    </p>
                  </div>
                </div>
              ) : null}

              {showInstitutionalImage ? (
                <div className="grid lg:grid-cols-2 gap-8 items-center">
                  <div className="order-2 lg:order-1 rounded-[2rem] overflow-hidden ring-1 ring-black/10 shadow-xl aspect-[4/3] lg:aspect-auto lg:min-h-[280px] bg-zinc-200">
                    <MediaImage src={institutionalImg} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="order-1 lg:order-2 space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400">Institucional</p>
                    <p className="text-sm text-zinc-600 leading-relaxed">
                      {language === "en"
                        ? "A visual snapshot of our space and team — details and story continue below."
                        : "Um olhar sobre o nosso espaço e equipa — a história e os pormenores seguem abaixo."}
                    </p>
                  </div>
                </div>
              ) : null}

              {(aboutMission || aboutVision) && (
                <div className="grid md:grid-cols-2 gap-6">
                  {aboutMission ? (
                    <div className="rounded-3xl bg-white p-8 ring-1 ring-zinc-200/80 shadow-sm">
                      <div className="flex items-center gap-3 mb-4 text-teal-800">
                        <Target size={22} strokeWidth={2.25} />
                        <h3 className="text-xs font-black uppercase tracking-widest">{L.mission}</h3>
                      </div>
                      <p className="text-zinc-700 leading-relaxed whitespace-pre-wrap">{aboutMission}</p>
                    </div>
                  ) : null}
                  {aboutVision ? (
                    <div className="rounded-3xl bg-white p-8 ring-1 ring-zinc-200/80 shadow-sm">
                      <div className="flex items-center gap-3 mb-4 text-teal-800">
                        <Compass size={22} strokeWidth={2.25} />
                        <h3 className="text-xs font-black uppercase tracking-widest">{L.vision}</h3>
                      </div>
                      <p className="text-zinc-700 leading-relaxed whitespace-pre-wrap">{aboutVision}</p>
                    </div>
                  ) : null}
                </div>
              )}

              {aboutValues ? (
                <div className="rounded-3xl bg-zinc-900 text-zinc-100 p-8 md:p-10">
                  <div className="flex items-center gap-3 mb-5 text-teal-300">
                    <Heart size={22} strokeWidth={2.25} />
                    <h3 className="text-xs font-black uppercase tracking-widest">{L.values}</h3>
                  </div>
                  <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap text-base md:text-lg">{aboutValues}</p>
                </div>
              ) : null}

              {aboutHistory ? (
                <div className="border-l-4 pl-8 md:pl-10 py-2" style={{ borderColor: accent }}>
                  <div className="flex items-center gap-3 mb-4 text-zinc-500">
                    <BookOpen size={20} />
                    <h3 className="text-xs font-black uppercase tracking-widest">{L.history}</h3>
                  </div>
                  <p className="text-zinc-700 leading-relaxed whitespace-pre-wrap text-base md:text-lg max-w-3xl">
                    {aboutHistory}
                  </p>
                </div>
              ) : null}
            </div>

            <div
              className="px-8 md:px-14 lg:px-16 py-10 flex flex-col md:flex-row md:items-center md:justify-between gap-8 border-t border-zinc-200/80 bg-white/60 backdrop-blur-sm"
              style={{ borderTopColor: `${accent}33` }}
            >
              <div>
                <h3 className="text-xl md:text-2xl font-black uppercase italic tracking-tight text-zinc-900">{L.contact}</h3>
                <p className="text-sm text-zinc-600 mt-2 max-w-md">{L.ctaHint}</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => openRequest(null)}
                  className="px-8 py-4 rounded-2xl font-black uppercase text-sm tracking-wide text-black shadow-lg transition hover:opacity-90"
                  style={{ backgroundColor: accent }}
                >
                  {L.cta}
                </button>
                <Link
                  to="/contacto"
                  className="px-8 py-4 rounded-2xl font-bold uppercase text-sm text-center ring-2 ring-zinc-900/10 hover:bg-zinc-900 hover:text-white transition"
                >
                  {L.linkContact}
                </Link>
              </div>
            </div>
          </div>
        </div>

        {showRequestModal && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-[2rem] w-full max-w-md p-8 relative text-zinc-900">
              <button
                type="button"
                onClick={() => setShowRequestModal(false)}
                className="absolute top-4 right-4 p-2 hover:bg-zinc-100 rounded-full"
              >
                <X size={20} />
              </button>
              <h3 className="text-xl font-black uppercase italic mb-1">{t("generic_request_modal_title")}</h3>
              {requestOpcao ? (
                <p className="text-sm text-zinc-500 mb-6">
                  {t("generic_request_option_prefix")} <strong>{requestOpcao.nome}</strong>
                </p>
              ) : (
                <p className="text-sm text-zinc-500 mb-6">{t("generic_request_general_prefix")} {serviceNome}</p>
              )}
              {submitStatus === "ok" ? (
                <p className="text-emerald-600 font-bold text-center py-8">{t("generic_request_success")}</p>
              ) : (
                <form onSubmit={handleSolicitar} className="space-y-3">
                  <input
                    required
                    placeholder={t("generic_request_placeholder_name")}
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="w-full bg-zinc-50 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black"
                  />
                  <input
                    type="email"
                    placeholder={t("generic_request_placeholder_email")}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-zinc-50 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black"
                  />
                  <input
                    required
                    placeholder={t("generic_request_placeholder_phone")}
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    className="w-full bg-zinc-50 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black"
                  />
                  <textarea
                    rows={3}
                    placeholder={t("generic_request_placeholder_message")}
                    value={mensagem}
                    onChange={(e) => setMensagem(e.target.value)}
                    className="w-full bg-zinc-50 rounded-xl px-4 py-3 text-sm outline-none resize-none focus:ring-2 focus:ring-black"
                  />
                  <button type="submit" disabled={submitStatus === "loading"} className="w-full btn-primary disabled:opacity-50">
                    {submitStatus === "loading" ? t("contact_status_loading") : t("generic_request_submit")}
                  </button>
                  {submitStatus === "error" && <p className="text-red-600 text-sm">{submitError}</p>}
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 pb-24">
      <div className="relative h-[70vh] flex items-center justify-center overflow-hidden bg-secondary">
        <div className="absolute inset-0">
          <MediaImage src={heroBanner} alt={serviceNome} className="w-full h-full object-cover opacity-50" />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
        </div>
        <motion.div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-32 h-32 mx-auto mb-10 rounded-[2.5rem] p-5 flex items-center justify-center shadow-2xl border border-white/20"
            style={{ backgroundColor: `${service.cor_paleta}33` }}
          >
            <MediaImage src={heroLogo} alt="Logo" className="w-full h-full object-contain" />
          </motion.div>
          <h1 className="text-6xl md:text-9xl font-black uppercase italic tracking-tighter text-white mb-6">{serviceNome}</h1>
          <p className="text-zinc-300 text-lg md:text-2xl font-medium max-w-2xl mx-auto">{descricao}</p>
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-20 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-12">
            <div className="bg-white p-12 rounded-[2.5rem] shadow-xl border border-zinc-100">
              <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-8">{t("generic_service_offering_title")}</h2>
              <p className="text-zinc-600 text-lg leading-relaxed whitespace-pre-wrap">{descricao}</p>
            </div>

            <div className="space-y-8">
              <h2 className="text-3xl font-black uppercase italic tracking-tighter">{t("generic_service_options_title")}</h2>
              {loadingItems ? (
                <div className="flex justify-center py-16">
                  <div className="animate-spin h-10 w-10 border-t-2 border-b-2 border-black rounded-full" />
                </div>
              ) : items.length === 0 ? (
                <p className="text-zinc-500 text-center py-12 bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">
                  {t("generic_service_no_options")}
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-[2rem] overflow-hidden border border-zinc-100 shadow-sm hover:shadow-xl transition-all group"
                    >
                      <div className="aspect-square overflow-hidden bg-zinc-100">
                        <MediaImage
                          src={item.imagem}
                          alt={item.nome}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                      <div className="p-6">
                        <h3 className="font-black uppercase italic text-lg mb-1">{item.nome}</h3>
                        <p className="text-zinc-500 text-xs mb-4 line-clamp-2">{item.descricao}</p>
                        <div className="flex items-center justify-between pt-4 border-t border-zinc-50">
                          <span className="font-black" style={{ color: service.cor_secundaria || "#059669" }}>
                            {formatPrice(item.preco || 0)}
                          </span>
                          <button
                            type="button"
                            onClick={() => openRequest(item)}
                            className="p-3 text-white rounded-xl"
                            style={{ backgroundColor: service.cor_paleta }}
                          >
                            <ArrowRight size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-zinc-950 text-white p-8 rounded-[2.5rem] sticky top-24 shadow-2xl">
              <h3 className="text-2xl font-black uppercase italic mb-6">{t("generic_request_title")}</h3>
              <p className="text-zinc-500 text-sm mb-6">{t("generic_request_cta_hint")}</p>
              <button
                type="button"
                onClick={() => openRequest(null)}
                className="w-full py-4 rounded-2xl font-black uppercase bg-white text-black mb-3 flex items-center justify-center gap-2"
              >
                <MessageSquare size={18} /> {t("generic_request_button")}
              </button>
              <Link
                to="/loja"
                className="w-full py-4 rounded-2xl font-bold uppercase flex items-center justify-center gap-2 mb-3 ring-2 ring-white/20 hover:bg-white hover:text-black transition-colors"
              >
                <ShoppingBag size={18} /> {t("generic_request_visit_store")}
              </Link>
              <Link to="/contacto" className="block text-center text-xs text-zinc-500 hover:text-white uppercase font-bold">
                {t("generic_request_other_contacts")}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {showRequestModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-md p-8 relative">
            <button
              type="button"
              onClick={() => setShowRequestModal(false)}
              className="absolute top-4 right-4 p-2 hover:bg-zinc-100 rounded-full"
            >
              <X size={20} />
            </button>
            <h3 className="text-xl font-black uppercase italic mb-1">Solicitar</h3>
            {requestOpcao ? (
              <p className="text-sm text-zinc-500 mb-6">
                Opção: <strong>{requestOpcao.nome}</strong>
              </p>
            ) : (
              <p className="text-sm text-zinc-500 mb-6">Pedido geral — {serviceNome}</p>
            )}
            {submitStatus === "ok" ? (
              <p className="text-emerald-600 font-bold text-center py-8">Enviado com sucesso!</p>
            ) : (
              <form onSubmit={handleSolicitar} className="space-y-3">
                <input
                  required
                  placeholder="Nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full bg-zinc-50 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black"
                />
                <input
                  type="email"
                  placeholder="E-mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-zinc-50 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black"
                />
                <input
                  required
                  placeholder="Telefone"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  className="w-full bg-zinc-50 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black"
                />
                <textarea
                  rows={3}
                  placeholder="Mensagem"
                  value={mensagem}
                  onChange={(e) => setMensagem(e.target.value)}
                  className="w-full bg-zinc-50 rounded-xl px-4 py-3 text-sm outline-none resize-none focus:ring-2 focus:ring-black"
                />
                <button type="submit" disabled={submitStatus === "loading"} className="w-full btn-primary disabled:opacity-50">
                  {submitStatus === "loading" ? "A enviar..." : "Enviar"}
                </button>
                {submitStatus === "error" && <p className="text-red-600 text-sm">{submitError}</p>}
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
