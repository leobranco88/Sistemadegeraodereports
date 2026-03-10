import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Logo } from "../components/Logo";
import { Stepper } from "../components/Stepper";
import { RatingStars } from "../components/RatingStars";
import { competencyTemplates } from "../data/mockData";
import { Competency, ClassType, CEFRLevel, Situation } from "../types";
import { ArrowLeft, ArrowRight, Save, Send } from "lucide-react";
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

interface Aluno {
  id: string;
  nome: string;
  turma: string;
  tipo: string;
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

  // Carrega dados do professor e alunos
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

  // Carrega rascunho se reportId existir
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

  // Busca o cicloId ativo para o aluno selecionado
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
        // Prefere ciclo com status != "concluido", senão pega o primeiro
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
        <h1 className="text-3xl text-[#070738] mb-2">{reportId ? "Continuar Rascunho" : "Criar Relatório"}</h1>
        <p className="text-[#9CA3AF] mb-8">
          {student ? `Aluno: ${student.nome}` : "Selecione um aluno para começar"}
        </p>

        <Stepper steps={STEPS} currentStep={currentStep} />

        <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
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

          {currentStep === 2 && (
            <div className="space-y-8">
              <h2 className="text-2xl text-[#070738] mb-6">Avaliação por Competências</h2>
              {competencies.map((comp, index) => (
                <div key={comp.id} className="border border-gray-200 rounded-lg p-6 space-y-4">
                  <h3 className="text-lg text-[#070738]">{comp.name}</h3>
                  <div>
                    <label className="block text-sm text-[#3D3D3D] mb-3">Nota (1-5)</label>
                    <RatingStars rating={comp.rating} onChange={(rating) => updateCompetencyRating(index, rating)} />
                  </div>
                  <div>
                    <label className="block text-sm text-[#3D3D3D] mb-2">O que vejo</label>
                    <textarea value={comp.whatISee}
                      onChange={(e) => updateCompetencyField(index, "whatISee", e.target.value)}
                      className="w-full px-4 py-3 bg-[#F0F4F8] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EC5800] min-h-[100px]"
                      placeholder="Descreva suas observações..." />
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

          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl text-[#070738] mb-6">Observações Finais</h2>
              <div>
                <label className="block text-sm text-[#3D3D3D] mb-2">Voz do Professor *</label>
                <textarea value={professorVoice} onChange={(e) => setProfessorVoice(e.target.value)}
                  className="w-full px-4 py-3 bg-[#F0F4F8] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EC5800] min-h-[120px]"
                  placeholder="Escreva uma mensagem pessoal ao aluno/família..." />
              </div>
              <div>
                <label className="block text-sm text-[#3D3D3D] mb-2">Foco do Ciclo *</label>
                <textarea value={cycleFocus} onChange={(e) => setCycleFocus(e.target.value)}
                  className="w-full px-4 py-3 bg-[#F0F4F8] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EC5800] min-h-[100px]"
                  placeholder="Descreva o objetivo deste período..." />
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
