import { Link, useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, ChevronRight, LogOut, MenuSquare } from "lucide-react";
import { useEffect, useState } from "react";
import clsx from "clsx";
import { useSettings } from "../../contexts/SettingsContext";
import MediaImage from "../MediaImage";
import { adminMenu } from "./menuConfig";
import { useAdminStatsContext } from "../../contexts/AdminStatsContext";

interface AdminSidebarProps {
  collapsed?: boolean;
  mobile?: boolean;
  onItemClick?: () => void;
  onToggleCollapse?: () => void;
}

export default function AdminSidebar({
  collapsed = false,
  mobile = false,
  onItemClick,
  onToggleCollapse,
}: AdminSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { siteConfig } = useSettings();
  const { stats } = useAdminStatsContext();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    navigate("/admin/login");
  };

  useEffect(() => {
    const currentExpanded: Record<string, boolean> = {};
    adminMenu.forEach((section) => {
      section.items.forEach((item) => {
        if (item.children) {
          currentExpanded[item.title] = item.children.some((child) => child.path === location.pathname);
        }
      });
    });
    setExpandedSections(currentExpanded);
  }, [location.pathname]);

  const isActiveRoute = (path?: string) => path && location.pathname === path;

  return (
    <div
      className={clsx(
        "flex h-full flex-col overflow-hidden bg-white shadow-xl transition-all duration-300 dark:bg-zinc-950",
        mobile ? "rounded-3xl" : "rounded-[32px] border border-zinc-200 dark:border-zinc-800"
      )}
    >
      <div className="flex items-center justify-between gap-3 border-b border-zinc-200 p-5 dark:border-zinc-800">
        <Link
          to="/admin/dashboard"
          className="flex items-center gap-3"
          onClick={onItemClick}
          aria-label="Ir ao dashboard"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-primary text-white shadow-lg">
            <MediaImage src={siteConfig.logo_url} alt="Logo" className="h-full w-full object-cover" />
          </div>
          {!collapsed && (
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-zinc-500 dark:text-zinc-400">Painel</p>
              <h2 className="text-base font-black uppercase tracking-tight text-zinc-950 dark:text-white">
                {siteConfig.site_name || "Gorila"}
              </h2>
            </div>
          )}
        </Link>

        {!mobile && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-50 text-zinc-600 transition hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
            aria-label="Alternar barra lateral"
          >
            <MenuSquare size={18} />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-5">
        {adminMenu.map((section) => (
          <div key={section.title} className="mb-6">
            {!collapsed && (
              <p className="px-4 pb-3 text-[10px] font-black uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">
                {section.title}
              </p>
            )}

            <div className="space-y-2">
              {section.items.map((item) => {
                const active = isActiveRoute(item.path) || item.children?.some((child) => isActiveRoute(child.path));
                const expanded = expandedSections[item.title] || false;
                const hasChildren = Boolean(item.children?.length);
                const itemBadgeCount = item.badgeKey && stats ? stats[item.badgeKey] : item.badge;

                return (
                  <div key={item.title}>
                    {item.path && !hasChildren ? (
                      <Link
                        to={item.path}
                        onClick={onItemClick}
                        className={clsx(
                          "group flex items-center justify-between gap-3 rounded-3xl px-4 py-3 transition-all duration-200",
                          collapsed ? "justify-center" : "justify-between",
                          active
                            ? "bg-primary text-white shadow-lg"
                            : "bg-zinc-50 text-zinc-700 hover:bg-primary/10 hover:text-secondary dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
                        )}
                      >
                        <div className="relative flex min-w-0 items-center gap-3">
                          <span className={clsx("text-zinc-500 transition-colors duration-200", active ? "text-white" : "group-hover:text-secondary dark:text-zinc-300 dark:group-hover:text-white")}>{item.icon ? <item.icon size={18} /> : null}</span>
                          {itemBadgeCount ? (
                            <span className={clsx(
                              "absolute -right-2 top-0 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-semibold text-white",
                              collapsed ? "translate-x-1/2" : ""
                            )}>
                              {itemBadgeCount}
                            </span>
                          ) : null}
                          {!collapsed && <span className="truncate text-sm font-semibold">{item.title}</span>}
                        </div>
                        {!collapsed && active && <ChevronRight size={16} className="text-white" />}
                      </Link>
                    ) : (
                      <div>
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedSections((prev) => ({
                              ...prev,
                              [item.title]: !prev[item.title],
                            }))
                          }
                          className={clsx(
                            "group flex w-full items-center justify-between gap-3 rounded-3xl px-4 py-3 transition-all duration-200",
                            collapsed ? "justify-center" : "justify-between",
                            active
                              ? "bg-primary text-white shadow-lg"
                              : "bg-zinc-50 text-zinc-700 hover:bg-primary/10 hover:text-secondary dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <span className={clsx("text-zinc-500 transition-colors duration-200", active ? "text-white" : "group-hover:text-secondary dark:text-zinc-300 dark:group-hover:text-white")}>{item.icon ? <item.icon size={18} /> : null}</span>
                            {!collapsed && <span className="text-sm font-semibold">{item.title}</span>}
                          </div>
                          {!collapsed && (
                            <ChevronDown
                              size={16}
                              className={clsx(
                                "transform transition-transform duration-200",
                                expanded ? "rotate-180" : "rotate-0",
                                active ? "text-white" : "text-zinc-500"
                              )}
                            />
                          )}
                        </button>
                        {hasChildren && (
                          <div
                            className={clsx(
                              "overflow-hidden transition-[max-height] duration-300",
                              expanded ? "max-h-80" : "max-h-0"
                            )}
                          >
                            <div className="space-y-1 px-3 pt-2">
                              {item.children?.map((child) => {
                                const childActive = isActiveRoute(child.path);
                                return (
                                  <Link
                                    key={child.title}
                                    to={child.path || "#"}
                                    onClick={onItemClick}
                                    className={clsx(
                                      "flex min-w-0 items-center gap-3 rounded-2xl px-4 py-2 text-sm transition-all duration-200",
                                      childActive
                                        ? "bg-primary/15 text-primary"
                                        : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                                    )}
                                  >
                                    <span className="w-2 rounded-full bg-zinc-400 dark:bg-zinc-500" />
                                    <span>{child.title}</span>
                                  </Link>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-zinc-200 p-4 dark:border-zinc-800">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-3xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-100 dark:border-red-900/70 dark:bg-red-950/70 dark:text-red-300"
        >
          <LogOut size={18} />
          {!collapsed ? "Sair do Sistema" : "Sair"}
        </button>
      </div>
    </div>
  );
}
