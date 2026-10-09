import Link from "next/link";
import { overview } from "@/config/content";
import { Reveal } from "@/components/ui/Reveal";
import { Diamond, DiamondDivider } from "@/components/brand/Diamond";
import { ArrowRight } from "@/components/ui/icons";

/** Brief company overview shown on Home after the story. */
export function Overview() {
  return (
    <section aria-labelledby="overview-h" className="relative">
      <DiamondDivider />
      <div className="container-site py-[var(--spacing-section)]">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
          <Reveal>
            <p className="eyebrow">Who we are</p>
            <h2 id="overview-h" className="mt-5 font-display text-[clamp(2rem,4.6vw,3.6rem)] font-semibold">
              {overview.heading}
            </h2>
            <p className="mt-6 max-w-xl text-lg text-muted">{overview.body}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/what-we-do" className="btn btn-primary">
                See what we do <ArrowRight />
              </Link>
              <Link href="/contact" className="btn btn-ghost">Talk to us</Link>
            </div>
          </Reveal>
          <ul className="space-y-6">
            {overview.pillars.map((p, i) => (
              <li key={p.title}>
                <Reveal delay={i * 0.08}>
                  <div className="panel flex gap-4 p-6">
                    <Diamond size={10} className="mt-2" />
                    <div>
                      <h3 className="font-display text-xl font-semibold">{p.title}</h3>
                      <p className="mt-2 text-muted">{p.body}</p>
                    </div>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
