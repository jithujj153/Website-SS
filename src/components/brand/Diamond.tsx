import type { CSSProperties } from "react";

/** The logo's diamond as a tiny reusable glyph (bullets, dividers, markers). */
export function Diamond({ size = 10, className = "", glow = false, style }: { size?: number; className?: string; glow?: boolean; style?: CSSProperties }) {
  return (
    <i
      aria-hidden
      className={className}
      style={{
        display: "inline-block",
        width: size,
        height: size,
        background: "var(--brand-gradient)",
        transform: "rotate(45deg)",
        boxShadow: glow ? "0 0 18px rgb(45 183 219 / 0.7)" : undefined,
        flex: "none",
        ...style,
      }}
    />
  );
}

export function DiamondDivider({ className = "" }: { className?: string }) {
  return (
    <div className={`divider-diamond ${className}`} role="presentation">
      <i />
    </div>
  );
}
