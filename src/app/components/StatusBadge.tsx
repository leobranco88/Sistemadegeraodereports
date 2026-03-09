import { ReportStatus } from "../types";
interface StatusBadgeProps {
  status: string;
}
export function StatusBadge({ status }: StatusBadgeProps) {
  const config: Record<string, { label: string; className: string }> = {
    "not-started": { label: "Não iniciado", className: "bg-gray-100 text-gray-700 border-gray-300" },
    "in-progress": { label: "Em progresso", className: "bg-blue-100 text-blue-700 border-blue-300" },
    "completed": { label: "Concluído", className: "bg-[#F5A623] bg-opacity-10 text-[#F5A623] border-[#F5A623] border-opacity-30" },
    "draft": { label: "Rascunho", className: "bg-gray-100 text-gray-500 border-gray-300" },
    "published": { label: "Publicado", className: "bg-[#EC5800] bg-opacity-10 text-[#EC5800] border-[#EC5800] border-opacity-30" },
    "sent": { label: "Enviado", className: "bg-[#EC5800] bg-opacity-10 text-[#EC5800] border-[#EC5800] border-opacity-30" },
    "confirmed": { label: "Confirmado", className: "bg-[#16A34A] bg-opacity-10 text-[#16A34A] border-[#16A34A] border-opacity-30" },
    "meeting-scheduled": { label: "Reunião agendada", className: "bg-[#16A34A] bg-opacity-20 text-[#16A34A] border-[#16A34A] border-opacity-40" },
  };
  const item = config[status] || { label: status, className: "bg-gray-100 text-gray-700 border-gray-300" };
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm border ${item.className}`}>
      {item.label}
    </span>
  );
}
