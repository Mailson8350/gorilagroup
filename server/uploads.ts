import fs from "fs";
import path from "path";
import crypto from "crypto";
import multer from "multer";

export const UPLOAD_FOLDERS = [
  "produtos",
  "quartos",
  "equipamentos",
  "pacotes",
  "portfolio",
  "equipa",
  "servicos",
  "opcoes",
  "site",
] as const;

export type UploadFolder = (typeof UPLOAD_FOLDERS)[number];

export function ensureUploadDirs(uploadsDir: string) {
  for (const sub of UPLOAD_FOLDERS) {
    fs.mkdirSync(path.join(uploadsDir, sub), { recursive: true });
  }
}

export function getPublicUrl(relativePath: string) {
  const cleaned = relativePath.trim().replace(/^\/+/, "").replace(/^uploads\/?/, "");
  return `/uploads/${cleaned}`;
}

export function normalizeStoredUrl(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("data:")) {
    return trimmed;
  }
  return getPublicUrl(trimmed);
}

export function saveLocalImageFromBase64(
  dataUrl: string,
  uploadsDir: string,
  folder: UploadFolder
): string | null {
  const match = dataUrl.match(/^data:(image\/[\w.+-]+);base64,(.+)$/);
  if (!match) return null;
  const ext = match[1].split("/")[1].replace("jpeg", "jpg");
  const buffer = Buffer.from(match[2], "base64");
  if (buffer.length > 5 * 1024 * 1024) {
    throw new Error("Imagem muito grande (máx. 5MB)");
  }
  const filename = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}.${ext}`;
  const relative = `${folder}/${filename}`;
  fs.writeFileSync(path.join(uploadsDir, relative), buffer);
  return getPublicUrl(relative);
}

export function deleteUploadIfLocal(url: string | null | undefined, projectRoot: string) {
  if (!url || !url.startsWith("/uploads/")) return;
  const filePath = path.join(projectRoot, url.slice(1));
  try {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch {
    /* ignore */
  }
}

export function resolveImageInput(
  input: string | undefined | null,
  uploadsDir: string,
  projectRoot: string,
  folder: UploadFolder,
  previousUrl?: string | null
): string {
  if (!input) {
    if (previousUrl && input === "") deleteUploadIfLocal(previousUrl, projectRoot);
    return "";
  }
  if (input.startsWith("data:image/")) {
    const saved = saveLocalImageFromBase64(input, uploadsDir, folder);
    if (saved && previousUrl && previousUrl !== saved) {
      deleteUploadIfLocal(previousUrl, projectRoot);
    }
    return saved || previousUrl || "";
  }
  return normalizeStoredUrl(input);
}

export function createUploadMiddleware(uploadsDir: string) {
  const storage = multer.diskStorage({
    destination: (req, _file, cb) => {
      const folder = UPLOAD_FOLDERS.includes(req.params.folder as UploadFolder)
        ? (req.params.folder as UploadFolder)
        : "site";
      const dest = path.join(uploadsDir, folder);
      fs.mkdirSync(dest, { recursive: true });
      cb(null, dest);
    },
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname) || ".jpg";
      cb(null, `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`);
    },
  });

  return multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      if (file.mimetype.startsWith("image/")) cb(null, true);
      else cb(new Error("Apenas imagens são permitidas"));
    },
  });
}
