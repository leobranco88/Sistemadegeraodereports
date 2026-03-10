import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { db } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";
import { Download } from "lucide-react";
import { Logo } from "../components/Logo";
import { Radar, RadarChart as RechartsRadar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from "recharts";
import { QRCodeSVG } from "qrcode.react";
import { Heart, Award, Users, BookOpen, Target, Sparkles, Quote, User, Star, CheckCircle, BarChart2 } from "lucide-react";

function StatCards({ attendance, testScore, situation, cefrLevel }: { attendance: number; testScore: number; situation: string; cefrLevel: string }) {
  const getSituacaoLabel = (s: string) => {
    switch (s) {
      case "approved": return "Aprovado(a)";
      case "in-progress": return "Em Progresso";
      case "needs-attention": return "Necessita Atenção";
      case "failed": return "Reprovado(a)";
      default: return s;
    }
  };
  const stats = [
    { label: "FREQUÊNCIA", value: `${attendance}%`, icon: User, bgColor: "bg-orange-50", iconColor: "text-[#EC5800]" },
    { label: "NOTA DO TESTE", value: `${testScore}%`, icon: Star, bgColor: "bg-yellow-50", iconColor: "text-[#F5A623]" },
    { label: "SITUAÇÃO", value: getSituacaoLabel(situation), icon: CheckCircle, bgColor: "bg-green-50", iconColor: "text-[#16A34A]" },
    { label: "NÍVEL CEFR", value: cefrLevel, icon: BarChart2, bgColor: "bg-blue-50", iconColor: "text-blue-600" },
  ];
  return (
    <div className="grid grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div key={stat.label} className="bg-white rounded-2xl shadow-sm p-6">
            <div className={`w-10 h-10 ${stat.bgColor} rounded-lg flex items-center justify-center mb-4`}>
              <Icon className={`w-5 h-5 ${stat.iconColor}`} />
            </div>
            <div className="text-[11px] text-[#9CA3AF] uppercase tracking-widest mb-1">{stat.label}</div>
            <div className="text-2xl font-bold text-[#070738]">{stat.value}</div>
          </div>
        );
      })}
    </div>
  );
}

