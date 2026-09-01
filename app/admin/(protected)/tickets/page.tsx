import Link from "next/link";
import { Search } from "lucide-react";
import { PageHeading } from "@/components/admin/page-heading";
import { TicketList } from "@/components/admin/ticket-list";
import { requireSupportUser } from "@/lib/auth";
import type { Ticket, TicketStatus } from "@/types/ticket";

export const metadata = { title: "Tickets" };

const filters: Array<{ label: string; value: "ALL" | TicketStatus }> = [{ label: "All", value: "ALL" }, { label: "Submitted", value: "SUBMITTED" }, { label: "In Progress", value: "IN_PROGRESS" }, { label: "Resolved", value: "RESOLVED" }];

export default async function TicketsPage({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  const params = await searchParams;
  const selected = filters.some((filter) => filter.value === params.status) ? (params.status as "ALL" | TicketStatus) : "ALL";
  const search = (params.q ?? "").trim().slice(0, 100);
  const safeSearch = search.replace(/[,()%]/g, " ");
  const { supabase } = await requireSupportUser();
  let query = supabase.from("tickets").select("*").order("created_at", { ascending: false });
  if (selected !== "ALL") query = query.eq("status", selected);
  if (safeSearch) query = query.or(`ticket_number.ilike.%${safeSearch}%,employee_name.ilike.%${safeSearch}%,employee_email.ilike.%${safeSearch}%,issue_title.ilike.%${safeSearch}%`);
  const { data } = await query;
  const tickets = (data ?? []) as Ticket[];
  const emptyMessage = search ? "No tickets matched your search." : selected !== "ALL" ? `No ${filters.find((filter) => filter.value === selected)?.label.toLowerCase()} tickets right now.` : "No support requests yet.";

  return (
    <>
      <PageHeading eyebrow="Request queue" title="Tickets" description="Search, review, and move employee requests through resolution." />
      <div className="mb-5 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex gap-2 overflow-x-auto pb-1" aria-label="Filter tickets by status">{filters.map((filter) => { const query = new URLSearchParams(); if (filter.value !== "ALL") query.set("status", filter.value); if (search) query.set("q", search); return <Link key={filter.value} href={`/admin/tickets?${query}`} className={`focus-ring min-h-10 shrink-0 rounded-full px-4 py-2 text-sm font-bold transition-colors ${selected === filter.value ? "bg-[var(--copper)] text-white shadow-sm" : "border border-[var(--border)] bg-white text-[var(--ink-muted)] hover:bg-[var(--cream)] hover:border-[var(--copper)]"}`}>{filter.label}</Link>; })}</div>
        <form className="relative w-full xl:max-w-sm" action="/admin/tickets"><Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ink-muted)]" size={17} /><input type="search" name="q" defaultValue={search} className="field pl-10 pr-20 focus:border-[var(--copper)] focus:ring-2 focus:ring-[rgba(232,135,43,0.2)]" placeholder="Search tickets" aria-label="Search tickets" />{selected !== "ALL" && <input type="hidden" name="status" value={selected} />}<button className="absolute right-1.5 top-1.5 min-h-9 rounded-[3px] bg-[var(--copper)] px-3 text-xs font-bold text-white hover:bg-[var(--copper-dark)] transition-colors">Search</button></form>
      </div>
      <TicketList tickets={tickets} emptyMessage={emptyMessage} />
    </>
  );
}
