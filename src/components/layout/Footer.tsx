import Link from "next/link";
import { LogoLockup } from "@/components/brand/Logo";
import { DiamondDivider } from "@/components/brand/Diamond";
import { nav, site, activeSocials } from "@/config/site";
import { products, services } from "@/config/content";

export function Footer() {
  const c = site.contact;
  const socials = activeSocials();
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-[var(--spacing-section)] border-t border-line bg-[#050916]">
      <div className="container-site pt-16">
        <DiamondDivider />
        <div className="mt-14 grid gap-12 md:grid-cols-[1.3fr_1fr_1fr_1.2fr]">
          <div>
            <LogoLockup size={40} />
            <p className="mt-6 max-w-xs font-display text-lg leading-snug text-text">{site.tagline}</p>
            <p className="mt-3 max-w-xs text-sm text-muted">
              Custom business systems and ready-to-deploy SaaS products for operations-heavy businesses.
            </p>
          </div>

          <nav aria-label="Footer">
            <h2 className="eyebrow !text-[0.7rem]">Explore</h2>
            <ul className="mt-5 space-y-3 text-[0.95rem]">
              {nav.map((n) => (
                <li key={n.href}>
                  <Link href={n.href} className="text-muted transition-colors hover:text-text">
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="eyebrow !text-[0.7rem]">Services &amp; products</h2>
            <ul className="mt-5 space-y-3 text-[0.95rem]">
              {services.slice(0, 4).map((s) => (
                <li key={s.slug}>
                  <Link href="/what-we-do#services" className="text-muted transition-colors hover:text-text">
                    {s.short}
                  </Link>
                </li>
              ))}
              {products.slice(0, 2).map((p) => (
                <li key={p.slug}>
                  <Link href="/what-we-do#products" className="text-muted transition-colors hover:text-text">
                    {p.name.length > 30 ? "Restaurant & Cafe Billing" : p.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/what-we-do" className="text-cyan transition-colors hover:text-hot">
                  See everything we do
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="eyebrow !text-[0.7rem]">Get in touch</h2>
            <ul className="mt-5 space-y-3 text-[0.95rem]">
              <li>
                <a href={`mailto:${site.email}`} className="text-text underline decoration-cyan/40 underline-offset-4 transition-colors hover:decoration-cyan">
                  {site.email}
                </a>
              </li>
              {c.phone && (
                <li>
                  <a href={`tel:${c.phone.replace(/[^+\d]/g, "")}`} className="text-muted hover:text-text">
                    {c.phone}
                  </a>
                </li>
              )}
              {c.whatsapp && (
                <li>
                  <a href={`https://wa.me/${c.whatsapp.replace(/\D/g, "")}`} className="text-muted hover:text-text" rel="noopener noreferrer" target="_blank">
                    WhatsApp
                  </a>
                </li>
              )}
              {c.city && <li className="text-muted">{c.city}</li>}
              {c.hours && <li className="text-muted">{c.hours}</li>}
            </ul>
            {socials.length > 0 && (
              <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm">
                {socials.map((s) => (
                  <li key={s.key}>
                    <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-muted hover:text-text">
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-3 border-t border-line py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {year} {site.legalName}. All rights reserved.
          </p>
          <p className="font-mono text-xs tracking-wide">Forged with care. Built to run.</p>
        </div>
      </div>
    </footer>
  );
}
