import Link from "next/link";
import { formatDate, type PostMeta } from "@/lib/blog-shared";
import { Diamond } from "@/components/brand/Diamond";

export function PostCard({ post, large = false }: { post: PostMeta; large?: boolean }) {
  return (
    <article className={`panel group relative flex h-full flex-col rounded-[var(--radius-lg)] p-7 transition-transform duration-500 hover:-translate-y-1 ${large ? "sm:p-10" : ""}`}>
      <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.14em] text-cyan">
        <Diamond size={7} />
        {post.category}
      </div>
      <h3 className={`mt-5 font-display font-semibold ${large ? "text-[clamp(1.7rem,3.4vw,2.6rem)]" : "text-xl"}`}>
        <Link href={`/blogs/${post.slug}`} className="after:absolute after:inset-0 after:content-['']" data-cursor="hover">
          {post.title}
        </Link>
      </h3>
      <p className="mt-4 text-muted">{post.excerpt}</p>
      <p className="mt-auto pt-6 text-xs text-muted">
        <time dateTime={post.date}>{formatDate(post.date)}</time> · {post.readingMinutes} min read
      </p>
    </article>
  );
}
