import { z } from "zod";
import { ACCEPTED_ATTACHMENT_TYPES, MAX_ATTACHMENT_SIZE } from "@/lib/constants";
import { TICKET_STATUSES } from "@/types/ticket";

export const ticketFieldsSchema = z.object({
  employeeName: z.string().trim().min(1, "Please enter your name.").max(100, "Please keep your name under 100 characters."),
  employeeEmail: z.string().trim().min(1, "Please enter your email address.").email("Please enter a valid email address.").max(254, "Please enter a shorter email address."),
  issueTitle: z.string().trim().min(1, "Please enter an issue title.").max(160, "Please keep the title under 160 characters."),
  issueDescription: z.string().trim().min(1, "Please describe what happened.").max(5000, "Please keep the description under 5,000 characters."),
});

export type TicketFields = z.infer<typeof ticketFieldsSchema>;

export function validateAttachment(file: File | null): string | null {
  if (!file || file.size === 0) return null;
  if (file.size > MAX_ATTACHMENT_SIZE) return "This file is larger than 5 MB. Please choose a smaller file.";
  if (!ACCEPTED_ATTACHMENT_TYPES.includes(file.type as (typeof ACCEPTED_ATTACHMENT_TYPES)[number])) {
    return "Please choose a PNG, JPG, WEBP, or PDF file.";
  }
  return null;
}

export const ticketStatusUpdateSchema = z
  .object({
    status: z.enum(TICKET_STATUSES),
    resolutionNotes: z.string().trim().max(5000, "Please keep the resolution under 5,000 characters.").optional().default(""),
  })
  .superRefine((value, context) => {
    if (value.status === "RESOLVED" && !value.resolutionNotes) {
      context.addIssue({ code: "custom", path: ["resolutionNotes"], message: "Please add resolution notes before resolving this ticket." });
    }
  });

export const attachmentMetadataSchema = z.object({
  name: z.string().trim().min(1).max(255),
  type: z.enum(ACCEPTED_ATTACHMENT_TYPES),
  size: z.number().int().positive().max(MAX_ATTACHMENT_SIZE),
});

export const uploadPreparationSchema = ticketFieldsSchema.extend({
  attachment: attachmentMetadataSchema,
});
