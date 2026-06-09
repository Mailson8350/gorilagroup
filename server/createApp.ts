import express, { type Request, type Response, type NextFunction } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import multer from "multer";
import { getSupabaseAdmin, isSupabaseConfigured } from "./supabaseClient";
import { resolveImageInputAsync, uploadFileBuffer } from "./media";
import { readSiteConfigAsync, writeSiteConfigAsync } from "./siteConfigSupabase";
import {
  TURISMO_TAXA_POR_PESSOA,
  parseExistingId,
  countReservationNights,
  isRoomBookedForDates,
  tableCount,
  normDisponivel,
} from "./helpers";
import type { UploadFolder } from "./uploads";
import { UPLOAD_FOLDERS } from "./uploads";

const JWT_SECRET = process.env.JWT_SECRET || "gorila-secret-key-2024";
const memoryUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Apenas imagens são permitidas"));
  },
});

function authenticateAdmin(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Não autorizado" });
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { role?: string };
    if (decoded.role !== "admin") throw new Error();
    next();
  } catch {
    res.status(401).json({ error: "Token inválido" });
  }
}

function asyncHandler(fn: (req: Request, res: Response) => Promise<void>) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res).catch((e: Error) => {
      console.error(e);
      if (!res.headersSent) res.status(500).json({ error: e.message });
    });
  };
}

const img = (folder: UploadFolder, input: string | undefined | null, previous?: string | null) =>
  resolveImageInputAsync(input, folder, previous);

