import { stats } from "@/config/content";
import { Stat } from "./Stat";

/** Compact, static stat row (Home, below the story). Same wording as the animated counters. */
export function StatRow({ className = "" }: { className?: string }) {
  return (
    <section aria-label="System-Smiths in numbers" className={className}>
      <div className="grid gap-8 rounded-[var(--radius-xl)] border border-line bg-surface/60 p-8 sm:grid-cols-3 sm:gap-6 sm:p-10">
        {stats.map((s) => (
          <Stat key={s.id} value={s.value} suffix={s.suffix} eyebrow={s.eyebrow || undefined} label={s.label || undefined} note={s.note || undefined} />
        ))}
      </div>
    </section>
  );
}
