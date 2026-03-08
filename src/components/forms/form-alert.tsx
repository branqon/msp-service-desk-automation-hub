"use client";

export function FormAlert({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-rose-700/20 bg-rose-900/30 px-4 py-3 text-sm text-rose-300">
      {message}
    </div>
  );
}
