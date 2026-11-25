# Cru-VSU Design System & Visual Specification (`DESIGN.md`)

This document defines the visual identity, layout architecture, and interactive UI patterns for the **Cru at Visayas State University (Cru-VSU)** web platform.

The design blends **Poulo.site's** clean architectural minimalism, liquid glassmorphism navigation, and left-side dock-wave progress rail with **Cru's** signature **Golden Yellow and Crisp White** brand palette—anchored around an **Obsidian-style Discipleship Family Tree** with Jesus Christ at the center.

---

## 1. Brand Color Palette

Cru's primary visual identity focuses on radiant **Cru Gold** paired with **Crisp Pure White** and soft neutral surfaces for high readability and warmth.

| Token | Hex / Value | Usage |
| :--- | :--- | :--- |
| **Cru Gold** (`--color-cru-gold`) | `#FDB913` | Primary CTAs, active progress ticks, junction dots, Jesus root node, brand emblem |
| **Cru Gold Hover** (`--color-cru-gold-hover`) | `#EAA400` | Hover states, active icons, section eyebrows, Staff (Gen 1) graph nodes |
| **Cru Gold Soft** (`--color-cru-gold-soft`) | `#FEF6DC` | Highlight badges, life verse callouts, gentle hover fills |
| **Pure White** | `#FFFFFF` | Primary page canvas, elevated active nav pills, modal/input backgrounds |
| **Soft Surface** (`--color-cru-surface`) | `#FAFAFA` | Content cards, form containers, graph light canvas |
| **Deep Charcoal** (`--color-cru-charcoal`) | `#171717` | Primary headings, body text, high-contrast button labels |
| **Muted Slate** (`--color-cru-muted`) | `#737373` | Secondary copy, monospace labels, inactive tabs |
| **Hairline Border** (`--color-cru-border`) | `rgba(23, 23, 23, 0.07)` | Drafting grid rails, card outlines, section dividers |

### Generational Graph Palette
To visualize spiritual multiplication ("mom/dad" lineage) across campus generations:
- **Center Root (Jesus Christ, Gen 0):** `#FDB913` (Radiant Cru Gold with glowing halo)
- **Gen 1 (Campus Staff / Pioneers):** `#D97706` (Deep Amber Gold)
- **Gen 2 (Student Disciplers):** `#0D9488` (Teal)
- **Gen 3 (Disciples):** `#4F46E5` (Indigo)
- **Gen 4+ (New Generations):** `#059669` (Emerald)

---

## 2. Typography

- **Primary Sans (`--font-sans`)**: `"Inter", "Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif`
  - Hero Headline: `text-4xl md:text-6xl font-semibold tracking-tight leading-[1.08]`
  - Section Heading (`h2`): `text-2xl md:text-[32px] font-medium tracking-tight md:leading-[42px]`
  - Body Copy: `text-sm` to `text-lg`, `leading-relaxed`
- **Monospace (`--font-mono`)**: `"IBM Plex Mono", ui-monospace, SFMono-Regular, monospace`
  - Used for section indices (`01 · Spiritual Family Tree`), category badges, schedule metadata, role tags, and tabular counts (`tabular-nums`).

---

## 3. Core UI Patterns (Poulo.site Inspiration)

### 3.1. Floating Liquid Glassmorphism Navbar (`top-6`)
- **Placement:** Fixed centered floating capsule (`fixed inset-x-0 top-6 z-50`), keeping the page airy and unobstructed.
- **Glass Surface (`.glass-nav`):**
  - Translucent white (`rgba(255, 255, 255, 0.72)`) with `backdrop-filter: blur(28px) saturate(200%)`.
  - Crisp `1px` bright border (`rgba(255, 255, 255, 0.85)`).
  - Dual specular inset highlights (`inset 0 1px 0 rgba(255, 255, 255, 0.9)` + `inset 0 -1px 0 rgba(255, 255, 255, 0.18)`) and a soft ambient drop shadow (`0 10px 35px -10px rgba(0, 0, 0, 0.12)`).
- **Active Pill:** Elevated pure white pill (`bg-white shadow-sm`) with a `#FDB913` indicator dot.
- **Primary Split-Badge CTA ("Join Cru"):** Solid Cru Gold pill (`bg-[#FDB913] hover:bg-[#EAA400]`) containing an inset circular white icon badge on the left and bold charcoal label on the right.
- **Detached Portal Trigger:** Top-right circular glass button (`size-[52px] rounded-full`) for Member Login / Dashboard access.

### 3.2. Left-Side Vertical Dock-Wave Progress Rail (`>= 1360px`)
- **Placement:** Fixed at `left-3 top-1/2 -translate-y-1/2` on wide desktop viewports (`min-[1360px]:flex`).
- **Geometry:** A vertical stack of horizontal hairline ticks (`h-0.5 w-12 origin-left`) spaced in `24px` rows—no continuous vertical track or bulky dots.
- **Dock-Wave Scaling:** Proximity-based `scaleX` falloff centered on the active (or hovered) section:
  - Active / Hovered tick (`distance = 0`): `scaleX(1.0)` — colored in **Cru Gold (`#EAA400`)** when active.
  - Immediate neighbors (`distance = 1`): `scaleX(0.68)`
  - Next step out (`distance = 2`): `scaleX(0.44)`
  - Distant ticks (`distance >= 3`): `scaleX(0.25)`
- **Hover Interaction:** Hovering shifts the wave center dynamically to the hovered tick and reveals a floating frosted pill label (e.g., *Overview*, *Discipleship Tree*, *Ministry Projects*, *Join Cru*) with smooth scroll navigation on click.

### 3.3. Architectural Drafting Grid & Cards
- **Column Framing:** Content sits inside a centered `max-w-[1200px]` column bordered by subtle hairline side rails (`border-x border-neutral-900/[0.06]`).
- **Section Dividers:** `1px` horizontal hairlines accented at left and right rail intersections by `size-5` white circular masks containing a `size-1` **Cru Gold** junction dot.
- **Cards:** Generous `rounded-[24px]` (and `rounded-[28px]` for hero/modal containers) on `#FAFAFA` with `1px` `rgba(23, 23, 23, 0.07)` borders and warm `#FDB913` hover borders.
- **Segmented Pill Controls:** Rounded track (`rounded-full bg-neutral-900/[0.04] p-1`) with an elevated white active pill and monospace item counts.

---

## 4. Obsidian-Style Discipleship Graph Aesthetic

- **Canvas:** Interactive 2D force-directed network (`react-force-graph-2d`) over a subtle `24px` dot-grid background, with a **Light / Obsidian Dark Canvas** toggle.
- **Jesus Root Node:** Pinned at origin `(0, 0)` with a larger radius, radiant golden aura (`rgba(253, 185, 19, 0.26)`), white border ring, and cross emblem (`✝`).
- **Living Flow:** Directional golden particles (`#FDB913`) travel along edges from discipler ("spiritual mom/dad") to disciple, visualizing 2 Timothy 2:2 multiplication.
- **Lineage Focus:** Hovering or clicking any node highlights its entire single-parent ancestry chain back to Jesus while gently dimming unrelated branches (`opacity: 0.2`), and opens the frosted **Member Profile Drawer** on the right.
