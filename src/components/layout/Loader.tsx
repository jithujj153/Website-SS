"use client";

import { useEffect, useState } from "react";
import { MARK_PATH, GRADIENT, LOGO_BLUE, LOGO_CYAN } from "@/components/brand/logo-data";
import { Logo } from "@/components/brand/Logo";

const [LEFT, RIGHT] = MARK_PATH.split("Z").filter(Boolean).map((p) => `${p}Z`);
const MIN_MS = 2700;

/**
 * SCENE 0: LOADER.
 * Black screen > a spark strikes > the diamond frame draws > the two S strokes slide in and lock >
 * the gradient sweeps across > the wordmark fades in. The page renders (and is readable) underneath;
 * the loader only covers it for the first visit in a session and never blocks on 3D.
 */
export function Loader() {
  const [state, setState] = useState<"show" | "out" | "gone">("show");

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem("ss-loaded") === "1";
    } catch {}
    if (seen) {
      setState("gone");
      return;
    }
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const min = reduce ? 400 : MIN_MS;
    const start = performance.now();
    document.documentElement.style.overflow = "hidden";
    let finished = false;
    const timers: ReturnType<typeof setTimeout>[] = [];

    const finish = () => {
      if (finished) return;
      finished = true;
      const wait = Math.max(0, min - (performance.now() - start));
      timers.push(
        setTimeout(() => {
          setState("out");
          document.documentElement.style.overflow = "";
          try {
            sessionStorage.setItem("ss-loaded", "1");
          } catch {}
          timers.push(setTimeout(() => setState("gone"), 800));
        }, wait),
      );
    };

    if (document.readyState === "complete") finish();
    else window.addEventListener("load", finish, { once: true });
    timers.push(setTimeout(finish, 6000)); // never hold the page hostage

    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener("load", finish);
      document.documentElement.style.overflow = "";
    };
  }, []);

  if (state === "gone") return null;

  const rays = Array.from({ length: 10 }, (_, i) => {
    const a = (i / 10) * Math.PI * 2 + 0.3;
    const r1 = 7, r2 = 16 + (i % 3) * 7;
    return { x1: 62 + Math.cos(a) * r1, y1: 60 + Math.sin(a) * r1, x2: 62 + Math.cos(a) * r2, y2: 60 + Math.sin(a) * r2 };
  });

  return (
    <>
      {/* returning visitors skip the loader with no flash */}
      <script dangerouslySetInnerHTML={{ __html: "try{if(sessionStorage.getItem('ss-loaded')==='1')document.documentElement.classList.add('ss-skip-loader')}catch(e){}" }} />
      <div
        className={`ss-loader fixed inset-0 z-[200] grid place-items-center bg-black transition-opacity duration-700 ${state === "out" ? "pointer-events-none opacity-0" : "opacity-100"}`}
        role="status"
      >
        <span className="sr-only">Loading System-Smiths</span>
        <div className="flex flex-col items-center">
          <svg viewBox="-30 -30 184 180" className="h-[min(38vw,190px)] w-[min(38vw,190px)] overflow-visible" aria-hidden>
            <defs>
              <linearGradient id="ssl-g" gradientUnits="userSpaceOnUse" x1={GRADIENT.x1} y1={GRADIENT.y1} x2={GRADIENT.x2} y2={GRADIENT.y2}>
                <stop offset="0" stopColor={LOGO_CYAN} />
                <stop offset="1" stopColor={LOGO_BLUE} />
              </linearGradient>
              <clipPath id="ssl-clip">
                <path d={MARK_PATH} />
              </clipPath>
              <linearGradient id="ssl-sheen" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#fff" stopOpacity="0" />
                <stop offset="0.5" stopColor="#d9fbff" stopOpacity="0.95" />
                <stop offset="1" stopColor="#fff" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* the spark strike */}
            <g className="ss-spark" style={{ transformOrigin: "62px 60px" }}>
              <circle cx="62" cy="60" r="4" fill="#d9fbff" />
              {rays.map((r, i) => (
                <line key={i} x1={r.x1} y1={r.y1} x2={r.x2} y2={r.y2} stroke="#d9fbff" strokeWidth="1.6" strokeLinecap="round" />
              ))}
            </g>

            {/* diamond frame draws itself */}
            <path className="ss-frame" d="M62 -17L141 60L62 137L-17 60Z" pathLength={1} fill="none" stroke="#2db7db" strokeWidth="1.4" />

            {/* the two S strokes slide in and lock */}
            <path className="ss-left" d={LEFT} fill="#d9fbff" />
            <path className="ss-right" d={RIGHT} fill="#d9fbff" />

            {/* gradient settles over the white-hot metal */}
            <g className="ss-grad">
              <path d={MARK_PATH} fill="url(#ssl-g)" />
            </g>
            <g clipPath="url(#ssl-clip)">
              <rect className="ss-sheen" x="-70" y="-20" width="46" height="170" fill="url(#ssl-sheen)" transform="skewX(-24)" />
            </g>
          </svg>
          <div className="ss-word mt-7 w-[min(62vw,300px)] text-text">
            <Logo variant="wordmark" className="h-auto w-full" decorative />
          </div>
        </div>
      </div>
      <style>{`
        .ss-skip-loader .ss-loader { display: none !important; }
        .ss-spark { opacity: 0; animation: ss-spark 0.55s ease-out 0.2s both; }
        .ss-frame { stroke-dasharray: 1; stroke-dashoffset: 1; animation: ss-draw 1s cubic-bezier(.65,0,.35,1) 0.3s forwards; }
        .ss-left { opacity: 0; animation: ss-in-l 0.85s cubic-bezier(.2,.9,.2,1.12) 0.9s forwards; }
        .ss-right { opacity: 0; animation: ss-in-r 0.85s cubic-bezier(.2,.9,.2,1.12) 0.9s forwards; }
        .ss-grad { opacity: 0; animation: ss-fade 0.9s ease 1.75s forwards; }
        .ss-sheen { animation: ss-sheen 0.95s cubic-bezier(.5,0,.3,1) 1.7s both; }
        .ss-word { opacity: 0; transform: translateY(8px); animation: ss-word 0.7s ease 2.05s forwards; }
        @keyframes ss-spark { 0% { opacity: 1; transform: scale(0.2); } 100% { opacity: 0; transform: scale(1.7); } }
        @keyframes ss-draw { to { stroke-dashoffset: 0; } }
        @keyframes ss-in-l { 0% { opacity: 0; transform: translateX(-84px); } 100% { opacity: 1; transform: translateX(0); } }
        @keyframes ss-in-r { 0% { opacity: 0; transform: translateX(84px); } 100% { opacity: 1; transform: translateX(0); } }
        @keyframes ss-fade { to { opacity: 1; } }
        @keyframes ss-sheen { 0% { transform: skewX(-24deg) translateX(0); opacity: 0; } 15% { opacity: 1; } 100% { transform: skewX(-24deg) translateX(330px); opacity: 0; } }
        @keyframes ss-word { to { opacity: 1; transform: none; } }
        @media (prefers-reduced-motion: reduce) {
          .ss-spark { display: none; }
          .ss-frame { stroke-dashoffset: 0; animation: none; }
          .ss-left, .ss-right, .ss-grad, .ss-word { opacity: 1; transform: none; animation: none; }
          .ss-sheen { display: none; }
        }
      `}</style>
      <noscript>
        <style>{`.ss-loader { display: none !important; }`}</style>
      </noscript>
    </>
  );
}
