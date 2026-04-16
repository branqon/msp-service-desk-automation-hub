import type { ReactNode } from "react";

import { SidebarNav } from "@/components/sidebar-nav";
import { ThemeToggle } from "@/components/theme-toggle";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* Desktop sidebar */}
      <aside className="fixed left-0 top-0 z-10 hidden h-screen w-[208px] flex-col border-r border-[var(--sidebar-border)] bg-[var(--sidebar-bg)] px-0 py-6 lg:flex">
        <div className="px-[18px] pb-[18px]">
          <div className="text-[11.5px] font-medium leading-[1.35] text-[var(--sidebar-muted)]">
            Service Desk<br />Automation Hub
          </div>
          <div className="mt-1 text-[9px] uppercase tracking-[0.1em] text-[var(--sidebar-faint)]">
            Portfolio Project
          </div>
        </div>
        <div className="px-[18px] pb-[6px] pt-4 text-[9px] uppercase tracking-[0.1em] text-[var(--sidebar-whisper)]">
          Operations
        </div>
        <SidebarNav />
        <div className="mt-auto flex flex-col gap-3 px-[18px]">
          <ThemeToggle />
          <div className="flex items-center gap-[6px]">
            <div className="h-1 w-1 rounded-full bg-[var(--brand-mark)]" />
            <span className="text-[9.5px] text-[var(--sidebar-whisper)]">Local demo · demo data</span>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:ml-[208px]">
        {/* Mobile header */}
        <header className="border-b border-[var(--border)] bg-[var(--card)] px-5 py-3 lg:hidden">
          <div className="mb-2 flex items-center justify-between gap-2">
            <div className="text-[13px] font-semibold text-[var(--ink)]">
              Service Desk Automation Hub
            </div>
            <ThemeToggle compact />
          </div>
          <SidebarNav mobile />
        </header>
        <main>{children}</main>
      </div>
    </div>
  );
}
