import "server-only";
import { Resend } from "resend";
import type { Ticket } from "@/types/ticket";
import { newTicketAdminEmail, ticketReceivedEmail, ticketResolvedEmail } from "./templates";

async function deliver(to: string, content: { subject: string; html: string }): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) {
    if (process.env.NODE_ENV !== "test") console.warn("Email skipped because Resend is not configured.");
    return;
  }
  const { error } = await new Resend(apiKey).emails.send({ from, to, ...content });
  if (error) throw new Error(`Resend delivery failed: ${error.name}`);
}

export async function sendTicketCreatedEmails(ticket: Ticket): Promise<void> {
  const deliveries = [deliver(ticket.employee_email, ticketReceivedEmail(ticket))];
  const supportEmail = process.env.SYSTEM_SUPPORT_EMAIL;
  if (supportEmail) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "http://localhost:3000";
    deliveries.push(deliver(supportEmail, newTicketAdminEmail(ticket, `${appUrl}/admin/tickets/${ticket.ticket_number}`)));
  }
  const results = await Promise.allSettled(deliveries);
  for (const result of results) if (result.status === "rejected") console.error("Ticket email delivery failed.");
}

export async function sendTicketResolved(ticket: Ticket): Promise<void> {
  try {
    await deliver(ticket.employee_email, ticketResolvedEmail(ticket));
  } catch {
    console.error("Resolution email delivery failed.");
  }
}
