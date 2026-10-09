import Link from "next/link";
import { ArrowRight, Check } from "@/components/ui/icons";
import { DiamondDivider } from "@/components/brand/Diamond";
import { StatRow } from "@/components/sections/StatRow";
import { cityBuildings, floorCopy, services, storyCopy } from "@/config/content";
import { scene1Variant } from "@/config/site";
import { RestoreButton } from "./RestoreButton";

/**
 * STATIC STORY: the same five scenes as the 3D version, illustrated and non-animated.
 * Shown for prefers-reduced-motion, no WebGL, save-data, a context loss.
 * Pure server-renderable markup (only RestoreButton is a client island).
 */

const frame = "relative overflow-hidden rounded-[var(--radius-xl)] border border-line bg-surface/70 shadow-[var(--shadow-panel)]";

function SceneShell({ id, kicker, line, children, art, flip = false }: { id: string; kicker: string; line: string; children?: React.ReactNode; art: React.ReactNode; flip?: boolean }) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="container-site py-[clamp(3.5rem,8vw,6.5rem)]">
      <div className={`grid items-center gap-10 lg:grid-cols-2 lg:gap-16 ${flip ? "lg:[&>*:first-child]:order-2" : ""}`}>
        <div>
          <p className="eyebrow">{kicker}</p>
          <h2 id={`${id}-h`} className="mt-5 font-display text-[clamp(2rem,4.6vw,3.6rem)] font-semibold">
            {line}
          </h2>
          {children && <div className="mt-6 max-w-xl text-muted">{children}</div>}
        </div>
        <div className={frame}>{art}</div>
      </div>
    </section>
  );
}

/* ----- illustrations (inline SVG, brand tokens only) ----- */

function ArtChaos() {
  const notes = [
    { x: 40, y: 50, r: -8, t: "how much stock is left?" },
    { x: 210, y: 150, r: 6, t: "send the bill tomorrow" },
    { x: 70, y: 250, r: -4, t: "which file is the latest?" },
  ];
  return (
    <svg viewBox="0 0 480 360" role="img" aria-label="Illustration: scattered bills, a ledger, a spreadsheet with errors and chat messages" className="block h-auto w-full">
      <defs>
        <linearGradient id="fb-g1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2db7db" />
          <stop offset="1" stopColor="#2347c5" />
        </linearGradient>
      </defs>
      <rect width="480" height="360" fill="#0a1226" />
      {/* spreadsheet with #REF! */}
      <g transform="translate(250 28) rotate(5)">
        <rect width="190" height="116" rx="6" fill="#0d1730" stroke="rgb(255 255 255 / .16)" />
        {[0, 1, 2, 3].map((r) =>
          [0, 1, 2].map((c) => (
            <rect key={`${r}${c}`} x={8 + c * 58} y={8 + r * 26} width="54" height="22" rx="3" fill={r === 1 && c === 1 ? "#d64550" : r === 3 && c === 2 ? "#d64550" : "#121f3f"} />
          )),
        )}
        <text x="72" y="52" fontFamily="monospace" fontSize="10" fill="#fff">#REF!</text>
        <text x="130" y="104" fontFamily="monospace" fontSize="10" fill="#fff">#REF!</text>
      </g>
      {/* ledger */}
      <g transform="translate(26 150) rotate(-10)">
        <rect width="120" height="86" rx="4" fill="#16254a" stroke="rgb(255 255 255 / .16)" />
        <rect x="0" width="12" height="86" fill="#2347c5" />
        {[0, 1, 2, 3, 4].map((i) => (
          <rect key={i} x="24" y={14 + i * 14} width={70 - (i % 2) * 18} height="3" rx="1.5" fill="#8fa3c4" opacity=".6" />
        ))}
      </g>
      {/* receipt */}
      <g transform="translate(335 190) rotate(9)">
        <path d="M0 0h70v110l-8-6-9 6-9-6-9 6-9-6-9 6-9-6V0z" fill="#eaf2ff" opacity=".9" />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <rect key={i} x="10" y={14 + i * 14} width={50 - (i % 3) * 12} height="3" rx="1.5" fill="#0d1730" opacity=".55" />
        ))}
      </g>
      {/* chat bubbles / sticky notes */}
      {notes.map((n) => (
        <g key={n.t} transform={`translate(${n.x} ${n.y}) rotate(${n.r})`}>
          <rect width="170" height="38" rx="14" fill="url(#fb-g1)" opacity=".92" />
          <text x="14" y="24" fontFamily="Inter, sans-serif" fontSize="12" fill="#fff">{n.t}</text>
        </g>
      ))}
    </svg>
  );
}

