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
