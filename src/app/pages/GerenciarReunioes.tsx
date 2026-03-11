import { useState, useEffect } from "react";
import { Header } from "../components/Header";
import { ChevronLeft, ChevronRight, Clock, User, BookOpen, CalendarCheck } from "lucide-react";
import { db } from "../../firebase";
import { collection, getDocs, query } from "firebase/firestore";

interface Reuniao {
  id: string;
  cicloId: string;
  data: string;   // "10/03/2026" — formato salvo pelo AgendarReuniao
  hora: string;   // "09:00"
  nomePai: string;
  aluno: string;
  reportId: string;
  professorId: string;
  professorNome?: string;
  confirmedAt?: string;
}

const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

// Converte "10/03/2026" → { dia: 10, mes: 3, ano: 2026 }
function parsarData(dataStr: string): { dia: number; mes: number; ano: number } | null {
  if (!dataStr) return null;
  const partes = dataStr.split("/");
  if (partes.length === 3) {
    return { dia: parseInt(partes[0]), mes: parseInt(partes[1]), ano: parseInt(partes[2]) };
  }
  // fallback para yyyy-mm-dd
  const partes2 = dataStr.split("-");
  if (partes2.length === 3) {
    return { dia: parseInt(partes2[2]), mes: parseInt(partes2[1]), ano: parseInt(partes2[0]) };
  }
  return null;
}