function ArtFloor() {
  const bubbles = [
    { x: 24, y: 30, w: 170, t: "Which orders are running right now?", c: "UNKNOWN" },
    { x: 214, y: 58, w: 170, t: "Is the raw material in stock?", c: "CHECK" },
    { x: 24, y: 88, w: 156, t: "How many parts failed QC today?", c: "REJECTS" },
  ];
  return (
    <svg viewBox="0 0 480 360" role="img" aria-label="Illustration: a dark industrial hall with racks, a conveyor and machines. A floor manager in a white hard hat and a dark vest stands in the middle, surrounded by questions about orders, stock and quality, each with a red status chip." className="block h-auto w-full">
      <defs>
        <linearGradient id="fl-sh" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#bfe3ff" stopOpacity=".38" />
          <stop offset="1" stopColor="#bfe3ff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="480" height="360" fill="#0a1226" />
      {/* light shafts */}
      <path d="M90 0h46l-60 260H0z" fill="url(#fl-sh)" />
      <path d="M330 0h40l60 260h-70z" fill="url(#fl-sh)" opacity=".7" />
      {/* floor */}
      <path d="M0 250h480v110H0z" fill="#0d1730" />
      <path d="M240 250L90 360M240 250l150 110" stroke="#2db7db" strokeOpacity=".35" />
      {/* glass office + clock */}
      <rect x="170" y="150" width="140" height="62" rx="3" fill="#10204a" stroke="rgb(143 214 255 / .4)" />
      <rect x="205" y="132" width="70" height="16" rx="3" fill="#050a18" stroke="rgb(143 214 255 / .5)" />
      <text x="240" y="144" textAnchor="middle" fontFamily="monospace" fontSize="11" fill="#7fe3ff">11:40</text>
      {/* racks (left) */}
      {[0, 1, 2].map((r) => (
        <g key={r}>
          <rect x="14" y={170 + r * 26} width="104" height="4" fill="#2347c5" />
          {[0, 1, 2, 3].map((c) => (
            <rect key={c} x={20 + c * 24} y={150 + r * 26} width="18" height="20" fill="#16254a" stroke="rgb(143 214 255 / .25)" />
          ))}
        </g>
      ))}
      {/* conveyor + machines (right) */}
      <path d="M330 262l150-20v26l-150 20z" fill="#16254a" stroke="rgb(143 214 255 / .35)" />
      {[0, 1, 2].map((i) => (
        <rect key={i} x={346 + i * 38} y={246 - i * 4} width="14" height="12" fill="#7fe3ff" opacity=".85" />
      ))}
      <rect x="380" y="190" width="40" height="44" rx="3" fill="#10204a" stroke="rgb(143 214 255 / .4)" />
      <circle cx="400" cy="206" r="3" fill="#d64550" />
      {/* the manager: white hard hat, dark vest, cyan strip */}
      <g transform="translate(240 252)">
        <rect x="-14" y="-92" width="28" height="48" rx="4" fill="#0d1730" stroke="rgb(143 214 255 / .5)" />
        <rect x="-3" y="-92" width="6" height="48" fill="#7fe3ff" />
        <circle cx="0" cy="-106" r="10" fill="#8fa3c4" />
        <path d="M-12 -108a12 11 0 0124 0z" fill="#eaf2ff" />
        <rect x="-10" y="-44" width="8" height="40" fill="#0d1730" />
        <rect x="2" y="-44" width="8" height="40" fill="#0d1730" />
      </g>
      {/* thought bubbles with red status chips */}
      {bubbles.map((b) => (
        <g key={b.t} transform={`translate(${b.x} ${b.y})`}>
          <rect width={b.w} height="46" rx="14" fill="#0d1730" stroke="rgb(143 214 255 / .5)" />
          <rect x="10" y="8" width={b.c.length * 6.6 + 12} height="13" rx="3" fill="#d64550" />
          <text x="16" y="18" fontFamily="monospace" fontSize="8.5" fontWeight="700" fill="#fff">{b.c}</text>
          <text x="10" y="37" fontFamily="Inter, sans-serif" fontSize="10" fill="#eaf2ff">{b.t}</text>
        </g>
      ))}
      {/* zone tags */}
      {[["Stock", 36, 140], ["Job status", 378, 176], ["Passed", 214, 226]].map(([t, x, y]) => (
        <g key={t as string} transform={`translate(${x} ${y})`}>
          <rect width={(t as string).length * 6 + 36} height="18" rx="9" fill="#0d1730" stroke="rgb(143 214 255 / .45)" />
          <text x="9" y="12.5" fontFamily="Inter, sans-serif" fontSize="9.5" fill="#eaf2ff">{t}:</text>
          <rect x={(t as string).length * 6 + 16} y="3" width="14" height="12" rx="3" fill="#d64550" />
          <text x={(t as string).length * 6 + 23} y="12.5" textAnchor="middle" fontFamily="monospace" fontSize="9" fontWeight="700" fill="#fff">?</text>
        </g>
      ))}
    </svg>
  );
}

