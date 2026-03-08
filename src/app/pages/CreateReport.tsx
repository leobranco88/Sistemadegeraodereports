import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Logo } from "../components/Logo";
import { Stepper } from "../components/Stepper";
import { RatingStars } from "../components/RatingStars";
import { mockStudents, competencyTemplates } from "../data/mockData";
import { Competency, ClassType, CEFRLevel, Situation } from "../types";
import { ArrowLeft, ArrowRight, Save, Send, Award } from "lucide-react";

const STEPS = ["Dados Gerais", "Dados Quantitativos", "Competências", "Observações Finais", "Revisão"];

const COMPETENCIES = [
  "Comportamento e Compromisso",
  "Organização e Responsabilidade",
  "Fala e Comunicação",
  "Gramática e Vocabulário",
  "Compreensão Auditiva",
  "Leitura e Escrita",
];

export function CreateReport() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);

  // Step 1: General Data
  const [selectedStudent, setSelectedStudent] = useState(studentId || "");
  const [classType, setClassType] = useState<ClassType>("regular");
  const [period, setPeriod] = useState("Mid-Year Report · 2026");
  const [evaluation, setEvaluation] = useState<"1 de 2 ciclos" | "2 de 2 ciclos">("1 de 2 ciclos");
  const [coordinator, setCoordinator] = useState("João Santos");

  // Step 2: Quantitative Data
  const [attendance, setAttendance] = useState(85);
  const [testScore, setTestScore] = useState(75);
  const [situation, setSituation] = useState<Situation>("approved");
  const [cefrLevel, setCefrLevel] = useState<CEFRLevel>("B1");

  // Step 3: Competencies
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

  // Step 4: Final Observations
  const [professorVoice, setProfessorVoice] = useState("");
  const [cycleFocus, setCycleFocus] = useState("");
  const [technicalFocus, setTechnicalFocus] = useState("");
  const [engagementHours, setEngagementHours] = useState("");
  const [observedHabits, setObservedHabits] = useState<string[]>([]);

  const student = mockStudents.find(s => s.id === selectedStudent);

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
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleSaveDraft = () => {
    alert("Rascunho salvo com sucesso!");
  };

  const handleSubmit = () => {
    alert("Relatório gerado com sucesso! Redirecionando para visualização...");
    navigate("/professor");
  };

  const toggleHabit = (habit: string) => {
    if (observedHabits.includes(habit)) {
      setObservedHabits(observedHabits.filter(h => h !== habit));
    } else {
      setObservedHabits([...observedHabits, habit]);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F4F8]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Logo />
            <button
              onClick={() => navigate("/professor")}
              className="flex items-center gap-2 text-[#9CA3AF] hover:text-[#EC5800] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Voltar ao Dashboard
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl text-[#070738] mb-2">Criar Relatório</h1>
        <p className="text-[#9CA3AF] mb-8">
          {student ? `Aluno: ${student.name}` : "Selecione um aluno para começar"}
        </p>

        <Stepper steps={STEPS} currentStep={currentStep} />

        <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
          {/* Step 1: General Data */}
          {currentStep === 0 && (
            <div className="space-y-6">
              <h2 className="text-2xl text-[#070738] mb-6">Dados Gerais</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-[#3D3D3D] mb-2">Aluno *</label>
                  <select
                    value={selectedStudent}
                    onChange={(e) => setSelectedStudent(e.target.value)}
                    className="w-full px-4 py-3 bg-[#F0F4F8] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EC5800]"
                  >
                    <option value="">Selecione um aluno</option>
                    {mockStudents.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-[#3D3D3D] mb-2">Turma</label>
                  <input
                    type="text"
                    value={student?.class || ""}
                    disabled
                    className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm text-[#3D3D3D] mb-2">Tipo de turma *</label>
                  <select
                    value={classType}
                    onChange={(e) => setClassType(e.target.value as ClassType)}
                    className="w-full px-4 py-3 bg-[#F0F4F8] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EC5800]"
                  >
                    <option value="regular">Regular</option>
                    <option value="intensive">Intensivo</option>
                    <option value="private">Particular</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-[#3D3D3D] mb-2">Período *</label>
                  <select
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    className="w-full px-4 py-3 bg-[#F0F4F8] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EC5800]"
                  >
                    <option value="Mid-Year Report · 2026">Mid-Year Report · 2026</option>
                    <option value="End-of-Year Report · 2026">End-of-Year Report · 2026</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-[#3D3D3D] mb-2">Avaliação *</label>
                  <select
                    value={evaluation}
                    onChange={(e) => setEvaluation(e.target.value as "1 de 2 ciclos" | "2 de 2 ciclos")}
                    className="w-full px-4 py-3 bg-[#F0F4F8] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EC5800]"
                  >
                    <option value="1 de 2 ciclos">1 de 2 ciclos</option>
                    <option value="2 de 2 ciclos">2 de 2 ciclos</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-[#3D3D3D] mb-2">Coordenador *</label>
                  <select
                    value={coordinator}
                    onChange={(e) => setCoordinator(e.target.value)}
                    className="w-full px-4 py-3 bg-[#F0F4F8] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EC5800]"
                  >
                    <option value="João Santos">João Santos</option>
                    <option value="Maria Oliveira">Maria Oliveira</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Quantitative Data */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl text-[#070738] mb-6">Dados Quantitativos</h2>

              <div className="space-y-8">
                <div>
                  <label className="block text-sm text-[#3D3D3D] mb-4">
                    Frequência: {attendance}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={attendance}
                    onChange={(e) => setAttendance(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#EC5800]"
                  />
                </div>

                <div>
                  <label className="block text-sm text-[#3D3D3D] mb-4">
                    Nota do teste: {testScore}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={testScore}
                    onChange={(e) => setTestScore(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#EC5800]"
                  />
                </div>

                <div>
                  <label className="block text-sm text-[#3D3D3D] mb-2">Situação *</label>
                  <select
                    value={situation}
                    onChange={(e) => setSituation(e.target.value as Situation)}
                    className="w-full px-4 py-3 bg-[#F0F4F8] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EC5800]"
                  >
                    <option value="approved">Aprovado(a)</option>
                    <option value="in-progress">Em Progresso</option>
                    <option value="needs-attention">Necessita Atenção</option>
                    <option value="failed">Reprovado(a)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-[#3D3D3D] mb-2">Nível CEFR *</label>
                  <select
                    value={cefrLevel}
                    onChange={(e) => setCefrLevel(e.target.value as CEFRLevel)}
                    className="w-full px-4 py-3 bg-[#F0F4F8] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EC5800]"
                  >
                    <option value="A1">A1</option>
                    <option value="A1+">A1+</option>
                    <option value="A2">A2</option>
                    <option value="A2+">A2+</option>
                    <option value="B1">B1</option>
                    <option value="B1+">B1+</option>
                    <option value="B2">B2</option>
                    <option value="B2+">B2+</option>
                    <option value="C1">C1</option>
                    <option value="C2">C2</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Competencies */}
          {currentStep === 2 && (
            <div className="space-y-8">
              <h2 className="text-2xl text-[#070738] mb-6">Avaliação por Competências</h2>

              {competencies.map((comp, index) => (
                <div key={comp.id} className="border border-gray-200 rounded-lg p-6 space-y-4">
                  <h3 className="text-lg text-[#070738]">{comp.name}</h3>

                  <div>
                    <label className="block text-sm text-[#3D3D3D] mb-3">Nota (1-5)</label>
                    <RatingStars
                      rating={comp.rating}
                      onChange={(rating) => updateCompetencyRating(index, rating)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-[#3D3D3D] mb-2">O que vejo</label>
                    <textarea
                      value={comp.whatISee}
                      onChange={(e) => updateCompetencyField(index, "whatISee", e.target.value)}
                      className="w-full px-4 py-3 bg-[#F0F4F8] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EC5800] min-h-[100px]"
                      placeholder="Descreva suas observações sobre o aluno nesta competência..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-[#3D3D3D] mb-2">Por que importa</label>
                    <select
                      value={comp.whyItMatters}
                      onChange={(e) => updateCompetencyField(index, "whyItMatters", e.target.value)}
                      className="w-full px-4 py-3 bg-[#F0F4F8] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EC5800]"
                    >
                      {competencyTemplates.whyItMatters[comp.rating].map((text, i) => (
                        <option key={i} value={text}>{text}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-[#3D3D3D] mb-2">O que fazer</label>
                    <select
                      value={comp.whatToDo}
                      onChange={(e) => updateCompetencyField(index, "whatToDo", e.target.value)}
                      className="w-full px-4 py-3 bg-[#F0F4F8] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EC5800]"
                    >
                      {competencyTemplates.whatToDo[comp.rating].map((text, i) => (
                        <option key={i} value={text}>{text}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Step 4: Final Observations */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl text-[#070738] mb-6">Observações Finais</h2>

              <div>
                <label className="block text-sm text-[#3D3D3D] mb-2">Voz do Professor *</label>
                <textarea
                  value={professorVoice}
                  onChange={(e) => setProfessorVoice(e.target.value)}
                  className="w-full px-4 py-3 bg-[#F0F4F8] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EC5800] min-h-[120px]"
                  placeholder="Escreva uma mensagem pessoal ao aluno/família..."
                />
              </div>

              <div>
                <label className="block text-sm text-[#3D3D3D] mb-2">Foco do Ciclo *</label>
                <textarea
                  value={cycleFocus}
                  onChange={(e) => setCycleFocus(e.target.value)}
                  className="w-full px-4 py-3 bg-[#F0F4F8] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EC5800] min-h-[100px]"
                  placeholder="Descreva o objetivo deste período..."
                />
              </div>

              {evaluation === "2 de 2 ciclos" && (
                <>
                  <div>
                    <label className="block text-sm text-[#3D3D3D] mb-2">Foco técnico para o próximo ciclo</label>
                    <select
                      value={technicalFocus}
                      onChange={(e) => setTechnicalFocus(e.target.value)}
                      className="w-full px-4 py-3 bg-[#F0F4F8] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EC5800]"
                    >
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
                    <select
                      value={engagementHours}
                      onChange={(e) => setEngagementHours(e.target.value)}
                      className="w-full px-4 py-3 bg-[#F0F4F8] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EC5800]"
                    >
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
                        <button
                          key={habit}
                          type="button"
                          onClick={() => toggleHabit(habit)}
                          className={`px-4 py-2 rounded-lg border transition-colors ${
                            observedHabits.includes(habit)
                              ? "bg-[#EC5800] text-white border-[#EC5800]"
                              : "bg-white text-[#3D3D3D] border-gray-300 hover:border-[#EC5800]"
                          }`}
                        >
                          {habit}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Step 5: Review */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl text-[#070738] mb-6">Revisão Final</h2>

              <div className="bg-[#F0F4F8] rounded-lg p-6 space-y-4">
                <div>
                  <p className="text-sm text-[#9CA3AF]">Aluno</p>
                  <p className="text-[#070738]">{student?.name}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-[#9CA3AF]">Turma</p>
                    <p className="text-[#070738]">{student?.class}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#9CA3AF]">Período</p>
                    <p className="text-[#070738]">{period}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#9CA3AF]">Frequência</p>
                    <p className="text-[#070738]">{attendance}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#9CA3AF]">Nota do teste</p>
                    <p className="text-[#070738]">{testScore}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#9CA3AF]">Situação</p>
                    <p className="text-[#070738] capitalize">{situation}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#9CA3AF]">Nível CEFR</p>
                    <p className="text-[#070738]">{cefrLevel}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-[#9CA3AF]">Competências avaliadas</p>
                  <p className="text-[#070738]">{competencies.length} competências</p>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  ⚠️ Após confirmar, o relatório ficará disponível para o responsável via QR Code
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-[#3D3D3D] rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-5 h-5" />
            Anterior
          </button>

          <button
            onClick={handleSaveDraft}
            className="flex items-center gap-2 px-6 py-3 border border-[#EC5800] text-[#EC5800] rounded-lg hover:bg-[#EC5800] hover:text-white transition-colors"
          >
            <Save className="w-5 h-5" />
            Salvar Rascunho
          </button>

          {currentStep === STEPS.length - 1 ? (
            <button
              onClick={handleSubmit}
              className="flex items-center gap-2 px-6 py-3 bg-[#16A34A] text-white rounded-lg hover:bg-[#15803d] transition-colors"
            >
              <Send className="w-5 h-5" />
              Gerar PDF e Enviar
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-3 bg-[#EC5800] text-white rounded-lg hover:bg-[#d84f00] transition-colors"
            >
              Próximo
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}