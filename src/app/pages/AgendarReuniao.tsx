import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Logo } from "../components/Logo";
import { db } from "../../firebase";
import { collection, getDocs, query, where, doc, updateDoc, orderBy } from "firebase/firestore";
import { CheckCircle, Clock, GraduationCap } from "lucide-react";

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

type Tela = "lista" | "confirmacao" | "sucesso";

export function AgendarReuniao() {
  const { professorId } = useParams();
  const [searchParams] = useSearchParams();
  const aluno = searchParams.get("aluno") || "";
  const reportId = searchParams.get("reportId") || "";

  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [tela, setTela] = useState<Tela>("lista");
  const [horarioSelecionado, setHorarioSelecionado] = useState<Horario | null>(null);
  const [nomePai, setNomePai] = useState("");
  const [confirmando, setConfirmando] = useState(false);
  const [professorNome, setProfessorNome] = useState("");

  useEffect(() => {
    const buscar = async () => {
      if (!professorId) { setCarregando(false); return; }
      try {
        const snap = await getDocs(
          query(
            collection(db, "horarios"),
            where("professorId", "==", professorId),
            where("status", "==", "livre"),
            orderBy("data"),
          )
        );
        const dados = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Horario[];
        setHorarios(dados);
        if (dados.length > 0) setProfessorNome(dados[0].professor);
      } catch (err) {
        console.error("Erro ao buscar horários:", err);
      } finally {
        setCarregando(false);
      }
    };
    buscar();
  }, [professorId]);

  const selecionarHorario = (h: Horario) => {
    setHorarioSelecionado(h);
    setTela("confirmacao");
  };

  const confirmarAgendamento = async () => {
    if (!nomePai.trim()) { alert("Por favor, informe seu nome."); return; }
    if (!horarioSelecionado) return;
    setConfirmando(true);
    try {
      await updateDoc(doc(db, "horarios", horarioSelecionado.id), {
        status: "confirmado",
        nomePai: nomePai.trim(),
        aluno: aluno,
        reportId: reportId,
        confirmedAt: new Date().toISOString(),
      });
      setTela("sucesso");
    } catch (err) {
      console.error("Erro ao confirmar:", err);
      alert("Erro ao confirmar agendamento. Tente novamente.");
    } finally {
      setConfirmando(false);
    }
  };

  const formatarData = (data: string, hora: string) => {
    const diasPT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    const [dia, mes] = data.split("/");
    const date = new Date(2026, parseInt(mes) - 1, parseInt(dia));
    return `${diasPT[date.getDay()]}, ${dia}/${mes} · ${hora}`;
  };

  if (carregando) {
    return (
      <div className="min-h-screen bg-[#F0F4F8] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[#EC5800] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p style={{ color: "#3D3D3D" }}>Carregando horários...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F4F8]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-center">
          <Logo />
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 py-8">

        {/* TELA 1 — Lista de horários */}
        {tela === "lista" && (
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h1 className="text-2xl font-bold mb-1" style={{ color: "#070738" }}>{aluno}</h1>
            <div className="flex items-center gap-2 mb-6 pb-6 border-b" style={{ borderColor: "#E5E7EB" }}>
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#8B5CF6" }} />
              <span className="text-sm" style={{ color: "#8B5CF6" }}>Prof. {professorNome}</span>
            </div>

            <h2 className="text-lg font-semibold mb-4" style={{ color: "#070738" }}>
              Escolha um horário disponível
            </h2>

            {horarios.length === 0 ? (
              <div className="text-center py-8">
                <Clock size={40} className="mx-auto mb-3" style={{ color: "#9CA3AF" }} />
                <p style={{ color: "#6B7280" }}>Nenhum horário disponível no momento.</p>
                <p className="text-sm mt-1" style={{ color: "#9CA3AF" }}>Entre em contato com a escola pelo WhatsApp.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {horarios.map(h => (
                  <button
                    key={h.id}
                    onClick={() => selecionarHorario(h)}
                    className="w-full py-4 px-5 rounded-xl border-2 text-left font-medium transition-all hover:border-[#8B5CF6] hover:bg-purple-50"
                    style={{ borderColor: "#E5E7EB", color: "#070738" }}
                  >
                    {formatarData(h.data, h.hora)}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TELA 2 — Confirmação */}
        {tela === "confirmacao" && horarioSelecionado && (
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h1 className="text-2xl font-bold mb-1" style={{ color: "#070738" }}>{aluno}</h1>
            <div className="flex items-center gap-2 mb-6 pb-6 border-b" style={{ borderColor: "#E5E7EB" }}>
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#8B5CF6" }} />
              <span className="text-sm" style={{ color: "#8B5CF6" }}>Prof. {professorNome}</span>
            </div>

            {/* Horário selecionado */}
            <div className="rounded-xl p-4 mb-6" style={{ backgroundColor: "#EDE9FE" }}>
              <p className="text-xs mb-1" style={{ color: "#8B5CF6" }}>Horário selecionado:</p>
              <p className="text-lg font-bold" style={{ color: "#070738" }}>
                {formatarData(horarioSelecionado.data, horarioSelecionado.hora)}
              </p>
            </div>

            {/* Nome do responsável */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2" style={{ color: "#3D3D3D" }}>
                Seu nome (responsável)
              </label>
              <input
                type="text"
                value={nomePai}
                onChange={(e) => setNomePai(e.target.value)}
                placeholder="Digite seu nome completo"
                className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-[#8B5CF6]"
                style={{ borderColor: "#E5E7EB", color: "#070738" }}
              />
            </div>

            <button
              onClick={confirmarAgendamento}
              disabled={confirmando || !nomePai.trim()}
              className="w-full py-4 rounded-xl font-semibold text-white mb-3 transition-all disabled:opacity-50"
              style={{ backgroundColor: "#EC5800" }}
            >
              {confirmando ? "Confirmando..." : "Confirmar Agendamento"}
            </button>

            <button
              onClick={() => setTela("lista")}
              className="w-full py-4 rounded-xl font-semibold border-2 transition-all"
              style={{ borderColor: "#8B5CF6", color: "#8B5CF6" }}
            >
              Voltar
            </button>
          </div>
        )}

        {/* TELA 3 — Sucesso */}
        {tela === "sucesso" && horarioSelecionado && (
          <div className="bg-white rounded-2xl shadow-md p-6 text-center">
            <div className="w-16 h-16 bg-[#16A34A] rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-white" />
            </div>

            <h2 className="text-xl font-bold mb-1" style={{ color: "#070738" }}>
              Reunião agendada com sucesso!
            </h2>
            <p className="text-sm mb-6" style={{ color: "#6B7280" }}>
              Confirmamos seu agendamento com Prof. {professorNome}
            </p>

            {/* Resumo */}
            <div className="rounded-xl p-5 mb-6 text-left space-y-3" style={{ backgroundColor: "#F0F4F8" }}>
              <div>
                <p className="text-xs mb-1" style={{ color: "#9CA3AF" }}>Responsável:</p>
                <p className="font-semibold" style={{ color: "#070738" }}>{nomePai}</p>
              </div>
              <div>
                <p className="text-xs mb-1" style={{ color: "#9CA3AF" }}>Aluno:</p>
                <p className="font-semibold" style={{ color: "#070738" }}>{aluno}</p>
              </div>
              <div>
                <p className="text-xs mb-1" style={{ color: "#9CA3AF" }}>Data e horário:</p>
                <p className="font-semibold" style={{ color: "#EC5800" }}>
                  {formatarData(horarioSelecionado.data, horarioSelecionado.hora)}
                </p>
              </div>
            </div>

            {reportId && (
              <button
                onClick={() => window.location.href = `/report/view/${reportId}`}
                className="w-full py-4 rounded-xl font-semibold text-white transition-all"
                style={{ backgroundColor: "#8B5CF6" }}
              >
                Voltar ao relatório
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
