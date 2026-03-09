import { useState, useEffect } from "react";
import { Header } from "../components/Header";
import { Copy, MessageCircle, Eye, Filter } from "lucide-react";
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
}

export default function Dashboard() {
  const [relatorios, setRelatorios] = useState<Relatorio[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [filtroTurma, setFiltroTurma] = useState("");
  const [filtroProfessor, setFiltroProfessor] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");

  useEffect(() => {
    const buscarRelatorios = async () => {
      try {
        const q = query(collection(db, "reports"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        const dados = snapshot.docs.map(doc => ({
          id: doc.id,
          studentName: doc.data().studentName || "",
          class: doc.data().class || "",
          professorName: doc.data().professorName || "",
          period: doc.data().period || "",
          situation: doc.data().situation || "",
          reportLink: `https://studentprogressreportdesign.vercel.app?reportId=${doc.id}`,
        }));
        setRelatorios(dados);
      } catch (err) {
        console.error("Erro ao buscar relatórios:", err);
      } finally {
        setCarregando(false);
      }
    };
    buscarRelatorios();
  }, []);

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