function ArtForge() {
  return (
    <svg viewBox="0 0 480 360" role="img" aria-label="Illustration: a code editor glowing on a dark metal anvil, with cyan sparks" className="block h-auto w-full">
      <defs>
        <linearGradient id="fb-metal" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2b3a5e" />
          <stop offset="1" stopColor="#0f1830" />
        </linearGradient>
        <radialGradient id="fb-glow" cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor="#d9fbff" stopOpacity=".9" />
          <stop offset="1" stopColor="#2db7db" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="480" height="360" fill="#0a1226" />
      <ellipse cx="240" cy="190" rx="200" ry="120" fill="url(#fb-glow)" opacity=".25" />
      {/* editor */}
      <g transform="translate(110 40)">
        <rect width="260" height="156" rx="10" fill="#0d1730" stroke="rgb(45 183 219 / .7)" />
        <rect width="260" height="22" rx="10" fill="#121f3f" />
        <circle cx="14" cy="11" r="3.5" fill="#8fa3c4" />
        <circle cx="27" cy="11" r="3.5" fill="#8fa3c4" />
        <circle cx="40" cy="11" r="3.5" fill="#8fa3c4" />
        <g fontFamily="JetBrains Mono, monospace" fontSize="11">
          {scene1Variant === "factory" ? (
            <>
              <text x="16" y="40" fill="#7391ff">forge</text>
              <text x="52" y="40" fill="#eaf2ff">({"{"}</text>
              <text x="30" y="58" fill="#eaf2ff">orders: trackOrders(),</text>
              <text x="30" y="74" fill="#eaf2ff">stock: syncInventory(),</text>
              <text x="30" y="90" fill="#eaf2ff">quality: logQC(batch),</text>
              <text x="30" y="106" fill="#8fa3c4" opacity=".7">machines: machineStatus(id),</text>
              <text x="16" y="120" fill="#eaf2ff">{"})"}</text>
            </>
          ) : (
            <>
              <text x="16" y="48" fill="#7391ff">function</text>
              <text x="72" y="48" fill="#eaf2ff">createInvoice(order) {"{"}</text>
              <text x="30" y="68" fill="#eaf2ff">const total = sum(order.items);</text>
              <text x="30" y="88" fill="#8fa3c4" opacity=".7">return bill(order, total);</text>
              <text x="16" y="108" fill="#eaf2ff">{"}"}</text>
            </>
          )}
        </g>
        <rect x="30" y="122" width="7" height="14" fill="#d9fbff" />
      </g>
      {/* anvil */}
      <path d="M70 226h250c20 0 40-10 62-24 0 22-10 38-38 44l-24 6v22l14 18H120l14-18v-22l-24-6c-24-6-40-22-40-20z" fill="url(#fb-metal)" stroke="rgb(45 183 219 / .5)" />
      <rect x="150" y="224" width="170" height="3" fill="#2db7db" opacity=".7" />
      {/* sparks */}
      {[[330, 215, 4], [352, 190, 3], [372, 170, 2.2], [312, 188, 2.6], [392, 205, 2], [345, 232, 2.4]].map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill="#d9fbff" />
      ))}
    </svg>
  );
}

