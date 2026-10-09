# Design rationale

## Concept: "The Forge"

System-Smiths forges systems. The Home page is one unbroken scroll: a single camera travels through one world, from a cluttered void, down to an anvil, through a build, out over a small city of products, and finally to a "Live" status and a call to action. There are no page cuts, so the visitor feels a process happen: messy reality in, working software out.

Each scroll tick (about 72 across the story, weighted toward the Forge and Build scenes) is a **hammer strike**: a small camera pulse and a burst of cyan sparks. That ties the feel of scrolling to the company name without any sound.

The story is also readable with the 3D removed: every line of overlay copy is real DOM text (max ~15 words), the code and build log are DOM panels, and a static illustrated version exists for reduced-motion, no-WebGL and save-data visitors.

## Palette (derived from the logo)

| Token | Value | Use |
| --- | --- | --- |
| `--color-bg` | `#060B1A` | Page background |
| `--color-surface` | `#0D1730` | Panels and cards |
| `--color-line` | `rgba(255,255,255,.08)` | Borders |
| Brand gradient | `#2DB7DB` to `#2347C5` (135deg) | Glows, headline accents, key shapes |
| Button fill | `#1B78A8` to `#2347C5` | A touch deeper at the cyan end so white text passes AA (4.5:1) |
| `--color-text` / `--color-muted` | `#EAF2FF` / `#8FA3C4` | Body / secondary |
| `--color-royal-text` | `#7391FF` | Royal blue lightened for text on dark (raw royal is under 3:1) |
| `--color-ok` | `#3DDC97` | Reserved for "Build passed" and check marks |

No orange or ember tones anywhere. "Heat" is white-hot cyan (`#D9FBFF`) that cools to cyan then royal blue. Radii, spacing and shadows are tokens in `globals.css` and reused by every component.

## Typography

- **Sora** (display): geometric and confident, close to the wordmark. Large sizes with tight tracking.
- **Inter** (body): neutral and highly legible.
- **JetBrains Mono** (code, kickers, terminal): signals engineering craft.

## Signature shape

The logo's diamond is reused everywhere: loader frame, custom cursor, list bullets, section dividers, the isometric city tile and the timeline markers. Consistency of one shape does more for brand recall than decoration.

## Materials and motion

- Dark brushed metal with blue rim light, glass panels with subtle blur, soft bloom on emissive parts, light film grain.
- Lenis inertia scroll, driven by the GSAP ticker so DOM, camera and spark timing share one clock.
- Eased Catmull-Rom camera path between authored keys; hammer-strike pulses on top.
- Magnetic buttons, section reveals, 3D-tilt cards. All reduce to static for `prefers-reduced-motion`.
- No sound.

## Performance approach

- Everything in 3D is procedural: instanced meshes for clutter, canvas-generated textures, an extruded anvil profile, low-poly buildings, one pooled `Points` object for sparks. There are no model files, so the 3D payload is effectively just code.
- Quality tiers (0/1/2) from device hints (pointer type, width, memory), adjusted live by drei `PerformanceMonitor`. Pixel ratio capped (1.25 / 1.5 / 2). No post-processing on tier 0 (mobile).
- Canvas pauses (`frameloop="never"`) when the story is off-screen; the 3D chunk is loaded with `dynamic(..., { ssr: false })` so page text renders first.

## Accessibility

- Semantic headings (the story has an `h1` and one `h2` per scene), a skip link, visible focus rings, keyboard-reachable rail navigation and a "Simplified view" switch.
- The 3D canvas is `aria-hidden`; an `sr-only` ordered list carries the whole story for screen readers and crawlers.
- Contrast is checked against tokens; form errors are linked with `aria-describedby`; the honeypot is hidden from assistive tech.

---

# Scene components and scroll ranges

Total scroll length is `STORY_VH = 900` (vh). `progress` is 0 to 1 over the sticky Home story section. Ranges live in `src/story/ranges.ts`.

| Scene | Range | 3D component | DOM overlay | Copy |
| --- | --- | --- | --- | --- |
| 0 Loader | before load | none (`layout/Loader.tsx`) | spark, diamond frame, S strokes lock, gradient sweep, wordmark | none |
| 1 Chaos | 0.00 - 0.20 | `three/Scene1Chaos.tsx` | scene copy | "Every business starts messy." |
| 2 Forge | 0.20 - 0.40 | `three/Scene2Forge.tsx` | `panels/CodeEditorPanel.tsx` (typing, ghost text accepted: 0.208 - 0.39) | "We take the mess. We forge the system." |
| 3 Build | 0.40 - 0.60 | `three/Scene3Build.tsx` | `panels/TerminalPanel.tsx` (build log 0.415 - 0.575) | "Software that runs your operations, not just your website." |
| 4 Product City | 0.60 - 0.85 | `three/Scene4City.tsx` | `CityCard` in `StoryOverlay.tsx` (hover enabled 0.70 - 0.865) | "Ready-to-run products, built from the same forge." |
| 5 Live + CTA | 0.85 - 1.00 | `three/Scene5Live.tsx` | status pills, counters, CTA in `StoryOverlay.tsx` | "Have an idea? Let's build it." + tagline |

Shared: `CameraRig` (camera path from `story/camera-path.ts`), `Sparks` (pooled cyan sparks, fired on every strike), `Atmosphere` and `Dust` (fog, lights, particles), `StoryCanvas` (renderer, quality, post-processing), `StoryRoot` (scroll to progress, ticker, capability detection).

### Scene 1: Chaos (0 - 0.20)
Instanced bills, ledgers, receipts, sticky notes, spreadsheet grids with red `#REF!` cells and chat bubbles ("how much stock is left?", "send the bill tomorrow", "which file is the latest?") drift in a slightly tilted, dim space. The camera moves slowly forward so objects pass close for depth.

### Scene 2: The Forge (0.20 - 0.40)
The camera drops to a dark metal anvil. A glowing code editor sits on it (CSS-3D DOM panel for sharp text when the screen is wide enough, overlay otherwise). Each strike pulls a piece of clutter in, flattens it and turns it into a line of code. An AI ghost-text suggestion appears and is accepted with Tab.

### Scene 3: Build output (0.40 - 0.60)
A terminal compiles the seven services one by one with green checks, then "Build passed ✓". Four UI panels (stock table, billing receipt, status board, sales chart) extrude out of the screen in 3D (0.43 - 0.54), then collapse (0.585 - 0.625) as the camera pulls back through.

### Scene 4: Product City (0.60 - 0.85)
An isometric city on diamond tiles. Buildings deploy one at a time (start, duration): fuel station 0.655, school 0.688, cafe 0.72, office tower 0.752, factory 0.784 (each 0.04). Hover (tap on mobile) slides up a glass card with the product name, one line, and **Request demo** to `/contact?interest=<slug>`. Buildings are not links.

| Building | Product |
| --- | --- |
| Fuel station | Fuel Pump ERP |
| Montessori school | Student Relationship Management |
| Cafe | Restaurant & Cafe Management / Billing System |
| Office tower | HRMS |
| Factory | Factory Management Systems |

### Scene 5: Live + CTA (0.85 - 1.00)
Status pills light in sequence: Committed 0.865, Built 0.89, Tested 0.915, Live 0.94. At 0.955 the counters animate: 40+ projects delivered, 20+ clients served, MVP in as little as 2 days ("Timelines vary with scope."). Then the CTA with the tagline and a gradient button to Contact.
