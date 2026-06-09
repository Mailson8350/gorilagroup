import React, { useState, useEffect } from "react";
import { Users, Plus, Save, Trash2, Camera, User, Facebook, Instagram, Twitter, Linkedin } from "lucide-react";
import ImageField from "../../components/admin/ImageField";
import { mediaUrl } from "../../lib/media";

export default function AdminTeam() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [formData, setFormData] = useState<any>(null);
  const [isNew, setIsNew] = useState(false);

  const emptyMember = {
    nome: "",
    cargo: "",
    foto: "",
    bio: "",
    redes_sociais: {
      facebook: "",
      instagram: "",
      twitter: "",
      linkedin: ""
    }
  };

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/equipa");
      const data = await res.json();
      setMembers(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Error fetching team:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleSelect = (member: any) => {
    setIsNew(false);
    setSelectedMember(member);
    const redes = typeof member.redes_sociais === "string" ? JSON.parse(member.redes_sociais) : member.redes_sociais;
    setFormData({ ...member, redes_sociais: redes || emptyMember.redes_sociais });
  };

  const handleNew = () => {
    setIsNew(true);
    setSelectedMember(null);
    setFormData(emptyMember);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSocialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      redes_sociais: {
        ...formData.redes_sociais,
        [e.target.name]: e.target.value
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome || !formData.cargo) {
      alert("Nome e Cargo são obrigatórios");
      return;
    }
    const token = localStorage.getItem("adminToken");
    try {
      const res = await fetch("/api/admin/equipa", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        alert("Especialista guardado com sucesso!");
        setIsNew(false);
        fetchMembers();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async () => {
    if (!selectedMember) return;
    if (!confirm(`Deseja remover ${selectedMember.nome} da equipa?`)) return;

    const token = localStorage.getItem("adminToken");
    try {
      const res = await fetch(`/api/admin/equipa/${selectedMember.id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        alert("Membro removido.");
        setSelectedMember(null);
        setFormData(null);
        fetchMembers();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black uppercase italic tracking-tighter text-zinc-900">Gestão da Equipa</h1>
          <p className="text-zinc-500 font-medium">Gerencie os rostos e especialistas da Gorila.</p>
        </div>
        <button 
          onClick={handleNew}
          className="bg-black text-white px-6 py-3 rounded-xl font-bold flex items-center space-x-2 hover:bg-emerald-500 hover:text-black transition-all"
        >
          <Plus size={20} />
          <span>Novo Membro</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-zinc-100 max-h-[600px] overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-zinc-400">A carregar...</div>
            ) : members.length === 0 ? (
              <div className="p-4 text-center text-zinc-400 font-bold italic">Nenhum membro listado.</div>
            ) : (
              members.map((m) => (
                <button
                  key={m.id}
                  onClick={() => handleSelect(m)}
                  className={`w-full p-3 rounded-2xl flex items-center space-x-3 transition-all mb-2 ${
                    selectedMember?.id === m.id ? "bg-black text-white shadow-lg" : "bg-white text-zinc-600 hover:bg-zinc-50"
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-zinc-100 overflow-hidden flex-shrink-0">
                    {m.foto ? (
                      <img src={mediaUrl(m.foto)} alt={m.nome} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <User className="w-full h-full p-2 text-zinc-300" />
                    )}
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-sm truncate w-32">{m.nome}</div>
                    <div className="text-[10px] uppercase font-black opacity-50">{m.cargo}</div>
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
                <div className="md:col-span-1 space-y-4 text-center">
                  <div className="w-48 h-48 mx-auto rounded-3xl bg-zinc-50 border-2 border-dashed border-zinc-200 overflow-hidden relative flex items-center justify-center">
                    {formData.foto ? (
                      <img src={mediaUrl(formData.foto)} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <Camera size={48} className="text-zinc-200" />
                    )}
                  </div>
                  <ImageField
                    label="Fotografia"
                    value={formData.foto}
                    onChange={(foto) => setFormData({ ...formData, foto })}
                    folder="equipa"
                    previewClassName="w-48 h-48 mx-auto rounded-3xl object-cover"
                  />
                </div>

                <div className="md:col-span-2 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold uppercase text-zinc-400 ml-1">Nome Completo</label>
                      <input name="nome" value={formData.nome} onChange={handleChange} className="w-full bg-zinc-50 p-3 rounded-xl border-none focus:ring-2 focus:ring-black" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase text-zinc-400 ml-1">Cargo / Função</label>
                      <input name="cargo" value={formData.cargo} onChange={handleChange} className="w-full bg-zinc-50 p-3 rounded-xl border-none focus:ring-2 focus:ring-black" />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase text-zinc-400 ml-1">Biografia / Descrição</label>
                    <textarea 
                      name="bio" 
                      value={formData.bio} 
                      onChange={handleChange} 
                      rows={4}
                      className="w-full bg-zinc-50 p-3 rounded-xl border-none focus:ring-2 focus:ring-black"
                    />
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400">Redes Sociais</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="relative">
                        <Facebook size={16} className="absolute left-3 top-3 text-zinc-400" />
                        <input name="facebook" value={formData.redes_sociais.facebook} onChange={handleSocialChange} placeholder="Facebook" className="w-full bg-zinc-50 p-3 pl-10 rounded-xl border-none text-sm" />
                      </div>
                      <div className="relative">
                        <Instagram size={16} className="absolute left-3 top-3 text-zinc-400" />
                        <input name="instagram" value={formData.redes_sociais.instagram} onChange={handleSocialChange} placeholder="Instagram" className="w-full bg-zinc-50 p-3 pl-10 rounded-xl border-none text-sm" />
                      </div>
                      <div className="relative">
                        <Twitter size={16} className="absolute left-3 top-3 text-zinc-400" />
                        <input name="twitter" value={formData.redes_sociais.twitter} onChange={handleSocialChange} placeholder="Twitter" className="w-full bg-zinc-50 p-3 pl-10 rounded-xl border-none text-sm" />
                      </div>
                      <div className="relative">
                        <Linkedin size={16} className="absolute left-3 top-3 text-zinc-400" />
                        <input name="linkedin" value={formData.redes_sociais.linkedin} onChange={handleSocialChange} placeholder="LinkedIn" className="w-full bg-zinc-50 p-3 pl-10 rounded-xl border-none text-sm" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-8 border-t border-zinc-100">
                {!isNew && selectedMember && (
                  <button 
                    type="button"
                    onClick={handleDelete}
                    className="text-red-500 font-bold flex items-center space-x-2 hover:bg-red-50 px-4 py-2 rounded-xl transition-all"
                  >
                    <Trash2 size={18} />
                    <span>Remover Membro</span>
                  </button>
                )}
                <div className="flex-1" />
                <button 
                  type="submit" 
                  className="bg-black text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest flex items-center space-x-3 hover:bg-emerald-500 hover:text-black transition-all shadow-xl"
                >
                  <Save size={20} />
                  <span>{isNew ? "Adicionar" : "Guardar Alterações"}</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="h-full flex items-center justify-center bg-zinc-50 rounded-[2.5rem] border-2 border-dashed border-zinc-200 p-20 text-center">
              <div>
                <Users size={64} className="mx-auto text-zinc-200 mb-6" />
                <h2 className="text-2xl font-black italic uppercase tracking-tighter text-zinc-300">Selecione ou Crie um Especialista</h2>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

