"use client";

import { FormEvent, useRef, useState } from "react";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { ticketFieldsSchema, type TicketFields } from "@/lib/validation/ticket";
import { STORAGE_BUCKET } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import { FileUpload } from "./file-upload";
import { SubmissionSuccess } from "./submission-success";

type FieldErrors = Partial<Record<keyof TicketFields | "attachment", string>>;
type Success = { ticketNumber: string; employeeName: string; employeeEmail: string };

const emptyFields: TicketFields = { employeeName: "", employeeEmail: "", issueTitle: "", issueDescription: "" };

export function SupportForm() {
  const [fields, setFields] = useState<TicketFields>(emptyFields);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<Success | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function updateField(name: keyof TicketFields, value: string) {
    setFields((current) => ({ ...current, [name]: value }));
    if (errors[name]) setErrors((current) => ({ ...current, [name]: undefined }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError("");
    const parsed = ticketFieldsSchema.safeParse(fields);
    if (!parsed.success) {
      const flattened = parsed.error.flatten().fieldErrors;
      setErrors(Object.fromEntries(Object.entries(flattened).map(([key, value]) => [key, value?.[0]])) as FieldErrors);
      return;
    }
    if (errors.attachment) return;
    setSubmitting(true);
    try {
      let response: Response;
      if (attachment) {
        const preparation = await fetch("/api/tickets/upload", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ ...parsed.data, attachment: { name: attachment.name, type: attachment.type, size: attachment.size } }),
        });
        const prepared = await preparation.json() as { path?: string; uploadToken?: string; submissionToken?: string; error?: string };
        if (!preparation.ok || !prepared.path || !prepared.uploadToken || !prepared.submissionToken) throw new Error(prepared.error || "We couldn't prepare this file upload. Please try again.");
        const { error: uploadError } = await createClient().storage.from(STORAGE_BUCKET).uploadToSignedUrl(prepared.path, prepared.uploadToken, attachment, { contentType: attachment.type });
        if (uploadError) throw new Error("We couldn't upload this file. Please choose another file or try again.");
        response = await fetch("/api/tickets", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ submissionToken: prepared.submissionToken }) });
      } else {
        const body = new FormData();
        Object.entries(parsed.data).forEach(([key, value]) => body.set(key, value));
        response = await fetch("/api/tickets", { method: "POST", body });
      }
      const payload = await response.json() as Success & { error?: string; fieldErrors?: Record<string, string[]> };
      if (!response.ok) {
        if (payload.fieldErrors) setErrors(Object.fromEntries(Object.entries(payload.fieldErrors).map(([key, value]) => [key, value[0]])) as FieldErrors);
        throw new Error(payload.error);
      }
      setSuccess(payload);
    } catch (error) {
      setSubmitError(error instanceof Error && error.message ? error.message : "We couldn't submit your request. Your information is still here. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setFields(emptyFields); setAttachment(null); setErrors({}); setSubmitError(""); setSuccess(null); formRef.current?.reset();
  }

  if (success) return <SubmissionSuccess result={success} onReset={reset} />;

  const input = (name: keyof TicketFields, label: string, placeholder: string, type = "text") => (
    <div>
      <label htmlFor={name} className="mb-2 block text-sm font-bold text-[var(--navy)]">{label}<span className="ml-1 text-[var(--copper-dark)]" aria-hidden="true">*</span></label>
      <input id={name} name={name} type={type} value={fields[name]} onChange={(event) => updateField(name, event.target.value)} placeholder={placeholder} className="field" disabled={submitting} aria-invalid={Boolean(errors[name])} aria-describedby={`${name}-error`} />
      <p id={`${name}-error`} className="mt-1.5 min-h-5 text-sm text-[var(--danger)]" role={errors[name] ? "alert" : undefined}>{errors[name]}</p>
    </div>
  );

  return (
    <form ref={formRef} onSubmit={submit} noValidate className="px-5 py-7 sm:px-10 sm:py-9">
      <div className="grid gap-x-6 sm:grid-cols-2">
        {input("employeeName", "Employee name", "Enter your full name")}
        {input("employeeEmail", "Employee email", "name@pearl27.com", "email")}
      </div>
      {input("issueTitle", "Issue title", "Example: I cannot access my Sphere account")}
      <div>
        <label htmlFor="issueDescription" className="mb-2 block text-sm font-bold text-[var(--navy)]">Tell us what happened<span className="ml-1 text-[var(--copper-dark)]" aria-hidden="true">*</span></label>
        <p id="description-help" className="mb-2 text-sm leading-6 text-[var(--ink-muted)]">Describe what you were trying to do, what happened instead, and any error message you saw.</p>
        <textarea id="issueDescription" name="issueDescription" value={fields.issueDescription} onChange={(event) => updateField("issueDescription", event.target.value)} className="field min-h-36 resize-y" disabled={submitting} aria-invalid={Boolean(errors.issueDescription)} aria-describedby="description-help issueDescription-error" />
        <p id="issueDescription-error" className="mt-1.5 min-h-5 text-sm text-[var(--danger)]" role={errors.issueDescription ? "alert" : undefined}>{errors.issueDescription}</p>
      </div>
      <fieldset className="mt-1" disabled={submitting}>
        <legend className="text-sm font-bold text-[var(--navy)]">Add a screenshot or file <span className="font-normal text-[var(--ink-muted)]">(optional)</span></legend>
        <p id="attachment-help" className="mb-3 mt-1 text-sm leading-6 text-[var(--ink-muted)]">A screenshot can help the System Support team understand the issue faster.</p>
        <FileUpload file={attachment} error={errors.attachment} disabled={submitting} onChange={(file, error) => { setAttachment(file); setErrors((current) => ({ ...current, attachment: error })); }} />
      </fieldset>
      {submitError && <div className="mt-2 border-l-2 border-[var(--danger)] bg-red-50 px-4 py-3 text-sm text-[var(--danger)]" role="alert">{submitError}</div>}
      <button type="submit" disabled={submitting} className="primary-button mt-5 w-full sm:w-auto sm:min-w-52">
        {submitting ? <><LoaderCircle className="animate-spin" size={18} />Submitting...</> : <>Submit Request<ArrowRight size={18} /></>}
      </button>
    </form>
  );
}
