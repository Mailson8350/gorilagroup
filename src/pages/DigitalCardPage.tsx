import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowUpRight,
  Building2,
  Download,
  Globe,
  Linkedin,
  Mail,
  MessageCircle,
  Phone,
  Sparkles,
} from "lucide-react";
import SeoHead from "../components/SeoHead";
import { useSettings } from "../contexts/SettingsContext";
import { getDigitalCardProfile } from "../lib/digitalCards";

export default function DigitalCardPage() {
  const params = useParams();
  const navigate = useNavigate();
  const { siteConfig } = useSettings();

  const profile = useMemo(() => {
    const fromRoute = getDigitalCardProfile(params.slug);
    if (fromRoute) {
      return {
        ...fromRoute,
        name: siteConfig.digital_card_name || fromRoute.name,
        title: siteConfig.digital_card_title || fromRoute.title,
        company: siteConfig.digital_card_company || fromRoute.company,
        description: siteConfig.digital_card_description || fromRoute.description,
        phone: siteConfig.digital_card_phone || siteConfig.contact_phone || fromRoute.phone,
        email: siteConfig.digital_card_email || siteConfig.contact_email || fromRoute.email,
        whatsapp: siteConfig.digital_card_whatsapp || siteConfig.contact_whatsapp || fromRoute.whatsapp,
        website: siteConfig.digital_card_website || siteConfig.site_url || fromRoute.website,
        linkedin: siteConfig.digital_card_linkedin || fromRoute.linkedin,
        photo: siteConfig.digital_card_photo || fromRoute.photo,
      };
    }

    return undefined;
  }, [params.slug, siteConfig.contact_email, siteConfig.contact_phone, siteConfig.contact_whatsapp, siteConfig.digital_card_company, siteConfig.digital_card_description, siteConfig.digital_card_email, siteConfig.digital_card_linkedin, siteConfig.digital_card_name, siteConfig.digital_card_phone, siteConfig.digital_card_photo, siteConfig.digital_card_title, siteConfig.digital_card_website, siteConfig.digital_card_whatsapp, siteConfig.site_url]);

  if (!profile) {
    navigate("/", { replace: true });
    return null;
  }

  const canonicalUrl = typeof window !== "undefined"
    ? `${window.location.origin}/${profile.slug}`
    : `https://www.grupogorila.com/${profile.slug}`;

  const vCard = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${profile.name}`,
    `ORG:${profile.company}`,
    `TITLE:${profile.title}`,
    `TEL:${profile.phone}`,
    `EMAIL:${profile.email}`,
    `URL:${profile.website}`,
    "END:VCARD",
  ].join("\n");

  const handleDownloadVCard = () => {
    const blob = new Blob([vCard], { type: "text/vcard;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${profile.slug}.vcf`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleWhatsApp = () => {
    const cleaned = profile.whatsapp.replace(/\D/g, "");
    window.open(`https://wa.me/${cleaned}`, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      <SeoHead title={`${profile.name} | ${profile.company}`} />
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(255,193,7,0.18),_transparent_40%),linear-gradient(135deg,_#fffdf7_0%,_#f7f7f7_100%)] px-4 py-10 md:px-6 lg:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-6">
          <div className="overflow-hidden rounded-[2rem] border border-zinc-200 bg-white/95 shadow-[0_30px_80px_rgba(0,0,0,0.12)] backdrop-blur">
            <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
              <div className="p-8 md:p-10 lg:p-14">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.35em] text-secondary">
                  <Sparkles size={14} />
                  Smart Business Card Digital
                </div>

                <div className="mt-8 flex flex-col gap-6 md:flex-row md:items-center">
                  <img
                    src={profile.photo}
                    alt={profile.name}
                    className="h-28 w-28 rounded-full border-4 border-primary/30 object-cover shadow-lg md:h-32 md:w-32"
                  />
                  <div>
                    <h1 className="text-3xl font-display text-secondary sm:text-4xl">{profile.name}</h1>
                    <p className="mt-2 text-lg font-semibold uppercase tracking-[0.25em] text-primary">{profile.title}</p>
                    <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-zinc-600">
                      <Building2 size={16} />
                      {profile.company}
                    </p>
                  </div>
                </div>

                <p className="mt-8 max-w-2xl text-lg text-zinc-700">{profile.description}</p>

                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  <a href={`tel:${profile.phone}`} className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-semibold text-secondary transition hover:-translate-y-0.5 hover:bg-zinc-100">
                    <Phone size={18} className="text-primary" />
                    {profile.phone}
                  </a>
                  <a href={`mailto:${profile.email}`} className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-semibold text-secondary transition hover:-translate-y-0.5 hover:bg-zinc-100">
                    <Mail size={18} className="text-primary" />
                    {profile.email}
                  </a>
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                  <button
                    onClick={handleDownloadVCard}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-secondary px-5 py-3 text-sm font-bold text-white transition hover:scale-[1.01]"
                  >
                    <Download size={18} />
                    Guardar Contacto
                  </button>
                  <button
                    onClick={handleWhatsApp}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-bold text-emerald-700 transition hover:scale-[1.01]"
                  >
                    <MessageCircle size={18} />
                    WhatsApp
                  </button>
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-zinc-200 bg-white px-5 py-3 text-sm font-bold text-secondary transition hover:scale-[1.01]"
                  >
                    <Globe size={18} />
                    Website
                  </a>
                  {profile.linkedin && (
                    <a
                      href={profile.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-5 py-3 text-sm font-bold text-sky-700 transition hover:scale-[1.01]"
                    >
                      <Linkedin size={18} />
                      LinkedIn
                    </a>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}
