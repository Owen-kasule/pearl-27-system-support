import { describe, expect, it } from "vitest";
import { ticketReceivedEmail, ticketResolvedEmail } from "@/lib/email/templates";
import type { Ticket } from "@/types/ticket";

const ticket: Ticket = { id: "test-id", ticket_number: "P27-000127", employee_name: "Amina K.", employee_email: "amina@example.com", issue_title: "Unable to access Sphere", issue_description: "Access denied", attachment_path: null, attachment_name: null, attachment_type: null, attachment_size: null, status: "RESOLVED", resolution_notes: "Permissions restored.", created_at: "2026-09-01T08:00:00Z", updated_at: "2026-09-01T09:00:00Z", resolved_at: "2026-09-01T09:00:00Z", resolved_by: "admin-id" };

describe("email templates", () => {
  it("includes the public ticket number in the received email", () => { const email = ticketReceivedEmail(ticket); expect(email.subject).toContain("P27-000127"); expect(email.html).not.toContain(ticket.id); });
  it("includes resolution notes in the resolved email", () => { const email = ticketResolvedEmail(ticket); expect(email.subject).toContain("resolved"); expect(email.html).toContain("Permissions restored."); });
  it("escapes employee-controlled HTML", () => { const email = ticketReceivedEmail({ ...ticket, employee_name: "<script>alert(1)</script>" }); expect(email.html).not.toContain("<script>"); });
});