function ArtBuild() {
  return (
    <svg viewBox="0 0 480 360" role="img" aria-label="Illustration: a terminal showing services compiled with green checks and four UI panels rising out of it" className="block h-auto w-full">
      <rect width="480" height="360" fill="#0a1226" />
      <g transform="translate(24 28)">
        <rect width="250" height="300" rx="10" fill="#060b1a" stroke="rgb(255 255 255 / .16)" />
        {services.map((s, i) => (
          <g key={s.slug}>
            <text x="16" y={34 + i * 24} fontFamily="JetBrains Mono, monospace" fontSize="10.5" fill="#3ddc97">✓</text>
            <text x="34" y={34 + i * 24} fontFamily="JetBrains Mono, monospace" fontSize="10.5" fill="#eaf2ff">{s.short}</text>
          </g>
        ))}
        <text x="16" y="248" fontFamily="JetBrains Mono, monospace" fontSize="13" fill="#3ddc97" fontWeight="700">Build passed ✓</text>
      </g>
      {/* panels */}
      <g>
        <g transform="translate(298 36) skewY(-4)"><rect width="150" height="68" rx="8" fill="#0d1730" stroke="rgb(45 183 219 / .6)" />{[0, 1, 2].map((i) => <rect key={i} x="10" y={12 + i * 18} width={130 - i * 20} height="8" rx="3" fill="#2347c5" opacity={0.9 - i * 0.2} />)}</g>
        <g transform="translate(298 120) skewY(-4)"><rect width="150" height="68" rx="8" fill="#0d1730" stroke="rgb(45 183 219 / .6)" /><rect x="14" y="14" width="40" height="6" rx="3" fill="#8fa3c4" /><rect x="14" y="30" width="120" height="3" fill="#8fa3c4" opacity=".5" /><rect x="14" y="40" width="96" height="3" fill="#8fa3c4" opacity=".5" /><rect x="90" y="52" width="44" height="8" rx="3" fill="#2db7db" /></g>
        <g transform="translate(298 204) skewY(-4)"><rect width="150" height="68" rx="8" fill="#0d1730" stroke="rgb(45 183 219 / .6)" />{[0, 1, 2, 3].map((i) => <circle key={i} cx={24 + i * 34} cy="34" r="9" fill={i === 3 ? "#2db7db" : "#2347c5"} />)}</g>
        <g transform="translate(298 288) skewY(-4)"><rect width="150" height="56" rx="8" fill="#0d1730" stroke="rgb(45 183 219 / .6)" />{[14, 28, 20, 38, 32, 46].map((h, i) => <rect key={i} x={14 + i * 22} y={50 - h} width="12" height={h} rx="2" fill="url(#fb-g1)" />)}</g>
      </g>
      <defs>
        <linearGradient id="fb-g1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#2db7db" /><stop offset="1" stopColor="#2347c5" /></linearGradient>
      </defs>
    </svg>
  );
}

