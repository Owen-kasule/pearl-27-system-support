import type { Ticket } from "@/types/ticket";
import { firstName } from "@/lib/utils";

function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#039;", '"': "&quot;" })[character] ?? character);
}

function emailShell(content: string): string {
  return `<!doctype html><html><body style="margin:0;background:#f0ede6;font-family:Arial,sans-serif;color:#1b2a4a"><div style="max-width:600px;margin:0 auto;padding:32px 16px"><div style="background:#1b2a4a;padding:18px 24px;color:#fff"><strong style="font-family:Georgia,serif;font-size:22px">Pearl 27</strong><span style="margin-left:10px;color:#e8872b;font-size:12px;text-transform:uppercase;letter-spacing:1px">System Support</span></div><div style="background:#fff;padding:28px 24px;border:1px solid rgba(27,42,74,.12)">${content}</div><p style="font-size:12px;color:#6b7280;text-align:center">Pearl 27 System Support</p></div></body></html>`;
}

function detail(label: string, value: string): string {
  return `<div style="margin:18px 0"><div style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#6b7280">${label}</div><div style="font-size:16px;font-weight:600;margin-top:4px">${escapeHtml(value)}</div></div>`;
}

export function ticketReceivedEmail(ticket: Ticket) {
  return {
    subject: `Support request received | ${ticket.ticket_number}`,
    html: emailShell(`<p>Hi ${escapeHtml(firstName(ticket.employee_name))},</p><p>We have received your support request.</p>${detail("Ticket", ticket.ticket_number)}${detail("Issue", ticket.issue_title)}${detail("Status", "Submitted")}<p>The Pearl 27 System Support team will review your request.</p><p>You will receive another email when the issue has been resolved.</p>`),
  };
}

export function newTicketAdminEmail(ticket: Ticket, adminUrl: string) {
  return {
    subject: `New support request | ${ticket.ticket_number}`,
    html: emailShell(`<p>A new support request has been submitted.</p>${detail("Employee", ticket.employee_name)}${detail("Email", ticket.employee_email)}${detail("Issue", ticket.issue_title)}${detail("Ticket", ticket.ticket_number)}<p><a href="${escapeHtml(adminUrl)}" style="display:inline-block;background:#e8872b;color:#fff;padding:12px 18px;text-decoration:none">Open support request</a></p>`),
  };
}

export function ticketResolvedEmail(ticket: Ticket) {
  return {
    subject: `Your support request has been resolved | ${ticket.ticket_number}`,
    html: emailShell(`<p>Hi ${escapeHtml(firstName(ticket.employee_name))},</p><p>Your Pearl 27 System Support request has been resolved.</p>${detail("Ticket", ticket.ticket_number)}${detail("Issue", ticket.issue_title)}${detail("Status", "Resolved")}${detail("Resolution", ticket.resolution_notes ?? "Resolved")}<p>If you continue experiencing the issue, please contact the System Support team.</p>`),
  };
}
