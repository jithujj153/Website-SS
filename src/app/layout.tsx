import type { Metadata, Viewport } from "next";
import "@fontsource-variable/sora";
import "@fontsource-variable/inter";
import "@fontsource-variable/jetbrains-mono";
import "./globals.css";
import { site, activeSocials } from "@/config/site";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { CookieNotice } from "@/components/layout/CookieNotice";
import { Analytics } from "@/components/layout/Analytics";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name} | ${site.tagline}`, template: `%s | ${site.name}` },
  description: site.description,
  applicationName: site.name,
  keywords: ["custom software", "business automation", "ERP", "workflow automation", "SaaS", "Fuel Pump ERP", "HRMS", "restaurant billing", "school management", "factory management system"],
  authors: [{ name: site.name }],
  alternates: { canonical: "/" },
  icons: { icon: [{ url: "/logo/favicon.svg", type: "image/svg+xml" }], apple: "/logo/favicon.svg" },
  openGraph: {
    type: "website",
    siteName: site.name,
    title: `${site.name} | ${site.tagline}`,
    description: site.description,
    url: site.url,
    locale: "en",
  },
  twitter: { card: "summary_large_image", title: `${site.name} | ${site.tagline}`, description: site.description },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#060b1a",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: site.name,
  url: site.url,
  logo: `${site.url}/logo/logo-mark.svg`,
  slogan: site.tagline,
  description: site.description,
  email: site.email,
  contactPoint: [{ "@type": "ContactPoint", contactType: "sales", email: site.email, ...(site.contact.phone ? { telephone: site.contact.phone } : {}) }],
  ...(activeSocials().length ? { sameAs: activeSocials().map((s) => s.url) } : {}),
  ...(site.contact.address ? { address: { "@type": "PostalAddress", streetAddress: site.contact.address } } : {}),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-md focus:bg-surface focus:px-4 focus:py-2 focus:text-text">
          Skip to content
        </a>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
        <SmoothScroll>
          <Nav />
          <main id="main">{children}</main>
          <Footer />
        </SmoothScroll>
        <CookieNotice />
        <Analytics />
      </body>
    </html>
  );
}
