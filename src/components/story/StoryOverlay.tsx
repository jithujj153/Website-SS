"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { BEATS, SCENES, SCENE_ORDER, clamp01, remap, sceneAt, smoothstep, windowed, type SceneId } from "@/story/ranges";
import { cityActive, story, useCityActive } from "@/story/store";
import { useStoryFrame, useStoryValue } from "@/story/hooks";
import { cityBuildings, floorCopy, stats, storyCopy } from "@/config/content";
import { scene1Variant } from "@/config/site";
import { FloorCopy, FloorTags } from "./FloorTags";
import { Magnetic } from "@/components/ui/Magnetic";
import { ArrowRight, Check } from "@/components/ui/icons";
import { Stat } from "@/components/sections/Stat";
import { CodeEditorPanel } from "./panels/CodeEditorPanel";
import { TerminalPanel } from "./panels/TerminalPanel";

/**
 * The DOM layer of the story: real, selectable, screen-reader-friendly text pinned over the canvas.
 * Everything here is driven straight from `story.smooth` (no React renders per frame).
 */

const COPY_WINDOWS: Record<SceneId, [number, number]> = {
  chaos: [-0.1, 0.176],
  forge: [0.214, 0.386],
  build: [0.414, 0.586],
  city: [0.626, 0.846],
  live: [0.97, 1.2],
};

const SCENE_LABELS: Record<SceneId, string> = {
  chaos: "The mess",
  forge: "The forge",
  build: "The build",
  city: "The products",
  live: "Live",
};

