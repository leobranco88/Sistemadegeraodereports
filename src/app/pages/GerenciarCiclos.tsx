import { useState, useEffect } from "react";
import { Header } from "../components/Header";
import { Plus, Calendar, Clock, CheckCircle, AlertTriangle, X } from "lucide-react";
import { db } from "../../firebase";
import { collection, getDocs, addDoc, deleteDoc, doc, query, orderBy } from "firebase/firestore";

interface Ciclo {
  id: string;
  turma: string;
  professorId: string;
  professorNome: string;
  periodo: string;
  deadline: string;
  alunoIds: string[];
  alunosNomes: string[];
  criadoEm: string;
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
  const [alunosSelecionados, setAlunosSelecionados] = useState<string[]>([]);

  const alunosFiltrados = alunos.filter(a => a.professorId === professorSelecionado && a.ativo !== false);

  useEffect(() => {
    buscarDados();
  }, []);

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
        alunoIds: alunosSelecionados,
        alunosNomes: alunosDosCiclo.map(a => a.nome),
        criadoEm: new Date().toISOString(),
      });
      await buscarDados();
      setProfessorSelecionado(""); setPeriodo(""); setDeadline(""); setAlunosSelecionados([]);
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
    const feitos = relatorios.filter(r =>
      ciclo.alunoIds.includes(r.studentId) &&
      r.status === "published" &&
      r.period === ciclo.periodo
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

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "#3D3D3D" }}>Deadline</label>
                <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none" style={{ borderColor: "#E5E7EB" }} required />
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
                    <p className="text-sm py-3 text-center" style={{ color: "#6B7280" }}>
                      Nenhum aluno ativo vinculado a este professor.
                    </p>
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

        {carregando ? (
          <div className="text-center py-12">
            <div className="w-10 h-10 border-4 border-[#EC5800] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          </div>
        ) : ciclos.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Calendar size={48} className="mx-auto mb-4" style={{ color: "#8B5CF6" }} />
            <p style={{ color: "#3D3D3D" }}>Nenhum ciclo criado ainda.</p>
            <p className="text-sm mt-2" style={{ color: "#6B7280" }}>Clique em "Novo Ciclo" para começar.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {ciclos.map(ciclo => {
              const { feitos, total, pct } = getProgressoCiclo(ciclo);
              const prazo = getStatusDeadline(ciclo.deadline);
              const concluido = feitos === total;
              return (
                <div key={ciclo.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold" style={{ color: "#070738" }}>
                        {ciclo.professorNome} — {ciclo.turma || ciclo.alunosNomes[0]}
                      </h3>
                      <p className="text-sm mt-1" style={{ color: "#6B7280" }}>{ciclo.periodo}</p>
                    </div>
                    <div className="flex items-center gap-2">
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

                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span style={{ color: "#3D3D3D" }}>Relatórios publicados</span>
                      <span className="font-medium" style={{ color: concluido ? "#065F46" : "#EC5800" }}>
                        {feitos}/{total} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full" style={{ backgroundColor: "#F0F4F8" }}>
                      <div className="h-2 rounded-full transition-all duration-300"
                        style={{ width: `${pct}%`, backgroundColor: concluido ? "#10B981" : "#EC5800" }} />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {ciclo.alunosNomes.map((nome, i) => {
                      const rel = relatorios.find(r =>
                        r.studentId === ciclo.alunoIds[i] &&
                        r.period === ciclo.periodo
                      );
                      const publicado = rel?.status === "published";
                      return (
                        <span key={i} className="px-3 py-1 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: publicado ? "#D1FAE5" : "#F3F4F6",
                            color: publicado ? "#065F46" : "#6B7280"
                          }}>
                          {publicado ? "✓" : "○"} {nome}
                        </span>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
