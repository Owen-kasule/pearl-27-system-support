import Link from "next/link";
import { LayoutDashboard, LogOut, Menu, Ticket } from "lucide-react";
import { BrandMark } from "@/components/brand/brand-mark";
import { signOut } from "@/app/admin/actions";

export function AdminShell({ children, name }: { children: React.ReactNode; name: string | null }) {
  const nav = (
    <nav aria-label="Admin navigation" className="space-y-1">
      <Link href="/admin" className="flex min-h-11 items-center gap-3 rounded-[3px] px-3 text-sm font-semibold text-white/75 hover:bg-white/7 hover:text-white"><LayoutDashboard size={18} />Dashboard</Link>
      <Link href="/admin/tickets" className="flex min-h-11 items-center gap-3 rounded-[3px] px-3 text-sm font-semibold text-white/75 hover:bg-white/7 hover:text-white"><Ticket size={18} />Tickets</Link>
    </nav>
  );
  return (
    <div className="min-h-screen bg-[var(--cream)] lg:grid lg:grid-cols-[248px_1fr]">
      <aside className="hidden min-h-screen bg-[var(--navy-deep)] px-5 py-6 lg:block">
        <div className="[&_span]:text-white [&_.text-\[var\(--copper-dark\)\]]:!text-[var(--copper)]"><BrandMark /></div>
        <div className="mt-10">{nav}</div>
        <div className="fixed bottom-6 w-[208px] border-t border-white/10 pt-5"><p className="truncate px-3 text-xs text-white/55">Signed in as</p><p className="mt-1 truncate px-3 text-sm font-semibold text-white">{name || "Support Admin"}</p><form action={signOut}><button className="mt-4 flex min-h-11 w-full items-center gap-3 rounded-[3px] px-3 text-sm font-semibold text-white/70 hover:bg-white/7 hover:text-white"><LogOut size={17} />Sign Out</button></form></div>
      </aside>
      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between border-b border-[var(--border)] bg-[rgba(250,249,246,.94)] px-4 backdrop-blur-lg lg:hidden">
          <BrandMark />
          <details className="group relative"><summary className="focus-ring flex size-11 cursor-pointer list-none items-center justify-center rounded-[3px] border border-[var(--border)] bg-white" aria-label="Open navigation"><Menu size={20} /></summary><div className="absolute right-0 top-13 w-56 rounded-[4px] bg-[var(--navy-deep)] p-3 shadow-xl">{nav}<form action={signOut} className="mt-2 border-t border-white/10 pt-2"><button className="flex min-h-11 w-full items-center gap-3 px-3 text-sm font-semibold text-white/75"><LogOut size={17} />Sign Out</button></form></div></details>
        </header>
        <main className="px-4 py-7 sm:px-7 lg:px-10 lg:py-9">{children}</main>
      </div>
    </div>
  );
}
