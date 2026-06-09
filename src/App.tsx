import { ReactNode } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

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

// Admin Pages
import AdminLogin from "./pages/admin/Login";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminProducts from "./pages/admin/Products";
import AdminMessages from "./pages/admin/Messages";
import AdminReservations from "./pages/admin/Reservations";
import AdminTeam from "./pages/admin/Team";
import AdminPortfolio from "./pages/admin/Portfolio";
import AdminCategories from "./pages/admin/Categories";
import AdminSettings from "./pages/admin/Settings";
import SeoHead from "./components/SeoHead";

// Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AdminSidebar from "./components/admin/Sidebar";
import AdminServices from "./pages/admin/Services";

// Context
import { SettingsProvider } from "./contexts/SettingsContext";
import { CartProvider } from "./contexts/CartContext";
import Cart from "./pages/Cart";
import AdminOrders from "./pages/admin/Orders";
import AdminServiceRequests from "./pages/admin/ServiceRequests";

const PublicLayout = ({ children }: { children: ReactNode }) => (
  <div className="min-h-screen flex flex-col bg-stone-50">
    <SeoHead />
    <Navbar />
    <main className="flex-grow">{children}</main>
    <Footer />
  </div>
);

const AdminLayout = ({ children }: { children: ReactNode }) => {
  const token = localStorage.getItem("adminToken");
  if (!token) return <Navigate to="/admin/login" />;

  return (
    <div className="flex min-h-screen bg-zinc-100">
      <AdminSidebar />
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
};

// Wrapper components for generic pages
const AbooutPage = () => <GenericServicePage serviceId="sobre" />;

export default function App() {
  return (
    <SettingsProvider>
      <CartProvider>
      <Router>
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

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<Navigate to="/admin/dashboard" />} />
          <Route path="/admin/dashboard" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
          <Route path="/admin/produtos" element={<AdminLayout><AdminProducts /></AdminLayout>} />
          <Route path="/admin/servicos" element={<AdminLayout><AdminServices /></AdminLayout>} />
          <Route path="/admin/mensagens" element={<AdminLayout><AdminMessages /></AdminLayout>} />
          <Route path="/admin/reservas" element={<AdminLayout><AdminReservations /></AdminLayout>} />
          <Route path="/admin/equipa" element={<AdminLayout><AdminTeam /></AdminLayout>} />
          <Route path="/admin/portfolio" element={<AdminLayout><AdminPortfolio /></AdminLayout>} />
          <Route path="/admin/categorias" element={<AdminLayout><AdminCategories /></AdminLayout>} />
          <Route path="/admin/configuracoes" element={<AdminLayout><AdminSettings /></AdminLayout>} />
          <Route path="/admin/site" element={<Navigate to="/admin/configuracoes" replace />} />
          <Route path="/admin/equipamentos" element={<Navigate to="/admin/servicos" replace />} />
          <Route path="/admin/eventos" element={<Navigate to="/admin/servicos" replace />} />
          <Route path="/admin/pedidos" element={<AdminLayout><AdminOrders /></AdminLayout>} />
          <Route path="/admin/solicitacoes" element={<AdminLayout><AdminServiceRequests /></AdminLayout>} />
        </Routes>
      </Router>
      </CartProvider>
    </SettingsProvider>
  );
}
