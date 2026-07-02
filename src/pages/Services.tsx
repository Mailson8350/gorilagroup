import { Link } from "react-router-dom";
import { Bed, Music, Zap, Star, Layout, ArrowRight, ShoppingBag } from "lucide-react";
import { motion } from "motion/react";
import { useSettings } from "../contexts/SettingsContext";
import { mediaUrl } from "../lib/media";

export default function Services() {
  const { services, language, t } = useSettings();

  const getIcon = (id: string) => {
    switch (id) {
      case "hostel": return <Bed size={32} />;
      case "gb-som": return <Music size={32} />;
      case "gorila-eletronica": return <Zap size={32} />;
      case "gorila-mininus": return <Star size={32} />;
      case "sala-eventos": return <Layout size={32} />;
      default: return <Layout size={32} />;
    }
  };

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Header */}
      <div className="bg-secondary text-white py-32 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h1 className="text-6xl md:text-8xl font-display font-bold uppercase tracking-tighter leading-none">
            {t("services_title").split(" ")[0]} <br />
            <span className="text-primary">{t("services_title").split(" ")[1] || ""}</span>
          </h1>
          <p className="text-zinc-400 mt-8 max-w-xl text-lg">
            {t("services_desc")}
          </p>
          <Link
            to="/loja"
            className="inline-flex items-center gap-2 mt-8 bg-primary text-secondary px-6 py-3 rounded-xl font-bold text-sm hover:scale-105 transition-transform"
          >
            <ShoppingBag size={18} />
            {t("services_visit_store")}
          </Link>
        </div>
        <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/10 -skew-x-12 translate-x-1/4" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, idx) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="group bg-white rounded-2xl overflow-hidden shadow-2xl border border-zinc-100 card-hover"
            >
              <div className="aspect-video overflow-hidden relative">
                <img 
                  src={mediaUrl(service.banner_url)} 
                  alt={(service as any)[`nome_${language}`]} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                <div 
                  className="absolute top-6 left-6 text-secondary p-4 rounded-xl shadow-xl transition-all group-hover:scale-110"
                  style={{ backgroundColor: service.cor_paleta || "#FFC107" }}
                >
                  {getIcon(service.id)}
                </div>
              </div>
              <div className="p-10">
                <h3 className="text-2xl font-display font-bold mb-4 transition-colors group-hover:text-[var(--service-color)]" style={{ "--service-color": service.cor_paleta } as any}>
                  {(service as any)[`nome_${language}`]}
                </h3>
                <p className="text-zinc-500 mb-8 leading-relaxed h-12 line-clamp-2">
                  {(service as any)[`descricao_${language}`]}
                </p>
                <Link 
                  to={service.path} 
                  className="inline-flex items-center space-x-3 text-sm font-bold uppercase tracking-widest text-secondary hover:text-primary transition-colors"
                >
                  <span style={{ color: service.cor_paleta }}>{t("explore")}</span>
                  <ArrowRight size={16} style={{ color: service.cor_paleta }} />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
