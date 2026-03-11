import type { ReactNode } from "react";

import { SidebarNav } from "@/components/sidebar-nav";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* Desktop sidebar */}
      <aside className="fixed left-0 top-0 z-10 hidden h-screen w-[208px] flex-col border-r border-[#1a1a1a] bg-[var(--sidebar-bg)] px-0 py-6 lg:flex">
        <div className="px-[18px] pb-[18px]">
          <div className="text-[11.5px] font-medium leading-[1.35] text-[#8a8a8a]">
            Service Desk<br />Automation Hub
          </div>
          <div className="mt-1 text-[9px] uppercase tracking-[0.1em] text-[#555]">
            Portfolio Project
          </div>
        </div>
        <div className="px-[18px] pb-[6px] pt-4 text-[9px] uppercase tracking-[0.1em] text-[#444]">
          Operations
        </div>
        <SidebarNav />
        <div className="mt-auto flex items-center gap-[6px] px-[18px]">
          <div className="h-1 w-1 rounded-full bg-[var(--brand-mark)]" />
          <span className="text-[9.5px] text-[#444]">Local demo · demo data</span>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:ml-[208px]">
        {/* Mobile header */}
        <header className="border-b border-[var(--border)] bg-[var(--card)] px-5 py-3 lg:hidden">
          <div className="mb-2 text-[13px] font-semibold text-[var(--ink)]">
            Service Desk Automation Hub
          </div>
          <SidebarNav mobile />
        </header>
        <main>{children}</main>
      </div>
    </div>
  );
}
