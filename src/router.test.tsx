import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider, createMemoryHistory, createRouter } from "@tanstack/react-router";
import { render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";

import { routeTree } from "./routeTree.gen";

function renderRoute(path: string) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const router = createRouter({
    routeTree,
    context: { queryClient },
    history: createMemoryHistory({ initialEntries: [path] }),
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

function stubApi() {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL) => {
      const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
      if (url.includes("/api/health")) {
        return Response.json({ status: "ok", database: true, db_latency_ms: 2 });
      }
      if (url.includes("/api/auth/me")) {
        return new Response(null, { status: 401 });
      }
      return new Response(null, { status: 404 });
    }),
  );
}

describe("routes", () => {
  it("renders the landing page with both services operational", async () => {
    stubApi();

    const { getByText, getAllByText } = renderRoute("/");

    await waitFor(() => expect(getByText("Asas moden untuk produk SaaS anda.")).toBeTruthy());
    await waitFor(() => expect(getAllByText("Operasi")).toHaveLength(2));
    expect(getByText("Mula secara percuma")).toBeTruthy();
  });

  it("renders the not-found page for unknown paths", async () => {
    const { getByText } = renderRoute("/tiada");

    await waitFor(() => expect(getByText("404")).toBeTruthy());
    expect(getByText("Halaman tidak dijumpai.")).toBeTruthy();
  });
});
