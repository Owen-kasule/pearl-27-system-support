export const MAX_ATTACHMENT_SIZE = 5 * 1024 * 1024;
export const ACCEPTED_ATTACHMENT_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "application/pdf",
] as const;

export const ACCEPTED_ATTACHMENT_EXTENSIONS = ".png,.jpg,.jpeg,.webp,.pdf";
export const STORAGE_BUCKET = "support-attachments";
