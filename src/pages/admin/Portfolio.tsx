import React, { useState, useEffect } from "react";
import { Briefcase, Plus, Save, Trash2, Camera, Calendar, Tag, FileText } from "lucide-react";
import ImageField from "../../components/admin/ImageField";
import { mediaUrl } from "../../lib/media";

export default function AdminPortfolio() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [formData, setFormData] = useState<any>(null);
  const [isNew, setIsNew] = useState(false);

  const emptyProject = {
    titulo: "",
    descricao: "",
    imagem: "",
    data: new Date().toISOString().split("T")[0],
    tipo_evento: ""
  };

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/portfolio");
      const data = await res.json();
      setProjects(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Error fetching portfolio:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleSelect = (project: any) => {
    setIsNew(false);
    setSelectedProject(project);
    setFormData({ ...project });
  };

  const handleNew = () => {
    setIsNew(true);
    setSelectedProject(null);
    setFormData(emptyProject);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.titulo) {
      alert("Título é obrigatório");
      return;
    }
    const token = localStorage.getItem("adminToken");
    try {
      const res = await fetch("/api/admin/portfolio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        alert("Projeto guardado com sucesso!");
        setIsNew(false);
        fetchProjects();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async () => {
    if (!selectedProject) return;
    if (!confirm(`Deseja remover o projeto "${selectedProject.titulo}"?`)) return;

    const token = localStorage.getItem("adminToken");
    try {
      const res = await fetch(`/api/admin/portfolio/${selectedProject.id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        alert("Projeto removido.");
        setSelectedProject(null);
        setFormData(null);
        fetchProjects();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black uppercase italic tracking-tighter text-zinc-900">Gestão de Portfólio</h1>
          <p className="text-zinc-500 font-medium">Exiba os melhores momentos e trabalhos realizados pela Gorila.</p>
        </div>
        <button 
          onClick={handleNew}
          className="bg-black text-white px-6 py-3 rounded-xl font-bold flex items-center space-x-2 hover:bg-pink-500 hover:text-black transition-all shadow-lg"
        >
          <Plus size={20} />
          <span>Novo Projeto</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-zinc-100 max-h-[600px] overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-zinc-400">A carregar...</div>
            ) : projects.length === 0 ? (
              <div className="p-4 text-center text-zinc-400 font-bold italic">Nenhum projeto registado.</div>
            ) : (
              projects.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleSelect(p)}
                  className={`w-full p-3 rounded-2xl flex items-center space-x-3 transition-all mb-2 ${
                    selectedProject?.id === p.id ? "bg-black text-white shadow-lg" : "bg-white text-zinc-600 hover:bg-zinc-50"
                  }`}
                >
                  <div className="w-12 h-12 rounded-xl bg-zinc-100 overflow-hidden flex-shrink-0">
                    {p.imagem ? (
                      <img src={mediaUrl(p.imagem)} alt={p.titulo} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <Briefcase className="w-full h-full p-3 text-zinc-300" />
                    )}
                  </div>
                  <div className="text-left overflow-hidden">
                    <div className="font-bold text-sm truncate">{p.titulo}</div>
                    <div className="text-[10px] uppercase font-black opacity-50 truncate">{p.tipo_evento}</div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="lg:col-span-3">
          {formData ? (
            <form onSubmit={handleSubmit} className="bg-white rounded-[2.5rem] shadow-sm border border-zinc-100 p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1 space-y-4">
                  <div className="aspect-square w-full rounded-3xl bg-zinc-50 border-2 border-dashed border-zinc-200 overflow-hidden relative flex items-center justify-center">
                    {formData.imagem ? (
                      <img src={mediaUrl(formData.imagem)} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <Camera size={48} className="text-zinc-200" />
                    )}
                  </div>
                  <ImageField
                    label="Imagem de capa"
                    value={formData.imagem}
                    onChange={(imagem) => setFormData({ ...formData, imagem })}
                    folder="portfolio"
                    previewClassName="w-full aspect-square rounded-3xl object-cover"
                  />
                </div>

                <div className="md:col-span-2 space-y-6">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-zinc-400 ml-1">Título do Projeto</label>
                    <input 
                      name="titulo" 
                      value={formData.titulo} 
                      onChange={handleChange} 
                      placeholder="Ex: Casamento Luxo 2024"
                      className="w-full bg-zinc-50 p-4 rounded-2xl border-none focus:ring-2 focus:ring-black font-bold text-lg" 
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-zinc-400 ml-1 flex items-center gap-1">
                        <Calendar size={12} /> Data do Evento
                      </label>
                      <input 
                        type="date"
                        name="data" 
                        value={formData.data} 
                        onChange={handleChange} 
                        className="w-full bg-zinc-50 p-3 rounded-xl border-none focus:ring-2 focus:ring-black" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-zinc-400 ml-1 flex items-center gap-1">
                        <Tag size={12} /> Tipo de Evento
                      </label>
                      <input 
                        name="tipo_evento" 
                        value={formData.tipo_evento} 
                        onChange={handleChange} 
                        placeholder="Ex: Casamento, Concerto, Conferência"
                        className="w-full bg-zinc-50 p-3 rounded-xl border-none focus:ring-2 focus:ring-black" 
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-zinc-400 ml-1 flex items-center gap-1">
                      <FileText size={12} /> Descrição / Detalhes
                    </label>
                    <textarea 
                      name="descricao" 
                      value={formData.descricao} 
                      onChange={handleChange} 
                      rows={6}
                      placeholder="Descreva o sucesso deste evento..."
                      className="w-full bg-zinc-50 p-4 rounded-2xl border-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-8 border-t border-zinc-100">
                {!isNew && selectedProject && (
                  <button 
                    type="button"
                    onClick={handleDelete}
                    className="text-red-500 font-bold flex items-center space-x-2 hover:bg-red-50 px-4 py-2 rounded-xl transition-all"
                  >
                    <Trash2 size={18} />
                    <span>Eliminar Projeto</span>
                  </button>
                )}
                <div className="flex-1" />
                <button 
                  type="submit" 
                  className="bg-black text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest flex items-center space-x-3 hover:bg-pink-500 hover:text-black transition-all shadow-xl"
                >
                  <Save size={20} />
                  <span>{isNew ? "Publicar Projeto" : "Guardar Alterações"}</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="h-full flex items-center justify-center bg-zinc-50 rounded-[2.5rem] border-2 border-dashed border-zinc-200 p-20 text-center">
              <div>
                <Briefcase size={64} className="mx-auto text-zinc-200 mb-6" />
                <h2 className="text-2xl font-black italic uppercase tracking-tighter text-zinc-300">Selecione um Projeto para Editar</h2>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

