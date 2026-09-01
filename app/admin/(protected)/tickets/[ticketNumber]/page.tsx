/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { ArrowLeft, ExternalLink, FileText, Mail, Paperclip, User } from "lucide-react";
import { notFound } from "next/navigation";
import { StatusBadge } from "@/components/admin/status-badge";
import { TicketStatusForm } from "@/components/admin/ticket-status-form";
import { requireSupportUser } from "@/lib/auth";
import { STORAGE_BUCKET } from "@/lib/constants";
import { formatBytes, formatDate } from "@/lib/utils";
import type { Ticket } from "@/types/ticket";

export default async function TicketDetailPage({ params }: { params: Promise<{ ticketNumber: string }> }) {
  const { ticketNumber } = await params;
  if (!/^P27-\d{6,}$/.test(ticketNumber)) notFound();
  const { supabase } = await requireSupportUser();
  const { data } = await supabase.from("tickets").select("*").eq("ticket_number", ticketNumber).single();
  if (!data) notFound();
  const ticket = data as Ticket;
  let attachmentUrl: string | null = null;
  if (ticket.attachment_path) {
    const { data: signed } = await supabase.storage.from(STORAGE_BUCKET).createSignedUrl(ticket.attachment_path, 3600);
    attachmentUrl = signed?.signedUrl ?? null;
  }

  return (
    <>
      <Link href="/admin/tickets" className="mb-5 inline-flex min-h-10 items-center gap-2 text-sm font-bold text-[var(--ink-muted)] hover:text-[var(--navy)]"><ArrowLeft size={17} />Back to tickets</Link>
      <header className="mb-7 border-b border-[var(--border)] pb-6"><div className="flex flex-wrap items-center gap-3"><span className="font-mono text-xs font-bold uppercase tracking-[0.12em] text-[var(--copper-dark)]">{ticket.ticket_number}</span><StatusBadge status={ticket.status} /></div><h1 className="font-serif mt-3 max-w-4xl text-4xl font-semibold leading-[1.05] tracking-[-0.035em] text-[var(--navy)] sm:text-5xl">{ticket.issue_title}</h1></header>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
        <div className="space-y-6">
          <section className="rounded-[4px] border border-[var(--border)] bg-white p-5 sm:p-6"><h2 className="font-serif text-2xl font-semibold">Employee Information</h2><dl className="mt-5 grid gap-5 sm:grid-cols-3"><div><dt className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.1em] text-[var(--ink-muted)]"><User size={14} />Employee</dt><dd className="mt-2 text-sm font-semibold">{ticket.employee_name}</dd></div><div><dt className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.1em] text-[var(--ink-muted)]"><Mail size={14} />Email</dt><dd className="mt-2 truncate text-sm font-semibold"><a className="hover:underline" href={`mailto:${ticket.employee_email}`}>{ticket.employee_email}</a></dd></div><div><dt className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--ink-muted)]">Submitted</dt><dd className="mt-2 text-sm font-semibold">{formatDate(ticket.created_at)}</dd></div></dl></section>
          <section className="rounded-[4px] border border-[var(--border)] bg-white p-5 sm:p-6"><h2 className="font-serif text-2xl font-semibold">Issue Description</h2><p className="mt-4 whitespace-pre-wrap break-words text-[15px] leading-7 text-[var(--ink-muted)]">{ticket.issue_description}</p></section>
          <section className="rounded-[4px] border border-[var(--border)] bg-white p-5 sm:p-6"><h2 className="font-serif flex items-center gap-2 text-2xl font-semibold"><Paperclip size={20} />Attachment</h2>{!ticket.attachment_path ? <p className="mt-4 text-sm text-[var(--ink-muted)]">No attachment was included with this request.</p> : attachmentUrl ? <div className="mt-5">{ticket.attachment_type?.startsWith("image/") ? <a href={attachmentUrl} target="_blank" rel="noreferrer" className="block"><span className="sr-only">Open full image</span><img src={attachmentUrl} alt={`Attachment for ${ticket.ticket_number}`} className="max-h-[560px] w-full rounded-[3px] border border-[var(--border)] object-contain" /></a> : <a href={attachmentUrl} target="_blank" rel="noreferrer" className="flex items-center gap-4 rounded-[4px] border border-[var(--border)] bg-[var(--cream)] p-4 hover:border-[var(--copper)]"><span className="flex size-12 items-center justify-center bg-white"><FileText /></span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-bold">{ticket.attachment_name}</span><span className="mt-1 block text-xs text-[var(--ink-muted)]">{ticket.attachment_size ? formatBytes(ticket.attachment_size) : "PDF document"}</span></span><ExternalLink size={18} /></a>}</div> : <p className="mt-4 text-sm text-[var(--danger)]">The private attachment link could not be generated. Please try refreshing.</p>}</section>
        </div>
        <aside className="self-start rounded-[4px] border border-[var(--border)] bg-white p-5 sm:p-6 xl:sticky xl:top-8"><h2 className="font-serif text-2xl font-semibold">Ticket Progress</h2><p className="mt-2 text-sm leading-6 text-[var(--ink-muted)]">Update the request as your investigation moves forward.</p><div className="mt-6"><TicketStatusForm ticketNumber={ticket.ticket_number} initialStatus={ticket.status} initialResolution={ticket.resolution_notes} /></div>{ticket.resolved_at && <div className="mt-6 border-t border-[var(--border)] pt-5"><p className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--ink-muted)]">Resolved</p><p className="mt-2 text-sm font-semibold">{formatDate(ticket.resolved_at)}</p></div>}</aside>
      </div>
    </>
  );
}
