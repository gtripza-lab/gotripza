import { notFound } from "next/navigation";
import Image from "next/image";
import { Calendar, ArrowLeft, ArrowRight } from "lucide-react";
import { MDXRemote } from "next-mdx-remote/rsc";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { getPost, getPostSlugs } from "@/lib/blog";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ArticleJsonLd } from "@/components/JsonLd";
import { BlogSearchCTA } from "@/components/BlogSearchCTA";

export async function generateStaticParams({
  params,
}: {
  params: { locale: string };
}) {
  const { locale } = params;
  if (!isLocale(locale)) return [];
  const slugs = getPostSlugs(locale as Locale);
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { locale: string; slug: string };
}) {
  const post = getPost(params.slug, (params.locale as Locale) ?? "ar");
  if (!post) return {};
  return {
    title: `${post.title} | GoTripza`,
    description: post.description,
    keywords: post.keywords,
    openGraph: {
      title: post.title,
      description: post.description,
      images: post.coverImage ? [{ url: post.coverImage }] : [],
      type: "article",
      publishedTime: post.date,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: { locale: string; slug: string };
}) {
  const { locale, slug } = params;
  if (!isLocale(locale)) notFound();
  const dict = await getDictionary(locale as Locale);
  const post = getPost(slug, locale as Locale);
  if (!post) notFound();

  const isAr = locale === "ar";
  const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://gotripza.com";

  return (
    <>
      <Navbar dict={dict} locale={locale as Locale} />
      <ArticleJsonLd
        title={post.title}
        description={post.description}
        datePublished={post.date}
        imageUrl={post.coverImage}
        url={`${BASE}/${locale}/blog/${slug}`}
      />
      <main className="mx-auto max-w-3xl px-6 py-20">
        <a
          href={`/${locale}/blog`}
          className="mb-10 inline-flex items-center gap-1.5 text-sm text-white/40 transition hover:text-white/70"
        >
          {isAr ? (
            <>
              <ArrowRight className="h-3.5 w-3.5" />
              دليل السفر
            </>
          ) : (
            <>
              <ArrowLeft className="h-3.5 w-3.5" />
              Travel Guide
            </>
          )}
        </a>

        {post.coverImage && (
          <div className="relative mb-10 aspect-[16/9] w-full overflow-hidden rounded-3xl">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              priority
              sizes="(min-width: 768px) 80vw, 100vw"
              className="object-cover"
            />
          </div>
        )}

        <div className="flex items-center gap-1.5 text-xs text-white/40">
          <Calendar className="h-3.5 w-3.5" />
          {post.date}
        </div>

        <h1 className="mt-4 font-display text-3xl font-bold leading-snug sm:text-4xl">
          {post.title}
        </h1>
        <p className="mt-3 text-lg text-white/55">{post.description}</p>

        <article className="prose prose-invert prose-lg mt-10 max-w-none text-white/80
          prose-headings:font-display prose-headings:text-white
          prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
          prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
          prose-p:leading-relaxed prose-p:text-white/75
          prose-strong:text-white prose-strong:font-semibold
          prose-a:text-brand-primary prose-a:no-underline hover:prose-a:underline
          prose-table:text-sm prose-th:text-white prose-td:text-white/70
          prose-ul:text-white/75 prose-li:marker:text-brand-primary
          prose-blockquote:border-brand-primary prose-blockquote:text-white/60
          prose-hr:border-white/10">
          <MDXRemote source={post.content} />
        </article>

        <BlogSearchCTA locale={locale as Locale} />
      </main>
      <Footer dict={dict} locale={locale as Locale} />
    </>
  );
}