function ArtCity() {
  // isometric diamond tiles with five simple buildings
  const tile = (cx: number, cy: number, w = 64, h = 32, fill = "#0d1730") => `${cx},${cy - h} ${cx + w},${cy} ${cx},${cy + h} ${cx - w},${cy}`;
  const box = (cx: number, cy: number, w: number, d: number, hgt: number, top: string, left: string, right: string) => (
    <g>
      <polygon points={`${cx - w},${cy} ${cx},${cy + d} ${cx},${cy + d - hgt} ${cx - w},${cy - hgt}`} fill={left} />
      <polygon points={`${cx + w},${cy} ${cx},${cy + d} ${cx},${cy + d - hgt} ${cx + w},${cy - hgt}`} fill={right} />
      <polygon points={`${cx},${cy - d - hgt} ${cx + w},${cy - hgt} ${cx},${cy + d - hgt} ${cx - w},${cy - hgt}`} fill={top} />
    </g>
  );
  return (
    <svg viewBox="0 0 480 360" role="img" aria-label="Illustration: an isometric city on diamond tiles with a fuel station, school, cafe, office tower and factory" className="block h-auto w-full">
      <rect width="480" height="360" fill="#0a1226" />
      {[[240, 300], [176, 268], [304, 268], [112, 236], [368, 236], [240, 236], [176, 204], [304, 204], [240, 172], [112, 172], [368, 172], [176, 140], [304, 140], [240, 108]].map(([x, y], i) => (
        <polygon key={i} points={tile(x, y, 64, 32)} fill="#0d1730" stroke="rgb(45 183 219 / .35)" />
      ))}
      {box(112, 236, 34, 17, 34, "#2b3a5e", "#16254a", "#1d2f5c")}
      {box(176, 204, 30, 15, 28, "#2db7db", "#1b78a8", "#2347c5")}
      {box(304, 204, 32, 16, 52, "#2b3a5e", "#16254a", "#1d2f5c")}
      {box(240, 172, 30, 15, 82, "#7391ff", "#2347c5", "#1a3796")}
      {box(368, 236, 36, 18, 38, "#2b3a5e", "#16254a", "#1d2f5c")}
      {[[112, 214], [176, 186], [304, 162], [240, 118], [368, 212]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="3.5" fill="#d9fbff" />
      ))}
    </svg>
  );
}

function ArtLive() {
  return (
    <svg viewBox="0 0 480 360" role="img" aria-label="Illustration: a pipeline of four steps, Committed, Built, Tested, Live" className="block h-auto w-full">
      <defs>
        <linearGradient id="fb-g2" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#2db7db" /><stop offset="1" stopColor="#2347c5" /></linearGradient>
      </defs>
      <rect width="480" height="360" fill="#0a1226" />
      <line x1="70" y1="180" x2="410" y2="180" stroke="rgb(255 255 255 / .16)" strokeWidth="2" />
      <line x1="70" y1="180" x2="410" y2="180" stroke="url(#fb-g2)" strokeWidth="3" />
      {["Committed", "Built", "Tested", "Live"].map((t, i) => (
        <g key={t} transform={`translate(${70 + i * 113.3} 180)`}>
          <rect x="-13" y="-13" width="26" height="26" fill={i === 3 ? "#d9fbff" : "url(#fb-g2)"} transform="rotate(45)" />
          <text y="46" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="12" fill="#eaf2ff">{t}</text>
        </g>
      ))}
    </svg>
  );
}

