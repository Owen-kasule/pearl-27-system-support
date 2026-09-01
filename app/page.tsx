import Image from "next/image";
import { LockKeyhole, ShieldCheck } from "lucide-react";
import { SupportForm } from "@/components/support/support-form";

export default function SupportPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_90%_0%,rgba(232,135,43,.08),transparent_30%),var(--cream)]">
      <header className="border-b border-[var(--border)] bg-[rgba(250,249,246,.9)] px-5 py-4 backdrop-blur-md sm:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between"><Image src="/favicon.svg" alt="Pearl 27" width={40} height={40} className="h-10 w-auto" /><span className="hidden items-center gap-2 text-xs font-semibold text-[var(--ink-muted)] sm:flex"><ShieldCheck size={16} className="text-[var(--success)]" />Secure employee support</span></div>
      </header>
      <div className="mx-auto max-w-4xl px-4 py-9 sm:px-6 sm:py-14 lg:py-16">
        <div className="mb-7 text-center sm:mb-9">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.19em] text-[var(--copper-dark)]">Sphere account assistance</p>
          <h1 className="font-serif mx-auto mt-3 max-w-3xl text-[42px] font-semibold leading-[0.98] tracking-[-0.04em] text-[var(--navy)] sm:text-6xl">Need help with your Sphere account?</h1>
          <p className="mx-auto mt-5 max-w-2xl text-[15px] leading-7 text-[var(--ink-muted)] sm:text-base">Tell us what happened and include a screenshot if possible. The System Support team will review your request and assist you.</p>
        </div>
        <section className="overflow-hidden rounded-[5px] border border-[var(--border)] bg-white shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--navy)] px-5 py-4 text-white sm:px-10"><div><p className="font-serif text-xl font-semibold">Pearl 27 System Support</p><p className="mt-0.5 text-xs text-white/65">Complete the form below to create a request.</p></div><LockKeyhole size={19} className="text-[var(--copper)]" /></div>
          <SupportForm />
        </section>
        <p className="mt-5 text-center text-xs leading-5 text-[var(--ink-muted)]">Your request and attachment are shared only with authorized System Support staff.</p>
      </div>
    </main>
  );
}
