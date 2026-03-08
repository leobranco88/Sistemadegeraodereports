import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Logo } from "../components/Logo";
import { mockUsers } from "../data/mockData";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user = mockUsers.find(u => u.email === email.trim().toLowerCase());
    if (user) {
      localStorage.setItem("currentUser", JSON.stringify(user));
      if (user.role === "professor") {
        navigate("/professor");
      } else if (user.role === "coordinator") {
        navigate("/coordinator");
      }
    } else {
      setError("E-mail não encontrado. Tente: maria.silva@eicschool.com");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F0F4F8] p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex justify-center mb-8">
            <Logo />
          </div>
          <h1 className="text-2xl text-center text-[#070738] mb-2">Bem-vindo</h1>
          <p className="text-center text-[#9CA3AF] mb-8">Entre com suas credenciais</p>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}
          <div className="space-y-6">
            <div>
              <label className="block text-sm text-[#3D3D3D] mb-2">E-mail institucional</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-[#F0F4F8] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EC5800]"
                placeholder="seu.email@eicschool.com"
              />
            </div>
            <div>
              <label className="block text-sm text-[#3D3D3D] mb-2">Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-[#F0F4F8] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EC5800]"
                placeholder="••••••••"
              />
            </div>
            <button
              onClick={handleSubmit}
              className="w-full bg-[#EC5800] text-white py-3 rounded-lg hover:bg-[#d84f00] transition-colors"
            >
              Entrar
            </button>
          </div>
          <div className="mt-8 p-4 bg-[#F0F4F8] rounded-lg">
            <p className="text-xs text-[#9CA3AF] mb-2">Credenciais de teste:</p>
            <p className="text-xs text-[#3D3D3D]"><strong>Professor:</strong> maria.silva@eicschool.com</p>
            <p className="text-xs text-[#3D3D3D]"><strong>Coordenador:</strong> joao.santos@eicschool.com</p>
            <p className="text-xs text-[#9CA3AF] mt-2">Senha: qualquer senha</p>
          </div>
        </div>
      </div>
    </div>
  );
}