function ProgressLegend() {
  const levels = [
    { color: "#16A34A", label: "Excelente", range: "80-100%" },
    { color: "#EC5800", label: "Bom", range: "60-79%" },
    { color: "#F5A623", label: "Regular", range: "40-59%" },
    { color: "#EF4444", label: "Precisa Melhorar", range: "0-39%" },
  ];
  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-100">
      <h4 className="text-xs font-semibold text-[#070738] uppercase tracking-widest mb-3">Legenda de Desempenho</h4>
      <div className="grid grid-cols-4 gap-3">
        {levels.map((level) => (
          <div key={level.label} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: level.color }} />
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-[#070738]">{level.label}</span>
              <span className="text-[10px] text-[#9CA3AF]">{level.range}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RadarChartSection({ competencies }: { competencies: any[] }) {
  const shortName = (name: string) => {
    const map: Record<string, string> = {
      "Comportamento e Compromisso": "Comportamento",
      "Organização e Responsabilidade": "Organização",
      "Fala e Comunicação": "Fala",
      "Gramática e Vocabulário": "Gramática",
      "Compreensão Auditiva": "Compreensão",
      "Leitura e Escrita": "Leitura",
    };
    return map[name] || name.split(" ")[0];
  };
  const data = competencies.map((c) => ({ skill: shortName(c.name), nota: c.rating }));
  const media = competencies.length > 0
    ? (competencies.reduce((sum, c) => sum + c.rating, 0) / competencies.length).toFixed(1)
    : "0";
  return (
    <div className="bg-white rounded-2xl shadow-sm p-8">
      <h2 className="text-xl font-bold text-[#070738] mb-6">Perfil de Competências</h2>
      <div className="grid grid-cols-2 gap-8">
        <div className="w-full h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsRadar data={data}>
              <PolarGrid stroke="#E5E7EB" />
              <PolarAngleAxis dataKey="skill" tick={{ fill: "#6B7280", fontSize: 11 }} />
              <Radar name="Nota" dataKey="nota" stroke="#EC5800" fill="#EC5800" fillOpacity={0.3} strokeWidth={2} />
            </RechartsRadar>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-col justify-center gap-4">
          <div className="flex items-center gap-2 text-sm text-[#9CA3AF]">
            <div className="w-4 h-4 bg-[#EC5800] rounded opacity-60"></div>
            <span>Desempenho por competência (1–5)</span>
          </div>
          <div className="bg-orange-50 rounded-xl p-4 border-l-4 border-[#EC5800] mt-4">
            <div className="text-[11px] text-[#9CA3AF] uppercase tracking-widest mb-1">MÉDIA GERAL</div>
            <div className="text-2xl font-bold text-[#EC5800]">{media}</div>
            <div className="text-xs text-[#9CA3AF] mt-1">de 5.0</div>
          </div>
          <div className="space-y-2 mt-2">
            {competencies.map((c) => (
              <div key={c.id} className="flex items-center justify-between text-sm">
                <span className="text-[#6B7280]">{shortName(c.name)}</span>
                <span className="font-semibold text-[#070738]">{c.rating}/5</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function getProgressColor(pct: number) {
  if (pct >= 80) return { barColor: "#16A34A", badgeColor: "bg-[#16A34A]", label: "Excelente" };
  if (pct >= 60) return { barColor: "#EC5800", badgeColor: "bg-[#EC5800]", label: "Bom" };
  if (pct >= 40) return { barColor: "#F5A623", badgeColor: "bg-[#F5A623]", label: "Regular" };
  return { barColor: "#EF4444", badgeColor: "bg-[#EF4444]", label: "Precisa Melhorar" };
}

function CompetencyCard({ title, score, maxScore, whatISee, whyItMatters, whatToDo }: any) {
  const percentage = (score / maxScore) * 100;
  const { barColor, badgeColor, label } = getProgressColor(percentage);
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-[#070738]">{title}</h3>
        <div className="flex items-center gap-2">
          <span className={`${badgeColor} text-white px-3 py-1 rounded-lg font-bold text-sm`}>{score}/{maxScore}</span>
          <span className="text-xs text-[#9CA3AF] font-medium">({label})</span>
        </div>
      </div>
      <div className="w-full h-2 bg-[#F0F4F8] rounded-full overflow-hidden mb-6">
        <div className="h-full rounded-full transition-all duration-300" style={{ width: `${percentage}%`, backgroundColor: barColor }} />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <div className="text-[11px] text-[#9CA3AF] uppercase tracking-widest mb-2">O QUE VEJO</div>
          <p className="text-sm text-[#6B7280] italic leading-relaxed">{whatISee}</p>
        </div>
        <div>
          <div className="text-[11px] text-[#EC5800] uppercase tracking-widest mb-2">POR QUE IMPORTA</div>
          <p className="text-sm text-[#6B7280] italic leading-relaxed">{whyItMatters}</p>
        </div>
        <div>
          <div className="text-[11px] text-[#070738] uppercase tracking-widest mb-2">O QUE FAZER</div>
          <p className="text-sm text-[#070738] leading-relaxed">{whatToDo}</p>
        </div>
      </div>
    </div>
  );
}

function TeacherVoice({ message, professorName }: { message: string; professorName: string }) {
  const initials = professorName.split(" ").filter(Boolean).slice(0, 2).map((n: string) => n[0].toUpperCase()).join("");
  return (
    <div className="bg-[#070738] rounded-2xl shadow-lg p-8 border-l-8 border-[#EC5800] relative overflow-hidden">
      <Quote className="absolute top-4 right-4 w-16 h-16 text-[#EC5800] opacity-20" />
      <h3 className="text-xl font-bold text-white mb-4">Voz do Professor</h3>
      <p className="text-white text-base italic leading-relaxed mb-6">"{message}"</p>
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-[#EC5800] rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-lg">{initials}</span>
        </div>
        <div>
          <div className="text-white font-semibold">{professorName}</div>
          <div className="text-[#9CA3AF] text-sm">Professor(a)</div>
        </div>
      </div>
    </div>
  );
}

function SignatureSection({ reportId }: { reportId: string }) {
  const reportUrl = `https://eic-relatorios.vercel.app/report/view/${reportId}`;
  return (
    <div className="grid grid-cols-4 gap-4">
      <div className="bg-white rounded-2xl shadow-sm p-6 flex items-center justify-center">
        <QRCodeSVG value={reportUrl} size={120} level="H" includeMargin={true} />
      </div>
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="text-[11px] text-[#9CA3AF] uppercase tracking-widest mb-3">COORDENAÇÃO</div>
        <div className="border-b-2 border-[#070738] mb-2 pb-6"></div>
        <div className="text-sm font-semibold text-[#070738]">Leonardo Branco Costa</div>
        <div className="text-xs text-[#9CA3AF]">Coordenador Pedagógico</div>
      </div>
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="text-[11px] text-[#9CA3AF] uppercase tracking-widest mb-3">RESPONSÁVEL</div>
        <div className="border-b-2 border-[#070738] mb-2 pb-6"></div>
        <div className="text-sm font-semibold text-[#070738]">Assinatura</div>
        <div className="text-xs text-[#9CA3AF]">Pai/Mãe/Responsável</div>
      </div>
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="text-[11px] text-[#9CA3AF] uppercase tracking-widest mb-3">DATA</div>
        <div className="border-b-2 border-[#070738] mb-2 pb-6"></div>
        <div className="text-sm font-semibold text-[#070738]">___/___/2026</div>
        <div className="text-xs text-[#9CA3AF]">Data da assinatura</div>
      </div>
    </div>
  );
}

// ✅ ATUALIZADO: redireciona para /agendar em vez de abrir WhatsApp
function MeetingSchedule({ studentName, professorId, reportId }: { studentName: string; professorId: string; reportId: string }) {
  const [selected, setSelected] = useState<"sim" | "nao" | null>(null);

  const handleSim = () => {
    setSelected("sim");
    const params = new URLSearchParams({ aluno: studentName, reportId });
    window.location.href = `/agendar/${professorId}?${params.toString()}`;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-[#070738] mb-2">Agendar Reunião?</h3>
      <p className="text-sm text-[#9CA3AF] mb-4">Gostaria de agendar uma reunião para discutir o progresso do aluno?</p>
      <div className="flex gap-3">
        <button
          onClick={handleSim}
          className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
            selected === "sim" ? "bg-[#EC5800] text-white shadow-md" : "bg-[#F0F4F8] text-[#9CA3AF] hover:bg-[#E5E7EB]"
          }`}
        >
          Sim
        </button>
        <button
          onClick={() => setSelected("nao")}
          className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
            selected === "nao" ? "bg-[#EC5800] text-white shadow-md" : "bg-[#F0F4F8] text-[#9CA3AF] hover:bg-[#E5E7EB]"
          }`}
        >
          Não
        </button>
      </div>
      {selected === "nao" && (
        <p className="text-xs text-[#9CA3AF] mt-3 text-center">
          Tudo bem! O relatório fica disponível para consulta a qualquer momento.
        </p>
      )}
    </div>
  );
}

function Footer() {
  const values = [
    { icon: Heart, label: "Respeito" },
    { icon: Award, label: "Excelência" },
    { icon: Users, label: "Colaboração" },
    { icon: BookOpen, label: "Aprendizado" },
    { icon: Target, label: "Foco" },
    { icon: Sparkles, label: "Criatividade" },
  ];
  return (
    <div className="space-y-0">
      <div className="bg-white px-8 py-6 flex items-center justify-around">
        {values.map((value) => {
          const Icon = value.icon;
          return (
            <div key={value.label} className="flex flex-col items-center gap-2">
              <Icon className="w-6 h-6 text-[#EC5800]" />
              <span className="text-xs text-[#9CA3AF] font-semibold">{value.label}</span>
            </div>
          );
        })}
      </div>
      <div className="bg-[#EC5800] px-8 py-4 flex items-center justify-between">
        <span className="text-white text-sm font-semibold">EIC - Escola de Idiomas e Cultura</span>
        <span className="text-white text-sm">(11) 95354-1126</span>
        <span className="text-white text-sm">Rua dos Encanadores, 332 - Jardim Europa</span>
      </div>
    </div>
  );
}

export function ViewReport() {
  const { reportId } = useParams();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const buscar = async () => {
      if (!reportId) { setLoading(false); return; }
      try {
        const docSnap = await getDoc(doc(db, "reports", reportId));
        if (docSnap.exists()) setReport({ id: docSnap.id, ...docSnap.data() });
      } catch (err) {
        console.error("Erro ao buscar relatório:", err);
      } finally {
        setLoading(false);
      }
    };
    buscar();
  }, [reportId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0F4F8] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#EC5800] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#070738] text-lg">Carregando relatório...</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-[#F0F4F8] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8 bg-white rounded-xl shadow-sm">
          <p className="text-4xl mb-4">📄</p>
          <h2 className="text-xl text-[#070738] mb-2">Relatório não encontrado</h2>
        </div>
      </div>
    );
  }

  const competencies1 = (report.competencies || []).slice(0, 2).map((c: any) => ({
    title: c.name, score: c.rating, maxScore: 5,
    whatISee: c.whatISee, whyItMatters: c.whyItMatters, whatToDo: c.whatToDo,
  }));

  const competencies2 = (report.competencies || []).slice(2).map((c: any) => ({
    title: c.name, score: c.rating, maxScore: 5,
    whatISee: c.whatISee, whyItMatters: c.whyItMatters, whatToDo: c.whatToDo,
  }));

  return (
    <div className="min-h-screen bg-[#F0F4F8] py-8 px-4">
      <div className="max-w-[210mm] mx-auto mb-4">
        <div className="bg-white rounded-lg shadow-sm px-8 py-4 flex items-center justify-between">
          <Logo />
          <button
            onClick={() => window.print()}
            className="bg-[#EC5800] text-white px-6 py-2.5 rounded-lg font-semibold flex items-center gap-2 hover:bg-[#d64f00] transition-colors"
          >
            <Download className="w-4 h-4" />
            Exportar PDF
          </button>
        </div>
      </div>

      <div className="max-w-[210mm] mx-auto space-y-8">
        {/* Página 1 */}
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="bg-white shadow-sm px-8 py-6 border-b">
            <h1 className="text-3xl font-bold text-[#070738] mb-2">Relatório do Aluno — {report.studentName}</h1>
            <p className="text-[#9CA3AF] text-base mb-4">
              {report.classType === "regular" ? "Regular" : report.classType === "intensive" ? "Intensivo" : "Particular"} · {report.class} · {report.period}
            </p>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#9CA3AF]">Avaliação {report.evaluation}</span>
                <span className="text-[#EC5800] font-semibold">{report.evaluation === "2 de 2 ciclos" ? "100%" : "50%"}</span>
              </div>
              <div className="w-full h-2 bg-[#F0F4F8] rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: report.evaluation === "2 de 2 ciclos" ? "100%" : "50%", background: "linear-gradient(90deg, #EC5800, #070738)" }} />
              </div>
            </div>
          </div>
          <div className="p-8 space-y-6">
            <StatCards attendance={report.attendance} testScore={report.testScore} situation={report.situation} cefrLevel={report.cefrLevel} />
            <ProgressLegend />
            <RadarChartSection competencies={report.competencies || []} />
            <div>
              <h2 className="text-xl font-bold text-[#070738] mb-4">Avaliação por Competência</h2>
              <div className="space-y-4">
                {competencies1.map((comp: any) => <CompetencyCard key={comp.title} {...comp} />)}
              </div>
            </div>
          </div>
        </div>

        {/* Página 2 */}
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="p-8 space-y-6">
            <div className="space-y-4">
              {competencies2.map((comp: any) => <CompetencyCard key={comp.title} {...comp} />)}
            </div>
            <TeacherVoice message={report.professorVoice} professorName={report.professorName} />
            <SignatureSection reportId={reportId!} />
            {/* ✅ Passa professorId e reportId para o componente */}
            <MeetingSchedule
              studentName={report.studentName}
              professorId={report.professorId}
              reportId={reportId!}
            />
          </div>
          <Footer />
        </div>
      </div>
    </div>
  );
}
