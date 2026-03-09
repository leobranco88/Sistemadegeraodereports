import { useState, useEffect } from "react";
import { Header } from "../components/Header";
import { Plus, Clock, CheckCircle, User, GraduationCap, Calendar, X } from "lucide-react";
import { db } from "../../firebase";
import { collection, getDocs, addDoc, query, orderBy, where } from "firebase/firestore";

interface Horario {
  id: string;
  data: string;
  hora: string;
  status: "livre" | "ocupado" | "confirmado";
  professor: string;
  professorId: string;
  nomePai?: string;
  aluno?: string;
}

interface Professor {
  id: string;
  nome: string;
  ativo: boolean;
}

const diasSemana = [
  { label: "Seg", value: 1 },
  { label: "Ter", value: 2 },
  { label: "Qua", value: 3 },
  { label: "Qui", value: 4 },
  { label: "Sex", value: 5 },
  { label: "Sáb", value: 6 },
  { label: "Dom", value: 0 },
];

export default function GerenciarHorarios() {
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [professores, setProfessores] = useState<Professor[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [gerando, setGerando] = useState(false);

  const [filtroProfessor, setFiltroProfessor] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");

  const [professorSelecionado, setProfessorSelecionado] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [diasSelecionados, setDiasSelecionados] = useState<number[]>([]);
  const [horarioInicio, setHorarioInicio] = useState("");
  const [horarioFim, setHorarioFim] = useState("");
  const [duracaoReuniao, setDuracaoReuniao] = useState("30");

  useEffect(() => {
    buscarDados();
  }, []);

  const buscarDados = async () => {
    try {
      const [snapProfessores, snapHorarios] = await Promise.all([
        getDocs(query(collection(db, "professores"), orderBy("nome"))),
        getDocs(query(collection(db, "horarios"), orderBy("data"))),
      ]);
      setProfessores(snapProfessores.docs.map(d => ({ id: d.id, ...d.data() })) as Professor[]);
      setHorarios(snapHorarios.docs.map(d => ({ id: d.id, ...d.data() })) as Horario[]);
    } catch (err) {
      console.error("Erro ao buscar dados:", err);
    } finally {
      setCarregando(false);
    }
  };

  const atualizarHorarioFim = (inicio: string, duracao: string) => {
    if (!inicio || !duracao) return;
    const [h, m] = inicio.split(":").map(Number);
    const total = h * 60 + m + parseInt(duracao);
    setHorarioFim(`${Math.floor(total / 60).toString().padStart(2, "0")}:${(total % 60).toString().padStart(2, "0")}`);
  };

  const limparFiltros = () => { setFiltroProfessor(""); setFiltroStatus(""); };

  const horariosFiltrados = horarios.filter(h => {
    const matchProf = !filtroProfessor || h.professorId === filtroProfessor;
    const matchStatus = !filtroStatus || h.status === filtroStatus;
    return matchProf && matchStatus;
  });

  const gerarHorarios = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!professorSelecionado || !dataInicio || !dataFim || diasSelecionados.length === 0 || !horarioInicio || !horarioFim) {
      alert("Preencha todos os campos!");
      return;
    }
    setGerando(true);
    try {
      const prof = professores.find(p => p.id === professorSelecionado);
      const novosHorarios: Omit<Horario, "id">[] = [];
      const inicio = new Date(dataInicio + "T00:00:00");
      const fim = new Date(dataFim + "T00:00:00");

      for (let data = new Date(inicio); data <= fim; data.setDate(data.getDate() + 1)) {
        if (diasSelecionados.includes(data.getDay())) {
          const [hIni, mIni] = horarioInicio.split(":").map(Number);
          const [hFim, mFim] = horarioFim.split(":").map(Number);
          let atual = hIni * 60 + mIni;
          const final = hFim * 60 + mFim;
          const dur = parseInt(duracaoReuniao);
          while (atual + dur <= final) {
            novosHorarios.push({
              data: data.toLocaleDateString("pt-BR"),
              hora: `${Math.floor(atual / 60).toString().padStart(2, "0")}:${(atual % 60).toString().padStart(2, "0")}`,
              status: "livre",
              professor: prof?.nome || "",
              professorId: professorSelecionado,
            });
            atual += dur;
          }
        }
      }

      for (const h of novosHorarios) {
        await addDoc(collection(db, "horarios"), h);
      }

      await buscarDados();
      setProfessorSelecionado(""); setDataInicio(""); setDataFim("");
      setDiasSelecionados([]); setHorarioInicio(""); setHorarioFim(""); setDuracaoReuniao("30");
      setMostrarFormulario(false);
      alert(`${novosHorarios.length} horários gerados com sucesso!`);
    } catch (err) {
      console.error(err);
      alert("Erro ao gerar horários.");
    } finally {
      setGerando(false);
    }
  };

  const getStatusIcon = (status: string) => {
    if (status === "livre") return <CheckCircle size={20} style={{ color: "#10B981" }} />;
    if (status === "ocupado") return <Clock size={20} style={{ color: "#F59E0B" }} />;
    return <User size={20} style={{ color: "#8B5CF6" }} />;
  };

  const getStatusColor = (status: string) => {
    if (status === "livre") return { bg: "#D1FAE5", text: "#065F46" };
    if (status === "ocupado") return { bg: "#FEF3C7", text: "#92400E" };
    return { bg: "#EDE9FE", text: "#5B21B6" };
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F0F4F8" }}>
      <Header />
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold" style={{ color: "#573000" }}>Gerenciar Horários de Reuniões</h1>
          <button onClick={() => setMostrarFormulario(!mostrarFormulario)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium hover:opacity-90"
            style={{ backgroundColor: "#EC5800" }}>
            <Plus size={20} /> Criar Agenda de Reuniões
          </button>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "#3D3D3D" }}>Filtrar por Professor</label>
              <select value={filtroProfessor} onChange={(e) => setFiltroProfessor(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none" style={{ borderColor: "#E5E7EB" }}>
                <option value="">Todos os professores</option>
                {professores.filter(p => p.ativo !== false).map(p => (
                  <option key={p.id} value={p.id}>{p.nome}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "#3D3D3D" }}>Filtrar por Status</label>
              <select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none" style={{ borderColor: "#E5E7EB" }}>
                <option value="">Todos</option>
                <option value="livre">Livre</option>
                <option value="confirmado">Confirmado</option>
                <option value="ocupado">Ocupado</option>
              </select>
            </div>
            <button onClick={limparFiltros}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium text-white"
              style={{ backgroundColor: "#8B5CF6" }}>
              <X size={18} /> Limpar Filtros
            </button>
          </div>
        </div>

        {/* Formulário */}
        {mostrarFormulario && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-medium mb-4" style={{ color: "#573000" }}>Criar Agenda de Reuniões</h2>
            <form onSubmit={gerarHorarios} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "#3D3D3D" }}>Professor</label>
                <select value={professorSelecionado} onChange={(e) => setProfessorSelecionado(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none" style={{ borderColor: "#E5E7EB" }} required>
                  <option value="">Selecione um professor...</option>
                  {professores.filter(p => p.ativo !== false).map(p => (
                    <option key={p.id} value={p.id}>{p.nome}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "#3D3D3D" }}>Data Início</label>
                  <input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none" style={{ borderColor: "#E5E7EB" }} required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "#3D3D3D" }}>Data Fim</label>
                  <input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none" style={{ borderColor: "#E5E7EB" }} required />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-3" style={{ color: "#3D3D3D" }}>Dias da Semana</label>
                <div className="flex flex-wrap gap-3">
                  {diasSemana.map(dia => (
                    <label key={dia.value} className="flex items-center gap-2 cursor-pointer px-4 py-2 border rounded-lg"
                      style={{
                        borderColor: diasSelecionados.includes(dia.value) ? "#EC5800" : "#E5E7EB",
                        backgroundColor: diasSelecionados.includes(dia.value) ? "#FFF7ED" : "white"
                      }}>
                      <input type="checkbox" checked={diasSelecionados.includes(dia.value)}
                        onChange={() => setDiasSelecionados(prev =>
                          prev.includes(dia.value) ? prev.filter(d => d !== dia.value) : [...prev, dia.value]
                        )}
                        className="w-4 h-4" style={{ accentColor: "#EC5800" }} />
                      <span className="text-sm font-medium" style={{ color: "#3D3D3D" }}>{dia.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "#3D3D3D" }}>Horário de Início</label>
                  <input type="time" value={horarioInicio}
                    onChange={(e) => { setHorarioInicio(e.target.value); atualizarHorarioFim(e.target.value, duracaoReuniao); }}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none" style={{ borderColor: "#E5E7EB" }} required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "#3D3D3D" }}>Horário de Fim</label>
                  <input type="time" value={horarioFim} onChange={(e) => setHorarioFim(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none"
                    style={{ borderColor: "#E5E7EB", backgroundColor: "#F9FAFB" }} required />
                  <p className="text-xs mt-1" style={{ color: "#6B7280" }}>Preenchido automaticamente</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "#3D3D3D" }}>Duração</label>
                  <select value={duracaoReuniao}
                    onChange={(e) => { setDuracaoReuniao(e.target.value); atualizarHorarioFim(horarioInicio, e.target.value); }}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none" style={{ borderColor: "#E5E7EB" }}>
                    <option value="30">30 minutos</option>
                    <option value="45">45 minutos</option>
                    <option value="60">1 hora</option>
                    <option value="90">1 hora e 30 minutos</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="submit" disabled={gerando}
                  className="flex-1 px-6 py-3 rounded-lg text-white font-medium hover:opacity-90 flex items-center justify-center gap-2 disabled:opacity-50"
                  style={{ backgroundColor: "#EC5800" }}>
                  <Calendar size={20} />
                  {gerando ? "Gerando..." : "Gerar Horários"}
                </button>
                <button type="button" onClick={() => setMostrarFormulario(false)}
                  className="px-6 py-3 rounded-lg font-medium" style={{ backgroundColor: "#E5E7EB", color: "#3D3D3D" }}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[
            { label: "Total de Horários", value: horarios.length, icon: <Calendar size={24} style={{ color: "#8B5CF6" }} />, bg: "#EDE9FE" },
            { label: "Horários Livres", value: horarios.filter(h => h.status === "livre").length, icon: <CheckCircle size={24} style={{ color: "#10B981" }} />, bg: "#D1FAE5" },
            { label: "Reuniões Confirmadas", value: horarios.filter(h => h.status === "confirmado").length, icon: <User size={24} style={{ color: "#8B5CF6" }} />, bg: "#EDE9FE" },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm" style={{ color: "#6B7280" }}>{stat.label}</p>
                  <p className="text-2xl font-bold mt-1" style={{ color: "#573000" }}>{stat.value}</p>
                </div>
                <div className="p-3 rounded-lg" style={{ backgroundColor: stat.bg }}>{stat.icon}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Cards de Horários */}
        {carregando ? (
          <div className="text-center py-12">
            <div className="w-10 h-10 border-4 border-[#EC5800] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {horariosFiltrados.map(horario => {
              const cor = getStatusColor(horario.status);
              return (
                <div key={horario.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-2 mb-4">
                    {getStatusIcon(horario.status)}
                    <span className="px-3 py-1 rounded-full text-sm font-medium capitalize"
                      style={{ backgroundColor: cor.bg, color: cor.text }}>
                      {horario.status}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Clock size={16} style={{ color: "#8B5CF6" }} />
                      <span className="font-medium" style={{ color: "#573000" }}>{horario.data} às {horario.hora}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <GraduationCap size={16} style={{ color: "#8B5CF6" }} />
                      <span className="text-sm" style={{ color: "#3D3D3D" }}>{horario.professor}</span>
                    </div>
                    {horario.status === "confirmado" && horario.nomePai && (
                      <div className="mt-3 pt-3 border-t" style={{ borderColor: "#E5E7EB" }}>
                        <div className="flex items-center gap-2 mb-1">
                          <User size={14} style={{ color: "#8B5CF6" }} />
                          <span className="text-sm font-medium" style={{ color: "#3D3D3D" }}>{horario.nomePai}</span>
                        </div>
                        {horario.aluno && (
                          <div className="text-sm ml-6" style={{ color: "#6B7280" }}>Aluno: {horario.aluno}</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            {horariosFiltrados.length === 0 && (
              <div className="col-span-3 bg-white rounded-lg shadow-md p-12 text-center">
                <Calendar size={48} className="mx-auto mb-4" style={{ color: "#8B5CF6" }} />
                <p style={{ color: "#3D3D3D" }}>Nenhum horário encontrado.</p>
                <p className="text-sm mt-2" style={{ color: "#6B7280" }}>Clique em "Criar Agenda de Reuniões" para começar.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
