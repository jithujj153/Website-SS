"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LogoLockup } from "@/components/brand/Logo";
import { Magnetic } from "@/components/ui/Magnetic";
import { nav } from "@/config/site";

export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // close the mobile menu on navigation / Escape, and lock page scroll while open
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header
      className={`fixed inset-x-0 top-0 z-[80] transition-[background,backdrop-filter,border-color] duration-500 ${
        scrolled || open ? "border-b border-line bg-bg/70 backdrop-blur-xl" : "border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex h-[4.5rem] w-full max-w-[100rem] items-center justify-between px-[clamp(1rem,2.2vw,2.25rem)]">
        <Link href="/" aria-label="System-Smiths home" className="block text-text" data-cursor="hover">
          <LogoLockup size={36} />
          <span className="sr-only">System-Smiths</span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
          {nav.map((item) => {
            const active = isActive(item.href);
            if (item.href === "/contact") return null;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`relative rounded-full px-4 py-2 font-display text-[0.92rem] transition-colors ${
                  active ? "text-text" : "text-muted hover:text-text"
                }`}
              >
                {item.label}
                {active && (
                  <motion.i
                    layoutId="nav-diamond"
                    aria-hidden
                    className="absolute -bottom-[3px] left-1/2 h-[7px] w-[7px] -translate-x-1/2 rotate-45"
                    style={{ background: "var(--brand-gradient)", boxShadow: "0 0 12px rgb(45 183 219 / 0.9)" }}
                  />
                )}
              </Link>
            );
          })}
          <div className="ml-3">
            <Magnetic strength={0.25}>
              <Link href="/contact" className="btn btn-primary !px-5 !py-2.5 text-[0.88rem]" aria-current={isActive("/contact") ? "page" : undefined}>
                Contact us
              </Link>
            </Magnetic>
          </div>
        </nav>

        <button
          type="button"
          className="relative grid h-11 w-11 place-items-center rounded-full border border-line-strong md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((v) => !v)}
        >
          <span className={`absolute h-[2px] w-5 bg-text transition-transform duration-300 ${open ? "rotate-45" : "-translate-y-[5px]"}`} />
          <span className={`absolute h-[2px] w-5 bg-text transition-opacity duration-200 ${open ? "opacity-0" : "opacity-100"}`} />
          <span className={`absolute h-[2px] w-5 bg-text transition-transform duration-300 ${open ? "-rotate-45" : "translate-y-[5px]"}`} />
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-x-0 bottom-0 top-[4.5rem] bg-bg/95 backdrop-blur-xl md:hidden"
          >
            <nav aria-label="Mobile" className="container-site flex h-full flex-col justify-center gap-2 pb-24">
              {nav.map((item, i) => (
                <motion.div key={item.href} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 * i + 0.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
                  <Link
                    href={item.href}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className={`flex items-center gap-4 border-b border-line py-5 font-display text-3xl ${isActive(item.href) ? "grad-text" : "text-text"}`}
                  >
                    <i aria-hidden className="h-2.5 w-2.5 rotate-45" style={{ background: "var(--brand-gradient)" }} />
                    {item.label}
                  </Link>
                </motion.div>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
