import { useNavigate } from "react-router-dom";
import { Logo } from "../components/Logo";
import { Home } from "lucide-react";

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F0F4F8] p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="flex justify-center mb-6">
          <Logo />
        </div>
        
        <div className="mb-6">
          <h1 className="text-6xl text-[#EC5800] mb-2">404</h1>
          <h2 className="text-2xl text-[#070738] mb-4">Página não encontrada</h2>
          <p className="text-[#9CA3AF]">
            A página que você está procurando não existe ou foi movida.
          </p>
        </div>
        
        <button
          onClick={() => navigate("/")}
          className="flex items-center justify-center gap-2 w-full bg-[#EC5800] text-white py-3 rounded-lg hover:bg-[#d84f00] transition-colors"
        >
          <Home className="w-5 h-5" />
          Voltar ao Início
        </button>
      </div>
    </div>
  );
}
