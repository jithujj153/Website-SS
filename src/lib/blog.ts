import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { PostMeta } from "./blog-shared";

export { formatDate } from "./blog-shared";
export type { PostMeta } from "./blog-shared";

const DIR = path.join(process.cwd(), "content", "blog");

export interface Post extends PostMeta {
  content: string;
  headings: { id: string; text: string; level: 2 | 3 }[];
}

/** Same slug algorithm as rehype-slug (github-slugger) for the simple headings we write. */
export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function readingTime(text: string) {
  const words = text.replace(/```[\s\S]*?```/g, " ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

function extractHeadings(content: string) {
  const out: Post["headings"] = [];
  let inCode = false;
  for (const line of content.split("\n")) {
    if (line.startsWith("```")) inCode = !inCode;
    if (inCode) continue;
    const m = /^(##|###)\s+(.+)$/.exec(line);
    if (m) {
      const text = m[2].replace(/[*_`]/g, "").trim();
      out.push({ id: slugify(text), text, level: m[1] === "##" ? 2 : 3 });
    }
  }
  return out;
}

function load(file: string): Post {
  const raw = fs.readFileSync(path.join(DIR, file), "utf8");
  const { data, content } = matter(raw);
  return {
    slug: file.replace(/\.mdx?$/, ""),
    title: String(data.title),
    excerpt: String(data.excerpt),
    date: new Date(data.date).toISOString(),
    category: String(data.category),
    featured: Boolean(data.featured),
    author: String(data.author ?? "The System-Smiths team"),
    readingMinutes: readingTime(content),
    content,
    headings: extractHeadings(content),
  };
}

export function getAllPosts(): Post[] {
  if (!fs.existsSync(DIR)) return [];
  return fs
    .readdirSync(DIR)
    .filter((f) => /\.mdx?$/.test(f))
    .map(load)
    .sort((a, b) => +new Date(b.date) - +new Date(a.date));
}

export function getPost(slug: string): Post | undefined {
  return getAllPosts().find((p) => p.slug === slug);
}

export function getRelated(post: Post, n = 2): Post[] {
  const others = getAllPosts().filter((p) => p.slug !== post.slug);
  return [...others.filter((p) => p.category === post.category), ...others.filter((p) => p.category !== post.category)].slice(0, n);
}

