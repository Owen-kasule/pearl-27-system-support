import Link from "next/link";
import { ArrowUpRight, Inbox } from "lucide-react";
import type { Ticket } from "@/types/ticket";
import { formatDate } from "@/lib/utils";
import { StatusBadge } from "./status-badge";

export function TicketList({ tickets, emptyMessage }: { tickets: Ticket[]; emptyMessage: string }) {
  if (tickets.length === 0) return <div className="rounded-[4px] border border-[var(--border)] bg-white px-6 py-16 text-center"><Inbox className="mx-auto text-[var(--copper-dark)]" /><p className="mt-4 font-bold text-[var(--navy)]">{emptyMessage}</p><p className="mt-1 text-sm text-[var(--ink-muted)]">Try another search or filter.</p></div>;
  return (
    <>
      <div className="hidden overflow-hidden rounded-[4px] border border-[var(--border)] bg-white md:block">
        <table className="w-full border-collapse text-left"><thead className="bg-[var(--cream-dark)] text-[11px] uppercase tracking-[0.1em] text-[var(--ink-muted)]"><tr>{["Ticket", "Employee", "Issue", "Status", "Submitted", "Action"].map((heading) => <th key={heading} className="px-4 py-3 font-bold first:pl-5 last:pr-5">{heading}</th>)}</tr></thead><tbody className="divide-y divide-[var(--border)]">{tickets.map((ticket) => <tr key={ticket.id} className="hover:bg-[var(--cream)]"><td className="px-4 py-4 pl-5 font-mono text-xs font-bold whitespace-nowrap">{ticket.ticket_number}</td><td className="max-w-48 px-4 py-4"><p className="truncate text-sm font-semibold">{ticket.employee_name}</p><p className="truncate text-xs text-[var(--ink-muted)]">{ticket.employee_email}</p></td><td className="max-w-72 truncate px-4 py-4 text-sm font-semibold">{ticket.issue_title}</td><td className="px-4 py-4 whitespace-nowrap"><StatusBadge status={ticket.status} /></td><td className="px-4 py-4 text-xs whitespace-nowrap text-[var(--ink-muted)]">{formatDate(ticket.created_at)}</td><td className="px-4 py-4 pr-5"><Link href={`/admin/tickets/${ticket.ticket_number}`} className="focus-ring inline-flex size-9 items-center justify-center rounded-[3px] border border-[var(--border)] bg-white hover:border-[var(--copper)]" aria-label={`Open ${ticket.ticket_number}`}><ArrowUpRight size={16} /></Link></td></tr>)}</tbody></table>
      </div>
      <div className="space-y-3 md:hidden">{tickets.map((ticket) => <Link href={`/admin/tickets/${ticket.ticket_number}`} key={ticket.id} className="block rounded-[4px] border border-[var(--border)] bg-white p-4 shadow-sm"><div className="flex items-start justify-between gap-3"><span className="font-mono text-xs font-bold">{ticket.ticket_number}</span><StatusBadge status={ticket.status} /></div><h2 className="mt-4 font-serif text-xl font-semibold leading-tight">{ticket.issue_title}</h2><p className="mt-2 text-sm font-semibold">{ticket.employee_name}</p><p className="mt-1 text-xs text-[var(--ink-muted)]">{ticket.employee_email}</p><div className="mt-4 border-t border-[var(--border)] pt-3 text-xs text-[var(--ink-muted)]">Submitted {formatDate(ticket.created_at)}</div></Link>)}</div>
    </>
  );
}
