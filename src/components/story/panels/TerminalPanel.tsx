"use client";

import { useRef } from "react";
import { BEATS, remap, windowed } from "@/story/ranges";
import { useStoryFrame, useStoryValue } from "@/story/hooks";
import { Check } from "@/components/ui/icons";
import { PanelChrome } from "./PanelChrome";

/**
 * The terminal (SCENE 3): our seven services compile one by one with green checks, then "Build passed".
 * DOM text synced to scroll, so it stays sharp and accessible.
 */

const SERVICES = [
  "Workflow Automation",
  "Custom ERP",
  "Platform Migration",
  "Factory Management",
  "Website Development",
  "Inventory Optimization",
  "Automation Platforms",
];
const CMD = "smith build --all";
const SPIN = ["◜", "◝", "◞", "◟"];

export function TerminalPanel({ variant = "scene" }: { variant?: "scene" | "overlay" }) {
  const root = useRef<HTMLDivElement>(null);
  const t = useStoryValue((s) => Math.floor(remap(s.smooth, BEATS.buildLogStart, BEATS.buildLogEnd) * 44));

  useStoryFrame((s) => {
    if (!root.current) return;
    root.current.style.opacity = String(windowed(s.smooth, 0.402, 0.598, 0.022));
  });

  const cmdChars = Math.round(remap(t, 0, 6) * CMD.length);
  const passed = t >= 37;

  return (
    <div ref={root} style={variant === "scene" ? { width: 760, height: 440, opacity: 0 } : { width: "min(92vw, 640px)", opacity: 0 }}>
      <PanelChrome
        className="h-full"
        title="smith-cli  ~/operations"
        right={<span className="text-[11px]" style={{ color: passed ? "#3ddc97" : "#7fe3ff" }}>{passed ? "passed" : "building"}</span>}
      >
        <div className="px-5 py-4 text-[14.5px] leading-[1.9]" role="log" aria-label="Build log: seven services compile one by one, then the build passes.">
          <div>
            <span style={{ color: "#7fe3ff" }}>$</span> <span style={{ color: "#eaf2ff" }}>{CMD.slice(0, cmdChars)}</span>
            {cmdChars < CMD.length && <span className="caret" aria-hidden />}
          </div>
          {t >= 7 && <div style={{ color: "#8fa3c4" }}>compiling 7 services</div>}
          {SERVICES.map((name, i) => {
            const start = 8 + i * 4;
            const done = t >= start + 2;
            if (t < start) return null;
            return (
              <div key={name} className="flex items-baseline">
                <span style={{ color: "#8fa3c4" }} className="w-[3.4rem] shrink-0">
                  [{i + 1}/7]
                </span>
                <span style={{ color: done ? "#eaf2ff" : "#7fe3ff" }}>{name}</span>
                <span className="mx-3 flex-1 translate-y-[-5px] border-b border-dotted" style={{ borderColor: "rgba(255,255,255,0.18)" }} aria-hidden />
                {done ? (
                  <span className="flex items-center" style={{ color: "#3ddc97" }}>
                    <Check size={16} />
                    <span className="sr-only">compiled</span>
                  </span>
                ) : (
                  <span style={{ color: "#7fe3ff" }} aria-hidden>
                    {SPIN[t % 4]}
                  </span>
                )}
              </div>
            );
          })}
          {passed && (
            <div className="mt-3 flex items-center gap-3 text-[22px] font-semibold" style={{ color: "#3ddc97", textShadow: "0 0 24px rgba(61,220,151,0.55)", fontFamily: "var(--font-display)" }}>
              Build passed <Check size={24} />
            </div>
          )}
        </div>
      </PanelChrome>
    </div>
  );
}
