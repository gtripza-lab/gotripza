import { redirect } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { notFound } from "next/navigation";

/**
 * /[locale]/guides — no-slug index.
 * Redirects to destinations which hosts all destination travel guides.
 */
export default async function GuidesIndexPage(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;
  if (!isLocale(params.locale)) notFound();
  redirect(`/${params.locale}/destinations`);
}
