import { Mail, Trash2, CheckCircle, Clock } from "lucide-react";
import { useAdminList } from "../../hooks/useAdminList";
import AdminErrorBanner from "../../components/admin/AdminErrorBanner";
import { adminFetch } from "../../lib/adminApi";

interface Mensagem {
  id: number;
  nome: string;
  email: string;
  assunto: string;
  mensagem: string;
  data: string;
}

export default function AdminMessages() {
  const { data: messages, loading, error, refresh } = useAdminList<Mensagem>("/api/admin/mensagens");

  const handleDelete = async (id: number) => {
    if (!confirm("Eliminar esta mensagem?")) return;
    const res = await adminFetch(`/api/admin/mensagens/${id}`, { method: "DELETE" });
    if (res.ok) refresh();
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase italic tracking-tighter text-zinc-900">Mensagens Recebidas</h1>
          <p className="text-zinc-500 font-medium">
            Contactos do formulário público. Total: <strong>{messages.length}</strong>
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

      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          [1, 2, 3].map((i) => <div key={i} className="h-40 bg-white rounded-3xl animate-pulse" />)
        ) : messages.length === 0 && !error ? (
          <div className="text-center py-20 bg-white rounded-[2rem] border border-dashed border-zinc-200">
            <p className="text-zinc-400 font-bold uppercase tracking-widest">Nenhuma mensagem recebida até ao momento.</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className="bg-white p-8 rounded-[2rem] shadow-sm border border-zinc-100 flex flex-col md:flex-row gap-8"
            >
              <div className="shrink-0">
                <div className="w-16 h-16 bg-zinc-100 rounded-2xl flex items-center justify-center text-zinc-400">
                  <Mail size={32} />
                </div>
              </div>
              <div className="flex-1 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-black uppercase italic tracking-tight">{msg.nome}</h3>
                    <p className="text-sm text-emerald-600 font-bold">{msg.email}</p>
                  </div>
                  <div className="flex items-center space-x-2 text-zinc-400 text-xs font-bold uppercase tracking-widest">
                    <Clock size={14} />
                    <span>{msg.data ? new Date(msg.data).toLocaleString("pt-PT") : "—"}</span>
                  </div>
                </div>
                <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100">
                  <p className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-2">
                    Assunto: {msg.assunto || "—"}
                  </p>
                  <p className="text-zinc-700 text-sm leading-relaxed">{msg.mensagem}</p>
                </div>
              </div>
              <div className="flex flex-col justify-center space-y-2">
                <button
                  type="button"
                  className="p-3 bg-zinc-100 text-zinc-400 hover:bg-emerald-100 hover:text-emerald-600 rounded-xl transition-all"
                  title="Marcar como lida"
                >
                  <CheckCircle size={20} />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(msg.id)}
                  className="p-3 bg-zinc-100 text-zinc-400 hover:bg-red-100 hover:text-red-600 rounded-xl transition-all"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
