# STAR AML System — Professional Light Theme UI/UX Redesign

## Background

The current STAR AML dashboard uses a dark "cyber" aesthetic (deep navy backgrounds, cyan neon glows, glassomorphism, scanlines, pulsing neon effects) better suited for a sci-fi product demo than a professional compliance workstation. Compliance officers, MLROs (Money Laundering Reporting Officers), and financial analysts spend full workdays inside this interface — the current dark neon design causes eye strain, lacks the visual trust signals expected in financial software, and makes data hierarchy difficult to parse at a glance.

This plan redesigns the entire dashboard shell (theme, layout, navigation, typography, cards, and component system) to a **professional light theme** inspired by industry AML platforms like Refinitiv World-Check, Actimize SAM, and NICE Actimize — prioritising clarity, data density, and workflow efficiency over visual spectacle.

---

## Design Principles Applied

- **Office Suite Palette**: Blue-grey navigation, white card surfaces, off-white background — the same visual language as Bloomberg Terminal (light), Salesforce, and enterprise ERP systems.
- **Semantic Color-Only for Risk**: Color is reserved *exclusively* for risk severity (Critical=Red, High=Amber, Medium=Yellow, Low=Green). Everything else is neutral grey.
- **Information Hierarchy**: Bold, clean typography for KPIs; subdued grey for metadata; strong contrast for actionable items.
- **Hamburger Sidebar Navigation**: Collapsible left rail with smooth slide animation, proper section groups (Monitor / Investigate / Intelligence / Admin).
- **Progressive Disclosure**: Section headers with breadcrumbs, no decorative chrome on the data surface itself.
- **No neon, no glassmorphism, no scanlines, no ambient orbs in the dashboard shell**.

---

## Current State vs Target State

| Aspect | Current (Dark Neon) | Target (Professional Light) |
|---|---|---|
| Background | `#020617` (near-black) | `#F4F6F9` (cool off-white) |
| Sidebar | Dark navy + cyan glows | Deep slate `#1E2A3A` + white text |
| Cards | Glassmorphism (blur+transparency) | White cards with `1px #E2E8F0` border + subtle shadow |
| Primary accent | Cyan `#00F5FF` (neon) | Institutional blue `#1A56DB` (trust blue) |
| Typography | Terminal mono, flicker effects | Inter 400/500/600, clean hierarchy |
| Animations | Constant glow pulses, flickers, orbs | Subtle enter-transitions only (fade-up 200ms) |
| Navigation label | "Command Center", "TGNN Demo" | "Overview", "Alert Queue", "Entity Search" |
| Sidebar state | Expand/Collapse ONLY | Hamburger toggle + grouped sections with labels |

---

## Proposed Changes

### 1. Design Token System — `globals.css`

#### [MODIFY] [globals.css](file:///d:/STAR/apps/web/src/app/globals.css)

Complete rewrite of CSS variables to a professional light-theme token system:

**New tokens:**
- `--color-bg-page: #F4F6F9` — page background
- `--color-bg-card: #FFFFFF` — card/panel surface
- `--color-bg-sidebar: #1E2A3A` — sidebar rail (dark navy anchor)
- `--color-sidebar-active: #2D3F55` — active nav item bg
- `--color-primary: #1A56DB` — primary brand/action blue
- `--color-primary-hover: #1648C4`
- `--color-border: #E2E8F0` — card and divider borders
- `--color-border-strong: #CBD5E1`
- `--color-text-heading: #0F172A` — section titles
- `--color-text-body: #334155` — body text
- `--color-text-muted: #64748B` — metadata, labels
- `--color-text-sidebar: #94A3B8` — sidebar icons/labels
- `--color-text-sidebar-active: #FFFFFF`
- Risk: `--color-risk-critical: #DC2626`, `--color-risk-high: #D97706`, `--color-risk-medium: #CA8A04`, `--color-risk-low: #16A34A`
- Status: `--color-status-online: #16A34A`, `--color-status-degraded: #D97706`, `--color-status-offline: #DC2626`

