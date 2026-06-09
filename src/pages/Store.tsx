import { useState, useEffect } from "react";
import { Search, Filter, ShoppingCart, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useSettings } from "../contexts/SettingsContext";
import { mediaUrl } from "../lib/media";

interface Product {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  imagem: string;
  categoria_nome: string;
}

export default function Store() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { formatPrice, t } = useSettings();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          fetch("/api/produtos"),
          fetch("/api/categorias")
        ]);
        const prodData = await prodRes.json();
        const catData = await catRes.json();
        setProducts(Array.isArray(prodData) ? prodData : []);
        setCategories(Array.isArray(catData) ? catData : []);
      } catch (error) {
        console.error("Error fetching store data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredProducts = products.filter((p) => {
    const matchCategory = selectedCategory === "all" || p.categoria_nome === selectedCategory;
    const q = searchQuery.trim().toLowerCase();
    const matchSearch =
      !q ||
      p.nome.toLowerCase().includes(q) ||
      (p.descricao || "").toLowerCase().includes(q) ||
      (p.categoria_nome || "").toLowerCase().includes(q);
    return matchCategory && matchSearch;
  });

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Header */}
      <div className="bg-secondary text-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl font-display font-bold uppercase tracking-tighter">LOJA <span className="text-primary">GORILA</span></h1>
          <p className="text-zinc-400 mt-4 max-w-xl text-lg">Equipamentos profissionais, eletrónica de ponta e acessórios exclusivos.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-72 space-y-8">
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-zinc-100">
              <h3 className="font-display font-bold uppercase text-sm tracking-widest mb-8 border-b border-zinc-100 pb-4">Categorias</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => setSelectedCategory("all")}
                  className={`w-full text-left px-4 py-3 rounded-lg text-sm font-bold transition-all ${selectedCategory === "all" ? "bg-primary text-secondary shadow-md" : "hover:bg-zinc-50 text-zinc-500"}`}
                >
                  Todos os Produtos
                </button>
                {categories.map(cat => (
                  <button 
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.nome)}
                    className={`w-full text-left px-4 py-3 rounded-lg text-sm font-bold transition-all ${selectedCategory === cat.nome ? "bg-primary text-secondary shadow-md" : "hover:bg-zinc-50 text-zinc-500"}`}
                  >
                    {cat.nome}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-12 bg-zinc-50 p-6 rounded-2xl border border-zinc-100">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Pesquisar produtos..."
                  className="w-full pl-12 pr-4 py-3 bg-white border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                />
              </div>
              <div className="hidden md:flex items-center space-x-4 ml-8">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{filteredProducts.length} Produtos encontrados</span>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="bg-white rounded-2xl h-96 animate-pulse border border-zinc-100 shadow-sm" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {filteredProducts.map(product => (
                  <div key={product.id} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all border border-zinc-100 card-hover">
                    <div className="aspect-square overflow-hidden bg-zinc-50 relative">
                      <img 
                        src={mediaUrl(product.imagem)} 
                        alt={product.nome}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="bg-secondary text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-md shadow-lg">
                          {product.categoria_nome}
                        </span>
                      </div>
                    </div>
                    <div className="p-8">
                      <h3 className="text-xl font-display font-bold mb-2 group-hover:text-primary transition-colors">{product.nome}</h3>
                      <p className="text-zinc-500 text-sm line-clamp-2 mb-6 leading-relaxed">{product.descricao}</p>
                      <div className="flex items-center justify-between mt-auto pt-6 border-t border-zinc-50">
                        <span className="text-2xl font-black text-secondary">
                          {formatPrice(product.preco)}
                        </span>
                        <Link 
                          to={`/loja/produto/${product.id}`}
                          className="bg-primary text-secondary p-3.5 rounded-xl hover:bg-secondary hover:text-white transition-all shadow-md active:scale-95"
                        >
                          <ShoppingCart size={20} />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
                {filteredProducts.length === 0 && (
                  <div className="col-span-full py-32 text-center bg-zinc-50 rounded-3xl border-2 border-dashed border-zinc-200">
                    <p className="text-zinc-400 font-bold uppercase tracking-widest">Nenhum produto encontrado nesta categoria.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
