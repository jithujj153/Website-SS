import type { Metadata } from "next";
import { StoryRoot } from "@/components/story/StoryRoot";
import { Overview } from "@/components/sections/Overview";
import { StatRow } from "@/components/sections/StatRow";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: { absolute: `${site.name} | ${site.tagline}` },
  description: "System-Smiths builds custom business systems and ready-to-run SaaS products for operations-heavy businesses. 40+ projects delivered. MVP in as little as 2 days.",
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <>
      <StoryRoot />
      <Overview />
      <StatRow className="container-site pb-[var(--spacing-section)]" />
    </>
  );
}
