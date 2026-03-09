import { useState, useEffect } from "react";
import { Header } from "../components/Header";
import { Plus, Edit, ToggleLeft, ToggleRight, X } from "lucide-react";
import { db } from "../../firebase";
import { collection, getDocs, addDoc, updateDoc, doc, query, orderBy } from "firebase/firestore";

interface Aluno {
  id: string;
  nome: string;
  turma: string;
  tipo: string;
  ativo: boolean;
  professorId: string;
  professorNome: string;
}

interface Professor {
  id: string;
  nome: string;
  email: string;
}

const turmasDisponiveis = [
  "Kids 1", "Kids 2", "Kids 3", "Kids 4", "Kids 5", "Kids 6",
  "Teens 1", "Teens 2", "Teens 3", "Teens 4", "Teens 5", "Teens 6",
  "Adults 1", "Adults 2", "Adults 3", "Adults 4", "Adults 5", "Adults 6",
];

const tiposDisponiveis = ["Regular", "Intensive", "VIP", "Private"];

export default function GerenciarAlunos() {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [professores, setProfessores] = useState<Professor[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [alunoEditando, setAlunoEditando] = useState<Aluno | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [formNome, setFormNome] = useState("");
  const [formTurma, setFormTurma] = useState(turmasDisponiveis[0]);
  const [formTipo, setFormTipo] = useState("Regular");
  const [formProfessorId, setFormProfessorId] = useState("");

  useEffect(() => {
    buscarDados();
  }, []);

  const buscarDados = async () => {
    try {
      const [alunosSnap, professoresSnap] = await Promise.all([
        getDocs(query(collection(db, "alunos"), orderBy("nome"))),
        getDocs(query(collection(db, "professores"), orderBy("nome"))),
      ]);
      setAlunos(alunosSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Aluno[]);
      setProfessores(professoresSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Professor[]);
    } catch (err) {
      console.error("Erro ao buscar dados:", err);
    } finally {
      setCarregando(false);
    }
  };

  const abrirModalNovo = () => {
    setAlunoEditando(null);
    setFormNome("");
    setFormTurma(turmasDisponiveis[0]);
    setFormTipo("Regular");
    setFormProfessorId(professores[0]?.id || "");
    setMostrarModal(true);
  };

  const abrirModalEditar = (aluno: Aluno) => {
    setAlunoEditando(aluno);
    setFormNome(aluno.nome);
    setFormTurma(aluno.turma);
    setFormTipo(aluno.tipo);
    setFormProfessorId(aluno.professorId || "");
    setMostrarModal(true);
  };

  const salvarAluno = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    const professor = professores.find(p => p.id === formProfessorId);
    try {
      const dados = {
        nome: formNome,
        turma: formTurma,
        tipo: formTipo,
        professorId: formProfessorId,
        professorNome: professor?.nome || "",
      };
      if (alunoEditando) {
        await updateDoc(doc(db, "alunos", alunoEditando.id), dados);
      } else {
        await addDoc(collection(db, "alunos"), { ...dados, ativo: true });
      }
      await buscarDados();
      setMostrarModal(false);
    } catch (err) {
      alert("Erro ao salvar. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  };

  const toggleStatus = async (aluno: Aluno) => {
    try {
      await updateDoc(doc(db, "alunos", aluno.id), { ativo: !aluno.ativo });
      await buscarDados();
    } catch (err) { console.error(err); }
  };

  const getTipoCor = (tipo: string) => {
    switch (tipo) {
      case "VIP": return { bg: "#FEF3C7", color: "#92400E" };
      case "Private": return { bg: "#EDE9FE", color: "#5B21B6" };
      case "Intensive": return { bg: "#DBEAFE", color: "#1E40AF" };
      default: return { bg: "#F3F4F6", color: "#374151" };
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F0F4F8" }}>
      <Header />
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold" style={{ color: "#573000" }}>Alunos</h1>
          <button onClick={abrirModalNovo} className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium hover:opacity-90" style={{ backgroundColor: "#EC5800" }}>
            <Plus size={20} /> Adicionar Aluno
          </button>
        </div>
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {carregando ? (
            <div className="text-center py-12">
              <div className="w-10 h-10 border-4 border-[#EC5800] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p style={{ color: "#3D3D3D" }}>Carregando alunos...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead style={{ backgroundColor: "#070738" }}>
                  <tr>
                    <th className="px-6 py-4 text-left text-white">Nome</th>
                    <th className="px-6 py-4 text-left text-white">Turma</th>
                    <th className="px-6 py-4 text-left text-white">Tipo</th>
                    <th className="px-6 py-4 text-left text-white">Professor</th>
                    <th className="px-6 py-4 text-left text-white">Status</th>
                    <th className="px-6 py-4 text-left text-white">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {alunos.map((aluno, index) => {
                    const tipoCor = getTipoCor(aluno.tipo);
                    return (
                      <tr key={aluno.id} style={{ backgroundColor: index % 2 === 0 ? "#FFFFFF" : "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
                        <td className="px-6 py-4 font-medium" style={{ color: "#3D3D3D" }}>{aluno.nome}</td>
                        <td className="px-6 py-4" style={{ color: "#3D3D3D" }}>{aluno.turma}</td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: tipoCor.bg, color: tipoCor.color }}>{aluno.tipo}</span>
                        </td>
                        <td className="px-6 py-4" style={{ color: "#3D3D3D" }}>{aluno.professorNome || "—"}</td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: aluno.ativo ? "#D1FAE5" : "#F3F4F6", color: aluno.ativo ? "#065F46" : "#6B7280" }}>
                            {aluno.ativo ? "Ativo" : "Inativo"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button onClick={() => abrirModalEditar(aluno)} className="p-2 rounded-lg hover:bg-gray-100" style={{ color: "#8B5CF6" }}><Edit size={18} /></button>
                            <button onClick={() => toggleStatus(aluno)} className="p-2 rounded-lg hover:bg-gray-100" style={{ color: aluno.ativo ? "#EC5800" : "#10B981" }}>
                              {aluno.ativo ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {alunos.length === 0 && <div className="text-center py-12" style={{ color: "#3D3D3D" }}>Nenhum aluno cadastrado ainda.</div>}
            </div>
          )}
        </div>
      </div>

      {mostrarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
            <div className="border-b px-6 py-4 flex justify-between items-center" style={{ borderColor: "#E5E7EB" }}>
              <h2 className="text-xl font-bold" style={{ color: "#573000" }}>{alunoEditando ? "Editar Aluno" : "Adicionar Aluno"}</h2>
              <button onClick={() => setMostrarModal(false)} className="p-2 rounded-lg hover:bg-gray-100" style={{ color: "#3D3D3D" }}><X size={20} /></button>
            </div>
            <form onSubmit={salvarAluno} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "#3D3D3D" }}>Nome Completo</label>
                <input type="text" value={formNome} onChange={(e) => setFormNome(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:outline-none" style={{ borderColor: "#E5E7EB" }} placeholder="Ex: Erik Yutta" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "#3D3D3D" }}>Turma</label>
                <select value={formTurma} onChange={(e) => setFormTurma(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:outline-none" style={{ borderColor: "#E5E7EB" }} required>
                  {["Kids", "Teens", "Adults"].map(grupo => (
                    <optgroup key={grupo} label={grupo}>
                      {turmasDisponiveis.filter(t => t.startsWith(grupo)).map(turma => (
                        <option key={turma} value={turma}>{turma}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "#3D3D3D" }}>Professor Responsável</label>
                <select value={formProfessorId} onChange={(e) => setFormProfessorId(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:outline-none" style={{ borderColor: "#E5E7EB" }} required>
                  <option value="">Selecione um professor</option>
                  {professores.map(p => (
                    <option key={p.id} value={p.id}>{p.nome}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "#3D3D3D" }}>Tipo de Aula</label>
                <div className="grid grid-cols-2 gap-2">
                  {tiposDisponiveis.map(tipo => {
                    const cor = getTipoCor(tipo);
                    return (
                      <label key={tipo} className="flex items-center gap-2 cursor-pointer p-3 rounded-lg border" style={{ borderColor: formTipo === tipo ? "#EC5800" : "#E5E7EB", backgroundColor: formTipo === tipo ? "#FFF7ED" : "white" }}>
                        <input type="radio" name="tipo" value={tipo} checked={formTipo === tipo} onChange={() => setFormTipo(tipo)} className="w-4 h-4" style={{ accentColor: "#EC5800" }} />
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: cor.bg, color: cor.color }}>{tipo}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={salvando} className="flex-1 px-4 py-3 rounded-lg text-white font-medium hover:opacity-90 disabled:opacity-50" style={{ backgroundColor: "#EC5800" }}>
                  {salvando ? "Salvando..." : "Salvar"}
                </button>
                <button type="button" onClick={() => setMostrarModal(false)} className="flex-1 px-4 py-3 rounded-lg font-medium" style={{ backgroundColor: "#E5E7EB", color: "#3D3D3D" }}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
