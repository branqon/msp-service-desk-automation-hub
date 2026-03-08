# Dark Theme Redesign — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the icy-blue/teal light theme with a Linear-inspired dark theme using warm charcoal surfaces, indigo accent, and desaturated badges.

**Architecture:** Pure CSS/Tailwind class swap across all components. No theme system, no CSS variables beyond what exists. Every hardcoded slate/teal/white reference gets replaced with the dark palette. Design doc: `docs/plans/2026-03-07-dark-theme-redesign.md`.

**Tech Stack:** Tailwind CSS 4, Next.js 16, Recharts

---

### Task 1: Foundation — globals.css and layout.tsx

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/app/layout.tsx` (no changes needed, fonts stay)

**Step 1: Update globals.css**

Replace the full file content with:

```css
@import "tailwindcss";

:root {
  --background: #13131a;
  --foreground: #f1f1f4;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-plex-sans);
  --font-mono: var(--font-plex-mono);
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
  font-family: var(--font-sans), sans-serif;
}

.font-display {
  font-family: var(--font-sora), sans-serif;
}

::selection {
  background: rgba(99, 102, 241, 0.2);
}

a {
  color: inherit;
  text-decoration: none;
}
```

**Step 2: Verify the page background changed**

Run: `npm run dev` and check that the page background is near-black.

**Step 3: Commit**

```
git add src/app/globals.css
git commit -m "feat(theme): update CSS foundation to dark palette"
```

---

### Task 2: Core UI primitives — badge, button, section-card, empty-state, form-alert

**Files:**
- Modify: `src/components/ui/badge.tsx`
- Modify: `src/components/ui/button.tsx`
- Modify: `src/components/ui/section-card.tsx`
- Modify: `src/components/ui/empty-state.tsx`
- Modify: `src/components/forms/form-alert.tsx`

**Step 1: Update badge.tsx tone classes**

Replace the `toneClasses` record (lines 6-13):

```tsx
const toneClasses: Record<BadgeTone, string> = {
  slate: "border-white/6 bg-white/8 text-[#9d9db5]",
  blue: "border-sky-700/20 bg-sky-900/30 text-sky-300",
  amber: "border-amber-700/20 bg-amber-900/30 text-amber-300",
  red: "border-rose-700/20 bg-rose-900/30 text-rose-300",
  emerald: "border-emerald-700/20 bg-emerald-900/30 text-emerald-300",
  teal: "border-indigo-500/20 bg-indigo-900/30 text-indigo-300",
};
```

**Step 2: Update button.tsx**

Replace variant classes (lines 17-24):

```tsx
  const variantClass =
    variant === "primary"
      ? "bg-[#818cf8] text-white hover:bg-[#6366f1]"
      : variant === "secondary"
        ? "border border-white/10 bg-white/8 text-[#f1f1f4] hover:border-white/16 hover:bg-white/12"
        : variant === "danger"
          ? "bg-rose-800 text-white hover:bg-rose-900"
          : "text-[#8b8ba0] hover:bg-white/8";
