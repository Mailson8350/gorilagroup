import { useState } from "react";
import { Link } from "react-router-dom";
import { useSettings } from "../contexts/SettingsContext";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, Calendar, Tag } from "lucide-react";
import MediaImage from "../components/MediaImage";
import { usePublicList } from "../hooks/usePublicList";
import { mediaUrl } from "../lib/media";

export default function Portfolio() {
  const { services, language, siteConfig, t } = useSettings();
  const { data: projects, loading } = usePublicList<{
    id: number;
    titulo: string;
    descricao: string;
    imagem: string;
    data: string;
    tipo_evento: string;
  }>("/api/portfolio");
  const [filter, setFilter] = useState("All");

  const portfolioService = services.find((s) => s.id === "portfolio");
  const nome =
    (portfolioService as Record<string, string> | undefined)?.[`nome_${language}`] || t("portfolio");
  const banner = mediaUrl(siteConfig.portfolio_banner_url || portfolioService?.banner_url);

  const types = ["All", ...new Set(projects.map((p) => p.tipo_evento).filter(Boolean))];
  const filteredProjects = filter === "All" ? projects : projects.filter((p) => p.tipo_evento === filter);

  return (
    <motion.div className="min-h-screen bg-stone-50">
      <div className="relative h-[60vh] flex items-center justify-center overflow-hidden bg-secondary">
        <div className="absolute inset-0">
          {banner ? (
            <MediaImage
              src={banner}
              alt={nome}
              className="w-full h-full object-cover opacity-50"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-full h-full bg-zinc-800" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        </div>

        <div className="relative z-10 text-center px-4">
          <motion.h1
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-7xl md:text-9xl font-black uppercase italic tracking-tighter text-white"
          >
            {nome}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-primary font-black uppercase tracking-[0.4em] text-sm mt-4"
          >
            {siteConfig.slogan}
          </motion.p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-24">
        {types.length > 1 && (
          <div className="flex flex-wrap justify-center gap-4 mb-20">
            {types.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setFilter(type)}
                className={`px-8 py-3 rounded-full font-black uppercase tracking-widest text-xs transition-all ${
                  filter === type ? "bg-primary text-secondary shadow-xl scale-110" : "bg-white text-zinc-400 hover:bg-zinc-100"
                }`}
              >
                {type === "All" ? "Todos" : type}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <motion.div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredProjects.length === 0 ? (
          <p className="text-center text-zinc-500 font-medium py-16">Nenhum projeto publicado ainda.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            <AnimatePresence mode="popLayout">
              {filteredProjects.map((project) => (
                <motion.div
                  layout
                  key={project.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.4 }}
                  className="group"
                >
                  <div className="relative aspect-video rounded-[2.5rem] overflow-hidden mb-6 shadow-2xl bg-zinc-200">
                    <MediaImage
                      src={project.imagem}
                      alt={project.titulo}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-secondary scale-0 group-hover:scale-100 transition-transform duration-500 delay-100">
                        <ArrowRight />
                      </div>
                    </div>
                    {project.tipo_evento && (
                      <div className="absolute top-6 left-6">
                        <span className="bg-primary text-secondary text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                          {project.tipo_evento}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="px-4">
                    <motion.div className="flex items-center space-x-4 mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                      {project.data && (
                        <span className="flex items-center gap-1">
                          <Calendar size={12} /> {project.data}
                        </span>
                      )}
                      {project.tipo_evento && (
                        <span className="flex items-center gap-1">
                          <Tag size={12} /> {project.tipo_evento}
                        </span>
                      )}
                    </motion.div>
                    <h3 className="text-2xl font-black uppercase italic tracking-tighter text-zinc-900 group-hover:text-primary transition-colors">
                      {project.titulo}
                    </h3>
                    <p className="text-zinc-500 text-sm mt-2 line-clamp-2 leading-relaxed">{project.descricao}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <div className="bg-secondary py-32 text-center px-4">
        <h2 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter text-white mb-8">
          {t("portfolio_want_event")}
        </h2>
        <Link to="/contacto">
          <motion.span
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block bg-primary text-secondary px-12 py-5 rounded-full font-black uppercase tracking-widest text-sm shadow-2xl"
          >
            {t("portfolio_event_cta")}
          </motion.span>
        </Link>
      </div>
    </motion.div>
  );
}
