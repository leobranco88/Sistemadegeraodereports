import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Logo } from "../components/Logo";
import { StatusBadge } from "../components/StatusBadge";
import { Student, User, Report } from "../types";
import { Users, FileText, Clock, CheckCircle, Plus, Eye, Download, LogOut } from "lucide-react";
import { getStudents, getReports, signOut } from "../firebaseService";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";

export function ProfessorDashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [filterClass, setFilterClass] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        navigate("/");
        return;
      }
      // Busca dados do usuário salvo no localStorage (compatibilidade)
      const saved = localStorage.getItem("currentUser");
      if (saved) setCurrentUser(JSON.parse(saved));

      try {
        const [studentsData, reportsData] = await Promise.all([
          getStudents(firebaseUser.uid),
          getReports(firebaseUser.uid)
        ]);
        setStudents(studentsData);
        setReports(reportsData);
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
      } finally {
        setLoading(false);
      }
    });
    return () => unsub();
  }, [navigate]);

  const handleSignOut = async () => {
    await signOut();
    localStorage.removeItem("currentUser");
    navigate("/");
  };

  const getStudentReport = (studentId: string) =>
    reports.find(r => r.studentId === studentId);

  const getStudentStatus = (studentId: string) => {
    const report = getStudentReport(studentId);
    if (!report) return "not-started";
    return report.status;
  };

  const classes = ["all", ...Array.from(new Set(students.map(s => s.class)))];

  const filteredStudents = students.filter(s => {
    const status = getStudentStatus(s.id);
    const matchClass = filterClass === "all" || s.class === filterClass;
    const matchStatus = filterStatus === "all" || status === filterStatus;
    return matchClass && matchStatus;
  });

  const stats = {
    total: students.length,
    created: reports.length,
    pending: reports.filter(r => r.status === "sent").length,
    confirmed: reports.filter(r => r.status === "confirmed").length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F6F3] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#EC5800] mx-auto mb-4"></div>
          <p className="text-[#6B7280]">Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F6F3]">
      {/* Header */}
      <header className="bg-white border-b border-[#E5E7EB] px-6 py-4 flex items-center justify-between">
        <Logo />
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-medium text-[#111827]">{currentUser?.name || "Professor"}</p>
            <p className="text-xs text-[#6B7280]">Professor</p>
          </div>
          <button onClick={handleSignOut} className="text-[#6B7280] hover:text-[#EC5800] transition-colors">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-[#070738] mb-6">Dashboard do Professor</h1>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total de alunos", value: stats.total, icon: Users, color: "#070738" },
            { label: "Relatórios criados", value: stats.created, icon: FileText, color: "#EC5800" },
            { label: "Aguardando envio", value: stats.pending, icon: Clock, color: "#F59E0B" },
            { label: "Confirmados pelos pais", value: stats.confirmed, icon: CheckCircle, color: "#10B981" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-xl p-5 border border-[#E5E7EB]">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-[#6B7280]">{label}</p>
                <Icon size={18} color={color} />
              </div>
              <p className="text-3xl font-bold text-[#111827]">{value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 mb-4 flex gap-4 flex-wrap">
          <div>
            <label className="text-xs text-[#6B7280] block mb-1">Filtrar por turma</label>
            <select
              value={filterClass}
              onChange={e => setFilterClass(e.target.value)}
              className="border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm text-[#111827]"
            >
              {classes.map(c => (
                <option key={c} value={c}>{c === "all" ? "Todas as turmas" : c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-[#6B7280] block mb-1">Filtrar por status</label>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm text-[#111827]"
            >
              <option value="all">Todos os status</option>
              <option value="not-started">Não iniciado</option>
              <option value="draft">Em progresso</option>
              <option value="sent">Enviado</option>
              <option value="confirmed">Confirmado</option>
            </select>
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
          {filteredStudents.length === 0 ? (
            <div className="p-12 text-center">
              <Users size={40} className="mx-auto mb-4 text-[#D1D5DB]" />
              <p className="text-[#6B7280]">Nenhum aluno encontrado.</p>
              <p className="text-sm text-[#9CA3AF] mt-1">Os alunos cadastrados no Firebase aparecerão aqui.</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                <tr>
                  {["Aluno", "Turma", "Tipo", "Status", "Ações"].map(h => (
                    <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F4F6]">
                {filteredStudents.map(student => {
                  const report = getStudentReport(student.id);
                  const status = getStudentStatus(student.id);
                  return (
                    <tr key={student.id} className="hover:bg-[#F9FAFB] transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-[#111827]">{student.name}</td>
                      <td className="px-6 py-4 text-sm text-[#6B7280]">{student.class}</td>
                      <td className="px-6 py-4 text-sm text-[#6B7280] capitalize">{student.classType}</td>
                      <td className="px-6 py-4"><StatusBadge status={status} /></td>
                      <td className="px-6 py-4">
                        {!report ? (
                          <button
                            onClick={() => navigate(`/create-report/${student.id}`)}
                            className="bg-[#EC5800] text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-[#d44f00] transition-colors"
                          >
                            <Plus size={14} /> Criar Relatório
                          </button>
                        ) : status === "draft" ? (
                          <button
                            onClick={() => navigate(`/create-report/${student.id}`)}
                            className="bg-[#070738] text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-[#0a0a5c] transition-colors"
                          >
                            Continuar
                          </button>
                        ) : (
                          <div className="flex gap-2">
                            <button
                              onClick={() => navigate(`/report/${report.id}`)}
                              className="bg-[#070738] text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-[#0a0a5c] transition-colors"
                            >
                              <Eye size={14} /> Ver
                            </button>
                            <button className="border border-[#E5E7EB] p-2 rounded-lg hover:bg-[#F3F4F6] transition-colors">
                              <Download size={16} className="text-[#6B7280]" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
