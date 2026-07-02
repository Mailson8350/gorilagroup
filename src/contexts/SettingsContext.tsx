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

type TranslationParams = Record<string, string | number>;

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
  t: (key: string, params?: TranslationParams) => string;
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
    home_hero_desc: "Equipamentos de alta performance para o seu som.",
    home_view_store: "Ver Loja",
    home_cta_title: "PRONTO PARA RESERVAR?",
    home_cta_desc: "Garanta o seu lugar no nosso hostel ou reserve os melhores equipamentos para o seu evento hoje mesmo.",
    home_cta_button: "Falar Connosco",
    services_visit_store: "Visitar loja",
    portfolio_all: "Todos",
    portfolio_want_event: "Deseja um evento inesquecível?",
    portfolio_event_cta: "Solicitar Orçamento",
    product_view: "Ver produto",
    store_desc: "Equipamentos profissionais, eletrónica de ponta e acessórios exclusivos.",
    store_categories: "Categorias",
    store_all_products: "Todos os Produtos",
    store_products_found: "{{count}} Produtos encontrados",
    store_search_placeholder: "Pesquisar produtos...",
    store_no_products: "Nenhum produto encontrado nesta categoria.",
    cart_empty_title: "Carrinho vazio",
    cart_empty_desc: "Adicione produtos da loja para continuar.",
    cart_continue_shopping: "Ir à Loja",
    cart_checkout_title: "Finalizar pedido",
    cart_total_label: "Total",
    cart_confirm_order: "Confirmar pedido",
    cart_order_success: "Pedido enviado com sucesso!",
    cart_order_contacting: "Entraremos em contacto em breve.",
    cart_title: "Carrinho",
    cart_order_note: "A equipa Gorila entrará em contacto para confirmar disponibilidade e pagamento.",
    product_not_found: "Produto não encontrado",
    product_back_to_store: "Voltar à Loja",
    product_added: "Adicionado!",
    product_add_to_cart: "Adicionar ao Carrinho",
    product_buy_now: "Comprar Agora",
    product_feature_fast_delivery: "Entrega Rápida",
    product_feature_warranty: "Garantia 2 Anos",
    product_feature_free_return: "Devolução Grátis",
    product_description_fallback: "Equipamento profissional da Gorila com performance e durabilidade garantidas.",
    team_no_members: "A equipa será publicada em breve.",
    contact_title: "VAMOS CONVERSAR.",
    contact_subtitle: "Estamos aqui para ajudar. Entre em contacto connosco para orçamentos, reservas ou qualquer dúvida.",
    contact_info: "Informações",
    contact_location: "Localização",
    contact_phone_label: "Telefone",
    contact_email_label: "E-mail",
    contact_hours_label: "Horário",
    contact_whatsapp_direct: "WhatsApp Direto",
    contact_form_title: "Envie uma Mensagem",
    contact_form_name: "Nome Completo",
    contact_form_email: "E-mail",
    contact_form_subject: "Assunto",
    contact_form_message: "Mensagem",
    contact_form_submit: "Enviar Mensagem",
    contact_status_success: "Mensagem Enviada!",
    contact_status_success_desc: "Obrigado pelo contacto. A nossa equipa responderá o mais breve possível.",
    contact_status_error: "Ocorreu um erro ao enviar. Tente novamente.",
    contact_status_loading: "A enviar...",
    contact_map_title: "Mapa",
    hostel_back_to_services: "Voltar aos Serviços",
    hostel_title: "GORILA HOSTEL.",
    hostel_concept_title: "O Conceito",
    hostel_concept_desc: "O Gorila Hostel não é apenas um lugar para dormir. É um hub criativo em Bissau, desenhado para nómadas digitais, artistas e viajantes que procuram uma experiência autêntica e produtiva.",
    hostel_feature_fiber: "Fibra Ótica",
    hostel_feature_coworking: "Coworking",
    hostel_feature_central: "Centro",
    hostel_feature_events: "Eventos",
    hostel_availability_title: "Disponibilidade",
    hostel_availability_updated: "Atualizado para as datas do formulário",
    hostel_availability_choose_dates: "Indicador geral; escolha datas para verificar o calendário",
    hostel_available: "Disponível",
    hostel_occupied: "Ocupado",
    hostel_per_night: "Por noite",
    hostel_book_now: "Reservar",
    hostel_form_name: "Nome",
    hostel_form_email: "E-mail",
    hostel_form_people: "Pessoas",
    hostel_form_start_date: "Data de entrada",
    hostel_form_end_date: "Data de saída",
    hostel_form_room: "Quarto",
    hostel_no_rooms: "Sem quartos disponíveis",
    hostel_confirm_booking: "Confirmar Reserva",
    hostel_error_reserve: "Erro ao registar reserva.",
    hostel_error_network: "Falha de rede. Tente novamente.",
    portfolio_no_projects: "Nenhum projeto publicado ainda.",
    portfolio_request_quote: "Solicitar Orçamento",
    generic_loading_service: "A carregar serviço...",
    generic_request_title: "Solicitar orçamento",
    generic_request_button: "Solicitar",
    generic_request_visit_store: "Visitar loja",
    generic_request_other_contacts: "Outros contactos",
    generic_request_modal_title: "Solicitar",
    generic_request_option_prefix: "Opção:",
    generic_request_general_prefix: "Pedido geral —",
    generic_request_success: "Enviado com sucesso!",
    generic_request_placeholder_name: "Nome",
    generic_request_placeholder_email: "E-mail",
    generic_request_placeholder_phone: "Telefone",
    generic_request_placeholder_message: "Mensagem",
    generic_request_submit: "Enviar",
    generic_request_error: "Erro ao enviar solicitação.",
    about_institutional: "Institucional",
    about_institutional_hint: "Um olhar sobre o nosso espaço e equipa — a história e os pormenores seguem abaixo.",
    store_title: "Loja",
    hostel_rate_total: "Total",
    footer_company: "Empresa",
    footer_services: "Serviços",
    footer_contact: "Contacto",
    footer_about: "Sobre Nós",
    footer_portfolio: "Portfólio",
    footer_team: "Equipa",
    footer_contact_link: "Contacto",
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
    home_hero_desc: "High-performance gear for your sound.",
    home_view_store: "View Store",
    home_cta_title: "READY TO BOOK?",
    home_cta_desc: "Secure your spot at our hostel or book the best equipment for your event today.",
    home_cta_button: "Talk to Us",
    services_visit_store: "Visit store",
    portfolio_all: "All",
    portfolio_want_event: "Want an unforgettable event?",
    portfolio_event_cta: "Request Quote",
    product_view: "View product",
    store_desc: "Professional equipment, cutting-edge electronics and exclusive accessories.",
    store_categories: "Categories",
    store_all_products: "All Products",
    store_products_found: "{{count}} Products found",
    store_search_placeholder: "Search products...",
    store_no_products: "No products found in this category.",
    cart_empty_title: "Empty cart",
    cart_empty_desc: "Add store products to continue.",
    cart_continue_shopping: "Go to Store",
    cart_checkout_title: "Checkout",
    cart_total_label: "Total",
    cart_confirm_order: "Confirm Order",
    cart_order_success: "Order successfully submitted!",
    cart_order_contacting: "We will contact you shortly.",
    cart_title: "Cart",
    cart_order_note: "Our team will reach out to confirm availability and payment.",
    product_not_found: "Product not found",
    product_back_to_store: "Back to Store",
    product_added: "Added!",
    product_add_to_cart: "Add to Cart",
    product_buy_now: "Buy Now",
    product_feature_fast_delivery: "Fast Delivery",
    product_feature_warranty: "2-Year Warranty",
    product_feature_free_return: "Free Returns",
    product_description_fallback: "Gorila professional equipment engineered for performance and durability.",
    team_no_members: "The team will be published soon.",
    contact_title: "LET'S TALK.",
    contact_subtitle: "We are here to help. Contact us for quotes, bookings, or any questions.",
    contact_info: "Information",
    contact_location: "Location",
    contact_phone_label: "Phone",
    contact_email_label: "Email",
    contact_hours_label: "Hours",
    contact_whatsapp_direct: "Direct WhatsApp",
    contact_form_title: "Send a Message",
    contact_form_name: "Full Name",
    contact_form_email: "Email",
    contact_form_subject: "Subject",
    contact_form_message: "Message",
    contact_form_submit: "Send Message",
    contact_status_success: "Message Sent!",
    contact_status_success_desc: "Thanks for reaching out. Our team will respond as soon as possible.",
    contact_status_error: "An error occurred while sending. Please try again.",
    contact_status_loading: "Sending...",
    contact_map_title: "Map",
    hostel_back_to_services: "Back to Services",
    hostel_title: "GORILA HOSTEL.",
    hostel_concept_title: "The Concept",
    hostel_concept_desc: "Gorila Hostel is more than a place to sleep. It's a creative hub in Bissau designed for digital nomads, artists and travelers seeking an authentic and productive experience.",
    hostel_feature_fiber: "Optical Fiber",
    hostel_feature_coworking: "Coworking",
    hostel_feature_central: "Downtown",
    hostel_feature_events: "Events",
    hostel_availability_title: "Availability",
    hostel_availability_updated: "Updated for the form dates",
    hostel_availability_choose_dates: "General indicator; choose dates to verify the calendar",
    hostel_available: "Available",
    hostel_occupied: "Occupied",
    hostel_per_night: "Per night",
    hostel_book_now: "Book Now",
    hostel_form_name: "Name",
    hostel_form_email: "Email",
    hostel_form_people: "People",
    hostel_form_start_date: "Start date",
    hostel_form_end_date: "End date",
    hostel_form_room: "Room",
    hostel_no_rooms: "No rooms available",
    hostel_confirm_booking: "Confirm Booking",
    hostel_error_reserve: "Error registering booking.",
    hostel_error_network: "Network failure. Please try again.",
    portfolio_no_projects: "No projects published yet.",
    portfolio_request_quote: "Request Quote",
    generic_loading_service: "Loading service...",
    generic_request_title: "Request Quote",
    generic_request_button: "Request",
    generic_request_visit_store: "Visit store",
    generic_request_other_contacts: "Other contacts",
    generic_request_modal_title: "Request",
    generic_request_option_prefix: "Option:",
    generic_request_general_prefix: "General request —",
    generic_request_success: "Sent successfully!",
    generic_request_placeholder_name: "Name",
    generic_request_placeholder_email: "Email",
    generic_request_placeholder_phone: "Phone",
    generic_request_placeholder_message: "Message",
    generic_request_submit: "Send",
    generic_request_error: "Error sending request.",
    about_institutional: "Institutional",
    about_institutional_hint: "A visual snapshot of our space and team — details and story continue below.",
    store_title: "Store",
    hostel_rate_total: "Total",
    footer_company: "Company",
    footer_services: "Services",
    footer_contact: "Contact",
    footer_about: "About Us",
    footer_portfolio: "Portfolio",
    footer_team: "Team",
    footer_contact_link: "Contact",
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
    home_hero_desc: "Équipement haute performance pour votre son.",
    home_view_store: "Voir la boutique",
    home_cta_title: "PRÊT À RÉSERVER?",
    home_cta_desc: "Assurez votre place dans notre hostel ou réservez le meilleur équipement pour votre événement aujourd'hui.",
    home_cta_button: "Parlez-nous",
    services_visit_store: "Visiter la boutique",
    portfolio_all: "Tous",
    portfolio_want_event: "Vous voulez un événement inoubliable?",
    portfolio_event_cta: "Demander un devis",
    product_view: "Voir le produit",
    store_desc: "Équipements professionnels, électronique de pointe et accessoires exclusifs.",
    store_categories: "Catégories",
    store_all_products: "Tous les produits",
    store_products_found: "{{count}} produits trouvés",
    store_search_placeholder: "Rechercher des produits...",
    store_no_products: "Aucun produit trouvé dans cette catégorie.",
    cart_empty_title: "Panier vide",
    cart_empty_desc: "Ajoutez des produits de la boutique pour continuer.",
    cart_continue_shopping: "Aller à la boutique",
    cart_checkout_title: "Passer à la caisse",
    cart_total_label: "Total",
    cart_confirm_order: "Confirmer la commande",
    cart_order_success: "Commande envoyée avec succès!",
    cart_order_contacting: "Nous vous contacterons bientôt.",
    cart_title: "Panier",
    cart_order_note: "Notre équipe vous contactera pour confirmer la disponibilité et le paiement.",
    product_not_found: "Produit non trouvé",
    product_back_to_store: "Retour à la boutique",
    product_added: "Ajouté!",
    product_add_to_cart: "Ajouter au panier",
    product_buy_now: "Acheter maintenant",
    product_feature_fast_delivery: "Livraison rapide",
    product_feature_warranty: "Garantie 2 ans",
    product_feature_free_return: "Retour gratuit",
    product_description_fallback: "Équipement professionnel Gorila conçu pour la performance et la durabilité.",
    team_no_members: "L'équipe sera publiée bientôt.",
    contact_title: "PARLONS.",
    contact_subtitle: "Nous sommes là pour vous aider. Contactez-nous pour des devis, des réservations ou des questions.",
    contact_info: "Informations",
    contact_location: "Emplacement",
    contact_phone_label: "Téléphone",
    contact_email_label: "Email",
    contact_hours_label: "Horaires",
    contact_whatsapp_direct: "WhatsApp direct",
    contact_form_title: "Envoyer un message",
    contact_form_name: "Nom complet",
    contact_form_email: "Email",
    contact_form_subject: "Sujet",
    contact_form_message: "Message",
    contact_form_submit: "Envoyer le message",
    contact_status_success: "Message envoyé!",
    contact_status_success_desc: "Merci de nous avoir contactés. Notre équipe répondra dès que possible.",
    contact_status_error: "Une erreur est survenue lors de l'envoi. Veuillez réessayer.",
    contact_status_loading: "Envoi...",
    contact_map_title: "Carte",
    hostel_back_to_services: "Retour aux services",
    hostel_title: "GORILA HOSTEL.",
    hostel_concept_title: "Le concept",
    hostel_concept_desc: "Gorila Hostel est plus qu'un lieu pour dormir. C'est un hub créatif à Bissau conçu pour les nomades numériques, artistes et voyageurs en quête d'une expérience authentique et productive.",
    hostel_feature_fiber: "Fibre optique",
    hostel_feature_coworking: "Coworking",
    hostel_feature_central: "Centre-ville",
    hostel_feature_events: "Événements",
    hostel_availability_title: "Disponibilité",
    hostel_availability_updated: "Mis à jour pour les dates du formulaire",
    hostel_availability_choose_dates: "Indicateur général ; choisissez des dates pour vérifier le calendrier",
    hostel_available: "Disponible",
    hostel_occupied: "Occupé",
    hostel_per_night: "Par nuit",
    hostel_book_now: "Réserver",
    hostel_form_name: "Nom",
    hostel_form_email: "Email",
    hostel_form_people: "Personnes",
    hostel_form_start_date: "Date d'arrivée",
    hostel_form_end_date: "Date de départ",
    hostel_form_room: "Chambre",
    hostel_no_rooms: "Pas de chambres disponibles",
    hostel_confirm_booking: "Confirmer la réservation",
    hostel_error_reserve: "Erreur lors de l'enregistrement de la réservation.",
    hostel_error_network: "Échec du réseau. Veuillez réessayer.",
    portfolio_no_projects: "Aucun projet publié pour le moment.",
    portfolio_request_quote: "Demander un devis",
    generic_loading_service: "Chargement du service...",
    generic_request_title: "Demander un devis",
    generic_request_button: "Demander",
    generic_request_visit_store: "Visiter la boutique",
    generic_request_other_contacts: "Autres contacts",
    generic_request_modal_title: "Demander",
    generic_request_option_prefix: "Option :",
    generic_request_general_prefix: "Demande générale —",
    generic_request_success: "Envoyé avec succès!",
    generic_request_placeholder_name: "Nom",
    generic_request_placeholder_email: "Email",
    generic_request_placeholder_phone: "Téléphone",
    generic_request_placeholder_message: "Message",
    generic_request_submit: "Envoyer",
    generic_request_error: "Erreur lors de l'envoi de la demande.",
    about_institutional: "Institutionnel",
    about_institutional_hint: "Un instantané visuel de notre espace et de notre équipe — les détails et l'histoire suivent ci-dessous.",
    store_title: "Boutique",
    hostel_rate_total: "Total",
    footer_company: "Entreprise",
    footer_services: "Services",
    footer_contact: "Contact",
    footer_about: "À propos",
    footer_portfolio: "Portfolio",
    footer_team: "Équipe",
    footer_contact_link: "Contact",
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
    home_hero_desc: "Equipos de alto rendimiento para tu sonido.",
    home_view_store: "Ver tienda",
    home_cta_title: "¿LISTO PARA RESERVAR?",
    home_cta_desc: "Asegura tu lugar en nuestro hostel o reserva el mejor equipo para tu evento hoy mismo.",
    home_cta_button: "Háblanos",
    services_visit_store: "Visitar tienda",
    portfolio_all: "Todos",
    portfolio_want_event: "¿Quieres un evento inolvidable?",
    portfolio_event_cta: "Solicitar presupuesto",
    product_view: "Ver producto",
    store_desc: "Equipos profesionales, electrónica de vanguardia y accesorios exclusivos.",
    store_categories: "Categorías",
    store_all_products: "Todos los productos",
    store_products_found: "{{count}} productos encontrados",
    store_search_placeholder: "Buscar productos...",
    store_no_products: "No se encontraron productos en esta categoría.",
    cart_empty_title: "Carrito vacío",
    cart_empty_desc: "Agrega productos de la tienda para continuar.",
    cart_continue_shopping: "Ir a la tienda",
    cart_checkout_title: "Finalizar pedido",
    cart_total_label: "Total",
    cart_confirm_order: "Confirmar pedido",
    cart_order_success: "¡Pedido enviado con éxito!",
    cart_order_contacting: "Te contactaremos pronto.",
    cart_title: "Carrito",
    cart_order_note: "Nuestro equipo se pondrá en contacto para confirmar disponibilidad y pago.",
    product_not_found: "Producto no encontrado",
    product_back_to_store: "Volver a la tienda",
    product_added: "¡Agregado!",
    product_add_to_cart: "Agregar al carrito",
    product_buy_now: "Comprar ahora",
    product_feature_fast_delivery: "Entrega rápida",
    product_feature_warranty: "Garantía de 2 años",
    product_feature_free_return: "Devolución gratis",
    product_description_fallback: "Equipo profesional Gorila diseñado para rendimiento y durabilidad.",
    team_no_members: "El equipo se publicará pronto.",
    contact_title: "HABLEMOS.",
    contact_subtitle: "Estamos aquí para ayudar. Contáctanos para cotizaciones, reservas o cualquier pregunta.",
    contact_info: "Información",
    contact_location: "Ubicación",
    contact_phone_label: "Teléfono",
    contact_email_label: "Correo",
    contact_hours_label: "Horario",
    contact_whatsapp_direct: "WhatsApp directo",
    contact_form_title: "Enviar un mensaje",
    contact_form_name: "Nombre completo",
    contact_form_email: "Correo",
    contact_form_subject: "Asunto",
    contact_form_message: "Mensaje",
    contact_form_submit: "Enviar mensaje",
    contact_status_success: "¡Mensaje enviado!",
    contact_status_success_desc: "Gracias por contactarnos. Nuestro equipo responderá lo antes posible.",
    contact_status_error: "Ocurrió un error al enviar. Intenta de nuevo.",
    contact_status_loading: "Enviando...",
    contact_map_title: "Mapa",
    hostel_back_to_services: "Volver a los servicios",
    hostel_title: "GORILA HOSTEL.",
    hostel_concept_title: "El concepto",
    hostel_concept_desc: "Gorila Hostel es más que un lugar para dormir. Es un centro creativo en Bissau diseñado para nómadas digitales, artistas y viajeros que buscan una experiencia auténtica y productiva.",
    hostel_feature_fiber: "Fibra óptica",
    hostel_feature_coworking: "Coworking",
    hostel_feature_central: "Centro",
    hostel_feature_events: "Eventos",
    hostel_availability_title: "Disponibilidad",
    hostel_availability_updated: "Actualizado para las fechas del formulario",
    hostel_availability_choose_dates: "Indicador general; elige fechas para verificar el calendario",
    hostel_available: "Disponible",
    hostel_occupied: "Ocupado",
    hostel_per_night: "Por noche",
    hostel_book_now: "Reservar",
    hostel_form_name: "Nombre",
    hostel_form_email: "Correo",
    hostel_form_people: "Personas",
    hostel_form_start_date: "Fecha de entrada",
    hostel_form_end_date: "Fecha de salida",
    hostel_form_room: "Habitación",
    hostel_no_rooms: "No hay habitaciones disponibles",
    hostel_confirm_booking: "Confirmar Reserva",
    hostel_error_reserve: "Error al registrar la reserva.",
    hostel_error_network: "Fallo de red. Inténtalo de nuevo.",
    portfolio_no_projects: "Ningún proyecto publicado aún.",
    portfolio_request_quote: "Solicitar presupuesto",
    generic_loading_service: "Cargando servicio...",
    generic_request_title: "Solicitar presupuesto",
    generic_request_button: "Solicitar",
    generic_request_visit_store: "Visitar tienda",
    generic_request_other_contacts: "Otros contactos",
    generic_request_modal_title: "Solicitar",
    generic_request_option_prefix: "Opción:",
    generic_request_general_prefix: "Pedido general —",
    generic_request_success: "¡Enviado con éxito!",
    generic_request_placeholder_name: "Nombre",
    generic_request_placeholder_email: "Correo",
    generic_request_placeholder_phone: "Teléfono",
    generic_request_placeholder_message: "Mensaje",
    generic_request_submit: "Enviar",
    generic_request_error: "Error al enviar la solicitud.",
    about_institutional: "Institucional",
    about_institutional_hint: "Una instantánea visual de nuestro espacio y equipo: los detalles y la historia continúan a continuación.",
    store_title: "Tienda",
    hostel_rate_total: "Total",
    footer_company: "Empresa",
    footer_services: "Servicios",
    footer_contact: "Contacto",
    footer_about: "Sobre Nosotros",
    footer_portfolio: "Portafolio",
    footer_team: "Equipo",
    footer_contact_link: "Contacto",
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

  const t = (key: string, params: TranslationParams = {}) => {
    const value = translations[language][key] || key;
    return Object.keys(params).reduce((text, paramKey) => {
      return text.replace(new RegExp(`{{${paramKey}}}`, "g"), String(params[paramKey]));
    }, value);
  };

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