function SceneCopy({ id, position }: { id: Exclude<SceneId, "live">; position: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [a, b] = COPY_WINDOWS[id];
  const factory = scene1Variant === "factory";
  const copy = factory && id === "forge" ? floorCopy.forge : storyCopy[id];
  useStoryFrame((s) => {
    const el = ref.current;
    if (!el) return;
    const o = windowed(s.smooth, a, b, 0.024);
    el.style.opacity = String(o);
    el.style.transform = `translate3d(0, ${(1 - o) * 22}px, 0)`;
    el.style.visibility = o < 0.01 ? "hidden" : "visible";
  });
  return (
    <div ref={ref} className={`absolute max-w-[min(92vw,40rem)] ${position}`} style={{ opacity: id === "chaos" ? 1 : 0 }}>
      <p className="eyebrow">{copy.kicker}</p>
      <h2 className="mt-4 font-display text-[clamp(1.95rem,4.6vw,4.1rem)] font-semibold leading-[1.04] tracking-tight text-text" style={{ textShadow: "0 2px 40px rgba(6,11,26,0.95)" }}>
        {copy.line}
      </h2>
    </div>
  );
}

function CityCard() {
  const id = useCityActive();
  const b = cityBuildings.find((x) => x.id === id);
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-5 flex justify-center px-4 sm:bottom-8" aria-live="polite">
      <AnimatePresence mode="wait">
        {b && (
          <motion.div
            key={b.id}
            initial={{ opacity: 0, y: 36, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="glass pointer-events-auto w-[min(92vw,26rem)] rounded-[var(--radius-lg)] p-5 sm:p-6"
            onPointerEnter={() => cityActive.cancelClear()}
            onPointerLeave={() => cityActive.clearSoon()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="eyebrow !text-[0.68rem]">{b.kind}</p>
                <h3 className="mt-2 font-display text-xl font-semibold leading-tight text-text">{b.name}</h3>
              </div>
              <button type="button" onClick={() => cityActive.set(null)} aria-label="Close" className="-mr-1 -mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-full text-muted transition-colors hover:text-text">
                <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
                  <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <p className="mt-2 text-[0.95rem] leading-relaxed text-muted">{b.line}</p>
            <Link href={`/contact?interest=${b.interest}`} className="btn btn-primary mt-5 w-full !py-3">
              Request demo <ArrowRight size={16} />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const STATUS = ["Committed", "Built", "Tested", "Live"] as const;

function LiveLayer() {
  const wrap = useRef<HTMLDivElement>(null);
  const counters = useRef<HTMLDivElement>(null);
  const cta = useRef<HTMLDivElement>(null);
  const done = useStoryValue((s) => BEATS.status.filter((t) => s.smooth >= t).length);
  const n0 = useStoryValue((s) => Math.round(smoothstep(remap(s.smooth, BEATS.counters, BEATS.counters + 0.03)) * stats[0].value));
  const n1 = useStoryValue((s) => Math.round(smoothstep(remap(s.smooth, BEATS.counters, BEATS.counters + 0.03)) * stats[1].value));
  const n2 = useStoryValue((s) => Math.round(smoothstep(remap(s.smooth, BEATS.counters + 0.004, BEATS.counters + 0.03)) * stats[2].value));

  useStoryFrame((s) => {
    const p = s.smooth;
    if (wrap.current) {
      const o = clamp01((p - 0.858) / 0.018);
      wrap.current.style.opacity = String(o);
      wrap.current.style.visibility = o < 0.01 ? "hidden" : "visible";
    }
    if (counters.current) {
      const o = smoothstep(remap(p, 0.948, 0.966));
      counters.current.style.opacity = String(o);
      counters.current.style.transform = `translate3d(0, ${(1 - o) * 26}px, 0)`;
    }
    if (cta.current) {
      const o = smoothstep(remap(p, 0.97, 0.99));
      cta.current.style.opacity = String(o);
      cta.current.style.transform = `translate3d(0, ${(1 - o) * 26}px, 0)`;
      cta.current.style.pointerEvents = o > 0.6 ? "auto" : "none";
    }
  });

  const values = [n0, n1, n2];
  return (
    <div ref={wrap} className="absolute inset-0 flex flex-col justify-between px-[var(--spacing-gutter)] pb-8 pt-24 sm:pb-12" style={{ opacity: 0 }}>
      {/* soft scrim so DOM text always reads over the lit city */}
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(120% 70% at 50% 100%, rgba(6,11,26,0.92) 0%, rgba(6,11,26,0.55) 45%, transparent 75%)" }} />

      <ol className="relative mx-auto flex w-full max-w-3xl items-center justify-between gap-1 sm:gap-3" aria-label="Release status">
        {STATUS.map((label, i) => {
          const complete = done > i;
          const isLive = i === 3;
          return (
            <li key={label} className="flex flex-1 items-center gap-1 sm:gap-3">
              <span
                className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 font-mono text-[0.68rem] uppercase tracking-[0.1em] transition-all duration-500 sm:gap-2 sm:px-4 sm:py-2 sm:text-xs ${
                  complete ? "border-ok/50 bg-ok/10 text-text" : "border-line text-muted"
                }`}
              >
                {complete ? <Check size={13} className="text-ok" /> : <i aria-hidden className="h-2 w-2 rotate-45 bg-line-strong" />}
                {label}
                {isLive && complete && <i aria-hidden className="ml-0.5 h-1.5 w-1.5 animate-pulse rounded-full bg-cyan" />}
              </span>
              {i < 3 && <span aria-hidden className="h-px flex-1" style={{ background: done > i + 0 ? "linear-gradient(90deg,#3ddc97,#2db7db)" : "rgba(255,255,255,0.12)" }} />}
            </li>
          );
        })}
      </ol>

      <div className="relative mx-auto w-full max-w-5xl">
        <div ref={counters} className="grid grid-cols-3 gap-3 sm:gap-8" style={{ opacity: 0 }}>
          {stats.map((st, i) => (
            <div key={st.id} className="glass rounded-[var(--radius-md)] p-3 sm:p-6">
              <Stat value={values[i]} suffix={st.suffix} eyebrow={st.eyebrow} label={st.label} note={st.note} />
            </div>
          ))}
        </div>

        <div ref={cta} className="mt-8 flex flex-col items-center text-center sm:mt-10" style={{ opacity: 0, pointerEvents: "none" }}>
          <h2 className="font-display text-[clamp(1.9rem,5vw,3.6rem)] font-semibold leading-[1.05] tracking-tight" style={{ textShadow: "0 2px 40px rgba(6,11,26,0.95)" }}>
            {storyCopy.live.line}
          </h2>
          <p className="mt-3 font-display text-base text-cyan sm:text-lg">Turning ideas into reality</p>
          <div className="mt-6">
            <Magnetic>
              <Link href="/contact" className="btn btn-primary !px-8 !py-4 text-base">
                Tell us your idea <ArrowRight />
              </Link>
            </Magnetic>
          </div>
        </div>
      </div>
    </div>
  );
}

function Rail({ sectionId }: { sectionId: string }) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  useStoryFrame((s) => {
    const cur = sceneAt(s.smooth);
    SCENE_ORDER.forEach((id, i) => {
      const el = refs.current[i];
      if (!el) return;
      const active = id === cur;
      el.dataset.active = active ? "true" : "false";
      el.setAttribute("aria-current", active ? "step" : "false");
    });
  });
  function go(id: SceneId) {
    const section = document.getElementById(sectionId);
    if (!section) return;
    const top = section.getBoundingClientRect().top + window.scrollY;
    const range = section.offsetHeight - window.innerHeight;
    const target = top + range * (SCENES[id][0] + 0.004);
    const lenis = window.__lenis;
    if (lenis) lenis.scrollTo(target, { duration: 1.6 });
    else window.scrollTo({ top: target, behavior: "smooth" });
  }
  return (
    <nav aria-label="Story scenes" className="pointer-events-auto absolute right-3 top-1/2 z-10 hidden -translate-y-1/2 flex-col gap-3 sm:right-6 md:flex">
      {SCENE_ORDER.map((id, i) => (
        <button
          key={id}
          ref={(el) => void (refs.current[i] = el)}
          type="button"
          onClick={() => go(id)}
          className="group relative flex h-7 w-7 items-center justify-center"
          aria-label={`Go to scene ${i + 1}: ${SCENE_LABELS[id]}`}
        >
          <span className="pointer-events-none absolute right-9 whitespace-nowrap rounded-full border border-line bg-bg/80 px-3 py-1 font-mono text-[0.68rem] uppercase tracking-[0.12em] text-text opacity-0 backdrop-blur transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
            {SCENE_LABELS[id]}
          </span>
          <i
            aria-hidden
            className="block h-2.5 w-2.5 rotate-45 border border-line-strong bg-transparent transition-all duration-300 group-data-[active=true]:h-3.5 group-data-[active=true]:w-3.5 group-data-[active=true]:border-transparent group-data-[active=true]:bg-(image:--brand-gradient) group-data-[active=true]:shadow-[0_0_16px_rgba(45,183,219,0.9)]"
          />
        </button>
      ))}
    </nav>
  );
}

function ScrollHint() {
  const ref = useRef<HTMLDivElement>(null);
  useStoryFrame((s) => {
    if (ref.current) ref.current.style.opacity = String(1 - clamp01(s.smooth / 0.02));
  });
  return (
    <div ref={ref} aria-hidden className="pointer-events-none absolute bottom-6 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 font-mono text-[0.68rem] uppercase tracking-[0.2em] text-muted">
      Scroll
      <span className="relative block h-9 w-px overflow-hidden bg-line-strong">
        <span className="absolute inset-x-0 top-0 h-3 animate-[ss-scroll_1.6s_ease-in-out_infinite] bg-cyan" />
      </span>
      <style>{`@keyframes ss-scroll { 0% { transform: translateY(-100%); } 100% { transform: translateY(300%); } }`}</style>
    </div>
  );
}

export function StoryOverlay({ panelInScene, sectionId }: { panelInScene: boolean; sectionId: string }) {
  const editorOn = useStoryValue((s) => !panelInScene && s.smooth > 0.19 && s.smooth < 0.41);
  const termOn = useStoryValue((s) => !panelInScene && s.smooth > 0.39 && s.smooth < 0.61);

  // debug readout: add ?debug=1 to the URL
  const dbg = useRef<HTMLDivElement>(null);
  useStoryFrame((s) => {
    if (dbg.current) dbg.current.textContent = `progress ${s.progress.toFixed(3)} · smooth ${s.smooth.toFixed(3)} · scene ${sceneAt(s.smooth)} · strikes ${s.strikeCount}`;
  });
  const [debug, setDebug] = useState(false);
  useEffect(() => setDebug(new URLSearchParams(window.location.search).has("debug")), []);

  useEffect(() => () => cityActive.set(null), []);

  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      {/* legibility scrim for the copy */}
      <div aria-hidden className="absolute inset-0" style={{ background: "radial-gradient(70% 55% at 0% 100%, rgba(6,11,26,0.78) 0%, transparent 70%), radial-gradient(60% 40% at 0% 0%, rgba(6,11,26,0.6) 0%, transparent 70%)" }} />

      {scene1Variant === "factory" ? (
        <>
          <FloorTags />
          <FloorCopy />
        </>
      ) : (
        <SceneCopy id="chaos" position="bottom-[11vh] left-[var(--spacing-gutter)]" />
      )}
      <SceneCopy id="forge" position="bottom-[9vh] left-[var(--spacing-gutter)]" />
      <SceneCopy id="build" position="bottom-[8vh] left-[var(--spacing-gutter)]" />
      <SceneCopy id="city" position="left-[var(--spacing-gutter)] top-[18vh]" />

      {editorOn && (
        <div className="absolute inset-x-0 top-[17vh] flex justify-center px-3">
          <CodeEditorPanel variant="overlay" />
        </div>
      )}
      {termOn && (
        <div className="absolute inset-x-0 top-[17vh] flex justify-center px-3">
          <TerminalPanel variant="overlay" />
        </div>
      )}

      <CityCard />
      <LiveLayer />
      <Rail sectionId={sectionId} />
      <ScrollHint />

      {debug && <div ref={dbg} className="absolute left-3 top-20 rounded bg-black/70 px-2 py-1 font-mono text-[11px] text-hot" />}
    </div>
  );
}
