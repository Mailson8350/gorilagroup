import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, User, ArrowRight } from "lucide-react";

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
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-emerald-500 rounded-3xl mx-auto mb-6 flex items-center justify-center overflow-hidden shadow-2xl rotate-3">
            <img 
              src="/uploads/site/placeholder.svg" 
              alt="Gorila Logo" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter">
            Gorila <span className="text-emerald-500">Admin</span>
          </h1>
          <p className="text-zinc-500 mt-2 font-medium">Painel de Gestão Empresarial</p>
        </div>

        <div className="bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-800 shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Utilizador</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl pl-12 pr-4 py-4 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none"
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
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl pl-12 pr-4 py-4 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none"
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
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-black uppercase tracking-widest py-4 rounded-2xl flex items-center justify-center space-x-2 transition-all hover:scale-[1.02]"
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
