import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin, Youtube, Linkedin } from "lucide-react";
import { useSettings } from "../contexts/SettingsContext";
import MediaImage from "./MediaImage";

const SOCIAL = [
  { key: "social_instagram" as const, Icon: Instagram },
  { key: "social_facebook" as const, Icon: Facebook },
  { key: "social_twitter" as const, Icon: Twitter },
  { key: "social_youtube" as const, Icon: Youtube },
  { key: "social_linkedin" as const, Icon: Linkedin },
];

export default function Footer() {
  const { siteConfig } = useSettings();

  return (
    <footer className="bg-secondary text-white pt-24 pb-12 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
          <div className="space-y-8">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center overflow-hidden shadow-xl group-hover:scale-110 transition-transform">
                <MediaImage
                  src={siteConfig.logo_url}
                  alt={siteConfig.site_name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="text-3xl font-display font-bold tracking-tighter uppercase text-primary">
                {siteConfig.site_name}
              </span>
            </Link>
            <p className="text-zinc-400 text-sm leading-relaxed max-w-xs">{siteConfig.footer_text}</p>
            <div className="flex flex-wrap gap-3">
              {SOCIAL.map(({ key, Icon }) =>
                siteConfig[key] ? (
                  <a
                    key={key}
                    href={siteConfig[key]}
                    target="_blank"
                    rel="noreferrer"
                    className="w-10 h-10 bg-support rounded-lg flex items-center justify-center text-zinc-400 hover:text-primary hover:bg-zinc-800 transition-all"
                  >
                    <Icon size={18} />
                  </a>
                ) : null
              )}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-display font-bold uppercase tracking-widest mb-8 text-white">Empresa</h4>
            <ul className="space-y-4">
              {[
                { label: "Sobre Nós", path: "/sobre" },
                { label: "Portfólio", path: "/portfolio" },
                { label: "Equipa", path: "/equipa" },
                { label: "Contacto", path: "/contacto" },
              ].map((item) => (
                <li key={item.path}>
                  <Link to={item.path} className="text-zinc-400 hover:text-primary text-sm transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-display font-bold uppercase tracking-widest mb-8 text-white">Serviços</h4>
            <ul className="space-y-4">
              {[
                { label: "Hostel", path: "/servicos/hostel" },
                { label: "GB Som", path: "/servicos/gb-som" },
                { label: "Gorila Eletrónica", path: "/servicos/gorila-eletronica" },
                { label: "Gorila Mininus", path: "/servicos/gorila-mininus" },
                { label: "Sala de Eventos", path: "/servicos/sala-eventos" },
              ].map((item) => (
                <li key={item.path}>
                  <Link to={item.path} className="text-zinc-400 hover:text-primary text-sm transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-display font-bold uppercase tracking-widest mb-8 text-white">Contacto</h4>
            <ul className="space-y-6">
              {siteConfig.contact_address && (
                <li className="flex items-start space-x-3">
                  <MapPin size={18} className="text-primary shrink-0 mt-1" />
                  <span className="text-zinc-400 text-sm">{siteConfig.contact_address}</span>
                </li>
              )}
              {siteConfig.contact_phone && (
                <li className="flex items-center space-x-3">
                  <Phone size={18} className="text-primary shrink-0" />
                  <a href={`tel:${siteConfig.contact_phone}`} className="text-zinc-400 text-sm hover:text-white">
                    {siteConfig.contact_phone}
                  </a>
                </li>
              )}
              {siteConfig.contact_email && (
                <li className="flex items-center space-x-3">
                  <Mail size={18} className="text-primary shrink-0" />
                  <a href={`mailto:${siteConfig.contact_email}`} className="text-zinc-400 text-sm hover:text-white">
                    {siteConfig.contact_email}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="pt-12 border-t border-white/5">
          <p className="text-zinc-500 text-xs font-medium text-center md:text-left">{siteConfig.copyright_text}</p>
        </div>
      </div>
    </footer>
  );
}
