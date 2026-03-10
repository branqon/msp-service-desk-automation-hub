# UI Redesign Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the dark AI-dashboard aesthetic with a light, editorial, product-first UI that demonstrates domain knowledge and design taste.

**Architecture:** Foundation-first approach — swap CSS variables, fonts, and base components first so the design system is consistent, then update each page. The approved mockup is at `.superpowers/brainstorm/1014-1773182588/triage-console-v6.html`. The design spec is at `docs/superpowers/specs/2026-03-10-ui-redesign-design.md`.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS 4, Inter (Google Fonts), Recharts, Lucide React

---

## Chunk 1: Foundation — Fonts, CSS Variables, Layout

### Task 1: Replace fonts and CSS variables

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Update layout.tsx — swap IBM Plex/Sora for Inter**

Replace the font imports and variables. Remove IBM_Plex_Sans, IBM_Plex_Mono, Sora. Add Inter. Keep a monospace font for ticket numbers (system mono stack is fine, no custom import needed).

```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { AppShell } from "@/components/app-shell";

import "./globals.css";

const sans = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "MSP Service Desk Automation Hub",
    template: "%s | MSP Service Desk Automation Hub",
  },
  description:
    "Portfolio project demonstrating AI-assisted MSP service desk workflows, SLA routing, approvals, and reporting.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${sans.variable} antialiased`}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Update globals.css — light theme, new variables**

```css
@import "tailwindcss";

:root {
  --background: #f1f0ec;
  --foreground: #141414;
  --card: #fff;
  --border: #dfdcd5;
  --border-light: #eae8e2;
  --ink: #141414;
  --ink-80: #2a2a2a;
  --ink-60: #4d4d4d;
  --muted: #717171;
  --faint: #999;
  --whisper: #bbb;
  --bone: #ddd;
  --red: #c5303e;
  --red-bg: #fcedef;
  --amber: #b36b00;
  --amber-bg: #fef5e7;
  --green: #177a48;
  --green-bg: #ecf5f0;
  --sidebar-bg: #111;
  --brand-mark: #7d6f52;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-inter);
}

* {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: var(--font-sans), -apple-system, system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-feature-settings: 'cv01', 'cv02', 'ss01';
}

::selection {
  background: #ede5d0;
  color: var(--ink);
}

a {
  color: inherit;
  text-decoration: none;
}
```

- [ ] **Step 3: Run the dev server and verify it loads without errors**

