import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Logo } from "../components/Logo";
import { db } from "../../firebase";
import { doc, getDoc, collection, getDocs, query, where, addDoc } from "firebase/firestore";
import { CheckCircle, Clock } from "lucide-react";

interface Slot {
  data: string;       // "10/03/2026"
  hora: string;       // "09:30"
  diaSemana: number;  // 1 = seg
  chave: string;      // "10/03/2026-09:30" — chave única
}

interface Agendamento {
  dias: number[];
  horaInicio: string;
  horaFim: string;
  duracao: number;
  dataLimite: string;
}

interface Ciclo {
  id: string;
  professorId: string;
  professorNome: string;
  turma: string;
  periodo: string;
  agendamento?: Agendamento;
}

interface Confirmado {
  cicloId: string;
  chave: string;
}

type Tela = "lista" | "confirmacao" | "sucesso";

// Gera todos os slots possíveis a partir das regras do ciclo
function gerarSlots(ag: Agendamento): Slot[] {
  const slots: Slot[] = [];
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const limite = new Date(ag.dataLimite + "T00:00:00");

  for (let d = new Date(hoje); d <= limite; d.setDate(d.getDate() + 1)) {
    if (!ag.dias.includes(d.getDay())) continue;
    const [hIni, mIni] = ag.horaInicio.split(":").map(Number);
    const [hFim, mFim] = ag.horaFim.split(":").map(Number);
    let atual = hIni * 60 + mIni;
    const final = hFim * 60 + mFim;
    while (atual + ag.duracao <= final) {
      const hora = `${Math.floor(atual / 60).toString().padStart(2, "0")}:${(atual % 60).toString().padStart(2, "0")}`;
      const data = d.toLocaleDateString("pt-BR");
      slots.push({ data, hora, diaSemana: d.getDay(), chave: `${data}-${hora}` });
      atual += ag.duracao;
    }
  }
  return slots;
}

function formatarSlot(slot: Slot) {
  const diasPT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const [dia, mes] = slot.data.split("/");
  return `${diasPT[slot.diaSemana]}, ${dia}/${mes} · ${slot.hora}`;
}

