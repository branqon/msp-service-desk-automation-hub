import type { ReactNode } from "react";

import { SidebarNav } from "@/components/sidebar-nav";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f5fafb_0%,#eef4f7_55%,#f8fafc_100%)] text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <aside className="hidden w-[300px] shrink-0 border-r border-white/60 bg-[radial-gradient(circle_at_top,#d9f3ef_0%,rgba(217,243,239,0.35)_28%,transparent_70%)] p-6 lg:block">
          <div className="rounded-3xl border border-white/70 bg-white/75 p-6 shadow-[0_20px_50px_-32px_rgba(15,23,42,0.45)] backdrop-blur">
            <div className="mb-8 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#0f766e]">
                MSP Automation Portfolio
              </p>
              <div>
                <h1 className="font-display text-3xl font-semibold tracking-tight text-slate-950">
                  Service Desk Automation Hub
                </h1>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  AI-assisted triage, SLA routing, approval gates, and reporting for an MSP service desk.
                </p>
              </div>
            </div>
            <SidebarNav />
          </div>
        </aside>
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-white/70 bg-white/70 px-5 py-4 backdrop-blur lg:px-8">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Local Demo Environment
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    Mocked external systems, seeded MSP data, and auditable automation decisions.
                  </p>
                </div>
                <div className="rounded-full border border-[#0f766e]/20 bg-[#0f766e]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
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
