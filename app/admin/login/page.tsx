import { redirect } from "next/navigation";
import { BrandMark } from "@/components/brand/brand-mark";
import { getSupportUser } from "@/lib/auth";
import { LoginForm } from "./login-form";

export const metadata = { title: "Admin Sign In" };

export default async function AdminLoginPage() {
  if (await getSupportUser()) redirect("/admin");
  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_50%_0%,var(--navy-mid),var(--navy-deep)_65%)] px-4 py-10">
      <section className="w-full max-w-md overflow-hidden rounded-[5px] border border-white/10 bg-[var(--cream)] shadow-2xl">
        <div className="border-b border-[var(--border)] px-7 py-6"><BrandMark /></div>
        <div className="px-7 py-8 sm:px-9">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.17em] text-[var(--copper-dark)]">Authorized access</p>
          <h1 className="font-serif mt-2 text-4xl font-semibold tracking-[-0.035em] text-[var(--navy)]">Sign in to support</h1>
          <p className="mt-3 text-sm leading-6 text-[var(--ink-muted)]">Use your Pearl 27 System Support account to manage employee requests.</p>
          <LoginForm />
        </div>
      </section>
    </main>
  );
}
