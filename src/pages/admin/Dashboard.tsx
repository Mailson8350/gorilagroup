import { useState, useEffect } from "react";
import { ShoppingBag, Calendar, MessageSquare, Users, TrendingUp, Briefcase, Inbox, ArrowUpRight } from "lucide-react";
import { motion } from "motion/react";
import { adminFetchJson, isAdminFetchError } from "../../lib/adminApi";
import AdminErrorBanner from "../../components/admin/AdminErrorBanner";

interface ActivityItem {
  id: string;
  title: string;
  subtitle: string;
  meta: string;
  time: string;
  status?: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Record<string, number> | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatsAndActivity = async () => {
      setLoading(true);
      setError(null);

      const statsResult = await adminFetchJson<Record<string, number>>("/api/admin/stats");
      if (!statsResult.ok) {
        setStats(null);
        if (isAdminFetchError(statsResult)) setError(statsResult.error);
        else setError("Erro inesperado.");
      } else {
        setStats(statsResult.data);
      }

      const activityItems: ActivityItem[] = [];

      const [reservasRes, mensagensRes, solicitacoesRes, pedidosRes] = await Promise.all([
        adminFetchJson<any[]>("/api/admin/reservas"),
        adminFetchJson<any[]>("/api/admin/mensagens"),
        adminFetchJson<any[]>("/api/admin/solicitacoes-servico"),
        adminFetchJson<any[]>("/api/admin/pedidos"),
      ]);

      if (reservasRes.ok) {
        activityItems.push(
          ...reservasRes.data.map((item) => ({
            id: `reserva-${item.id}`,
            title: `Reserva de ${item.nome_cliente}`,
            subtitle: item.quarto_nome ? `Quarto: ${item.quarto_nome}` : `Quarto ID: ${item.quarto_id}`,
            meta: `Pessoas: ${item.num_pessoas ?? 1}`,
            time: item.data_inicio && item.data_fim ? `${item.data_inicio} → ${item.data_fim}` : item.created_at || "Sem data",
            status: item.status,
          }))
        );
      }

      if (mensagensRes.ok) {
        activityItems.push(
          ...mensagensRes.data.map((item) => ({
            id: `mensagem-${item.id}`,
            title: `Mensagem de ${item.nome}`,
            subtitle: item.assunto ? `Assunto: ${item.assunto}` : `Email: ${item.email}`,
            meta: item.email || "Sem email",
            time: item.data || "Sem data",
            status: undefined,
          }))
        );
      }

      if (solicitacoesRes.ok) {
        activityItems.push(
          ...solicitacoesRes.data.map((item) => ({
            id: `solicitacao-${item.id}`,
            title: `Solicitação de ${item.nome_cliente}`,
            subtitle: item.opcao_nome ? `Opção: ${item.opcao_nome}` : `Serviço: ${item.servico_nome || item.servico_id}`,
            meta: item.email_cliente || item.telefone || "Sem contacto",
            time: item.data || "Sem data",
            status: item.status,
          }))
        );
      }

      if (pedidosRes.ok) {
        activityItems.push(
          ...pedidosRes.data.map((item) => ({
            id: `pedido-${item.id}`,
            title: `Pedido de ${item.nome_cliente}`,
            subtitle: `Total: ${Number(item.total).toFixed(2)} FCFA`,
            meta: item.telefone || item.email || "Sem contacto",
            time: item.data || "Sem data",
            status: item.status,
          }))
        );
      }

      const sortedActivity = activityItems
        .map((item) => {
          const sortKey =
            item.time.match(/\d{4}-\d{2}-\d{2}/)?.[0] ??
            item.time ??
            "";
          return {
            ...item,
            timeValue: new Date(sortKey).getTime() || 0,
          };
        })
        .sort((a, b) => b.timeValue - a.timeValue)
        .slice(0, 6)
        .map(({ timeValue, ...item }) => item);

      setActivity(sortedActivity);
      setLoading(false);
    };

    fetchStatsAndActivity();
    const onFocus = () => fetchStatsAndActivity();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  if (loading) return <div className="text-secondary font-bold p-8">Carregando...</div>;

  const statusClass = (status?: string) => {
    if (!status) return "bg-zinc-100 text-zinc-600";
    const lower = status.toLowerCase();
    if (lower.includes("pend")) return "bg-amber-100 text-amber-700";
    if (lower.includes("confi") || lower.includes("aceit")) return "bg-emerald-100 text-emerald-700";
    if (lower.includes("canc") || lower.includes("rej")) return "bg-rose-100 text-rose-700";
    return "bg-zinc-100 text-zinc-600";
  };

