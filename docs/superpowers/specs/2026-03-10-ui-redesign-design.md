# UI Redesign: Editorial Product Design

## Problem

The current UI uses a dark theme with purple/indigo accents, rounded glowing cards, and decorative spacing that reads as "AI-generated dashboard." For a portfolio piece, the design needs to demonstrate product thinking and domain knowledge, not just visual polish.

## Design Direction

**Light, editorial, product-first.** The interface should feel like a real operator tool built by someone who understands MSP service desk workflows. Less Dribbble shot, more shipped internal product.

### Core Principles

1. **Product thesis over aesthetics** — every screen has a job, every metric supports a decision
2. **Domain truth** — use real MSP terminology, show operational edge cases, surface AI confidence honestly
3. **The table is the product** — the queue/ticket table is the strongest proof of product thinking; make it dominant
4. **Restrained typography** — single sans-serif typeface (Inter), no decorative serif
5. **Functional color only** — red/amber/green for system states, no accent color for decoration

## Visual Language

### Color Palette

```
Background (surface):  #f1f0ec (warm light gray)
Cards:                 #fff
Borders:               #dfdcd5 (warm border), #eae8e2 (light border)
Sidebar:               #0e0e0e (near-black)

Text hierarchy:
  --ink:       #141414 (primary)
  --ink-80:    #2a2a2a
  --ink-60:    #4d4d4d
  --muted:     #717171
  --faint:     #999
  --whisper:   #bbb

Functional:
  --red:       #c5303e  (SLA breach, escalation, low confidence)
  --red-bg:    #fcedef
  --amber:     #b36b00  (at-risk, pending, reduced confidence)
  --amber-bg:  #fef5e7
  --green:     #177a48  (on-track, resolved, high confidence)
  --green-bg:  #ecf5f0

Brand (minimal):
  --brand-mark: #7d6f52 (sidebar active indicator, env dot only)
```

### Typography

- **Single typeface:** Inter (with OpenType features cv01, cv02, ss01)
- **No serif anywhere** — serif was removed after iteration; it signaled "designed for the shot"
- Page title: 13px, weight 600
- Section labels: 10.5px, weight 600, uppercase, letter-spacing 0.07em
- Table body: 12.5px subject, 11px secondary, 10.5px tertiary
- Monospace for ticket numbers: ui-monospace / SF Mono

### Layout Structure

- **Sidebar:** 208px fixed, near-black (#0e0e0e)
  - Wordmark: 11.5px, weight 500, low opacity (0.55) — deliberately understated
  - "Portfolio Project" label beneath
  - Section divider: "Operations" in 9px uppercase
  - Nav items: 12px, subtle active state with 2px brand-mark left border
  - Footer: env dot + "Local demo - demo data"
- **Page bar:** Thin toolbar (14px vertical padding). Title + inline context + action buttons
- **Metrics strip:** Full-width, 5 columns separated by 1px borders. Numbers at 20px weight 700
- **Content area:** 40px horizontal padding, 20px top padding

### Navigation Labels

Changed to operational language:
- Dashboard → **Triage Console**
- Tickets → **Queue Workbench** (with count badge)
- Intake → **Ticket Intake**
- Approvals → **Approval Gate** (with amber warning count)
- Automation Opportunities → **Automation Review**

## Page Designs

### Triage Console (Dashboard)

**Page bar:** "Triage Console" + "15 open tickets across 4 queues - last ticket received 22m ago"

**KPI metrics (5 columns):**
- Auto-triaged (12 of 15) — shows automation coverage
- Approvals blocked (2, amber) — oldest waiting 5 days
- SLA at risk (3, red) — 2 breached, 1 under 1h
- Time saved this week (5.8 hrs) — vs. manual triage
- Manual overrides (1) — AI suggestion rejected by ops lead

**Decision support (2 cards):**
- Approval aging buckets (>72h red, 24-72h amber, 4-24h, <4h)
- SLA risk heatmap — grid of queue x severity tier (P1-P2, P3, P4) + breach column

**Active queue table (the star):**
Columns: #, Subject, Queue, SLA, AI Recommendation, Status

Each row includes:
- Ticket number (monospace), subject (13px bold), submitter/org/date, operational activity note
- Activity notes show real operational noise: "Site contact unreachable since 9:14 AM", "Requester replied 14m ago", "Rule conflict: geo-flag vs. known device", "Escalated after failed automation run"
- SLA countdown with color coding and priority target
- AI recommendation: action (bold) + reasoning + confidence as text label + flags for edge cases
- Status badges: Open (green), Waiting (amber), Escalated (red), Override (purple), Resolved (gray)

Row states:
- SLA breach rows get red-tinted background + red left border
- Hover: subtle warm tint + blue left border
- Low-confidence AI shows amber/red text warnings: "Missing asset tag — confidence reduced", "Low confidence — manual triage recommended", "Automation failed — requires manual provisioning"

### Queue Workbench (Tickets)

Apply same table-dominant layout. Two-column: queue list (left) + ticket detail panel (right). Same operational activity notes, SLA tracking, and AI recommendation display.

### Ticket Intake

Clean form with the same neutral palette. Dark input borders on white, functional validation states. Sidebar panel showing automation lifecycle context.

### Approval Gate

Compact approval aging at top. Pending approvals as cards with ticket context, AI recommendation, and decision form. Decision history table below.

### Automation Review

Opportunity matrix using the same grid/table patterns. Focus on: fit score, estimated time saved, current volume, guardrail requirements. Less decorative, more decision-support.

## Component Changes

### Buttons
- Primary: #141414 bg, white text, 6px rounded
- Outline: 1px border, transparent bg
- No ghost variant needed

### Badges/Tags
- Status badges: colored bg + text (green/amber/red/purple/gray)
- Priority: uppercase, 9px, 3px rounded
- Critical: black bg, white text (not red — more confident)
- Medium: warm pale bg, amber text
- Low: neutral bg, gray text

### Cards (Section Cards)
- 1px border (#dfdcd5), 6px rounded, white bg
- No shadows, no blur, no glow
- Tight padding (16-20px)

### Charts
- Replace decorative charts with decision-support visualizations
- Stacked bars for routing breakdown
- Grid/heatmap for SLA risk
- Aging buckets for approval bottlenecks
- All charts use functional colors only (red/amber/green/gray)

## What Gets Removed

- Dark theme entirely (background, card tones, glow effects)
- Purple/indigo accent color
- Serif typography (DM Serif Display, Sora)
- IBM Plex Sans / IBM Plex Mono
- Decorative donut chart
- Hero sections with large headings
- "AI-Assisted Operations" badge in header
- "Human-in-the-Loop Enabled" badge
- Generic metrics ("Tickets Processed", "Auto-Triage Rate")
- Wide letter-spacing uppercase decorative labels
- Large rounded corners (2xl, 3xl) — replaced with 6px

## Reference Mockup

The approved mockup is at:
`.superpowers/brainstorm/1014-1773182588/triage-console-v6.html`

Open locally with any HTTP server to view the full design.
