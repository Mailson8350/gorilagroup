import { useState, useEffect } from "react";
import { ShoppingBag, Calendar, MessageSquare, Users, TrendingUp, Briefcase, Inbox, ArrowUpRight } from "lucide-react";
import { motion } from "motion/react";
import { adminFetchJson } from "../../lib/adminApi";
import AdminErrorBanner from "../../components/admin/AdminErrorBanner";

export default function AdminDashboard() {
  const [stats, setStats] = useState<Record<string, number> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      const result = await adminFetchJson<Record<string, number>>("/api/admin/stats");
      if (result.ok) setStats(result.data);
      else {
        setStats(null);
        setError(result.error);
      }
      setLoading(false);
    };
    fetchStats();
    const onFocus = () => fetchStats();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  if (loading) return <div className="text-secondary font-bold p-8">Carregando...</div>;

  const cards = [
    { name: "Reservas", value: stats?.reservas || 0, icon: <Calendar />, color: "bg-primary" },
    { name: "Mensagens", value: stats?.mensagens || 0, icon: <MessageSquare />, color: "bg-primary" },
    { name: "Solicitações", value: stats?.solicitacoes || 0, icon: <Inbox />, color: "bg-primary" },
    { name: "Pedidos Loja", value: stats?.pedidos || 0, icon: <ShoppingBag />, color: "bg-primary" },
    { name: "Produtos", value: stats?.produtos || 0, icon: <ShoppingBag />, color: "bg-primary" },
    { name: "Portfólio", value: stats?.portfolio || 0, icon: <Briefcase size={24} />, color: "bg-primary" },
    { name: "Equipa", value: stats?.equipa || 0, icon: <Users />, color: "bg-primary" },
  ];

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-display font-bold uppercase tracking-tight text-secondary">Dashboard</h1>
          <p className="text-zinc-500 mt-2">Bem-vindo ao painel de controlo do Gorila Hub.</p>
        </div>
        <div className="bg-white px-6 py-3 rounded-xl shadow-sm border border-zinc-100 flex items-center space-x-3">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-sm font-bold uppercase tracking-widest text-secondary">Sistema Online</span>
        </div>
      </div>

      {error && <AdminErrorBanner message={error} />}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {cards.map((card) => (
          <motion.div 
            key={card.name} 
            whileHover={{ y: -5 }}
            className="bg-white p-8 rounded-2xl shadow-xl border border-zinc-100 relative overflow-hidden group"
          >
            <div className="relative z-10 flex items-center justify-between mb-6">
              <div className={`${card.color} text-secondary p-4 rounded-xl shadow-lg`}>
                {card.icon}
              </div>
              <div className="flex items-center text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg text-[10px] font-black uppercase">
                <TrendingUp size={12} className="mr-1" />
                <span>+12%</span>
              </div>
            </div>
            <div className="relative z-10">
              <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest mb-1">{card.name}</p>
              <h3 className="text-3xl font-black text-secondary">{card.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-10 rounded-2xl shadow-xl border border-zinc-100">
          <div className="flex items-center justify-between mb-10 border-b border-zinc-100 pb-6">
            <h3 className="text-xl font-display font-bold uppercase tracking-tight">Atividade Recente</h3>
            <button className="text-xs font-bold text-primary hover:underline uppercase tracking-widest">Ver tudo</button>
          </div>
          <div className="space-y-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 hover:bg-zinc-50 rounded-xl transition-colors cursor-pointer group border border-transparent hover:border-zinc-100">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-zinc-100 rounded-xl flex items-center justify-center text-zinc-400 group-hover:bg-primary/20 group-hover:text-secondary transition-colors">
                    <ArrowUpRight size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-secondary">Nova reserva no Hostel</p>
                    <p className="text-xs text-zinc-400">Há 2 horas por João Silva</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest bg-zinc-100 px-3 py-1 rounded-md text-zinc-500">Pendente</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-secondary p-10 rounded-2xl text-white relative overflow-hidden shadow-xl">
          <div className="relative z-10">
            <h3 className="text-xl font-display font-bold uppercase tracking-tight mb-6 text-primary">Dica do Sistema</h3>
            <p className="text-zinc-400 text-sm leading-relaxed mb-10 italic">
              "Mantenha o seu portfólio atualizado para atrair mais clientes. Eventos recentes geram 40% mais interesse."
            </p>
            <button className="w-full bg-white/10 hover:bg-white/20 text-white py-4 rounded-xl font-bold transition-all border border-white/20 uppercase tracking-widest text-xs">
              Atualizar Portfólio
            </button>
          </div>
          <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />
        </div>
      </div>
    </div>
  );
}
