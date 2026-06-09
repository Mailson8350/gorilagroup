import { useRef, useState } from "react";
import { Image as ImageIcon, Loader2, Upload } from "lucide-react";
import MediaImage from "../MediaImage";

interface ImageFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  folder?: string;
  previewClassName?: string;
}

export default function ImageField({
  label,
  value,
  onChange,
  folder = "site",
  previewClassName = "w-full h-32 rounded-xl object-cover bg-zinc-100",
}: ImageFieldProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const uploadFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setUploadError("Selecione um ficheiro de imagem válido.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Imagem muito grande (máx. 5MB).");
      return;
    }

    const token = localStorage.getItem("adminToken");
    if (!token) {
      setUploadError("Sessão expirada. Faça login novamente.");
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(`/api/admin/upload/${folder}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });

      let data: { url?: string; error?: string } = {};
      try {
        data = await res.json();
      } catch {
        setUploadError("Resposta inválida do servidor.");
        return;
      }

      if (res.ok && data.url) {
        onChange(data.url);
      } else {
        setUploadError(data.error || `Erro ao enviar imagem (${res.status})`);
      }
    } catch {
      setUploadError("Falha de rede ao enviar a imagem.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">{label}</label>

      <div className="relative rounded-xl overflow-hidden bg-zinc-100 border border-zinc-200 min-h-[8rem] flex items-center justify-center">
        {value ? (
          <div key={value} className="w-full">
            <MediaImage src={value} alt="" className={previewClassName} referrerPolicy="no-referrer" />
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-zinc-400 py-8">
            <ImageIcon size={32} />
            <span className="text-xs font-bold">Sem imagem</span>
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
            <Loader2 className="animate-spin text-emerald-600" size={28} />
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            e.target.value = "";
            if (f) await uploadFile(f);
          }}
        />
        <button
          type="button"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-100 rounded-xl text-sm font-bold hover:bg-zinc-200 transition-colors disabled:opacity-50"
        >
          {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
          {uploading ? "A enviar..." : "Escolher do computador"}
        </button>
      </div>

      {uploadError && <p className="text-sm text-red-600 font-medium">{uploadError}</p>}
      {value && !uploading && !uploadError && (
        <p className="text-xs text-emerald-600 font-medium">Imagem carregada. Clique em Guardar para aplicar.</p>
      )}

      <div className="relative">
        <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
        <input
          type="text"
          value={value}
          onChange={(e) => {
            setUploadError(null);
            onChange(e.target.value);
          }}
          className="w-full bg-zinc-50 border-none rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-emerald-500 text-sm"
          placeholder="/uploads/pasta/ficheiro.jpg"
        />
      </div>
    </div>
  );
}
