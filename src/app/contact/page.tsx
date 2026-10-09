import type { Metadata } from "next";
import { site, activeSocials, mapEmbedSrc } from "@/config/site";
import { ContactForm } from "@/components/contact/ContactForm";
import { DiamondGridBg } from "@/components/ui/DiamondGridBg";
import { Diamond } from "@/components/brand/Diamond";

export const metadata: Metadata = {
  title: "Contact us",
  description: "Tell us what you want to run, fix or build. Write to connect@system-smiths.com or use the form and we will reply by email.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  const c = site.contact;
  const socials = activeSocials();
  const map = mapEmbedSrc();
  const wa = c.whatsapp ? `https://wa.me/${c.whatsapp.replace(/\D/g, "")}` : "";

  // Only rows with a value are rendered: nothing placeholder-ish ever reaches the live site.
  const details: { label: string; node: React.ReactNode }[] = [
    { label: "Email", node: <a className="text-text underline-offset-4 hover:underline" href={`mailto:${site.email}`}>{site.email}</a> },
    ...(c.phone ? [{ label: "Phone", node: <a className="text-text underline-offset-4 hover:underline" href={`tel:${c.phone.replace(/[^\d+]/g, "")}`}>{c.phone}</a> }] : []),
    ...(wa ? [{ label: "WhatsApp", node: <a className="text-text underline-offset-4 hover:underline" href={wa} target="_blank" rel="noopener noreferrer">Message us on WhatsApp</a> }] : []),
    ...(c.address || c.city ? [{ label: "Find us", node: <span className="text-text">{c.address || c.city}</span> }] : []),
    ...(c.hours ? [{ label: "Hours", node: <span className="text-text">{c.hours}</span> }] : []),
    ...(socials.length
      ? [{
          label: "Follow",
          node: (
            <span className="flex flex-wrap gap-x-4 gap-y-1">
              {socials.map((s) => (
                <a key={s.key} className="text-text underline-offset-4 hover:underline" href={s.url} target="_blank" rel="noopener noreferrer">{s.label}</a>
              ))}
            </span>
          ),
        }]
      : []),
  ];

  return (
    <div className="relative overflow-hidden">
      <DiamondGridBg />
      <div className="container-site relative pt-[clamp(8rem,16vw,12rem)] pb-[var(--spacing-section)]">
        <p className="eyebrow">Contact us</p>
        <h1 className="mt-6 max-w-4xl font-display text-[clamp(2.6rem,7vw,5.4rem)] font-semibold leading-[1.03]">
          Have an idea? <span className="grad-text">Let&apos;s build it.</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-muted">Tell us what you want to run, fix or build. We reply by email.</p>

        <div className="mt-14 grid gap-10 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-14">
          <ContactForm />
          <aside aria-label="Contact details" className="space-y-8">
            <dl className="space-y-6">
              {details.map((d) => (
                <div key={d.label} className="flex gap-4">
                  <Diamond size={9} className="mt-2.5" />
                  <div>
                    <dt className="font-mono text-xs uppercase tracking-[0.16em] text-muted">{d.label}</dt>
                    <dd className="mt-1 text-lg">{d.node}</dd>
                  </div>
                </div>
              ))}
            </dl>
            <p className="text-sm text-muted">MVP in as little as 2 days. Timelines vary with scope.</p>
            {map && (
              <div className="overflow-hidden rounded-[var(--radius-lg)] border border-line">
                <iframe title="Map showing our location" src={map} className="h-64 w-full border-0 grayscale-[0.4] invert-[0.92] hue-rotate-180" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
