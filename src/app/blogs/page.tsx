import type { Metadata } from "next";
import { getAllPosts } from "@/lib/blog";
import { PostCard } from "@/components/blog/PostCard";
import { BlogList } from "@/components/blog/BlogList";
import { DiamondGridBg } from "@/components/ui/DiamondGridBg";

export const metadata: Metadata = {
  title: "Blogs",
  description: "Practical notes from the System-Smiths team on shipping software quickly, reducing downtime and using AI in everyday engineering.",
  alternates: { canonical: "/blogs" },
};

export default function BlogsPage() {
  const all = getAllPosts();
  const featured = all.find((p) => p.featured) ?? all[0];
  const rest = all.filter((p) => p.slug !== featured?.slug);
  const categories = [...new Set(rest.map((p) => p.category))];

  return (
    <>
      <header className="relative overflow-hidden pt-[clamp(8rem,16vw,12rem)] pb-10">
        <DiamondGridBg className="opacity-50" />
        <div className="container-site relative">
          <p className="eyebrow">Blogs</p>
          <h1 className="mt-6 max-w-4xl font-display text-[clamp(2.6rem,7vw,5.4rem)] font-semibold leading-[1.03]">
            Notes from <span className="grad-text">the forge.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted">Practical writing on how we build, ship and support software.</p>
        </div>
      </header>
      <section className="container-site pb-[var(--spacing-section)]">
        {featured && (
          <div className="mb-10">
            <p className="mb-4 font-mono text-xs uppercase tracking-[0.16em] text-muted">Featured</p>
            <PostCard post={featured} large />
          </div>
        )}
        <BlogList posts={rest} categories={categories} />
      </section>
    </>
  );
}
