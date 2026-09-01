"use client";

import { FormEvent, useState } from "react";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setError("");
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    try {
      const { error: authError } = await createClient().auth.signInWithPassword({ email, password });
      if (authError) { setError("Incorrect email or password."); return; }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("We couldn't sign you in. Please try again.");
    } finally { setLoading(false); }
  }

  return (
    <form onSubmit={signIn} className="mt-7 space-y-4">
      <div><label htmlFor="email" className="mb-2 block text-sm font-bold">Email</label><input className="field" id="email" name="email" type="email" autoComplete="email" required disabled={loading} /></div>
      <div><label htmlFor="password" className="mb-2 block text-sm font-bold">Password</label><input className="field" id="password" name="password" type="password" autoComplete="current-password" required disabled={loading} /></div>
      {error && <p role="alert" className="border-l-2 border-[var(--danger)] bg-red-50 px-3 py-2 text-sm text-[var(--danger)]">{error}</p>}
      <button type="submit" className="primary-button mt-2 w-full" disabled={loading}>{loading ? <><LoaderCircle className="animate-spin" size={18} />Signing In...</> : <>Sign In<ArrowRight size={18} /></>}</button>
    </form>
  );
}
