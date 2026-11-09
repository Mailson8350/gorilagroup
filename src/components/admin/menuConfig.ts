import type { ComponentType } from "react";
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  MessageSquare,
  Calendar,
  Briefcase,
  Settings,
  Tags,
  Bell,
  CreditCard,
  ShieldCheck,
} from "lucide-react";
import AdminDashboard from "../../pages/admin/Dashboard";
import AdminProducts from "../../pages/admin/Products";
import AdminMessages from "../../pages/admin/Messages";
import AdminReservations from "../../pages/admin/Reservations";
import AdminTeam from "../../pages/admin/Team";
import AdminPortfolio from "../../pages/admin/Portfolio";
import AdminCategories from "../../pages/admin/Categories";
import AdminSettings from "../../pages/admin/Settings";
import AdminServices from "../../pages/admin/Services";
import AdminOrders from "../../pages/admin/Orders";
import AdminServiceRequests from "../../pages/admin/ServiceRequests";

export type AdminMenuStatKey = "produtos" | "reservas" | "mensagens" | "solicitacoes" | "pedidos" | "equipa" | "portfolio";

export type AdminMenuItem = {
  title: string;
  path?: string;
  icon?: ComponentType<{ size?: number }>;
  component?: ComponentType<any>;
  badge?: number;
  badgeKey?: AdminMenuStatKey;
  children?: AdminMenuItem[];
  roles?: string[];
};

export type AdminMenuSection = {
  title: string;
  items: AdminMenuItem[];
};

export type AdminRouteItem = {
  title: string;
  path: string;
  component: ComponentType;
  roles?: string[];
};

export const adminMenu: AdminMenuSection[] = [
  {
    title: "Principal",
    items: [
      {
        title: "Dashboard",
        path: "/admin/dashboard",
        icon: LayoutDashboard,
        component: AdminDashboard,
      },
      {
        title: "Notificações",
        path: "/admin/mensagens",
        icon: Bell,
        badgeKey: "mensagens",
        component: AdminMessages,
      },
    ],
  },
  {
    title: "Gestão",
    items: [
      {
        title: "Produtos",
        path: "/admin/produtos",
        icon: ShoppingBag,
        component: AdminProducts,
      },
      {
        title: "Pedidos Loja",
        path: "/admin/pedidos",
        icon: CreditCard,
        badgeKey: "pedidos",
        component: AdminOrders,
      },
      {
        title: "Reservas",
        path: "/admin/reservas",
        icon: Calendar,
        badgeKey: "reservas",
        component: AdminReservations,
      },
      {
        title: "Solicitações",
        path: "/admin/solicitacoes",
        icon: MessageSquare,
        badgeKey: "solicitacoes",
        component: AdminServiceRequests,
      },
      {
        title: "Serviços",
        path: "/admin/servicos",
        icon: ShieldCheck,
        component: AdminServices,
      },
      {
        title: "Equipa",
        path: "/admin/equipa",
        icon: Users,
        component: AdminTeam,
      },
      {
        title: "Portfólio",
        path: "/admin/portfolio",
        icon: Briefcase,
        component: AdminPortfolio,
      },
      {
        title: "Categorias",
        path: "/admin/categorias",
        icon: Tags,
        component: AdminCategories,
      },
    ],
  },
  {
    title: "Configurações",
    items: [
      {
        title: "Site",
        path: "/admin/configuracoes",
        icon: Settings,
        component: AdminSettings,
      },
    ],
  },
];

export const adminRoutes: AdminRouteItem[] = adminMenu.flatMap((section) =>
  section.items.flatMap((item) =>
    item.children
      ? item.children
          .filter((child): child is AdminMenuItem & { component: ComponentType<any> } => Boolean(child.path && child.component))
          .map((child) => ({ title: child.title, path: child.path!, component: child.component! }))
      : item.path && item.component
      ? [{ title: item.title, path: item.path, component: item.component }]
      : []
  )
);

export type AdminBreadcrumb = {
  title: string;
  path?: string;
};

export function getBreadcrumbTrail(pathname: string): AdminBreadcrumb[] {
  const normalized = pathname.replace(/\/+$/, "");

  for (const section of adminMenu) {
    for (const item of section.items) {
      if (item.path === normalized) {
        return [{ title: item.title, path: item.path }];
      }

      if (item.children) {
        for (const child of item.children) {
          if (child.path === normalized) {
            return [
              { title: item.title, path: item.path },
              { title: child.title, path: child.path },
            ];
          }
        }
      }
    }
  }

  return [{ title: "Dashboard", path: "/admin/dashboard" }];
}
