# System-Smiths website

A scroll-driven 3D story site for **System-Smiths** ("Turning ideas into reality"). The Home page is one continuous camera move through a single world, **the Forge**: messy business reality goes in, working software comes out.

Stack: Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · React Three Fiber + drei · GSAP ScrollTrigger · Lenis · Framer Motion · MDX (next-mdx-remote) · Resend · zod.

> **Status: written but not yet built.** The environment this was authored in could not reach the npm registry, so `npm install`, `next build` and a browser check have **not** been run. Everything was cross-checked for import/export consistency and syntax, but expect a short first-run shakedown. See "First-run checklist" below.

## Setup

```bash
npm install
cp .env.example .env.local     # then fill in the values (see below)
npm run dev                    # http://localhost:3000
npm run typecheck
npm run build && npm start
```

Node 20.9+ required.

### Environment variables

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical URL, used by metadata, sitemap, Open Graph, JSON-LD |
| `RESEND_API_KEY` | Contact form delivery (https://resend.com) |
| `CONTACT_FROM_EMAIL` | Sender on a domain you verified in Resend, e.g. `System-Smiths <forms@system-smiths.com>` |
| `CONTACT_TO_EMAIL` | Recipient (defaults to `connect@system-smiths.com`) |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Optional. Durable rate limiting across serverless instances; otherwise an in-memory limiter is used |
| `NEXT_PUBLIC_GA_ID` | Optional GA4 id. **Off by default**; loads only after the visitor accepts the cookie notice |

## Folder structure

```
content/blog/                 4 launch posts (MDX + frontmatter)
public/logo/                  Logo SVGs: full colour, horizontal, mark, favicon, mono, mono mark
docs/                         DESIGN.md, COPY.md, DEPLOY.md
src/
  app/                        Routes: / , /what-we-do , /blogs , /blogs/[slug] , /contact , /api/contact
                              + layout, globals.css (design tokens), sitemap, robots, opengraph-image, 404
  config/
    site.ts                   Name, URL, email and the OPTIONAL contact details (phone, WhatsApp, address, hours, socials)
    content.ts                ALL marketing copy: stats, services, products, process, story copy, city buildings
  story/                      The scroll engine (no React state per frame)
    ranges.ts                 Scene ranges + beat timings   <- tune pacing here
    camera-path.ts            Camera keyframes (Catmull-Rom path)
    store.ts                  Progress, damping, hammer-strike ticks, city hover store
    hooks.ts                  useStoryFrame / useStoryValue / detectCapabilities
    ...                       strike weights, procedural textures, spark bus, city layout
  components/
    story/                    StoryRoot (mounts it all), StoryCanvas (R3F), StoryOverlay (DOM copy),
                              StoryFallback (static illustrated story), panels/ (code editor + terminal DOM panels)
    story/three/              Scene1Chaos ... Scene5Live, CameraRig, Sparks, Atmosphere, quality tiers
    sections/ blog/ contact/ products/ layout/ ui/ brand/
  lib/                        blog loader, contact zod schema, consent helper
```

## Editing content

- **Copy, services, products, stats:** `src/config/content.ts`. Wording is defined once and reused everywhere.
- **Optional contact details:** `src/config/site.ts`. Any value left `""` is not rendered anywhere (no placeholders). Setting `address` also turns on the map on `/contact`.
- **Blog:** add a `.mdx` file to `content/blog/` with frontmatter `title, excerpt, date, category, featured`. Reading time, table of contents, related posts and the sitemap entry are automatic.
- **Story pacing:** `src/story/ranges.ts` (scene ranges, `STORY_VH` scroll length) and `src/story/camera-path.ts`.

## Debug helpers

- `/?p=0.5` freezes the story at 50% (used for screenshots of any scene).
- `/?debug=1` shows a live readout of progress, scene and strike count.

## Fallbacks

The static, illustrated, non-animated version of the same story is used when: `prefers-reduced-motion`, no WebGL, `save-data`, a WebGL context loss, or the visitor clicks **Simplified view**. The overlay copy is real DOM text in every mode.

## First-run checklist (things most likely to need a tweak)

1. `npm run typecheck` and fix any type drift against the exact installed versions of R3F / drei / postprocessing.
2. The CSS-3D panels (`Html transform` in drei) in Scenes 2-3 use hand-calculated `distanceFactor`s (3.857 and 4.737). If the DOM editor/terminal do not sit exactly on the 3D screens, adjust these first.
3. Camera keys in `camera-path.ts` were authored without seeing the render. Scrub with `/?p=` and nudge any key that frames badly.
4. Tailwind v4 class names (`bg-(image:--brand-gradient)`, `group-data-[...]`) and the `@theme` tokens in `globals.css`.
5. Lighthouse run on `npm run build && npm start`. If LCP is high, defer the canvas import further or reduce `STORY_VH` effects on mobile.
