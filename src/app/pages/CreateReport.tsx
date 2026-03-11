import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Logo } from "../components/Logo";
import { Stepper } from "../components/Stepper";
import { RatingStars } from "../components/RatingStars";
import { competencyTemplates } from "../data/mockData";
import { Competency, ClassType, CEFRLevel, Situation } from "../types";
import { ArrowLeft, ArrowRight, Save, Send, HelpCircle, X, BookOpen } from "lucide-react";
import { db, auth } from "../../firebase";
import { collection, addDoc, getDocs, getDoc, updateDoc, query, where, serverTimestamp, doc } from "firebase/firestore";

const STEPS = ["Dados Gerais", "Dados Quantitativos", "Competências", "Observações Finais", "Revisão"];

const COMPETENCIES = [
  "Comportamento e Compromisso",
  "Organização e Responsabilidade",
  "Fala e Comunicação",
  "Gramática e Vocabulário",
  "Compreensão Auditiva",
  "Leitura e Escrita",
];

// Tooltips explicativos para cada competência
const COMPETENCY_TOOLTIPS: Record<string, string> = {
  "Comportamento e Compromisso":
    "Avalie a postura do aluno em sala: respeito, participação, pontualidade e envolvimento nas atividades. Um aluno comprometido aparece preparado e contribui ativamente.",
  "Organização e Responsabilidade":
    "Observe se o aluno traz o material, entrega tarefas no prazo e mantém o caderno/livro organizados. Responsabilidade reflete maturidade no processo de aprendizado.",
  "Fala e Comunicação":
    "Avalie a disposição do aluno para se expressar em inglês, mesmo cometendo erros. Considere fluência, pronúncia, confiança e uso de vocabulário adequado.",
  "Gramática e Vocabulário":
    "Observe a precisão gramatical nas produções orais e escritas, e a variedade de vocabulário utilizado. Considere o nível esperado para a turma.",
  "Compreensão Auditiva":
    "Avalie a capacidade do aluno de entender instruções, diálogos e áudios em inglês. Inclui compreensão de diferentes sotaques e velocidades de fala.",
  "Leitura e Escrita":
    "Observe habilidades de leitura (interpretação, velocidade) e escrita (clareza, coerência, ortografia). Considere produções em sala e tarefas de casa.",
};

// Placeholders personalizados por competência para o campo "O que vejo"
const COMPETENCY_PLACEHOLDERS: Record<string, string> = {
  "Comportamento e Compromisso":
    "Ex: [Nome] demonstra boa postura em sala, participa ativamente das atividades e respeita os colegas. Costuma chegar pontualmente e está sempre disposto(a) a colaborar.",
  "Organização e Responsabilidade":
    "Ex: [Nome] traz o material completo regularmente e entrega as tarefas dentro do prazo. Mantém o caderno organizado e demonstra autonomia no gerenciamento das atividades.",
  "Fala e Comunicação":
    "Ex: [Nome] demonstra boa confiança ao se expressar em inglês, utilizando vocabulário variado. Comete alguns erros gramaticais, mas a comunicação é clara e eficaz.",
  "Gramática e Vocabulário":
    "Ex: [Nome] aplica bem as estruturas gramaticais do nível, com uso crescente de vocabulário. Apresenta boa consistência nas produções escritas e orais.",
  "Compreensão Auditiva":
    "Ex: [Nome] compreende bem as instruções em inglês e acompanha os áudios do livro com facilidade. Demonstra boa capacidade de inferir significado pelo contexto.",
  "Leitura e Escrita":
    "Ex: [Nome] lê com boa fluência e demonstra compreensão dos textos trabalhados. Nas produções escritas, apresenta clareza de ideia e boa organização dos parágrafos.",
};

// Conteúdo do modal de ajuda — Competências
const HELP_CONTENT_COMPETENCIAS = [
  {
    title: "Como avaliar cada competência?",
    body: "Use a escala de 1 a 5 estrelas: 1 = Precisa de muita atenção, 2 = Em desenvolvimento, 3 = Dentro do esperado, 4 = Acima do esperado, 5 = Excelente.",
  },
  {
    title: "O que escrever em \"O que vejo\"?",
    body: "Descreva comportamentos e situações reais observadas em sala. Seja específico(a) — mencione o nome do aluno e exemplos concretos. Evite frases genéricas como \"é um bom aluno\".",
  },
  {
    title: "Por que importa / O que fazer",
    body: "Esses campos são preenchidos automaticamente com base na nota. Você pode ajustar escolhendo outra opção no menu. Eles aparecem no relatório para os responsáveis.",
  },
];

