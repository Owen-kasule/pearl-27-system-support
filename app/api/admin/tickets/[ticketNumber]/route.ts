import { NextResponse } from "next/server";
import { getSupportUser } from "@/lib/auth";
import { sendTicketResolved } from "@/lib/email/send";
import { ticketStatusUpdateSchema } from "@/lib/validation/ticket";
import type { Ticket } from "@/types/ticket";

export async function PATCH(request: Request, { params }: { params: Promise<{ ticketNumber: string }> }) {
  const auth = await getSupportUser();
  if (!auth) return NextResponse.json({ error: "You are not authorized to update this ticket." }, { status: 401 });
  try {
    const { ticketNumber } = await params;
    if (!/^P27-\d{6,}$/.test(ticketNumber)) return NextResponse.json({ error: "Ticket not found." }, { status: 404 });
    const parsed = ticketStatusUpdateSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Please check the update." }, { status: 400 });
    const { data: didResolve, error: updateError } = await auth.supabase.rpc("update_ticket_status", {
      p_ticket_number: ticketNumber,
      p_status: parsed.data.status,
      p_resolution_notes: parsed.data.resolutionNotes || null,
    });
    if (updateError) return NextResponse.json({ error: "We couldn't update this ticket. Please try again." }, { status: 400 });
    if (didResolve) {
      const { data } = await auth.supabase.from("tickets").select("*").eq("ticket_number", ticketNumber).single();
      if (data) await sendTicketResolved(data as Ticket);
    }
    return NextResponse.json({ ok: true, didResolve: Boolean(didResolve) });
  } catch {
    return NextResponse.json({ error: "We couldn't update this ticket. Please try again." }, { status: 500 });
  }
}