**Remove/replace:**
- All `glass`, `glass-strong`, `glass-card`, `glass-cyber` utility classes → replace with `.surface-card` (white, border, shadow)
- All `glow-*`, `text-glow-*`, neon animation classes
- `ambient-orb-*`, `grid-pattern`, `scanline`, `noise-bg`
- Keep only functional animations: `fade-up`, `slide-in-left`, `counter-up`

**New utility classes:**
- `.surface-card` — white bg, border, subtle elevation shadow
- `.surface-header` — section header background
- `.risk-pill-critical/high/medium/low` — solid color risk badges (no glow)
- `.status-dot` — small colored dot for system status

---

### 2. Root Layout — `layout.tsx`

#### [MODIFY] [layout.tsx](file:///d:/STAR/apps/web/src/app/layout.tsx)

- Remove `className="dark"` from `<html>` tag → light theme
- Remove `noise-bg` from body class
- Add `font-sans` body class
- Update `themeColor` viewport to `#1E2A3A` (sidebar color)
- Add Inter font weights 300-800 (already present, keep)
- Remove Syne (display font — too stylized for office suite)

---

### 3. App Shell Layout — `(app)/layout.tsx`

#### [MODIFY] [(app)/layout.tsx](file:///d:/STAR/apps/web/src/app/(app)/layout.tsx)

- Change outer `div` from `bg-[#020617] text-white` → `bg-[#F4F6F9] text-[#0F172A]`
- Layout structure: `flex h-screen` (no scroll on shell) — sidebar fixed, content scrolls

---

### 4. Sidebar — `Sidebar.tsx`

#### [MODIFY] [Sidebar.tsx](file:///d:/STAR/apps/web/src/components/Sidebar.tsx)

**Complete redesign. Key changes:**

**Hamburger Toggle:**
- Add hamburger icon button at top of sidebar (3 horizontal lines → X animation)
- Toggle animates sidebar width: `240px` expanded / `64px` collapsed (icon-only)
- Smooth CSS transition via framer-motion `animate={{ width }}`

**Visual Design:**
- Background: `#1E2A3A` (deep slate-navy — professional, not black)
- Sidebar top: Logo mark + "STAR AML" text in white
- Hamburger button: top-right of sidebar header
- Bottom: user profile pill

**Navigation Groups (new structure):**
```
─── MONITOR
    Overview (was: Command Center)
    Alert Queue (was: Alert Center)
    Realtime Feed (was: Realtime Stream)

─── INVESTIGATE
    Entity Search (was: Risk Engine)
    Investigations
    Communities

─── INTELLIGENCE
    Analytics (was: Temporal Analytics)
    Graph Network (was: TGNN Demo)
    AI Copilot

─── SYSTEM
    Settings
```

**Active state:** Light blue-tinted row `#2D3F55`, left accent bar `#1A56DB`, icon/text white.
**Inactive state:** Icon `#64748B`, text `#94A3B8`, hover bg `#243447`.
**No neon dots, no glow shadows.**

---

### 5. Top Navigation Bar — `TopNav.tsx`

#### [MODIFY] [TopNav.tsx](file:///d:/STAR/apps/web/src/components/TopNav.tsx)

**Visual Design:**
- Background: `#FFFFFF` with `1px solid #E2E8F0` bottom border
- Height: 56px (standard office suite)
- Remove `backdrop-blur`, glassmorphism

**Content:**
- Left: Breadcrumb (e.g., "Monitor / Alert Queue") 
- Center: Global search input (clean `border border-[#CBD5E1] rounded-md bg-[#F8FAFC]`)
- Right: System status indicators → compact text badges (not neon pills)
- Notifications bell: clean icon, badge count
- User profile: Avatar initial + name dropdown (no neon border)

**Remove:** ML pipeline status display from TopNav (too technical, move to Settings/System page)

---

### 6. Core UI Components

