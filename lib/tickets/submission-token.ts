import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { uploadPreparationSchema } from "@/lib/validation/ticket";

const payloadSchema = uploadPreparationSchema.extend({
  id: z.string().uuid(),
  ticketNumber: z.string().regex(/^P27-\d{6,}$/),
  attachmentPath: z.string().min(1),
  expiresAt: z.number().int(),
});

export type SubmissionPayload = z.infer<typeof payloadSchema>;

function secret(): string {
  const value = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!value) throw new Error("Submission signing secret is not configured.");
  return value;
}

export function createSubmissionToken(payload: SubmissionPayload): string {
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = createHmac("sha256", secret()).update(encoded).digest("base64url");
  return `${encoded}.${signature}`;
}

export function verifySubmissionToken(token: string): SubmissionPayload | null {
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return null;
  const expected = createHmac("sha256", secret()).update(encoded).digest();
  let actual: Buffer;
  try { actual = Buffer.from(signature, "base64url"); } catch { return null; }
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;
  try {
    const parsed = payloadSchema.safeParse(JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")));
    if (!parsed.success || parsed.data.expiresAt < Date.now()) return null;
    return parsed.data;
  } catch { return null; }
}
