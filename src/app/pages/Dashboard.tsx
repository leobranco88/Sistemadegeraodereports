import { useState, useEffect } from "react";
import { Header } from "../components/Header";
import { Copy, MessageCircle, Eye, Filter, AlertTriangle, Clock, CheckCircle, Trash2, ThumbsUp, RotateCcw, Lock, FlaskConical, FileText, BadgeCheck, Send } from "lucide-react";
import { db } from "../../firebase";
import { collection, getDocs, orderBy, query, deleteDoc, doc, updateDoc } from "firebase/firestore";

interface Relatorio {
  id: string;
  studentName: string;
  class: string;
  professorName: string;
  period: string;
  situation: string;
  reportLink: string;
  studentId: string;
  status: string;
  publishedAt?: string;
}

interface Ciclo {
  id: string;
  turma: string;
  professorNome: string;
  periodo: string;
  deadline: string;
  dataProva?: string;
  alunoIds: string[];
  alunosNomes: string[];
  status?: "ativo" | "teste_aplicado" | "relatorios_pendentes" | "agendamentos_abertos";
}

const STATUS_CICLO_CONFIG = {
  ativo:                { label: "Em andamento",          bg: "#DBEAFE", color: "#1D4ED8" },
  teste_aplicado:       { label: "Teste aplicado",        bg: "#FEF3C7", color: "#92400E" },
  relatorios_pendentes: { label: "Prontos p/ relatórios", bg: "#EDE9FE", color: "#5B21B6" },
  agendamentos_abertos: { label: "Agendamentos abertos",  bg: "#D1FAE5", color: "#065F46" },
};

