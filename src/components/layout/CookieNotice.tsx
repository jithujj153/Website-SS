"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { getConsent, setConsent } from "@/lib/consent";

const GA = process.env.NEXT_PUBLIC_GA_ID;

/**
 * Cookie notice. With no analytics configured (the default) it is an honest "essential storage only"
 * notice with a single acknowledgement. When NEXT_PUBLIC_GA_ID is set it becomes an Accept / Decline choice
 * and analytics only loads after Accept.
 */
export function CookieNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (getConsent() === null) {
      const t = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(t);
    }
  }, []);

  function choose(v: "granted" | "denied" | "ack") {
    setConsent(v);
    setVisible(false);
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.aside
          role="region"
          aria-label="Cookie notice"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="glass fixed bottom-4 left-4 right-4 z-[85] rounded-[var(--radius-lg)] p-5 sm:left-6 sm:right-auto sm:max-w-sm"
        >
          <p className="text-sm leading-relaxed text-muted">
            {GA
              ? "We'd like to use privacy-friendly analytics to see which pages help visitors. Nothing loads unless you accept."
              : "This site uses essential browser storage only (for example, to remember this choice). No tracking or advertising cookies."}
          </p>
          <div className="mt-4 flex gap-3">
            {GA ? (
              <>
                <button type="button" className="btn btn-primary !px-5 !py-2.5 text-sm" onClick={() => choose("granted")}>
                  Accept
                </button>
                <button type="button" className="btn btn-ghost !px-5 !py-2.5 text-sm" onClick={() => choose("denied")}>
                  Decline
                </button>
              </>
            ) : (
              <button type="button" className="btn btn-primary !px-5 !py-2.5 text-sm" onClick={() => choose("ack")}>
                Got it
              </button>
            )}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
