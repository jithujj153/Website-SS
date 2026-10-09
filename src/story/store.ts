import { useSyncExternalStore } from "react";
import { strikeWeight } from "./strike";
import type { CityBuildingId } from "@/config/content";

/**
 * Mutable story state shared by the DOM overlays and the 3D scenes.
 * It lives outside React on purpose: it changes every frame and nothing re-renders from it.
 * (Components that need discrete changes use `useStoryValue`.)
 */
export interface StoryState {
  /** raw scroll progress through the story section, 0..1 */
  progress: number;
  /** damped progress that drives everything visual (inertia) */
  smooth: number;
  /** hammer-strike impulse: jumps on each scroll tick, decays quickly */
  impulse: number;
  strikeCount: number;
  /** +1 scrolling down, -1 up */
  direction: number;
  /** pointer in -1..1 (for subtle camera parallax) */
  pointer: { x: number; y: number };
  /** ?p=0.5 debug freeze */
  frozen: boolean;
  hovered: CityBuildingId | null;
}

export const story: StoryState = {
  progress: 0,
  smooth: 0,
  impulse: 0,
  strikeCount: 0,
  direction: 1,
  pointer: { x: 0, y: 0 },
  frozen: false,
  hovered: null,
};

type FrameFn = (dt: number, now: number) => void;
const frameSubs = new Set<FrameFn>();
export function subscribeFrame(fn: FrameFn) {
  frameSubs.add(fn);
  return () => {
    frameSubs.delete(fn);
  };
}

type StrikeFn = (power: number) => void;
const strikeSubs = new Set<StrikeFn>();
/** Subscribe to hammer strikes (one per scroll "tick"). Returns an unsubscribe fn. */
export function onStrike(fn: StrikeFn) {
  strikeSubs.add(fn);
  return () => {
    strikeSubs.delete(fn);
  };
}
/** Fire a strike manually (used by the city when a building deploys). */
export function emitStrike(power: number) {
  strikeSubs.forEach((f) => f(power));
}

const TICKS = 72; // scroll "ticks" across the whole story: about one hammer strike per 12.5vh
let lastTick = -1;

/** Reset transient state when the story section (re)mounts. */
export function resetStory(progress = 0) {
  story.progress = progress;
  story.smooth = progress;
  story.impulse = 0;
  story.strikeCount = 0;
  story.direction = 1;
  story.hovered = null;
  lastTick = -1;
}

/** Advance the story one frame. Called from the GSAP ticker (see StoryRoot). */
export function tickStory(dt: number, now: number) {
  const target = story.progress;
  const k = 1 - Math.exp(-dt * 6.5);
  const prev = story.smooth;
  story.smooth += (target - story.smooth) * k;
  if (Math.abs(target - story.smooth) < 0.00005) story.smooth = target;
  const d = story.smooth - prev;
  if (Math.abs(d) > 1e-6) story.direction = d > 0 ? 1 : -1;

  const idx = Math.floor(story.smooth * TICKS);
  if (lastTick === -1) lastTick = idx;
  if (idx !== lastTick) {
    lastTick = idx;
    const power = strikeWeight(story.smooth);
    story.impulse = Math.min(1.25, story.impulse + power);
    story.strikeCount++;
    strikeSubs.forEach((f) => f(power));
  }
  story.impulse *= Math.exp(-dt * 9);
  if (story.impulse < 0.001) story.impulse = 0;

  frameSubs.forEach((f) => f(dt, now));
}

/* ---------------------------------------------------------------------------
   Active city building (hover on desktop, tap on mobile). A tiny external store
   so the 3D scene (writer) and the DOM card in the overlay (reader) stay in sync.
--------------------------------------------------------------------------- */

let activeBuilding: CityBuildingId | null = null;
const activeSubs = new Set<() => void>();
let clearTimer: ReturnType<typeof setTimeout> | null = null;

export const cityActive = {
  get: () => activeBuilding,
  set(id: CityBuildingId | null) {
    if (clearTimer) {
      clearTimeout(clearTimer);
      clearTimer = null;
    }
    if (id === activeBuilding) return;
    activeBuilding = id;
    story.hovered = id;
    activeSubs.forEach((f) => f());
  },
  /** leave with a short grace period so the pointer can travel from the building to its card */
  clearSoon(ms = 260) {
    if (clearTimer) clearTimeout(clearTimer);
    clearTimer = setTimeout(() => cityActive.set(null), ms);
  },
  cancelClear() {
    if (clearTimer) {
      clearTimeout(clearTimer);
      clearTimer = null;
    }
  },
  subscribe(fn: () => void) {
    activeSubs.add(fn);
    return () => {
      activeSubs.delete(fn);
    };
  },
};

export function useCityActive(): CityBuildingId | null {
  return useSyncExternalStore(cityActive.subscribe, cityActive.get, () => null);
}
