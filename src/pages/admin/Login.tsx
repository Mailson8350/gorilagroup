import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, User, ArrowRight } from "lucide-react";
import SeoHead from "../../components/SeoHead";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("adminToken", data.token);
        localStorage.setItem("adminUser", JSON.stringify(data.user));
        navigate("/admin/dashboard");
      } else {
        setError(data.error || "Erro ao fazer login");
      }
    } catch (err) {
      setError("Erro de conexão com o servidor");
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
      <SeoHead title="Admin Login" />
      <div className="max-w-md w-full">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-primary rounded-3xl mx-auto mb-6 flex items-center justify-center overflow-hidden shadow-2xl">
            <img 
              src="/uploads/site/placeholder.svg" 
              alt="Gorila Logo" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <h1 className="text-4xl font-black text-secondary uppercase italic tracking-tighter">
            Gorila <span className="text-primary">Admin</span>
          </h1>
          <p className="text-zinc-500 mt-2 font-medium">Painel de Gestão Empresarial</p>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Utilizador</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl pl-12 pr-4 py-4 text-secondary focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none"
                  placeholder="admin"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Palavra-passe</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl pl-12 pr-4 py-4 text-secondary focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold py-3 rounded-xl text-center">
                {error}
              </div>
            )}

            <button 
              type="submit" 
              className="w-full btn-primary flex items-center justify-center space-x-2"
            >
              <span>Entrar no Painel</span>
              <ArrowRight size={18} />
            </button>
          </form>
        </div>

        <p className="text-center mt-8 text-zinc-600 text-[10px] uppercase tracking-widest font-bold">
          &copy; {new Date().getFullYear()} Gorila Group. Acesso Restrito.
        </p>
      </div>
    </div>
  );
}
