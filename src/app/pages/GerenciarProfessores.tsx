import { useState, useEffect } from "react";
import { Header } from "../components/Header";
import { Plus, Edit, ToggleLeft, ToggleRight, X } from "lucide-react";
import { db } from "../../firebase";
import { collection, getDocs, addDoc, updateDoc, doc, query, orderBy } from "firebase/firestore";

interface Professor {
  id: string;
  nome: string;
  email: string;
  turmas: string[];
  ativo: boolean;
}

const turmasDisponiveis = [
  "Kids 1", "Kids 2", "Kids 3", "Kids 4", "Kids 5", "Kids 6",
  "Teens 1", "Teens 2", "Teens 3", "Teens 4", "Teens 5", "Teens 6",
  "Adults 1", "Adults 2", "Adults 3", "Adults 4", "Adults 5", "Adults 6",
];

const grupos = [
  { label: "Kids", turmas: turmasDisponiveis.filter(t => t.startsWith("Kids")) },
  { label: "Teens", turmas: turmasDisponiveis.filter(t => t.startsWith("Teens")) },
  { label: "Adults", turmas: turmasDisponiveis.filter(t => t.startsWith("Adults")) },
];

export default function GerenciarProfessores() {
  const [professores, setProfessores] = useState<Professor[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [professorEditando, setProfessorEditando] = useState<Professor | null>(null);
  const [salvando, setSalvando] = useState(false);

  const [formNome, setFormNome] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formTurmas, setFormTurmas] = useState<string[]>([]);

  useEffect(() => {
    buscarProfessores();
  }, []);

  const buscarProfessores = async () => {
    try {
      const q = query(collection(db, "professores"), orderBy("nome"));
      const snapshot = await getDocs(q);
      const dados = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        turmas: doc.data().turmas || [],
      })) as Professor[];
      setProfessores(dados);
    } catch (err) {
      console.error("Erro ao buscar professores:", err);
    } finally {
      setCarregando(false);
    }
  };

  const abrirModalNovo = () => {
    setProfessorEditando(null);
    setFormNome("");
    setFormEmail("");
    setFormTurmas([]);
    setMostrarModal(true);
  };

  const abrirModalEditar = (professor: Professor) => {
    setProfessorEditando(professor);
    setFormNome(professor.nome);
    setFormEmail(professor.email);
    setFormTurmas(professor.turmas || []);
    setMostrarModal(true);
  };

  const salvarProfessor = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    try {
      if (professorEditando) {
        await updateDoc(doc(db, "professores", professorEditando.id), {
          nome: formNome,
          email: formEmail,
          turmas: formTurmas,
        });
      } else {
        await addDoc(collection(db, "professores"), {
          nome: formNome,
          email: formEmail,
          turmas: formTurmas,
          ativo: true,
        });
      }
      await buscarProfessores();
      setMostrarModal(false);
    } catch (err) {
      console.error("Erro ao salvar professor:", err);
      alert("Erro ao salvar. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  };

  const toggleStatus = async (professor: Professor) => {
    try {
      await updateDoc(doc(db, "professores", professor.id), { ativo: !professor.ativo });
      await buscarProfessores();
    } catch (err) {
      console.error("Erro ao atualizar status:", err);
    }
  };

  const toggleTurma = (turma: string) => {
    setFormTurmas(prev =>
      prev.includes(turma) ? prev.filter(t => t !== turma) : [...prev, turma]
    );
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F0F4F8" }}>
      <Header />
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold" style={{ color: "#573000" }}>Professores</h1>
          <button onClick={abrirModalNovo}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
            style={{ backgroundColor: "#EC5800" }}>
            <Plus size={20} />
            Adicionar Professor
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {carregando ? (
            <div className="text-center py-12">
              <div className="w-10 h-10 border-4 border-[#EC5800] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p style={{ color: "#3D3D3D" }}>Carregando professores...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead style={{ backgroundColor: "#070738" }}>
                  <tr>
                    <th className="px-6 py-4 text-left text-white">Nome</th>
                    <th className="px-6 py-4 text-left text-white">Email</th>
                    <th className="px-6 py-4 text-left text-white">Turmas</th>
                    <th className="px-6 py-4 text-left text-white">Status</th>
                    <th className="px-6 py-4 text-left text-white">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {professores.map((professor, index) => (
                    <tr key={professor.id} style={{
                      backgroundColor: index % 2 === 0 ? "#FFFFFF" : "#F9FAFB",
                      borderBottom: "1px solid #E5E7EB"
                    }}>
                      <td className="px-6 py-4" style={{ color: "#3D3D3D" }}>{professor.nome}</td>
                      <td className="px-6 py-4" style={{ color: "#3D3D3D" }}>{professor.email}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {(professor.turmas || []).map((turma, idx) => (
                            <span key={idx} className="px-2 py-1 rounded text-xs font-medium"
                              style={{ backgroundColor: "#EDE9FE", color: "#5B21B6" }}>
                              {turma}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded-full text-sm font-medium"
                          style={{
                            backgroundColor: professor.ativo ? "#D1FAE5" : "#F3F4F6",
                            color: professor.ativo ? "#065F46" : "#6B7280"
                          }}>
                          {professor.ativo ? "Ativo" : "Inativo"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => abrirModalEditar(professor)}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            style={{ color: "#8B5CF6" }}><Edit size={18} /></button>
                          <button onClick={() => toggleStatus(professor)}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            style={{ color: professor.ativo ? "#EC5800" : "#10B981" }}>
                            {professor.ativo ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {professores.length === 0 && (
                <div className="text-center py-12" style={{ color: "#3D3D3D" }}>
                  Nenhum professor cadastrado ainda. Clique em "Adicionar Professor" para começar.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {mostrarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center"
              style={{ borderColor: "#E5E7EB" }}>
              <h2 className="text-xl font-bold" style={{ color: "#573000" }}>
                {professorEditando ? "Editar Professor" : "Adicionar Professor"}
              </h2>
              <button onClick={() => setMostrarModal(false)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                style={{ color: "#3D3D3D" }}><X size={20} /></button>
            </div>

            <form onSubmit={salvarProfessor} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "#3D3D3D" }}>Nome Completo</label>
                <input type="text" value={formNome} onChange={(e) => setFormNome(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ borderColor: "#E5E7EB" }} placeholder="Ex: Duda Santos" required />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "#3D3D3D" }}>Email</label>
                <input type="email" value={formEmail} onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ borderColor: "#E5E7EB" }} placeholder="professor@eicschool.com.br" required />
              </div>

              <div>
                <label className="block text-sm font-medium mb-3" style={{ color: "#3D3D3D" }}>Turmas que Leciona</label>
                <div className="space-y-4">
                  {grupos.map(grupo => (
                    <div key={grupo.label}>
                      <p className="text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: "#9CA3AF" }}>
                        {grupo.label}
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        {grupo.turmas.map(turma => (
                          <label key={turma}
                            className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded border"
                            style={{
                              borderColor: formTurmas.includes(turma) ? "#EC5800" : "#E5E7EB",
                              backgroundColor: formTurmas.includes(turma) ? "#FFF7ED" : "white"
                            }}>
                            <input type="checkbox" checked={formTurmas.includes(turma)}
                              onChange={() => toggleTurma(turma)}
                              className="w-4 h-4 rounded" style={{ accentColor: "#EC5800" }} />
                            <span className="text-sm" style={{ color: "#3D3D3D" }}>{turma}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="submit" disabled={salvando}
                  className="flex-1 px-4 py-3 rounded-lg text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                  style={{ backgroundColor: "#EC5800" }}>
                  {salvando ? "Salvando..." : "Salvar"}
                </button>
                <button type="button" onClick={() => setMostrarModal(false)}
                  className="flex-1 px-4 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: "#E5E7EB", color: "#3D3D3D" }}>
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
