"use client";

import { useEffect, useRef, useState } from "react";
import { FileText, ImageIcon, Paperclip, Trash2, UploadCloud } from "lucide-react";
import { ACCEPTED_ATTACHMENT_EXTENSIONS } from "@/lib/constants";
import { formatBytes } from "@/lib/utils";
import { validateAttachment } from "@/lib/validation/ticket";

interface FileUploadProps {
  file: File | null;
  error?: string;
  disabled?: boolean;
  onChange: (file: File | null, error?: string) => void;
}

export function FileUpload({ file, error, disabled, onChange }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const previewRef = useRef<string | null>(null);

  useEffect(() => {
    return () => { if (previewRef.current) URL.revokeObjectURL(previewRef.current); };
  }, []);

  function choose(selected: File | undefined) {
    if (!selected) return;
    const validationError = validateAttachment(selected);
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    const nextPreview = !validationError && selected.type.startsWith("image/") ? URL.createObjectURL(selected) : null;
    previewRef.current = nextPreview;
    setPreviewUrl(nextPreview);
    onChange(validationError ? null : selected, validationError ?? undefined);
    if (validationError && inputRef.current) inputRef.current.value = "";
  }

  function remove() {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    previewRef.current = null;
    setPreviewUrl(null);
    onChange(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div>
      <input
        ref={inputRef}
        id="attachment"
        name="attachment"
        type="file"
        className="sr-only"
        accept={ACCEPTED_ATTACHMENT_EXTENSIONS}
        disabled={disabled}
        onChange={(event) => choose(event.target.files?.[0])}
        aria-describedby="attachment-help attachment-error"
      />
      {!file ? (
        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          onDragEnter={(event) => { event.preventDefault(); setDragging(true); }}
          onDragOver={(event) => event.preventDefault()}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => { event.preventDefault(); setDragging(false); choose(event.dataTransfer.files[0]); }}
          className={`focus-ring flex min-h-36 w-full flex-col items-center justify-center rounded-[4px] border border-dashed px-5 py-6 text-center transition ${dragging ? "border-[var(--copper)] bg-[#fff8ef]" : "border-[rgba(27,42,74,.28)] bg-[var(--cream)] hover:border-[var(--copper)] hover:bg-[#fffaf3]"}`}
        >
          <span className="mb-3 flex size-10 items-center justify-center rounded-full bg-white text-[var(--copper-dark)] shadow-sm"><UploadCloud size={20} /></span>
          <span className="text-sm font-bold text-[var(--navy)]">Choose a file <span className="font-normal text-[var(--ink-muted)]">or drag it here</span></span>
          <span className="mt-1 text-xs text-[var(--ink-muted)]">PNG, JPG, WEBP, or PDF · up to 5 MB</span>
        </button>
      ) : (
        <div className="flex items-center gap-4 rounded-[4px] border border-[var(--border)] bg-white p-3">
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewUrl} alt="Selected attachment preview" className="size-16 shrink-0 rounded-[3px] object-cover" />
          ) : (
            <span className="flex size-16 shrink-0 items-center justify-center rounded-[3px] bg-[var(--cream-dark)] text-[var(--navy)]"><FileText /></span>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-[var(--navy)]">{file.name}</p>
            <p className="mt-1 flex items-center gap-1 text-xs text-[var(--ink-muted)]">{file.type.startsWith("image/") ? <ImageIcon size={13} /> : <Paperclip size={13} />}{formatBytes(file.size)}</p>
          </div>
          <button type="button" onClick={remove} disabled={disabled} className="focus-ring flex size-10 shrink-0 items-center justify-center rounded-full text-[var(--danger)] hover:bg-red-50" aria-label={`Remove ${file.name}`}><Trash2 size={18} /></button>
        </div>
      )}
      <p id="attachment-error" className="mt-2 min-h-5 text-sm text-[var(--danger)]" role={error ? "alert" : undefined}>{error}</p>
    </div>
  );
}
