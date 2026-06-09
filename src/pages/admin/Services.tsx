import React, { useState, useEffect } from "react";
import { Plus, Save, Palette, Link as LinkIcon, Globe, Trash2 } from "lucide-react";
import { useSettings } from "../../contexts/SettingsContext";
import ImageField from "../../components/admin/ImageField";
import ServiceOptionsPanel from "../../components/admin/ServiceOptionsPanel";

const ADMIN_SERVICO_KEY = "adminSelectedServicoId";

export default function AdminServices() {
  const { services, refreshServices } = useSettings();
  const [loading, setLoading] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [formData, setFormData] = useState<any>(null);
  const [isNew, setIsNew] = useState(false);

  const emptyService = {
    id: "",
    nome_pt: "",
    nome_en: "",
    nome_fr: "",
    nome_es: "",
    descricao_pt: "",
    descricao_en: "",
    descricao_fr: "",
    descricao_es: "",
    cor_paleta: "#FFC107",
    cor_secundaria: "#000000",
    logo_url: "",
    banner_url: "",
    path: ""
  };

  useEffect(() => {
    if (services.length === 0 || isNew) return;
    const savedId = sessionStorage.getItem(ADMIN_SERVICO_KEY);
    const target = savedId ? services.find((s) => s.id === savedId) : services[0];
    if (!target) return;
    if (!selectedService || selectedService.id !== target.id) {
      setSelectedService(target);
      setFormData(target);
    }
  }, [services, isNew]);

  const handleSelect = (service: any) => {
    setIsNew(false);
    setSelectedService(service);
    setFormData(service);
    sessionStorage.setItem(ADMIN_SERVICO_KEY, service.id);
  };

  const handleNew = () => {
    setIsNew(true);
    setSelectedService(null);
    setFormData(emptyService);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id || !formData.path) {
      alert("ID e Path são obrigatórios");
      return;
    }
    setLoading(true);
    const token = localStorage.getItem("adminToken");
    try {
      const res = await fetch("/api/admin/servicos", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        sessionStorage.setItem(ADMIN_SERVICO_KEY, formData.id);
        alert("Serviço guardado com sucesso!");
        setIsNew(false);
        await refreshServices();
        try {
          const svcRes = await fetch(`/api/servicos/${encodeURIComponent(formData.id)}`, { cache: "no-store" });
          if (svcRes.ok) {
            const updated = await svcRes.json();
            setSelectedService(updated);
            setFormData(updated);
          }
        } catch {
          /* lista já foi atualizada via refreshServices */
        }
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Erro ao guardar serviço");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedService) return;
    if (!confirm(`Tem a certeza que deseja eliminar o serviço "${selectedService.nome_pt}"?`)) return;

    setLoading(true);
    const token = localStorage.getItem("adminToken");
    try {
      const res = await fetch(`/api/admin/servicos/${selectedService.id}`, {
        method: "DELETE",
        headers: { 
          "Authorization": `Bearer ${token}`
        }
      });
      if (res.ok) {
        alert("Serviço eliminado!");
        setSelectedService(null);
        setFormData(null);
        refreshServices();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!formData && !isNew) return <div className="p-8 text-zinc-500 font-bold">Selecione um serviço ou crie um novo...</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black uppercase italic tracking-tighter text-zinc-900">Gestão de Serviços</h1>
          <p className="text-zinc-500 font-medium">Configure cores, logos e banners de cada serviço.</p>
        </div>
        <button 
          onClick={handleNew}
          className="bg-emerald-500 text-black px-6 py-3 rounded-xl font-bold flex items-center space-x-2 hover:bg-emerald-400 transition-all shadow-lg"
        >
          <Plus size={20} />
          <span>Novo Serviço</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar List */}
        <div className="lg:col-span-1 space-y-2">
          {services.map((s) => (
            <button
              key={s.id}
              onClick={() => handleSelect(s)}
              className={`w-full p-4 rounded-xl text-left font-bold transition-all ${
                selectedService?.id === s.id 
                  ? "bg-black text-white shadow-xl scale-[1.02]" 
                  : "bg-white text-zinc-600 hover:bg-zinc-50"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.cor_paleta }} />
                  <span>{s.nome_pt}</span>
                </div>
              </div>
            </button>
          ))}
          {isNew && (
            <div className="w-full p-4 rounded-xl text-left font-bold bg-zinc-200 text-zinc-500 italic">
              Novo Serviço...
            </div>
          )}
        </div>

        {/* Edit Form */}
        <div className="lg:col-span-3">
          <form onSubmit={handleSubmit} className="bg-white rounded-[2.5rem] shadow-sm border border-zinc-100 p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* System Config */}
              <div className="space-y-6 md:col-span-2">
                <h3 className="flex items-center space-x-2 text-sm font-black uppercase tracking-widest text-zinc-400">
                  <LinkIcon size={16} />
                  <span>Configuração de Sistema</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-zinc-400 ml-1">ID Único (ex: g-shop)</label>
                    <input 
                      name="id" 
                      value={formData.id} 
                      onChange={handleChange} 
                      disabled={!isNew}
                      className="w-full bg-zinc-50 p-3 rounded-xl border-none focus:ring-2 focus:ring-black disabled:opacity-50" 
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-zinc-400 ml-1">Caminho / Rota (ex: /servicos/loja)</label>
                    <input name="path" value={formData.path} onChange={handleChange} className="w-full bg-zinc-50 p-3 rounded-xl border-none focus:ring-2 focus:ring-black" />
                  </div>
                </div>
              </div>

              {/* Names */}
              <div className="space-y-6">
                <h3 className="flex items-center space-x-2 text-sm font-black uppercase tracking-widest text-zinc-400">
                  <Globe size={16} />
                  <span>Nomes (Multilingue)</span>
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-zinc-400 ml-1">Português</label>
                    <input name="nome_pt" value={formData.nome_pt} onChange={handleChange} className="w-full bg-zinc-50 p-3 rounded-xl border-none focus:ring-2 focus:ring-black" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-zinc-400 ml-1">Inglês</label>
                    <input name="nome_en" value={formData.nome_en || ""} onChange={handleChange} className="w-full bg-zinc-50 p-3 rounded-xl border-none focus:ring-2 focus:ring-black" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-zinc-400 ml-1">Francês</label>
                    <input name="nome_fr" value={formData.nome_fr || ""} onChange={handleChange} className="w-full bg-zinc-50 p-3 rounded-xl border-none focus:ring-2 focus:ring-black" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-zinc-400 ml-1">Espanhol</label>
                    <input name="nome_es" value={formData.nome_es || ""} onChange={handleChange} className="w-full bg-zinc-50 p-3 rounded-xl border-none focus:ring-2 focus:ring-black" />
                  </div>
                </div>
              </div>

              {/* Visual Config */}
              <div className="space-y-6">
                <h3 className="flex items-center space-x-2 text-sm font-black uppercase tracking-widest text-zinc-400">
                  <Palette size={16} />
                  <span>Identidade Visual</span>
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-zinc-400 ml-1">Cor Principal (Paleta)</label>
                    <div className="flex items-center space-x-4">
                      <input type="color" name="cor_paleta" value={formData.cor_paleta} onChange={handleChange} className="w-12 h-12 rounded-lg cursor-pointer overflow-hidden border-none" />
                      <input type="text" name="cor_paleta" value={formData.cor_paleta} onChange={handleChange} className="flex-1 bg-zinc-50 p-3 rounded-xl border-none underline decoration-2 underline-offset-4" style={{ textDecorationColor: formData.cor_paleta }} />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-zinc-400 ml-1">Cor Secundária</label>
                    <div className="flex items-center space-x-4">
                      <input type="color" name="cor_secundaria" value={formData.cor_secundaria || "#000000"} onChange={handleChange} className="w-12 h-12 rounded-lg cursor-pointer overflow-hidden border-none" />
                      <input type="text" name="cor_secundaria" value={formData.cor_secundaria || "#000000"} onChange={handleChange} className="flex-1 bg-zinc-50 p-3 rounded-xl border-none underline decoration-2 underline-offset-4" style={{ textDecorationColor: formData.cor_secundaria || "#000000" }} />
                    </div>
                  </div>
                  <ImageField
                    label="Logo do serviço"
                    value={formData.logo_url || ""}
                    onChange={(logo_url) => setFormData({ ...formData, logo_url })}
                    folder="servicos"
                  />
                  <ImageField
                    label="Banner principal"
                    value={formData.banner_url || ""}
                    onChange={(banner_url) => setFormData({ ...formData, banner_url })}
                    folder="servicos"
                    previewClassName="w-full h-32 rounded-xl object-cover bg-zinc-100"
                  />
                </div>
              </div>
            </div>

            {/* Descriptions */}
            <div className="space-y-4">
               <h3 className="flex items-center space-x-2 text-sm font-black uppercase tracking-widest text-zinc-400">
                  <Globe size={16} />
                  <span>Descrições</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-zinc-400 ml-1">Descrição (PT)</label>
                    <textarea name="descricao_pt" rows={3} value={formData.descricao_pt || ""} onChange={handleChange} className="w-full bg-zinc-50 p-3 rounded-xl border-none focus:ring-2 focus:ring-black resize-none" />
                  </div>
                  <div>
                     <label className="text-[10px] font-bold uppercase text-zinc-400 ml-1">Descrição (EN)</label>
                    <textarea name="descricao_en" rows={3} value={formData.descricao_en || ""} onChange={handleChange} className="w-full bg-zinc-50 p-3 rounded-xl border-none focus:ring-2 focus:ring-black resize-none" />
                  </div>
                </div>
            </div>

            <div className="flex justify-between items-center pt-4">
              {!isNew && selectedService && (
                <button 
                  type="button"
                  onClick={handleDelete}
                  className="text-red-500 font-bold flex items-center space-x-2 hover:bg-red-50 px-4 py-2 rounded-xl transition-all"
                >
                  <Trash2 size={18} />
                  <span>Eliminar Serviço</span>
                </button>
              )}
              <div className="flex-1" />
              <button 
                type="submit" 
                disabled={loading}
                className="bg-black text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest flex items-center space-x-3 hover:bg-emerald-500 hover:text-black transition-all disabled:opacity-50 shadow-xl"
              >
                <Save size={20} />
                <span>{loading ? "A Guardar..." : (isNew ? "Criar Serviço" : "Guardar Alterações")}</span>
              </button>
            </div>
          </form>

          {!isNew && selectedService && (
            <div className="mt-8">
              <ServiceOptionsPanel servicoId={selectedService.id} servicoNome={selectedService.nome_pt} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
