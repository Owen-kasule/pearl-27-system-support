"use client";

import { FormEvent, useState } from "react";
import { CheckCircle2, LoaderCircle } from "lucide-react";
import { TICKET_STATUSES, type TicketStatus } from "@/types/ticket";
import { STATUS_LABELS } from "@/lib/utils";

export function TicketStatusForm({ ticketNumber, initialStatus, initialResolution }: { ticketNumber: string; initialStatus: TicketStatus; initialResolution: string | null }) {
  const [status, setStatus] = useState<TicketStatus>(initialStatus);
  const [resolution, setResolution] = useState(initialResolution ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setMessage("");
    if (status === "RESOLVED" && !resolution.trim()) { setError("Please add resolution notes before resolving this ticket."); return; }
    setSaving(true);
    try {
      const response = await fetch(`/api/admin/tickets/${encodeURIComponent(ticketNumber)}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ status, resolutionNotes: resolution }) });
      const payload = await response.json() as { error?: string };
      if (!response.ok) throw new Error(payload.error);
      setMessage(status === "RESOLVED" ? "Ticket resolved and the employee has been notified." : "Ticket progress updated.");
      window.setTimeout(() => window.location.reload(), 700);
    } catch (caught) { setError(caught instanceof Error && caught.message ? caught.message : "We couldn't update this ticket. Please try again."); }
    finally { setSaving(false); }
  }

  return (
    <form onSubmit={save} className="space-y-5">
      <fieldset disabled={saving}><legend className="mb-3 text-sm font-bold text-[var(--navy)]">Status</legend><div className="grid gap-2 sm:grid-cols-3">{TICKET_STATUSES.map((value) => <label key={value} className={`focus-within:ring-2 focus-within:ring-[var(--copper)] flex min-h-12 cursor-pointer items-center gap-2 rounded-[3px] border px-3 text-sm font-bold ${status === value ? "border-[var(--navy)] bg-[var(--navy)] text-white" : "border-[var(--border)] bg-white text-[var(--ink-muted)]"}`}><input type="radio" className="sr-only" name="status" value={value} checked={status === value} onChange={() => setStatus(value)} />{STATUS_LABELS[value]}</label>)}</div></fieldset>
      {status === "RESOLVED" && <div><label htmlFor="resolutionNotes" className="mb-2 block text-sm font-bold text-[var(--navy)]">Resolution<span className="ml-1 text-[var(--copper-dark)]">*</span></label><p className="mb-2 text-sm leading-6 text-[var(--ink-muted)]">Briefly explain what was done to resolve the employee&apos;s issue.</p><textarea id="resolutionNotes" className="field min-h-32 resize-y" value={resolution} disabled={saving} onChange={(event) => setResolution(event.target.value)} placeholder="Sphere permissions were restored. The employee can now sign in normally." /></div>}
      {error && <p className="border-l-2 border-[var(--danger)] bg-red-50 px-3 py-2 text-sm text-[var(--danger)]" role="alert">{error}</p>}
      {message && <p className="flex items-center gap-2 border-l-2 border-[var(--success)] bg-green-50 px-3 py-2 text-sm text-[var(--success)]" role="status"><CheckCircle2 size={17} />{message}</p>}
      <button className="primary-button w-full sm:w-auto" type="submit" disabled={saving}>{saving ? <><LoaderCircle className="animate-spin" size={17} />Saving...</> : "Save Changes"}</button>
    </form>
  );
}
