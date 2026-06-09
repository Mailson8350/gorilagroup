import { useCallback, useEffect, useState, FormEvent } from "react";
import { Plus, Save, Trash2, X, Edit } from "lucide-react";
import ImageField from "./ImageField";
import MediaImage from "../MediaImage";
import AdminErrorBanner from "./AdminErrorBanner";
import { adminFetchJson, adminFetchList } from "../../lib/adminApi";

export interface OpcaoServico {
  id: number;
  servico_id: string;
  nome: string;
  descricao: string;
  preco: number;
  imagem: string;
  disponivel: number;
  ordem: number;
}

const emptyOpcao = (servicoId: string): OpcaoServico => ({
  id: 0,
  servico_id: servicoId,
  nome: "",
  descricao: "",
  preco: 0,
  imagem: "",
  disponivel: 1,
  ordem: 0,
});

interface Props {
  servicoId: string;
  servicoNome: string;
}

export default function ServiceOptionsPanel({ servicoId, servicoNome }: Props) {
  const [opcoes, setOpcoes] = useState<OpcaoServico[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<OpcaoServico | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchOpcoes = useCallback(async () => {
    if (!servicoId) return;
    setLoading(true);
    setLoadError(null);
    const result = await adminFetchList<OpcaoServico>(`/api/admin/servicos/${encodeURIComponent(servicoId)}/opcoes`);
    if (result.ok) {
      setOpcoes(result.data);
    } else {
      setOpcoes([]);
      setLoadError(result.error);
    }
    setLoading(false);
  }, [servicoId]);

  useEffect(() => {
    fetchOpcoes();
  }, [fetchOpcoes]);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        servico_id: servicoId,
        id: form.id > 0 ? form.id : undefined,
      };
      const result = await adminFetchJson<{ id?: number; success?: boolean }>("/api/admin/opcoes-servico", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      if (result.ok) {
        setShowModal(false);
        setForm(null);
        await fetchOpcoes();
      } else {
        alert(result.error || "Erro ao guardar opção");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Eliminar esta opção?")) return;
    const result = await adminFetchJson(`/api/admin/opcoes-servico/${id}`, { method: "DELETE" });
    if (result.ok) await fetchOpcoes();
    else alert(result.error || "Erro ao eliminar");
  };

  if (servicoId === "hostel") {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-sm text-amber-900">
        <p className="font-bold mb-1">Hostel — quartos e reservas</p>
        <p className="text-amber-800">
          As opções de alojamento deste serviço são geridas em{" "}
          <strong>Admin → Reservas</strong> (separador Quartos).
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[2rem] border border-zinc-100 p-8 space-y-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-black uppercase italic tracking-tighter text-zinc-900">
            Opções para o público
          </h3>
          <p className="text-zinc-500 text-sm mt-1">
            Pacotes, equipamentos ou serviços que o visitante vê em <strong>{servicoNome}</strong> e pode solicitar.
          </p>
          <p className="text-zinc-400 text-xs mt-2">
            Guarde cada opção com o botão abaixo. Alterar cores ou textos do serviço não apaga estas opções.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setForm(emptyOpcao(servicoId));
            setShowModal(true);
          }}
          className="bg-emerald-500 text-black px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-400 shrink-0"
        >
          <Plus size={18} />
          Nova opção
        </button>
      </div>

      {loadError && <AdminErrorBanner message={loadError} onRetry={fetchOpcoes} />}

      {loading ? (
        <p className="text-zinc-400 font-bold">A carregar opções...</p>
      ) : !loadError && opcoes.length === 0 ? (
        <p className="text-zinc-400 font-bold italic py-8 text-center border-2 border-dashed border-zinc-200 rounded-xl">
          Nenhuma opção. Adicione a primeira para aparecer no site público.
        </p>
      ) : (
        !loadError && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {opcoes.map((o) => (
              <div
                key={o.id}
                className="flex gap-4 p-4 rounded-2xl border border-zinc-100 bg-zinc-50/50 hover:border-zinc-200 transition-colors"
              >
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-zinc-200 shrink-0">
                  <MediaImage src={o.imagem} alt={o.nome} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold truncate">{o.nome}</h4>
                    <span
                      className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full shrink-0 ${
                        o.disponivel ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                      }`}
                    >
                      {o.disponivel ? "Ativo" : "Oculto"}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 line-clamp-2 mt-1">{o.descricao}</p>
                  <p className="font-mono font-bold text-sm mt-2">{Number(o.preco).toLocaleString()} FCFA</p>
                  <div className="flex gap-2 mt-3">
                    <button
                      type="button"
                      onClick={() => {
                        setForm({ ...o, disponivel: o.disponivel ? 1 : 0 });
                        setShowModal(true);
                      }}
                      className="text-xs font-bold uppercase flex items-center gap-1 text-zinc-600 hover:text-black"
                    >
                      <Edit size={14} /> Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(o.id)}
                      className="text-xs font-bold uppercase flex items-center gap-1 text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={14} /> Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {showModal && form && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-zinc-100 flex justify-between items-center sticky top-0 bg-white">
              <h4 className="font-black uppercase italic">{form.id ? "Editar opção" : "Nova opção"}</h4>
              <button type="button" onClick={() => setShowModal(false)} className="p-2 hover:bg-zinc-100 rounded-full">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase text-zinc-400 ml-1">Nome</label>
                <input
                  required
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  className="w-full bg-zinc-50 p-3 rounded-xl border-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-zinc-400 ml-1">Descrição</label>
                <textarea
                  rows={3}
                  value={form.descricao}
                  onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                  className="w-full bg-zinc-50 p-3 rounded-xl border-none focus:ring-2 focus:ring-black resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase text-zinc-400 ml-1">Preço (FCFA)</label>
                  <input
                    type="number"
                    min={0}
                    value={form.preco}
                    onChange={(e) => setForm({ ...form, preco: Number(e.target.value) })}
                    className="w-full bg-zinc-50 p-3 rounded-xl border-none focus:ring-2 focus:ring-black font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-zinc-400 ml-1">Ordem</label>
                  <input
                    type="number"
                    value={form.ordem}
                    onChange={(e) => setForm({ ...form, ordem: Number(e.target.value) })}
                    className="w-full bg-zinc-50 p-3 rounded-xl border-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>
              <ImageField
                label="Imagem"
                value={form.imagem}
                onChange={(imagem) => setForm({ ...form, imagem })}
                folder="opcoes"
              />
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Number(form.disponivel) === 1}
                  onChange={(e) => setForm({ ...form, disponivel: e.target.checked ? 1 : 0 })}
                  className="w-5 h-5 accent-emerald-500"
                />
                <span className="text-sm font-bold">Visível no site público</span>
              </label>
              <button
                type="submit"
                disabled={saving}
                className="w-full bg-black text-white py-4 rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-emerald-500 hover:text-black disabled:opacity-50"
              >
                <Save size={18} />
                {saving ? "A guardar..." : "Guardar opção"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