export function createApp(): express.Application {
  if (!isSupabaseConfigured()) {
    throw new Error("Configure SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no ambiente.");
  }

  const app = express();
  app.use(express.json({ limit: "10mb" }));

  app.use((req, _res, next) => {
    if (req.url.startsWith("/api")) console.log(`[API] ${req.method} ${req.url}`);
    next();
  });

  app.get(
    "/api/health",
    asyncHandler(async (_req, res) => {
      const counts = {
        users: await tableCount("users"),
        produtos: await tableCount("produtos"),
        categorias: await tableCount("categorias"),
        quartos: await tableCount("quartos"),
        reservas: await tableCount("reservas"),
        portfolio: await tableCount("portfolio"),
        equipa: await tableCount("equipa"),
        mensagens: await tableCount("mensagens"),
        servicos: await tableCount("servicos"),
      };
      res.json({
        status: "ok",
        database: "supabase",
        counts,
        timestamp: new Date().toISOString(),
      });
    })
  );

  app.get(
    "/api/site-config",
    asyncHandler(async (_req, res) => {
      res.setHeader("Cache-Control", "no-store");
      res.json(await readSiteConfigAsync());
    })
  );

  app.post(
    "/api/admin/upload/:folder",
    authenticateAdmin,
    memoryUpload.single("file"),
    asyncHandler(async (req, res) => {
      if (!req.file) {
        res.status(400).json({ error: "Ficheiro em falta" });
        return;
      }
      const folder = UPLOAD_FOLDERS.includes(req.params.folder as UploadFolder)
        ? (req.params.folder as UploadFolder)
        : "site";
      const url = await uploadFileBuffer(folder, req.file.buffer, req.file.mimetype, req.file.originalname);
      res.json({ url });
    })
  );

  app.post(
    "/api/admin/site-config",
    authenticateAdmin,
    asyncHandler(async (req, res) => {
      const updated = await writeSiteConfigAsync(req.body || {}, img);
      res.json(updated);
    })
  );

  app.post(
    "/api/auth/login",
    asyncHandler(async (req, res) => {
      const { username, password } = req.body;
      const supabase = getSupabaseAdmin();
      const { data: user, error } = await supabase.from("users").select("*").eq("username", username).maybeSingle();
      if (error) throw error;
      if (user && bcrypt.compareSync(password, user.password)) {
        const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, {
          expiresIn: "24h",
        });
        res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
      } else {
        res.status(401).json({ error: "Credenciais inválidas" });
      }
    })
  );

  app.get(
    "/api/produtos",
    asyncHandler(async (_req, res) => {
      const supabase = getSupabaseAdmin();
      const { data, error } = await supabase.from("produtos").select("*, categorias(nome)");
      if (error) throw error;
      res.json(
        (data || []).map((p: Record<string, unknown>) => ({
          ...p,
          categoria_nome: (p.categorias as { nome?: string } | null)?.nome ?? null,
          categorias: undefined,
        }))
      );
    })
  );

  app.get(
    "/api/produtos/:id",
    asyncHandler(async (req, res) => {
      const supabase = getSupabaseAdmin();
      const { data, error } = await supabase
        .from("produtos")
        .select("*, categorias(nome)")
        .eq("id", req.params.id)
        .maybeSingle();
      if (error) throw error;
      if (!data) {
        res.status(404).json({ error: "Produto não encontrado" });
        return;
      }
      res.json({
        ...data,
        categoria_nome: (data as { categorias?: { nome?: string } }).categorias?.nome ?? null,
        categorias: undefined,
      });
    })
  );

  app.post(
    "/api/admin/produtos",
    authenticateAdmin,
    asyncHandler(async (req, res) => {
      const { id, nome, descricao, preco, imagem, categoria_id } = req.body;
      const supabase = getSupabaseAdmin();
      const produtoId = parseExistingId(id);
      if (produtoId) {
        const { data: prev } = await supabase.from("produtos").select("imagem").eq("id", produtoId).maybeSingle();
        const imagemUrl = await img("produtos", imagem, prev?.imagem);
        const { error } = await supabase
          .from("produtos")
          .update({ nome, descricao, preco, imagem: imagemUrl, categoria_id })
          .eq("id", produtoId);
        if (error) throw error;
        res.json({ success: true, id: produtoId });
      } else {
        const imagemUrl = await img("produtos", imagem);
        const { data, error } = await supabase
          .from("produtos")
          .insert({ nome, descricao, preco, imagem: imagemUrl, categoria_id })
          .select("id")
          .single();
        if (error) throw error;
        res.json({ id: data.id });
      }
    })
  );

  app.delete(
    "/api/admin/produtos/:id",
    authenticateAdmin,
    asyncHandler(async (req, res) => {
      const supabase = getSupabaseAdmin();
      const { error } = await supabase.from("produtos").delete().eq("id", req.params.id);
      if (error) throw error;
      res.json({ success: true });
    })
  );

  app.get(
    "/api/categorias",
    asyncHandler(async (_req, res) => {
      const { data, error } = await getSupabaseAdmin().from("categorias").select("*");
      if (error) throw error;
      res.json(data);
    })
  );

  app.post(
    "/api/admin/categorias",
    authenticateAdmin,
    asyncHandler(async (req, res) => {
      const { id, nome } = req.body;
      const supabase = getSupabaseAdmin();
      const categoriaId = parseExistingId(id);
      if (categoriaId) {
        const { error } = await supabase.from("categorias").update({ nome }).eq("id", categoriaId);
        if (error) throw error;
        res.json({ success: true, id: categoriaId });
      } else {
        const { data, error } = await supabase.from("categorias").insert({ nome }).select("id").single();
        if (error) throw error;
        res.json({ id: data.id });
      }
    })
  );

  app.delete(
    "/api/admin/categorias/:id",
    authenticateAdmin,
    asyncHandler(async (req, res) => {
      const supabase = getSupabaseAdmin();
      const { count } = await supabase
        .from("produtos")
        .select("*", { count: "exact", head: true })
        .eq("categoria_id", req.params.id);
      if ((count ?? 0) > 0) {
        res.status(400).json({ error: "Categoria em uso por produtos" });
        return;
      }
      const { error } = await supabase.from("categorias").delete().eq("id", req.params.id);
      if (error) throw error;
      res.json({ success: true });
    })
  );

  app.get(
    "/api/servicos",
    asyncHandler(async (_req, res) => {
      const { data, error } = await getSupabaseAdmin().from("servicos").select("*");
      if (error) throw error;
      res.json(data);
    })
  );

  app.get(
    "/api/servicos/:servicoId/opcoes",
    asyncHandler(async (req, res) => {
      res.set("Cache-Control", "no-store");
      const { data, error } = await getSupabaseAdmin()
        .from("opcoes_servico")
        .select("*")
        .eq("servico_id", req.params.servicoId)
        .eq("disponivel", true)
        .order("ordem")
        .order("id");
      if (error) throw error;
      res.json((data || []).map((o) => ({ ...o, disponivel: normDisponivel(o.disponivel) })));
    })
  );

  app.get(
    "/api/servicos/:id",
    asyncHandler(async (req, res) => {
      const { data, error } = await getSupabaseAdmin().from("servicos").select("*").eq("id", req.params.id).maybeSingle();
      if (error) throw error;
      if (!data) {
        res.status(404).json({ error: "Serviço não encontrado" });
        return;
      }
      res.json(data);
    })
  );

  app.get(
    "/api/admin/servicos/:servicoId/opcoes",
    authenticateAdmin,
    asyncHandler(async (req, res) => {
      const { data, error } = await getSupabaseAdmin()
        .from("opcoes_servico")
        .select("*")
        .eq("servico_id", req.params.servicoId)
        .order("ordem")
        .order("id");
      if (error) throw error;
      res.json((data || []).map((o) => ({ ...o, disponivel: normDisponivel(o.disponivel) })));
    })
  );

  app.post(
    "/api/admin/opcoes-servico",
    authenticateAdmin,
    asyncHandler(async (req, res) => {
      const { id, servico_id, nome, descricao, preco, imagem, disponivel, ordem } = req.body;
      if (!servico_id || !nome?.trim()) {
        res.status(400).json({ error: "Serviço e nome são obrigatórios." });
        return;
      }
      const supabase = getSupabaseAdmin();
      const disp = disponivel === 0 || disponivel === false ? false : true;
      const opcaoId = parseExistingId(id);
      if (opcaoId) {
        const { data: prev } = await supabase.from("opcoes_servico").select("imagem").eq("id", opcaoId).maybeSingle();
        const imagemUrl = await img("opcoes", imagem, prev?.imagem);
        const { error } = await supabase
          .from("opcoes_servico")
          .update({
            servico_id,
            nome,
            descricao: descricao || "",
            preco: preco || 0,
            imagem: imagemUrl,
            disponivel: disp,
            ordem: ordem ?? 0,
          })
          .eq("id", opcaoId);
        if (error) throw error;
        res.json({ success: true, id: opcaoId });
      } else {
        const imagemUrl = await img("opcoes", imagem);
        const { data, error } = await supabase
          .from("opcoes_servico")
          .insert({
            servico_id,
            nome,
            descricao: descricao || "",
            preco: preco || 0,
            imagem: imagemUrl,
            disponivel: disp,
            ordem: ordem ?? 0,
          })
          .select("id")
          .single();
        if (error) throw error;
        res.json({ id: data.id });
      }
    })
  );

  app.delete(
    "/api/admin/opcoes-servico/:id",
    authenticateAdmin,
    asyncHandler(async (req, res) => {
      const supabase = getSupabaseAdmin();
      const { count } = await supabase
        .from("solicitacoes_servico")
        .select("*", { count: "exact", head: true })
        .eq("opcao_id", req.params.id);
      if ((count ?? 0) > 0) {
        res.status(400).json({ error: "Opção com solicitações associadas. Não pode ser eliminada." });
        return;
      }
      const { error } = await supabase.from("opcoes_servico").delete().eq("id", req.params.id);
      if (error) throw error;
      res.json({ success: true });
    })
  );

  app.post(
    "/api/solicitacoes-servico",
    asyncHandler(async (req, res) => {
      const { servico_id, opcao_id, nome_cliente, email_cliente, telefone, mensagem } = req.body;
      if (!servico_id || !nome_cliente?.trim()) {
        res.status(400).json({ error: "Nome e serviço são obrigatórios." });
        return;
      }
      const supabase = getSupabaseAdmin();
      const { data: servico } = await supabase.from("servicos").select("id").eq("id", servico_id).maybeSingle();
      if (!servico) {
        res.status(404).json({ error: "Serviço não encontrado." });
        return;
      }
      const { data, error } = await supabase
        .from("solicitacoes_servico")
        .insert({
          servico_id,
          opcao_id: opcao_id || null,
          nome_cliente: nome_cliente.trim(),
          email_cliente: email_cliente?.trim() || "",
          telefone: telefone?.trim() || "",
          mensagem: mensagem?.trim() || "",
        })
        .select("id")
        .single();
      if (error) throw error;
      res.json({ id: data.id, message: "Solicitação enviada com sucesso." });
    })
  );

  app.get(
    "/api/admin/solicitacoes-servico",
    authenticateAdmin,
    asyncHandler(async (_req, res) => {
      const { data, error } = await getSupabaseAdmin()
        .from("solicitacoes_servico")
        .select("*, servicos(nome_pt), opcoes_servico(nome)")
        .order("data", { ascending: false });
      if (error) throw error;
      res.json(
        (data || []).map((s: Record<string, unknown>) => ({
          ...s,
          servico_nome: (s.servicos as { nome_pt?: string } | null)?.nome_pt,
          opcao_nome: (s.opcoes_servico as { nome?: string } | null)?.nome,
          servicos: undefined,
          opcoes_servico: undefined,
        }))
      );
    })
  );

  app.patch(
    "/api/admin/solicitacoes-servico/:id/status",
    authenticateAdmin,
    asyncHandler(async (req, res) => {
      const { error } = await getSupabaseAdmin()
        .from("solicitacoes_servico")
        .update({ status: req.body.status })
        .eq("id", req.params.id);
      if (error) throw error;
      res.json({ success: true });
    })
  );

  app.delete(
    "/api/admin/solicitacoes-servico/:id",
    authenticateAdmin,
    asyncHandler(async (req, res) => {
      const { error } = await getSupabaseAdmin().from("solicitacoes_servico").delete().eq("id", req.params.id);
      if (error) throw error;
      res.json({ success: true });
    })
  );

  app.post(
    "/api/admin/servicos",
    authenticateAdmin,
    asyncHandler(async (req, res) => {
      const service = req.body;
      if (!service.id?.trim() || !service.path?.trim()) {
        res.status(400).json({ error: "ID e caminho são obrigatórios." });
        return;
      }
      const supabase = getSupabaseAdmin();
      const { data: prev } = await supabase
        .from("servicos")
        .select("logo_url, banner_url")
        .eq("id", service.id)
        .maybeSingle();
      const payload = {
        ...service,
        logo_url: await img("servicos", service.logo_url, prev?.logo_url),
        banner_url: await img("servicos", service.banner_url, prev?.banner_url),
      };
      if (prev) {
        const { error } = await supabase.from("servicos").update(payload).eq("id", service.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("servicos").insert(payload);
        if (error) throw error;
      }
      res.json({ success: true });
    })
  );

  app.delete(
    "/api/admin/servicos/:id",
    authenticateAdmin,
    asyncHandler(async (req, res) => {
      const supabase = getSupabaseAdmin();
      await supabase.from("opcoes_servico").delete().eq("servico_id", req.params.id);
      await supabase.from("solicitacoes_servico").delete().eq("servico_id", req.params.id);
      const { error } = await supabase.from("servicos").delete().eq("id", req.params.id);
      if (error) throw error;
      res.json({ success: true });
    })
  );

  // Equipamentos / pacotes (legacy admin APIs)
  app.post(
    "/api/admin/equipamentos",
    authenticateAdmin,
    asyncHandler(async (req, res) => {
      const { id, nome, descricao, preco_aluguer, imagem } = req.body;
      const supabase = getSupabaseAdmin();
      const equipamentoId = parseExistingId(id);
      if (equipamentoId) {
        const { data: prev } = await supabase.from("equipamentos").select("imagem").eq("id", equipamentoId).maybeSingle();
        const imagemUrl = await img("equipamentos", imagem, prev?.imagem);
        const { error } = await supabase
          .from("equipamentos")
          .update({ nome, descricao, preco_aluguer, imagem: imagemUrl })
          .eq("id", equipamentoId);
        if (error) throw error;
        res.json({ success: true, id: equipamentoId });
      } else {
        const imagemUrl = await img("equipamentos", imagem);
        const { data, error } = await supabase
          .from("equipamentos")
          .insert({ nome, descricao, preco_aluguer, imagem: imagemUrl })
          .select("id")
          .single();
        if (error) throw error;
        res.json({ success: true, id: data.id });
      }
    })
  );

  app.delete(
    "/api/admin/equipamentos/:id",
    authenticateAdmin,
    asyncHandler(async (req, res) => {
      const { error } = await getSupabaseAdmin().from("equipamentos").delete().eq("id", req.params.id);
      if (error) throw error;
      res.json({ success: true });
    })
  );

  app.post(
    "/api/admin/pacotes-eventos",
    authenticateAdmin,
    asyncHandler(async (req, res) => {
      const { id, nome, descricao, preco, imagem } = req.body;
      const supabase = getSupabaseAdmin();
      const pacoteId = parseExistingId(id);
      if (pacoteId) {
        const { data: prev } = await supabase.from("pacotes_eventos").select("imagem").eq("id", pacoteId).maybeSingle();
        const imagemUrl = await img("pacotes", imagem, prev?.imagem);
        const { error } = await supabase
          .from("pacotes_eventos")
          .update({ nome, descricao, preco, imagem: imagemUrl })
          .eq("id", pacoteId);
        if (error) throw error;
        res.json({ success: true, id: pacoteId });
      } else {
        const imagemUrl = await img("pacotes", imagem);
        const { data, error } = await supabase
          .from("pacotes_eventos")
          .insert({ nome, descricao, preco, imagem: imagemUrl })
          .select("id")
          .single();
        if (error) throw error;
        res.json({ success: true, id: data.id });
      }
    })
  );

  app.delete(
    "/api/admin/pacotes-eventos/:id",
    authenticateAdmin,
    asyncHandler(async (req, res) => {
      const { error } = await getSupabaseAdmin().from("pacotes_eventos").delete().eq("id", req.params.id);
      if (error) throw error;
      res.json({ success: true });
    })
  );

  registerHostelAndRest(app);

  app.use("/api", (req, res) => {
    res.status(404).json({ error: `Route ${req.method} ${req.originalUrl} not found` });
  });

  app.use("/api", (err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error("API Error:", err);
    res.status(500).json({ error: err.message || "Internal Server Error" });
  });

  return app;
}

