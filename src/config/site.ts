/**
 * Central site configuration.
 *
 * OPTIONAL CONTACT DETAILS
 * Anything left as an empty string is simply not rendered anywhere on the site
 * (no placeholders, no empty rows). Fill a value in and it appears automatically
 * on the Contact page and in the footer. Setting `address` also enables the map embed.
 */
export interface ContactConfig {
  phone: string;
  whatsapp: string;
  city: string;
  address: string;
  hours: string;
  social: Record<"linkedin" | "x" | "instagram" | "github" | "youtube", string>;
}

export const site = {
  name: "System-Smiths",
  legalName: "System-Smiths",
  tagline: "Turning ideas into reality",
  description:
    "System-Smiths is a software and automation company. We build custom business systems for operations-heavy businesses, plus our own ready-to-deploy SaaS products.",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "https://www.system-smiths.com").replace(/\/$/, ""),
  email: "connect@system-smiths.com",

  contact: {
    // ---- fill any of these in to show them on the live site ----
    phone: "", // e.g. "+91 98765 43210"
    whatsapp: "", // digits only incl. country code, e.g. "919876543210"
    city: "", // e.g. "Bengaluru, India"
    address: "", // full postal address; when set, a map embed appears on /contact
    hours: "", // e.g. "Mon-Fri, 9:30 am - 6:30 pm IST"
    social: {
      linkedin: "",
      x: "",
      instagram: "",
      github: "",
      youtube: "",
    },
  } as ContactConfig,
} as const;

export type SiteConfig = typeof site;

export const nav = [
  { href: "/", label: "Home" },
  { href: "/what-we-do", label: "What we do" },
  { href: "/blogs", label: "Blogs" },
  { href: "/contact", label: "Contact us" },
] as const;

/** Returns only the social links that have a value. */
export function activeSocials() {
  const labels: Record<string, string> = {
    linkedin: "LinkedIn",
    x: "X",
    instagram: "Instagram",
    github: "GitHub",
    youtube: "YouTube",
  };
  return Object.entries(site.contact.social)
    .filter(([, url]) => Boolean(url))
    .map(([key, url]) => ({ key, label: labels[key] ?? key, url: url as string }));
}

export function mapEmbedSrc(): string | null {
  const q = site.contact.address || "";
  return q ? `https://www.google.com/maps?q=${encodeURIComponent(q)}&output=embed` : null;
}

/**
 * Scene 1 variant (the opening of the Home story).
 *  - "factory": THE FLOOR, a busy manufacturing hall where the floor manager cannot see what is happening (default)
 *  - "office":  THE MESS, floating bills, ledgers, receipts and chat bubbles (the original)
 * Change it here, or set NEXT_PUBLIC_SCENE1_VARIANT=office in .env.local.
 */
export type Scene1Variant = "office" | "factory";
export const scene1Variant: Scene1Variant = process.env.NEXT_PUBLIC_SCENE1_VARIANT === "office" ? "office" : "factory";
