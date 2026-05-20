import "server-only";
import fs from "fs";
import path from "path";
import matter from "gray-matter";

export type PostMeta = {
  title: string;
  description: string;
  date: string;
  locale: string;
  slug: string;
  coverImage: string;
  keywords: string[];
};

export type Post = PostMeta & { content: string };

const BLOG_DIR = path.join(process.cwd(), "src/content/blog");

function contentLocale(locale: string): "ar" | "en" {
  return locale === "ar" ? "ar" : "en";
}

export function getPostSlugs(locale: string): string[] {
  const dir = path.join(BLOG_DIR, contentLocale(locale));
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""));
}

export function getPost(slug: string, locale: string): Post | null {
  const filePath = path.join(BLOG_DIR, contentLocale(locale), `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  return { ...(data as PostMeta), slug, content };
}

export function getAllPosts(locale: string): Post[] {
  return getPostSlugs(locale)
    .map((slug) => getPost(slug, locale))
    .filter(Boolean)
    .sort((a, b) => (a!.date < b!.date ? 1 : -1)) as Post[];
}
