export default function AdminLoading() {
  return <div className="animate-pulse"><div className="h-4 w-28 bg-[var(--cream-dark)]" /><div className="mt-3 h-12 w-64 bg-[var(--cream-dark)]" /><div className="mt-9 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-32 rounded-[4px] bg-[var(--cream-dark)]" />)}</div></div>;
}
