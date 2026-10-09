import { afterEach, describe, expect, it, vi } from "vite-plus/test";

import { fetchHealth, type Health } from "./api";

const health: Health = {
  status: "ok",
  database: true,
  db_latency_ms: 1.25,
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("fetchHealth", () => {
  it("returns the health payload with a measured latency", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => Response.json(health, { status: 200 })),
    );

    const snapshot = await fetchHealth();

    expect(snapshot.health).toEqual(health);
    expect(snapshot.latencyMs).toBeGreaterThanOrEqual(0);
    expect(snapshot.latencyMs).toBeLessThan(1000);
  });

  it("throws on non-ok responses", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => Response.json({}, { status: 500 })),
    );

    await expect(fetchHealth()).rejects.toThrow("500");
  });
});
