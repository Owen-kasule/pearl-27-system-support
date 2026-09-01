import type { TicketStatus } from "@/types/ticket";
import { STATUS_LABELS } from "@/lib/utils";

const styles: Record<TicketStatus, string> = {
  SUBMITTED: "bg-[#fff3e5] text-[#8a4709] ring-[#e6b47e]",
  IN_PROGRESS: "bg-[#eaf1fb] text-[#24508c] ring-[#aac3e4]",
  RESOLVED: "bg-[#e8f5ee] text-[#16633f] ring-[#9bc9af]",
};

export function StatusBadge({ status }: { status: TicketStatus }) {
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${styles[status]}`}>{STATUS_LABELS[status]}</span>;
}
