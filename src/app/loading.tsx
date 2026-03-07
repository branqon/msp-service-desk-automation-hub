export default function Loading() {
  return (
    <div className="grid gap-5">
      <div className="h-36 animate-pulse rounded-3xl bg-white/80" />
      <div className="grid gap-5 xl:grid-cols-3">
        <div className="h-72 animate-pulse rounded-3xl bg-white/80" />
        <div className="h-72 animate-pulse rounded-3xl bg-white/80" />
        <div className="h-72 animate-pulse rounded-3xl bg-white/80" />
      </div>
      <div className="h-[420px] animate-pulse rounded-3xl bg-white/80" />
    </div>
  );
}
