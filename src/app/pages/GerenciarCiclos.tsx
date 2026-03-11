import { useState, useEffect } from "react";
import { Header } from "../components/Header";
import { Plus, Calendar, Clock, CheckCircle, AlertTriangle, X, ChevronRight, CalendarCheck, FlaskConical } from "lucide-react";
import { db } from "../../firebase";
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from "firebase/firestore";

interface Agendamento {
  dias: number[];
  horaInicio: string;
  horaFim: string;
  duracao: number;
  dataLimite: string;
}

interface Ciclo {
  id: string;
  turma: string;
  professorId: string;
  professorNome: string;
  periodo: string;
  deadline: string;
  dataProva?: string;
  alunoIds: string[];
  alunosNomes: string[];
  criadoEm: string;
  status?: "ativo" | "teste_aplicado" | "relatorios_pendentes" | "agendamentos_abertos";
  agendamento?: Agendamento;
}

interface Professor {
  id: string;
  nome: string;
  ativo: boolean;
}

interface Aluno {
  id: string;
  nome: string;
  turma: string;
  professorId: string;
  ativo: boolean;
}

interface Relatorio {
  id: string;
  studentId: string;
  status: string;
  period?: string;
}

const periodos = [
  "Mid-Year Report · 2026",
  "End-of-Year Report · 2026",
  "Mid-Year Report · 2027",
  "End-of-Year Report · 2027",
];

const diasSemana = [
  { label: "Seg", value: 1 },
  { label: "Ter", value: 2 },
  { label: "Qua", value: 3 },
  { label: "Qui", value: 4 },
  { label: "Sex", value: 5 },
  { label: "Sáb", value: 6 },
  { label: "Dom", value: 0 },
];

const STATUS_CONFIG = {
  ativo:                 { label: "Em andamento",             bg: "#DBEAFE", color: "#1D4ED8" },
  teste_aplicado:        { label: "Teste aplicado",           bg: "#FEF3C7", color: "#92400E" },
  relatorios_pendentes:  { label: "Prontos para relatórios",  bg: "#EDE9FE", color: "#5B21B6" },
  agendamentos_abertos:  { label: "Agendamentos abertos",     bg: "#D1FAE5", color: "#065F46" },
};

const PROXIMOS_STATUS: Record<string, string> = {
  ativo: "teste_aplicado",
  teste_aplicado: "relatorios_pendentes",
  relatorios_pendentes: "agendamentos_abertos",
};

const BOTAO_LABEL: Record<string, string> = {
  ativo: "Marcar teste aplicado",
  teste_aplicado: "Marcar prontos para relatórios",
  relatorios_pendentes: "Abrir agendamentos",
};

