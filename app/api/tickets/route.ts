import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { STORAGE_BUCKET } from "@/lib/constants";
import { sendTicketCreatedEmails } from "@/lib/email/send";
import { verifySubmissionToken } from "@/lib/tickets/submission-token";
import { fileMatchesDeclaredType } from "@/lib/validation/file-signature";
import { ticketFieldsSchema } from "@/lib/validation/ticket";
import type { Ticket } from "@/types/ticket";

export const runtime = "nodejs";

const genericError = "We couldn't submit your request. Your information is still here. Please try again.";

interface InsertInput {
  id: string;
  ticketNumber: string;
  employeeName: string;
  employeeEmail: string;
  issueTitle: string;
  issueDescription: string;
  attachmentPath?: string;
  attachmentName?: string;
  attachmentType?: string;
  attachmentSize?: number;
}

async function insertTicket(input: InsertInput): Promise<{ ticket: Ticket; created: boolean }> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("tickets").insert({
    id: input.id,
    ticket_number: input.ticketNumber,
    employee_name: input.employeeName,
    employee_email: input.employeeEmail.toLowerCase(),
    issue_title: input.issueTitle,
    issue_description: input.issueDescription,
    attachment_path: input.attachmentPath ?? null,
    attachment_name: input.attachmentName ?? null,
    attachment_type: input.attachmentType ?? null,
    attachment_size: input.attachmentSize ?? null,
  }).select("*").single();
  if (!error && data) return { ticket: data as Ticket, created: true };

  // A finalization retry is idempotent and must never delete a valid ticket's file.
  const { data: existing } = await supabase.from("tickets").select("*").eq("id", input.id).single();
  if (existing) return { ticket: existing as Ticket, created: false };
  if (input.attachmentPath) await supabase.storage.from(STORAGE_BUCKET).remove([input.attachmentPath]);
  throw new Error("Ticket insert failed.");
}

async function finalizeUploadedTicket(request: Request) {
  const body = await request.json() as { submissionToken?: unknown };
  if (typeof body.submissionToken !== "string") return NextResponse.json({ error: genericError }, { status: 400 });
  const payload = verifySubmissionToken(body.submissionToken);
  if (!payload) return NextResponse.json({ error: "This upload session expired. Please select the file and submit again." }, { status: 400 });
  const supabase = createAdminClient();
  const { data: blob, error: downloadError } = await supabase.storage.from(STORAGE_BUCKET).download(payload.attachmentPath);
  if (downloadError || !blob) return NextResponse.json({ error: "We couldn't upload this file. Please choose another file or try again." }, { status: 400 });
  const storedFile = new File([blob], payload.attachment.name, { type: payload.attachment.type });
  if (storedFile.size !== payload.attachment.size || !(await fileMatchesDeclaredType(storedFile))) {
    await supabase.storage.from(STORAGE_BUCKET).remove([payload.attachmentPath]);
    return NextResponse.json({ error: "The uploaded file could not be verified. Please choose another file." }, { status: 400 });
  }
  const result = await insertTicket({
    id: payload.id,
    ticketNumber: payload.ticketNumber,
    employeeName: payload.employeeName,
    employeeEmail: payload.employeeEmail,
    issueTitle: payload.issueTitle,
    issueDescription: payload.issueDescription,
    attachmentPath: payload.attachmentPath,
    attachmentName: payload.attachment.name,
    attachmentType: payload.attachment.type,
    attachmentSize: payload.attachment.size,
  });
  if (result.created) await sendTicketCreatedEmails(result.ticket);
  return NextResponse.json({ ticketNumber: result.ticket.ticket_number, employeeName: result.ticket.employee_name, employeeEmail: result.ticket.employee_email }, { status: result.created ? 201 : 200 });
}

async function createTicketWithoutAttachment(request: Request) {
  const formData = await request.formData();
  const parsed = ticketFieldsSchema.safeParse({
    employeeName: String(formData.get("employeeName") ?? ""),
    employeeEmail: String(formData.get("employeeEmail") ?? ""),
    issueTitle: String(formData.get("issueTitle") ?? ""),
    issueDescription: String(formData.get("issueDescription") ?? ""),
  });
  if (!parsed.success) return NextResponse.json({ error: "Please check the highlighted fields.", fieldErrors: parsed.error.flatten().fieldErrors }, { status: 400 });
  if (formData.get("attachment") instanceof File) return NextResponse.json({ error: "Please retry the file upload." }, { status: 400 });
  const supabase = createAdminClient();
  const { data: ticketNumber, error: numberError } = await supabase.rpc("next_ticket_number");
  if (numberError || typeof ticketNumber !== "string") throw new Error("Ticket number generation failed.");
  const result = await insertTicket({ id: randomUUID(), ticketNumber, ...parsed.data });
  await sendTicketCreatedEmails(result.ticket);
  return NextResponse.json({ ticketNumber: result.ticket.ticket_number, employeeName: result.ticket.employee_name, employeeEmail: result.ticket.employee_email }, { status: 201 });
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") ?? "";
    return contentType.includes("application/json") ? await finalizeUploadedTicket(request) : await createTicketWithoutAttachment(request);
  } catch (error) {
    if (process.env.NODE_ENV === "development") console.error("Ticket submission failed:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: genericError }, { status: 500 });
  }
}