#### [MODIFY] [GlassCard.tsx](file:///d:/STAR/apps/web/src/components/ui/GlassCard.tsx)

Rename conceptually to `SurfaceCard`. Replace glassmorphism with clean card:
- Background: `#FFFFFF`
- Border: `1px solid #E2E8F0`  
- Border-radius: `8px` (tighter, more enterprise)
- Box-shadow: `0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)`
- Hover: `box-shadow: 0 4px 12px rgba(0,0,0,0.08)` (subtle lift, no glow)
- Remove all `glass`, `glass-strong`, `glass-card`, `glass-cyber` logic
- Keep motion.div, framer-motion wrapper

#### [MODIFY] [MetricCard.tsx](file:///d:/STAR/apps/web/src/components/ui/MetricCard.tsx)

Complete redesign:
- White card with left colored accent border (4px solid, color matches metric type)
- Icon in colored background square (no glow)
- Label: `text-xs text-[#64748B] font-medium uppercase tracking-wide`
- Value: `text-3xl font-bold text-[#0F172A]` (dark, high contrast)
- Trend badge: solid pill (no glow)

#### [MODIFY] [RiskBadge.tsx](file:///d:/STAR/apps/web/src/components/ui/RiskBadge.tsx)

- Replace neon glow-tinted badges with solid professional pills
- Critical: `bg-[#FEE2E2] text-[#DC2626] border border-[#FECACA]`
- High: `bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]`
- Medium: `bg-[#FFF9C4] text-[#CA8A04] border border-[#FEF08A]`
- Low: `bg-[#DCFCE7] text-[#16A34A] border border-[#BBF7D0]`
- Font: `text-xs font-semibold` (no `font-mono`)

#### [MODIFY] [NeonButton.tsx](file:///d:/STAR/apps/web/src/components/ui/NeonButton.tsx)

Rename to `ActionButton`. Remove neon glow variants:
- Primary: `bg-[#1A56DB] text-white hover:bg-[#1648C4]` solid button
- Secondary: `bg-white border border-[#CBD5E1] text-[#334155] hover:bg-[#F8FAFC]`
- Danger: `bg-[#DC2626] text-white hover:bg-[#B91C1C]`

---

### 7. Dashboard Page — `dashboard/page.tsx`

#### [MODIFY] [dashboard/page.tsx](file:///d:/STAR/apps/web/src/app/(app)/dashboard/page.tsx)

**Page Header:**
- Title: "Overview" (not "Command Center") — `text-2xl font-semibold text-[#0F172A]`
- Subtitle: "AML Monitoring Dashboard — updated just now"
- Right: Date range selector + "Export Report" button

**KPI Row (4 cards):**
Keep structure but redesign MetricCards:
- Active Alerts → left border `#DC2626`
- Transactions Analyzed → left border `#1A56DB`
- Graph Nodes → left border `#7C3AED`
- Avg Latency → left border `#16A34A`

**Main Content Grid (new layout):**
```
[ Transaction Volume Chart (60%) ] | [ Risk Vector Radar (40%) ]
[ Alert Queue List (60%)          ] | [ System Health Panel (40%) ]
```

**Alert Queue List:**
- Replace dark cards with clean white table rows
- Status column: use proper `RiskBadge` pills
- Remove hover color-change to cyan → use `bg-[#F8FAFC]` row highlight
- Add "View All Alerts →" footer link

**System Health Panel:**
- Clean service status list (no dark background)
- Green/amber/red dots (no glow)
- Uptime percentage as text

**Remove:**
- All `gradient-text`, `text-glow-*` CSS on page headings
- `GlassCard` → replace with new `SurfaceCard` component
- Dark overlay hover effects (`bg-gradient-to-b from-[#00F5FF]/5`)

---

### 8. Alerts Page — `alerts/page.tsx`

#### [MODIFY] [alerts/page.tsx](file:///d:/STAR/apps/web/src/app/(app)/alerts/page.tsx)

