import { LogOut, Calendar, Users, LayoutDashboard } from "lucide-react";
import { useNavigate, useLocation } from "react-router";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";
import logo from "../../imports/logo.svg";

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  return (
    <header className="border-b" style={{ backgroundColor: "#FFFFFF", borderColor: "#E5E7EB" }}>
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img src={logo} alt="Logo EIC" className="h-10" />
          <div className="text-lg" style={{ color: "#573000" }}>
            Painel da Secretaria
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            style={{
              color: location.pathname === "/dashboard" ? "#8B5CF6" : "#3D3D3D",
              backgroundColor: location.pathname === "/dashboard" ? "#F3F4F6" : "transparent"
            }}
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </button>
          <button
            onClick={() => navigate("/professores")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            style={{
              color: location.pathname === "/professores" ? "#8B5CF6" : "#3D3D3D",
              backgroundColor: location.pathname === "/professores" ? "#F3F4F6" : "transparent"
            }}
          >
            <Users size={20} />
            <span>Professores</span>
          </button>
          <button
            onClick={() => navigate("/horarios")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            style={{
              color: location.pathname === "/horarios" ? "#8B5CF6" : "#3D3D3D",
              backgroundColor: location.pathname === "/horarios" ? "#F3F4F6" : "transparent"
            }}
          >
            <Calendar size={20} />
            <span>Horários</span>
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
            style={{ color: "#EC5800", backgroundColor: "#FEF2F2" }}
          >
            <LogOut size={20} />
            <span>Sair</span>
          </button>
        </div>
      </div>
    </header>
  );
}
