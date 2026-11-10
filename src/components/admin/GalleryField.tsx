import { useRef, useState } from "react";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { mediaUrl } from "../../lib/media";

interface GalleryFieldProps {
  label: string;
  /** URLs das imagens da galeria (não inclui a capa). */
  value: string[];
  onChange: (value: string[]) => void;
  folder?: string;
  /** A primeira imagem da galeria pode servir de capa; permite remover com um clique. */
  hint?: string;
}

/**
 * Campo de galeria multi-foto para o painel admin.
 * Envia todas as imagens selecionadas de uma vez (input multiple)
 * e permite remover cada uma individualmente.
 */
export default function GalleryField({ label, value, onChange, folder = "portfolio", hint }: GalleryFieldProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const uploadFiles = async (files: FileList) => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      setUploadError("Sessão expirada. Faça login novamente.");
      return;
    }

    const valid = Array.from(files).filter(
      (f) => f.type.startsWith("image/") && f.size <= 5 * 1024 * 1024
    );
    if (valid.length === 0) {
      setUploadError("Nenhuma imagem válida (apenas imagens, máx. 5MB cada).");
      return;
    }

    setUploading(true);
    setUploadError(null);
    try {
      const form = new FormData();
      valid.forEach((f) => form.append("files", f));
      const res = await fetch(`/api/admin/upload/${folder}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      let data: { url?: string; urls?: string[]; error?: string } = {};
      try {
        data = await res.json();
      } catch {
        setUploadError("Resposta inválida do servidor.");
        return;
      }
      if (res.ok) {
        const uploaded = data.urls ?? (data.url ? [data.url] : []);
        if (uploaded.length > 0) {
          onChange([...value, ...uploaded]);
          return;
        }
      }
      setUploadError(data.error || `Erro ao enviar imagens (${res.status})`);
    } catch {
      setUploadError("Falha de rede ao enviar as imagens.");
    } finally {
      setUploading(false);
    }
  };

  const removeAt = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">{label}</label>
      {hint && <p className="text-xs text-zinc-400 ml-1 -mt-1">{hint}</p>}

      {value.length > 0 ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {value.map((url, i) => (
            <div key={`${url}-${i}`} className="relative group rounded-2xl overflow-hidden bg-zinc-100 aspect-square">
              <img src={mediaUrl(url)} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              <button
                type="button"
                onClick={() => removeAt(i)}
                aria-label={`Remover foto ${i + 1}`}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 text-red-600 opacity-0 group-hover:opacity-100 transition-opacity shadow"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 py-8 text-center text-zinc-400 text-sm font-semibold">
          Sem fotos na galeria
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={async (e) => {
            const files = e.target.files;
            e.target.value = "";
            if (files && files.length > 0) await uploadFiles(files);
          }}
        />
        <button
          type="button"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-100 rounded-xl text-sm font-bold hover:bg-zinc-200 transition-colors disabled:opacity-50"
        >
          {uploading ? <Loader2 size={16} className="animate-spin" /> : <ImagePlus size={16} />}
          {uploading ? `A enviar...` : "Adicionar fotos"}
        </button>
      </div>

      {uploadError && <p className="text-sm text-red-600 font-medium">{uploadError}</p>}
      {value.length > 0 && !uploading && !uploadError && (
        <p className="text-xs text-emerald-600 font-medium">Galeria atualizada. Clique em Guardar para aplicar.</p>
      )}
    </div>
  );
}
