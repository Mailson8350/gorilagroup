import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "../contexts/CartContext";
import { useSettings } from "../contexts/SettingsContext";
import MediaImage from "../components/MediaImage";

export default function Cart() {
  const { items, removeItem, updateQuantity, clearCart, totalPrice } = useCart();
  const { formatPrice } = useSettings();
  const navigate = useNavigate();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome_cliente: nome,
          email_cliente: email,
          telefone,
          itens: items.map((i) => ({
            id: i.id,
            nome: i.nome,
            preco: i.preco,
            quantidade: i.quantidade,
          })),
          total: totalPrice,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        clearCart();
        setStatus("ok");
        setTimeout(() => navigate("/loja"), 2500);
      } else {
        setStatus("error");
        setErrorMsg(data.error || "Erro ao enviar pedido.");
      }
    } catch {
      setStatus("error");
      setErrorMsg("Falha de rede. Tente novamente.");
    }
  };

  if (items.length === 0 && status !== "ok") {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center px-4">
        <ShoppingBag size={64} className="text-zinc-300 mb-6" />
        <h1 className="text-3xl font-black uppercase italic tracking-tighter mb-4">Carrinho vazio</h1>
        <p className="text-zinc-500 mb-8">Adicione produtos da loja para continuar.</p>
        <Link to="/loja" className="btn-primary">
          Ir à Loja
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link to="/loja" className="inline-flex items-center gap-2 text-zinc-500 hover:text-black mb-8">
          <ArrowLeft size={20} />
          <span className="font-bold uppercase tracking-widest text-xs">Continuar a comprar</span>
        </Link>

        <h1 className="text-4xl font-black uppercase italic tracking-tighter mb-12">
          Carrinho <span className="text-primary">({items.length})</span>
        </h1>

        {status === "ok" ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-12 text-center">
            <p className="text-emerald-800 font-bold text-lg">Pedido enviado com sucesso!</p>
            <p className="text-emerald-600 mt-2">Entraremos em contacto em breve.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-6 border border-zinc-100 flex gap-6 shadow-sm"
                >
                  <div className="w-24 h-24 rounded-xl overflow-hidden bg-zinc-100 shrink-0">
                    <MediaImage src={item.imagem} alt={item.nome} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg truncate">{item.nome}</h3>
                    <p className="text-primary font-black text-xl mt-1">{formatPrice(item.preco)}</p>
                    <div className="flex items-center gap-4 mt-4">
                      <div className="flex items-center bg-zinc-100 rounded-lg">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantidade - 1)}
                          className="p-2 hover:bg-zinc-200 rounded-l-lg"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="px-4 font-bold">{item.quantidade}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantidade + 1)}
                          className="p-2 hover:bg-zinc-200 rounded-r-lg"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="text-red-500 hover:bg-red-50 p-2 rounded-lg"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                  <div className="text-right font-black text-lg self-center">
                    {formatPrice(item.preco * item.quantidade)}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl p-8 border border-zinc-100 shadow-xl h-fit sticky top-24">
              <h2 className="text-xl font-black uppercase mb-6">Finalizar pedido</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  required
                  placeholder="Nome completo"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full bg-zinc-50 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                />
                <input
                  type="email"
                  placeholder="E-mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-zinc-50 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                />
                <input
                  required
                  placeholder="Telefone / WhatsApp"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  className="w-full bg-zinc-50 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                />
                <div className="pt-4 border-t border-zinc-100 flex justify-between items-center">
                  <span className="font-bold uppercase text-sm text-zinc-500">Total</span>
                  <span className="text-2xl font-black">{formatPrice(totalPrice)}</span>
                </div>
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full btn-primary disabled:opacity-50"
                >
                  {status === "loading" ? "A enviar..." : "Confirmar pedido"}
                </button>
                {status === "error" && <p className="text-red-600 text-sm font-medium">{errorMsg}</p>}
                <p className="text-xs text-zinc-400 text-center">
                  A equipa Gorila entrará em contacto para confirmar disponibilidade e pagamento.
                </p>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
