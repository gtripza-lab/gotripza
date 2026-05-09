import "server-only";
/**
 * Lightweight error reporter — optional Sentry integration.
 *
 * If `SENTRY_DSN` env var is set, errors are sent to Sentry (when the
 * `@sentry/nextjs` package is installed). Otherwise we fall through to
 * `console.error` so production never crashes from missing infra.
 *
 * To enable: `npm i @sentry/nextjs` and set `SENTRY_DSN` in environment.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SentryModule = any;
let _Sentry: SentryModule | null | undefined;

async function getSentry(): Promise<SentryModule | null> {
  if (_Sentry !== undefined) return _Sentry;
  if (!process.env.SENTRY_DSN) {
    _Sentry = null;
    return null;
  }
  try {
    // Dynamic import — package is OPTIONAL. If absent, fall through to console.
    const mod = await import(/* webpackIgnore: true */ "@sentry/nextjs" as string).catch(() => null);
    _Sentry = mod;
    return mod;
  } catch {
    _Sentry = null;
    return null;
  }
}

export async function captureError(
  err: unknown,
  context?: Record<string, unknown>,
): Promise<void> {
  const message = err instanceof Error ? err.message : String(err);
  console.error("[error]", message, context ?? {});
  const Sentry = await getSentry();
  if (Sentry) {
    Sentry.captureException(err, { extra: context });
  }
}

export function captureMessage(
  message: string,
  context?: Record<string, unknown>,
): void {
  console.log("[trace]", message, context ?? {});
  void getSentry().then((Sentry) => {
    if (Sentry) Sentry.captureMessage(message, { extra: context });
  });
}