export default function GerenciarReunioes() {
  const [reunioes, setReunioes] = useState<Reuniao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [hoje] = useState(new Date());
  const [mesAtual, setMesAtual] = useState(hoje.getMonth());
  const [anoAtual, setAnoAtual] = useState(hoje.getFullYear());
  const [diaSelecionado, setDiaSelecionado] = useState<number | null>(null);

  useEffect(() => {
    const buscar = async () => {
      try {
        const snap = await getDocs(query(collection(db, "reunioes")));
        setReunioes(snap.docs.map(d => ({ id: d.id, ...d.data() })) as Reuniao[]);
      } catch (err) {
        console.error("Erro ao buscar reuniões:", err);
      } finally {
        setCarregando(false);
      }
    };
    buscar();
  }, []);

  const mesAnterior = () => {
    if (mesAtual === 0) { setMesAtual(11); setAnoAtual(a => a - 1); }
    else setMesAtual(m => m - 1);
    setDiaSelecionado(null);
  };

  const proximoMes = () => {
    if (mesAtual === 11) { setMesAtual(0); setAnoAtual(a => a + 1); }
    else setMesAtual(m => m + 1);
    setDiaSelecionado(null);
  };

  const primeiroDia = new Date(anoAtual, mesAtual, 1).getDay();
  const totalDias = new Date(anoAtual, mesAtual + 1, 0).getDate();
  const celulas = Array(primeiroDia).fill(null).concat(
    Array.from({ length: totalDias }, (_, i) => i + 1)
  );

  const reunioesPorDia = (dia: number) => {
    return reunioes.filter(r => {
      const p = parsarData(r.data);
      return p && p.dia === dia && p.mes === mesAtual + 1 && p.ano === anoAtual;
    });
  };

  const totalMes = reunioes.filter(r => {
    const p = parsarData(r.data);
    return p && p.mes === mesAtual + 1 && p.ano === anoAtual;
  }).length;

  const reunioesDiaSelecionado = diaSelecionado !== null
    ? reunioes
        .filter(r => {
          const p = parsarData(r.data);
          return p && p.dia === diaSelecionado && p.mes === mesAtual + 1 && p.ano === anoAtual;
        })
        .sort((a, b) => a.hora.localeCompare(b.hora))
    : [];

  const hojeStr = hoje.getDate();
  const hojemes = hoje.getMonth();
  const hojeano = hoje.getFullYear();

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F0F4F8" }}>
      <Header />
      <div className="max-w-6xl mx-auto px-6 py-8">

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "#070738" }}>Reuniões com Pais</h1>
            <p className="text-sm mt-1" style={{ color: "#6B7280" }}>
              {totalMes} reunião{totalMes !== 1 ? "s" : ""} agendada{totalMes !== 1 ? "s" : ""} em {MESES[mesAtual]} {anoAtual}
            </p>
          </div>
          <div className="flex items-center gap-1 px-4 py-2 rounded-xl" style={{ backgroundColor: "#EDE9FE", color: "#7C3AED" }}>
            <CalendarCheck size={18} />
            <span className="font-bold text-lg ml-1">{totalMes}</span>
            <span className="text-sm ml-1">este mês</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Calendário */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "#E5E7EB" }}>
              <button onClick={mesAnterior} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <ChevronLeft size={20} style={{ color: "#6B7280" }} />
              </button>
              <h2 className="text-lg font-bold" style={{ color: "#070738" }}>
                {MESES[mesAtual]} {anoAtual}
              </h2>
              <button onClick={proximoMes} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <ChevronRight size={20} style={{ color: "#6B7280" }} />
              </button>
            </div>

            <div className="grid grid-cols-7 border-b" style={{ borderColor: "#E5E7EB" }}>
              {DIAS_SEMANA.map(d => (
                <div key={d} className="py-3 text-center text-xs font-semibold uppercase"
                  style={{ color: "#9CA3AF" }}>{d}</div>
              ))}
            </div>

            {carregando ? (
              <div className="py-16 text-center">
                <div className="w-8 h-8 border-4 border-[#EC5800] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p style={{ color: "#6B7280" }}>Carregando...</p>
              </div>
            ) : (
              <div className="grid grid-cols-7">
                {celulas.map((dia, idx) => {
                  if (!dia) return <div key={idx} className="h-16 border-b border-r" style={{ borderColor: "#F3F4F6" }} />;

                  const reunioesDia = reunioesPorDia(dia);
                  const temReunioes = reunioesDia.length > 0;
                  const isHoje = dia === hojeStr && mesAtual === hojeano && anoAtual === hojeano
                    ? true
                    : dia === hojeStr && mesAtual === hojemes && anoAtual === hojeano;
                  const isSelecionado = diaSelecionado === dia;

                  return (
                    <div key={idx}
                      onClick={() => temReunioes && setDiaSelecionado(isSelecionado ? null : dia)}
                      className="h-16 border-b border-r flex flex-col items-center justify-start pt-2 gap-1 transition-colors"
                      style={{
                        borderColor: "#F3F4F6",
                        cursor: temReunioes ? "pointer" : "default",
                        backgroundColor: isSelecionado ? "#FEF2F2" : isHoje ? "#FFF7F0" : "transparent",
                      }}>
                      <span className="text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full"
                        style={{
                          backgroundColor: isHoje ? "#EC5800" : "transparent",
                          color: isHoje ? "#FFFFFF" : "#3D3D3D",
                        }}>
                        {dia}
                      </span>
                      {temReunioes && (
                        <span className="px-1.5 py-0.5 rounded-full text-xs font-bold"
                          style={{ backgroundColor: "#EDE9FE", color: "#7C3AED" }}>
                          {reunioesDia.length}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Painel lateral */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            {diaSelecionado === null ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <CalendarCheck size={40} style={{ color: "#E5E7EB" }} className="mb-3" />
                <p className="text-sm font-medium" style={{ color: "#6B7280" }}>Selecione um dia com reuniões</p>
                <p className="text-xs mt-1" style={{ color: "#9CA3AF" }}>Os dias marcados em lilás têm reuniões agendadas</p>
              </div>
            ) : (
              <div>
                <h3 className="font-bold mb-1" style={{ color: "#070738" }}>
                  {String(diaSelecionado).padStart(2, "0")}/{String(mesAtual + 1).padStart(2, "0")}/{anoAtual}
                </h3>
                <p className="text-xs mb-4" style={{ color: "#9CA3AF" }}>
                  {reunioesDiaSelecionado.length} reunião{reunioesDiaSelecionado.length !== 1 ? "s" : ""}
                </p>
                <div className="space-y-3">
                  {reunioesDiaSelecionado.map(r => (
                    <div key={r.id} className="rounded-lg p-4 border" style={{ borderColor: "#E5E7EB", backgroundColor: "#F9FAFB" }}>
                      <div className="flex items-center gap-2 mb-2">
                        <Clock size={13} style={{ color: "#EC5800" }} />
                        <span className="font-bold text-sm" style={{ color: "#EC5800" }}>{r.hora}</span>
                      </div>
                      <div className="flex items-center gap-2 mb-1">
                        <BookOpen size={13} style={{ color: "#6B7280" }} />
                        <span className="text-sm font-medium" style={{ color: "#070738" }}>{r.aluno}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User size={13} style={{ color: "#6B7280" }} />
                        <span className="text-sm" style={{ color: "#6B7280" }}>{r.nomePai}</span>
                      </div>
                      {r.professorNome && (
                        <div className="mt-2 pt-2 border-t text-xs" style={{ borderColor: "#E5E7EB", color: "#9CA3AF" }}>
                          Prof. {r.professorNome}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
