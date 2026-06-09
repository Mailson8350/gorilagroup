import React, { useState, useEffect } from "react";
import { Calendar, Mail, CheckCircle2, XCircle, Trash2, Home, Plus, Save, Edit, X } from "lucide-react";
import ImageField from "../../components/admin/ImageField";
import { mediaUrl } from "../../lib/media";
import { adminFetch, adminFetchJson } from "../../lib/adminApi";
import AdminErrorBanner from "../../components/admin/AdminErrorBanner";

interface Reserva {
  id: number;
  quarto_id: number;
  quarto_nome?: string;
  nome_cliente: string;
  email_cliente: string;
  data_inicio: string;
  data_fim: string;
  status: string;
  num_pessoas?: number;
  taxa_turismo?: number;
  valor_alojamento?: number;
}

interface Quarto {
  id: number;
  nome: string;
  descricao: string;
  preco_noite: number;
  imagem: string;
  disponivel: number;
}

export default function AdminReservations() {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [quartos, setQuartos] = useState<Quarto[]>([]);
  const [activeTab, setActiveTab] = useState<'reservas' | 'quartos'>('reservas');
  const [loading, setLoading] = useState(true);
  const [editingQuarto, setEditingQuarto] = useState<Quarto | null>(null);
  const [showQuartoModal, setShowQuartoModal] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
    const onFocus = () => fetchData();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const [resRes, resQua] = await Promise.all([
        adminFetchJson<Reserva[]>("/api/admin/reservas"),
        fetch("/api/quartos", { cache: "no-store" }),
      ]);
      const dataQua = await resQua.json();
      const listQua = Array.isArray(dataQua) ? dataQua : [];

      if (!resRes.ok) {
        setReservas([]);
        setFetchError(resRes.error);
      } else {
        setReservas(
          resRes.data.map((r) => ({
            ...r,
            quarto_nome: r.quarto_nome || listQua.find((q: Quarto) => q.id === r.quarto_id)?.nome || "Desconhecido",
          }))
        );
      }
      setQuartos(listQua);
    } catch (e) {
      console.error(e);
      setFetchError("Erro ao carregar reservas.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      const res = await adminFetch(`/api/admin/reservas/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      if (res.ok) fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteReserva = async (id: number) => {
    if (!confirm("Eliminar reserva?")) return;
    try {
      const res = await adminFetch(`/api/admin/reservas/${id}`, { method: "DELETE" });
      if (res.ok) fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveQuarto = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("adminToken");
    try {
      const res = await fetch("/api/admin/quartos", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(editingQuarto)
      });
      if (res.ok) {
        setShowQuartoModal(false);
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteQuarto = async (id: number) => {
    if (!confirm("Eliminar quarto?")) return;
    const token = localStorage.getItem("adminToken");
    try {
      const res = await fetch(`/api/admin/quartos/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase italic tracking-tighter text-zinc-900">Gestão Hostel</h1>
          <p className="text-zinc-500 font-medium">
            Controle as reservas e os quartos. Reservas registadas: <strong>{reservas.length}</strong>
          </p>
        </div>
        <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-zinc-100">
          <button 
            onClick={() => setActiveTab('reservas')}
            className={`px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'reservas' ? 'bg-black text-white shadow-lg' : 'text-zinc-500 hover:text-black'}`}
          >
            Reservas
          </button>
          <button 
            onClick={() => setActiveTab('quartos')}
            className={`px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'quartos' ? 'bg-black text-white shadow-lg' : 'text-zinc-500 hover:text-black'}`}
          >
            Quartos
          </button>
        </div>
      </div>

      {fetchError && <AdminErrorBanner message={fetchError} onRetry={fetchData} />}

      {activeTab === 'reservas' ? (
        <div className="bg-white rounded-[2rem] shadow-sm border border-zinc-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-zinc-50/50 border-b border-zinc-100">
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">Cliente</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">Alojamento</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">Datas</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">Pessoas / Taxa</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {reservas.length === 0 && !loading && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-zinc-400 font-bold italic">
                      Nenhuma reserva registada.
                    </td>
                  </tr>
                )}
                {reservas.map((res) => (
                  <tr key={res.id} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-zinc-900">{res.nome_cliente}</div>
                      <div className="text-xs text-zinc-500 flex items-center space-x-1">
                        <Mail size={12} />
                        <span>{res.email_cliente}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Home size={14} className="text-zinc-400" />
                        <span className="font-bold">{res.quarto_nome}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-mono bg-zinc-100 px-2 py-1 rounded inline-block">
                        {res.data_inicio} → {res.data_fim}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="font-bold">{res.num_pessoas ?? 1} pessoa(s)</div>
                      <div className="text-zinc-500 text-xs mt-1">
                        Turismo: {(res.taxa_turismo ?? 0).toLocaleString()} XOF
                      </div>
                      {res.valor_alojamento != null && (
                        <div className="text-zinc-500 text-xs">Aloj.: {res.valor_alojamento.toLocaleString()} XOF</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        res.status === 'pago' ? 'bg-emerald-100 text-emerald-700' : 
                        res.status === 'cancelado' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {res.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button 
                          onClick={() => handleUpdateStatus(res.id, 'pago')}
                          className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all"
                          title="Marcar como Pago"
                        >
                          <CheckCircle2 size={18} />
                        </button>
                        <button 
                          onClick={() => handleUpdateStatus(res.id, 'cancelado')}
                          className="p-2 text-amber-500 hover:bg-amber-50 rounded-lg transition-all"
                          title="Cancelar"
                        >
                          <XCircle size={18} />
                        </button>
                        <button 
                          onClick={() => handleDeleteReserva(res.id)}
                          className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-all"
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
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-end">
             <button 
                onClick={() => { setEditingQuarto({ id: 0, nome: "", descricao: "", preco_noite: 0, imagem: "", disponivel: 1 }); setShowQuartoModal(true); }}
                className="bg-emerald-500 text-black px-6 py-3 rounded-xl font-bold flex items-center space-x-2 hover:bg-emerald-400 transition-all shadow-lg"
              >
                <Plus size={20} />
                <span>Novo Quarto</span>
              </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quartos.map((q) => (
              <div key={q.id} className="bg-white rounded-[2rem] border border-zinc-100 overflow-hidden shadow-sm hover:shadow-xl transition-all group">
                <div className="aspect-video overflow-hidden bg-zinc-100 relative">
                  <img src={mediaUrl(q.imagem)} alt={q.nome} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500" referrerPolicy="no-referrer" />
                  <div className="absolute top-4 right-4 flex items-center gap-2 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-xl shadow-md">
                    <span
                      className={`h-3 w-3 rounded-full ${q.disponivel ? "bg-emerald-500" : "bg-red-500"}`}
                      aria-hidden
                    />
                    <span className={`text-[10px] font-black uppercase tracking-widest ${q.disponivel ? "text-emerald-800" : "text-red-700"}`}>
                      {q.disponivel ? "Disponível" : "Ocupado"}
                    </span>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-black uppercase italic tracking-tighter text-xl">{q.nome}</h3>
                    <div className="font-mono font-bold text-emerald-600">{q.preco_noite.toLocaleString()} F/noite</div>
                  </div>
                  <p className="text-zinc-500 text-sm line-clamp-2">{q.descricao}</p>
                  <div className="flex items-center space-x-2 pt-2">
                    <button 
                      onClick={() => { setEditingQuarto(q); setShowQuartoModal(true); }}
                      className="flex-1 bg-zinc-100 text-black py-2 rounded-xl font-bold flex items-center justify-center space-x-2 hover:bg-zinc-200 transition-all"
                    >
                      <Edit size={16} />
                      <span>Editar</span>
                    </button>
                    <button 
                      onClick={() => handleDeleteQuarto(q.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showQuartoModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-8 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
              <h2 className="text-xl font-black uppercase italic tracking-tighter">
                {editingQuarto?.id ? "Editar Quarto" : "Novo Quarto"}
              </h2>
              <button onClick={() => setShowQuartoModal(false)} className="p-2 hover:bg-zinc-200 rounded-full transition-all">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveQuarto} className="p-8 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold uppercase text-zinc-400 ml-1">Nome do Quarto</label>
                  <input 
                    required 
                    value={editingQuarto?.nome} 
                    onChange={(e) => setEditingQuarto({...editingQuarto!, nome: e.target.value})}
                    className="w-full bg-zinc-50 p-4 rounded-2xl border-none focus:ring-2 focus:ring-black outline-none text-zinc-900 font-medium" 
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-zinc-400 ml-1">Preço por Noite</label>
                  <input 
                    type="number" 
                    required 
                    value={editingQuarto?.preco_noite} 
                    onChange={(e) => setEditingQuarto({...editingQuarto!, preco_noite: Number(e.target.value)})}
                    className="w-full bg-zinc-50 p-4 rounded-2xl border-none focus:ring-2 focus:ring-black outline-none text-zinc-900 font-medium font-mono" 
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-zinc-400 ml-1">Descrição</label>
                  <textarea 
                    rows={3}
                    value={editingQuarto?.descricao} 
                    onChange={(e) => setEditingQuarto({...editingQuarto!, descricao: e.target.value})}
                    className="w-full bg-zinc-50 p-4 rounded-2xl border-none focus:ring-2 focus:ring-black outline-none text-zinc-900 font-medium" 
                  />
                </div>
                {editingQuarto && (
                  <ImageField
                    label="Imagem do quarto"
                    value={editingQuarto.imagem}
                    onChange={(imagem) => setEditingQuarto({ ...editingQuarto, imagem })}
                    folder="quartos"
                  />
                )}
                <div className="flex items-center space-x-2">
                   <input 
                    type="checkbox"
                    checked={editingQuarto?.disponivel === 1} 
                    onChange={(e) => setEditingQuarto({...editingQuarto!, disponivel: e.target.checked ? 1 : 0})}
                    className="w-5 h-5 rounded accent-emerald-500"
                  />
                  <label className="text-sm font-bold uppercase text-zinc-600">Disponível para Reserva</label>
                </div>
              </div>
              <button 
                type="submit" 
                className="w-full bg-black text-white py-5 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center space-x-3 hover:bg-emerald-500 hover:text-black transition-all shadow-xl"
              >
                <Save size={20} />
                <span>Guardar Quarto</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
