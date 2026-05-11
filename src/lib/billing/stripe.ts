import "server-only";
/**
 * Stripe singleton — server-only.
 *
 * The SDK is loaded lazily so the absence of STRIPE_SECRET_KEY (default
 * during launch) does not crash the app at boot.
 */
import Stripe from "stripe";

let _client: Stripe | null = null;

export function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error(
      "[stripe] STRIPE_SECRET_KEY not set — paid plans are not configured yet",
    );
  }
  _client ??= new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2026-04-22.dahlia",
    typescript: true,
  });
  return _client;
}

export const STRIPE_CONFIGURED = !!process.env.STRIPE_SECRET_KEY;

export const RIA_PLUS_PRICES = {
  monthly: process.env.STRIPE_PRICE_RYA_COMPANION_MONTHLY
    ?? process.env.STRIPE_PRICE_RIA_PLUS_MONTHLY
    ?? "",
  yearly: process.env.STRIPE_PRICE_RYA_COMPANION_YEARLY
    ?? process.env.STRIPE_PRICE_RIA_PLUS_YEARLY
    ?? "",
  discountedMonthly: process.env.STRIPE_PRICE_RYA_COMPANION_DISCOUNT_MONTHLY ?? "",
};
