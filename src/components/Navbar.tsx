import { Link } from "react-router-dom";
import { Menu, X, ShoppingBag, Globe, Coins } from "lucide-react";
import { useState } from "react";
import { useSettings } from "../contexts/SettingsContext";
import { useCart } from "../contexts/CartContext";
import MediaImage from "./MediaImage";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { language, setLanguage, currency, setCurrency, t, siteConfig } = useSettings();
  const { totalItems } = useCart();

  const navLinks = [
    { name: t("home"), path: "/" },
    { name: t("about"), path: "/sobre" },
    { name: t("store"), path: "/loja" },
    { name: t("services"), path: "/servicos" },
    { name: t("portfolio"), path: "/portfolio" },
    { name: t("team"), path: "/equipa" },
    { name: t("contact"), path: "/contacto" },
  ];

  return (
    <nav className="bg-secondary text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center overflow-hidden shadow-lg group-hover:scale-110 transition-transform">
                <MediaImage
                  src={siteConfig.logo_url}
                  alt="Gorila Logo"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="text-2xl font-display font-bold tracking-tighter uppercase text-white group-hover:text-primary transition-colors">Gorila</span>
            </Link>
          </div>
          
          <div className="hidden lg:block">
            <div className="ml-10 flex items-baseline space-x-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className="hover:text-primary px-3 py-2 rounded-md text-sm font-semibold transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            {/* Language Switcher */}
            <div className="flex items-center space-x-2 text-xs font-bold border-x border-white/10 px-4">
              <Globe size={14} className="text-primary" />
              <select 
                value={language} 
                onChange={(e) => setLanguage(e.target.value as any)}
                className="bg-transparent outline-none cursor-pointer hover:text-primary uppercase"
              >
                <option value="pt" className="bg-secondary">PT</option>
                <option value="en" className="bg-secondary">EN</option>
                <option value="fr" className="bg-secondary">FR</option>
                <option value="es" className="bg-secondary">ES</option>
              </select>
            </div>

            {/* Currency Switcher */}
            <div className="flex items-center space-x-2 text-xs font-bold border-r border-white/10 pr-4">
              <Coins size={14} className="text-primary" />
              <select 
                value={currency} 
                onChange={(e) => setCurrency(e.target.value as any)}
                className="bg-transparent outline-none cursor-pointer hover:text-primary uppercase"
              >
                <option value="XOF" className="bg-secondary">XOF</option>
                <option value="EUR" className="bg-secondary">EUR</option>
                <option value="USD" className="bg-secondary">USD</option>
              </select>
            </div>

            <Link to="/loja/carrinho" className="relative p-2 hover:text-primary transition-colors" title="Carrinho">
              <ShoppingBag size={20} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-secondary text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
                  {totalItems > 9 ? "9+" : totalItems}
                </span>
              )}
            </Link>
            <Link to="/servicos/hostel" className="bg-primary hover:bg-yellow-500 text-secondary px-6 py-2.5 rounded-lg text-sm font-bold transition-all hover:scale-105">
              {t("reserve_now")}
            </Link>
          </div>

          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-support focus:outline-none"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="lg:hidden bg-support border-t border-white/10">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="text-gray-300 hover:text-primary block px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <Link 
              to="/servicos/hostel" 
              className="block w-full text-center bg-primary text-secondary px-3 py-3 rounded-md text-base font-bold mt-4"
              onClick={() => setIsOpen(false)}
            >
              {t("reserve_now")}
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
