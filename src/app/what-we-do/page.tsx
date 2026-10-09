import type { Metadata } from "next";
import Link from "next/link";
import { ServicesGrid } from "@/components/sections/ServicesGrid";
import { ProductsShowcase } from "@/components/sections/ProductsShowcase";
import { HowWeWork } from "@/components/sections/HowWeWork";
import { StatRow } from "@/components/sections/StatRow";
import { DiamondGridBg } from "@/components/ui/DiamondGridBg";
import { ArrowRight } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "What we do",
  description: "Seven services for operations-heavy businesses and four ready-to-deploy products: Fuel Pump ERP, Student Relationship Management, Restaurant & Cafe Billing and HRMS.",
  alternates: { canonical: "/what-we-do" },
};

export default function WhatWeDoPage() {
  return (
    <>
      <header className="relative overflow-hidden pt-[clamp(8rem,16vw,12rem)] pb-8">
        <DiamondGridBg className="opacity-60" />
        <div className="container-site relative">
          <p className="eyebrow">What we do</p>
          <h1 className="mt-6 max-w-4xl font-display text-[clamp(2.6rem,7vw,5.6rem)] font-semibold leading-[1.03]">
            We build the systems <span className="grad-text">that run your business.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted">Custom software when your operation is unique. Ready-to-run products when someone has already solved your problem well.</p>
          <nav aria-label="On this page" className="mt-8 flex flex-wrap gap-3 text-sm">
            <a href="#services" className="btn btn-ghost">Services</a>
            <a href="#products" className="btn btn-ghost">Products</a>
          </nav>
        </div>
      </header>
      <ServicesGrid />
      <ProductsShowcase />
      <HowWeWork />
      <StatRow className="container-site pb-[var(--spacing-section)]" />
      <section className="container-site pb-[var(--spacing-section)]">
        <div className="panel flex flex-col items-start justify-between gap-6 rounded-[var(--radius-xl)] p-8 sm:flex-row sm:items-center sm:p-12">
          <h2 className="max-w-xl font-display text-[clamp(1.6rem,3vw,2.4rem)] font-semibold">Have an idea? Let&apos;s build it.</h2>
          <Link href="/contact" className="btn btn-primary">Start a project <ArrowRight /></Link>
        </div>
      </section>
    </>
  );
}
