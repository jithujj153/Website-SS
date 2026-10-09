import type { ReactNode } from "react";

/** Shared window chrome for the in-scene editor and terminal (diamonds instead of traffic lights). */
export function PanelChrome({
  title,
  right,
  children,
  footer,
  className = "",
  style,
}: {
  title: string;
  right?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`code-font flex flex-col overflow-hidden rounded-[14px] text-left ${className}`}
      style={{
        background: "linear-gradient(180deg, #0b1430 0%, #070d20 100%)",
        border: "1px solid rgba(45,183,219,0.55)",
        boxShadow: "0 0 0 1px rgba(255,255,255,0.04) inset, 0 0 70px rgba(45,183,219,0.28), 0 30px 80px -20px rgba(0,0,0,0.8)",
        ...style,
      }}
    >
      <div className="flex items-center gap-3 border-b px-4 py-2.5" style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}>
        <span className="flex items-center gap-1.5" aria-hidden>
          {["#2db7db", "#2347c5", "#8fa3c4"].map((c) => (
            <i key={c} style={{ width: 9, height: 9, background: c, transform: "rotate(45deg)", display: "inline-block" }} />
          ))}
        </span>
        <span className="text-[12px] tracking-wide" style={{ color: "#8fa3c4" }}>
          {title}
        </span>
        <span className="ml-auto">{right}</span>
      </div>
      <div className="min-h-0 flex-1">{children}</div>
      {footer && (
        <div className="flex items-center gap-3 border-t px-4 py-2 text-[11.5px]" style={{ borderColor: "rgba(255,255,255,0.08)", color: "#8fa3c4", background: "rgba(255,255,255,0.025)" }}>
          {footer}
        </div>
      )}
    </div>
  );
}
