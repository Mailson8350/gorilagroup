import { useState, useEffect, FormEvent } from "react";
import { Plus, Trash2, Edit } from "lucide-react";

export default function AdminCategories() {
  const [categories, setCategories] = useState<{ id: number; nome: string }[]>([]);
  const [nome, setNome] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);

  const fetchCategories = async () => {
    const res = await fetch("/api/categorias");
    const data = await res.json();
    setCategories(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("adminToken");
    const res = await fetch("/api/admin/categorias", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ id: editingId, nome }),
    });
    if (res.ok) {
      setNome("");
      setEditingId(null);
      fetchCategories();
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Eliminar esta categoria?")) return;
    const token = localStorage.getItem("adminToken");
    const res = await fetch(`/api/admin/categorias/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (res.ok) fetchCategories();
    else alert(data.error || "Erro ao eliminar");
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black uppercase italic tracking-tighter text-zinc-900">Categorias</h1>
        <p className="text-zinc-500 font-medium">Organize os produtos da loja por categoria.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border border-zinc-100 flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Nome</label>
          <input
            required
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full bg-zinc-50 rounded-xl px-4 py-3 mt-1 focus:ring-2 focus:ring-emerald-500 border-none"
          />
        </div>
        <button type="submit" className="bg-black text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-500 hover:text-black transition-all flex items-center gap-2">
          <Plus size={18} />
          {editingId ? "Guardar" : "Adicionar"}
        </button>
        {editingId && (
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setNome("");
            }}
            className="px-6 py-3 rounded-xl font-bold text-zinc-500 hover:bg-zinc-100"
          >
            Cancelar
          </button>
        )}
      </form>

      <div className="bg-white rounded-2xl border border-zinc-100 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[10px] font-black uppercase tracking-widest text-zinc-400 border-b border-zinc-100">
              <th className="px-6 py-4">ID</th>
              <th className="px-6 py-4">Nome</th>
              <th className="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50">
            {categories.map((cat) => (
              <tr key={cat.id}>
                <td className="px-6 py-4 font-mono text-sm">{cat.id}</td>
                <td className="px-6 py-4 font-bold">{cat.nome}</td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(cat.id);
                      setNome(cat.nome);
                    }}
                    className="p-2 text-zinc-400 hover:text-blue-500 rounded-lg"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(cat.id)}
                    className="p-2 text-zinc-400 hover:text-red-500 rounded-lg"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