**Page Header:**
- "Alert Queue" (not "Alert Center")
- Subtitle with count: "47 active alerts — 12 require immediate action"
- Right: Filter dropdown + Sort + "Bulk Actions" button group

**Table Header:**
- White sticky header row with `border-b border-[#E2E8F0]`
- Column labels: `text-xs font-semibold text-[#64748B] uppercase tracking-wide`
- Background: `#F8FAFC`

**Table Rows:**
- White background, `border-b border-[#F1F5F9]`  
- Hover: `bg-[#F8FAFC]` (no color change)
- Priority indicator: left-side colored bar (`4px` vertical strip)
- Alert type as readable name (no all-caps)
- Status pills using new `RiskBadge` (soft backgrounds)
- "Assign" and "Close" action buttons visible on hover (not hidden)

**Filters Panel:**
- Inline filter bar (not modal) with dropdowns: Severity, Status, Date Range, Assigned To

---

### 9. Chart Components (minor)

#### Charts in `components/charts/`

- `TransactionVolumeChart`: Update colors — baseline `#1A56DB`, anomalous `#DC2626`
- `RiskRadar`: Update fill/stroke to `#1A56DB` / soft blue — no purple neon

---

## What Is NOT Changing

> [!NOTE]
> The following are explicitly out of scope for this UI redesign:
> - Landing page (`(landing)` route) — keep dark sci-fi theme for marketing
> - Backend/API logic, stores, hooks
> - Chart library (recharts), only colors update
> - Page content/data structure (what is shown, not how it looks)
> - Framer Motion animation library (kept, just toned-down transitions)
> - TGNN graph visualization internals

---

## Open Questions

> [!IMPORTANT]
> **Q1: Landing page scope** — Should the landing/marketing page (`(landing)` route) also be converted to light theme, or stay dark? The plan assumes it stays dark (separate brand surface from the application shell).

> [!IMPORTANT]
> **Q2: Sidebar default state** — Should the sidebar default to **expanded** (240px with labels) or **collapsed** (64px icon-only) on first load? Recommendation: expanded.

> [!IMPORTANT]
> **Q3: Logo treatment** — The current logo is a cyan Hexagon icon + "STAR" text. On the dark sidebar this works well. Should we keep the same mark or update to a blue institutional version?

---

## Verification Plan

### Visual Review
1. Run `npm run dev` and open `http://localhost:3000/dashboard`
2. Verify no dark backgrounds on main content area
3. Verify sidebar is dark navy with white text (proper contrast anchor)
4. Verify all cards are white with grey borders (no glassmorphism)
5. Verify KPI metric cards show colored left borders
6. Verify no neon colors in the data surface
7. Open `/alerts` and verify table uses light rows, proper risk pills
8. Test hamburger toggle — sidebar collapses to 64px icons, expands smoothly

### Automated
- No automated visual tests exist; manual review after `npm run dev`

---

## File Change Summary

| File | Change Type |
|------|-------------|
| `src/app/globals.css` | MODIFY — full token system rewrite |
| `src/app/layout.tsx` | MODIFY — remove dark class, update theme color |
| `src/app/(app)/layout.tsx` | MODIFY — update shell background |
| `src/components/Sidebar.tsx` | MODIFY — full redesign with hamburger, groups |
| `src/components/TopNav.tsx` | MODIFY — light theme, breadcrumb, clean search |
| `src/components/ui/GlassCard.tsx` | MODIFY — replace glass with surface card |
| `src/components/ui/MetricCard.tsx` | MODIFY — left-border accent card |
| `src/components/ui/RiskBadge.tsx` | MODIFY — professional soft pills |
| `src/components/ui/NeonButton.tsx` | MODIFY — solid buttons, remove neon |
| `src/app/(app)/dashboard/page.tsx` | MODIFY — layout restructure, light theme |
| `src/app/(app)/alerts/page.tsx` | MODIFY — table redesign, filter bar |