  const cards = [
    { name: "Reservas", value: stats?.reservas || 0, icon: <Calendar />, color: "bg-primary/10 text-primary" },
    { name: "Mensagens", value: stats?.mensagens || 0, icon: <MessageSquare />, color: "bg-primary/10 text-primary" },
    { name: "Solicitações", value: stats?.solicitacoes || 0, icon: <Inbox />, color: "bg-primary/10 text-primary" },
    { name: "Pedidos Loja", value: stats?.pedidos || 0, icon: <ShoppingBag />, color: "bg-primary/10 text-primary" },
    { name: "Produtos", value: stats?.produtos || 0, icon: <ShoppingBag />, color: "bg-primary/10 text-primary" },
    { name: "Portfólio", value: stats?.portfolio || 0, icon: <Briefcase size={24} />, color: "bg-primary/10 text-primary" },
    { name: "Equipa", value: stats?.equipa || 0, icon: <Users />, color: "bg-primary/10 text-primary" },
  ];

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-display font-bold uppercase tracking-tight text-secondary">Dashboard</h1>
          <p className="text-zinc-500 mt-2 max-w-2xl">
            Visão geral moderna e dinâmica das reservas, mensagens, pedidos e solicitações do seu negócio.
          </p>
        </div>
        <div className="bg-white/95 px-6 py-3 rounded-3xl shadow-xl border border-zinc-200/70 flex items-center space-x-3 backdrop-blur-xl">
          <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-sm font-semibold uppercase tracking-[0.3em] text-secondary">Sistema Online</span>
        </div>
      </div>

      {error && <AdminErrorBanner message={error} />}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {cards.map((card) => (
          <motion.div
            key={card.name}
            whileHover={{ y: -6 }}
            className="group bg-white/95 border border-zinc-200/80 shadow-2xl shadow-zinc-100/60 rounded-3xl p-8 transition-transform duration-300 hover:-translate-y-1"
          >
            <div className="flex items-center justify-between mb-6">
              <div className={`${card.color} p-4 rounded-3xl shadow-sm`}>{card.icon}</div>
              <div className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                +12%
              </div>
            </div>
            <div>
              <p className="text-zinc-400 text-[11px] font-semibold uppercase tracking-[0.35em] mb-2">{card.name}</p>
              <h3 className="text-4xl font-black text-secondary">{card.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white/95 border border-zinc-200/80 shadow-2xl rounded-3xl p-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8 border-b border-zinc-100 pb-6">
            <div>
              <h3 className="text-2xl font-display font-bold uppercase tracking-tight text-secondary">Atividade Recente</h3>
              <p className="text-sm text-zinc-500 mt-1">Os últimos eventos e contactos do painel de administração.</p>
            </div>
            <button className="self-start sm:self-auto inline-flex items-center justify-center rounded-full border border-primary/20 bg-primary/5 px-5 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-primary transition hover:bg-primary/10">
              Ver tudo
            </button>
          </div>

          <div className="space-y-4">
            {activity.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-zinc-200 bg-zinc-50 p-10 text-center text-zinc-500 font-semibold">
                Nenhuma atividade recente disponível.
              </div>
            ) : (
              activity.map((item) => (
                <div
                  key={item.id}
                  className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-zinc-200/70 bg-zinc-50 p-5 transition hover:border-primary/30 hover:bg-white"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-primary/15 to-primary/5 text-primary shadow-sm">
                      <ArrowUpRight size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-secondary">{item.title}</p>
                      <p className="mt-1 text-sm text-zinc-500">{item.subtitle}</p>
                      <p className="mt-2 text-[11px] uppercase tracking-[0.3em] text-zinc-500">{item.meta}</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-start sm:items-end gap-2">
                    <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-500">{item.time}</p>
                    {item.status ? (
                      <span className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] ${statusClass(item.status)}`}>
                        {item.status}
                      </span>
                    ) : null}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-rose-500 to-violet-700 p-10 text-white shadow-2xl">
          <div className="relative z-10">
            <h3 className="text-2xl font-display font-bold uppercase tracking-tight mb-5">Dica do Sistema</h3>
            <p className="text-sm leading-7 text-white/90 mb-10 italic">
              Mantenha o seu portfólio atualizado para atrair mais clientes. Eventos recentes geram 40% mais interesse.
            </p>
            <button className="w-full rounded-3xl bg-white/15 px-5 py-4 text-sm font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-white/25">
              Atualizar Portfólio
            </button>
          </div>
          <div className="pointer-events-none absolute -right-12 -bottom-12 h-52 w-52 rounded-full bg-white/10 blur-3xl" />
        </div>
      </div>
    </div>
  );
}
