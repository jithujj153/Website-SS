import { useId } from "react";
import {
  GRADIENT,
  LOGO_BLUE,
  LOGO_CYAN,
  MARK_H,
  MARK_PATH,
  MARK_W,
  WORDMARK_INNER,
  WORDMARK_STROKE,
  WORDMARK_W,
} from "./logo-data";

export type LogoVariant =
  | "horizontal" // mark + wordmark side by side (nav, footer)
  | "stacked" // mark above wordmark (matches the supplied logo)
  | "mark" // diamond only, gradient (favicon, loader, cursor)
  | "wordmark" // wordmark only, currentColor
  | "mono" // single colour, stacked, currentColor
  | "mono-mark"; // single colour diamond, currentColor

interface LogoProps {
  variant?: LogoVariant;
  className?: string;
  /** set when the logo is purely decorative (e.g. next to visible text) */
  decorative?: boolean;
  title?: string;
}

/**
 * Vector redraw of the System-Smiths logo.
 * The wordmark uses `currentColor` so the parent controls its colour
 * (light text colour on dark backgrounds by default via `text-text`).
 */
export function Logo({ variant = "horizontal", className, decorative = false, title = "System-Smiths" }: LogoProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const gid = `g${uid}`;
  const wm = WORDMARK_INNER.replaceAll("{{Y}}", `y${uid}`).replaceAll("{{M}}", `m${uid}`);

  const gradient = (
    <linearGradient id={gid} gradientUnits="userSpaceOnUse" x1={GRADIENT.x1} y1={GRADIENT.y1} x2={GRADIENT.x2} y2={GRADIENT.y2}>
      <stop offset="0" stopColor={LOGO_CYAN} />
      <stop offset="1" stopColor={LOGO_BLUE} />
    </linearGradient>
  );
  const clips = (
    <>
      <clipPath id={`y${uid}`}>
        <rect x="-5" y="0" width="80" height="100" />
      </clipPath>
      <clipPath id={`m${uid}`}>
        <rect x="-5" y="0" width="100" height="100" />
      </clipPath>
    </>
  );
  const a11y = decorative
    ? ({ "aria-hidden": true, focusable: false } as const)
    : ({ role: "img", "aria-label": title } as const);

  const wordmark = (scale: number, x: number, y: number) => (
    <g
      transform={`translate(${x} ${y}) scale(${scale})`}
      fill="none"
      stroke="currentColor"
      strokeWidth={WORDMARK_STROKE}
      strokeLinejoin="miter"
      strokeLinecap="butt"
      dangerouslySetInnerHTML={{ __html: wm }}
    />
  );

  if (variant === "mark") {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${MARK_W} ${MARK_H}`} className={className} {...a11y}>
        <defs>{gradient}</defs>
        <path d={MARK_PATH} fill={`url(#${gid})`} />
      </svg>
    );
  }
  if (variant === "mono-mark") {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${MARK_W} ${MARK_H}`} className={className} {...a11y}>
        <path d={MARK_PATH} fill="currentColor" />
      </svg>
    );
  }
  if (variant === "wordmark") {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${WORDMARK_W} 100`} className={className} {...a11y}>
        <defs>{clips}</defs>
        {wordmark(1, 0, 0)}
      </svg>
    );
  }
  if (variant === "stacked" || variant === "mono") {
    const s = 0.25;
    const wmW = WORDMARK_W * s;
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 270 172" className={className} {...a11y}>
        <defs>
          {variant === "stacked" && gradient}
          {clips}
        </defs>
        <path
          d={MARK_PATH}
          fill={variant === "stacked" ? `url(#${gid})` : "currentColor"}
          transform={`translate(${(270 - MARK_W) / 2} 0)`}
        />
        {wordmark(s, (270 - wmW) / 2, 143)}
      </svg>
    );
  }
  // horizontal
  const s = 0.36;
  const width = 154 + WORDMARK_W * s;
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${width} 120`} className={className} {...a11y}>
      <defs>
        {gradient}
        {clips}
      </defs>
      <path d={MARK_PATH} fill={`url(#${gid})`} />
      {wordmark(s, 154, 42)}
    </svg>
  );
}

/**
 * Header / footer lockup: the gradient diamond mark + the name set in real type (Sora) instead of the
 * drawn wordmark, for a cleaner, more professional read at small sizes.
 * `size` is the mark height in px; the type scales with it.
 */
export function LogoLockup({ size = 40, className = "" }: { size?: number; className?: string }) {
  return (
    <span className={`inline-flex items-center ${className}`} style={{ gap: size * 0.32 }}>
      <span style={{ height: size, display: "block" }}><Logo variant="mark" decorative className="h-full w-auto shrink-0" /></span>
      <span
        aria-hidden
        className="font-display font-semibold uppercase leading-none text-text"
        style={{ fontSize: size * 0.4, letterSpacing: "0.2em", fontWeight: 600, whiteSpace: "nowrap" }}
      >
        System<span style={{ color: "var(--color-cyan)", margin: "0 -0.05em 0 0" }}>-</span>Smiths
      </span>
    </span>
  );
}
