import { useState } from "react";
import { useNavigate } from "react-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase";
import logo from "../../imports/logo.svg";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");
    setCarregando(true);
    try {
      await signInWithEmailAndPassword(auth, email, senha);
      navigate("/dashboard");
    } catch (err: any) {
      setErro("Email ou senha incorretos. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#F0F4F8" }}>
      <div className="w-full max-w-md px-6">
        <form onSubmit={handleLogin} className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-center mb-8">
            <div className="text-center">
              <img src={logo} alt="Logo EIC" className="h-16 mx-auto mb-4" />
              <div className="text-sm" style={{ color: "#573000" }}>
                Painel da Secretaria
              </div>
            </div>
          </div>

          {erro && (
            <div className="mb-4 px-4 py-3 rounded-lg text-sm" style={{ backgroundColor: "#FEE2E2", color: "#DC2626" }}>
              {erro}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2" style={{ color: "#3D3D3D" }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
              style={{ borderColor: "#E5E7EB", color: "#3D3D3D" }}
              placeholder="seu@email.com"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2" style={{ color: "#3D3D3D" }}>
              Senha
            </label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
              style={{ borderColor: "#E5E7EB", color: "#3D3D3D" }}
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={carregando}
            className="w-full py-3 rounded-lg text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            style={{ backgroundColor: "#EC5800" }}
          >
            {carregando ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