export default function GerenciarCiclos() {
  const [ciclos, setCiclos] = useState<Ciclo[]>([]);
  const [professores, setProfessores] = useState<Professor[]>([]);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [relatorios, setRelatorios] = useState<Relatorio[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const [professorSelecionado, setProfessorSelecionado] = useState("");
  const [periodo, setPeriodo] = useState("");
  const [deadline, setDeadline] = useState("");
  const [dataProva, setDataProva] = useState("");
  const [alunosSelecionados, setAlunosSelecionados] = useState<string[]>([]);

  const [cicloAgendando, setCicloAgendando] = useState<string | null>(null);
  const [agDias, setAgDias] = useState<number[]>([]);
  const [agHoraInicio, setAgHoraInicio] = useState("");
  const [agHoraFim, setAgHoraFim] = useState("");
  const [agDuracao, setAgDuracao] = useState("30");
  const [agDataLimite, setAgDataLimite] = useState("");
  const [salvandoAg, setSalvandoAg] = useState(false);

  const alunosFiltrados = alunos.filter(a => a.professorId === professorSelecionado && a.ativo !== false);

  useEffect(() => { buscarDados(); }, []);

  const buscarDados = async () => {
    try {
      const [snapCiclos, snapProfessores, snapAlunos, snapRelatorios] = await Promise.all([
        getDocs(collection(db, "ciclos")),
        getDocs(collection(db, "professores")),
        getDocs(collection(db, "alunos")),
        getDocs(collection(db, "reports")),
      ]);
      setCiclos(snapCiclos.docs.map(d => ({ id: d.id, ...d.data() })) as Ciclo[]);
      setProfessores(snapProfessores.docs.map(d => ({ id: d.id, ...d.data() })) as Professor[]);
      setAlunos(snapAlunos.docs.map(d => ({ id: d.id, ...d.data() })) as Aluno[]);
      setRelatorios(snapRelatorios.docs.map(d => ({ id: d.id, ...d.data() })) as Relatorio[]);
    } catch (err) {
      console.error("Erro ao buscar dados:", err);
    } finally {
      setCarregando(false);
    }
  };

  const criarCiclo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!professorSelecionado || !periodo || !deadline || alunosSelecionados.length === 0) {
      alert("Preencha todos os campos e selecione ao menos um aluno!");
      return;
    }
    setSalvando(true);
    try {
      const prof = professores.find(p => p.id === professorSelecionado);
      const alunosDosCiclo = alunos.filter(a => alunosSelecionados.includes(a.id));
      await addDoc(collection(db, "ciclos"), {
        turma: alunosDosCiclo[0]?.turma || "",
        professorId: professorSelecionado,
        professorNome: prof?.nome || "",
        periodo,
        deadline,
        dataProva: dataProva || null,
        alunoIds: alunosSelecionados,
        alunosNomes: alunosDosCiclo.map(a => a.nome),
        criadoEm: new Date().toISOString(),
        status: "ativo",
      });
      await buscarDados();
      setProfessorSelecionado(""); setPeriodo(""); setDeadline(""); setDataProva(""); setAlunosSelecionados([]);
      setMostrarFormulario(false);
    } catch (err) {
      console.error(err);
      alert("Erro ao criar ciclo.");
    } finally {
      setSalvando(false);
    }
  };

  const excluirCiclo = async (id: string) => {
    if (!confirm("Excluir este ciclo?")) return;
    await deleteDoc(doc(db, "ciclos", id));
    await buscarDados();
  };

  const avancarStatus = async (ciclo: Ciclo) => {
    const atual = ciclo.status || "ativo";
    const proximo = PROXIMOS_STATUS[atual];
    if (!proximo) return;

    // Validação: só pode marcar teste aplicado a partir da data da prova
    if (atual === "ativo" && ciclo.dataProva) {
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      const dataP = new Date(ciclo.dataProva + "T00:00:00");
      if (hoje < dataP) {
        alert(
          `A prova está agendada para ${dataP.toLocaleDateString("pt-BR")}.\nNão é possível marcar como aplicada antes dessa data.`
        );
        return;
      }
    }

    if (proximo === "agendamentos_abertos") {
      setCicloAgendando(ciclo.id);
      return;
    }
    await updateDoc(doc(db, "ciclos", ciclo.id), { status: proximo });
    await buscarDados();
  };

  const salvarAgendamento = async () => {
    if (!cicloAgendando || agDias.length === 0 || !agHoraInicio || !agHoraFim || !agDataLimite) {
      alert("Preencha todos os campos!");
      return;
    }
    setSalvandoAg(true);
    try {
      await updateDoc(doc(db, "ciclos", cicloAgendando), {
        status: "agendamentos_abertos",
        agendamento: {
          dias: agDias,
          horaInicio: agHoraInicio,
          horaFim: agHoraFim,
          duracao: parseInt(agDuracao),
          dataLimite: agDataLimite,
        },
      });
      setCicloAgendando(null);
      setAgDias([]); setAgHoraInicio(""); setAgHoraFim(""); setAgDuracao("30"); setAgDataLimite("");
      await buscarDados();
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar agendamento.");
    } finally {
      setSalvandoAg(false);
    }
  };

  const toggleAluno = (id: string) => {
    setAlunosSelecionados(prev =>
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const selecionarTodos = () => {
    if (alunosSelecionados.length === alunosFiltrados.length) {
      setAlunosSelecionados([]);
    } else {
      setAlunosSelecionados(alunosFiltrados.map(a => a.id));
    }
  };

  const getProgressoCiclo = (ciclo: Ciclo) => {
    const total = ciclo.alunoIds.length;
    const feitos = [...new Set(
      relatorios
        .filter(r => ciclo.alunoIds.includes(r.studentId) && r.status === "published" && r.period === ciclo.periodo)
        .map(r => r.studentId)
    )].length;
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

  // Retorna info visual sobre a data da prova
  const getInfoProva = (dataProva?: string) => {
    if (!dataProva) return null;
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const dataP = new Date(dataProva + "T00:00:00");
    const diff = Math.ceil((dataP.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
    const label = dataP.toLocaleDateString("pt-BR");
    if (diff > 0) return { label: `Prova em ${label} (${diff}d)`, bg: "#DBEAFE", color: "#1D4ED8", realizada: false };
    if (diff === 0) return { label: `Prova hoje! ${label}`, bg: "#FEF3C7", color: "#92400E", realizada: false };
    return { label: `Prova realizada em ${label}`, bg: "#D1FAE5", color: "#065F46", realizada: true };
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F0F4F8" }}>
      <Header />
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold" style={{ color: "#573000" }}>Ciclos de Relatórios</h1>
          <button onClick={() => setMostrarFormulario(!mostrarFormulario)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium hover:opacity-90"
            style={{ backgroundColor: "#EC5800" }}>
            <Plus size={20} /> Novo Ciclo
          </button>
        </div>

        {/* Formulário */}
        {mostrarFormulario && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-medium mb-4" style={{ color: "#573000" }}>Criar Novo Ciclo</h2>
            <form onSubmit={criarCiclo} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "#3D3D3D" }}>Professor</label>
                  <select value={professorSelecionado}
                    onChange={(e) => { setProfessorSelecionado(e.target.value); setAlunosSelecionados([]); }}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none" style={{ borderColor: "#E5E7EB" }} required>
                    <option value="">Selecione um professor...</option>
                    {professores.filter(p => p.ativo !== false).map(p => (
                      <option key={p.id} value={p.id}>{p.nome}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "#3D3D3D" }}>Período</label>
                  <select value={periodo} onChange={(e) => setPeriodo(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none" style={{ borderColor: "#E5E7EB" }} required>
                    <option value="">Selecione o período...</option>
                    {periodos.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>

              {/* Deadline + Data da Prova */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "#3D3D3D" }}>Deadline dos relatórios</label>
                  <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none" style={{ borderColor: "#E5E7EB" }} required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "#3D3D3D" }}>
                    Data da prova
                    <span className="ml-1 font-normal" style={{ color: "#9CA3AF" }}>(opcional)</span>
                  </label>
                  <input type="date" value={dataProva} onChange={(e) => setDataProva(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none" style={{ borderColor: "#E5E7EB" }} />
                </div>
              </div>

              {professorSelecionado && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium" style={{ color: "#3D3D3D" }}>
                      Alunos ({alunosSelecionados.length}/{alunosFiltrados.length} selecionados)
                    </label>
                    <button type="button" onClick={selecionarTodos}
                      className="text-sm font-medium" style={{ color: "#EC5800" }}>
                      {alunosSelecionados.length === alunosFiltrados.length ? "Desmarcar todos" : "Selecionar todos"}
                    </button>
                  </div>
                  {alunosFiltrados.length === 0 ? (
                    <p className="text-sm py-3 text-center" style={{ color: "#6B7280" }}>Nenhum aluno ativo vinculado.</p>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {alunosFiltrados.map(aluno => (
                        <label key={aluno.id}
                          className="flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer"
                          style={{
                            borderColor: alunosSelecionados.includes(aluno.id) ? "#EC5800" : "#E5E7EB",
                            backgroundColor: alunosSelecionados.includes(aluno.id) ? "#FFF7ED" : "white"
                          }}>
                          <input type="checkbox" checked={alunosSelecionados.includes(aluno.id)}
                            onChange={() => toggleAluno(aluno.id)}
                            className="w-4 h-4" style={{ accentColor: "#EC5800" }} />
                          <div>
                            <p className="text-sm font-medium" style={{ color: "#3D3D3D" }}>{aluno.nome}</p>
                            <p className="text-xs" style={{ color: "#6B7280" }}>{aluno.turma}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={salvando}
                  className="flex-1 px-6 py-3 rounded-lg text-white font-medium hover:opacity-90 flex items-center justify-center gap-2 disabled:opacity-50"
                  style={{ backgroundColor: "#EC5800" }}>
                  <Calendar size={20} />
                  {salvando ? "Salvando..." : "Criar Ciclo"}
                </button>
                <button type="button" onClick={() => setMostrarFormulario(false)}
                  className="px-6 py-3 rounded-lg font-medium" style={{ backgroundColor: "#E5E7EB", color: "#3D3D3D" }}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Modal agendamento */}
        {cicloAgendando && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold" style={{ color: "#573000" }}>Configurar Agendamentos</h2>
                <button onClick={() => setCicloAgendando(null)}>
                  <X size={20} style={{ color: "#9CA3AF" }} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "#3D3D3D" }}>Dias disponíveis</label>
                  <div className="flex flex-wrap gap-2">
                    {diasSemana.map(dia => (
                      <button key={dia.value} type="button"
                        onClick={() => setAgDias(prev =>
                          prev.includes(dia.value) ? prev.filter(d => d !== dia.value) : [...prev, dia.value]
                        )}
                        className="px-3 py-2 rounded-lg text-sm font-medium border-2 transition-all"
                        style={{
                          borderColor: agDias.includes(dia.value) ? "#8B5CF6" : "#E5E7EB",
                          backgroundColor: agDias.includes(dia.value) ? "#EDE9FE" : "white",
                          color: agDias.includes(dia.value) ? "#5B21B6" : "#3D3D3D",
                        }}>
                        {dia.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "#3D3D3D" }}>Hora início</label>
                    <input type="time" value={agHoraInicio} onChange={(e) => setAgHoraInicio(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none" style={{ borderColor: "#E5E7EB" }} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "#3D3D3D" }}>Hora fim</label>
                    <input type="time" value={agHoraFim} onChange={(e) => setAgHoraFim(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none" style={{ borderColor: "#E5E7EB" }} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "#3D3D3D" }}>Duração</label>
                    <select value={agDuracao} onChange={(e) => setAgDuracao(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none" style={{ borderColor: "#E5E7EB" }}>
                      <option value="30">30 min</option>
                      <option value="45">45 min</option>
                      <option value="60">1 hora</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "#3D3D3D" }}>Data limite para agendamento</label>
                  <input type="date" value={agDataLimite} onChange={(e) => setAgDataLimite(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none" style={{ borderColor: "#E5E7EB" }} />
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={salvarAgendamento} disabled={salvandoAg}
                    className="flex-1 py-3 rounded-xl font-semibold text-white disabled:opacity-50"
                    style={{ backgroundColor: "#8B5CF6" }}>
                    {salvandoAg ? "Salvando..." : "Abrir Agendamentos"}
                  </button>
                  <button onClick={() => setCicloAgendando(null)}
                    className="px-6 py-3 rounded-xl font-medium" style={{ backgroundColor: "#E5E7EB", color: "#3D3D3D" }}>
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Lista */}
        {carregando ? (
          <div className="text-center py-12">
            <div className="w-10 h-10 border-4 border-[#EC5800] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          </div>
        ) : ciclos.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Calendar size={48} className="mx-auto mb-4" style={{ color: "#8B5CF6" }} />
            <p style={{ color: "#3D3D3D" }}>Nenhum ciclo criado ainda.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {ciclos.map(ciclo => {
              const { feitos, total, pct } = getProgressoCiclo(ciclo);
              const prazo = getStatusDeadline(ciclo.deadline);
              const concluido = feitos === total;
              const statusAtual = ciclo.status || "ativo";
              const statusConfig = STATUS_CONFIG[statusAtual as keyof typeof STATUS_CONFIG];
              const proximoBotao = BOTAO_LABEL[statusAtual];
              const infoProva = getInfoProva(ciclo.dataProva);

              return (
                <div key={ciclo.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold" style={{ color: "#070738" }}>
                        {ciclo.professorNome} — {ciclo.turma || ciclo.alunosNomes[0]}
                      </h3>
                      <p className="text-sm mt-1" style={{ color: "#6B7280" }}>{ciclo.periodo}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap justify-end">
                      <span className="px-3 py-1 rounded-full text-xs font-medium"
                        style={{ backgroundColor: statusConfig.bg, color: statusConfig.color }}>
                        {statusConfig.label}
                      </span>
                      <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium"
                        style={{ backgroundColor: prazo.bg, color: prazo.color }}>
                        {prazo.icon} {prazo.label}
                      </span>
                      <button onClick={() => excluirCiclo(ciclo.id)}
                        className="p-1 rounded hover:bg-gray-100" style={{ color: "#9CA3AF" }}>
                        <X size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Badge data da prova */}
                  {infoProva && (
                    <div className="mb-4 flex items-center gap-2 px-3 py-2 rounded-lg w-fit"
                      style={{ backgroundColor: infoProva.bg }}>
                      <FlaskConical size={14} style={{ color: infoProva.color }} />
                      <span className="text-xs font-medium" style={{ color: infoProva.color }}>
                        {infoProva.label}
                      </span>
                    </div>
                  )}

                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span style={{ color: "#3D3D3D" }}>Relatórios publicados</span>
                      <span className="font-medium" style={{ color: concluido ? "#065F46" : "#EC5800" }}>
                        {feitos}/{total} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full" style={{ backgroundColor: "#F0F4F8" }}>
                      <div className="h-2 rounded-full transition-all"
                        style={{ width: `${pct}%`, backgroundColor: concluido ? "#10B981" : "#EC5800" }} />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {ciclo.alunosNomes.map((nome, i) => {
                      const rel = relatorios.find(r => r.studentId === ciclo.alunoIds[i] && r.period === ciclo.periodo);
                      const publicado = rel?.status === "published";
                      return (
                        <span key={i} className="px-3 py-1 rounded-full text-xs font-medium"
                          style={{ backgroundColor: publicado ? "#D1FAE5" : "#F3F4F6", color: publicado ? "#065F46" : "#6B7280" }}>
                          {publicado ? "✓" : "○"} {nome}
                        </span>
                      );
                    })}
                  </div>

                  {statusAtual === "agendamentos_abertos" && ciclo.agendamento && (
                    <div className="mb-4 p-3 rounded-lg flex items-center gap-3" style={{ backgroundColor: "#EDE9FE" }}>
                      <CalendarCheck size={18} style={{ color: "#8B5CF6" }} />
                      <div className="text-sm" style={{ color: "#5B21B6" }}>
                        <span className="font-medium">Agendamentos abertos · </span>
                        {diasSemana.filter(d => ciclo.agendamento!.dias.includes(d.value)).map(d => d.label).join(", ")}
                        {" · "}{ciclo.agendamento.horaInicio}–{ciclo.agendamento.horaFim}
                        {" · até "}{new Date(ciclo.agendamento.dataLimite + "T00:00:00").toLocaleDateString("pt-BR")}
                      </div>
                    </div>
                  )}

                  {proximoBotao && (
                    <button onClick={() => avancarStatus(ciclo)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-90"
                      style={{
                        backgroundColor: statusAtual === "relatorios_pendentes" ? "#8B5CF6" : "#F0F4F8",
                        color: statusAtual === "relatorios_pendentes" ? "white" : "#3D3D3D",
                      }}>
                      <ChevronRight size={16} />
                      {proximoBotao}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
