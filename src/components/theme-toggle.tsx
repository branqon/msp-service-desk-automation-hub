"use client";

import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";

import { cn } from "@/lib/utils";

type Theme = "light" | "dark";

const STORAGE_KEY = "msp-theme";

const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function readTheme(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function getServerSnapshot(): Theme {
  return "light";
}

function setTheme(next: Theme) {
  document.documentElement.dataset.theme = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // ignore storage errors (private mode, etc.)
  }
  for (const listener of listeners) {
    listener();
  }
}

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const theme = useSyncExternalStore(subscribe, readTheme, getServerSnapshot);

  const toggle = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const label = theme === "dark" ? "Switch to light mode" : "Switch to dark mode";
  const Icon = theme === "dark" ? Sun : Moon;

  if (compact) {
    return (
      <button
        type="button"
        onClick={toggle}
        aria-label={label}
        aria-pressed={theme === "dark"}
        suppressHydrationWarning
        className="inline-flex h-8 w-8 items-center justify-center rounded-[5px] border border-[var(--border)] bg-[var(--card)] text-[var(--ink-60)] transition-colors hover:border-[var(--whisper)] hover:text-[var(--ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ink)]/20"
      >
        <Icon className="h-4 w-4" aria-hidden="true" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      aria-pressed={theme === "dark"}
      suppressHydrationWarning
      className={cn(
        "inline-flex items-center justify-between gap-2 rounded-[5px] border border-white/10 bg-white/5 px-2.5 py-1.5 text-[10.5px] font-medium text-[var(--sidebar-muted)] transition-colors hover:border-white/20 hover:text-[var(--sidebar-ink)]",
      )}
    >
      <span className="flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
        <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>
      </span>
    </button>
  );
}
