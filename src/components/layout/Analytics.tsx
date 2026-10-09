"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import { getConsent } from "@/lib/consent";

const GA = process.env.NEXT_PUBLIC_GA_ID;

/** GA4, OFF by default: renders nothing unless NEXT_PUBLIC_GA_ID is set AND the visitor accepted. */
export function Analytics() {
  const [on, setOn] = useState(false);

  useEffect(() => {
    if (!GA) return;
    setOn(getConsent() === "granted");
    const handler = () => setOn(getConsent() === "granted");
    window.addEventListener("ss-consent", handler);
    return () => window.removeEventListener("ss-consent", handler);
  }, []);

  if (!GA || !on) return null;
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA}`} strategy="afterInteractive" />
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA}',{anonymize_ip:true});`}
      </Script>
    </>
  );
}
