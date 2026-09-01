import type { TicketStatus } from "@/types/ticket";

export function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] || "there";
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kilobytes = bytes / 1024;
  if (kilobytes < 1024) return `${kilobytes.toFixed(kilobytes >= 10 ? 0 : 1)} KB`;
  return `${(kilobytes / 1024).toFixed(1)} MB`;
}

export function formatDate(value: string, includeTime = true): string {
  return new Intl.DateTimeFormat("en-UG", {
    dateStyle: "medium",
    ...(includeTime ? { timeStyle: "short" as const } : {}),
    timeZone: "Africa/Kampala",
  }).format(new Date(value));
}

export const STATUS_LABELS: Record<TicketStatus, string> = {
  SUBMITTED: "Submitted",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
};

export function safeFileName(name: string): string {
  const extension = name.includes(".") ? name.split(".").pop()?.toLowerCase() : undefined;
  const base = name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9_-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80) || "attachment";
  return extension ? `${base}.${extension}` : base;
}
