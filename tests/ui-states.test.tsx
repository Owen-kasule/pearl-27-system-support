import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SubmissionSuccess } from "@/components/support/submission-success";
import { TicketList } from "@/components/admin/ticket-list";
import type { Ticket } from "@/types/ticket";

const ticket: Ticket = {
  id: "ticket-id",
  ticket_number: "P27-000127",
  employee_name: "Amina K.",
  employee_email: "amina@example.com",
  issue_title: "Cannot access Sphere",
  issue_description: "Access denied",
  attachment_path: null,
  attachment_name: null,
  attachment_type: null,
  attachment_size: null,
  status: "SUBMITTED",
  resolution_notes: null,
  created_at: "2026-09-01T08:00:00Z",
  updated_at: "2026-09-01T08:00:00Z",
  resolved_at: null,
  resolved_by: null,
};

describe("employee success state", () => {
  it("shows the ticket number, email, and next action", () => {
    render(<SubmissionSuccess result={{ ticketNumber: ticket.ticket_number, employeeName: ticket.employee_name, employeeEmail: ticket.employee_email }} onReset={() => undefined} />);
    expect(screen.getByRole("heading", { name: "Support request submitted" })).toBeInTheDocument();
    expect(screen.getByText("P27-000127")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "amina@example.com" })).toHaveAttribute("href", "mailto:amina@example.com");
    expect(screen.getByRole("button", { name: "Submit Another Request" })).toBeInTheDocument();
  });
});

describe("admin ticket list", () => {
  it("renders navigable desktop and mobile ticket presentations", () => {
    render(<TicketList tickets={[ticket]} emptyMessage="No support requests yet." />);
    expect(screen.getAllByText("P27-000127").length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByRole("link", { name: /P27-000127|Open P27-000127/ })).toHaveLength(2);
  });

  it("renders a useful empty state", () => {
    render(<TicketList tickets={[]} emptyMessage="No tickets matched your search." />);
    expect(screen.getByText("No tickets matched your search.")).toBeInTheDocument();
  });
});
