import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Calendar, ArrowUpRight } from "lucide-react";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { getAllPosts } from "@/lib/blog";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export function generateMetadata({ params }: { params: { locale: string } }) {
  const isAr = params.locale === "ar";
  return {
    title: isAr ? "دليل السفر — GoTripza" : "Travel Guide — GoTripza",
    description: isAr
      ? "مقالات ودلائل سفر شاملة لأفضل الوجهات — فنادق، طيران، ونصائح موفّرة."
      : "Comprehensive travel guides for top destinations — hotels, flights, and money-saving tips.",
  };
}

export default async function BlogListPage({
  params,
}: {
  params: { locale: string };
}) {
  const { locale } = params;
  if (!isLocale(locale)) notFound();
  const dict = await getDictionary(locale as Locale);
  const posts = getAllPosts(locale as Locale);
  const isAr = locale === "ar";

  return (
    <>
      <Navbar dict={dict} locale={locale as Locale} />
      <main className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-14">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-brand-primary/70">
            {isAr ? "محتوى سفر" : "Travel Content"}
          </p>
          <h1 className="font-display text-4xl font-bold sm:text-5xl">
            {isAr ? "دليل السفر" : "Travel Guide"}
          </h1>
          <p className="mt-3 text-white/55">
            {isAr
              ? "نصائح وجهات ومقارنات أسعار من فريق GoTripza"
              : "Destination tips, price comparisons, and travel advice from GoTripza"}
          </p>
        </div>

        {posts.length === 0 ? (
          <p className="text-white/40">{isAr ? "لا توجد مقالات بعد." : "No articles yet."}</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/${locale}/blog/${post.slug}`}
                className="group flex flex-col overflow-hidden rounded-3xl border border-white/5 bg-white/[0.02] transition hover:border-white/10 hover:bg-white/[0.04]"
              >
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-white/[0.03]">
                  <Image
                    src={post.coverImage || "/blog/placeholder.jpg"}
                    alt={post.title}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <div className="flex items-center gap-1.5 text-[11px] text-white/40">
                    <Calendar className="h-3 w-3" />
                    {post.date}
                  </div>
                  <h2 className="mt-3 font-display text-lg font-bold leading-snug group-hover:text-brand-primary transition-colors">
                    {post.title}
                  </h2>
                  <p className="mt-2 line-clamp-2 flex-1 text-sm text-white/55">
                    {post.description}
                  </p>
                  <div className="mt-5 flex items-center gap-1 text-xs font-semibold text-brand-primary">
                    {isAr ? "اقرأ المقال" : "Read article"}
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer dict={dict} locale={locale as Locale} />
    </>
  );
}
