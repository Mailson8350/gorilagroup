import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ShoppingBag, Bed, Music, Zap, Star, Layout } from "lucide-react";
import { motion } from "motion/react";
import { useSettings } from "../contexts/SettingsContext";
import { mediaUrl } from "../lib/media";

export default function Home() {
  const { services, formatPrice, language, t, siteConfig } = useSettings();
  const siteTitle = siteConfig.site_name || "GORILA";
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/produtos")
      .then((r) => r.json())
      .then((data) => setFeaturedProducts(Array.isArray(data) ? data.slice(0, 4) : []))
      .catch(console.error);
  }, []);

  const getIcon = (id: string) => {
    switch (id) {
      case "hostel": return <Bed />;
      case "gb-som": return <Music />;
      case "gorila-eletronica": return <Zap />;
      case "gorila-mininus": return <Star />;
      case "sala-eventos": return <Layout />;
      default: return <Layout />;
    }
  };

  return (
    <div className="space-y-24 pb-24">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center overflow-hidden bg-secondary">
        <div className="absolute inset-0 z-0">
          <img 
            src={mediaUrl(siteConfig.hero_image)} 
            alt="Gorila Hub Hero" 
            className="w-full h-full object-cover opacity-40"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-secondary/80 via-secondary/40 to-secondary" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-6xl md:text-9xl font-display font-bold text-white tracking-tighter uppercase leading-none">
              {siteTitle}
            </h1>
            <p className="mt-6 text-xl md:text-2xl text-zinc-300 font-medium tracking-wide">
              {siteConfig.slogan}
            </p>
            <div className="mt-12 flex flex-wrap justify-center gap-6">
              <Link to="/servicos" className="btn-primary flex items-center space-x-2">
                <span>{t("explore")}</span>
              </Link>
              <Link to="/portfolio" className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-lg font-bold transition-all border border-white/20">
                {t("portfolio")}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-display font-bold uppercase tracking-tight">{t("services_title")}</h2>
          <div className="w-20 h-1.5 bg-primary mx-auto mt-4 rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.slice(0, 5).map((service, idx) => (
            <motion.div
              key={service.id}
              whileHover={{ y: -10 }}
              className="group bg-white p-10 rounded-2xl shadow-xl border border-zinc-100 card-hover overflow-hidden relative"
            >
              <div 
                className="w-16 h-16 text-secondary rounded-xl flex items-center justify-center mb-8 shadow-lg"
                style={{ backgroundColor: service.cor_paleta }}
              >
                {getIcon(service.id)}
              </div>
              <h3 className="text-2xl font-display font-bold mb-4">{(service as any)[`nome_${language}`]}</h3>
              <p className="text-zinc-500 mb-8 line-clamp-2">{(service as any)[`descricao_${language}`]}</p>
              <Link to={service.path} className="inline-flex items-center space-x-2 text-sm font-bold uppercase tracking-widest text-secondary hover:text-primary transition-colors">
                <span style={{ color: service.cor_paleta }}>{t("explore")}</span>
                <ArrowRight size={14} style={{ color: service.cor_paleta }} />
              </Link>
              
              {/* Hover background effect */}
              <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-primary/5 rounded-full group-hover:scale-150 transition-transform duration-500" />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-zinc-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-4xl font-display font-bold uppercase">{t("store")}</h2>
              <p className="text-zinc-500 mt-2">Equipamentos de alta performance para o seu som.</p>
            </div>
            <Link to="/loja" className="text-primary font-bold hover:underline flex items-center space-x-2">
              <span>Ver Loja</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-zinc-100 group card-hover">
                <div className="aspect-square bg-zinc-100 overflow-hidden">
                  <img src={mediaUrl(product.imagem)} alt={product.nome} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                </div>
                <div className="p-6">
                  <h4 className="font-bold text-lg mb-1">{product.nome}</h4>
                  <p className="text-primary font-black text-xl">{formatPrice(product.preco)}</p>
                  <Link to={`/loja/produto/${product.id}`} className="mt-4 block text-center bg-zinc-100 hover:bg-primary text-secondary py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors">
                    Ver produto
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-secondary rounded-3xl p-12 md:p-20 text-center relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-4xl md:text-6xl font-display font-bold text-white uppercase tracking-tighter">
              PRONTO PARA <span className="text-primary">RESERVAR?</span>
            </h2>
            <p className="mt-6 text-zinc-400 text-lg max-w-2xl mx-auto">
              Garanta o seu lugar no nosso hostel ou reserve os melhores equipamentos para o seu evento hoje mesmo.
            </p>
            <div className="mt-10 flex justify-center gap-4">
              <Link to="/contacto" className="btn-primary">
                Falar Connosco
              </Link>
            </div>
          </div>
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-white rounded-full" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-white rounded-full" />
          </div>
        </div>
      </section>
    </div>
  );
}
