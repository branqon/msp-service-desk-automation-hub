export default function Loading() {
  return (
    <div className="animate-pulse space-y-4 p-8">
      <div className="h-10 w-48 rounded-[5px] bg-[var(--border)]" />
      <div className="grid grid-cols-5 gap-px overflow-hidden rounded-[6px] border border-[var(--border)] bg-[var(--border)]">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-[var(--card)] p-4">
            <div className="h-6 w-16 rounded bg-[var(--border-light)]" />
            <div className="mt-2 h-3 w-24 rounded bg-[var(--border-light)]" />
          </div>
        ))}
      </div>
      <div className="h-64 rounded-[6px] border border-[var(--border)] bg-[var(--card)]" />
    </div>
  );
}
