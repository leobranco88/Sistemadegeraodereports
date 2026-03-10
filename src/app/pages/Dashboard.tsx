import { useState, useEffect } from "react";
import { Header } from "../components/Header";
import { Copy, MessageCircle, Eye, Filter, AlertTriangle, Clock, CheckCircle } from "lucide-react";
import { db } from "../../firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";

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
  alunoIds: string[];
  alunosNomes: string[];
}

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
        const dadosRelatorios = snapRelatorios.docs.map(doc => ({
          id: doc.id,
          studentName: doc.data().studentName || "",
          class: doc.data().class || "",
          professorName: doc.data().professorName || "",
          period: doc.data().period || "",
          situation: doc.data().situation || "",
          studentId: doc.data().studentId || "",
          status: doc.data().status || "",
          publishedAt: doc.data().publishedAt?.toDate().toLocaleDateString("pt-BR") || "",
         reportLink: `https://eic-relatorios.vercel.app/report/view/${doc.id}`,
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

  const getProgressoCiclo = (ciclo: Ciclo) => {
    const total = ciclo.alunoIds.length;
    const feitos = ciclo.alunoIds.filter(alunoId =>
      relatorios.some(r =>
        r.studentId === alunoId && r.status === "published" && r.period === ciclo.periodo
      )
    ).length;
    return { feitos, total, pct: total > 0 ? Math.min(Math.round((feitos / total) * 100), 100) : 0 };
  };

  const getStatusDeadline = (deadline: string) => {
    const hoje = new Date();
    const prazo = new Date(deadline);
    const diff = Math.ceil((prazo.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return { label: "Atrasado", bg: "#FEE2E2", color: "#DC2626", icon: <AlertTriangle size={14} /> };
    if (diff <= 2) return { label: `${diff}d restantes`, bg: "#FEF3C7", color: "#92400E", icon: <Clock size={14} /> };
    return { label: `${diff}d restantes`, bg: "#D1FAE5", color: "#065F46", icon: <CheckCircle size={14} /> };
  };

  const relatoriosFiltrados = relatorios.filter((r) => {
    const matchTurma = !filtroTurma || r.class.toLowerCase().includes(filtroTurma.toLowerCase());
    const matchProfessor = !filtroProfessor || r.professorName.toLowerCase().includes(filtroProfessor.toLowerCase());
    const matchStatus = !filtroStatus || r.situation === filtroStatus;
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
      case "approved": return "Aprovado(a)";
      case "in-progress": return "Em Progresso";
      case "needs-attention": return "Necessita Atenção";
      case "failed": return "Reprovado(a)";
      default: return situation;
    }
  };

  const getSituacaoCor = (situation: string) => {
    switch (situation) {
      case "approved": return { bg: "#D1FAE5", color: "#065F46" };
      case "in-progress": return { bg: "#FEF3C7", color: "#92400E" };
      case "needs-attention": return { bg: "#FEE2E2", color: "#DC2626" };
      case "failed": return { bg: "#F3F4F6", color: "#6B7280" };
      default: return { bg: "#F3F4F6", color: "#6B7280" };
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ciclos.map(ciclo => {
                const { feitos, total, pct } = getProgressoCiclo(ciclo);
                const prazo = getStatusDeadline(ciclo.deadline);
                const concluido = feitos === total;
                return (
                  <div key={ciclo.id} className="bg-white rounded-lg shadow-md p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-bold text-sm" style={{ color: "#070738" }}>{ciclo.professorNome}</p>
                        <p className="text-xs mt-0.5" style={{ color: "#6B7280" }}>{ciclo.turma} · {ciclo.periodo}</p>
                      </div>
                      <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                        style={{ backgroundColor: prazo.bg, color: prazo.color }}>
                        {prazo.icon} {prazo.label}
                      </span>
                    </div>
                    <div className="mb-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span style={{ color: "#3D3D3D" }}>Publicados</span>
                        <span className="font-medium" style={{ color: concluido ? "#065F46" : "#EC5800" }}>
                          {feitos}/{total} ({pct}%)
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full" style={{ backgroundColor: "#F0F4F8" }}>
                        <div className="h-1.5 rounded-full transition-all"
                          style={{ width: `${pct}%`, backgroundColor: concluido ? "#10B981" : "#EC5800" }} />
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {ciclo.alunosNomes.map((nome, i) => {
                        const rel = relatorios.find(r => r.studentId === ciclo.alunoIds[i] && r.period === ciclo.periodo);
                        const publicado = rel?.status === "published";
                        return (
                          <span key={i} className="px-2 py-0.5 rounded-full text-xs"
                            style={{ backgroundColor: publicado ? "#D1FAE5" : "#F3F4F6", color: publicado ? "#065F46" : "#6B7280" }}>
                            {publicado ? "✓" : "○"} {nome}
                            {publicado && rel?.publishedAt ? <span style={{ color: "#9CA3AF" }}> · {rel.publishedAt}</span> : null}
                          </span>
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
                <option value="approved">Aprovado(a)</option>
                <option value="in-progress">Em Progresso</option>
                <option value="needs-attention">Necessita Atenção</option>
                <option value="failed">Reprovado(a)</option>
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
                    <th className="px-6 py-4 text-left text-white">Status</th>
                    <th className="px-6 py-4 text-left text-white">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {relatoriosFiltrados.map((r, index) => {
                    const cor = getSituacaoCor(r.situation);
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
                          <div className="flex items-center gap-2">
                            <button onClick={() => copiarLink(r.reportLink)}
                              className="p-2 rounded-lg hover:bg-gray-100 transition-colors" title="Copiar link"
                              style={{ color: "#8B5CF6" }}><Copy size={18} /></button>
                            <button onClick={() => enviarWhatsApp(r.studentName, r.reportLink)}
                              className="p-2 rounded-lg hover:bg-gray-100 transition-colors" title="Enviar WhatsApp"
                              style={{ color: "#10B981" }}><MessageCircle size={18} /></button>
                            <button onClick={() => window.open(r.reportLink, "_blank")}
                              className="p-2 rounded-lg hover:bg-gray-100 transition-colors" title="Ver relatório"
                              style={{ color: "#EC5800" }}><Eye size={18} /></button>
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
