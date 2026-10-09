"use client";

import { useEffect, useRef } from "react";
import { MARK_PATH } from "@/components/brand/logo-data";

/**
 * Custom cursor: the logo's diamond trails the pointer and expands over interactive elements.
 * The native cursor stays visible (nothing is hidden), so this is purely additive.
 * Only mounts on fine pointers without reduced-motion.
 */
export function Cursor() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const el = ref.current;
    if (!fine || reduce || !el) return;

    let tx = -100, ty = -100, x = -100, y = -100, scale = 1, targetScale = 1, raf = 0;
    const move = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      el.style.opacity = "1";
      const t = e.target as HTMLElement | null;
      const interactive = t?.closest("a, button, input, select, textarea, label, [data-cursor]");
      targetScale = interactive ? 1.9 : 1;
    };
    const leave = () => (el.style.opacity = "0");
    const loop = () => {
      x += (tx - x) * 0.18;
      y += (ty - y) * 0.18;
      scale += (targetScale - scale) * 0.14;
      el.style.transform = `translate3d(${x - 11}px, ${y - 11}px, 0) scale(${scale})`;
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerleave", leave);
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", leave);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[95] hidden h-[22px] w-[22px] opacity-0 transition-opacity duration-300 [@media(pointer:fine)]:block"
      style={{ willChange: "transform", filter: "drop-shadow(0 0 8px rgb(45 183 219 / 0.7))" }}
    >
      <svg viewBox="0 0 124 120" width="22" height="22">
        <defs>
          <linearGradient id="cur-g" gradientUnits="userSpaceOnUse" x1="70" y1="4" x2="18" y2="97">
            <stop offset="0" stopColor="#7fe3ff" />
            <stop offset="1" stopColor="#2347c5" />
          </linearGradient>
        </defs>
        <path d={MARK_PATH} fill="url(#cur-g)" />
      </svg>
    </div>
  );
}
