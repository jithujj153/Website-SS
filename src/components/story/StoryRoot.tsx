"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { STORY_VH, clamp01 } from "@/story/ranges";
import { resetStory, story, tickStory } from "@/story/store";
import { detectCapabilities, type Capabilities } from "@/story/hooks";
import { cityBuildings, floorCopy, proofPoints, services, storyCopy } from "@/config/content";
import { scene1Variant } from "@/config/site";
import { StoryOverlay } from "./StoryOverlay";
import { StoryFallback } from "./StoryFallback";

const StoryCanvas = dynamic(() => import("./StoryCanvas"), { ssr: false });

const SECTION_ID = "story";

/**
 * HOME STORY ROOT.
 * - 3D mode: a 900vh section with a sticky 100dvh stage. GSAP ScrollTrigger turns scroll into progress (0..1);
 *   a ticker damps it (inertia, with Lenis) and fires hammer strikes. The canvas and DOM overlays both read it.
 * - Static mode (no WebGL, prefers-reduced-motion, save-data): the same story as an
 *   illustrated, non-animated, scene-by-scene page.
 * Real text (the h1, scene copy, stats) is always in the DOM, so the story reads fine with 3D removed.
 */
export function StoryRoot() {
  const [caps, setCaps] = useState<Capabilities>({ mode: "pending", mobile: false, tier: 2 });
  const [panelInScene, setPanelInScene] = useState(true);
  const [inView, setInView] = useState(true);
  const [failed, setFailed] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setCaps(detectCapabilities());
    const on = () => {
      const coarse = window.matchMedia("(pointer: coarse)").matches;
      setPanelInScene(!coarse && window.innerWidth >= 900 && window.innerWidth / window.innerHeight >= 1.15);
    };
    on();
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, []);

  const mode = failed ? "static" : caps.mode;

  useEffect(() => {
    if (mode !== "3d" && mode !== "pending") return;
    const section = sectionRef.current;
    if (!section) return;
    gsap.registerPlugin(ScrollTrigger);

    const params = new URLSearchParams(window.location.search);
    const forced = params.get("p");
    story.frozen = forced !== null;
    resetStory(forced !== null ? clamp01(parseFloat(forced) || 0) : 0);

    const st = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        if (!story.frozen) story.progress = self.progress;
      },
    });
    if (!story.frozen) resetStory(st.progress);

    const tick = (time: number, delta: number) => tickStory(Math.min(delta, 100) / 1000, time / 1000);
    gsap.ticker.add(tick);

    const onMove = (e: PointerEvent) => {
      story.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      story.pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { rootMargin: "240px 0px" });
    io.observe(section);

    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);

    return () => {
      st.kill();
      gsap.ticker.remove(tick);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("load", refresh);
      io.disconnect();
    };
  }, [mode]);

  const restore3d = useCallback(() => {
    try {
      localStorage.removeItem("ss-story-mode");
    } catch {}
    setFailed(false);
    setCaps(detectCapabilities());
  }, []);

  if (mode === "static") {
    return (
      <>
        <h1 className="sr-only">System-Smiths: Turning ideas into reality</h1>
        <StoryFallback onRestore3d={restore3d} canRestore={caps.reason === "chosen"} />
      </>
    );
  }

  return (
    <>
      <h1 className="sr-only">System-Smiths: Turning ideas into reality. Custom software and automation for operations-heavy businesses.</h1>
      <section id={SECTION_ID} ref={sectionRef} aria-label="The System-Smiths story, told as a scroll through a forge" style={{ height: `${STORY_VH}vh` }} className="relative">
        <div className="sticky top-0 h-[100dvh] w-full overflow-hidden bg-bg">
          {/* shown until (and under) the 3D world */}
          <div aria-hidden className="absolute inset-0" style={{ background: "radial-gradient(80% 60% at 70% 30%, rgba(35,71,197,0.28) 0%, transparent 60%), radial-gradient(60% 50% at 20% 80%, rgba(45,183,219,0.12) 0%, transparent 60%), #060b1a" }} />
          {mode === "3d" && <StoryCanvas tier={caps.tier} mobile={caps.mobile} panelInScene={panelInScene} active={inView} onFail={() => setFailed(true)} />}
          <StoryOverlay panelInScene={panelInScene} sectionId={SECTION_ID} />
        </div>

        {/* the whole story as plain text for screen readers and crawlers (the overlay copy is also real DOM text) */}
        <div className="sr-only">
          <ol>
            {scene1Variant === "factory" ? (
              <>
                <li>
                  {floorCopy.beat1} {floorCopy.beat3} {floorCopy.summary} He says: &ldquo;{floorCopy.tablet}&rdquo;
                </li>
                <li>{floorCopy.forge.line} Each question is turned into code on an anvil: trackOrders, syncInventory, logQC and machineStatus, with an AI suggestion accepted along the way.</li>
              </>
            ) : (
              <>
                <li>{storyCopy.chaos.line} Bills, ledgers, receipts, sticky notes, spreadsheets with errors and scattered chat messages.</li>
                <li>{storyCopy.forge.line} Code is written on an anvil, with an AI suggestion accepted along the way.</li>
              </>
            )}
            <li>
              {storyCopy.build.line} Our services compile one by one: {services.map((s) => s.title).join(", ")}. Build passed.
            </li>
            <li>
              {storyCopy.city.line} {cityBuildings.map((b) => `${b.kind}: ${b.name}`).join("; ")}.
            </li>
            <li>
              {storyCopy.live.line} {proofPoints.projects}, {proofPoints.clients}, {proofPoints.mvp}. {proofPoints.mvpNote} Turning ideas into reality.
            </li>
          </ol>
        </div>
      </section>
    </>
  );
}
