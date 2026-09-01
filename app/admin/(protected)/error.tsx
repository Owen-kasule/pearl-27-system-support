"use client";

export default function AdminError({ reset }: { error: Error; reset: () => void }) {
  return <div className="rounded-[4px] border border-red-200 bg-white p-8 text-center"><h1 className="font-serif text-3xl font-semibold">We couldn&apos;t load this page.</h1><p className="mt-2 text-sm text-[var(--ink-muted)]">Please try again. Your support data has not been changed.</p><button className="primary-button mt-6" onClick={reset}>Try Again</button></div>;
}
