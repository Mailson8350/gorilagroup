import { useState, useEffect, FormEvent, useRef, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Calendar, MapPin, Users, Wifi } from "lucide-react";
import { useSettings } from "../contexts/SettingsContext";
import { mediaUrl } from "../lib/media";
import { TURISMO_TAXA_POR_PESSOA, countNights, calcTourismTax } from "../lib/hostel";

interface Quarto {
  id: number;
  nome: string;
  descricao: string;
  preco_noite: number;
  imagem: string;
  disponivel: number;
  livre?: boolean;
  ocupado?: boolean;
}

function AvailabilityDot({ livre, className = "" }: { livre: boolean; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`} title={livre ? "Disponível" : "Ocupado"}>
      <span
        className={`h-3.5 w-3.5 shrink-0 rounded-full ring-2 ring-white/80 ${
          livre ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.65)]" : "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.65)]"
        }`}
        aria-hidden
      />
      <span className={`text-[10px] font-black uppercase tracking-widest ${livre ? "text-emerald-700" : "text-red-600"}`}>
        {livre ? "Disponível" : "Ocupado"}
      </span>
    </span>
  );
}

export default function Hostel() {
  const { formatPrice, t, services } = useSettings();
  const hostelService = services.find((s) => s.id === "hostel");
  const [quartos, setQuartos] = useState<Quarto[]>([]);
  const [selectedQuarto, setSelectedQuarto] = useState("");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [numPessoas, setNumPessoas] = useState(1);
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const today = new Date().toISOString().slice(0, 10);

  const nights = useMemo(() => countNights(dataInicio, dataFim), [dataInicio, dataFim]);

  const fetchQuartos = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (dataInicio && dataFim && dataFim > dataInicio) {
        params.set("data_inicio", dataInicio);
        params.set("data_fim", dataFim);
      }
      const url = params.toString() ? `/api/quartos?${params}` : "/api/quartos";
      const res = await fetch(url, { cache: "no-store" });
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      setQuartos(list);
      const livres = list.filter((q: Quarto) => q.livre !== false && q.disponivel);
      if (livres.length > 0) {
        setSelectedQuarto((current) => {
          const ok = livres.some((q: Quarto) => String(q.id) === current);
          return ok ? current : String(livres[0].id);
        });
      }
    } catch (e) {
      console.error(e);
    }
  }, [dataInicio, dataFim]);

  useEffect(() => {
    fetchQuartos();
  }, [fetchQuartos]);

  const selectedRoom = useMemo(
    () => quartos.find((q) => String(q.id) === selectedQuarto),
    [quartos, selectedQuarto]
  );

  const roomIsFree = (room: Quarto) => room.livre !== false && !!room.disponivel;

  const valorAlojamento = selectedRoom && nights > 0 ? selectedRoom.preco_noite * nights : 0;
  const taxaTurismo = calcTourismTax(numPessoas);
  const valorTotal = valorAlojamento + (nights > 0 ? taxaTurismo : 0);

  const quartosLivres = quartos.filter(roomIsFree);

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleReserva = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/reservas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quarto_id: Number(selectedQuarto),
          nome_cliente: nome,
          email_cliente: email,
          data_inicio: dataInicio,
          data_fim: dataFim,
          num_pessoas: numPessoas,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("ok");
        setNome("");
        setEmail("");
        setNumPessoas(1);
        setDataInicio("");
        setDataFim("");
        fetchQuartos();
      } else {
        setStatus("error");
        setErrorMsg(data.error || "Erro ao registar reserva.");
      }
    } catch {
      setStatus("error");
      setErrorMsg("Falha de rede. Tente novamente.");
    }
  };

  const heroImage = hostelService?.banner_url || quartos[0]?.imagem;

  return (
    <div className="min-h-screen bg-white pb-24">
      <div className="relative h-[60vh] overflow-hidden bg-secondary">
        <img
          src={mediaUrl(heroImage)}
          alt="Hostel"
          className="w-full h-full object-cover opacity-60"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <Link to="/servicos" className="inline-flex items-center space-x-2 text-white/80 hover:text-primary mb-8 transition-colors">
              <ArrowLeft size={20} />
              <span className="font-bold uppercase tracking-widest text-xs">Voltar aos Serviços</span>
            </Link>
            <h1 className="text-6xl md:text-8xl font-display font-bold text-white uppercase tracking-tighter leading-none">
              GORILA <br />
              <span className="text-primary">HOSTEL.</span>
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            <div className="bg-white p-12 rounded-2xl shadow-2xl border border-zinc-100">
              <h2 className="text-3xl font-display font-bold uppercase tracking-tight mb-6">O Conceito</h2>
              <p className="text-zinc-600 text-lg leading-relaxed mb-8">
                O Gorila Hostel não é apenas um lugar para dormir. É um hub criativo em Bissau, desenhado para nómadas digitais, artistas e viajantes que procuram uma experiência autêntica e produtiva.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { icon: <Wifi />, label: "Fibra Ótica" },
                  { icon: <Users />, label: "Coworking" },
                  { icon: <MapPin />, label: "Centro" },
                  { icon: <Calendar />, label: "Eventos" },
                ].map((item, i) => (
                  <div key={i} className="flex flex-col items-center p-6 bg-zinc-50 rounded-xl text-zinc-400 border border-zinc-100">
                    <div className="text-primary mb-3">{item.icon}</div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-secondary">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 px-2 py-4 bg-zinc-50 rounded-xl border border-zinc-100">
              <span className="text-xs font-black uppercase tracking-widest text-zinc-500">Disponibilidade:</span>
              <AvailabilityDot livre />
              <AvailabilityDot livre={false} />
              <span className="text-xs text-zinc-400">
                {dataInicio && dataFim && dataFim > dataInicio
                  ? "Atualizado para as datas do formulário"
                  : "Indicador geral; escolha datas para verificar o calendário"}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {quartos.map((room) => {
                const livre = roomIsFree(room);
                return (
                  <div
                    key={room.id}
                    className={`bg-white rounded-2xl overflow-hidden shadow-xl border group card-hover transition-opacity ${
                      livre ? "border-zinc-100" : "border-red-100 opacity-90"
                    }`}
                  >
                    <div className="aspect-video overflow-hidden relative">
                      <img
                        src={mediaUrl(room.imagem)}
                        alt={room.nome}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-xl shadow-md">
                        <AvailabilityDot livre={livre} />
                      </div>
                    </div>
                    <div className="p-8">
                      <h3 className="text-2xl font-display font-bold mb-2">{room.nome}</h3>
                      <p className="text-zinc-500 text-sm mb-4 line-clamp-2">{room.descricao}</p>
                      <div className="flex items-center justify-between pt-6 border-t border-zinc-50">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-zinc-400 uppercase">Por noite</span>
                          <span className="text-2xl font-black text-secondary">{formatPrice(room.preco_noite)}</span>
                        </div>
                        <button
                          type="button"
                          disabled={!livre}
                          onClick={() => {
                            setSelectedQuarto(String(room.id));
                            scrollToForm();
                          }}
                          className="bg-secondary hover:bg-primary text-white hover:text-secondary px-6 py-3 rounded-lg font-bold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          {t("reserve_now")}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-secondary text-white p-10 rounded-2xl sticky top-24 shadow-2xl">
              <h3 className="text-2xl font-display font-bold uppercase mb-8 text-primary">Reservar Agora</h3>
              <form ref={formRef} className="space-y-6" onSubmit={handleReserva}>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Nome</label>
                  <input
                    required
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="w-full bg-support border-zinc-700 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">E-mail</label>
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-support border-zinc-700 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1 flex items-center gap-1">
                    <Users size={12} /> Número de pessoas
                  </label>
                  <input
                    required
                    type="number"
                    min={1}
                    max={20}
                    value={numPessoas}
                    onChange={(e) => setNumPessoas(Math.max(1, Math.min(20, Number(e.target.value) || 1)))}
                    className="w-full bg-support border-zinc-700 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                  />
                  <p className="text-[10px] text-zinc-500">
                    Imposto de turismo: {TURISMO_TAXA_POR_PESSOA.toLocaleString()} XOF × {numPessoas} pessoa
                    {numPessoas > 1 ? "s" : ""}
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Data de Entrada</label>
                  <input
                    required
                    type="date"
                    min={today}
                    value={dataInicio}
                    onChange={(e) => setDataInicio(e.target.value)}
                    className="w-full bg-support border-zinc-700 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Data de Saída</label>
                  <input
                    required
                    type="date"
                    min={dataInicio || today}
                    value={dataFim}
                    onChange={(e) => setDataFim(e.target.value)}
                    className="w-full bg-support border-zinc-700 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Quarto</label>
                  <select
                    required
                    value={selectedQuarto}
                    onChange={(e) => setSelectedQuarto(e.target.value)}
                    className="w-full bg-support border-zinc-700 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none appearance-none"
                  >
                    {quartosLivres.length === 0 ? (
                      <option value="">Sem quartos disponíveis</option>
                    ) : (
                      quartosLivres.map((q) => (
                        <option key={q.id} value={q.id}>
                          {q.nome} — {formatPrice(q.preco_noite)}/noite
                        </option>
                      ))
                    )}
                  </select>
                </div>
                {nights > 0 && selectedRoom && (
                  <div className="bg-support/50 rounded-lg p-4 text-sm space-y-2">
                    <div className="flex justify-between text-zinc-400">
                      <span>
                        Alojamento ({nights} noite{nights > 1 ? "s" : ""})
                      </span>
                      <span className="text-white font-bold">{formatPrice(valorAlojamento)}</span>
                    </div>
                    <div className="flex justify-between text-zinc-400">
                      <span>Imposto de turismo ({numPessoas} pess.)</span>
                      <span className="text-white font-bold">{formatPrice(taxaTurismo)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-white/10 text-white font-black">
                      <span>Total estimado</span>
                      <span>{formatPrice(valorTotal)}</span>
                    </div>
                  </div>
                )}
                <button
                  type="submit"
                  disabled={status === "loading" || quartosLivres.length === 0}
                  className="w-full btn-primary mt-4 disabled:opacity-50"
                >
                  {status === "loading" ? "A enviar..." : "Confirmar Reserva"}
                </button>
                {status === "ok" && <p className="text-emerald-400 text-sm font-bold">Reserva registada com sucesso!</p>}
                {status === "error" && <p className="text-red-400 text-sm font-bold">{errorMsg}</p>}
              </form>

              <div className="mt-12 pt-8 border-t border-white/10 text-center">
                <p className="text-xs text-zinc-500 font-medium">Precisa de ajuda com a sua reserva?</p>
                <Link to="/contacto" className="text-primary text-sm font-bold mt-2 block hover:underline">
                  Fale connosco
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