export default function Dashboard() {
  const [relatorios, setRelatorios] = useState<Relatorio[]>([]);
  const [ciclos, setCiclos] = useState<Ciclo[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [filtroTurma, setFiltroTurma] = useState("");
  const [filtroProfessor, setFiltroProfessor] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");

  useEffect(() => {
    const buscarDados = async () => {
      try {
        const [snapRelatorios, snapCiclos] = await Promise.all([
          getDocs(query(collection(db, "reports"), orderBy("createdAt", "desc"))),
          getDocs(collection(db, "ciclos")),
        ]);
        const dadosRelatorios = snapRelatorios.docs.map(d => ({
          id: d.id,
          studentName: d.data().studentName || "",
          class: d.data().class || "",
          professorName: d.data().professorName || "",
          period: d.data().period || "",
          situation: d.data().situation || "",
          studentId: d.data().studentId || "",
          status: d.data().status || "",
          publishedAt: d.data().publishedAt?.toDate().toLocaleDateString("pt-BR") || "",
          reportLink: `https://eic-relatorios.vercel.app/report/view/${d.id}`,
        }));
        setRelatorios(dadosRelatorios);
        setCiclos(snapCiclos.docs.map(d => ({ id: d.id, ...d.data() })) as Ciclo[]);
      } catch (err) {
        console.error("Erro ao buscar dados:", err);
      } finally {
        setCarregando(false);
      }
    };
    buscarDados();
  }, []);

  const handleExcluir = async (relatorioId: string, nomeAluno: string) => {
    if (!confirm(`Excluir o relatório de ${nomeAluno}? Esta ação não pode ser desfeita.`)) return;
    try {
      await deleteDoc(doc(db, "reports", relatorioId));
      setRelatorios(prev => prev.filter(r => r.id !== relatorioId));
    } catch (err) {
      alert("Erro ao excluir relatório.");
    }
  };

  const handleAprovar = async (relatorioId: string, nomeAluno: string) => {
    if (!confirm(`Aprovar o relatório de ${nomeAluno}? Ele ficará travado para edição.`)) return;
    try {
      await updateDoc(doc(db, "reports", relatorioId), { status: "aprovado" });
      setRelatorios(prev => prev.map(r => r.id === relatorioId ? { ...r, status: "aprovado" } : r));
    } catch (err) {
      alert("Erro ao aprovar relatório.");
    }
  };

  const handleSolicitarRevisao = async (relatorioId: string, nomeAluno: string) => {
    if (!confirm(`Solicitar revisão do relatório de ${nomeAluno}? O professor receberá o aviso.`)) return;
    try {
      await updateDoc(doc(db, "reports", relatorioId), { status: "revisao_solicitada" });
      setRelatorios(prev => prev.map(r => r.id === relatorioId ? { ...r, status: "revisao_solicitada" } : r));
    } catch (err) {
      alert("Erro ao solicitar revisão.");
    }
  };

  // Retorna etapa do relatório de um aluno: 0=sem relatório, 1=rascunho, 2=aguardando revisão, 3=revisão solicitada, 4=aprovado, 5=publicado
  const getEtapaAluno = (alunoId: string, periodo: string): { etapa: number; label: string; bg: string; color: string } => {
    const rel = relatorios.find(r => r.studentId === alunoId && r.period === periodo);
    if (!rel) return { etapa: 0, label: "Sem relatório", bg: "#F3F4F6", color: "#9CA3AF" };
    switch (rel.status) {
      case "draft":               return { etapa: 1, label: "Rascunho",           bg: "#F3F4F6", color: "#6B7280" };
      case "published":           return { etapa: 2, label: "Ag. revisão",        bg: "#EDE9FE", color: "#7C3AED" };
      case "revisao_solicitada":  return { etapa: 3, label: "Revisão solicitada", bg: "#FEE2E2", color: "#DC2626" };
      case "aprovado":            return { etapa: 4, label: "Aprovado",           bg: "#D1FAE5", color: "#065F46" };
      default:                    return { etapa: 0, label: rel.status,           bg: "#F3F4F6", color: "#9CA3AF" };
    }
  };

  // Progresso do funil do ciclo
  const getFunilCiclo = (ciclo: Ciclo) => {
    const total = ciclo.alunoIds.length;
    let semRelatorio = 0, rascunho = 0, aguardando = 0, revisao = 0, aprovado = 0;
    ciclo.alunoIds.forEach(id => {
      const { etapa } = getEtapaAluno(id, ciclo.periodo);
      if (etapa === 0) semRelatorio++;
      else if (etapa === 1) rascunho++;
      else if (etapa === 2) aguardando++;
      else if (etapa === 3) revisao++;
      else if (etapa >= 4) aprovado++;
    });
    return { total, semRelatorio, rascunho, aguardando, revisao, aprovado };
  };

  const getStatusDeadline = (deadline: string) => {
    const hoje = new Date();
    const prazo = new Date(deadline);
    const diff = Math.ceil((prazo.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return { label: "Atrasado", bg: "#FEE2E2", color: "#DC2626", icon: <AlertTriangle size={14} /> };
    if (diff <= 2) return { label: `${diff}d restantes`, bg: "#FEF3C7", color: "#92400E", icon: <Clock size={14} /> };
    return { label: `${diff}d restantes`, bg: "#D1FAE5", color: "#065F46", icon: <CheckCircle size={14} /> };
  };

  const getInfoProva = (dataProva?: string) => {
    if (!dataProva) return null;
    const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
    const dataP = new Date(dataProva + "T00:00:00");
    const diff = Math.ceil((dataP.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
    const label = dataP.toLocaleDateString("pt-BR");
    if (diff > 0)  return { label: `Prova em ${label} (${diff}d)`, bg: "#DBEAFE", color: "#1D4ED8", realizada: false };
    if (diff === 0) return { label: `Prova hoje! ${label}`,         bg: "#FEF3C7", color: "#92400E", realizada: false };
    return           { label: `Prova realizada em ${label}`,        bg: "#D1FAE5", color: "#065F46", realizada: true };
  };

  const relatoriosFiltrados = relatorios.filter((r) => {
    const matchTurma = !filtroTurma || r.class.toLowerCase().includes(filtroTurma.toLowerCase());
    const matchProfessor = !filtroProfessor || r.professorName.toLowerCase().includes(filtroProfessor.toLowerCase());
    const matchStatus = !filtroStatus || r.status === filtroStatus;
    return matchTurma && matchProfessor && matchStatus;
  });

  const copiarLink = (link: string) => {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(link).then(() => alert("Link copiado!")).catch(() => {
        const el = document.createElement("textarea");
        el.value = link;
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
        alert("Link copiado!");
      });
    }
  };

  const enviarWhatsApp = (nome: string, link: string) => {
    const msg = encodeURIComponent(`Olá! Segue o relatório do(a) ${nome}: ${link}`);
    window.open(`https://wa.me/?text=${msg}`, "_blank");
  };

  const getSituacaoLabel = (situation: string) => {
    switch (situation) {
      case "approved":       return "Aprovado(a)";
      case "in-progress":    return "Em Progresso";
      case "needs-attention":return "Necessita Atenção";
      case "failed":         return "Reprovado(a)";
      default:               return situation;
    }
  };

  const getSituacaoCor = (situation: string) => {
    switch (situation) {
      case "approved":        return { bg: "#D1FAE5", color: "#065F46" };
      case "in-progress":     return { bg: "#FEF3C7", color: "#92400E" };
      case "needs-attention": return { bg: "#FEE2E2", color: "#DC2626" };
      case "failed":          return { bg: "#F3F4F6", color: "#6B7280" };
      default:                return { bg: "#F3F4F6", color: "#6B7280" };
    }
  };

  const getStatusRelatorio = (status: string) => {
    switch (status) {
      case "draft":              return { label: "Rascunho",          bg: "#F3F4F6", color: "#6B7280" };
      case "published":          return { label: "Aguardando revisão",bg: "#EDE9FE", color: "#7C3AED" };
      case "revisao_solicitada": return { label: "Revisão solicitada",bg: "#FEE2E2", color: "#DC2626" };
      case "aprovado":           return { label: "Aprovado",          bg: "#D1FAE5", color: "#065F46" };
      default:                   return { label: status,              bg: "#F3F4F6", color: "#6B7280" };
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F0F4F8" }}>
      <Header />
      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Painel de Ciclos */}
        {ciclos.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-bold mb-4" style={{ color: "#573000" }}>Ciclos em Andamento</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {ciclos.map(ciclo => {
                const prazo = getStatusDeadline(ciclo.deadline);
                const infoProva = getInfoProva(ciclo.dataProva);
                const statusCiclo = ciclo.status || "ativo";
                const statusConfig = STATUS_CICLO_CONFIG[statusCiclo as keyof typeof STATUS_CICLO_CONFIG];
                const funil = getFunilCiclo(ciclo);

                return (
                  <div key={ciclo.id} className="bg-white rounded-xl shadow-md p-5">

                    {/* Cabeçalho do card */}
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-bold text-sm" style={{ color: "#070738" }}>{ciclo.professorNome}</p>
                        <p className="text-xs mt-0.5" style={{ color: "#6B7280" }}>{ciclo.turma} · {ciclo.periodo}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="px-2 py-1 rounded-full text-xs font-medium"
                          style={{ backgroundColor: statusConfig.bg, color: statusConfig.color }}>
                          {statusConfig.label}
                        </span>
                        <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                          style={{ backgroundColor: prazo.bg, color: prazo.color }}>
                          {prazo.icon} {prazo.label}
                        </span>
                      </div>
                    </div>

                    {/* Badge data da prova */}
                    {infoProva && (
                      <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg mb-3 w-fit"
                        style={{ backgroundColor: infoProva.bg }}>
                        <FlaskConical size={12} style={{ color: infoProva.color }} />
                        <span className="text-xs font-medium" style={{ color: infoProva.color }}>
                          {infoProva.label}
                        </span>
                      </div>
                    )}

                    {/* Funil de progresso */}
                    <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: "#F8FAFC" }}>
                      <p className="text-xs font-semibold mb-2" style={{ color: "#3D3D3D" }}>Progresso dos relatórios</p>
                      <div className="grid grid-cols-4 gap-2 text-center">
                        {[
                          { icon: <FileText size={14} />,   label: "Rascunho",  count: funil.rascunho + funil.semRelatorio, color: "#9CA3AF", bg: "#F3F4F6" },
                          { icon: <Clock size={14} />,      label: "Ag. revisão", count: funil.aguardando + funil.revisao,    color: "#7C3AED", bg: "#EDE9FE" },
                          { icon: <BadgeCheck size={14} />, label: "Aprovado",  count: funil.aprovado,                       color: "#065F46", bg: "#D1FAE5" },
                          { icon: <Send size={14} />,       label: "Publicado", count: relatorios.filter(r => ciclo.alunoIds.includes(r.studentId) && r.period === ciclo.periodo && r.status === "published" && r.publishedAt).length, color: "#EC5800", bg: "#FFF7ED" },
                        ].map((item, i) => (
                          <div key={i} className="flex flex-col items-center gap-1 px-2 py-2 rounded-lg"
                            style={{ backgroundColor: item.bg }}>
                            <span style={{ color: item.color }}>{item.icon}</span>
                            <span className="text-lg font-bold leading-none" style={{ color: item.color }}>{item.count}</span>
                            <span className="text-xs leading-tight" style={{ color: item.color }}>{item.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Checklist por aluno */}
                    <div className="flex flex-col gap-1.5">
                      {ciclo.alunosNomes.map((nome, i) => {
                        const { label, bg, color } = getEtapaAluno(ciclo.alunoIds[i], ciclo.periodo);
                        return (
                          <div key={i} className="flex items-center justify-between px-3 py-1.5 rounded-lg"
                            style={{ backgroundColor: "#F8FAFC" }}>
                            <span className="text-sm" style={{ color: "#3D3D3D" }}>{nome}</span>
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium"
                              style={{ backgroundColor: bg, color }}>
                              {label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter size={20} style={{ color: "#8B5CF6" }} />
            <h2 className="text-lg font-medium" style={{ color: "#573000" }}>Filtros</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "#3D3D3D" }}>Turma</label>
              <input type="text" value={filtroTurma} onChange={(e) => setFiltroTurma(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                style={{ borderColor: "#E5E7EB" }} placeholder="Ex: Teens 5" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "#3D3D3D" }}>Professor</label>
              <input type="text" value={filtroProfessor} onChange={(e) => setFiltroProfessor(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                style={{ borderColor: "#E5E7EB" }} placeholder="Ex: Prof. João" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "#3D3D3D" }}>Status</label>
              <select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                style={{ borderColor: "#E5E7EB" }}>
                <option value="">Todos</option>
                <option value="draft">Rascunho</option>
                <option value="published">Aguardando revisão</option>
                <option value="revisao_solicitada">Revisão solicitada</option>
                <option value="aprovado">Aprovado</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tabela */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {carregando ? (
            <div className="text-center py-12">
              <div className="w-10 h-10 border-4 border-[#EC5800] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p style={{ color: "#3D3D3D" }}>Carregando relatórios...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead style={{ backgroundColor: "#070738" }}>
                  <tr>
                    <th className="px-6 py-4 text-left text-white">Aluno</th>
                    <th className="px-6 py-4 text-left text-white">Turma</th>
                    <th className="px-6 py-4 text-left text-white">Professor</th>
                    <th className="px-6 py-4 text-left text-white">Período</th>
                    <th className="px-6 py-4 text-left text-white">Publicado em</th>
                    <th className="px-6 py-4 text-left text-white">Situação</th>
                    <th className="px-6 py-4 text-left text-white">Status</th>
                    <th className="px-6 py-4 text-left text-white">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {relatoriosFiltrados.map((r, index) => {
                    const cor = getSituacaoCor(r.situation);
                    const statusRel = getStatusRelatorio(r.status);
                    const podeAvaliar = r.status === "published";
                    const aprovado = r.status === "aprovado";
                    return (
                      <tr key={r.id} style={{
                        backgroundColor: index % 2 === 0 ? "#FFFFFF" : "#F9FAFB",
                        borderBottom: "1px solid #E5E7EB"
                      }}>
                        <td className="px-6 py-4" style={{ color: "#3D3D3D" }}>{r.studentName}</td>
                        <td className="px-6 py-4" style={{ color: "#3D3D3D" }}>{r.class}</td>
                        <td className="px-6 py-4" style={{ color: "#3D3D3D" }}>{r.professorName}</td>
                        <td className="px-6 py-4" style={{ color: "#3D3D3D" }}>{r.period}</td>
                        <td className="px-6 py-4" style={{ color: r.publishedAt ? "#3D3D3D" : "#9CA3AF" }}>
                          {r.publishedAt || "—"}
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 rounded-full text-sm font-medium"
                            style={{ backgroundColor: cor.bg, color: cor.color }}>
                            {getSituacaoLabel(r.situation)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium w-fit"
                            style={{ backgroundColor: statusRel.bg, color: statusRel.color }}>
                            {aprovado && <Lock size={11} />}
                            {statusRel.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            <button onClick={() => copiarLink(r.reportLink)}
                              className="p-2 rounded-lg hover:bg-gray-100 transition-colors" title="Copiar link"
                              style={{ color: "#8B5CF6" }}><Copy size={16} /></button>
                            <button onClick={() => enviarWhatsApp(r.studentName, r.reportLink)}
                              className="p-2 rounded-lg hover:bg-gray-100 transition-colors" title="Enviar WhatsApp"
                              style={{ color: "#10B981" }}><MessageCircle size={16} /></button>
                            <button onClick={() => window.open(r.reportLink, "_blank")}
                              className="p-2 rounded-lg hover:bg-gray-100 transition-colors" title="Ver relatório"
                              style={{ color: "#EC5800" }}><Eye size={16} /></button>
                            {podeAvaliar && (
                              <>
                                <button onClick={() => handleAprovar(r.id, r.studentName)}
                                  className="p-2 rounded-lg hover:bg-green-50 transition-colors" title="Aprovar relatório"
                                  style={{ color: "#065F46" }}><ThumbsUp size={16} /></button>
                                <button onClick={() => handleSolicitarRevisao(r.id, r.studentName)}
                                  className="p-2 rounded-lg hover:bg-yellow-50 transition-colors" title="Solicitar revisão"
                                  style={{ color: "#92400E" }}><RotateCcw size={16} /></button>
                              </>
                            )}
                            {!aprovado && (
                              <button onClick={() => handleExcluir(r.id, r.studentName)}
                                className="p-2 rounded-lg hover:bg-red-50 transition-colors" title="Excluir relatório"
                                style={{ color: "#DC2626" }}><Trash2 size={16} /></button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {relatoriosFiltrados.length === 0 && (
                <div className="text-center py-12" style={{ color: "#3D3D3D" }}>
                  Nenhum relatório encontrado.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
