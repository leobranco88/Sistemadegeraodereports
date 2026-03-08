import { useState } from "react";
import { useParams } from "react-router";
import { Logo } from "../components/Logo";
import { mockReports } from "../data/mockData";
import { CheckCircle, Calendar } from "lucide-react";

export function ParentConfirmation() {
  const { reportId } = useParams();
  const [confirmed, setConfirmed] = useState(false);
  const [wantsMeeting, setWantsMeeting] = useState(false);
  const [meetingDate, setMeetingDate] = useState("");
  const [meetingTime, setMeetingTime] = useState("");
  const [notes, setNotes] = useState("");

  // For demo, use the first report
  const report = mockReports[0];

  const handleConfirm = () => {
    if (wantsMeeting && (!meetingDate || !meetingTime)) {
      alert("Por favor, preencha a data e horário da reunião desejada.");
      return;
    }

    // In a real app, this would save to database
    setConfirmed(true);
    
    setTimeout(() => {
      alert("Confirmação registrada com sucesso! Obrigado.");
    }, 500);
  };

  if (confirmed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F0F4F8] p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-[#16A34A] rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-2xl text-[#070738] mb-4">Confirmação Registrada!</h1>
          <p className="text-[#3D3D3D] mb-6">
            Obrigado por confirmar o recebimento do relatório de {report.studentName}.
          </p>
          {wantsMeeting && (
            <div className="bg-[#F0F4F8] rounded-lg p-4 mb-6">
              <p className="text-sm text-[#3D3D3D]">
                <strong>Reunião solicitada:</strong><br />
                {new Date(meetingDate).toLocaleDateString('pt-BR')} às {meetingTime}
              </p>
              {notes && (
                <p className="text-sm text-[#3D3D3D] mt-2">
                  <strong>Observações:</strong><br />
                  {notes}
                </p>
              )}
            </div>
          )}
          <p className="text-sm text-[#9CA3AF]">
            A escola entrará em contato em breve.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F4F8]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-center">
            <Logo />
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
          <h1 className="text-3xl text-[#070738] mb-2">Relatório de Desempenho</h1>
          <p className="text-[#9CA3AF] mb-8">Aluno: {report.studentName}</p>

          {/* Report Preview - Simplified */}
          <div className="bg-[#F0F4F8] rounded-lg p-6 mb-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div>
                <p className="text-xs text-[#9CA3AF] mb-1">Turma</p>
                <p className="text-sm text-[#070738]">{report.class}</p>
              </div>
              <div>
                <p className="text-xs text-[#9CA3AF] mb-1">Período</p>
                <p className="text-sm text-[#070738]">{report.period}</p>
              </div>
              <div>
                <p className="text-xs text-[#9CA3AF] mb-1">Frequência</p>
                <p className="text-sm text-[#070738]">{report.attendance}%</p>
              </div>
              <div>
                <p className="text-xs text-[#9CA3AF] mb-1">Nota</p>
                <p className="text-sm text-[#070738]">{report.testScore}%</p>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-xs text-[#9CA3AF] mb-2">Professor</p>
              <p className="text-sm text-[#070738]">{report.professorName}</p>
            </div>

            {report.professorVoice && (
              <div className="bg-white rounded-lg p-4">
                <p className="text-xs text-[#9CA3AF] mb-2">Mensagem do Professor</p>
                <p className="text-sm text-[#3D3D3D] italic">"{report.professorVoice}"</p>
              </div>
            )}
          </div>

          {/* Confirmation Form */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 p-4 bg-[#16A34A] bg-opacity-10 border border-[#16A34A] border-opacity-30 rounded-lg">
              <CheckCircle className="w-6 h-6 text-[#16A34A]" />
              <div>
                <h3 className="text-sm text-[#16A34A]">Confirmação de Recebimento</h3>
                <p className="text-xs text-[#3D3D3D]">
                  Ao confirmar, você declara que recebeu e leu o relatório completo.
                </p>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Calendar className="w-5 h-5 text-[#EC5800]" />
                <h3 className="text-lg text-[#070738]">Deseja agendar uma reunião?</h3>
              </div>

              <div className="flex gap-4 mb-6">
                <button
                  onClick={() => setWantsMeeting(false)}
                  className={`flex-1 py-3 rounded-lg border transition-colors ${
                    !wantsMeeting
                      ? "bg-[#EC5800] text-white border-[#EC5800]"
                      : "bg-white text-[#3D3D3D] border-gray-300 hover:border-[#EC5800]"
                  }`}
                >
                  Não
                </button>
                <button
                  onClick={() => setWantsMeeting(true)}
                  className={`flex-1 py-3 rounded-lg border transition-colors ${
                    wantsMeeting
                      ? "bg-[#EC5800] text-white border-[#EC5800]"
                      : "bg-white text-[#3D3D3D] border-gray-300 hover:border-[#EC5800]"
                  }`}
                >
                  Sim
                </button>
              </div>

              {wantsMeeting && (
                <div className="space-y-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-[#9CA3AF] mb-4">
                    Informe sua preferência de data e horário. A escola confirmará a disponibilidade.
                  </p>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-[#3D3D3D] mb-2">Data preferida</label>
                      <input
                        type="date"
                        value={meetingDate}
                        onChange={(e) => setMeetingDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-3 bg-[#F0F4F8] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EC5800]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-[#3D3D3D] mb-2">Horário preferido</label>
                      <input
                        type="time"
                        value={meetingTime}
                        onChange={(e) => setMeetingTime(e.target.value)}
                        className="w-full px-4 py-3 bg-[#F0F4F8] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EC5800]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-[#3D3D3D] mb-2">Observações (opcional)</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-4 py-3 bg-[#F0F4F8] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EC5800] min-h-[100px]"
                      placeholder="Assuntos que gostaria de discutir na reunião..."
                    />
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleConfirm}
              className="w-full py-4 bg-[#16A34A] text-white rounded-lg hover:bg-[#15803d] transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              Confirmar Recebimento
            </button>

            <p className="text-xs text-center text-[#9CA3AF]">
              Ao confirmar, você permite que a escola registre que o relatório foi recebido pela família.
            </p>
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm text-[#3D3D3D] mb-1">EIC School — English is Cool</p>
          <p className="text-xs text-[#9CA3AF]">contato@eicschool.com | (11) 9999-9999</p>
        </div>
      </div>
    </div>
  );
}
