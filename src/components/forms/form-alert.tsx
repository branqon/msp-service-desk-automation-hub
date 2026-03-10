export function FormAlert({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return (
    <div className="rounded-[5px] border border-[var(--red)]/20 bg-[var(--red-bg)] px-4 py-3 text-sm text-[var(--red)]">
      {message}
    </div>
  );
}
