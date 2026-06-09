import { AlertCircle, RefreshCw } from "lucide-react";

export default function AdminErrorBanner({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex items-start gap-3 bg-red-50 border border-red-100 text-red-800 rounded-2xl px-5 py-4 text-sm">
      <AlertCircle className="shrink-0 mt-0.5" size={20} />
      <div className="flex-1">
        <p className="font-bold">Não foi possível carregar os dados</p>
        <p className="mt-1 opacity-90">{message}</p>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="shrink-0 flex items-center gap-1 px-3 py-2 bg-white rounded-xl text-xs font-black uppercase hover:bg-red-100"
        >
          <RefreshCw size={14} /> Tentar de novo
        </button>
      )}
    </div>
  );
}
