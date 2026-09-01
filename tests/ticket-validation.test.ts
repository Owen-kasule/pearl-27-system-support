import { describe, expect, it } from "vitest";
import { ticketFieldsSchema, ticketStatusUpdateSchema, validateAttachment } from "@/lib/validation/ticket";

const valid = { employeeName: "Amina K.", employeeEmail: "amina@example.com", issueTitle: "Cannot access Sphere", issueDescription: "The sign-in page shows an access denied message." };

describe("ticket submission validation", () => {
  it("accepts a complete request", () => expect(ticketFieldsSchema.safeParse(valid).success).toBe(true));
  it("requires every core field", () => expect(ticketFieldsSchema.safeParse({ employeeName: "", employeeEmail: "", issueTitle: "", issueDescription: "" }).success).toBe(false));
  it("rejects an invalid email", () => expect(ticketFieldsSchema.safeParse({ ...valid, employeeEmail: "not-an-email" }).success).toBe(false));
  it("rejects an oversized file", () => expect(validateAttachment(new File([new Uint8Array(5 * 1024 * 1024 + 1)], "large.png", { type: "image/png" }))).toContain("larger than 5 MB"));
  it("rejects an unsupported file", () => expect(validateAttachment(new File(["text"], "script.exe", { type: "application/x-msdownload" }))).toContain("PNG"));
  it("accepts supported images", () => expect(validateAttachment(new File(["image"], "screen.webp", { type: "image/webp" }))).toBeNull());
});

describe("ticket resolution validation", () => {
  it("allows Submitted to In Progress", () => expect(ticketStatusUpdateSchema.safeParse({ status: "IN_PROGRESS", resolutionNotes: "" }).success).toBe(true));
  it("requires notes when resolving", () => expect(ticketStatusUpdateSchema.safeParse({ status: "RESOLVED", resolutionNotes: "" }).success).toBe(false));
  it("accepts a documented resolution", () => expect(ticketStatusUpdateSchema.safeParse({ status: "RESOLVED", resolutionNotes: "Permissions restored." }).success).toBe(true));
});
