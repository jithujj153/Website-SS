"use client";

import { useEffect, useRef, useState } from "react";
import { FLOOR_BEATS, FLOOR_BUBBLES, FLOOR_TAGS, MANAGER, MOBILE_BUBBLE_IDS } from "@/story/floor-layout";
import { projectToScreen } from "@/story/camera-share";
import { clamp01, lerp, remap, smoothstep, windowed } from "@/story/ranges";
import { useStoryFrame, useStoryValue } from "@/story/hooks";
import { floorCopy } from "@/config/content";

/**
 * Scene 1 (factory) DOM layer: zone status tags and the manager's thought bubbles.
 * Real text, pinned to projected 3D points (see camera-share), updated straight from the story frame.
 * Red appears only on the status chips.
 */

const HEAD: [number, number, number] = [MANAGER[0], MANAGER[1] + 2.35, MANAGER[2]];
const pt = { x: 0, y: 0 };

const chipStyle: React.CSSProperties = { background: "var(--color-ref)", color: "#fff" };

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-[0.3rem] px-1.5 py-[2px] font-mono text-[0.58rem] font-semibold uppercase leading-none tracking-[0.1em] sm:text-[0.62rem]" style={chipStyle}>
      {children}
    </span>
  );
}

const pill =
  "pointer-events-none absolute left-0 top-0 hidden items-center gap-2 rounded-full border border-[rgba(120,200,255,0.35)] bg-[rgba(8,16,38,0.72)] px-3 py-1.5 text-text shadow-[0_6px_30px_rgba(0,0,0,0.5)] backdrop-blur-sm will-change-transform";

