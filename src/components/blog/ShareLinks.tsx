"use client";

import { useState } from "react";

export function ShareLinks({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  const link = "rounded-full border border-line-strong px-4 py-2 text-sm text-muted transition-colors hover:text-text";
  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Share this post">
      <span className="mr-1 font-mono text-xs uppercase tracking-[0.16em] text-muted">Share</span>
      <a className={link} href={`https://www.linkedin.com/sharing/share-offsite/?url=${u}`} target="_blank" rel="noopener noreferrer" data-cursor="hover">LinkedIn</a>
      <a className={link} href={`https://twitter.com/intent/tweet?url=${u}&text=${t}`} target="_blank" rel="noopener noreferrer" data-cursor="hover">X</a>
      <a className={link} href={`mailto:?subject=${t}&body=${u}`} data-cursor="hover">Email</a>
      <button
        type="button"
        className={link}
        data-cursor="hover"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
          } catch {}
        }}
      >
        {copied ? "Link copied" : "Copy link"}
      </button>
    </div>
  );
}
