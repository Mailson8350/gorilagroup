import { useState, useEffect, FormEvent } from "react";
import { Plus, Trash2, Edit, Search } from "lucide-react";
import ImageField from "../../components/admin/ImageField";
import { mediaUrl } from "../../lib/media";

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    preco: "",
    imagem: "",
    categoria_id: "",
  });

  const resetForm = () => {
    setEditingId(null);
    setFormData({ nome: "", descricao: "", preco: "", imagem: "", categoria_id: "" });
  };

  const openEdit = (product: any) => {
    setEditingId(product.id);
    setFormData({
      nome: product.nome,
      descricao: product.descricao || "",
      preco: String(product.preco),
      imagem: product.imagem || "",
      categoria_id: String(product.categoria_id || ""),
    });
    setShowModal(true);
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/produtos");
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    const res = await fetch("/api/categorias");
    const data = await res.json();
    setCategories(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("adminToken");
    try {
      const res = await fetch("/api/admin/produtos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          id: editingId,
          preco: Number(formData.preco),
          categoria_id: Number(formData.categoria_id),
        }),
      });
      if (res.ok) {
        setShowModal(false);
        resetForm();
        fetchProducts();
      }
    } catch (error) {
      console.error("Error saving product:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem a certeza que deseja excluir este produto?")) return;
    const token = localStorage.getItem("adminToken");
    try {
      const res = await fetch(`/api/admin/produtos/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black uppercase italic tracking-tighter text-zinc-900">Gestão de Produtos</h1>
          <p className="text-zinc-500 font-medium">Adicione, edite ou remova produtos da loja.</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-black text-white px-6 py-3 rounded-2xl font-black uppercase tracking-widest flex items-center space-x-2 hover:bg-emerald-500 hover:text-black transition-all"
        >
          <Plus size={20} />
          <span>Novo Produto</span>
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-zinc-100 overflow-hidden">
        <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input
              type="text"
              placeholder="Pesquisar por nome ou categoria..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 border-b border-zinc-100">
                <th className="px-8 py-6">Produto</th>
                <th className="px-8 py-6">Categoria</th>
                <th className="px-8 py-6">Preço</th>
                <th className="px-8 py-6 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-zinc-50/50 transition-colors group">
                  <td className="px-8 py-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-xl bg-zinc-100 overflow-hidden flex-shrink-0">
                        <img
                          src={mediaUrl(product.imagem)}
                          alt=""
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-zinc-900">{product.nome}</p>
                        <p className="text-xs text-zinc-400 line-clamp-1 max-w-[200px]">{product.descricao}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-4">
                    <span className="text-[10px] font-black uppercase tracking-widest bg-zinc-100 px-3 py-1 rounded-full text-zinc-500">
                      {product.categoria_nome}
                    </span>
                  </td>
                  <td className="px-8 py-4">
                    <p className="text-sm font-black text-emerald-600">
                      {product.preco.toLocaleString("pt-GW", { style: "currency", currency: "XOF" })}
                    </p>
                  </td>
                  <td className="px-8 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => openEdit(product)}
                        className="p-2 text-zinc-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(product.id)}
                        className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-2xl">
            <div className="p-8 border-b border-zinc-100 flex items-center justify-between">
              <h2 className="text-2xl font-black uppercase italic tracking-tight">
                {editingId ? "Editar Produto" : "Novo Produto"}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-zinc-400 hover:text-black"
              >
                <Plus size={24} className="rotate-45" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Nome</label>
                  <input
                    required
                    type="text"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    className="w-full bg-zinc-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Categoria</label>
                  <select
                    required
                    value={formData.categoria_id}
                    onChange={(e) => setFormData({ ...formData, categoria_id: e.target.value })}
                    className="w-full bg-zinc-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">Selecionar...</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.nome}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Descrição</label>
                <textarea
                  required
                  rows={3}
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  className="w-full bg-zinc-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Preço (XOF)</label>
                <input
                  required
                  type="number"
                  value={formData.preco}
                  onChange={(e) => setFormData({ ...formData, preco: e.target.value })}
                  className="w-full bg-zinc-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <ImageField
                label="Imagem do produto"
                value={formData.imagem}
                onChange={(imagem) => setFormData({ ...formData, imagem })}
                folder="produtos"
              />
              <div className="flex items-center justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-6 py-3 rounded-xl font-bold text-zinc-500 hover:bg-zinc-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-black text-white px-8 py-3 rounded-xl font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-black transition-all"
                >
                  Guardar Produto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
