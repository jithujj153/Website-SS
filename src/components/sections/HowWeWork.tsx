import { process } from "@/config/content";
import { Reveal } from "@/components/ui/Reveal";
import { Diamond } from "@/components/brand/Diamond";

export function HowWeWork() {
  return (
    <section aria-labelledby="how-h" className="container-site py-[var(--spacing-section)]">
      <Reveal>
        <p className="eyebrow">How we work</p>
        <h2 id="how-h" className="mt-5 max-w-3xl font-display text-[clamp(2rem,4.6vw,3.6rem)] font-semibold">Five steps, no surprises.</h2>
      </Reveal>
      <ol className="relative mt-14 grid gap-8 md:grid-cols-5 md:gap-4">
        <span aria-hidden className="absolute left-[0.95rem] top-2 hidden h-px w-[calc(100%-2rem)] bg-gradient-to-r from-cyan/60 via-royal/40 to-transparent md:block" style={{ left: "0.7rem" }} />
        {process.map((p, i) => (
          <li key={p.step} className="relative md:pr-4">
            <Reveal delay={i * 0.07}>
              <div className="flex items-center gap-3 md:block">
                <Diamond size={14} glow className="md:mb-6" />
                <div>
                  <p className="font-mono text-xs text-muted">{String(i + 1).padStart(2, "0")}</p>
                  <h3 className="font-display text-xl font-semibold">{p.step}</h3>
                  <p className="mt-2 text-sm text-muted">{p.line}</p>
                </div>
              </div>
            </Reveal>
          </li>
        ))}
      </ol>
    </section>
  );
}
