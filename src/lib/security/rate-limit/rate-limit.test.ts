import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("server-only", () => ({}));

function req(path = "/api/plan", ip = "203.0.113.10") {
  return new NextRequest(`https://gotripza.com${path}`, {
    headers: {
      "x-forwarded-for": ip,
    },
  });
}

describe("rateLimit", () => {
  beforeEach(() => {
    vi.resetModules();
    process.env.RATE_LIMIT_DISABLE_REMOTE = "1";
    process.env.RATE_LIMIT_DISABLE_MEMORY = "0";
  });

  it("blocks after the configured limit", async () => {
    const { rateLimit } = await import("./index");
    const first = await rateLimit(req(), "test-blocked", {
      limit: 2,
      windowSec: 60,
      burstLimit: 10,
      failOpen: false,
    });
    const second = await rateLimit(req(), "test-blocked", {
      limit: 2,
      windowSec: 60,
      burstLimit: 10,
      failOpen: false,
    });
    const third = await rateLimit(req(), "test-blocked", {
      limit: 2,
      windowSec: 60,
      burstLimit: 10,
      failOpen: false,
    });

    expect(first.allowed).toBe(true);
    expect(second.allowed).toBe(true);
    expect(third.allowed).toBe(false);
    expect(third.blockedReason).toBe("rate_limit");
  });

  it("enforces burst protection", async () => {
    const { rateLimit } = await import("./index");
    const a = await rateLimit(req(), "test-burst", {
      limit: 100,
      windowSec: 60,
      burstLimit: 1,
      burstWindowSec: 10,
      failOpen: false,
    });
    const b = await rateLimit(req(), "test-burst", {
      limit: 100,
      windowSec: 60,
      burstLimit: 1,
      burstWindowSec: 10,
      failOpen: false,
    });

    expect(a.allowed).toBe(true);
    expect(b.allowed).toBe(false);
    expect(b.blockedReason).toBe("burst_limit");
  });

  it("fails closed when no limiter storage is available", async () => {
    process.env.RATE_LIMIT_DISABLE_MEMORY = "1";
    const { rateLimit } = await import("./index");
    const result = await rateLimit(req(), "test-fail-closed", {
      limit: 10,
      windowSec: 60,
      failOpen: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.state).toBe("storage_error");
    expect(result.blockedReason).toBe("limiter_unavailable");
  });

  it("allows lightweight routes to fail open when configured", async () => {
    process.env.RATE_LIMIT_DISABLE_MEMORY = "1";
    const { rateLimit } = await import("./index");
    const result = await rateLimit(req("/api/log-event"), "test-fail-open", {
      limit: 10,
      windowSec: 60,
      failOpen: true,
    });

    expect(result.allowed).toBe(true);
    expect(result.state).toBe("storage_error");
  });

  it("handles concurrent requests deterministically", async () => {
    const { rateLimit } = await import("./index");
    const results = await Promise.all(
      Array.from({ length: 12 }, () =>
        rateLimit(req(), "test-concurrency", {
          limit: 5,
          windowSec: 60,
          burstLimit: 20,
          failOpen: false,
        }),
      ),
    );

    expect(results.filter((r) => r.allowed)).toHaveLength(5);
    expect(results.filter((r) => !r.allowed)).toHaveLength(7);
  });
});
