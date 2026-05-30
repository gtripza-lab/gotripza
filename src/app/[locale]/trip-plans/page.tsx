import { redirect } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { notFound } from "next/navigation";

/**
 * /[locale]/trip-plans — no-slug index.
 * Redirects to the plan page where users can create and view their saved plans.
 */
export default async function TripPlansIndexPage(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;
  if (!isLocale(params.locale)) notFound();
  redirect(`/${params.locale}/plan`);
}
