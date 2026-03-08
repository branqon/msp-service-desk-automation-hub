# Dark Theme Redesign

Linear-inspired dark theme replacing the current icy-blue/teal light theme with a warm charcoal palette, indigo accent, and desaturated badges.

## Design Decisions

- **Direction**: Dark sidebar + warm charcoal content area (Linear/Vercel style)
- **Accent**: Violet/indigo replacing teal
- **Badges**: Desaturated with muted tinted backgrounds for dark surfaces
- **Scope**: Full component reskin (Approach 2) — every file updated for consistency, no theme system

## Color Palette

| Role | Old | New |
|------|-----|-----|
| Page background | `#eef4f7` | `#13131a` |
| Card surface | `white/95` | `#1e1e2a` |
| Inner surface | `slate-50` | `#262635` |
| Card border | `slate-200` | `rgba(255,255,255,0.08)` |
| Inner border | `slate-200` | `rgba(255,255,255,0.06)` |
| Sidebar background | white on teal gradient | `#0f0f18` |
| Sidebar card | white/75 | `#1a1a26` |
| Header | white/70 blur | `#13131a/80` blur |
| Primary accent | `#0f766e` (teal) | `#818cf8` (indigo-400) |
| Accent hover | `#115e59` | `#6366f1` (indigo-500) |
| Primary text | `slate-950` | `#f1f1f4` |
| Secondary text | `slate-600` | `#8b8ba0` |
| Tertiary text | `slate-500` | `#5f5f78` |
| Selection | teal/16% | indigo/20% |

## Component Changes

### App Shell & Sidebar
- Sidebar: solid `#0f0f18`, sidebar card `#1a1a26` with `white/8` border
- Active nav: `indigo-500/15` bg, `indigo-400/30` border, bright white text
- Inactive nav: `white/5` hover, muted text
- Header: `#13131a/80` backdrop blur, `white/6` bottom border
- "Human-in-the-loop" pill: indigo tint

### Section Cards
- Background `#1e1e2a`, border `white/8`, dark shadow
- Title `#f1f1f4`, description `#8b8ba0`
- Divider `white/6`

### Inner Cards
- Background `#262635`, border `white/6`
- Final Route triage card: `indigo-500/10` bg, `indigo-400/20` border

### Badges (desaturated)
- slate: `white/8` bg, `white/6` border, `#9d9db5` text
- blue: `sky-900/30` bg, `sky-700/20` border, `sky-300` text
- amber: `amber-900/30` bg, `amber-700/20` border, `amber-300` text
- red: `rose-900/30` bg, `rose-700/20` border, `rose-300` text
- emerald: `emerald-900/30` bg, `emerald-700/20` border, `emerald-300` text
- teal: `indigo-900/30` bg, `indigo-500/20` border, `indigo-300` text

### Buttons
- Primary: `#818cf8` bg, white text, hover `#6366f1`
- Secondary: `white/8` border, `#f1f1f4` text, hover `white/12`
- Focus ring: `indigo-500/50`

### Metric Cards
- Icon container: `#262635` bg, `white/6` border
- Value: `#f1f1f4`, label: `#5f5f78`

### Forms & Inputs
- Surface `#262635`, border `white/8`, placeholder `#5f5f78`, focus ring indigo

### Charts (Recharts)
- Grid lines `white/6`, tick text `#8b8ba0`
- Chart colors shift to indigo/violet tones

### Empty States
- Dashed border `white/10`, muted text

## Fonts
No change. IBM Plex Sans, IBM Plex Mono, Sora display all work well on dark.

## Files to Touch
- `globals.css`
- `app-shell.tsx`
- `sidebar-nav.tsx`
- `ui/badge.tsx`
- `ui/button.tsx`
- `ui/section-card.tsx`
- `ui/empty-state.tsx`
- `metric-card.tsx`
- `app/page.tsx` (dashboard)
- `app/approvals/page.tsx`
- `app/automation-opportunities/page.tsx`
- `app/tickets/new/page.tsx`
- `tickets/ticket-workbench.tsx`
- `tickets/ticket-detail-panel.tsx`
- `tickets/ticket-list.tsx`
- `tickets/approval-request-form.tsx`
- `tickets/customer-update-review-form.tsx`
- Any chart components
