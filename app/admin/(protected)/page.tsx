import Link from "next/link";
import { ArrowRight, CheckCircle2, CircleDot, Clock3, Inbox } from "lucide-react";
import { PageHeading } from "@/components/admin/page-heading";
import { StatusBadge } from "@/components/admin/status-badge";
import { requireSupportUser } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import type { Ticket } from "@/types/ticket";

export const metadata = { title: "Dashboard" };

export default async function AdminDashboard() {
  const { supabase } = await requireSupportUser();
  const [total, submitted, inProgress, resolved, recent] = await Promise.all([
    supabase.from("tickets").select("id", { count: "exact", head: true }),
    supabase.from("tickets").select("id", { count: "exact", head: true }).eq("status", "SUBMITTED"),
    supabase.from("tickets").select("id", { count: "exact", head: true }).eq("status", "IN_PROGRESS"),
    supabase.from("tickets").select("id", { count: "exact", head: true }).eq("status", "RESOLVED"),
    supabase.from("tickets").select("*").order("created_at", { ascending: false }).limit(6),
  ]);
  const cards = [
    { label: "Total Tickets", value: total.count ?? 0, icon: Inbox, color: "text-[var(--navy)]" },
    { label: "Submitted", value: submitted.count ?? 0, icon: CircleDot, color: "text-[var(--copper-dark)]" },
    { label: "In Progress", value: inProgress.count ?? 0, icon: Clock3, color: "text-[#24508c]" },
    { label: "Resolved", value: resolved.count ?? 0, icon: CheckCircle2, color: "text-[var(--success)]" },
  ];
  const tickets = (recent.data ?? []) as Ticket[];

  return (
    <>
      <PageHeading eyebrow="Support operations" title="Dashboard" description="A clear view of employee support requests and their current progress." action={<Link href="/admin/tickets" className="secondary-button">View all tickets<ArrowRight size={16} /></Link>} />
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Ticket totals">
        {cards.map(({ label, value, icon: Icon, color }) => <article key={label} className="rounded-[4px] border border-[var(--border)] bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><p className="text-sm font-semibold text-[var(--ink-muted)]">{label}</p><Icon size={19} className={color} /></div><p className="font-serif mt-4 text-4xl font-semibold text-[var(--navy)]">{value}</p></article>)}
      </section>
      <section className="mt-8 overflow-hidden rounded-[4px] border border-[var(--border)] bg-white">
        <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4 sm:px-6"><div><h2 className="font-serif text-2xl font-semibold text-[var(--navy)]">Recent Support Requests</h2><p className="mt-1 text-xs text-[var(--ink-muted)]">Newest employee submissions</p></div></div>
        {tickets.length === 0 ? <div className="px-6 py-14 text-center"><Inbox className="mx-auto text-[var(--copper-dark)]" /><p className="mt-4 font-bold text-[var(--navy)]">No support requests yet.</p><p className="mt-1 text-sm text-[var(--ink-muted)]">New employee support requests will appear here.</p></div> : <div className="divide-y divide-[var(--border)]">{tickets.map((ticket) => <Link key={ticket.id} href={`/admin/tickets/${ticket.ticket_number}`} className="grid gap-2 px-5 py-4 hover:bg-[var(--cream)] sm:grid-cols-[130px_1fr_auto] sm:items-center sm:px-6"><span className="font-mono text-xs font-bold text-[var(--navy)]">{ticket.ticket_number}</span><div className="min-w-0"><p className="truncate text-sm font-bold text-[var(--navy)]">{ticket.issue_title}</p><p className="mt-1 truncate text-xs text-[var(--ink-muted)]">{ticket.employee_name} · {formatDate(ticket.created_at)}</p></div><StatusBadge status={ticket.status} /></Link>)}</div>}
      </section>
    </>
  );
}
