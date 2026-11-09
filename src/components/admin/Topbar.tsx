import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bell,
  LogOut,
  Menu,
  Moon,
  Search,
  Settings,
  Sun,
  User,
} from "lucide-react";
import { useSettings } from "../../contexts/SettingsContext";
import { useAdminStatsContext } from "../../contexts/AdminStatsContext";

interface AdminTopbarProps {
  collapsed: boolean;
  onToggleSidebar: () => void;
  onOpenMobileSidebar: () => void;
}

export default function AdminTopbar({
  collapsed,
  onToggleSidebar,
  onOpenMobileSidebar,
}: AdminTopbarProps) {
  const { siteConfig, themeMode, toggleTheme } = useSettings();
  const { stats } = useAdminStatsContext();
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };
    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const notificationCount = stats
    ? stats.mensagens + stats.reservas + stats.solicitacoes + stats.pedidos
    : 0;

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    navigate("/admin/login");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/90 backdrop-blur-xl transition-colors duration-300 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto flex h-20 flex-wrap items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="hidden h-11 w-11 items-center justify-center rounded-2xl border border-zinc-200 bg-white text-zinc-700 shadow-sm transition hover:border-zinc-300 hover:text-primary dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 lg:inline-flex"
            aria-label="Alternar navegação"
          >
            <Menu size={20} />
          </button>
          <button
            type="button"
            onClick={onOpenMobileSidebar}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-zinc-200 bg-white text-zinc-700 shadow-sm transition hover:border-zinc-300 hover:text-primary dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 lg:hidden"
            aria-label="Abrir menu mobile"
          >
            <Menu size={20} />
          </button>

          <div className="hidden md:flex min-w-0 items-center gap-3 overflow-hidden rounded-3xl border border-zinc-200 bg-zinc-100 px-4 py-3 text-sm text-zinc-600 shadow-sm transition-colors duration-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
            <Search size={18} className="text-zinc-400 shrink-0" />
            <input
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Buscar no painel..."
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
              aria-label="Buscar no painel"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-zinc-200 bg-white text-zinc-700 shadow-sm transition hover:border-zinc-300 hover:text-primary dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
            aria-label="Alternar tema"
          >
            {themeMode === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button
            type="button"
            className="relative inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-zinc-200 bg-white text-zinc-700 shadow-sm transition hover:border-zinc-300 hover:text-primary dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
            aria-label="Notificações"
          >
            <Bell size={20} />
            {notificationCount > 0 ? (
              <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-semibold text-white">
                {notificationCount}
              </span>
            ) : (
              <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-zinc-300 px-1.5 text-[10px] font-semibold text-zinc-700 dark:bg-zinc-700 dark:text-zinc-100">
                0
              </span>
            )}
          </button>

          <div ref={dropdownRef} className="relative">
            <button
              type="button"
              onClick={() => setProfileOpen((value) => !value)}
              className="inline-flex items-center gap-3 rounded-3xl border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-700 shadow-sm transition hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
              aria-label="Abrir menu do perfil"
              aria-expanded={profileOpen}
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-white">
                {siteConfig.site_name?.charAt(0) || "G"}
              </span>
              <span className="hidden min-w-[100px] text-left sm:block">
                {siteConfig.site_name || "Administrador"}
              </span>
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-full mt-3 w-56 overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">
                <div className="space-y-1 p-4">
                  <p className="text-sm font-semibold text-zinc-900 dark:text-white">{siteConfig.site_name || "Gorila Group"}</p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">Administrador do painel</p>
                </div>
                <div className="border-t border-zinc-200 dark:border-zinc-800">
                  <Link
                    to="/admin/configuracoes"
                    className="flex items-center gap-2 px-4 py-3 text-sm text-zinc-700 transition hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-900"
                    onClick={() => setProfileOpen(false)}
                  >
                    <Settings size={16} />
                    Configurações
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 dark:hover:bg-red-950 dark:text-red-400"
                  >
                    <LogOut size={16} />
                    Sair
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
