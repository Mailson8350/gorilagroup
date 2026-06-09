import crypto from "crypto";
import { getSupabaseAdmin, isSupabaseConfigured, STORAGE_BUCKET } from "./supabaseClient";
import type { UploadFolder } from "./uploads";
import {
  deleteUploadIfLocal,
  getPublicUrl,
  normalizeStoredUrl,
  saveLocalImageFromBase64,
  type UploadFolder as Folder,
} from "./uploads";
import path from "path";
import fs from "fs";

const UPLOADS_DIR = process.env.UPLOADS_DIR || path.join(process.cwd(), "uploads");

function ensureLocalDirs() {
  for (const sub of ["produtos", "quartos", "equipamentos", "pacotes", "portfolio", "equipa", "servicos", "opcoes", "site"]) {
    fs.mkdirSync(path.join(UPLOADS_DIR, sub), { recursive: true });
  }
}

async function uploadToSupabase(
  folder: UploadFolder,
  buffer: Buffer,
  contentType: string,
  ext: string
): Promise<string> {
  const supabase = getSupabaseAdmin();
  const filename = `${folder}/${Date.now()}-${crypto.randomBytes(6).toString("hex")}.${ext}`;
  const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(filename, buffer, {
    contentType,
    upsert: false,
  });
  if (error) throw new Error(`Upload falhou: ${error.message}`);
  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filename);
  return data.publicUrl;
}

export async function uploadFileBuffer(
  folder: UploadFolder,
  buffer: Buffer,
  mimetype: string,
  originalName?: string
): Promise<string> {
  const ext = (originalName && path.extname(originalName).slice(1)) || mimetype.split("/")[1]?.replace("jpeg", "jpg") || "jpg";
  if (isSupabaseConfigured()) {
    return uploadToSupabase(folder, buffer, mimetype, ext);
  }
  ensureLocalDirs();
  const filename = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}.${ext}`;
  const relative = `${folder}/${filename}`;
  fs.writeFileSync(path.join(UPLOADS_DIR, relative), buffer);
  return getPublicUrl(relative);
}

export async function resolveImageInputAsync(
  input: string | undefined | null,
  folder: Folder,
  previousUrl?: string | null
): Promise<string> {
  if (!input) {
    if (previousUrl && input === "" && !isSupabaseConfigured()) {
      deleteUploadIfLocal(previousUrl, process.cwd());
    }
    return "";
  }
  if (input.startsWith("data:image/")) {
    const match = input.match(/^data:(image\/[\w.+-]+);base64,(.+)$/);
    if (!match) return previousUrl || "";
    const ext = match[1].split("/")[1].replace("jpeg", "jpg");
    const buffer = Buffer.from(match[2], "base64");
    if (buffer.length > 5 * 1024 * 1024) throw new Error("Imagem muito grande (máx. 5MB)");
    if (isSupabaseConfigured()) {
      const url = await uploadToSupabase(folder, buffer, match[1], ext);
      return url;
    }
    ensureLocalDirs();
    const saved = saveLocalImageFromBase64(input, UPLOADS_DIR, folder);
    if (saved && previousUrl && previousUrl !== saved) {
      deleteUploadIfLocal(previousUrl, process.cwd());
    }
    return saved || previousUrl || "";
  }
  if (input.startsWith("http://") || input.startsWith("https://")) return input.trim();
  return normalizeStoredUrl(input);
}

export function getUploadsStaticDir(): string {
  return UPLOADS_DIR;
}
