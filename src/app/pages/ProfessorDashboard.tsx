import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Logo } from "../components/Logo";
import { StatusBadge } from "../components/StatusBadge";
import { mockStudents, mockReports } from "../data/mockData";
import { User } from "../types";
import { Users, FileText, Clock, CheckCircle, Plus, Eye, LogOut } from "lucide-react";
import { auth } from "../../firebase";
import { signOut } from "firebase/auth";

export function ProfessorDashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) { navigate("/"); return; }
      setCurrentUser({ id: user.uid, name: user.displayName || user.email || "Professor", email: user.email || "", role: "professor" });
    });
    return unsubscribe;
  }, [navigate]);

  const handleSignOut = async () => {
    await signOut(auth);
    navigate("/");
  };

  const getReport = (studentId: string) => mockReports.find(r => r.studentId === studentId);

  const stats = {
    total: mockStudents.length,
    created: mockReports.length,
    pending: mockReports.filter(r => r.status === "sent").length,
    confirmed: mockReports.filter(r => r.status === "confirmed").length,
  };

  return (
    <div className="min-h-screen bg-[#F7F6F3]">
      <header className="bg-white border-b border-[#E5E7EB] px-6 py-4 flex items-center justify-between">
        <Logo />
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-medium text-[#111827]">{currentUser?.name}</p>
            <p className="text-xs text-[#6B7280]">Professor</p>
          </div>
          <button onClick={handleSignOut} className="text-[#6B7280] hover:text-[#EC5800]">
            <LogOut size={20} />
          </button>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-[#070738] mb-6">Dashboard do Professor</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total de alunos", value: stats.total, icon: Users },
            { label: "Relatórios criados", value: stats.created, icon: FileText },
            { label: "Aguardando", value: stats.pending, icon: Clock },
            { label: "Confirmados", value: stats.confirmed, icon: CheckCircle },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-white rounded-xl p-5 border border-[#E5E7EB]">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-[#6B7280]">{label}</p>
                <Icon size={18} className="text-[#EC5800]" />
              </div>
              <p className="text-3xl font-bold text-[#111827]">{value}</p>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
          <table className="w-full">
            <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
              <tr>
                {["Aluno", "Turma", "Status", "Ações"].map(h => (
                  <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-[#6B7280] uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F4F6]">
              {mockStudents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-[#6B7280]">
                    Nenhum aluno cadastrado ainda.
                  </td>
                </tr>
              ) : (
                mockStudents.map(student => {
                  const report = getReport(student.id);
                  return (
                    <tr key={student.id} className="hover:bg-[#F9FAFB]">
                      <td className="px-6 py-4 text-sm font-medium text-[#111827]">{student.name}</td>
                      <td className="px-6 py-4 text-sm text-[#6B7280]">{student.class}</td>
                      <td className="px-6 py-4"><StatusBadge status={report?.status || "not-started"} /></td>
                      <td className="px-6 py-4">
                        {report ? (
                          <button onClick={() => navigate("/report/view/" + report.id)}
                            className="bg-[#070738] text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2">
                            <Eye size={14} /> Ver
                          </button>
                        ) : (
                          <button onClick={() => navigate("/report/create/" + student.id)}
                            className="bg-[#EC5800] text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2">
                            <Plus size={14} /> Criar
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
