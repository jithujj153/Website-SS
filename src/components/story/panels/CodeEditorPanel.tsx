"use client";

import { useRef, type ReactNode } from "react";
import { BEATS, remap, windowed } from "@/story/ranges";
import { useStoryFrame, useStoryValue } from "@/story/hooks";
import { Check } from "@/components/ui/icons";
import { PanelChrome } from "./PanelChrome";
import { scene1Variant } from "@/config/site";
import { FORGE_BUBBLES, FORGE_ENDS, FORGE_FIELDS } from "@/story/floor-layout";

/**
 * The glowing code editor on the anvil (SCENE 2). It is real DOM text so it stays sharp and selectable:
 * code types in as you scroll, an AI ghost-text suggestion appears, and is accepted (Tab).
 * Scroll-driven, so scrolling back un-types it.
 */

const TYPED_LINES = [
  "// bills, receipts and chats in. one system out.",
  'import { forge } from "@smiths/core";',
  "",
  "export const operations = forge({",
  '  intake: ["bills", "receipts", "chat", "sheets"],',
  '  clean: "duplicates, typos, missing totals",',
];
const GHOST_LINE = '  run: "stock, billing, approvals, alerts",';
const CLOSE_LINE = "});";
const TOTAL = TYPED_LINES.join("\n").length;

/** factory variant: each bubble that lands on the anvil types one line of the system */
const FACTORY_HEAD = ["// the floor's questions in. one system out.", 'import { forge } from "@smiths/core";', "", "export const floor = forge({"];
const FACTORY_FIELDS = FORGE_BUBBLES.map((b, i) => ({ text: `  ${FORGE_FIELDS[b.id] ?? b.id}: ${b.code},`, end: Math.round(FORGE_ENDS[i] * 200) }));
const FACTORY_GHOST = "  alerts: notifyOnDelay(),";

function highlight(line: string): ReactNode {
  if (line.startsWith("//")) return <span style={{ color: "#6f86ad" }}>{line}</span>;
  const parts = line.split(/("(?:[^"\\]|\\.)*")/g);
  return parts.map((part, i) => {
    if (part.startsWith('"')) return <span key={i} style={{ color: "#7fe3ff" }}>{part}</span>;
    return (
      <span key={i}>
        {part.split(/\b(import|from|export|const)\b/g).map((t, j) =>
          /^(import|from|export|const)$/.test(t) ? (
            <span key={j} style={{ color: "#8ea6ff" }}>{t}</span>
          ) : (
            <span key={j} style={{ color: "#eaf2ff" }}>{t}</span>
          ),
        )}
      </span>
    );
  });
}

export function CodeEditorPanel({ variant = "scene" }: { variant?: "scene" | "overlay" }) {
  const root = useRef<HTMLDivElement>(null);
  // one integer "tick" (0..200) drives everything, so React re-renders at most ~200 times across the scene
  const t = useStoryValue((s) => Math.floor(remap(s.smooth, BEATS.editorStart, BEATS.editorEnd) * 200));

  useStoryFrame((s) => {
    if (!root.current) return;
    root.current.style.opacity = String(windowed(s.smooth, 0.202, 0.396, 0.022));
  });

  const factory = scene1Variant === "factory";
  // timeline in ticks: factory lines land as each bubble is forged; the ghost suggestion follows the last one
  const T = factory ? { ghost: 160, accept: 172, close: 176, closeEnd: 188, saved: 192 } : { ghost: 136, accept: 160, close: 168, closeEnd: 184, saved: 190 };
  const ghostLine = factory ? FACTORY_GHOST : GHOST_LINE;
  const ghostShown = t >= T.ghost;
  const accepted = t >= T.accept;
  const closeTyped = t >= T.close ? Math.round(remap(t, T.close, T.closeEnd) * CLOSE_LINE.length) : 0;
  const saved = t >= T.saved;

  const rows: { n: number; node: ReactNode }[] = [];
  if (factory) {
    const head = FACTORY_HEAD.join("\n");
    head
      .slice(0, Math.round(remap(t, 4, 44) * head.length))
      .split("\n")
      .forEach((l) => rows.push({ n: rows.length + 1, node: highlight(l) }));
    if (rows.length === FACTORY_HEAD.length) {
      for (const fld of FACTORY_FIELDS) {
        const c = Math.round(remap(t, fld.end - 10, fld.end + 2) * fld.text.length);
        if (c > 0) rows.push({ n: rows.length + 1, node: highlight(fld.text.slice(0, c)) });
      }
    }
  } else {
    const typedCount = Math.round(remap(t, 8, 132) * TOTAL);
    TYPED_LINES.join("\n")
      .slice(0, typedCount)
      .split("\n")
      .forEach((l) => rows.push({ n: rows.length + 1, node: highlight(l) }));
  }
  const caretLine = rows.length;
  if (ghostShown) {
    rows.push({
      n: rows.length + 1,
      node: accepted ? (
        highlight(ghostLine)
      ) : (
        <span style={{ color: "#8fa3c4", opacity: 0.55, fontStyle: "italic" }}>{ghostLine}</span>
      ),
    });
  }
  if (closeTyped > 0) rows.push({ n: rows.length + 1, node: highlight(CLOSE_LINE.slice(0, closeTyped)) });

  return (
    <div
      ref={root}
      style={variant === "scene" ? { width: 560, height: 350, opacity: 0 } : { width: "min(92vw, 560px)", opacity: 0 }}
    >
      <PanelChrome
        className="h-full"
        title={factory ? "floor.ts" : "operations.ts"}
        right={
          <span className="flex items-center gap-2 text-[11px]">
            {ghostShown && !accepted && (
              <span className="rounded-full border px-2 py-0.5" style={{ borderColor: "rgba(45,183,219,0.5)", color: "#7fe3ff" }}>
                AI suggestion · Tab
              </span>
            )}
            {accepted && t < T.closeEnd - 6 && (
              <span className="flex items-center gap-1 rounded-full border px-2 py-0.5" style={{ borderColor: "rgba(61,220,151,0.5)", color: "#3ddc97" }}>
                <Check size={11} /> accepted
              </span>
            )}
          </span>
        }
        footer={
          <>
            <span>TypeScript</span>
            <span>UTF-8</span>
            <span className="ml-auto flex items-center gap-1.5">
              {saved ? (
                <span className="flex items-center gap-1" style={{ color: "#3ddc97" }}>
                  <Check size={12} /> saved
                </span>
              ) : (
                <span>AI-assisted</span>
              )}
            </span>
          </>
        }
      >
        <pre className="m-0 px-4 py-4 text-[14px] leading-[1.75]" style={{ fontFamily: "inherit" }} aria-label={factory ? "Code being written: a forge function that turns the floor manager\u2019s questions into trackOrders, syncInventory, logQC and machineStatus." : "Code being written: a forge function that takes in bills, receipts, chats and sheets and runs the business operations system."}>
          {rows.map((r, i) => (
            <div key={r.n} className="flex">
              <span className="mr-4 inline-block w-4 shrink-0 select-none text-right" style={{ color: "#4a5d85" }}>
                {r.n}
              </span>
              <span className="whitespace-pre">
                {r.node}
                {i === rows.length - 1 && !saved && caretLine >= 0 && <span className="caret" aria-hidden />}
              </span>
            </div>
          ))}
        </pre>
      </PanelChrome>
    </div>
  );
}
