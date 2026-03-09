import { LogOut, Calendar, Users, LayoutDashboard, GraduationCap, RefreshCw } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";
import logo from "../../imports/logo.svg";

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const handleLogout = async () => { await signOut(auth); navigate("/"); };
  return (
    <header className="border-b" style={{ backgroundColor: "#FFFFFF", borderColor: "#E5E7EB" }}>
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img src={logo} alt="Logo EIC" className="h-10" />
          <div className="text-lg" style={{ color: "#573000" }}>Painel da Secretaria</div>
        </div>
        <div className="flex items-center gap-2">
          {[
            { path: "/secretaria", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
            { path: "/secretaria/alunos", label: "Alunos", icon: <GraduationCap size={20} /> },
            { path: "/secretaria/professores", label: "Professores", icon: <Users size={20} /> },
            { path: "/secretaria/ciclos", label: "Ciclos", icon: <RefreshCw size={20} /> },
            { path: "/secretaria/horarios", label: "Horários", icon: <Calendar size={20} /> },
          ].map(({ path, label, icon }) => (
            <button key={path} onClick={() => navigate(path)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              style={{ color: location.pathname === path ? "#EC5800" : "#3D3D3D", backgroundColor: location.pathname === path ? "#FEF2F2" : "transparent" }}>
              {icon}<span>{label}</span>
            </button>
          ))}
          <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ color: "#EC5800", backgroundColor: "#FEF2F2" }}>
            <LogOut size={20} /><span>Sair</span>
          </button>
        </div>
      </div>
    </header>
  );
}