// Conteúdo do modal de ajuda — Observações Finais
const HELP_CONTENT_OBSERVACOES = [
  {
    title: "Voz do Professor",
    body: "Escreva uma mensagem pessoal e encorajadora direcionada ao aluno e à família. Mencione conquistas do período, momentos marcantes e o potencial que você enxerga. Tom: caloroso e motivador.",
  },
  {
    title: "Foco do Ciclo",
    body: "Descreva qual foi o objetivo pedagógico principal deste ciclo — o que a turma trabalhou, quais habilidades foram priorizadas e o que foi alcançado coletivamente ou individualmente.",
  },
];

interface Aluno {
  id: string;
  nome: string;
  turma: string;
  tipo: string;
}

// Componente Tooltip
function Tooltip({ text }: { text: string }) {
  const [visible, setVisible] = useState(false);
  return (
    <span className="relative inline-flex items-center ml-1">
      <button
        type="button"
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
        className="text-[#9CA3AF] hover:text-[#EC5800] transition-colors"
        aria-label="Ajuda"
      >
        <HelpCircle className="w-4 h-4" />
      </button>
      {visible && (
        <div className="absolute z-50 left-6 top-0 w-72 bg-[#070738] text-white text-xs rounded-lg p-3 shadow-xl leading-relaxed">
          {text}
          <div className="absolute left-[-6px] top-2 w-0 h-0 border-t-4 border-b-4 border-r-8 border-transparent border-r-[#070738]" />
        </div>
      )}
    </span>
  );
}

