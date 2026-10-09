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

describe("routes", () => {
  it("renders the landing page with both services operational", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => Response.json({ status: "ok", database: true, db_latency_ms: 2 })),
    );

    const { getByText, getAllByText } = renderRoute("/");

    await waitFor(() => expect(getByText("Asas moden untuk produk anda.")).toBeTruthy());
    await waitFor(() => expect(getAllByText("Operasi")).toHaveLength(2));
    expect(getByText("Semua sistem normal")).toBeTruthy();
  });

  it("renders the not-found page for unknown paths", async () => {
    const { getByText } = renderRoute("/tiada");

    await waitFor(() => expect(getByText("404")).toBeTruthy());
    expect(getByText("Halaman tidak dijumpai.")).toBeTruthy();
  });
});