export function AgendarReuniao() {
  const { cicloId } = useParams();
  const [searchParams] = useSearchParams();
  const aluno = searchParams.get("aluno") || "";
  const reportId = searchParams.get("reportId") || "";

  const [ciclo, setCiclo] = useState<Ciclo | null>(null);
  const [slotsLivres, setSlotsLivres] = useState<Slot[]>([]);
  const [carregando, setCarregando] = useState(true);

  const [tela, setTela] = useState<Tela>("lista");
  const [slotSelecionado, setSlotSelecionado] = useState<Slot | null>(null);
  const [nomePai, setNomePai] = useState("");
  const [confirmando, setConfirmando] = useState(false);

  useEffect(() => {
    const buscar = async () => {
      if (!cicloId) { setCarregando(false); return; }
      try {
        // Busca o ciclo
        const cicloSnap = await getDoc(doc(db, "ciclos", cicloId));
        if (!cicloSnap.exists()) { setCarregando(false); return; }
        const cicloData = { id: cicloSnap.id, ...cicloSnap.data() } as Ciclo;
        setCiclo(cicloData);

        if (!cicloData.agendamento) { setCarregando(false); return; }

        // Gera todos os slots possíveis
        const todos = gerarSlots(cicloData.agendamento);

        // Busca os já confirmados para este ciclo
        const snapConfirmados = await getDocs(
          query(collection(db, "reunioes"), where("cicloId", "==", cicloId))
        );
        const confirmados = snapConfirmados.docs.map(d => d.data().chave as string);

        // Remove os já ocupados
        setSlotsLivres(todos.filter(s => !confirmados.includes(s.chave)));
      } catch (err) {
        console.error("Erro ao carregar:", err);
      } finally {
        setCarregando(false);
      }
    };
    buscar();
  }, [cicloId]);

  const confirmarAgendamento = async () => {
    if (!nomePai.trim()) { alert("Por favor, informe seu nome."); return; }
    if (!slotSelecionado || !ciclo) return;
    setConfirmando(true);
    try {
      await addDoc(collection(db, "reunioes"), {
        cicloId,
        reportId,
        aluno,
        nomePai: nomePai.trim(),
        professorId: ciclo.professorId,
        professorNome: ciclo.professorNome,
        data: slotSelecionado.data,
        hora: slotSelecionado.hora,
        chave: slotSelecionado.chave,
        confirmedAt: new Date().toISOString(),
      });
      setTela("sucesso");
    } catch (err) {
      console.error(err);
      alert("Erro ao confirmar. Tente novamente.");
    } finally {
      setConfirmando(false);
    }
  };

  if (carregando) {
    return (
      <div className="min-h-screen bg-[#F0F4F8] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#EC5800] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!ciclo || !ciclo.agendamento) {
    return (
      <div className="min-h-screen bg-[#F0F4F8] flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-md p-8 text-center max-w-sm">
          <Clock size={40} className="mx-auto mb-3" style={{ color: "#9CA3AF" }} />
          <p className="font-semibold" style={{ color: "#070738" }}>Agendamentos não disponíveis</p>
          <p className="text-sm mt-1" style={{ color: "#9CA3AF" }}>Entre em contato com a escola pelo WhatsApp.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F4F8]">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-center">
          <Logo />
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 py-8">

        {/* TELA 1 — Lista de slots */}
        {tela === "lista" && (
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h1 className="text-2xl font-bold mb-1" style={{ color: "#070738" }}>{aluno}</h1>
            <div className="flex items-center gap-2 mb-6 pb-6 border-b" style={{ borderColor: "#E5E7EB" }}>
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#8B5CF6" }} />
              <span className="text-sm" style={{ color: "#8B5CF6" }}>Prof. {ciclo.professorNome}</span>
            </div>

            <h2 className="text-lg font-semibold mb-4" style={{ color: "#070738" }}>
              Escolha um horário disponível
            </h2>

            {slotsLivres.length === 0 ? (
              <div className="text-center py-8">
                <Clock size={40} className="mx-auto mb-3" style={{ color: "#9CA3AF" }} />
                <p style={{ color: "#6B7280" }}>Nenhum horário disponível no momento.</p>
                <p className="text-sm mt-1" style={{ color: "#9CA3AF" }}>Entre em contato com a escola pelo WhatsApp.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {slotsLivres.map(slot => (
                  <button key={slot.chave}
                    onClick={() => { setSlotSelecionado(slot); setTela("confirmacao"); }}
                    className="w-full py-4 px-5 rounded-xl border-2 text-left font-medium transition-all hover:border-[#8B5CF6] hover:bg-purple-50"
                    style={{ borderColor: "#E5E7EB", color: "#070738" }}>
                    {formatarSlot(slot)}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TELA 2 — Confirmação */}
        {tela === "confirmacao" && slotSelecionado && (
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h1 className="text-2xl font-bold mb-1" style={{ color: "#070738" }}>{aluno}</h1>
            <div className="flex items-center gap-2 mb-6 pb-6 border-b" style={{ borderColor: "#E5E7EB" }}>
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#8B5CF6" }} />
              <span className="text-sm" style={{ color: "#8B5CF6" }}>Prof. {ciclo.professorNome}</span>
            </div>

            <div className="rounded-xl p-4 mb-6" style={{ backgroundColor: "#EDE9FE" }}>
              <p className="text-xs mb-1" style={{ color: "#8B5CF6" }}>Horário selecionado:</p>
              <p className="text-lg font-bold" style={{ color: "#070738" }}>{formatarSlot(slotSelecionado)}</p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2" style={{ color: "#3D3D3D" }}>
                Seu nome (responsável)
              </label>
              <input type="text" value={nomePai} onChange={(e) => setNomePai(e.target.value)}
                placeholder="Digite seu nome completo"
                className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-[#8B5CF6]"
                style={{ borderColor: "#E5E7EB", color: "#070738" }} />
            </div>

            <button onClick={confirmarAgendamento} disabled={confirmando || !nomePai.trim()}
              className="w-full py-4 rounded-xl font-semibold text-white mb-3 disabled:opacity-50"
              style={{ backgroundColor: "#EC5800" }}>
              {confirmando ? "Confirmando..." : "Confirmar Agendamento"}
            </button>

            <button onClick={() => setTela("lista")}
              className="w-full py-4 rounded-xl font-semibold border-2 transition-all"
              style={{ borderColor: "#8B5CF6", color: "#8B5CF6" }}>
              Voltar
            </button>
          </div>
        )}

        {/* TELA 3 — Sucesso */}
        {tela === "sucesso" && slotSelecionado && (
          <div className="bg-white rounded-2xl shadow-md p-6 text-center">
            <div className="w-16 h-16 bg-[#16A34A] rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-white" />
            </div>
            <h2 className="text-xl font-bold mb-1" style={{ color: "#070738" }}>Reunião agendada com sucesso!</h2>
            <p className="text-sm mb-6" style={{ color: "#6B7280" }}>
              Confirmamos seu agendamento com Prof. {ciclo.professorNome}
            </p>
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
                <p className="font-semibold" style={{ color: "#EC5800" }}>{formatarSlot(slotSelecionado)}</p>
              </div>
            </div>
            {reportId && (
              <button onClick={() => window.location.href = `/report/view/${reportId}`}
                className="w-full py-4 rounded-xl font-semibold text-white"
                style={{ backgroundColor: "#8B5CF6" }}>
                Voltar ao relatório
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