// Componente Modal de Ajuda
function HelpModal({
  title,
  items,
  onClose,
}: {
  title: string;
  items: { title: string; body: string }[];
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2 text-[#070738]">
            <BookOpen className="w-5 h-5 text-[#EC5800]" />
            <h3 className="text-lg font-semibold">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#9CA3AF] hover:text-[#3D3D3D] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-4">
          {items.map((item, i) => (
            <div key={i} className="bg-[#F0F4F8] rounded-lg p-4">
              <p className="text-sm font-semibold text-[#070738] mb-1">{item.title}</p>
              <p className="text-sm text-[#3D3D3D] leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>
        <button
          onClick={onClose}
          className="mt-5 w-full py-2 bg-[#EC5800] text-white rounded-lg hover:bg-[#d84f00] transition-colors text-sm font-medium"
        >
          Entendi, obrigado!
        </button>
      </div>
    </div>
  );
}

export function CreateReport() {
  const { studentId, reportId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const periodFromUrl = new URLSearchParams(location.search).get("period");

  const [currentStep, setCurrentStep] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [carregandoDraft, setCarregandoDraft] = useState(!!reportId);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [professorNome, setProfessorNome] = useState("Professor");
  const [professorIdState, setProfessorIdState] = useState("");
  const [showHelpModal, setShowHelpModal] = useState(false);

  const [selectedStudent, setSelectedStudent] = useState(studentId || "");
  const [classType, setClassType] = useState<ClassType>("regular");
  const [period, setPeriod] = useState(periodFromUrl || "Mid-Year Report · 2026");
  const [evaluation, setEvaluation] = useState<"1 de 2 ciclos" | "2 de 2 ciclos">("1 de 2 ciclos");
  const [coordinator, setCoordinator] = useState("Leonardo Branco Costa");

  const [attendance, setAttendance] = useState(85);
  const [testScore, setTestScore] = useState(75);
  const [situation, setSituation] = useState<Situation>("approved");
  const [cefrLevel, setCefrLevel] = useState<CEFRLevel>("B1");

  const [competencies, setCompetencies] = useState<Competency[]>(
    COMPETENCIES.map((name, index) => ({
      id: String(index + 1),
      name,
      rating: 3,
      whatISee: "",
      whyItMatters: competencyTemplates.whyItMatters[3][0],
      whatToDo: competencyTemplates.whatToDo[3][0],
    }))
  );

  const [professorVoice, setProfessorVoice] = useState("");
  const [cycleFocus, setCycleFocus] = useState("");
  const [technicalFocus, setTechnicalFocus] = useState("");
  const [engagementHours, setEngagementHours] = useState("");
  const [observedHabits, setObservedHabits] = useState<string[]>([]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) { navigate("/"); return; }
      try {
        const profSnap = await getDocs(query(collection(db, "professores"), where("email", "==", user.email)));
        if (!profSnap.empty) {
          const profDoc = profSnap.docs[0];
          setProfessorIdState(profDoc.id);
          setProfessorNome(profDoc.data().nome || user.email || "Professor");
          const alunosSnap = await getDocs(query(collection(db, "alunos"), where("professorId", "==", profDoc.id), where("ativo", "==", true)));
          setAlunos(alunosSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Aluno[]);
        }
      } catch (err) {
        console.error("Erro ao buscar dados:", err);
      }
    });
    return unsubscribe;
  }, [navigate]);

  useEffect(() => {
    if (!reportId) return;
    const carregarDraft = async () => {
      try {
        const snap = await getDoc(doc(db, "reports", reportId));
        if (snap.exists()) {
          const d = snap.data();
          if (d.studentId) setSelectedStudent(d.studentId);
          if (d.classType) setClassType(d.classType);
          if (d.period) setPeriod(d.period);
          if (d.evaluation) setEvaluation(d.evaluation);
          if (d.coordinator) setCoordinator(d.coordinator);
          if (d.attendance !== undefined) setAttendance(d.attendance);
          if (d.testScore !== undefined) setTestScore(d.testScore);
          if (d.situation) setSituation(d.situation);
          if (d.cefrLevel) setCefrLevel(d.cefrLevel);
          if (d.competencies?.length) setCompetencies(d.competencies);
          if (d.professorVoice) setProfessorVoice(d.professorVoice);
          if (d.cycleFocus) setCycleFocus(d.cycleFocus);
          if (d.technicalFocus) setTechnicalFocus(d.technicalFocus);
          if (d.engagementHours) setEngagementHours(d.engagementHours);
          if (d.observedHabits) setObservedHabits(d.observedHabits);
        }
      } catch (err) {
        console.error("Erro ao carregar rascunho:", err);
      } finally {
        setCarregandoDraft(false);
      }
    };
    carregarDraft();
  }, [reportId]);

  const student = alunos.find(a => a.id === selectedStudent);

  const buscarCicloId = async (alunoId: string): Promise<string> => {
    try {
      const ciclosSnap = await getDocs(
        query(
          collection(db, "ciclos"),
          where("alunoIds", "array-contains", alunoId),
          where("professorId", "==", professorIdState)
        )
      );
      if (!ciclosSnap.empty) {
        const ativo = ciclosSnap.docs.find(d => d.data().status !== "concluido");
        return (ativo || ciclosSnap.docs[0]).id;
      }
    } catch (err) {
      console.error("Erro ao buscar cicloId:", err);
    }
    return "";
  };

  const buildReportData = (status: "draft" | "published", cicloId = "") => ({
    status,
    updatedAt: serverTimestamp(),
    ...(status === "published" && { publishedAt: serverTimestamp() }),
    studentId: selectedStudent,
    studentName: student?.nome || "",
    class: student?.turma || "",
    classType,
    period,
    evaluation,
    coordinator,
    attendance,
    testScore,
    situation,
    cefrLevel,
    competencies,
    professorVoice,
    cycleFocus,
    technicalFocus,
    engagementHours,
    observedHabits,
    professorName: professorNome,
    professorId: professorIdState,
    ...(cicloId && { cicloId }),
  });

  const updateCompetencyRating = (index: number, rating: number) => {
    const updated = [...competencies];
    updated[index] = {
      ...updated[index],
      rating,
      whyItMatters: competencyTemplates.whyItMatters[rating][0],
      whatToDo: competencyTemplates.whatToDo[rating][0],
    };
    setCompetencies(updated);
  };

  const updateCompetencyField = (index: number, field: keyof Competency, value: string) => {
    const updated = [...competencies];
    updated[index] = { ...updated[index], [field]: value };
    setCompetencies(updated);
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) { setCurrentStep(currentStep + 1); window.scrollTo(0, 0); }
  };

  const handlePrev = () => {
    if (currentStep > 0) { setCurrentStep(currentStep - 1); window.scrollTo(0, 0); }
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      const cicloId = selectedStudent ? await buscarCicloId(selectedStudent) : "";
      if (reportId) {
        await updateDoc(doc(db, "reports", reportId), buildReportData("draft", cicloId));
        alert("Rascunho atualizado!");
      } else {
        const docRef = await addDoc(collection(db, "reports"), { ...buildReportData("draft", cicloId), createdAt: serverTimestamp() });
        alert(`Rascunho salvo! ID: ${docRef.id}`);
        navigate("/report/create/" + selectedStudent + "/" + docRef.id + "?period=" + encodeURIComponent(period), { replace: true });
      }
    } catch (err) {
      alert("Erro ao salvar rascunho. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedStudent) { alert("Selecione um aluno antes de gerar o relatório."); return; }
    setIsSaving(true);
    try {
      const cicloId = await buscarCicloId(selectedStudent);
      let finalId = reportId;
      if (reportId) {
        await updateDoc(doc(db, "reports", reportId), { ...buildReportData("published", cicloId), createdAt: serverTimestamp() });
      } else {
        const docRef = await addDoc(collection(db, "reports"), { ...buildReportData("published", cicloId), createdAt: serverTimestamp() });
        finalId = docRef.id;
      }
      alert(`Relatório gerado com sucesso!\n\nCompartilhe o link:\nhttps://eic-relatorios.vercel.app/report/view/${finalId}`);
      navigate("/professor");
    } catch (err) {
      alert("Erro ao gerar relatório. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleHabit = (habit: string) => {
    setObservedHabits(prev => prev.includes(habit) ? prev.filter(h => h !== habit) : [...prev, habit]);
  };

  if (carregandoDraft) {
    return (
      <div className="min-h-screen bg-[#F0F4F8] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[#EC5800] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#6B7280]">Carregando rascunho...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F4F8]">
      {/* Modal de ajuda */}
      {showHelpModal && (
        <HelpModal
          title={currentStep === 2 ? "Como preencher as Competências" : "Como preencher as Observações"}
          items={currentStep === 2 ? HELP_CONTENT_COMPETENCIAS : HELP_CONTENT_OBSERVACOES}
          onClose={() => setShowHelpModal(false)}
        />
      )}

      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Logo />
            <div className="flex items-center gap-4">
              {reportId && (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#FEF3C7] text-[#92400E]">
                  Editando rascunho
                </span>
              )}
              <button onClick={() => navigate("/professor")}
                className="flex items-center gap-2 text-[#9CA3AF] hover:text-[#EC5800] transition-colors">
                <ArrowLeft className="w-5 h-5" /> Voltar ao Dashboard
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-start justify-between mb-2">
          <h1 className="text-3xl text-[#070738]">{reportId ? "Continuar Rascunho" : "Criar Relatório"}</h1>
          {/* Botão de ajuda visível nas etapas de Competências e Observações */}
          {(currentStep === 2 || currentStep === 3) && (
            <button
              onClick={() => setShowHelpModal(true)}
              className="flex items-center gap-2 px-4 py-2 border border-[#EC5800] text-[#EC5800] rounded-lg hover:bg-[#EC5800] hover:text-white transition-colors text-sm font-medium"
            >
              <BookOpen className="w-4 h-4" />
              Como preencher?
            </button>
          )}
        </div>
        <p className="text-[#9CA3AF] mb-8">
          {student ? `Aluno: ${student.nome}` : "Selecione um aluno para começar"}
        </p>

        <Stepper steps={STEPS} currentStep={currentStep} />

        <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
          {/* STEP 0 — Dados Gerais (sem alterações) */}
          {currentStep === 0 && (
            <div className="space-y-6">
              <h2 className="text-2xl text-[#070738] mb-6">Dados Gerais</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-[#3D3D3D] mb-2">Aluno *</label>
                  <select value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)}
                    className="w-full px-4 py-3 bg-[#F0F4F8] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EC5800]">
                    <option value="">Selecione um aluno</option>
                    {alunos.map(a => (
                      <option key={a.id} value={a.id}>{a.nome}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-[#3D3D3D] mb-2">Turma</label>
                  <input type="text" value={student?.turma || ""} disabled
                    className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm text-[#3D3D3D] mb-2">Tipo de turma *</label>
                  <select value={classType} onChange={(e) => setClassType(e.target.value as ClassType)}
                    className="w-full px-4 py-3 bg-[#F0F4F8] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EC5800]">
                    <option value="regular">Regular</option>
                    <option value="intensive">Intensivo</option>
                    <option value="private">Particular</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-[#3D3D3D] mb-2">Período *</label>
                  <select value={period} onChange={(e) => setPeriod(e.target.value)}
                    disabled={!!periodFromUrl}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EC5800] disabled:bg-gray-100 disabled:cursor-not-allowed">
                    <option value="Mid-Year Report · 2026">Mid-Year Report · 2026</option>
                    <option value="End-of-Year Report · 2026">End-of-Year Report · 2026</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-[#3D3D3D] mb-2">Avaliação *</label>
                  <select value={evaluation} onChange={(e) => setEvaluation(e.target.value as "1 de 2 ciclos" | "2 de 2 ciclos")}
                    className="w-full px-4 py-3 bg-[#F0F4F8] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EC5800]">
                    <option value="1 de 2 ciclos">1 de 2 ciclos</option>
                    <option value="2 de 2 ciclos">2 de 2 ciclos</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-[#3D3D3D] mb-2">Coordenador *</label>
                  <select value={coordinator} onChange={(e) => setCoordinator(e.target.value)}
                    className="w-full px-4 py-3 bg-[#F0F4F8] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EC5800]">
                    <option value="Leonardo Branco Costa">Leonardo Branco Costa</option>
                    <option value="Maria Eduarda Camano">Maria Eduarda Camano</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 1 — Dados Quantitativos (sem alterações) */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl text-[#070738] mb-6">Dados Quantitativos</h2>
              <div className="space-y-8">
                <div>
                  <label className="block text-sm text-[#3D3D3D] mb-4">Frequência: {attendance}%</label>
                  <input type="range" min="0" max="100" value={attendance}
                    onChange={(e) => setAttendance(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#EC5800]" />
                </div>
                <div>
                  <label className="block text-sm text-[#3D3D3D] mb-4">Nota do teste: {testScore}%</label>
                  <input type="range" min="0" max="100" value={testScore}
                    onChange={(e) => setTestScore(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#EC5800]" />
                </div>
                <div>
                  <label className="block text-sm text-[#3D3D3D] mb-2">Situação *</label>
                  <select value={situation} onChange={(e) => setSituation(e.target.value as Situation)}
                    className="w-full px-4 py-3 bg-[#F0F4F8] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EC5800]">
                    <option value="approved">Aprovado(a)</option>
                    <option value="in-progress">Em Progresso</option>
                    <option value="needs-attention">Necessita Atenção</option>
                    <option value="failed">Reprovado(a)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-[#3D3D3D] mb-2">Nível CEFR *</label>
                  <select value={cefrLevel} onChange={(e) => setCefrLevel(e.target.value as CEFRLevel)}
                    className="w-full px-4 py-3 bg-[#F0F4F8] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EC5800]">
                    {["A1","A1+","A2","A2+","B1","B1+","B2","B2+","C1","C2"].map(l => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2 — Competências COM tooltips e placeholders */}
          {currentStep === 2 && (
            <div className="space-y-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl text-[#070738]">Avaliação por Competências</h2>
              </div>

              {/* Banner de dica rápida */}
              <div className="bg-[#FFF7ED] border border-[#FED7AA] rounded-lg px-4 py-3 flex items-start gap-3 text-sm text-[#92400E]">
                <HelpCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#EC5800]" />
                <span>
                  No campo <strong>"O que vejo"</strong>, descreva situações reais observadas em sala. Use os exemplos como guia — passe o mouse no <strong>?</strong> ao lado do nome de cada competência para entender o que avaliar.
                </span>
              </div>

              {competencies.map((comp, index) => (
                <div key={comp.id} className="border border-gray-200 rounded-lg p-6 space-y-4">
                  <h3 className="text-lg text-[#070738] flex items-center">
                    {comp.name}
                    <Tooltip text={COMPETENCY_TOOLTIPS[comp.name] || ""} />
                  </h3>
                  <div>
                    <label className="block text-sm text-[#3D3D3D] mb-3">Nota (1-5)</label>
                    <RatingStars rating={comp.rating} onChange={(rating) => updateCompetencyRating(index, rating)} />
                  </div>
                  <div>
                    <label className="block text-sm text-[#3D3D3D] mb-2">O que vejo</label>
                    <textarea
                      value={comp.whatISee}
                      onChange={(e) => updateCompetencyField(index, "whatISee", e.target.value)}
                      className="w-full px-4 py-3 bg-[#F0F4F8] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EC5800] min-h-[100px] text-sm"
                      placeholder={COMPETENCY_PLACEHOLDERS[comp.name] || "Descreva suas observações..."}
                    />
                    <p className="text-xs text-[#9CA3AF] mt-1">
                      Substitua [Nome] pelo nome do aluno. Este texto aparecerá no relatório do responsável.
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm text-[#3D3D3D] mb-2">Por que importa</label>
                    <select value={comp.whyItMatters}
                      onChange={(e) => updateCompetencyField(index, "whyItMatters", e.target.value)}
                      className="w-full px-4 py-3 bg-[#F0F4F8] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EC5800]">
                      {competencyTemplates.whyItMatters[comp.rating].map((text, i) => (
                        <option key={i} value={text}>{text}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-[#3D3D3D] mb-2">O que fazer</label>
                    <select value={comp.whatToDo}
                      onChange={(e) => updateCompetencyField(index, "whatToDo", e.target.value)}
                      className="w-full px-4 py-3 bg-[#F0F4F8] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EC5800]">
                      {competencyTemplates.whatToDo[comp.rating].map((text, i) => (
                        <option key={i} value={text}>{text}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* STEP 3 — Observações Finais COM placeholders e dicas */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl text-[#070738] mb-6">Observações Finais</h2>
              <div>
                <label className="block text-sm text-[#3D3D3D] mb-1 flex items-center gap-1">
                  Voz do Professor *
                  <Tooltip text="Mensagem pessoal e encorajadora para o aluno e família. Mencione conquistas, momentos marcantes e o potencial que você enxerga. Tom: caloroso e motivador." />
                </label>
                <textarea value={professorVoice} onChange={(e) => setProfessorVoice(e.target.value)}
                  className="w-full px-4 py-3 bg-[#F0F4F8] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EC5800] min-h-[120px] text-sm"
                  placeholder="Ex: Foi um prazer acompanhar o desenvolvimento de [Nome] neste ciclo. Sua dedicação e entusiasmo em sala foram notáveis, especialmente nos momentos de conversação. Tenho certeza que, mantendo este ritmo, os próximos passos serão ainda mais marcantes!" />
                <p className="text-xs text-[#9CA3AF] mt-1">Escreva em 1º pessoa do professor. Tom positivo, pessoal e motivador.</p>
              </div>
              <div>
                <label className="block text-sm text-[#3D3D3D] mb-1 flex items-center gap-1">
                  Foco do Ciclo *
                  <Tooltip text="Descreva o objetivo pedagógico principal deste ciclo — o que foi trabalhado, quais habilidades foram priorizadas e o que foi alcançado." />
                </label>
                <textarea value={cycleFocus} onChange={(e) => setCycleFocus(e.target.value)}
                  className="w-full px-4 py-3 bg-[#F0F4F8] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EC5800] min-h-[100px] text-sm"
                  placeholder="Ex: Neste ciclo, trabalhamos habilidades de comunicação oral com foco em situações cotidianas, ampliação de vocabulário temático e introdução a estruturas do nível B1. Os alunos participaram de role plays, debates em dupla e atividades de listening com diferentes sotaques." />
                <p className="text-xs text-[#9CA3AF] mt-1">Pode ser o mesmo texto para todos os alunos da mesma turma.</p>
              </div>
              {evaluation === "2 de 2 ciclos" && (
                <>
                  <div>
                    <label className="block text-sm text-[#3D3D3D] mb-2">Foco técnico para o próximo ciclo</label>
                    <select value={technicalFocus} onChange={(e) => setTechnicalFocus(e.target.value)}
                      className="w-full px-4 py-3 bg-[#F0F4F8] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EC5800]">
                      <option value="">Selecione...</option>
                      <option value="speaking">Fala e Comunicação</option>
                      <option value="writing">Escrita</option>
                      <option value="listening">Compreensão Auditiva</option>
                      <option value="grammar">Gramática</option>
                      <option value="vocabulary">Vocabulário</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-[#3D3D3D] mb-2">Horas de engajamento (fora da sala)</label>
                    <select value={engagementHours} onChange={(e) => setEngagementHours(e.target.value)}
                      className="w-full px-4 py-3 bg-[#F0F4F8] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EC5800]">
                      <option value="">Selecione...</option>
                      <option value="0-2h">0-2 horas/semana</option>
                      <option value="2-5h">2-5 horas/semana</option>
                      <option value="5-10h">5-10 horas/semana</option>
                      <option value="10+h">10+ horas/semana</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-[#3D3D3D] mb-3">Hábitos observados</label>
                    <div className="flex flex-wrap gap-3">
                      {["Faz lição de casa", "Assiste séries em inglês", "Usa aplicativos", "Pratica com família", "Lê em inglês"].map(habit => (
                        <button key={habit} type="button" onClick={() => toggleHabit(habit)}
                          className={`px-4 py-2 rounded-lg border transition-colors ${
                            observedHabits.includes(habit)
                              ? "bg-[#EC5800] text-white border-[#EC5800]"
                              : "bg-white text-[#3D3D3D] border-gray-300 hover:border-[#EC5800]"
                          }`}>
                          {habit}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* STEP 4 — Revisão (sem alterações) */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl text-[#070738] mb-6">Revisão Final</h2>
              <div className="bg-[#F0F4F8] rounded-lg p-6 space-y-4">
                <div>
                  <p className="text-sm text-[#9CA3AF]">Aluno</p>
                  <p className="text-[#070738]">{student?.nome}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><p className="text-sm text-[#9CA3AF]">Turma</p><p className="text-[#070738]">{student?.turma}</p></div>
                  <div><p className="text-sm text-[#9CA3AF]">Período</p><p className="text-[#070738]">{period}</p></div>
                  <div><p className="text-sm text-[#9CA3AF]">Frequência</p><p className="text-[#070738]">{attendance}%</p></div>
                  <div><p className="text-sm text-[#9CA3AF]">Nota do teste</p><p className="text-[#070738]">{testScore}%</p></div>
                  <div><p className="text-sm text-[#9CA3AF]">Situação</p><p className="text-[#070738] capitalize">{situation}</p></div>
                  <div><p className="text-sm text-[#9CA3AF]">Nível CEFR</p><p className="text-[#070738]">{cefrLevel}</p></div>
                </div>
                <div>
                  <p className="text-sm text-[#9CA3AF]">Competências avaliadas</p>
                  <p className="text-[#070738]">{competencies.length} competências</p>
                </div>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  ⚠️ Após confirmar, o relatório será salvo e um link será gerado para o responsável.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center">
          <button onClick={handlePrev} disabled={currentStep === 0}
            className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-[#3D3D3D] rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            <ArrowLeft className="w-5 h-5" /> Anterior
          </button>
          <button onClick={handleSaveDraft} disabled={isSaving}
            className="flex items-center gap-2 px-6 py-3 border border-[#EC5800] text-[#EC5800] rounded-lg hover:bg-[#EC5800] hover:text-white transition-colors disabled:opacity-50">
            <Save className="w-5 h-5" />
            {isSaving ? "Salvando..." : "Salvar Rascunho"}
          </button>
          {currentStep === STEPS.length - 1 ? (
            <button onClick={handleSubmit} disabled={isSaving}
              className="flex items-center gap-2 px-6 py-3 bg-[#16A34A] text-white rounded-lg hover:bg-[#15803d] transition-colors disabled:opacity-50">
              <Send className="w-5 h-5" />
              {isSaving ? "Gerando..." : "Gerar e Compartilhar"}
            </button>
          ) : (
            <button onClick={handleNext}
              className="flex items-center gap-2 px-6 py-3 bg-[#EC5800] text-white rounded-lg hover:bg-[#d84f00] transition-colors">
              Próximo <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
