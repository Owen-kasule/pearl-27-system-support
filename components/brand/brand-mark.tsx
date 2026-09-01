export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3" aria-label="Pearl 27">
      <span className="font-serif flex size-11 shrink-0 items-center justify-center rounded-full border-2 border-[var(--navy)] text-center text-[11px] font-bold leading-[0.8] tracking-[-0.03em] text-[var(--navy)] shadow-[inset_0_0_0_2px_var(--cream),inset_0_0_0_3px_rgba(27,42,74,.25)]">
        PEARL<br />27
      </span>
      {!compact && (
        <span className="font-serif text-[19px] font-semibold leading-none tracking-[-0.01em] text-[var(--navy)]">
          Pearl 27 <span className="block pt-1 font-sans text-[9px] font-bold uppercase tracking-[0.16em] text-[var(--copper-dark)]">System Support</span>
        </span>
      )}
    </div>
  );
}
