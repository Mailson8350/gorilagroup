import { CheckCircle2, Trash2, XCircle } from "lucide-react";
import { useAdminList } from "../../hooks/useAdminList";
import AdminErrorBanner from "../../components/admin/AdminErrorBanner";
import { adminFetch } from "../../lib/adminApi";

interface Solicitacao {
  id: number;
  servico_id: string;
  opcao_id: number | null;
  nome_cliente: string;
  email_cliente: string;
  telefone: string;
  mensagem: string;
  status: string;
  data: string;
  servico_nome: string;
  opcao_nome: string | null;
}

export default function AdminServiceRequests() {
  const { data: list, loading, error, refresh } = useAdminList<Solicitacao>("/api/admin/solicitacoes-servico");

  const updateStatus = async (id: number, status: string) => {
    const res = await adminFetch(`/api/admin/solicitacoes-servico/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    if (res.ok) refresh();
  };

  const remove = async (id: number) => {
    if (!confirm("Eliminar solicitação?")) return;
    const res = await adminFetch(`/api/admin/solicitacoes-servico/${id}`, { method: "DELETE" });
    if (res.ok) refresh();
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase italic tracking-tighter">Solicitações de serviços</h1>
          <p className="text-zinc-500 font-medium">
            Pedidos do público. Total: <strong>{list.length}</strong>
          </p>
        </div>
        <button
          type="button"
          onClick={refresh}
          className="text-xs font-black uppercase tracking-widest text-zinc-500 hover:text-black"
        >
          Atualizar lista
        </button>
      </div>

      {error && <AdminErrorBanner message={error} onRetry={refresh} />}

      <div className="bg-white rounded-[2rem] border border-zinc-100 overflow-hidden shadow-sm">
        {loading ? (
          <p className="p-8 text-zinc-400">A carregar...</p>
        ) : list.length === 0 && !error ? (
          <p className="p-12 text-center text-zinc-400 font-bold italic">Nenhuma solicitação.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50 border-b border-zinc-100">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-zinc-400">Cliente</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-zinc-400">Serviço / Opção</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-zinc-400">Mensagem</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-zinc-400">Data</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-zinc-400">Estado</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-zinc-400 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {list.map((s) => (
                  <tr key={s.id} className="hover:bg-zinc-50/50">
                    <td className="px-6 py-4">
                      <div className="font-bold">{s.nome_cliente}</div>
                      <div className="text-xs text-zinc-500">{s.email_cliente}</div>
                      <div className="text-xs text-zinc-500">{s.telefone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold">{s.servico_nome || s.servico_id}</div>
                      {s.opcao_nome && <div className="text-xs text-emerald-700">{s.opcao_nome}</div>}
                    </td>
                    <td className="px-6 py-4 text-zinc-600 max-w-xs">{s.mensagem || "—"}</td>
                    <td className="px-6 py-4 text-xs text-zinc-500 whitespace-nowrap">
                      {s.data ? new Date(s.data).toLocaleString("pt-PT") : "—"}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-black uppercase px-2 py-1 rounded-full bg-amber-100 text-amber-800">
                        {s.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-1">
                      <button
                        type="button"
                        onClick={() => updateStatus(s.id, "concluido")}
                        className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg"
                      >
                        <CheckCircle2 size={18} />
                      </button>
                      <button
                        type="button"
                        onClick={() => updateStatus(s.id, "cancelado")}
                        className="p-2 text-amber-500 hover:bg-amber-50 rounded-lg"
                      >
                        <XCircle size={18} />
                      </button>
                      <button type="button" onClick={() => remove(s.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg">
                        <Trash2 size={18} />
                      </button>
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
