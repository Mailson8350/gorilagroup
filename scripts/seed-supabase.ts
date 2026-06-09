/**
 * Seed inicial no Supabase (executar uma vez após criar o schema).
 * Uso: npx tsx scripts/seed-supabase.ts
 */
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { getSupabaseAdmin } from "../server/supabaseClient";
import { seedSiteConfigDefaults, ensurePageServicesAsync } from "../server/siteConfigSupabase";

dotenv.config();

const initialServices = [
  {
    id: "hostel",
    nome_pt: "Hostel",
    nome_en: "Hostel",
    nome_fr: "Auberge",
    nome_es: "Albergue",
    descricao_pt: "Alojamento moderno e espaços de coworking para nómadas digitais.",
    descricao_en: "Modern accommodation and coworking spaces for digital nomads.",
    descricao_fr: "Hébergement moderne et espaces de coworking pour nomades numériques.",
    descricao_es: "Alojamiento moderno y espacios de coworking para nómadas digitales.",
    cor_paleta: "#FFC107",
    cor_secundaria: "#000000",
    logo_url: "",
    banner_url: "",
    path: "/servicos/hostel",
  },
  {
    id: "gb-som",
    nome_pt: "GB Som",
    nome_en: "GB Sound",
    nome_fr: "GB Son",
    nome_es: "GB Sonido",
    descricao_pt: "Aluguer de equipamentos de som e luz profissionais.",
    descricao_en: "Professional sound and light equipment rental.",
    descricao_fr: "Location de matériel de sonorisation et d'éclairage professionnel.",
    descricao_es: "Alquiler de equipos de sonido e iluminación profesional.",
    cor_paleta: "#3B82F6",
    cor_secundaria: "#000000",
    logo_url: "",
    banner_url: "",
    path: "/servicos/gb-som",
  },
  {
    id: "gorila-eletronica",
    nome_pt: "Gorila Eletrónica",
    nome_en: "Gorila Tech",
    nome_fr: "Gorila Tech",
    nome_es: "Gorila Electrónica",
    descricao_pt: "Venda e assistência técnica de equipamentos musicais.",
    descricao_en: "Sales and technical assistance for musical equipment.",
    descricao_fr: "Vente et assistance technique de matériel musical.",
    descricao_es: "Venta y asistencia técnica de equipos musicales.",
    cor_paleta: "#10B981",
    cor_secundaria: "#000000",
    logo_url: "",
    banner_url: "",
    path: "/servicos/gorila-eletronica",
  },
  {
    id: "gorila-mininus",
    nome_pt: "Gorila Mininus",
    nome_en: "Gorila Kids",
    nome_fr: "Gorila Enfants",
    nome_es: "Gorila Niños",
    descricao_pt: "Animação infantil e organização de festas.",
    descricao_en: "Children's animation and party organization.",
    descricao_fr: "Animation pour enfants et organisation de fêtes.",
    descricao_es: "Animación infantil y organización de fiestas.",
    cor_paleta: "#F59E0B",
    cor_secundaria: "#000000",
    logo_url: "",
    banner_url: "",
    path: "/servicos/gorila-mininus",
  },
  {
    id: "sala-eventos",
    nome_pt: "Sala de Eventos",
    nome_en: "Event Hall",
    nome_fr: "Salle d'Événements",
    nome_es: "Sala de Eventos",
    descricao_pt: "Espaço versátil para conferências e celebrações.",
    descricao_en: "Versatile space for conferences and celebrations.",
    descricao_fr: "Espace polyvalent pour conférences et célébrations.",
    descricao_es: "Espacio versátil para conferencias y celebraciones.",
    cor_paleta: "#8B5CF6",
    cor_secundaria: "#000000",
    logo_url: "",
    banner_url: "",
    path: "/servicos/sala-eventos",
  },
  ...["portfolio", "equipa", "sobre"].map((id) => ({
    id,
    nome_pt: id === "portfolio" ? "Portfólio" : id === "equipa" ? "A Equipa" : "Sobre Nós",
    nome_en: id === "portfolio" ? "Portfolio" : id === "equipa" ? "The Team" : "About Us",
    nome_fr: id === "portfolio" ? "Portfolio" : id === "equipa" ? "L'Équipe" : "À Propos",
    nome_es: id === "portfolio" ? "Portafolio" : id === "equipa" ? "El Equipo" : "Sobre Nosotros",
    descricao_pt: "",
    descricao_en: "",
    descricao_fr: "",
    descricao_es: "",
    cor_paleta: "#6366F1",
    cor_secundaria: "#000000",
    logo_url: "",
    banner_url: "",
    path: `/${id === "sobre" ? "sobre" : id}`,
  })),
];

async function main() {
  const supabase = getSupabaseAdmin();

  const { data: existingAdmin } = await supabase.from("users").select("id").eq("username", "admin").maybeSingle();
  if (!existingAdmin) {
    const hash = bcrypt.hashSync(process.env.ADMIN_PASSWORD || "admin123", 10);
    const { error } = await supabase.from("users").insert({ username: "admin", password: hash, role: "admin" });
    if (error) throw error;
    console.log("Admin criado (admin / ver ADMIN_PASSWORD no .env)");
  }

  const { count: catCount } = await supabase.from("categorias").select("*", { count: "exact", head: true });
  if (!catCount) {
    await supabase.from("categorias").insert([
      { nome: "Equipamentos Musicais" },
      { nome: "Eletrônicos" },
      { nome: "Acessórios" },
      { nome: "Promoções" },
    ]);
    console.log("Categorias criadas.");
  }

  const { count: svcCount } = await supabase.from("servicos").select("*", { count: "exact", head: true });
  if (!svcCount) {
    await supabase.from("servicos").insert(initialServices);
    console.log("Serviços criados.");
  }

  await seedSiteConfigDefaults();
  await ensurePageServicesAsync();

  const { count: qCount } = await supabase.from("quartos").select("*", { count: "exact", head: true });
  if (!qCount) {
    await supabase.from("quartos").insert([
      { nome: "Quarto Privado", descricao: "Quarto duplo com casa de banho privativa.", preco_noite: 25000, imagem: "", disponivel: true },
      { nome: "Dormitório Misto", descricao: "8 camas, ideal para mochileiros.", preco_noite: 12000, imagem: "", disponivel: true },
    ]);
    console.log("Quartos criados.");
  }

  console.log("Seed concluído.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
