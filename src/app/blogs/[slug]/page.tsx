import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import { formatDate, getAllPosts, getPost, getRelated } from "@/lib/blog";
import { site } from "@/config/site";
import { Toc } from "@/components/blog/Toc";
import { ShareLinks } from "@/components/blog/ShareLinks";
import { PostCard } from "@/components/blog/PostCard";
import { ArrowRight } from "@/components/ui/icons";

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blogs/${post.slug}` },
    openGraph: { type: "article", title: post.title, description: post.excerpt, publishedTime: post.date, authors: [post.author], url: `${site.url}/blogs/${post.slug}` },
  };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();
  const related = getRelated(post);
  const url = `${site.url}/blogs/${post.slug}`;

  const ld = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    author: { "@type": "Organization", name: site.name },
    publisher: { "@type": "Organization", name: site.name, logo: { "@type": "ImageObject", url: `${site.url}/logo/logo-mark.svg` } },
    mainEntityOfPage: url,
  };

  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <header className="container-site pt-[clamp(8rem,15vw,11rem)] pb-10">
        <Link href="/blogs" className="text-sm text-muted hover:text-text">← All posts</Link>
        <p className="eyebrow mt-8">{post.category}</p>
        <h1 className="mt-5 max-w-4xl font-display text-[clamp(2.2rem,5.6vw,4.4rem)] font-semibold leading-[1.05]">{post.title}</h1>
        <p className="mt-6 max-w-2xl text-lg text-muted">{post.excerpt}</p>
        <p className="mt-6 text-sm text-muted">
          {post.author} · <time dateTime={post.date}>{formatDate(post.date)}</time> · {post.readingMinutes} min read
        </p>
      </header>

      <div className="container-site grid gap-12 pb-16 lg:grid-cols-[minmax(0,1fr)_16rem] lg:gap-20">
        <div className="min-w-0">
          <div className="prose-ss max-w-[44rem]">
            <MDXRemote source={post.content} options={{ mdxOptions: { remarkPlugins: [remarkGfm], rehypePlugins: [rehypeSlug] } }} />
          </div>
          <div className="mt-14 max-w-[44rem] border-t border-line pt-8">
            <ShareLinks url={url} title={post.title} />
          </div>
        </div>
        <aside className="hidden lg:block">
          <div className="sticky top-28">
            <Toc headings={post.headings} />
          </div>
        </aside>
      </div>

      <section className="container-site pb-[var(--spacing-section)]" aria-labelledby="related-h">
        <div className="panel mb-16 flex flex-col items-start justify-between gap-6 rounded-[var(--radius-xl)] p-8 sm:flex-row sm:items-center sm:p-10">
          <p className="max-w-lg font-display text-2xl font-semibold">Have an idea? Let&apos;s build it.</p>
          <Link href="/contact" className="btn btn-primary">Start a project <ArrowRight /></Link>
        </div>
        <h2 id="related-h" className="font-display text-2xl font-semibold">Related posts</h2>
        <ul className="mt-6 grid gap-5 md:grid-cols-2">
          {related.map((p) => (
            <li key={p.slug}><PostCard post={p} /></li>
          ))}
        </ul>
      </section>
    </article>
  );
}
