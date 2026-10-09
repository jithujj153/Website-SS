"use client";

import { useEffect, useRef, useState } from "react";
import { story, subscribeFrame, type StoryState } from "./store";

/** Run `fn` every story frame (DOM-direct updates, no React renders). */
export function useStoryFrame(fn: (s: StoryState, dt: number, now: number) => void) {
  const ref = useRef(fn);
  ref.current = fn;
  useEffect(() => subscribeFrame((dt, now) => ref.current(story, dt, now)), []);
}

/**
 * Subscribe a component to a derived primitive of the story state.
 * Re-renders only when the selected value changes (e.g. the number of typed characters).
 */
export function useStoryValue<T extends string | number | boolean>(selector: (s: StoryState) => T): T {
  const [value, setValue] = useState<T>(() => selector(story));
  const last = useRef(value);
  const sel = useRef(selector);
  sel.current = selector;
  useEffect(
    () =>
      subscribeFrame(() => {
        const v = sel.current(story);
        if (v !== last.current) {
          last.current = v;
          setValue(v);
        }
      }),
    [],
  );
  return value;
}

export interface Capabilities {
  mode: "pending" | "3d" | "static";
  mobile: boolean;
  tier: 0 | 1 | 2;
  reason?: string;
}

function hasWebGL(): boolean {
  try {
    const c = document.createElement("canvas");
    return Boolean(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl")));
  } catch {
    return false;
  }
}

/** Decide between the 3D story and the illustrated static story. */
export function detectCapabilities(): Capabilities {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mobile = window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 768;
  let forced: string | null = null;
  try {
    forced = localStorage.getItem("ss-story-mode");
  } catch {}
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  const mem = nav.deviceMemory ?? 8;
  const tier: 0 | 1 | 2 = mobile ? 0 : mem >= 8 ? 2 : 1;
  if (forced === "static") return { mode: "static", mobile, tier, reason: "chosen" };
  if (reduce) return { mode: "static", mobile, tier, reason: "reduced-motion" };
  if (!hasWebGL()) return { mode: "static", mobile, tier, reason: "no-webgl" };
  if (nav.connection?.saveData) return { mode: "static", mobile, tier, reason: "save-data" };
  return { mode: "3d", mobile, tier };
}
