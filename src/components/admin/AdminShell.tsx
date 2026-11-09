import { ReactNode, useEffect, useMemo, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import clsx from "clsx";
import { getBreadcrumbTrail } from "./menuConfig";
import AdminSidebar from "./Sidebar";
import AdminTopbar from "./Topbar";
import { AdminStatsProvider } from "../../contexts/AdminStatsContext";

interface AdminShellProps {
  children: ReactNode;
}

export default function AdminShell({ children }: AdminShellProps) {
  const location = useLocation();
  const token = localStorage.getItem("adminToken");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() =>
    localStorage.getItem("adminSidebarCollapsed") === "true"
  );

  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  const breadcrumbs = useMemo(() => getBreadcrumbTrail(location.pathname), [location.pathname]);

  useEffect(() => {
    localStorage.setItem("adminSidebarCollapsed", String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = sidebarOpen ? "hidden" : previousOverflow;
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [sidebarOpen]);

  return (
    <div className="min-h-screen bg-stone-50 text-zinc-900 transition-colors duration-300 dark:bg-zinc-950 dark:text-zinc-100">
      <AdminStatsProvider>
        <div className="lg:flex lg:h-screen">
          <aside
            className={clsx(
              "hidden lg:flex flex-col border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 transition-all duration-300 lg:h-screen",
              sidebarCollapsed ? "w-20" : "w-80"
            )}
          >
            <AdminSidebar
              collapsed={sidebarCollapsed}
              onItemClick={() => setSidebarOpen(false)}
              onToggleCollapse={() => setSidebarCollapsed((value) => !value)}
            />
          </aside>

          <div className="flex-1 min-h-0 flex flex-col">
            <AdminTopbar
              collapsed={sidebarCollapsed}
              onToggleSidebar={() => setSidebarCollapsed((value) => !value)}
              onOpenMobileSidebar={() => setSidebarOpen(true)}
            />

            <main className="flex-1 min-h-0 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="space-y-2">
                <p className="text-sm uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400">
                  Painel Administrativo
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  {breadcrumbs.map((crumb, index) => (
                    <span key={`${crumb.title}-${index}`} className="text-sm text-zinc-600 dark:text-zinc-300">
                      {crumb.title}
                      {index < breadcrumbs.length - 1 && (
                        <span className="mx-2 text-zinc-300 dark:text-zinc-600">/</span>
                      )}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <div className="rounded-3xl border border-zinc-200 bg-white/90 px-4 py-3 text-sm font-medium text-zinc-700 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
                  Modo admin ativo
                </div>
              </div>
            </div>

            <div className="grid gap-6">{children}</div>
          </main>
        </div>
      </div>
      </AdminStatsProvider>

      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-full max-w-[20rem] overflow-y-auto bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 shadow-2xl p-6">
            <AdminSidebar
              mobile
              collapsed={false}
              onItemClick={() => setSidebarOpen(false)}
              onToggleCollapse={() => setSidebarCollapsed(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
