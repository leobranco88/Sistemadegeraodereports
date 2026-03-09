import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Logo } from "../components/Logo";
import { StatusBadge } from "../components/StatusBadge";
import { mockStudents, mockReports } from "../data/mockData";
import { User } from "../types";
import { Users, FileCheck, CheckCircle2, Calendar, LogOut, Eye, Download, FileDown, TrendingUp } from "lucide-react";

export function CoordinatorDashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [filterClass, setFilterClass] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    const user = localStorage.getItem("currentUser");
    if (user) {
      setCurrentUser(JSON.parse(user));
    } else {
      navigate("/");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/");
  };

  // Calculate KPIs
  const totalStudents = mockStudents.length;
  const reportsCompleted = mockStudents.filter(s => 
    ["completed", "sent", "confirmed", "meeting-scheduled"].includes(s.status)
  ).length;
  const parentsConfirmed = mockStudents.filter(s => 
    ["confirmed", "meeting-scheduled"].includes(s.status)
  ).length;
  const meetingsScheduled = mockStudents.filter(s => s.status === "meeting-scheduled").length;

  const completionPercentage = Math.round((reportsCompleted / totalStudents) * 100);
  const confirmationPercentage = Math.round((parentsConfirmed / totalStudents) * 100);

  // Get unique classes
  const classes = Array.from(new Set(mockStudents.map(s => s.class)));

  // Filter students
  const filteredStudents = mockStudents.filter(student => {
    const classMatch = filterClass === "all" || student.class === filterClass;
    const statusMatch = filterStatus === "all" || student.status === filterStatus;
    return classMatch && statusMatch;
  });

  return (
    <div className="min-h-screen bg-[#F0F4F8]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Logo />
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-[#3D3D3D]">{currentUser?.name}</p>
                <p className="text-xs text-[#9CA3AF]">Coordenador</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-[#9CA3AF] hover:text-[#EC5800] transition-colors"
                title="Sair"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl text-[#070738]">Painel do Coordenador</h1>
          <button
            onClick={() => alert("Exportar dados (CSV) - to be implemented")}
            className="flex items-center gap-2 px-4 py-2 bg-[#070738] text-white rounded-lg hover:bg-[#0a0a50] transition-colors"
          >
            <FileDown className="w-5 h-5" />
            Exportar CSV
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm text-[#9CA3AF]">Total de alunos ativos</h3>
              <Users className="w-5 h-5 text-[#8B5CF6]" />
            </div>
            <p className="text-3xl text-[#070738] mb-2">{totalStudents}</p>
            <p className="text-xs text-[#9CA3AF]">Todas as turmas</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm text-[#9CA3AF]">Relatórios concluídos</h3>
              <FileCheck className="w-5 h-5 text-[#EC5800]" />
            </div>
            <p className="text-3xl text-[#070738] mb-2">{completionPercentage}%</p>
            <p className="text-xs text-[#9CA3AF]">{reportsCompleted} de {totalStudents} relatórios</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm text-[#9CA3AF]">Pais confirmaram</h3>
              <CheckCircle2 className="w-5 h-5 text-[#16A34A]" />
            </div>
            <p className="text-3xl text-[#070738] mb-2">{confirmationPercentage}%</p>
            <p className="text-xs text-[#9CA3AF]">{parentsConfirmed} confirmações</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm text-[#9CA3AF]">Reuniões agendadas</h3>
              <Calendar className="w-5 h-5 text-[#8B5CF6]" />
            </div>
            <p className="text-3xl text-[#070738] mb-2">{meetingsScheduled}</p>
            <p className="text-xs text-[#9CA3AF]">Solicitadas pelos pais</p>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-xl text-[#070738] mb-4">Visão Geral do Progresso</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-[#3D3D3D]">Relatórios completos</span>
                <span className="text-sm text-[#3D3D3D]">{completionPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-[#EC5800] h-3 rounded-full transition-all"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-[#3D3D3D]">Confirmações dos pais</span>
                <span className="text-sm text-[#3D3D3D]">{confirmationPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-[#16A34A] h-3 rounded-full transition-all"
                  style={{ width: `${confirmationPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm text-[#3D3D3D] mb-2">Filtrar por turma</label>
              <select
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
                className="px-4 py-2 bg-[#F0F4F8] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EC5800]"
              >
                <option value="all">Todas as turmas</option>
                {classes.map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-[#3D3D3D] mb-2">Filtrar por status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 bg-[#F0F4F8] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EC5800]"
              >
                <option value="all">Todos os status</option>
                <option value="not-started">Não iniciado</option>
                <option value="in-progress">Em progresso</option>
                <option value="completed">Concluído</option>
                <option value="sent">Enviado</option>
                <option value="confirmed">Confirmado</option>
                <option value="meeting-scheduled">Reunião agendada</option>
              </select>
            </div>
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F0F4F8]">
                <tr>
                  <th className="px-6 py-4 text-left text-sm text-[#3D3D3D]">Aluno</th>
                  <th className="px-6 py-4 text-left text-sm text-[#3D3D3D]">Turma</th>
                  <th className="px-6 py-4 text-left text-sm text-[#3D3D3D]">Tipo</th>
                  <th className="px-6 py-4 text-left text-sm text-[#3D3D3D]">Status</th>
                  <th className="px-6 py-4 text-left text-sm text-[#3D3D3D]">Professor</th>
                  <th className="px-6 py-4 text-right text-sm text-[#3D3D3D]">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredStudents.map(student => {
                  const report = mockReports.find(r => r.studentId === student.id);
                  return (
                    <tr key={student.id} className="hover:bg-[#F0F4F8] transition-colors">
                      <td className="px-6 py-4 text-[#070738]">{student.name}</td>
                      <td className="px-6 py-4 text-[#3D3D3D]">{student.class}</td>
                      <td className="px-6 py-4 text-[#3D3D3D] capitalize">
                        {student.classType === "regular" ? "Regular" : student.classType === "intensive" ? "Intensivo" : "Particular"}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={student.status} />
                      </td>
                      <td className="px-6 py-4 text-[#3D3D3D]">
                        {report?.professorName || "Maria Silva"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          {student.status !== "not-started" && (
                            <>
                              <button
                                onClick={() => navigate(`/report/view/${student.id}`)}
                                className="flex items-center gap-2 px-3 py-2 bg-[#070738] text-white rounded-lg hover:bg-[#0a0a50] transition-colors text-sm"
                                title="Ver relatório"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => alert("Download PDF - to be implemented")}
                                className="flex items-center gap-2 px-3 py-2 border border-[#070738] text-[#070738] rounded-lg hover:bg-[#070738] hover:text-white transition-colors text-sm"
                                title="Baixar PDF"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary by Class */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {classes.map(cls => {
            const classStudents = mockStudents.filter(s => s.class === cls);
            const classCompleted = classStudents.filter(s => 
              ["completed", "sent", "confirmed", "meeting-scheduled"].includes(s.status)
            ).length;
            const classPercentage = Math.round((classCompleted / classStudents.length) * 100);

            return (
              <div key={cls} className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg text-[#070738] mb-4">{cls}</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#9CA3AF]">Total de alunos</span>
                    <span className="text-[#3D3D3D]">{classStudents.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#9CA3AF]">Relatórios concluídos</span>
                    <span className="text-[#3D3D3D]">{classCompleted}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                    <div
                      className="bg-[#EC5800] h-2 rounded-full"
                      style={{ width: `${classPercentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-[#9CA3AF] text-right">{classPercentage}% completo</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 
