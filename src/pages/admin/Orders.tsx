import { Trash2, CheckCircle2, XCircle } from "lucide-react";
import { useAdminList } from "../../hooks/useAdminList";
import AdminErrorBanner from "../../components/admin/AdminErrorBanner";
import { adminFetch } from "../../lib/adminApi";

interface Pedido {
  id: number;
  nome_cliente: string;
  email_cliente: string;
  telefone: string;
  itens: string;
  total: number;
  status: string;
  data: string;
}

export default function AdminOrders() {
  const { data: pedidos, loading, error, refresh } = useAdminList<Pedido>("/api/admin/pedidos");

  const updateStatus = async (id: number, status: string) => {
    const res = await adminFetch(`/api/admin/pedidos/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    if (res.ok) refresh();
  };

  const deletePedido = async (id: number) => {
    if (!confirm("Eliminar pedido?")) return;
    const res = await adminFetch(`/api/admin/pedidos/${id}`, { method: "DELETE" });
    if (res.ok) refresh();
  };

  const parseItens = (raw: string) => {
    try {
      return JSON.parse(raw) as { nome: string; quantidade: number; preco: number }[];
    } catch {
      return [];
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black uppercase italic tracking-tighter text-zinc-900">Pedidos da Loja</h1>
        <p className="text-zinc-500 font-medium">
          Pedidos do carrinho. Total: <strong>{pedidos.length}</strong>
        </p>
      </div>

      {error && <AdminErrorBanner message={error} onRetry={refresh} />}

      <div className="bg-white rounded-[2rem] shadow-sm border border-zinc-100 overflow-hidden">
        {loading ? (
          <p className="p-8 text-zinc-400 font-bold">A carregar...</p>
        ) : pedidos.length === 0 && !error ? (
          <p className="p-12 text-center text-zinc-400 font-bold italic">Nenhum pedido registado.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-zinc-50/50 border-b border-zinc-100">
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">Cliente</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">Itens</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">Total</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {pedidos.map((p) => (
                  <tr key={p.id} className="hover:bg-zinc-50/50">
                    <td className="px-6 py-4">
                      <div className="font-bold">{p.nome_cliente}</div>
                      <div className="text-xs text-zinc-500">{p.email_cliente}</div>
                      <div className="text-xs text-zinc-500">{p.telefone}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-600 max-w-xs">
                      {parseItens(p.itens).map((i, idx) => (
                        <div key={idx}>
                          {i.quantidade}x {i.nome}
                        </div>
                      ))}
                    </td>
                    <td className="px-6 py-4 font-mono font-bold">{p.total.toLocaleString()} FCFA</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                          p.status === "concluido"
                            ? "bg-emerald-100 text-emerald-700"
                            : p.status === "cancelado"
                              ? "bg-red-100 text-red-700"
                              : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => updateStatus(p.id, "concluido")}
                          className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg"
                          title="Concluir"
                        >
                          <CheckCircle2 size={18} />
                        </button>
                        <button
                          onClick={() => updateStatus(p.id, "cancelado")}
                          className="p-2 text-amber-500 hover:bg-amber-50 rounded-lg"
                          title="Cancelar"
                        >
                          <XCircle size={18} />
                        </button>
                        <button
                          onClick={() => deletePedido(p.id)}
                          className="p-2 text-red-400 hover:bg-red-50 rounded-lg"
                          title="Eliminar"
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
        )}
      </div>
    </div>
  );
}
