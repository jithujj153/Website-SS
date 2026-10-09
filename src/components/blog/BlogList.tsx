"use client";

import { useMemo, useState } from "react";
import type { PostMeta } from "@/lib/blog-shared";
import { PostCard } from "./PostCard";

/** Category filter + grid. The featured post is rendered by the page above this list. */
export function BlogList({ posts, categories }: { posts: PostMeta[]; categories: string[] }) {
  const [active, setActive] = useState("All");
  const shown = useMemo(() => (active === "All" ? posts : posts.filter((p) => p.category === active)), [active, posts]);

  return (
    <div>
      <div role="group" aria-label="Filter posts by category" className="flex flex-wrap gap-2">
        {["All", ...categories].map((c) => (
          <button
            key={c}
            type="button"
            aria-pressed={active === c}
            onClick={() => setActive(c)}
            data-cursor="hover"
            className={`rounded-full border px-4 py-2 text-sm transition-colors ${active === c ? "border-transparent bg-[image:var(--brand-button)] text-white" : "border-line-strong text-muted hover:text-text"}`}
          >
            {c}
          </button>
        ))}
      </div>
      <p className="sr-only" role="status" aria-live="polite">{shown.length} posts shown</p>
      <ul className="mt-8 grid gap-5 md:grid-cols-2">
        {shown.map((p) => (
          <li key={p.slug}><PostCard post={p} /></li>
        ))}
      </ul>
    </div>
  );
}
