import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ShoppingCart, ArrowLeft, Shield, Truck, RotateCcw, Check } from "lucide-react";
import { useSettings } from "../contexts/SettingsContext";
import { useCart } from "../contexts/CartContext";
import MediaImage from "../components/MediaImage";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);
  const { formatPrice, t } = useSettings();
  const { addItem } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/produtos/${id}`);
        if (!res.ok) {
          setProduct(null);
          return;
        }
        setProduct(await res.json());
      } catch (error) {
        console.error("Error fetching product:", error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProduct();
  }, [id]);

  // Inject Product JSON-LD for SEO
  useEffect(() => {
    try {
      if (!product?.id) return;
      const idStr = `product-jsonld-${product.id}`;
      let script = document.getElementById(idStr) as HTMLScriptElement | null;
      const jsonld = {
        "@context": "https://schema.org/",
        "@type": "Product",
        name: product.nome,
        image: [product.imagem || ""].map((u: string) => (u ? u : undefined)).filter(Boolean),
        description: product.descricao || undefined,
        sku: product.id,
        offers: {
          "@type": "Offer",
          priceCurrency: "XOF",
          price: product.preco ?? undefined,
          availability: "https://schema.org/InStock",
          url: window.location.href,
        },
      } as Record<string, unknown>;

      if (!script) {
        script = document.createElement("script");
        script.id = idStr;
        script.type = "application/ld+json";
        document.head.appendChild(script);
      }
      script.text = JSON.stringify(jsonld);
    } catch (e) {
      // ignore
    }
  }, [product]);

  const handleAddToCart = () => {
    if (!product?.id) return;
    addItem({
      id: product.id,
      nome: product.nome,
      preco: product.preco,
      imagem: product.imagem || "",
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate("/loja/carrinho");
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">{t("generic_loading_service")}</div>;
  if (!product?.id) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-zinc-500 font-bold">{t("product_not_found")}</p>
        <Link to="/loja" className="btn-primary">
          {t("product_back_to_store")}
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link to="/loja" className="inline-flex items-center space-x-2 text-zinc-400 hover:text-black mb-12 transition-colors group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold uppercase tracking-widest text-xs">Voltar à Loja</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div className="space-y-4">
            <div className="aspect-square bg-white rounded-[3rem] overflow-hidden shadow-xl border border-zinc-100">
              <MediaImage src={product.imagem} alt={product.nome} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
          </div>

          <div className="flex flex-col">
            <span className="text-emerald-600 font-black uppercase tracking-[0.2em] text-xs mb-4">
              {product.categoria_nome}
            </span>
            <h1 className="text-5xl font-black uppercase italic tracking-tighter text-zinc-900 mb-6 leading-none">
              {product.nome}
            </h1>
            <p className="text-3xl font-black text-black mb-8">{formatPrice(product.preco)}</p>

            <div className="prose prose-zinc mb-12">
              <p className="text-zinc-500 leading-relaxed text-lg">
                {product.descricao || t("product_description_fallback")}
              </p>
            </div>

            <div className="space-y-4 mb-12">
              <button
                type="button"
                onClick={handleAddToCart}
                className="w-full bg-black text-white py-6 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center space-x-3 hover:bg-emerald-500 hover:text-black transition-all hover:scale-[1.02]"
              >
                {added ? <Check size={24} /> : <ShoppingCart size={24} />}
                <span>{added ? t("product_added") : t("product_add_to_cart")}</span>
              </button>
              <button
                type="button"
                onClick={handleBuyNow}
                className="w-full border-2 border-zinc-200 text-zinc-900 py-6 rounded-2xl font-black uppercase tracking-widest hover:border-black transition-all"
              >
                {t("product_buy_now")}
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-12 border-t border-zinc-200">
              <div className="text-center space-y-2">
                <div className="mx-auto w-10 h-10 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-400">
                  <Truck size={20} />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{t("product_feature_fast_delivery")}</p>
              </div>
              <div className="text-center space-y-2">
                <div className="mx-auto w-10 h-10 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-400">
                  <Shield size={20} />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{t("product_feature_warranty")}</p>
              </div>
              <div className="text-center space-y-2">
                <div className="mx-auto w-10 h-10 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-400">
                  <RotateCcw size={20} />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{t("product_feature_free_return")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