Run: `npm run build`
Expected: Build succeeds (there will be visual breakage — that's expected at this stage)

- [ ] **Step 4: Commit**

```bash
git add src/app/layout.tsx src/app/globals.css
git commit -m "feat(ui): swap to Inter font and light theme CSS variables"
```

### Task 2: Rewrite app-shell.tsx — new layout structure

**Files:**
- Modify: `src/components/app-shell.tsx`

- [ ] **Step 1: Replace app-shell with new sidebar + page-bar layout**

The new shell has: a fixed 208px dark sidebar (desktop), a thin page-bar header, and a main content area. Mobile gets a horizontal nav in the header instead of the sidebar.

```tsx
import type { ReactNode } from "react";

import { SidebarNav } from "@/components/sidebar-nav";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* Desktop sidebar */}
      <aside className="fixed left-0 top-0 z-10 hidden h-screen w-[208px] flex-col border-r border-white/[0.06] bg-[var(--sidebar-bg)] px-0 py-6 lg:flex">
        <div className="px-[18px] pb-[18px]">
          <div className="text-[11.5px] font-medium leading-[1.35] text-white/55">
            Service Desk<br />Automation Hub
          </div>
          <div className="mt-1 text-[9px] uppercase tracking-[0.1em] text-white/[0.15]">
            Portfolio Project
          </div>
        </div>
        <div className="px-[18px] pb-[6px] pt-4 text-[9px] uppercase tracking-[0.1em] text-white/[0.13]">
          Operations
        </div>
        <SidebarNav />
        <div className="mt-auto flex items-center gap-[6px] px-[18px]">
          <div className="h-1 w-1 rounded-full bg-[var(--brand-mark)]" />
          <span className="text-[9.5px] text-white/[0.14]">Local demo · demo data</span>
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
```

- [ ] **Step 2: Commit**

```bash
git add src/components/app-shell.tsx
git commit -m "feat(ui): rewrite app shell with light theme sidebar layout"
```

### Task 3: Rewrite sidebar-nav.tsx and update navigation items

**Files:**
- Modify: `src/components/sidebar-nav.tsx`
- Modify: `src/lib/constants.ts` (navigation items only)

- [ ] **Step 1: Update navigation items in constants.ts**

Replace the `navigationItems` array with operational labels:

```ts
export const navigationItems = [
  { href: "/", label: "Triage Console" },
  { href: "/tickets", label: "Queue Workbench" },
  { href: "/tickets/new", label: "Ticket Intake" },
  { href: "/approvals", label: "Approval Gate" },
  { href: "/automation-opportunities", label: "Automation Review" },
] as const;
```

Remove the `caption` field — the new nav doesn't use it.

- [ ] **Step 2: Rewrite sidebar-nav.tsx**

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { navigationItems } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function SidebarNav({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname();

  if (mobile) {
    return (
      <nav className="flex gap-1.5 overflow-x-auto">
        {navigationItems.map((item) => {
          const active =
            item.href === "/" ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                active
                  ? "bg-[var(--ink)] text-white"
                  : "text-[var(--muted)] hover:bg-[var(--border-light)] hover:text-[var(--ink)]",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <nav className="flex flex-col gap-px px-2">
      {navigationItems.map((item) => {
        const active =
          item.href === "/" ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "relative rounded-[5px] px-2.5 py-[7px] text-xs transition-colors",
              active
                ? "bg-white/[0.06] text-white/[0.88]"
                : "text-white/30 hover:bg-white/[0.04] hover:text-white/60",
            )}
          >
            {active && (
              <span className="absolute left-0 top-[7px] bottom-[7px] w-0.5 rounded-r-sm bg-[var(--brand-mark)]" />
            )}
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
```

- [ ] **Step 3: Run build to verify**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 4: Commit**

```bash
git add src/components/sidebar-nav.tsx src/lib/constants.ts
git commit -m "feat(ui): rewrite sidebar nav with operational labels"
```

## Chunk 2: Base Components

### Task 4: Rewrite badge.tsx

**Files:**
- Modify: `src/components/ui/badge.tsx`

- [ ] **Step 1: Replace badge with new light theme tones**

```tsx
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import type { BadgeTone } from "@/lib/constants";

const toneClasses: Record<BadgeTone, string> = {
  slate: "bg-[#f1f0ec] text-[#999]",
  blue: "bg-[#eff4ff] text-[#2563eb]",
  amber: "bg-[#fef5e7] text-[#b36b00]",
  red: "bg-[#fcedef] text-[#c5303e]",
  emerald: "bg-[#ecf5f0] text-[#177a48]",
  teal: "bg-[#141414] text-white",
};

interface BadgeProps {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
}

export function Badge({ children, tone = "slate", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[3px] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.04em]",
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/badge.tsx
git commit -m "feat(ui): rewrite badge with light theme functional colors"
```

### Task 5: Rewrite button.tsx

**Files:**
- Modify: `src/components/ui/button.tsx`

- [ ] **Step 1: Replace button with new variants**

Remove ghost variant, update primary/secondary/danger styles for light theme:

```tsx
import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "danger";
type ButtonSize = "md" | "sm";

export function buttonStyles({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}) {
  const variantClass =
    variant === "primary"
      ? "bg-[var(--ink)] text-white hover:bg-[var(--ink-80)]"
      : variant === "danger"
        ? "bg-[var(--red)] text-white hover:bg-[#a8293a]"
        : "border border-[var(--border)] bg-[var(--card)] text-[var(--ink-60)] hover:border-[var(--whisper)] hover:text-[var(--ink)]";

  const sizeClass = size === "sm" ? "h-8 px-3 text-[11.5px]" : "h-9 px-4 text-[11.5px]";

  return cn(
    "inline-flex items-center justify-center rounded-[5px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ink)]/20 disabled:pointer-events-none disabled:opacity-50",
    variantClass,
    sizeClass,
    className,
  );
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
}) {
  return <button className={buttonStyles({ variant, size, className })} {...props} />;
}
```

- [ ] **Step 2: Fix any ghost variant references**

Search codebase for `variant="ghost"` and replace with `variant="secondary"`:

Run: `grep -r 'variant="ghost"' src/`

Update each occurrence.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/button.tsx
git commit -m "feat(ui): rewrite button with light theme variants"
```

### Task 6: Rewrite section-card.tsx

**Files:**
- Modify: `src/components/ui/section-card.tsx`

- [ ] **Step 1: Replace with light theme card**

```tsx
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface SectionCardProps {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function SectionCard({
  title,
  description,
  action,
  children,
  className,
}: SectionCardProps) {
  return (
    <section
      className={cn(
        "rounded-[6px] border border-[var(--border)] bg-[var(--card)]",
        className,
      )}
    >
      {(title || description || action) && (
        <div className="flex flex-col gap-1 border-b border-[var(--border)] px-5 py-3 md:flex-row md:items-center md:justify-between">
          <div>
            {title ? (
              <h2 className="text-[13px] font-semibold text-[var(--ink)]">
                {title}
              </h2>
            ) : null}
            {description ? (
              <p className="text-[11px] text-[var(--faint)]">
                {description}
              </p>
            ) : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/section-card.tsx
git commit -m "feat(ui): rewrite section card for light theme"
```

### Task 7: Rewrite empty-state.tsx and form components

**Files:**
- Modify: `src/components/ui/empty-state.tsx`
- Modify: `src/components/forms/form-alert.tsx`

- [ ] **Step 1: Update empty-state.tsx**

```tsx
import type { ReactNode } from "react";

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="rounded-[6px] border border-dashed border-[var(--border)] bg-[var(--background)] px-6 py-10 text-center">
      <h3 className="text-sm font-medium text-[var(--ink)]">{title}</h3>
      {children ? <p className="mt-1 text-xs text-[var(--faint)]">{children}</p> : null}
    </div>
  );
}
```

- [ ] **Step 2: Update form-alert.tsx**

```tsx
export function FormAlert({ message }: { message: string }) {
  return (
    <div className="rounded-[5px] border border-[var(--red)]/20 bg-[var(--red-bg)] px-4 py-3 text-sm text-[var(--red)]">
      {message}
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/empty-state.tsx src/components/forms/form-alert.tsx
git commit -m "feat(ui): update empty state and form alert for light theme"
```

### Task 8: Rewrite metric-card.tsx

**Files:**
- Modify: `src/components/metric-card.tsx`

- [ ] **Step 1: Replace metric card with compact strip-style metric**

The new design uses inline metrics in a strip, not individual cards. But MetricCard is used on multiple pages, so keep it as a reusable component with the new look:

```tsx
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  detail?: string;
  tone?: "default" | "red" | "amber";
  className?: string;
}

export function MetricCard({ label, value, unit, detail, tone = "default", className }: MetricCardProps) {
  return (
    <div className={cn("border-r border-[var(--border)] px-5 py-3.5 last:border-r-0", className)}>
      <div className="flex items-baseline gap-1.5">
        <span
          className={cn(
            "text-xl font-bold tracking-tight",
            tone === "red" ? "text-[var(--red)]" : tone === "amber" ? "text-[var(--amber)]" : "text-[var(--ink)]",
          )}
        >
          {value}
        </span>
        {unit && <span className="text-[11px] text-[var(--faint)]">{unit}</span>}
      </div>
      <div className="mt-1.5 text-[10px] font-medium uppercase tracking-[0.07em] text-[var(--whisper)]">
        {label}
      </div>
      {detail && (
        <div className="mt-0.5 text-[10.5px] text-[var(--faint)]">{detail}</div>
      )}
    </div>
  );
}
```

Note: The old MetricCard accepted `icon` and `badge` props — these are removed. Update call sites when updating each page.

- [ ] **Step 2: Commit**

```bash
git add src/components/metric-card.tsx
git commit -m "feat(ui): rewrite metric card as compact strip cell"
```

## Chunk 3: Dashboard (Triage Console)

### Task 9: Rewrite dashboard page.tsx

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/components/charts/dashboard-charts.tsx`

- [ ] **Step 1: Rewrite src/app/page.tsx**

This is the largest single file change. Replace the current hero + 6 metric cards + announcement + charts + activity layout with the new triage console layout: page bar → 5 metric strip → decision support charts → active queue table.

Reference the approved mockup at `.superpowers/brainstorm/1014-1773182588/triage-console-v6.html` for exact structure.

Key structural changes:
- Remove the hero section with large heading
- Remove the "AI-Assisted Operations" announcement card
- Replace 6 MetricCard grid with a 5-column metrics strip in a white bar
- Replace generic charts with Approval Aging buckets and SLA Risk heatmap
- Replace "Recent Activity" cards with a dense ticket table with SLA, AI recommendation, and status columns
- Add a page bar at top: "Triage Console" + context + action buttons
- Add a footer

The page fetches data from `getMetrics()` and `getTickets()` server functions. Keep the same data fetching, just restructure the rendering.

- [ ] **Step 2: Rewrite dashboard-charts.tsx**

Replace the Recharts Area/Pie/Bar charts with the new decision-support visualizations:
- Approval Aging: 4 buckets (>72h, 24-72h, 4-24h, <4h) with colored backgrounds
- SLA Risk Heatmap: CSS grid of queue × severity tier with colored cells

These can be pure server components — no need for Recharts for these simple visualizations.

If the throughput bar chart is kept on a secondary view, update its colors to use `var(--ink)` and `var(--border)` instead of indigo/purple.

- [ ] **Step 3: Run build and verify**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 4: Commit**

```bash
git add src/app/page.tsx src/components/charts/dashboard-charts.tsx
git commit -m "feat(ui): rewrite dashboard as triage console with SLA and AI columns"
```

## Chunk 4: Ticket Pages

### Task 10: Rewrite ticket workbench and list

**Files:**
- Modify: `src/components/tickets/ticket-workbench.tsx`
- Modify: `src/components/tickets/ticket-list.tsx`

- [ ] **Step 1: Update ticket-workbench.tsx**

Replace dark theme classes with light theme equivalents. Keep the 2-column layout (queue list + detail panel) but update all color references:
- Background: remove dark backgrounds, use `var(--background)` and `var(--card)`
- Text: replace `#f1f1f4` → `var(--ink)`, `#8b8ba0` → `var(--muted)`, `#5f5f78` → `var(--faint)`
- Borders: replace `border-white/X` → `border-[var(--border)]`
- Accent: replace indigo references → `var(--ink)` or functional colors

- [ ] **Step 2: Update ticket-list.tsx**

Replace all dark theme color classes:
- Selected state: replace `bg-indigo-500/10 ring-indigo-400/20` → light blue tint or subtle border
- Hover: replace `bg-white/5` → `hover:bg-[#fafaf7]`
- Text colors: map to new variable system

- [ ] **Step 3: Commit**

```bash
git add src/components/tickets/ticket-workbench.tsx src/components/tickets/ticket-list.tsx
git commit -m "feat(ui): update ticket workbench and list for light theme"
```

### Task 11: Rewrite ticket-detail-panel.tsx

**Files:**
- Modify: `src/components/tickets/ticket-detail-panel.tsx`

- [ ] **Step 1: Replace all dark theme classes**

This is the largest component (391 lines). Systematically replace:
- All `bg-[#1e1e2a]`, `bg-[#262635]` → `bg-[var(--card)]` or remove
- All `text-[#f1f1f4]` → `text-[var(--ink)]`
- All `text-[#8b8ba0]` → `text-[var(--muted)]`
- All `text-[#5f5f78]` → `text-[var(--faint)]`
- All `border-white/X` → `border-[var(--border)]`
- All `bg-indigo-*` → appropriate light theme equivalent
- All `text-[#818cf8]` → `text-[var(--ink)]` or `text-[var(--muted)]`
- Update the triage engine section, SLA display, audit trail

- [ ] **Step 2: Commit**

```bash
git add src/components/tickets/ticket-detail-panel.tsx
git commit -m "feat(ui): update ticket detail panel for light theme"
```

### Task 12: Update ticket forms

**Files:**
- Modify: `src/components/tickets/ticket-intake-form.tsx`
- Modify: `src/components/tickets/customer-update-review-form.tsx`
- Modify: `src/components/tickets/approval-request-form.tsx`
- Modify: `src/app/tickets/new/page.tsx`

- [ ] **Step 1: Update form input styles across all ticket form components**

Replace dark form input classes:
- `bg-[#262635]` → `bg-[var(--card)]`
- `border-white/10` → `border-[var(--border)]`
- `text-[#f1f1f4]` → `text-[var(--ink)]`
- `text-[#8b8ba0]` → `text-[var(--muted)]`
- Focus rings: `focus:ring-indigo-500/50` → `focus:ring-[var(--ink)]/20`

- [ ] **Step 2: Update tickets/new/page.tsx**

Replace the light-on-dark badge section and workflow lifecycle sidebar colors.

- [ ] **Step 3: Commit**

```bash
git add src/components/tickets/ticket-intake-form.tsx src/components/tickets/customer-update-review-form.tsx src/components/tickets/approval-request-form.tsx src/app/tickets/new/page.tsx
git commit -m "feat(ui): update ticket forms for light theme"
```

## Chunk 5: Approvals, Automation, Utility Pages

### Task 13: Rewrite approvals/page.tsx

**Files:**
- Modify: `src/app/approvals/page.tsx`
- Modify: `src/components/approvals/approval-decision-form.tsx`

- [ ] **Step 1: Replace all dark theme classes in approvals page**

Same systematic replacement as ticket pages:
- Replace dark backgrounds, indigo accents, white/opacity borders
- Update the pending approvals and decision history sections
- Replace stat cards with compact metric strip style

- [ ] **Step 2: Update approval-decision-form.tsx**

Update form container and input styles to light theme.

- [ ] **Step 3: Commit**

```bash
git add src/app/approvals/page.tsx src/components/approvals/approval-decision-form.tsx
git commit -m "feat(ui): update approvals page for light theme"
```

### Task 14: Rewrite automation-opportunities/page.tsx

**Files:**
- Modify: `src/app/automation-opportunities/page.tsx`

- [ ] **Step 1: Replace all dark theme classes**

Same systematic color replacement. Update the opportunity matrix to use the new table/grid style with functional colors for fit scores and risk levels.

- [ ] **Step 2: Commit**

```bash
git add src/app/automation-opportunities/page.tsx
git commit -m "feat(ui): update automation review page for light theme"
```

### Task 15: Update utility pages

**Files:**
- Modify: `src/app/loading.tsx`
- Modify: `src/app/error.tsx`
- Modify: `src/app/not-found.tsx`

- [ ] **Step 1: Update loading.tsx**

Replace dark skeleton colors with light theme:

```tsx
export default function Loading() {
  return (
    <div className="animate-pulse space-y-4 p-8">
      <div className="h-10 w-48 rounded-[5px] bg-[var(--border)]" />
      <div className="grid grid-cols-5 gap-px border border-[var(--border)] rounded-[6px] overflow-hidden bg-[var(--border)]">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-[var(--card)] p-4">
            <div className="h-6 w-16 rounded bg-[var(--border-light)]" />
            <div className="mt-2 h-3 w-24 rounded bg-[var(--border-light)]" />
          </div>
        ))}
      </div>
      <div className="h-64 rounded-[6px] bg-[var(--card)] border border-[var(--border)]" />
    </div>
  );
}
```

- [ ] **Step 2: Update error.tsx and not-found.tsx**

These already use light colors. Just ensure they use the new CSS variables and border radius (6px not 3xl). Replace any `slate-*` Tailwind classes with explicit variable references for consistency.

- [ ] **Step 3: Commit**

```bash
git add src/app/loading.tsx src/app/error.tsx src/app/not-found.tsx
git commit -m "feat(ui): update utility pages for light theme"
```

## Chunk 6: Testing and Verification

### Task 16: Run full test suite

- [ ] **Step 1: Run unit tests**

Run: `npx vitest run`
Expected: All tests pass. UI changes shouldn't break logic tests. Fix any that reference removed component props (like MetricCard `icon`/`badge`, Button `variant="ghost"`).

- [ ] **Step 2: Run E2E tests**

Run: `npx playwright test`
Expected: Tests pass. If any tests assert on specific text like "MSP Automation Portfolio" or "Human-in-the-loop enabled" that was removed, update the assertions.

- [ ] **Step 3: Run build**

Run: `npm run build`
Expected: Clean build with no errors.

- [ ] **Step 4: Commit any test fixes**

```bash
git add -A
git commit -m "fix: update tests for new UI component signatures"
```

### Task 17: Visual verification and screenshots

- [ ] **Step 1: Start dev server and visually verify all 5 pages**

Run: `npm run dev`

Check each page:
1. `/` — Triage Console
2. `/tickets` — Queue Workbench
3. `/tickets/new` — Ticket Intake
4. `/approvals` — Approval Gate
5. `/automation-opportunities` — Automation Review

Verify: light background, Inter font, no dark theme remnants, functional colors working, sidebar navigation correct.

- [ ] **Step 2: Take new screenshots**

Replace files in `docs/screenshots/`:
- `dashboard.png` (triage console)
- `tickets-workbench.png`
- `approvals-center.png`
- `automation-opportunities.png`

- [ ] **Step 3: Commit screenshots**

```bash
git add docs/screenshots/
git commit -m "docs: update screenshots for new UI"
```
