import Link from "next/link";
import { products } from "@/config/content";
import { Reveal } from "@/components/ui/Reveal";
import { Check, ArrowRight } from "@/components/ui/icons";
import { Magnetic } from "@/components/ui/Magnetic";
import { ProductMockup } from "@/components/products/ProductMockup";

export function ProductsShowcase() {
  return (
    <section id="products" aria-labelledby="products-h" className="relative bg-surface/40 py-[var(--spacing-section)]">
      <div className="container-site">
        <Reveal>
          <p className="eyebrow">Our products</p>
          <h2 id="products-h" className="mt-5 max-w-3xl font-display text-[clamp(2rem,4.6vw,3.6rem)] font-semibold">
            Ready-to-run, <span className="grad-text">then tailored to you.</span>
          </h2>
          <p className="mt-5 max-w-2xl text-lg text-muted">Four SaaS products built from the same forge. Deploy something proven, then shape it to your operation.</p>
        </Reveal>
        <div className="mt-16 space-y-20 lg:space-y-28">
          {products.map((p, i) => (
            <article key={p.slug} id={p.slug} aria-labelledby={`${p.slug}-h`} className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
              <Reveal className={i % 2 ? "lg:order-2" : ""}>
                <p className="font-mono text-xs uppercase tracking-[0.16em] text-cyan">{p.audience}</p>
                <h3 id={`${p.slug}-h`} className="mt-3 font-display text-[clamp(1.7rem,3.2vw,2.5rem)] font-semibold">{p.name}</h3>
                <p className="mt-3 text-lg text-text">{p.tagline}</p>
                <p className="mt-4 max-w-xl text-muted">{p.summary}</p>
                <ul className="mt-6 space-y-2.5">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm text-text">
                      <Check className="mt-0.5 shrink-0 text-cyan" />
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  <Magnetic>
                    <Link href={`/contact?interest=${p.slug}`} className="btn btn-primary">
                      Request demo <ArrowRight />
                    </Link>
                  </Magnetic>
                </div>
              </Reveal>
              <Reveal delay={0.1}>
                <ProductMockup slug={p.slug} />
              </Reveal>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
