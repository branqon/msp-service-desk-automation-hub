import type { ReactNode } from "react";

import { SidebarNav } from "@/components/sidebar-nav";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#13131a] text-[#f1f1f4]">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <aside className="hidden w-[300px] shrink-0 border-r border-white/6 bg-[#0f0f18] p-6 lg:block">
          <div className="rounded-3xl border border-white/8 bg-[#1a1a26] p-6 shadow-[0_20px_50px_-32px_rgba(0,0,0,0.7)] backdrop-blur">
            <div className="mb-8 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#818cf8]">
                MSP Automation Portfolio
              </p>
              <div>
                <h1 className="font-display text-3xl font-semibold tracking-tight text-[#f1f1f4]">
                  Service Desk Automation Hub
                </h1>
                <p className="mt-2 text-sm leading-6 text-[#8b8ba0]">
                  AI-assisted triage, SLA routing, approval gates, and reporting for an MSP service desk.
                </p>
              </div>
            </div>
            <SidebarNav />
          </div>
        </aside>
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-white/6 bg-[#13131a]/80 px-5 py-4 backdrop-blur lg:px-8">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#5f5f78]">
                    Local Demo Environment
                  </p>
                  <p className="mt-1 text-sm text-[#8b8ba0]">
                    Mocked external systems, seeded MSP data, and auditable automation decisions.
                  </p>
                </div>
                <div className="rounded-full border border-indigo-400/20 bg-indigo-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-indigo-300">
                  Human-in-the-loop enabled
                </div>
              </div>
              <div className="lg:hidden">
                <SidebarNav mobile />
              </div>
            </div>
          </header>
          <main className="flex-1 px-5 py-6 lg:px-8 lg:py-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
