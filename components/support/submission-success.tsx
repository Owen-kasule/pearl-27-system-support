"use client";

import { useState } from "react";
import { Check, CheckCircle2, Clipboard } from "lucide-react";
import { firstName } from "@/lib/utils";

interface SubmissionSuccessProps {
  result: { ticketNumber: string; employeeName: string; employeeEmail: string };
  onReset: () => void;
}

export function SubmissionSuccess({ result, onReset }: SubmissionSuccessProps) {
  const [copied, setCopied] = useState(false);
  async function copyTicket() {
    await navigator.clipboard.writeText(result.ticketNumber);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }
  return (
    <section className="px-6 py-10 text-center sm:px-10 sm:py-14" aria-live="polite">
      <CheckCircle2 className="mx-auto text-[var(--success)]" size={56} strokeWidth={1.6} />
      <p className="font-mono mt-5 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--copper-dark)]">Request received</p>
      <h1 className="font-serif mt-2 text-4xl font-semibold tracking-[-0.035em] text-[var(--navy)] sm:text-5xl">Support request submitted</h1>
      <p className="mx-auto mt-4 max-w-xl text-[15px] leading-7 text-[var(--ink-muted)]">Thank you, {firstName(result.employeeName)}. Your request has been sent to the System Support team.</p>
      <dl className="mx-auto mt-8 grid max-w-lg divide-y divide-[var(--border)] border-y border-[var(--border)] text-left sm:grid-cols-2 sm:divide-x sm:divide-y-0">
        <div className="p-4 sm:px-6"><dt className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--ink-muted)]">Ticket</dt><dd className="font-mono mt-1 font-bold text-[var(--navy)]">{result.ticketNumber}</dd></div>
        <div className="p-4 sm:px-6"><dt className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--ink-muted)]">Email</dt><dd className="mt-1 truncate font-semibold text-[var(--navy)]"><a className="hover:underline" href={`mailto:${result.employeeEmail}`}>{result.employeeEmail}</a></dd></div>
      </dl>
      <p className="mt-6 text-sm text-[var(--ink-muted)]">We have also sent a confirmation to your email address.</p>
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <button className="primary-button" type="button" onClick={onReset}>Submit Another Request</button>
        <button className="secondary-button" type="button" onClick={copyTicket}>{copied ? <Check size={17} /> : <Clipboard size={17} />}{copied ? "Copied" : "Copy Ticket Number"}</button>
      </div>
    </section>
  );
}