export function FloorTags() {
  const tagRefs = useRef<(HTMLDivElement | null)[]>([]);
  const bubRefs = useRef<(HTMLDivElement | null)[]>([]);
  const mergeRef = useRef<HTMLDivElement>(null);
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const on = () => setMobile(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  const bubbles = mobile ? FLOOR_BUBBLES.filter((b) => MOBILE_BUBBLE_IDS.includes(b.id)) : FLOOR_BUBBLES;

  useStoryFrame((s, _dt, now) => {
    const p = s.smooth;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const k = Math.min(1, Math.max(0.55, w / 1200)) * (mobile ? 0.8 : 1);
    const [c0, c1] = FLOOR_BEATS.collapse;
    const m = smoothstep(remap(p, c0, c1));
    const active = p > -0.01 && p < 0.2;

    // zone tags
    FLOOR_TAGS.forEach((t, i) => {
      const el = tagRefs.current[i];
      if (!el) return;
      let o = smoothstep(remap(p, t.at, t.at + 0.012)) * (1 - m);
      // beat 3: tags flicker as the floor loses control
      if (p > FLOOR_BEATS.redLight && p < c0) o *= 0.55 + 0.45 * Math.abs(Math.sin(now * 0.011 + i * 2.1) * Math.sin(now * 0.0047 + i));
      const ok = o > 0.01 && active && projectToScreen(t.pos[0], t.pos[1], t.pos[2], pt);
      el.style.display = ok ? "flex" : "none";
      if (ok) {
        el.style.opacity = String(o);
        el.style.transform = `translate3d(${pt.x}px, ${pt.y}px, 0) translate(-50%, -50%) scale(${0.85 + 0.15 * k})`;
      }
    });

    // thought bubbles
    const okHead = active && projectToScreen(HEAD[0], HEAD[1], HEAD[2], pt);
    const hx = pt.x;
    const hy = pt.y;
    bubbles.forEach((b, i) => {
      const el = bubRefs.current[i];
      if (!el) return;
      const born = smoothstep(remap(p, b.at, b.at + 0.01));
      const o = born * (1 - m);
      if (!okHead || o < 0.01) {
        el.style.display = "none";
        return;
      }
      const beat3 = b.at >= FLOOR_BEATS.copy3[0];
      const rise = Math.min(beat3 ? 150 : 30, Math.max(0, p - b.at) * (beat3 ? 3400 : 700)) * k;
      let x = hx + b.slot[0] * k;
      // spread the cluster over the space above his head, however close the camera is
      const sc = k * (h / 700);
      const yB = hy - 60 * sc;
      const yT = hy - 330 * sc;
      const minY = 130 + 60 * k;
      const f = yT < minY ? Math.max(0.15, (yB - minY) / (yB - yT)) : 1;
      let y = yB - (yB - (hy + b.slot[1] * sc)) * f - rise;
      // collapse every bubble onto one point just above his head
      x = lerp(x, hx, m);
      y = lerp(y, hy - 120 * k, m);
      // keep every bubble on screen (and clear of the header)
      const hw = 120 * k + 8;
      x = Math.min(w - hw, Math.max(hw, x));
      y = Math.min(h - 90, Math.max(minY - 20, y));
      const pop = 0.82 + 0.18 * born;
      el.style.display = "flex";
      el.style.opacity = String(o);
      el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -100%) scale(${pop * (1 - 0.35 * m) * k})`;
    });

    // the merged "?" bubble: all the questions become one, then it hands over to the tablet
    const mg = mergeRef.current;
    if (mg) {
      const o = smoothstep(remap(p, c0 + 0.006, c1 + 0.004)) * (1 - smoothstep(remap(p, FLOOR_BEATS.tabletType[0] + 0.006, FLOOR_BEATS.tabletType[0] + 0.02)));
      const ok = okHead && o > 0.01;
      mg.style.display = ok ? "flex" : "none";
      if (ok) {
        mg.style.opacity = String(o);
        mg.style.transform = `translate3d(${hx}px, ${hy - 120 * k}px, 0) translate(-50%, -100%) scale(${k})`;
      }
    }
  });

  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden">
      {FLOOR_TAGS.map((t, i) => (
        <div key={t.id} ref={(el) => void (tagRefs.current[i] = el)} className={pill}>
          <span className="font-display text-[0.8rem] font-medium tracking-wide sm:text-sm">{t.text}:</span>
          <Chip>?</Chip>
        </div>
      ))}
      {bubbles.map((b, i) => (
        <div
          key={b.id}
          ref={(el) => void (bubRefs.current[i] = el)}
          className="pointer-events-none absolute left-0 top-0 hidden w-[13.5rem] flex-col items-start gap-1.5 rounded-2xl rounded-bl-sm border border-[rgba(150,215,255,0.4)] bg-[rgba(8,16,38,0.8)] px-3.5 py-2.5 text-text shadow-[0_8px_36px_rgba(0,0,0,0.55)] backdrop-blur-sm will-change-transform sm:w-[16rem]"
        >
          <Chip>{b.chip}</Chip>
          <span className="font-display text-[0.8rem] leading-snug sm:text-[0.92rem]">{b.text}</span>
        </div>
      ))}
      <div ref={mergeRef} className="pointer-events-none absolute left-0 top-0 hidden items-center gap-2 rounded-2xl rounded-bl-sm border border-[rgba(150,215,255,0.5)] bg-[rgba(8,16,38,0.85)] px-4 py-2 shadow-[0_8px_40px_rgba(0,0,0,0.6)] will-change-transform">
        <span className="font-display text-3xl font-semibold leading-none text-text">?</span>
        <Chip>UNKNOWN</Chip>
      </div>
    </div>
  );
}

/** Scene 1 (factory) overlay copy: beat 1, beat 3 and the typed tablet line. */
export function FloorCopy() {
  const b1 = useRef<HTMLDivElement>(null);
  const b3 = useRef<HTMLDivElement>(null);
  const tb = useRef<HTMLDivElement>(null);
  useStoryFrame((s) => {
    const p = s.smooth;
    const set = (el: HTMLDivElement | null, o: number) => {
      if (!el) return;
      el.style.opacity = String(o);
      el.style.transform = `translate3d(0, ${(1 - o) * 22}px, 0)`;
      el.style.visibility = o < 0.01 ? "hidden" : "visible";
    };
    set(b1.current, windowed(p, FLOOR_BEATS.beat1[0], FLOOR_BEATS.beat1[1] + 0.006, 0.014));
    set(b3.current, windowed(p, FLOOR_BEATS.copy3[0], FLOOR_BEATS.copy3[1], 0.012));
    set(tb.current, windowed(p, FLOOR_BEATS.tabletType[0] - 0.004, 0.202, 0.008));
  });
  const n = useStoryValue((s) => Math.round(clamp01(remap(s.smooth, FLOOR_BEATS.tabletType[0], FLOOR_BEATS.tabletType[1] - 0.012)) * floorCopy.tablet.length));
  const h2 = "mt-4 font-display text-[clamp(1.95rem,4.6vw,4.1rem)] font-semibold leading-[1.04] tracking-tight text-text";
  const shadow = { textShadow: "0 2px 40px rgba(6,11,26,0.95)" };
  const pos = "absolute bottom-[11vh] left-[var(--spacing-gutter)] max-w-[min(92vw,40rem)]";
  return (
    <>
      <div ref={b1} className={pos} style={{ opacity: 1 }}>
        <p className="eyebrow">{floorCopy.kicker}</p>
        <h2 className={h2} style={shadow}>
          {floorCopy.beat1}
        </h2>
      </div>
      <div ref={b3} className={pos} style={{ opacity: 0, visibility: "hidden" }}>
        <p className="eyebrow">{floorCopy.kicker}</p>
        <h2 className={h2} style={shadow}>
          {floorCopy.beat3}
        </h2>
      </div>
      <div ref={tb} className={pos} style={{ opacity: 0, visibility: "hidden" }}>
        <p className="eyebrow">He types</p>
        <p className="mt-4 font-mono text-[clamp(1.4rem,3.4vw,2.8rem)] leading-tight text-hot" style={shadow}>
          <span className="text-cyan">&gt; </span>
          {floorCopy.tablet.slice(0, n)}
          <span aria-hidden className="ml-0.5 inline-block h-[1em] w-[0.5ch] translate-y-[0.12em] animate-pulse bg-cyan" />
        </p>
      </div>
    </>
  );
}
