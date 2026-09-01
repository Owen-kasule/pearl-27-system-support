import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { STORAGE_BUCKET } from "@/lib/constants";
import { createAdminClient } from "@/lib/supabase/admin";
import { createSubmissionToken } from "@/lib/tickets/submission-token";
import { safeFileName } from "@/lib/utils";
import { uploadPreparationSchema } from "@/lib/validation/ticket";

export async function POST(request: Request) {
  try {
    const parsed = uploadPreparationSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Please check the request and selected file." }, { status: 400 });
    const supabase = createAdminClient();
    const id = randomUUID();
    const { data: ticketNumber, error: numberError } = await supabase.rpc("next_ticket_number");
    if (numberError || typeof ticketNumber !== "string") throw new Error("Ticket number generation failed.");
    const attachmentPath = `tickets/${id}/${safeFileName(parsed.data.attachment.name)}`;
    const { data: upload, error: uploadError } = await supabase.storage.from(STORAGE_BUCKET).createSignedUploadUrl(attachmentPath);
    if (uploadError || !upload) throw new Error("Signed upload creation failed.");
    const submissionToken = createSubmissionToken({ ...parsed.data, id, ticketNumber, attachmentPath, expiresAt: Date.now() + 10 * 60 * 1000 });
    return NextResponse.json({ path: upload.path, uploadToken: upload.token, submissionToken });
  } catch {
    return NextResponse.json({ error: "We couldn't prepare this file upload. Please try again." }, { status: 500 });
  }
}
