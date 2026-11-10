import { ReactNode, useEffect } from "react";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  /** Largura máxima do painel (classes tailwind, ex.: "max-w-lg"). */
  maxWidth?: string;
  /** Esconde o botão X (útil para modais que exigem uma ação). */
  hideCloseButton?: boolean;
}

/**
 * Modal padronizado do sistema:
 * - Botão de fechar (X) sempre presente no canto superior direito
 * - Fecha com a tecla Esc
 * - Fecha ao clicar no fundo escurecido (backdrop)
 * - Bloqueia o scroll da página enquanto está aberto
 */
export default function Modal({
  open,
  onClose,
  title,
  children,
  maxWidth = "max-w-lg",
  hideCloseButton = false,
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`bg-white rounded-[2rem] w-full ${maxWidth} max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in duration-200`}
        onClick={(e) => e.stopPropagation()}
      >
        {(title !== undefined || !hideCloseButton) && (
          <div className="sticky top-0 bg-white z-10 p-6 border-b border-zinc-100 flex items-center justify-between rounded-t-[2rem]">
            {title !== undefined ? (
              typeof title === "string" ? (
                <h2 className="text-xl font-black uppercase italic tracking-tighter text-zinc-900">{title}</h2>
              ) : (
                title
              )
            ) : (
              <span />
            )}
            {!hideCloseButton && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Fechar"
                className="p-2 rounded-full text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
              >
                <X size={20} />
              </button>
            )}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
