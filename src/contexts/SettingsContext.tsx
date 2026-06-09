import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { DEFAULT_SITE_SETTINGS, mergeSiteSettings, type SiteSettings } from "../lib/siteConfigDefaults";

type Language = "pt" | "en" | "fr" | "es";
type Currency = "XOF" | "EUR" | "USD";

interface ServiceDefinition {
  id: string;
  nome_pt: string;
  nome_en: string;
  nome_fr: string;
  nome_es: string;
  descricao_pt: string;
  descricao_en: string;
  descricao_fr: string;
  descricao_es: string;
  cor_paleta: string;
  logo_url: string;
  banner_url: string;
  path: string;
}

interface SettingsContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  currency: Currency;
  setCurrency: (cur: Currency) => void;
  rates: Record<Currency, number>;
  services: ServiceDefinition[];
  siteConfig: SiteSettings;
  refreshServices: () => void;
  refreshSiteConfig: () => Promise<void>;
  formatPrice: (priceXOF: number) => string;
  t: (key: string) => string;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const translations: Record<Language, Record<string, string>> = {
  pt: {
    home: "Home",
    explore: "Explorar Serviço",
    services: "Serviços",
    services_title: "Nossos Serviços",
    services_desc: "Soluções integradas de excelência para o seu negócio.",
    reservations: "Reservas",
    welcome: "Bem-vindo",
    store: "Loja",
    contact: "Contacto",
    about: "Sobre Nós",
    portfolio: "Portfólio",
    team: "Equipa",
    reserve_now: "Reservar Agora",
  },
  en: {
    home: "Home",
    explore: "Explore Service",
    services: "Services",
    services_title: "Our Services",
    services_desc: "Integrated solutions of excellence for your business.",
    reservations: "Reservations",
    welcome: "Welcome",
    store: "Store",
    contact: "Contact",
    about: "About Us",
    portfolio: "Portfolio",
    team: "Team",
    reserve_now: "Book Now",
  },
  fr: {
    home: "Accueil",
    explore: "Explorer le Service",
    services: "Services",
    services_title: "Nos Services",
    services_desc: "Solutions intégrées d'excellence pour votre entreprise.",
    reservations: "Réservations",
    welcome: "Bienvenue",
    store: "Boutique",
    contact: "Contact",
    about: "À Propos",
    portfolio: "Portfolio",
    team: "Équipe",
    reserve_now: "Réserver",
  },
  es: {
    home: "Inicio",
    explore: "Explorar Servicio",
    services: "Servicios",
    services_title: "Nuestros Servicios",
    services_desc: "Soluciones integradas de excelencia para su negocio.",
    reservations: "Reservas",
    welcome: "Bienvenido",
    store: "Tienda",
    contact: "Contacto",
    about: "Sobre Nosotros",
    portfolio: "Portafolio",
    team: "Equipo",
    reserve_now: "Reservar Ahora",
  },
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => (localStorage.getItem("lang") as Language) || "pt");
  const [currency, setCurrency] = useState<Currency>(() => (localStorage.getItem("cur") as Currency) || "XOF");
  const [services, setServices] = useState<ServiceDefinition[]>([]);
  const [siteConfig, setSiteConfig] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [rates, setRates] = useState<Record<Currency, number>>({ XOF: 1, EUR: 0.0015, USD: 0.0016 });

  const fetchServices = async () => {
    try {
      const res = await fetch("/api/servicos", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      setServices(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Error fetching services", e);
    }
  };

  const fetchSiteConfig = useCallback(async () => {
    try {
      const res = await fetch("/api/site-config", { cache: "no-store" });
      if (res.ok) {
        const raw = await res.json();
        setSiteConfig(mergeSiteSettings(raw));
      }
    } catch (e) {
      console.error("Error fetching site config", e);
    }
  }, []);

  const fetchRates = async () => {
    try {
      const res = await fetch("/api/rates");
      if (!res.ok) return;
      const data = await res.json();
      setRates(data.rates);
    } catch (e) {
      console.error("Error fetching rates", e);
    }
  };

  useEffect(() => {
    fetchServices();
    fetchRates();
    fetchSiteConfig();

    const refreshOnFocus = () => {
      fetchServices();
      fetchSiteConfig();
    };
    window.addEventListener("focus", refreshOnFocus);
    return () => window.removeEventListener("focus", refreshOnFocus);
  }, [fetchSiteConfig]);

  useEffect(() => {
    localStorage.setItem("lang", language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem("cur", currency);
  }, [currency]);

  const formatPrice = (priceXOF: number) => {
    const converted = priceXOF * rates[currency];
    return new Intl.NumberFormat(language === "pt" ? "pt-GW" : language, {
      style: "currency",
      currency: currency,
    }).format(converted);
  };

  const t = (key: string) => translations[language][key] || key;

  return (
    <SettingsContext.Provider
      value={{
        language,
        setLanguage,
        currency,
        setCurrency,
        rates,
        services,
        siteConfig,
        refreshServices: fetchServices,
        refreshSiteConfig: fetchSiteConfig,
        formatPrice,
        t,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) throw new Error("useSettings must be used within SettingsProvider");
  return context;
};
