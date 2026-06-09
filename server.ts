import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { createApp } from "./server/createApp";
import { isSupabaseConfigured } from "./server/supabaseClient";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  if (!isSupabaseConfigured()) {
    console.error(
      "\n❌ Supabase não configurado.\n" +
        "   Crie um projeto em https://supabase.com e defina no ficheiro .env:\n" +
        "   SUPABASE_URL=https://xxxx.supabase.co\n" +
        "   SUPABASE_SERVICE_ROLE_KEY=eyJ...\n" +
        "   JWT_SECRET=uma-chave-segura\n\n" +
        "   Depois execute o SQL em supabase/migrations/001_initial_schema.sql\n" +
        "   e corra: npm run seed\n"
    );
    process.exit(1);
  }

  const app = createApp();

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  const PORT = Number(process.env.PORT) || 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Gorila — http://localhost:${PORT} (Supabase)`);
  });
}

startServer().catch((e) => {
  console.error(e);
  process.exit(1);
});
