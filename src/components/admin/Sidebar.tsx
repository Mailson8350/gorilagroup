import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  ShoppingBag, 
  MessageSquare, 
  Calendar, 
  Users, 
  Briefcase, 
  Settings, 
  Tags,
  Image,
  LogOut,
  ChevronRight,
  Sliders
} from "lucide-react";

export default function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { name: "Dashboard", path: "/admin/dashboard", icon: <LayoutDashboard size={20} /> },
    { name: "Produtos", path: "/admin/produtos", icon: <ShoppingBag size={20} /> },
    { name: "Pedidos Loja", path: "/admin/pedidos", icon: <ShoppingBag size={20} /> },
    { name: "Categorias", path: "/admin/categorias", icon: <Tags size={20} /> },
    { name: "Reservas", path: "/admin/reservas", icon: <Calendar size={20} /> },
    { name: "Solicitações", path: "/admin/solicitacoes", icon: <MessageSquare size={20} /> },
    { name: "Serviços", path: "/admin/servicos", icon: <Settings size={20} /> },
    { name: "Mensagens", path: "/admin/mensagens", icon: <MessageSquare size={20} /> },
    { name: "Equipa", path: "/admin/equipa", icon: <Users size={20} /> },
    { name: "Portfólio", path: "/admin/portfolio", icon: <Briefcase size={20} /> },
    { name: "Configurações", path: "/admin/configuracoes", icon: <Sliders size={20} /> },
  ];

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    navigate("/admin/login");
  };

  return (
    <aside className="w-72 bg-zinc-950 text-zinc-400 flex flex-col border-r border-zinc-900">
      <div className="p-8">
        <Link to="/admin/dashboard" className="text-white text-2xl font-black uppercase italic tracking-tighter">
          Gorila <span className="text-emerald-500">Admin</span>
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        <p className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 mb-4">Menu Principal</p>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center justify-between px-4 py-3 rounded-2xl transition-all group ${
                isActive 
                  ? "bg-emerald-500 text-black font-bold" 
                  : "hover:bg-zinc-900 hover:text-white"
              }`}
            >
              <div className="flex items-center space-x-3">
                {item.icon}
                <span className="text-sm">{item.name}</span>
              </div>
              {isActive && <ChevronRight size={16} />}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-zinc-900">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-red-500 hover:bg-red-500/10 transition-all font-bold text-sm"
        >
          <LogOut size={20} />
          <span>Sair do Sistema</span>
        </button>
      </div>
    </aside>
  );
}
