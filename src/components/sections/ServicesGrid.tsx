import { services } from "@/config/content";
import { Icon } from "@/components/ui/icons";
import { TiltCard } from "@/components/ui/TiltCard";
import { Reveal } from "@/components/ui/Reveal";

export function ServicesGrid() {
  return (
    <section id="services" aria-labelledby="services-h" className="container-site py-[var(--spacing-section)]">
      <Reveal>
        <p className="eyebrow">Services we deliver regularly</p>
        <h2 id="services-h" className="mt-5 max-w-3xl font-display text-[clamp(2rem,4.6vw,3.6rem)] font-semibold">
          Custom systems, built around how you work.
        </h2>
      </Reveal>
      <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((s, i) => (
          <li key={s.slug} className={i === services.length - 1 ? "sm:col-span-2 lg:col-span-1" : ""}>
            <Reveal delay={(i % 3) * 0.06} className="h-full">
              <TiltCard className="panel h-full rounded-[var(--radius-lg)] p-7">
                <span className="grid h-12 w-12 place-items-center rounded-[var(--radius-md)] border border-line-strong bg-bg/60 text-cyan" style={{ transform: "translateZ(30px)" }}>
                  <Icon name={s.icon} />
                </span>
                <h3 className="mt-6 font-display text-xl font-semibold" style={{ transform: "translateZ(24px)" }}>{s.title}</h3>
                <p className="mt-2 text-text">{s.value}</p>
                <p className="mt-3 text-sm text-muted">{s.description}</p>
              </TiltCard>
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  );
}
