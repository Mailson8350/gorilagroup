import { ReactNode, useLayoutEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";

// Public Pages
import Home from "./pages/Home";
import Store from "./pages/Store";
import ProductDetail from "./pages/ProductDetail";
import Services from "./pages/Services";
import Hostel from "./pages/Hostel";
import Contact from "./pages/Contact";
import GenericServicePage from "./pages/GenericServicePage";
import Portfolio from "./pages/Portfolio";
import Team from "./pages/Team";
import Privacy from "./pages/Privacy";
import DigitalCardPage from "./pages/DigitalCardPage";

// Admin Pages
import AdminLogin from "./pages/admin/Login";
import { adminRoutes } from "./components/admin/menuConfig";

// Components
import PublicLayout from "./components/PublicLayout";
import AdminShell from "./components/admin/AdminShell";

// Context
import { SettingsProvider } from "./contexts/SettingsContext";
import { CartProvider } from "./contexts/CartContext";
import Cart from "./pages/Cart";

function ScrollRestorationHandler() {
  const location = useLocation();

  useLayoutEffect(() => {
    if (location.hash) {
      const id = location.hash.substring(1);
      const element = document.getElementById(id);

      if (element) {
        element.scrollIntoView({ behavior: "auto" });
      }

      return;
    }

    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location.pathname, location.hash]);

  return null;
}

// Wrapper components for generic pages
const AbooutPage = () => <GenericServicePage serviceId="sobre" />;

export default function App() {
  return (
    <SettingsProvider>
      <CartProvider>
      <Router>
        <ScrollRestorationHandler />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
          <Route path="/loja" element={<PublicLayout><Store /></PublicLayout>} />
          <Route path="/loja/produto/:id" element={<PublicLayout><ProductDetail /></PublicLayout>} />
          <Route path="/loja/carrinho" element={<PublicLayout><Cart /></PublicLayout>} />
          <Route path="/servicos" element={<PublicLayout><Services /></PublicLayout>} />
          <Route path="/servicos/hostel" element={<PublicLayout><Hostel /></PublicLayout>} />
          <Route path="/servicos/:serviceId" element={<PublicLayout><GenericServicePage /></PublicLayout>} />
          <Route path="/portfolio" element={<PublicLayout><Portfolio /></PublicLayout>} />
          <Route path="/portfólio" element={<Navigate to="/portfolio" replace />} />
          <Route path="/sobre-nós" element={<Navigate to="/sobre" replace />} />
          <Route path="/sobre-nos" element={<Navigate to="/sobre" replace />} />
          <Route path="/equipa" element={<PublicLayout><Team /></PublicLayout>} />
          <Route path="/sobre" element={<PublicLayout><AbooutPage /></PublicLayout>} />
          <Route path="/contacto" element={<PublicLayout><Contact /></PublicLayout>} />
          <Route path="/privacy" element={<PublicLayout><Privacy /></PublicLayout>} />
          <Route path="/:slug" element={<PublicLayout><DigitalCardPage /></PublicLayout>} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<Navigate to="/admin/dashboard" />} />
          {adminRoutes.map((item) => {
            const Page = item.component;
            return <Route key={item.path} path={item.path} element={<AdminShell><Page /></AdminShell>} />;
          })}
          <Route path="/admin/site" element={<Navigate to="/admin/configuracoes" replace />} />
          <Route path="/admin/equipamentos" element={<Navigate to="/admin/servicos" replace />} />
          <Route path="/admin/eventos" element={<Navigate to="/admin/servicos" replace />} />
        </Routes>
      </Router>
      </CartProvider>
    </SettingsProvider>
  );
}
