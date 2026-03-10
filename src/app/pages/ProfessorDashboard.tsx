import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Logo } from "../components/Logo";
import { User } from "../types";
import { FileText, Clock, CheckCircle, Plus, Eye, LogOut, AlertTriangle, Calendar, Pencil, Trash2, Lock } from "lucide-react";
import { auth, db } from "../../firebase";
import { signOut } from "firebase/auth";
import { collection, getDocs, query, where, deleteDoc, doc } from "firebase/firestore";

interface Ciclo {
  id: string;
  turma: string;
  professorId: string;
  professorNome: string;
  periodo: string;
  deadline: string;
  alunoIds: string[];
  alunosNomes: string[];
  criadoEm: string;
}

interface Aluno {
  id: string;
  nome: string;
  turma: string;
  tipo: string;
}

interface Relatorio {
  id: string;
  studentId: string;
  status: string;
  period: string;
}

export function ProfessorDashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [ciclos, setCiclos] = useState<Ciclo[]>([]);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [relatorios, setRelatorios] = useState<Relatorio[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) { navigate("/"); return; }
      setCurrentUser({ id: user.uid, name: user.displayName || user.email || "Professor", email: user.email || "", role: "professor" });

      try {
        const profSnap = await getDocs(query(collection(db, "professores"), where("email", "==", user.email)));

        if (!profSnap.empty) {
          const professorId = profSnap.docs[0].id;

          const [ciclosSnap, alunosSnap, relSnap] = await Promise.all([
            getDocs(query(collection(db, "ciclos"), where("professorId", "==", professorId))),
            getDocs(collection(db, "alunos")),
            getDocs(collection(db, "reports")),
          ]);

          setCiclos(ciclosSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Ciclo[]);
          setAlunos(alunosSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Aluno[]);
          setRelatorios(relSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Relatorio[]);
        }
      } catch (err) {
        console.error("Erro ao buscar dados:", err);
      } finally {
        setCarregando(false);
      }
    });
    return unsubscribe;
  }, [navigate]);

  const handleSignOut = async () => {
    await signOut(auth);
    navigate("/");
  };

  const handleExcluirDraft = async (relatorioId: string) => {
    if (!confirm("Excluir este rascunho?")) return;
    try {
      await deleteDoc(doc(db, "reports", relatorioId));
      setRelatorios(prev => prev.filter(r => r.id !== relatorioId));
    } catch (err) {
      alert("Erro ao excluir rascunho.");
    }
  };

  const getRelatorio = (alunoId: string, periodo: string) =>
    relatorios.find(r => r.studentId === alunoId && r.period === periodo);

  const getAluno = (alunoId: string) => alunos.find(a => a.id === alunoId);

  const getStatusDeadline = (deadline: string) => {
    const hoje = new Date();
    const prazo = new Date(deadline);
    const diff = Math.ceil((prazo.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return { label: "Atrasado!", bg: "#FEE2E2", color: "#DC2626", icon: <AlertTriangle size={14} /> };
    if (diff <= 2) return { label: `${diff}d restantes`, bg: "#FEF3C7", color: "#92400E", icon: <Clock size={14} /> };
    return { label: `${diff}d restantes`, bg: "#D1FAE5", color: "#065F46", icon: <CheckCircle size={14} /> };
  };

  const formatarData = (iso: string) => {
    if (!iso) return "";
    return new Date(iso).toLocaleDateString("pt-BR");
  };

  // Badge de status para o professor
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return { label: "Rascunho", bg: "#F3F4F6", color: "#6B7280" };
      case "published":
        return { label: "Aguardando revisão", bg: "#EDE9FE", color: "#7C3AED" };
      case "revisao_solicitada":
        return { label: "Revisar!", bg: "#FEE2E2", color: "#DC2626" };
      case "aprovado":
        return { label: "Aprovado", bg: "#D1FAE5", color: "#065F46" };
      default:
        return { label: "Não iniciado", bg: "#F3F4F6", color: "#9CA3AF" };
    }
  };

  const totalRelatorios = ciclos.reduce((acc, c) => acc + c.alunoIds.length, 0);
  const totalPublicados = ciclos.reduce((acc, c) =>
    acc + c.alunoIds.filter(id => {
      const s = getRelatorio(id, c.periodo)?.status;
      return s === "published" || s === "aprovado";
    }).length, 0);
  const totalAtrasados = ciclos.filter(c => new Date(c.deadline) < new Date()).length;

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

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {[
            { label: "Relatórios pendentes", value: totalRelatorios - totalPublicados, icon: FileText },
            { label: "Publicados", value: totalPublicados, icon: CheckCircle },
            { label: "Ciclos atrasados", value: totalAtrasados, icon: AlertTriangle },
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

        {carregando ? (
          <div className="text-center py-12">
            <div className="w-10 h-10 border-4 border-[#EC5800] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-[#6B7280]">Carregando ciclos...</p>
          </div>
        ) : ciclos.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-12 text-center">
            <Calendar size={48} className="mx-auto mb-4 text-[#E5E7EB]" />
            <p className="text-[#6B7280]">Nenhum ciclo atribuído ainda.</p>
            <p className="text-sm text-[#9CA3AF] mt-1">A secretaria criará um ciclo quando houver relatórios para fazer.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {ciclos.map(ciclo => {
              const prazo = getStatusDeadline(ciclo.deadline);
              const publicados = ciclo.alunoIds.filter(id => {
                const s = getRelatorio(id, ciclo.periodo)?.status;
                return s === "published" || s === "aprovado";
              }).length;
              const pct = ciclo.alunoIds.length > 0 ? Math.round((publicados / ciclo.alunoIds.length) * 100) : 0;

              return (
                <div key={ciclo.id} className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
                  <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
                    <div>
                      <h2 className="font-bold text-[#070738]">{ciclo.turma} — {ciclo.periodo}</h2>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-xs text-[#6B7280] flex items-center gap-1">
                          <Calendar size={12} /> Criado em {formatarData(ciclo.criadoEm)}
                        </span>
                        <span className="text-xs text-[#6B7280]">
                          Prazo: {new Date(ciclo.deadline).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium"
                        style={{ backgroundColor: prazo.bg, color: prazo.color }}>
                        {prazo.icon} {prazo.label}
                      </span>
                      <span className="text-sm font-medium text-[#6B7280]">{publicados}/{ciclo.alunoIds.length} publicados</span>
                    </div>
                  </div>

                  <div className="px-6 py-2 bg-[#F9FAFB]">
                    <div className="w-full h-1.5 rounded-full bg-[#E5E7EB]">
                      <div className="h-1.5 rounded-full transition-all"
                        style={{ width: `${pct}%`, backgroundColor: pct === 100 ? "#10B981" : "#EC5800" }} />
                    </div>
                  </div>

                  <table className="w-full">
                    <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                      <tr>
                        {["Aluno", "Turma", "Tipo", "Status", "Ações"].map(h => (
                          <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-[#6B7280] uppercase">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F3F4F6]">
                      {ciclo.alunoIds.map((alunoId, i) => {
                        const aluno = getAluno(alunoId);
                        const relatorio = getRelatorio(alunoId, ciclo.periodo);
                        const status = relatorio?.status;
                        const isDraft = status === "draft";
                        const isPublished = status === "published";
                        const isRevisao = status === "revisao_solicitada";
                        const isAprovado = status === "aprovado";
                        const badge = relatorio ? getStatusBadge(status!) : getStatusBadge("none");

                        return (
                          <tr key={alunoId} className="hover:bg-[#F9FAFB]">
                            <td className="px-6 py-4 text-sm font-medium text-[#111827]">
                              {aluno?.nome || ciclo.alunosNomes[i]}
                            </td>
                            <td className="px-6 py-4 text-sm text-[#6B7280]">{aluno?.turma || ciclo.turma}</td>
                            <td className="px-6 py-4 text-sm text-[#6B7280]">{aluno?.tipo || "—"}</td>
                            <td className="px-6 py-4">
                              <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium w-fit"
                                style={{ backgroundColor: badge.bg, color: badge.color }}>
                                {isAprovado && <Lock size={11} />}
                                {badge.label}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">

                                {/* Aprovado: só Ver, travado */}
                                {isAprovado && (
                                  <button onClick={() => navigate("/report/view/" + relatorio!.id)}
                                    className="bg-[#070738] text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2">
                                    <Eye size={14} /> Ver
                                  </button>
                                )}

                                {/* Publicado aguardando revisão: só Ver */}
                                {isPublished && (
                                  <button onClick={() => navigate("/report/view/" + relatorio!.id)}
                                    className="bg-[#7C3AED] text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2">
                                    <Eye size={14} /> Ver
                                  </button>
                                )}

                                {/* Revisão solicitada: Editar + Ver */}
                                {isRevisao && (
                                  <>
                                    <button onClick={() => navigate("/report/create/" + alunoId + "/" + relatorio!.id + "?period=" + encodeURIComponent(ciclo.periodo))}
                                      className="bg-[#DC2626] text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2">
                                      <Pencil size={14} /> Revisar
                                    </button>
                                    <button onClick={() => navigate("/report/view/" + relatorio!.id)}
                                      className="bg-[#F3F4F6] text-[#6B7280] px-3 py-2 rounded-lg text-sm flex items-center gap-2">
                                      <Eye size={14} />
                                    </button>
                                  </>
                                )}

                                {/* Rascunho: Continuar + Excluir */}
                                {isDraft && (
                                  <>
                                    <button onClick={() => navigate("/report/create/" + alunoId + "/" + relatorio!.id + "?period=" + encodeURIComponent(ciclo.periodo))}
                                      className="bg-[#F59E0B] text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2">
                                      <Pencil size={14} /> Continuar
                                    </button>
                                    <button onClick={() => handleExcluirDraft(relatorio!.id)}
                                      className="bg-[#FEE2E2] text-[#DC2626] px-3 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-[#DC2626] hover:text-white transition-colors">
                                      <Trash2 size={14} />
                                    </button>
                                  </>
                                )}

                                {/* Sem relatório: Criar */}
                                {!relatorio && (
                                  <button onClick={() => navigate("/report/create/" + alunoId + "?period=" + encodeURIComponent(ciclo.periodo))}
                                    className="bg-[#EC5800] text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2">
                                    <Plus size={14} /> Criar
                                  </button>
                                )}

                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
