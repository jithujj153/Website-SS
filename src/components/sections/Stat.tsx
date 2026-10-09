import type { ReactNode } from "react";

/** One proof-point tile. Presentational: the caller supplies the (possibly animating) number. */
export function Stat({
  value,
  suffix,
  eyebrow,
  label,
  note,
  className = "",
  ariaLabel,
}: {
  value: ReactNode;
  suffix: string;
  eyebrow?: string;
  label?: string;
  note?: string;
  className?: string;
  ariaLabel?: string;
}) {
  return (
    <div className={`flex flex-col ${className}`} aria-label={ariaLabel} role={ariaLabel ? "group" : undefined}>
      {eyebrow ? <p className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-muted sm:text-xs">{eyebrow}</p> : <span className="h-0 sm:h-[1.05rem]" />}
      <p className="font-display text-[clamp(2.4rem,6vw,4.4rem)] font-semibold leading-none tracking-tight">
        <span className="grad-text">{value}</span>
        <span className="grad-text">{suffix}</span>
      </p>
      {label && <p className="mt-2 text-sm text-text sm:text-base">{label}</p>}
      {note && <p className="mt-1 text-xs text-muted">{note}</p>}
    </div>
  );
}