function registerHostelAndRest(app: express.Application) {
  app.get(
    "/api/admin/reservas",
    authenticateAdmin,
    asyncHandler(async (_req, res) => {
      const { data, error } = await getSupabaseAdmin()
        .from("reservas")
        .select("*, quartos(nome)")
        .order("data_inicio", { ascending: false });
      if (error) throw error;
      res.json(
        (data || []).map((r: Record<string, unknown>) => ({
          ...r,
          quarto_nome: (r.quartos as { nome?: string } | null)?.nome,
          quartos: undefined,
        }))
      );
    })
  );

  app.patch(
    "/api/admin/reservas/:id/status",
    authenticateAdmin,
    asyncHandler(async (req, res) => {
      const { error } = await getSupabaseAdmin()
        .from("reservas")
        .update({ status: req.body.status })
        .eq("id", req.params.id);
      if (error) throw error;
      res.json({ success: true });
    })
  );

  app.delete(
    "/api/admin/reservas/:id",
    authenticateAdmin,
    asyncHandler(async (req, res) => {
      const { error } = await getSupabaseAdmin().from("reservas").delete().eq("id", req.params.id);
      if (error) throw error;
      res.json({ success: true });
    })
  );

  app.post(
    "/api/admin/quartos",
    authenticateAdmin,
    asyncHandler(async (req, res) => {
      const { id, nome, descricao, preco_noite, imagem, disponivel } = req.body;
      const supabase = getSupabaseAdmin();
      const disp = disponivel === 0 || disponivel === false ? false : true;
      const quartoId = parseExistingId(id);
      if (quartoId) {
        const { data: prev } = await supabase.from("quartos").select("imagem").eq("id", quartoId).maybeSingle();
        const imagemUrl = await img("quartos", imagem, prev?.imagem);
        const { error } = await supabase
          .from("quartos")
          .update({ nome, descricao, preco_noite, imagem: imagemUrl, disponivel: disp })
          .eq("id", quartoId);
        if (error) throw error;
        res.json({ success: true, id: quartoId });
      } else {
        const imagemUrl = await img("quartos", imagem);
        const { data, error } = await supabase
          .from("quartos")
          .insert({ nome, descricao, preco_noite, imagem: imagemUrl, disponivel: disp })
          .select("id")
          .single();
        if (error) throw error;
        res.json({ success: true, id: data.id });
      }
    })
  );

  app.delete(
    "/api/admin/quartos/:id",
    authenticateAdmin,
    asyncHandler(async (req, res) => {
      const supabase = getSupabaseAdmin();
      const { count } = await supabase
        .from("reservas")
        .select("*", { count: "exact", head: true })
        .eq("quarto_id", req.params.id);
      if ((count ?? 0) > 0) {
        res.status(400).json({ error: "Quarto com reservas associadas. Altere ou elimine as reservas primeiro." });
        return;
      }
      const { error } = await supabase.from("quartos").delete().eq("id", req.params.id);
      if (error) throw error;
      res.json({ success: true });
    })
  );

  app.get("/api/rates", (_req, res) => {
    res.json({ base: "XOF", rates: { XOF: 1, EUR: 0.0015, USD: 0.0016 } });
  });

  app.get(
    "/api/quartos",
    asyncHandler(async (req, res) => {
      const dataInicio = typeof req.query.data_inicio === "string" ? req.query.data_inicio : "";
      const dataFim = typeof req.query.data_fim === "string" ? req.query.data_fim : "";
      const checkDates = !!(dataInicio && dataFim && dataFim > dataInicio);
      const { data, error } = await getSupabaseAdmin().from("quartos").select("*").order("id");
      if (error) throw error;
      const enriched = await Promise.all(
        (data || []).map(async (q) => {
          let livre = normDisponivel(q.disponivel) === 1;
          if (checkDates && livre) {
            livre = !(await isRoomBookedForDates(q.id, dataInicio, dataFim));
          }
          return { ...q, disponivel: normDisponivel(q.disponivel), livre, ocupado: !livre };
        })
      );
      res.json(enriched);
    })
  );

  app.post(
    "/api/reservas",
    asyncHandler(async (req, res) => {
      const { quarto_id, nome_cliente, email_cliente, data_inicio, data_fim, num_pessoas } = req.body;
      if (!quarto_id || !nome_cliente?.trim() || !email_cliente?.trim() || !data_inicio || !data_fim) {
        res.status(400).json({ error: "Preencha todos os campos obrigatórios." });
        return;
      }
      if (data_fim <= data_inicio) {
        res.status(400).json({ error: "A data de saída deve ser posterior à data de entrada." });
        return;
      }
      const today = new Date().toISOString().slice(0, 10);
      if (data_inicio < today) {
        res.status(400).json({ error: "A data de entrada não pode ser no passado." });
        return;
      }
      const pessoas = Math.max(1, Math.min(20, parseInt(String(num_pessoas), 10) || 1));
      const noites = countReservationNights(data_inicio, data_fim);
      if (noites < 1) {
        res.status(400).json({ error: "Selecione um período de pelo menos uma noite." });
        return;
      }
      const supabase = getSupabaseAdmin();
      const { data: quarto, error: qErr } = await supabase.from("quartos").select("*").eq("id", quarto_id).maybeSingle();
      if (qErr) throw qErr;
      if (!quarto) {
        res.status(404).json({ error: "Quarto não encontrado." });
        return;
      }
      if (!quarto.disponivel) {
        res.status(400).json({ error: "Este quarto não está disponível." });
        return;
      }
      if (await isRoomBookedForDates(quarto_id, data_inicio, data_fim)) {
        res.status(409).json({ error: "Quarto indisponível nas datas selecionadas." });
        return;
      }
      const valor_alojamento = quarto.preco_noite * noites;
      const taxa_turismo = TURISMO_TAXA_POR_PESSOA * pessoas;
      const { data, error } = await supabase
        .from("reservas")
        .insert({
          quarto_id,
          nome_cliente: nome_cliente.trim(),
          email_cliente: email_cliente.trim(),
          data_inicio,
          data_fim,
          num_pessoas: pessoas,
          taxa_turismo,
          valor_alojamento,
        })
        .select("id")
        .single();
      if (error) throw error;
      res.json({
        id: data.id,
        message: "Reserva registada com sucesso.",
        num_pessoas: pessoas,
        noites,
        valor_alojamento,
        taxa_turismo,
        valor_total: valor_alojamento + taxa_turismo,
      });
    })
  );

  app.post(
    "/api/pedidos",
    asyncHandler(async (req, res) => {
      const { nome_cliente, email_cliente, telefone, itens, total } = req.body;
      if (!nome_cliente?.trim() || !Array.isArray(itens) || itens.length === 0) {
        res.status(400).json({ error: "Nome e itens do pedido são obrigatórios." });
        return;
      }
      const totalNum = Number(total);
      if (!Number.isFinite(totalNum) || totalNum < 0) {
        res.status(400).json({ error: "Total inválido." });
        return;
      }
      const { data, error } = await getSupabaseAdmin()
        .from("pedidos")
        .insert({
          nome_cliente: nome_cliente.trim(),
          email_cliente: email_cliente?.trim() || "",
          telefone: telefone?.trim() || "",
          itens: JSON.stringify(itens),
          total: totalNum,
        })
        .select("id")
        .single();
      if (error) throw error;
      res.json({ id: data.id, message: "Pedido registado com sucesso." });
    })
  );

  app.get(
    "/api/admin/pedidos",
    authenticateAdmin,
    asyncHandler(async (_req, res) => {
      const { data, error } = await getSupabaseAdmin().from("pedidos").select("*").order("data", { ascending: false });
      if (error) throw error;
      res.json(data);
    })
  );

  app.patch(
    "/api/admin/pedidos/:id/status",
    authenticateAdmin,
    asyncHandler(async (req, res) => {
      const { error } = await getSupabaseAdmin()
        .from("pedidos")
        .update({ status: req.body.status })
        .eq("id", req.params.id);
      if (error) throw error;
      res.json({ success: true });
    })
  );

  app.delete(
    "/api/admin/pedidos/:id",
    authenticateAdmin,
    asyncHandler(async (req, res) => {
      const { error } = await getSupabaseAdmin().from("pedidos").delete().eq("id", req.params.id);
      if (error) throw error;
      res.json({ success: true });
    })
  );

  app.get(
    "/api/equipamentos",
    asyncHandler(async (_req, res) => {
      const { data, error } = await getSupabaseAdmin().from("equipamentos").select("*");
      if (error) throw error;
      res.json(data);
    })
  );

  app.get(
    "/api/pacotes-eventos",
    asyncHandler(async (_req, res) => {
      const { data, error } = await getSupabaseAdmin().from("pacotes_eventos").select("*");
      if (error) throw error;
      res.json(data);
    })
  );

  app.get(
    "/api/portfolio",
    asyncHandler(async (_req, res) => {
      res.setHeader("Cache-Control", "no-store");
      const { data, error } = await getSupabaseAdmin().from("portfolio").select("*").order("data", { ascending: false });
      if (error) throw error;
      res.json(data);
    })
  );

  app.post(
    "/api/admin/portfolio",
    authenticateAdmin,
    asyncHandler(async (req, res) => {
      const { id, titulo, descricao, imagem, data, tipo_evento } = req.body;
      const supabase = getSupabaseAdmin();
      const portfolioId = parseExistingId(id);
      if (portfolioId) {
        const { data: prev } = await supabase.from("portfolio").select("imagem").eq("id", portfolioId).maybeSingle();
        const imagemUrl = await img("portfolio", imagem, prev?.imagem);
        const { error } = await supabase
          .from("portfolio")
          .update({ titulo, descricao, imagem: imagemUrl, data, tipo_evento })
          .eq("id", portfolioId);
        if (error) throw error;
        res.json({ success: true, id: portfolioId });
      } else {
        const imagemUrl = await img("portfolio", imagem);
        const { data: row, error } = await supabase
          .from("portfolio")
          .insert({ titulo, descricao, imagem: imagemUrl, data, tipo_evento })
          .select("id")
          .single();
        if (error) throw error;
        res.json({ success: true, id: row.id });
      }
    })
  );

  app.delete(
    "/api/admin/portfolio/:id",
    authenticateAdmin,
    asyncHandler(async (req, res) => {
      const { error } = await getSupabaseAdmin().from("portfolio").delete().eq("id", req.params.id);
      if (error) throw error;
      res.json({ success: true });
    })
  );

  app.get(
    "/api/equipa",
    asyncHandler(async (_req, res) => {
      res.setHeader("Cache-Control", "no-store");
      const { data, error } = await getSupabaseAdmin().from("equipa").select("*");
      if (error) throw error;
      res.json(data);
    })
  );

  app.post(
    "/api/admin/equipa",
    authenticateAdmin,
    asyncHandler(async (req, res) => {
      const { id, nome, cargo, foto, bio, redes_sociais } = req.body;
      const supabase = getSupabaseAdmin();
      const membroId = parseExistingId(id);
      const redes = typeof redes_sociais === "string" ? redes_sociais : JSON.stringify(redes_sociais ?? {});
      if (membroId) {
        const { data: prev } = await supabase.from("equipa").select("foto").eq("id", membroId).maybeSingle();
        const fotoUrl = await img("equipa", foto, prev?.foto);
        const { error } = await supabase
          .from("equipa")
          .update({ nome, cargo, foto: fotoUrl, bio, redes_sociais: redes })
          .eq("id", membroId);
        if (error) throw error;
        res.json({ success: true, id: membroId });
      } else {
        const fotoUrl = await img("equipa", foto);
        const { data, error } = await supabase
          .from("equipa")
          .insert({ nome, cargo, foto: fotoUrl, bio, redes_sociais: redes })
          .select("id")
          .single();
        if (error) throw error;
        res.json({ success: true, id: data.id });
      }
    })
  );

  app.delete(
    "/api/admin/equipa/:id",
    authenticateAdmin,
    asyncHandler(async (req, res) => {
      const { error } = await getSupabaseAdmin().from("equipa").delete().eq("id", req.params.id);
      if (error) throw error;
      res.json({ success: true });
    })
  );

  app.post(
    "/api/mensagens",
    asyncHandler(async (req, res) => {
      const { nome, email, assunto, mensagem } = req.body;
      const { data, error } = await getSupabaseAdmin()
        .from("mensagens")
        .insert({ nome, email, assunto, mensagem })
        .select("id")
        .single();
      if (error) throw error;
      res.json({ id: data.id });
    })
  );

  app.get(
    "/api/admin/mensagens",
    authenticateAdmin,
    asyncHandler(async (_req, res) => {
      const { data, error } = await getSupabaseAdmin().from("mensagens").select("*").order("data", { ascending: false });
      if (error) throw error;
      res.json(data);
    })
  );

  app.delete(
    "/api/admin/mensagens/:id",
    authenticateAdmin,
    asyncHandler(async (req, res) => {
      const { error } = await getSupabaseAdmin().from("mensagens").delete().eq("id", req.params.id);
      if (error) throw error;
      res.json({ success: true });
    })
  );

  app.get(
    "/api/admin/stats",
    authenticateAdmin,
    asyncHandler(async (_req, res) => {
      res.json({
        produtos: await tableCount("produtos"),
        reservas: await tableCount("reservas"),
        mensagens: await tableCount("mensagens"),
        solicitacoes: await tableCount("solicitacoes_servico"),
        pedidos: await tableCount("pedidos"),
        equipa: await tableCount("equipa"),
        portfolio: await tableCount("portfolio"),
      });
    })
  );
}