```

Replace focus ring in the `cn()` call (line 29):

```
focus-visible:ring-2 focus-visible:ring-indigo-500/50
```

**Step 3: Update section-card.tsx**

Replace the section className (line 23):

```tsx
"rounded-3xl border border-white/8 bg-[#1e1e2a] p-5 shadow-[0_18px_40px_-28px_rgba(0,0,0,0.7)] backdrop-blur",
```

Replace the divider border class (line 28):

```tsx
"mb-4 flex flex-col gap-3 border-b border-white/6 pb-4 md:flex-row md:items-start md:justify-between"
```

Replace title text color (line 31):

```tsx
<h2 className="text-lg font-semibold tracking-tight text-[#f1f1f4]">
```

Replace description text color (line 36):

```tsx
<p className="max-w-2xl text-sm leading-6 text-[#8b8ba0]">
```

**Step 4: Update empty-state.tsx**

Replace the container className (line 13):

```tsx
<div className="rounded-3xl border border-dashed border-white/10 bg-[#262635]/80 p-10 text-center">
```

Replace heading color (line 14):

```tsx
<h3 className="text-xl font-semibold tracking-tight text-[#f1f1f4]">{title}</h3>
```

Replace description color (line 15):

```tsx
<p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#8b8ba0]">{description}</p>
```

**Step 5: Update form-alert.tsx**

Replace the alert className (line 9):

```tsx
<div className="rounded-2xl border border-rose-700/20 bg-rose-900/30 px-4 py-3 text-sm text-rose-300">
```

**Step 6: Commit**

```
git add src/components/ui/ src/components/forms/
git commit -m "feat(theme): dark mode for badge, button, section-card, empty-state, form-alert"
```

---

### Task 3: App shell — sidebar, header, nav

**Files:**
- Modify: `src/components/app-shell.tsx`
- Modify: `src/components/sidebar-nav.tsx`

**Step 1: Update app-shell.tsx**

Line 7 — page wrapper:
```tsx
<div className="min-h-screen bg-[#13131a] text-[#f1f1f4]">
```

Line 9 — sidebar aside:
```tsx
<aside className="hidden w-[300px] shrink-0 border-r border-white/6 bg-[#0f0f18] p-6 lg:block">
```

Line 10 — sidebar card:
```tsx
<div className="rounded-3xl border border-white/8 bg-[#1a1a26] p-6 shadow-[0_20px_50px_-32px_rgba(0,0,0,0.7)] backdrop-blur">
```

Line 12 — portfolio label:
```tsx
<p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#818cf8]">
```

Line 16 — heading:
```tsx
<h1 className="font-display text-3xl font-semibold tracking-tight text-[#f1f1f4]">
```

Line 19 — description:
```tsx
<p className="mt-2 text-sm leading-6 text-[#8b8ba0]">
```

Line 28 — header:
```tsx
<header className="sticky top-0 z-30 border-b border-white/6 bg-[#13131a]/80 px-5 py-4 backdrop-blur lg:px-8">
```

Line 32 — environment label:
```tsx
<p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#5f5f78]">
```

Line 35 — environment description:
```tsx
<p className="mt-1 text-sm text-[#8b8ba0]">
```

Line 39 — human-in-the-loop pill:
```tsx
<div className="rounded-full border border-indigo-400/20 bg-indigo-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-indigo-300">
```

**Step 2: Update sidebar-nav.tsx**

Line 26 — active nav item:
```tsx
"border-indigo-400/30 bg-indigo-500/15 text-[#f1f1f4]"
```

Line 27 — inactive nav item:
```tsx
"border-transparent text-[#8b8ba0] hover:border-white/6 hover:bg-white/5 hover:text-[#f1f1f4]"
```

Line 31 — caption:
```tsx
<div className="mt-1 text-xs leading-5 text-[#5f5f78]">{item.caption}</div>
```

**Step 3: Commit**

```
git add src/components/app-shell.tsx src/components/sidebar-nav.tsx
git commit -m "feat(theme): dark sidebar, header, and navigation"
```

---

### Task 4: Metric card and charts

**Files:**
- Modify: `src/components/metric-card.tsx`
- Modify: `src/components/charts/dashboard-charts.tsx`

**Step 1: Update metric-card.tsx**

Line 24 — label:
```tsx
<p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5f5f78]">
```

Line 27 — value:
```tsx
<p className="text-3xl font-semibold tracking-tight text-[#f1f1f4]">{value}</p>
```

Line 30 — icon container:
```tsx
<div className="rounded-2xl border border-white/6 bg-[#262635] p-3 text-[#8b8ba0]">
```

Line 35 — detail text:
```tsx
<p className="flex-1 text-sm leading-6 text-[#8b8ba0]">{detail}</p>
```

**Step 2: Update dashboard-charts.tsx**

Line 20 — pie colors:
```tsx
const pieColors = ["#818cf8", "#6366f1", "#a78bfa", "#c084fc", "#5f5f78"];
```

Lines 42-43 — area gradient:
```tsx
<stop offset="5%" stopColor="#818cf8" stopOpacity={0.3} />
<stop offset="95%" stopColor="#818cf8" stopOpacity={0.03} />
```

Line 46 — cartesian grid:
```tsx
<CartesianGrid stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" vertical={false} />
```

Line 53 — area stroke:
```tsx
stroke="#818cf8"
```

Line 101 — bar chart grid:
```tsx
<CartesianGrid stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" horizontal={false} />
```

Line 112 — bar fill:
```tsx
<Bar dataKey="volume" fill="#a78bfa" radius={[0, 8, 8, 0]} />
```

Add tick styling to all XAxis/YAxis components:
```tsx
tick={{ fill: "#8b8ba0" }}
```

Style Tooltip for dark backgrounds — add to each Tooltip:
```tsx
<Tooltip contentStyle={{ backgroundColor: "#1e1e2a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", color: "#f1f1f4" }} />
```

**Step 3: Commit**

```
git add src/components/metric-card.tsx src/components/charts/dashboard-charts.tsx
git commit -m "feat(theme): dark metric cards and chart colors"
```

---

### Task 5: Dashboard page

**Files:**
- Modify: `src/app/page.tsx`

**Step 1: Update all hardcoded colors**

Hero section gradient (around line 36):
- `bg-[radial-gradient(...)]` → `bg-[#1e1e2a]`
- `border-white/70` → `border-white/8`
- `shadow-[...]` → `shadow-[0_20px_60px_-34px_rgba(0,0,0,0.7)]`

All `text-slate-950` → `text-[#f1f1f4]`
All `text-slate-600` → `text-[#8b8ba0]`
All `text-slate-500` → `text-[#5f5f78]`
All `text-slate-700` → `text-[#8b8ba0]`
All `border-slate-200` → `border-white/6`
All `bg-slate-50` → `bg-[#262635]`
All `border-white/80` → `border-white/8`
All `bg-white/80` → `bg-[#1e1e2a]`
All `text-[#0f766e]` → `text-[#818cf8]`
All `bg-[#0f766e]` → `bg-[#818cf8]`

**Step 2: Commit**

```
git add src/app/page.tsx
git commit -m "feat(theme): dark dashboard page"
```

---

### Task 6: Ticket components — workbench, list, detail panel

**Files:**
- Modify: `src/components/tickets/ticket-workbench.tsx`
- Modify: `src/components/tickets/ticket-list.tsx`
- Modify: `src/components/tickets/ticket-detail-panel.tsx`

**Step 1: Update ticket-workbench.tsx**

Line 19 — hero section:
- `border-white/70 bg-white/80` → `border-white/8 bg-[#1e1e2a]`
- `shadow-[...]` → `shadow-[0_18px_50px_-32px_rgba(0,0,0,0.7)]`

Line 22 — `text-[#0f766e]` → `text-[#818cf8]`
Line 26 — `text-slate-950` → `text-[#f1f1f4]`
Line 29 — `text-slate-600` → `text-[#8b8ba0]`

**Step 2: Update ticket-list.tsx**

Line 38 — `divide-slate-100` → `divide-white/6`
Line 46 — `hover:bg-slate-50` → `hover:bg-white/5`
Line 46 — `bg-[#0f766e]/6` → `bg-indigo-500/10`
Line 48 — `ring-[#0f766e]/20` → `ring-indigo-400/20`
Line 54 — `text-slate-500` → `text-[#5f5f78]`
Line 57 — `text-slate-950` → `text-[#f1f1f4]`
Line 60 — `text-slate-600` → `text-[#8b8ba0]`

**Step 3: Update ticket-detail-panel.tsx**

Apply these replacements across the entire file:
- All `text-slate-950` → `text-[#f1f1f4]`
- All `text-slate-900` → `text-[#f1f1f4]`
- All `text-slate-800` → `text-[#e0e0ea]`
- All `text-slate-700` → `text-[#8b8ba0]`
- All `text-slate-600` → `text-[#8b8ba0]`
- All `text-slate-500` → `text-[#5f5f78]`
- All `border-slate-200` → `border-white/6`
- All `border-slate-300` → `border-white/10`
- All `bg-slate-50` → `bg-[#262635]`
- All `bg-white` (card backgrounds) → `bg-[#1e1e2a]`
- Line 150: `border-[#0f766e]/20 bg-[#0f766e]/8` → `border-indigo-400/20 bg-indigo-500/10`
- Line 151: `text-[#0f766e]` → `text-indigo-400`

**Step 4: Commit**

```
git add src/components/tickets/
git commit -m "feat(theme): dark ticket workbench, list, and detail panel"
```

---

### Task 7: Form components

**Files:**
- Modify: `src/components/tickets/ticket-intake-form.tsx`
- Modify: `src/components/tickets/approval-request-form.tsx`
- Modify: `src/components/tickets/customer-update-review-form.tsx`
- Modify: `src/components/approvals/approval-decision-form.tsx`

**Step 1: Apply to all four form files**

All form inputs/selects/textareas:
- `border-slate-300 bg-white text-slate-900` → `border-white/10 bg-[#262635] text-[#f1f1f4]`

All labels:
- `text-slate-700` → `text-[#8b8ba0]`

ticket-intake-form.tsx specifics:
- `border-slate-300 bg-slate-50 text-slate-700` (checkbox area) → `border-white/6 bg-[#262635] text-[#8b8ba0]`
- `border-slate-300` (checkbox) → `border-white/10`
- `border-slate-200 bg-slate-50 text-slate-600` (info box) → `border-white/6 bg-[#262635] text-[#8b8ba0]`
- `border-slate-100` (divider) → `border-white/6`
- `bg-slate-50/70` (lifecycle steps) → `bg-[#262635]/70`
- `bg-[#0f766e] text-white` (step number) → `bg-[#818cf8] text-white`
- `text-slate-900` → `text-[#f1f1f4]`
- `text-slate-600` → `text-[#8b8ba0]`

approval-decision-form.tsx:
- `border-slate-200 bg-slate-50` (container) → `border-white/6 bg-[#262635]`

**Step 2: Commit**

```
git add src/components/tickets/ src/components/approvals/
git commit -m "feat(theme): dark form inputs and approval forms"
```

---

### Task 8: Approvals and automation opportunities pages

**Files:**
- Modify: `src/app/approvals/page.tsx`
- Modify: `src/app/automation-opportunities/page.tsx`

**Step 1: Update approvals/page.tsx**

Hero sections:
- `border-white/70 bg-white/80` → `border-white/8 bg-[#1e1e2a]`
- `shadow-[...]` → `shadow-[0_20px_50px_-34px_rgba(0,0,0,0.7)]`

All text colors:
- `text-slate-950` → `text-[#f1f1f4]`
- `text-slate-600` → `text-[#8b8ba0]`
- `text-slate-500` → `text-[#5f5f78]`
- `text-slate-700` → `text-[#8b8ba0]`

All surfaces:
- `border-slate-200` → `border-white/6`
- `bg-slate-50` → `bg-[#262635]`
- `bg-white` → `bg-[#1e1e2a]`

**Step 2: Update automation-opportunities/page.tsx**

Same pattern as approvals — replace all slate/white references with the dark palette.

**Step 3: Commit**

```
git add src/app/approvals/ src/app/automation-opportunities/
git commit -m "feat(theme): dark approvals and automation opportunities pages"
```

---

### Task 9: Visual verification and screenshot refresh

**Files:**
- Modify: `docs/screenshots/dashboard.png`
- Modify: `docs/screenshots/tickets-workbench.png`
- Modify: `docs/screenshots/approvals-center.png`
- Modify: `docs/screenshots/automation-opportunities.png`
- Modify: `docs/demo.gif`

**Step 1: Start dev server and visually verify every page**

Navigate to each route and screenshot:
- `/` — dashboard
- `/tickets` — ticket list
- `/tickets/{id}` — ticket detail
- `/tickets/new` — intake form
- `/approvals` — approvals center
- `/automation-opportunities` — strategic view

Check for: missed light colors, unreadable text, broken contrast, stale teal references.

**Step 2: Fix any visual issues found**

**Step 3: Recapture all screenshots with Playwright**

Use the existing `scripts/take-screenshots.py` pattern — capture at 2x, 1440x900 viewport.

**Step 4: Regenerate demo GIF**

Capture frames at 2x, downscale with ffmpeg + per-frame palette.

**Step 5: Commit**

```
git add docs/screenshots/ docs/demo.gif
git commit -m "feat(theme): refresh screenshots and demo GIF for dark theme"
```

---

### Task 10: Push to GitHub

**Step 1: Push all commits**

```
git push
```
