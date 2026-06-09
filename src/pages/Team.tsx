import { useSettings } from "../contexts/SettingsContext";
import { motion } from "motion/react";
import { Facebook, Instagram, Twitter, Linkedin, User } from "lucide-react";
import MediaImage from "../components/MediaImage";
import { usePublicList } from "../hooks/usePublicList";
import { mediaUrl } from "../lib/media";

function parseSocial(raw: unknown): Record<string, string> {
  if (!raw) return {};
  if (typeof raw === "object" && raw !== null) return raw as Record<string, string>;
  try {
    return JSON.parse(String(raw));
  } catch {
    return {};
  }
}

export default function Team() {
  const { services, language, siteConfig, t } = useSettings();
  const { data: members, loading } = usePublicList<{
    id: number;
    nome: string;
    cargo: string;
    foto: string;
    bio: string;
    redes_sociais: string;
  }>("/api/equipa");

  const teamService = services.find((s) => s.id === "equipa");
  const nome =
    (teamService as Record<string, string> | undefined)?.[`nome_${language}`] ||
    (language === "en" ? siteConfig.about_title_en : siteConfig.about_title_pt) ||
    t("team");
  const descricao =
    (teamService as Record<string, string> | undefined)?.[`descricao_${language}`] ||
    siteConfig.footer_text;
  const banner = mediaUrl(siteConfig.equipa_banner_url || teamService?.banner_url);

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="relative h-[60vh] flex items-center justify-center overflow-hidden bg-secondary">
        <div className="absolute inset-0">
          {banner ? (
            <MediaImage
              src={banner}
              alt={nome}
              className="w-full h-full object-cover opacity-40 blur-sm scale-110"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-full h-full bg-zinc-800" />
          )}
          <motion.div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl">
          <motion.h1
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="text-7xl md:text-9xl font-black uppercase italic tracking-tighter text-white mb-6"
          >
            {nome}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-zinc-300 text-xl font-medium max-w-2xl mx-auto"
          >
            {descricao}
          </motion.p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-24">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : members.length === 0 ? (
          <p className="text-center text-zinc-500 font-medium py-16">A equipa será publicada em breve.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {members.map((member, idx) => {
              const redes = parseSocial(member.redes_sociais);

              return (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="group"
                >
                  <div className="relative aspect-[4/5] rounded-[3rem] overflow-hidden mb-8 shadow-2xl bg-zinc-200">
                    {member.foto ? (
                      <MediaImage
                        src={member.foto}
                        alt={member.nome}
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User size={100} className="text-zinc-300" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <div className="absolute bottom-8 left-8 right-8 flex justify-center space-x-6 translate-y-20 group-hover:translate-y-0 transition-transform duration-500">
                      {redes?.facebook && (
                        <a href={redes.facebook} target="_blank" rel="noreferrer" className="text-white hover:text-primary">
                          <Facebook size={20} />
                        </a>
                      )}
                      {redes?.instagram && (
                        <a href={redes.instagram} target="_blank" rel="noreferrer" className="text-white hover:text-primary">
                          <Instagram size={20} />
                        </a>
                      )}
                      {redes?.twitter && (
                        <a href={redes.twitter} target="_blank" rel="noreferrer" className="text-white hover:text-primary">
                          <Twitter size={20} />
                        </a>
                      )}
                      {redes?.linkedin && (
                        <a href={redes.linkedin} target="_blank" rel="noreferrer" className="text-white hover:text-primary">
                          <Linkedin size={20} />
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="text-center px-4">
                    <h3 className="text-3xl font-black uppercase italic tracking-tighter text-zinc-900 mb-1 group-hover:text-primary transition-colors">
                      {member.nome}
                    </h3>
                    <p className="text-xs font-black uppercase tracking-[0.3em] text-zinc-400 mb-4">{member.cargo}</p>
                    {member.bio && (
                      <p className="text-zinc-500 text-sm leading-relaxed line-clamp-3 italic font-medium">"{member.bio}"</p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