export function StoryFallback({ onRestore3d, canRestore }: { onRestore3d: () => void; canRestore: boolean }) {
  return (
    <div className="relative pt-[clamp(6rem,12vw,9rem)]" data-story-mode="static">
      {/* Hero */}
      <header className="container-site pb-[clamp(2rem,5vw,4rem)]">
        <p className="eyebrow">System-Smiths</p>
        <p className="mt-6 max-w-4xl font-display text-[clamp(2.6rem,7.4vw,6rem)] font-semibold leading-[1.02]">
          Turning ideas <span className="grad-text">into reality.</span>
        </p>
        <p className="mt-6 max-w-2xl text-lg text-muted">Custom business systems and ready-to-run products, forged for operations-heavy businesses.</p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link href="/contact" className="btn btn-primary">
            Start a project <ArrowRight />
          </Link>
          <Link href="/what-we-do" className="btn btn-ghost">What we do</Link>
          {canRestore && <RestoreButton onRestore={onRestore3d} />}
        </div>
      </header>

      <DiamondDivider />

      {scene1Variant === "factory" ? (
        <SceneShell id="mess" kicker={floorCopy.kicker} line={`${floorCopy.beat1} ${floorCopy.beat3}`} art={<ArtFloor />}>
          <p>Orders, stock and quality checks, all moving at once. The manager asks: which orders are running right now, is the raw material in stock, how many parts failed QC today. Then he picks up a tablet: &ldquo;{floorCopy.tablet}&rdquo;</p>
        </SceneShell>
      ) : (
        <SceneShell id="mess" kicker={storyCopy.chaos.kicker} line={storyCopy.chaos.line} art={<ArtChaos />}>
          <p>Bills in drawers, stock in someone&apos;s head, three versions of the same file. It works, until it doesn&apos;t.</p>
        </SceneShell>
      )}

      {scene1Variant === "factory" ? (
        <SceneShell id="forge" kicker={floorCopy.forge.kicker} line={floorCopy.forge.line} art={<ArtForge />} flip>
          <p>Each question is pulled in, shaped and turned into code (trackOrders, syncInventory, logQC, machineStatus), with AI-assisted engineering and a human reviewing every line.</p>
        </SceneShell>
      ) : (
        <SceneShell id="forge" kicker={storyCopy.forge.kicker} line={storyCopy.forge.line} art={<ArtForge />} flip>
          <p>Every piece of the mess is pulled in, shaped and turned into code, with AI-assisted engineering and a human reviewing every line.</p>
        </SceneShell>
      )}

      <SceneShell id="build" kicker={storyCopy.build.kicker} line={storyCopy.build.line} art={<ArtBuild />}>
        <ul className="grid gap-2 sm:grid-cols-2">
          {services.map((s) => (
            <li key={s.slug} className="flex items-start gap-2 text-sm text-text">
              <Check className="mt-0.5 shrink-0 text-ok" />
              {s.title}
            </li>
          ))}
        </ul>
        <p className="mt-4 font-mono text-sm text-ok">Build passed ✓</p>
      </SceneShell>

      <SceneShell id="city" kicker={storyCopy.city.kicker} line={storyCopy.city.line} art={<ArtCity />} flip>
        <ul className="diamond-list space-y-3">
          {cityBuildings.map((b) => (
            <li key={b.id}>
              <span className="text-text">{b.name}</span>
              <span className="text-muted"> ({b.kind.toLowerCase()}). {b.line}</span>{" "}
              <Link href={`/contact?interest=${b.interest}`} className="whitespace-nowrap text-cyan underline-offset-4 hover:underline">
                Request demo
              </Link>
            </li>
          ))}
        </ul>
      </SceneShell>

      <SceneShell id="live" kicker={storyCopy.live.kicker} line={storyCopy.live.line} art={<ArtLive />}>
        <p className="mb-8 font-display text-xl text-text">Turning ideas into reality.</p>
        <Link href="/contact" className="btn btn-primary">
          Start a project <ArrowRight />
        </Link>
      </SceneShell>

      <StatRow className="container-site pb-16" />
    </div>
  );
}
