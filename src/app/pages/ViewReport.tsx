import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Logo } from "../components/Logo";
import { ArrowLeft, Download, QrCode } from "lucide-react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";
import { db } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";

export function ViewReport() {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const buscarRelatorio = async () => {
      if (!reportId) { setLoading(false); return; }
      try {
        const docSnap = await getDoc(doc(db, "reports", reportId));
        if (docSnap.exists()) {
          setReport({ id: docSnap.id, ...docSnap.data() });
        }
      } catch (err) {
        console.error("Erro ao buscar relatório:", err);
      } finally {
        setLoading(false);
      }
    };
    buscarRelatorio();
  }, [reportId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0F4F8] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[#EC5800] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#3D3D3D]">Carregando relatório...</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-[#F0F4F8] flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-[#070738]">Relatório não encontrado</p>
          <button onClick={() => navigate("/professor")} className="mt-4 text-[#EC5800]">Voltar</button>
        </div>
      </div>
    );
  }

  const radarData = (report.competencies || []).map((comp: any) => ({
    subject: comp.name.split(' ')[0],
    value: comp.rating,
    fullMark: 5,
  }));

  const averageRating = report.competencies?.length
    ? report.competencies.reduce((sum: number, c: any) => sum + c.rating, 0) / report.competencies.length
    : 0;

  const getSituationColor = (situation: string) => {
    switch (situation) {
      case "approved": return "text-[#16A34A] bg-[#16A34A] bg-opacity-10";
      case "in-progress": return "text-[#F5A623] bg-[#F5A623] bg-opacity-10";
      case "needs-attention": return "text-[#EC5800] bg-[#EC5800] bg-opacity-10";
      case "failed": return "text-[#DC2626] bg-[#DC2626] bg-opacity-10";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const getSituationLabel = (situation: string) => {
    switch (situation) {
      case "approved": return "Aprovado(a)";
      case "in-progress": return "Em Progresso";
      case "needs-attention": return "Necessita Atenção";
      case "failed": return "Reprovado(a)";
      default: return situation;
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return "bg-[#16A34A]";
    if (rating >= 3.5) return "bg-[#F5A623]";
    if (rating >= 2.5) return "bg-[#EC5800]";
    return "bg-[#DC2626]";
  };

  return (
    <div className="min-h-screen bg-[#F0F4F8]">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Logo />
            <div className="flex gap-3">
              <button onClick={() => alert("Download PDF - em breve!")}
                className="flex items-center gap-2 px-4 py-2 bg-[#EC5800] text-white rounded-lg hover:bg-[#d84f00] transition-colors">
                <Download className="w-5 h-5" /> Baixar PDF
              </button>
              <button onClick={() => navigate("/professor")}
                className="flex items-center gap-2 text-[#9CA3AF] hover:text-[#EC5800] transition-colors">
                <ArrowLeft className="w-5 h-5" /> Voltar
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl text-[#070738] mb-2">{report.studentName}</h1>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-[#070738] text-white">{report.class}</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-[#EC5800] bg-opacity-10 text-[#EC5800]">
                  {report.classType === "regular" ? "Regular" : report.classType === "intensive" ? "Intensivo" : "Particular"}
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700">{report.period}</span>
              </div>
            </div>
            <div className="w-24 h-24 border-2 border-[#070738] rounded-lg flex items-center justify-center">
              <QrCode className="w-16 h-16 text-[#070738]" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-[#9CA3AF]">Professor: </span><span className="text-[#3D3D3D]">{report.professorName}</span></div>
            <div><span className="text-[#9CA3AF]">Coordenador: </span><span className="text-[#3D3D3D]">{report.coordinator}</span></div>
            <div><span className="text-[#9CA3AF]">Ciclo: </span><span className="text-[#3D3D3D]">{report.evaluation}</span></div>
          </div>
        </div>

        {report.cycleFocus && (
          <div className="bg-[#070738] text-white rounded-xl shadow-sm p-8 mb-6">
            <h2 className="text-xl mb-3">Foco do Ciclo</h2>
            <p className="text-gray-200 leading-relaxed">{report.cycleFocus}</p>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
          <h2 className="text-2xl text-[#070738] mb-6">Snapshot de Desempenho</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-sm text-[#9CA3AF] mb-2">Frequência</p>
              <p className="text-4xl text-[#070738]">{report.attendance}%</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-[#9CA3AF] mb-2">Nota do Teste</p>
              <p className="text-4xl text-[#070738]">{report.testScore}%</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-[#9CA3AF] mb-2">Situação</p>
              <p className={`inline-flex items-center px-4 py-2 rounded-full text-sm ${getSituationColor(report.situation)}`}>
                {getSituationLabel(report.situation)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-[#9CA3AF] mb-2">Nível CEFR</p>
              <p className="text-4xl text-[#070738]">{report.cefrLevel}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
          <h2 className="text-2xl text-[#070738] mb-6">Perfil de Competências</h2>
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="#E5E7EB" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#3D3D3D', fontSize: 12 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 5]} tick={{ fill: '#9CA3AF' }} />
                  <Radar name="Avaliação" dataKey="value" stroke="#EC5800" fill="#EC5800" fillOpacity={0.6} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col items-center justify-center">
              <p className="text-sm text-[#9CA3AF] mb-2">Média Geral</p>
              <p className="text-6xl text-[#EC5800] mb-4">{averageRating.toFixed(1)}</p>
              <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                <div className={`h-3 rounded-full ${getRatingColor(averageRating)}`}
                  style={{ width: `${(averageRating / 5) * 100}%` }} />
              </div>
              <p className="text-sm text-[#3D3D3D]">de 5.0</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
          <h2 className="text-2xl text-[#070738] mb-6">Avaliação Detalhada por Competência</h2>
          <div className="space-y-6">
            {(report.competencies || []).map((comp: any) => (
              <div key={comp.id} className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg text-[#070738]">{comp.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl text-[#EC5800]">{comp.rating}</span>
                    <span className="text-sm text-[#9CA3AF]">/5</span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
                  <div className={`h-2 rounded-full ${getRatingColor(comp.rating)}`}
                    style={{ width: `${(comp.rating / 5) * 100}%` }} />
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                  <div><h4 className="text-sm text-[#EC5800] mb-2">O que vejo</h4><p className="text-sm text-[#3D3D3D] leading-relaxed">{comp.whatISee}</p></div>
                  <div><h4 className="text-sm text-[#EC5800] mb-2">Por que importa</h4><p className="text-sm text-[#3D3D3D] leading-relaxed">{comp.whyItMatters}</p></div>
                  <div><h4 className="text-sm text-[#EC5800] mb-2">O que fazer</h4><p className="text-sm text-[#3D3D3D] leading-relaxed">{comp.whatToDo}</p></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {report.professorVoice && (
          <div className="bg-[#070738] text-white rounded-xl shadow-sm p-8 mb-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-[#EC5800] flex items-center justify-center flex-shrink-0">
                <span className="text-xl">{report.professorName?.[0]}</span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg mb-2">Mensagem do Professor</h3>
                <p className="text-gray-200 leading-relaxed">{report.professorVoice}</p>
                <p className="text-sm text-gray-400 mt-4">— {report.professorName}</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm p-8">
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div className="text-center">
              <div className="border-t-2 border-gray-300 pt-2 mb-2">
                <p className="text-sm text-[#3D3D3D]">{report.coordinator}</p>
              </div>
              <p className="text-xs text-[#9CA3AF]">Coordenador</p>
            </div>
            <div className="text-center">
              <div className="border-t-2 border-gray-300 pt-2 mb-2">
                <p className="text-sm text-[#3D3D3D]">{report.professorName}</p>
              </div>
              <p className="text-xs text-[#9CA3AF]">Professor</p>
            </div>
            <div className="text-center">
              <div className="border-t-2 border-gray-300 pt-2 mb-2">
                <p className="text-sm text-[#3D3D3D]">_____________________</p>
              </div>
              <p className="text-xs text-[#9CA3AF]">Responsável</p>
            </div>
          </div>
          <div className="text-center pt-6 border-t border-gray-200">
            <p className="text-sm text-[#3D3D3D] mb-1">EIC School — English is Cool</p>
            <p className="text-xs text-[#9CA3AF]">contato@eicschool.com | (11) 9999-9999</p>
          </div>
        </div>
      </div>
    </div>
  );
}
