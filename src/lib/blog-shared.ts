/** Client-safe blog types and helpers. Never import node:fs here: this file is used by client components. */
export interface PostMeta {
  slug: string;
  title: string;
  excerpt: string;
  date: string; // ISO
  category: string;
  featured: boolean;
  readingMinutes: number;
  author: string;
}

export const formatDate = (iso: string) => new Date(iso).toLocaleDateString("en", { year: "numeric", month: "long", day: "numeric" });
